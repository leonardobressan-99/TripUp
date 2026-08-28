import type { ExpenseHistoryItem } from "./mockData";

export type SettlementRecord = {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
};

export type BalanceTxn = {
  fromId: string;
  toId: string;
  amount: number;
};

/**
 * Splits an amount between n people in whole cents, handing the leftover cents
 * to the first few. €35 three ways becomes 1167/1167/1166 rather than three
 * copies of 11.6666…, so the shares add back up to exactly what was spent.
 */
function splitCents(totalCents: number, people: number): number[] {
  const sign = totalCents < 0 ? -1 : 1;
  const magnitude = Math.abs(totalCents);
  const base = Math.floor(magnitude / people);
  const remainder = magnitude % people;
  return Array.from({ length: people }, (_, i) => sign * (base + (i < remainder ? 1 : 0)));
}

/**
 * Raw amount each person owes each other person, in whole cents, from
 * expenses alone — before settlements and before netting each pair down to
 * one direction.
 *
 * Cents throughout on purpose: doing this in euros accumulates floating-point
 * error on shares that don't divide evenly, which can drag a value across a
 * rounding boundary and invent a phantom €0.01 debt that never clears.
 */
function computeRawOwedCents(
  expenseList: ExpenseHistoryItem[],
  memberIds: string[]
): Map<string, Map<string, number>> {
  const owed = new Map<string, Map<string, number>>();
  const add = (debtorId: string, creditorId: string, cents: number) => {
    if (!owed.has(debtorId)) owed.set(debtorId, new Map());
    const m = owed.get(debtorId)!;
    m.set(creditorId, (m.get(creditorId) ?? 0) + cents);
  };

  for (const expense of expenseList) {
    const items =
      expense.items && expense.items.length > 0
        ? expense.items
        : [{ name: expense.name, amount: expense.amount, category: "other" as const, splitIds: memberIds }];

    for (const item of items) {
      const participants = item.splitIds.filter((id) => memberIds.includes(id));
      if (participants.length === 0) continue;
      const shares = splitCents(Math.round(item.amount * 100), participants.length);
      participants.forEach((participant, i) => {
        if (participant === expense.paidById) return;
        add(participant, expense.paidById, shares[i]);
      });
    }
  }

  return owed;
}

/**
 * Nets every pair of members independently (not routed through a shared
 * third party), so e.g. Ari can owe Jo for one expense while separately being
 * owed by Mia for another — both stay visible as their own relationship,
 * matching how split-expense apps show balances by default. Only debts
 * between the exact same pair are netted against each other.
 */
export function computePairwiseBalances(expenseList: ExpenseHistoryItem[], memberIds: string[]): BalanceTxn[] {
  const owed = computeRawOwedCents(expenseList, memberIds);
  const txns: BalanceTxn[] = [];

  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const a = memberIds[i];
      const b = memberIds[j];
      const aOwesB = owed.get(a)?.get(b) ?? 0;
      const bOwesA = owed.get(b)?.get(a) ?? 0;
      const net = aOwesB - bOwesA;
      if (net > 0) txns.push({ fromId: a, toId: b, amount: net / 100 });
      else if (net < 0) txns.push({ fromId: b, toId: a, amount: -net / 100 });
    }
  }

  return txns;
}

/**
 * Applies recorded settlements to reduce (or reverse) the matching pairwise
 * balance, in whole cents so a run of settlements can't leave a phantom cent
 * behind the way float euros could.
 */
export function applySettlements(txns: BalanceTxn[], settlements: SettlementRecord[]): BalanceTxn[] {
  const pairKey = (a: string, b: string) => [a, b].sort().join("|");
  const net = new Map<string, number>(); // key: sorted pair, value: signed cents (first owes second)
  const members = new Map<string, [string, string]>();

  for (const t of txns) {
    const key = pairKey(t.fromId, t.toId);
    const [first] = key.split("|");
    const sign = first === t.fromId ? 1 : -1;
    net.set(key, (net.get(key) ?? 0) + sign * Math.round(t.amount * 100));
    members.set(key, key.split("|") as [string, string]);
  }

  for (const s of settlements) {
    const key = pairKey(s.fromId, s.toId);
    const [first] = key.split("|");
    const sign = first === s.fromId ? 1 : -1;
    net.set(key, (net.get(key) ?? 0) - sign * Math.round(s.amount * 100));
    if (!members.has(key)) members.set(key, key.split("|") as [string, string]);
  }

  const result: BalanceTxn[] = [];
  for (const [key, cents] of net) {
    const [first, second] = members.get(key)!;
    if (cents > 0) result.push({ fromId: first, toId: second, amount: cents / 100 });
    else if (cents < 0) result.push({ fromId: second, toId: first, amount: -cents / 100 });
  }
  return result;
}

/**
 * The open per-pair balances still owed on this trip. Recomputed from scratch
 * after every expense edit and every settlement, so it always reflects the
 * current state rather than accumulating stale numbers.
 */
export function computeOpenBalances(
  expenseList: ExpenseHistoryItem[],
  memberIds: string[],
  settlements: SettlementRecord[]
): BalanceTxn[] {
  return applySettlements(computePairwiseBalances(expenseList, memberIds), settlements);
}

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

const EPS = 0.005;

/** Raw amount each person owes each other person, before netting each pair down to one direction. */
function computeRawOwed(
  expenseList: ExpenseHistoryItem[],
  memberIds: string[]
): Map<string, Map<string, number>> {
  const owed = new Map<string, Map<string, number>>();
  const add = (debtorId: string, creditorId: string, amount: number) => {
    if (!owed.has(debtorId)) owed.set(debtorId, new Map());
    const m = owed.get(debtorId)!;
    m.set(creditorId, (m.get(creditorId) ?? 0) + amount);
  };

  for (const expense of expenseList) {
    const items =
      expense.items && expense.items.length > 0
        ? expense.items
        : [{ name: expense.name, amount: expense.amount, category: "other" as const, splitIds: memberIds }];

    for (const item of items) {
      const participants = item.splitIds.filter((id) => memberIds.includes(id));
      if (participants.length === 0) continue;
      const share = item.amount / participants.length;
      for (const p of participants) {
        if (p === expense.paidById) continue;
        add(p, expense.paidById, share);
      }
    }
  }

  return owed;
}

/**
 * Nets every pair of members independently (not routed through a single global
 * creditor), so e.g. Ari can owe Jo for one expense while separately being
 * owed by Mia for another — both are visible at once.
 */
export function computePairwiseBalances(
  expenseList: ExpenseHistoryItem[],
  memberIds: string[]
): BalanceTxn[] {
  const owed = computeRawOwed(expenseList, memberIds);
  const txns: BalanceTxn[] = [];

  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const a = memberIds[i];
      const b = memberIds[j];
      const aOwesB = owed.get(a)?.get(b) ?? 0;
      const bOwesA = owed.get(b)?.get(a) ?? 0;
      const net = aOwesB - bOwesA;
      if (net > EPS) txns.push({ fromId: a, toId: b, amount: net });
      else if (net < -EPS) txns.push({ fromId: b, toId: a, amount: -net });
    }
  }

  return txns;
}

/** Applies recorded settlements to reduce (or reverse) the matching pairwise balance. */
export function applySettlements(txns: BalanceTxn[], settlements: SettlementRecord[]): BalanceTxn[] {
  const pairKey = (a: string, b: string) => [a, b].sort().join("|");
  const net = new Map<string, number>(); // key: sorted pair, value: signed amount (first owes second)
  const members = new Map<string, [string, string]>();

  for (const t of txns) {
    const key = pairKey(t.fromId, t.toId);
    const [first] = key.split("|");
    const sign = first === t.fromId ? 1 : -1;
    net.set(key, (net.get(key) ?? 0) + sign * t.amount);
    members.set(key, key.split("|") as [string, string]);
  }

  for (const s of settlements) {
    const key = pairKey(s.fromId, s.toId);
    const [first] = key.split("|");
    const sign = first === s.fromId ? 1 : -1;
    net.set(key, (net.get(key) ?? 0) - sign * s.amount);
    if (!members.has(key)) members.set(key, key.split("|") as [string, string]);
  }

  const result: BalanceTxn[] = [];
  for (const [key, amount] of net) {
    const [first, second] = members.get(key)!;
    if (amount > EPS) result.push({ fromId: first, toId: second, amount: Math.round(amount * 100) / 100 });
    else if (amount < -EPS) result.push({ fromId: second, toId: first, amount: Math.round(-amount * 100) / 100 });
  }
  return result;
}

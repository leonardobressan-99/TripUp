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
 * Walks every expense and reports each debt it creates, in whole cents.
 *
 * Cents throughout on purpose: doing this in euros accumulates floating-point
 * error on shares that don't divide evenly, which can drag a value across a
 * rounding boundary and invent a phantom €0.01 debt that never clears.
 */
function forEachDebt(
  expenseList: ExpenseHistoryItem[],
  memberIds: string[],
  onDebt: (debtorId: string, creditorId: string, cents: number) => void
) {
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
        onDebt(participant, expense.paidById, shares[i]);
      });
    }
  }
}

/**
 * The raw ledger: every debt between every pair, netted only where the same
 * two people owe each other. This is what the trip looks like before
 * simplification, and it is what the "merged into" indicator counts against.
 */
export function computePairwiseBalances(expenseList: ExpenseHistoryItem[], memberIds: string[]): BalanceTxn[] {
  const owed = new Map<string, Map<string, number>>();
  forEachDebt(expenseList, memberIds, (debtorId, creditorId, cents) => {
    if (!owed.has(debtorId)) owed.set(debtorId, new Map());
    const m = owed.get(debtorId)!;
    m.set(creditorId, (m.get(creditorId) ?? 0) + cents);
  });

  const txns: BalanceTxn[] = [];
  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      const a = memberIds[i];
      const b = memberIds[j];
      const net = (owed.get(a)?.get(b) ?? 0) - (owed.get(b)?.get(a) ?? 0);
      if (net > 0) txns.push({ fromId: a, toId: b, amount: net / 100 });
      else if (net < 0) txns.push({ fromId: b, toId: a, amount: -net / 100 });
    }
  }
  return txns;
}

/** Applies recorded settlements to the matching pairwise balance, in cents. */
export function applySettlements(txns: BalanceTxn[], settlements: SettlementRecord[]): BalanceTxn[] {
  const pairKey = (a: string, b: string) => [a, b].sort().join("|");
  const net = new Map<string, number>();
  const members = new Map<string, [string, string]>();

  const bump = (fromId: string, toId: string, cents: number) => {
    const key = pairKey(fromId, toId);
    const [first] = key.split("|");
    net.set(key, (net.get(key) ?? 0) + (first === fromId ? cents : -cents));
    members.set(key, key.split("|") as [string, string]);
  };

  for (const t of txns) bump(t.fromId, t.toId, Math.round(t.amount * 100));
  for (const s of settlements) bump(s.toId, s.fromId, Math.round(s.amount * 100));

  const result: BalanceTxn[] = [];
  for (const [key, cents] of net) {
    const [first, second] = members.get(key)!;
    if (cents > 0) result.push({ fromId: first, toId: second, amount: cents / 100 });
    else if (cents < 0) result.push({ fromId: second, toId: first, amount: -cents / 100 });
  }
  return result;
}

/**
 * Each member's net position for the whole trip, in whole cents: what they
 * paid out on other people's behalf minus their own share of everything.
 * Positive means the group owes them, negative means they owe the group.
 *
 * Settlements move money between two people, so they shift both net positions
 * rather than cancelling one specific debt — that is what lets the simplifier
 * re-plan the remaining transfers after each payment.
 */
export function computeNetCents(
  expenseList: ExpenseHistoryItem[],
  memberIds: string[],
  settlements: SettlementRecord[]
): Map<string, number> {
  const net = new Map<string, number>(memberIds.map((id) => [id, 0]));

  const transfer = (debtorId: string, creditorId: string, cents: number) => {
    // Skip anyone no longer on the trip: their debts can't be settled here, and
    // crediting only one side would break the sum-to-zero invariant.
    if (!net.has(debtorId) || !net.has(creditorId)) return;
    net.set(debtorId, net.get(debtorId)! - cents);
    net.set(creditorId, net.get(creditorId)! + cents);
  };

  forEachDebt(expenseList, memberIds, transfer);
  // A settlement is the debtor handing over cash, which pays down their side.
  for (const s of settlements) transfer(s.toId, s.fromId, Math.round(s.amount * 100));

  return net;
}

/**
 * Turns net positions into the fewest transfers that clear them, by repeatedly
 * pairing the largest debtor with the largest creditor. Each transfer zeroes
 * out at least one person, so a group of n settles in at most n-1 payments
 * instead of one payment per pair who happened to share an expense.
 *
 * This deliberately re-routes money: if Mia owes Ari and Ari owes Jo, Mia is
 * asked to pay Jo directly and Ari drops out of that chain entirely.
 */
export function simplifyDebts(netCents: Map<string, number>): BalanceTxn[] {
  const debtors: { id: string; cents: number }[] = [];
  const creditors: { id: string; cents: number }[] = [];

  for (const [id, amount] of netCents) {
    if (amount < 0) debtors.push({ id, cents: -amount });
    else if (amount > 0) creditors.push({ id, cents: amount });
  }

  // Largest first so the biggest obligations clear in one hop; the id tie-break
  // keeps the output stable across renders when amounts are equal.
  const bySize = (a: { id: string; cents: number }, b: { id: string; cents: number }) =>
    b.cents - a.cents || a.id.localeCompare(b.id);
  debtors.sort(bySize);
  creditors.sort(bySize);

  const txns: BalanceTxn[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const paid = Math.min(debtors[d].cents, creditors[c].cents);
    if (paid > 0) txns.push({ fromId: debtors[d].id, toId: creditors[c].id, amount: paid / 100 });
    debtors[d].cents -= paid;
    creditors[c].cents -= paid;
    if (debtors[d].cents === 0) d++;
    if (creditors[c].cents === 0) c++;
  }

  return txns;
}

/**
 * The simplified transfers still owed on this trip. Recomputed from scratch on
 * every render, so adding an expense or recording a payment immediately
 * re-plans the remaining transfers rather than appending to a stale list.
 */
export function computeOpenBalances(
  expenseList: ExpenseHistoryItem[],
  memberIds: string[],
  settlements: SettlementRecord[]
): BalanceTxn[] {
  return simplifyDebts(computeNetCents(expenseList, memberIds, settlements));
}

/**
 * The same outstanding debts left un-simplified, so the UI can say how many
 * separate debts got folded into the transfer plan above.
 */
export function computeRawBalances(
  expenseList: ExpenseHistoryItem[],
  memberIds: string[],
  settlements: SettlementRecord[]
): BalanceTxn[] {
  return applySettlements(computePairwiseBalances(expenseList, memberIds), settlements);
}

/**
 * What each member's share of a single expense comes to, in whole cents.
 *
 * Uses the same largest-remainder split as the balances, so the shares shown
 * on a plan add up to exactly what the expense cost — splitting in euros here
 * would drift a cent away from the figure on the receipt.
 */
export function expenseShares(
  expense: ExpenseHistoryItem,
  memberIds: string[]
): Map<string, number> {
  const shares = new Map<string, number>();
  const items =
    expense.items && expense.items.length > 0
      ? expense.items
      : [{ name: expense.name, amount: expense.amount, category: "other" as const, splitIds: memberIds }];

  for (const item of items) {
    const participants = item.splitIds.filter((id) => memberIds.includes(id));
    if (participants.length === 0) continue;
    const cents = splitCents(Math.round(item.amount * 100), participants.length);
    participants.forEach((id, i) => shares.set(id, (shares.get(id) ?? 0) + cents[i]));
  }
  return shares;
}

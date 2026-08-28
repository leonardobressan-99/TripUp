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
 * Net position of every member, in whole cents: positive means the group owes
 * them, negative means they owe the group. Settlements move money between two
 * people, so they shift both net positions rather than cancelling one specific
 * debt — that is what lets the simplifier re-plan the remaining transfers after
 * each payment.
 *
 * Everything is integer cents on purpose. Doing this in euros accumulates
 * floating-point error (−175.385 + 175.38 does not land on −0.005), which drags
 * a value across a rounding boundary and invents a phantom €0.01 debt that
 * "End trip" can never clear.
 */
function computeNetCents(
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
        transfer(participant, expense.paidById, shares[i]);
      });
    }
  }

  // A settlement is the debtor handing over cash, which pays down their side.
  for (const s of settlements) transfer(s.toId, s.fromId, Math.round(s.amount * 100));

  return net;
}

/**
 * Turns net positions (in cents) into the fewest transfers that clear them, by
 * repeatedly pairing the largest debtor with the largest creditor. Each transfer
 * zeroes out at least one person, so a group of n settles in at most n-1
 * payments instead of one payment per pair who happened to share an expense.
 *
 * This deliberately re-routes money: if Mia owes Ari and Ari owes Jo, Mia is
 * asked to pay Jo directly and Ari drops out of the chain entirely.
 */
export function simplifyDebts(netCents: Map<string, number>): BalanceTxn[] {
  const debtors: { id: string; cents: number }[] = [];
  const creditors: { id: string; cents: number }[] = [];

  for (const [id, amount] of netCents) {
    if (amount < 0) debtors.push({ id, cents: -amount });
    else if (amount > 0) creditors.push({ id, cents: amount });
  }

  // Largest first so the biggest obligations get cleared in one hop; the id
  // tie-break keeps the output stable across renders for equal amounts.
  const bySize = (a: { id: string; cents: number }, b: { id: string; cents: number }) =>
    b.cents - a.cents || a.id.localeCompare(b.id);
  debtors.sort(bySize);
  creditors.sort(bySize);

  const txns: BalanceTxn[] = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const paid = Math.min(debtors[d].cents, creditors[c].cents);
    if (paid > 0) {
      txns.push({ fromId: debtors[d].id, toId: creditors[c].id, amount: paid / 100 });
    }
    debtors[d].cents -= paid;
    creditors[c].cents -= paid;
    if (debtors[d].cents === 0) d++;
    if (creditors[c].cents === 0) c++;
  }

  return txns;
}

/**
 * The open transfers still owed on this trip, already simplified. Recomputed
 * from scratch after every expense edit and every settlement, so the plan always
 * reflects the current state rather than accumulating stale pairwise debts.
 */
export function computeOpenBalances(
  expenseList: ExpenseHistoryItem[],
  memberIds: string[],
  settlements: SettlementRecord[]
): BalanceTxn[] {
  return simplifyDebts(computeNetCents(expenseList, memberIds, settlements));
}

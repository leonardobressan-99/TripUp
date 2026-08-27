import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import ScreenHeader from "../components/ScreenHeader";
import ExpenseItemRow from "../components/ExpenseItemRow";
import Avatar from "../components/Avatar";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  formatSingleDate,
  categoryMeta,
  CATEGORY_ORDER,
  activeParticipantIds,
  type ExpenseHistoryItem,
  type ExpenseCategory,
  type WorkingItem,
  type Member,
} from "../store/mockData";

type ExpenseDetailProps = {
  expense: ExpenseHistoryItem;
  onBack: () => void;
  onSaveEdits: (updated: ExpenseHistoryItem) => void;
  participantIds: string[];
  allMembers: Record<string, Member>;
  memberJoinDates: Record<string, string>;
  tripStartDate: string;
};

function TicketDivider() {
  return (
    <div className="relative flex items-center h-4 -mx-5">
      <div className="w-4 h-4 rounded-full bg-cream shrink-0" />
      <div className="flex-1 border-t border-dashed border-grey-ink/35 mx-1" />
      <div className="w-4 h-4 rounded-full bg-cream shrink-0" />
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[20px] p-5 ${className}`} style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}>
      {children}
    </div>
  );
}

let nextId = 5000;

function snapshotOf(items: WorkingItem[]) {
  return JSON.stringify(items.map((i) => ({ name: i.name, amount: i.amount, category: i.category, splitIds: [...i.splitIds].sort() })));
}

export default function ExpenseDetail({
  expense,
  onBack,
  onSaveEdits,
  participantIds,
  allMembers,
  memberJoinDates,
  tripStartDate,
}: ExpenseDetailProps) {
  const paidBy = allMembers[expense.paidById];
  const [items, setItems] = useState<WorkingItem[]>(() =>
    (expense.items ?? []).map((it) => ({
      id: `hist-${nextId++}`,
      name: it.name,
      amount: it.amount,
      category: it.category,
      splitIds: it.splitIds,
      confirmed: true,
    }))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const pendingRemoveItem = items.find((it) => it.id === pendingRemoveId);
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshotOf(items));
  const dirty = snapshotOf(items) !== savedSnapshot;

  const defaultSplitIds = activeParticipantIds(participantIds, memberJoinDates, expense.date, tripStartDate);

  function handleSaveEdits() {
    const amount = items.reduce((s, i) => s + i.amount, 0);
    onSaveEdits({
      ...expense,
      amount,
      items: items.map((i) => ({ name: i.name || "Untitled item", amount: i.amount, category: i.category, splitIds: i.splitIds })),
    });
    setSavedSnapshot(snapshotOf(items));
  }

  function addItem(category: ExpenseCategory = "food") {
    const id = `hist-${nextId++}`;
    const newItem: WorkingItem = { id, name: "", amount: 0, category, splitIds: [...defaultSplitIds] };
    setItems((prev) => [...prev, newItem]);
    setExpandedId(id);
  }

  function updateItem(id: string, patch: Partial<WorkingItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }

  function toggleMember(id: string, memberId: string) {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const included = it.splitIds.includes(memberId);
        return { ...it, splitIds: included ? it.splitIds.filter((m) => m !== memberId) : [...it.splitIds, memberId] };
      })
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setExpandedId(null);
    setPendingRemoveId(null);
  }

  const total = items.reduce((s, i) => s + i.amount, 0);

  const groups: { category: ExpenseCategory; items: WorkingItem[]; total: number }[] = CATEGORY_ORDER.map(
    (category) => {
      const catItems = items.filter((i) => i.category === category);
      return { category, items: catItems, total: catItems.reduce((s, i) => s + i.amount, 0) };
    }
  ).filter((g) => g.items.length > 0);

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "#FAF6EE" }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <StatusBar tone="dark" />

      <div className={`flex-1 overflow-y-auto px-5 pt-[64px] ${dirty ? "pb-[120px]" : "pb-10"}`}>
        <ScreenHeader title="Lisbon trip" onBack={onBack} />
        <h1 className="font-body font-bold text-ink text-[28px] leading-tight mt-1">{expense.name}</h1>

        <div className="flex items-end justify-center gap-2 mt-6 mb-6">
          <p className="font-heading font-normal text-ink text-[56px] leading-none">€{total.toFixed(2)}</p>
        </div>

        <Card className="flex items-center gap-3">
          <Avatar member={paidBy} size={44} />
          <div>
            <p className="font-body font-bold text-ink text-[15px]">
              Paid by {paidBy.name}
              {paidBy.isYou ? " (You)" : ""}
            </p>
            <p className="font-body text-grey-ink text-[13px] mt-0.5">{formatSingleDate(expense.date)}, 2026</p>
          </div>
        </Card>

        {/* line items */}
        <div className="flex items-center justify-between mt-6 mb-2">
          <p className="font-body font-bold text-grey-ink text-[12px] uppercase tracking-wide">Line items</p>
          <button
            onClick={() => addItem()}
            className="flex items-center gap-1 bg-teal/10 rounded-[10px] px-3 py-1.5"
          >
            <span className="text-[13px]">＋</span>
            <span className="font-body font-bold text-teal text-[12px]">Add item</span>
          </button>
        </div>
        <TicketDivider />

        {items.length === 0 ? (
          <p className="font-body text-grey-ink text-[13px] text-center mt-6">No items on this expense yet.</p>
        ) : (
          <div className="flex flex-col gap-4 mt-3">
            <AnimatePresence initial={false}>
              {groups.map((group) => (
                <motion.div
                  key={group.category}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="flex items-center justify-between px-1 mb-2">
                    <p className="font-body font-bold text-ink text-[14px]">
                      {categoryMeta[group.category].icon} {categoryMeta[group.category].label}
                    </p>
                    <p className="font-body font-bold text-ink text-[14px]">€{group.total.toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                      {group.items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, x: -40 }}
                          transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        >
                          <ExpenseItemRow
                            item={item}
                            isOpen={expandedId === item.id}
                            onToggleOpen={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            onUpdateName={(name) => updateItem(item.id, { name })}
                            onUpdateAmount={(value) => {
                              const parsed = parseFloat(value.replace(",", "."));
                              updateItem(item.id, { amount: Number.isNaN(parsed) ? 0 : parsed });
                            }}
                            onUpdateCategory={(category) => updateItem(item.id, { category })}
                            onToggleMember={(memberId) => toggleMember(item.id, memberId)}
                            onRemove={() => setPendingRemoveId(item.id)}
                            removeIconVisibility="onOpen"
                            autoFocusName={item.name === ""}
                            participantIds={participantIds}
                            allMembers={allMembers}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
            style={{ background: "linear-gradient(0deg, #FAF6EE 70%, rgba(250,246,238,0))" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <button
              onClick={handleSaveEdits}
              className="w-full h-[54px] rounded-[10px] bg-teal flex items-center justify-center"
            >
              <span className="font-body font-bold text-white text-[16px]">Save edits</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingRemoveItem}
        title="Delete item?"
        message={`"${pendingRemoveItem?.name || "Untitled item"}" will be removed from this expense.`}
        onConfirm={() => pendingRemoveId && removeItem(pendingRemoveId)}
        onCancel={() => setPendingRemoveId(null)}
      />
    </motion.div>
  );
}

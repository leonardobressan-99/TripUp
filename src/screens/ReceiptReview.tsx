import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import ExpenseItemRow from "../components/ExpenseItemRow";
import ScreenHeader from "../components/ScreenHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import receiptPhoto from "../assets/images/skewed-receipt-card.webp";
import {
  scannedReceiptItems,
  categoryMeta,
  CATEGORY_ORDER,
  type ExpenseCategory,
  type Member,
  type WorkingItem,
} from "../store/mockData";

type ReceiptReviewProps = {
  onBack: () => void;
  onRetake: () => void;
  onDone: (items: WorkingItem[]) => void;
  participantIds: string[];
  defaultSplitIds: string[];
  allMembers: Record<string, Member>;
};

export default function ReceiptReview({
  onBack,
  onRetake,
  onDone,
  participantIds,
  defaultSplitIds,
  allMembers,
}: ReceiptReviewProps) {
  const [items, setItems] = useState<WorkingItem[]>(
    scannedReceiptItems.map((i) => ({ ...i, splitIds: [...defaultSplitIds] }))
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const pendingRemoveItem = items.find((it) => it.id === pendingRemoveId);

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

  const categoryTotals = CATEGORY_ORDER.map((category) => ({
    category,
    total: items.filter((i) => i.category === category).reduce((s, i) => s + i.amount, 0),
  })).filter((c) => c.total > 0);

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

      <div className="flex-1 overflow-y-auto px-5 pt-[64px] pb-[130px]">
        <ScreenHeader title="Lisbon trip" onBack={onBack} />
        <h1 className="font-body font-bold text-ink text-[28px] leading-tight mt-1">Review & split</h1>

        <div className="flex justify-center mt-4">
          <div
            className="relative rounded-[16px] overflow-hidden"
            style={{ width: 260, height: 184, transform: "rotate(-2deg)", boxShadow: "0 16px 32px rgba(28,37,65,0.25)" }}
          >
            <img src={receiptPhoto} alt="Scanned receipt" className="w-full h-full object-cover" />
            <button
              onClick={onRetake}
              aria-label="Retake photo"
              className="absolute bottom-2 right-2 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.92)", boxShadow: "0 4px 10px rgba(28,37,65,0.25)" }}
            >
              <span className="text-[16px] leading-none">📸</span>
            </button>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <div className="bg-teal/10 rounded-full px-5 py-2">
            <span className="font-body font-bold text-teal text-[13px] uppercase tracking-wide">
              AI recognized {items.length} items
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-5">
          <AnimatePresence initial={false}>
            {items.map((item) => (
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
                    updateItem(item.id, { amount: Number.isNaN(parsed) ? 0 : parsed, confirmed: true });
                  }}
                  onUpdateCategory={(category: ExpenseCategory) => updateItem(item.id, { category })}
                  onToggleMember={(memberId) => toggleMember(item.id, memberId)}
                  onRemove={() => setPendingRemoveId(item.id)}
                  participantIds={participantIds}
                  allMembers={allMembers}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* sticky summary + CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{ background: "linear-gradient(0deg, #FAF6EE 85%, rgba(250,246,238,0))" }}
      >
        <div className="flex items-center gap-4 mb-3 px-1 overflow-x-auto">
          {categoryTotals.map(({ category, total }) => (
            <p key={category} className="font-body text-grey-ink text-[14px] whitespace-nowrap shrink-0">
              {categoryMeta[category].icon} {categoryMeta[category].label}{" "}
              <span className="font-bold text-ink">€{total.toFixed(2)}</span>
            </p>
          ))}
        </div>
        <button
          onClick={() => onDone(items)}
          className="w-full h-[54px] rounded-[10px] bg-teal flex items-center justify-center"
        >
          <span className="font-body font-bold text-white text-[16px]">Use this split</span>
        </button>
      </div>

      <ConfirmDialog
        open={!!pendingRemoveItem}
        title="Delete item?"
        message={`"${pendingRemoveItem?.name || "Untitled item"}" will be removed from this receipt.`}
        onConfirm={() => pendingRemoveId && removeItem(pendingRemoveId)}
        onCancel={() => setPendingRemoveId(null)}
      />
    </motion.div>
  );
}

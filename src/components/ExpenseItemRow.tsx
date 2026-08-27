import { motion, AnimatePresence } from "framer-motion";
import Switch from "./Switch";
import Avatar from "./Avatar";
import { categoryMeta, CATEGORY_ORDER, type ExpenseCategory, type Member, type WorkingItem } from "../store/mockData";

type ExpenseItemRowProps = {
  item: WorkingItem;
  isOpen: boolean;
  onToggleOpen: () => void;
  onUpdateName: (name: string) => void;
  onUpdateAmount: (value: string) => void;
  onUpdateCategory: (category: ExpenseCategory) => void;
  onToggleMember: (memberId: string) => void;
  onRemove?: () => void;
  removeIconVisibility?: "always" | "onOpen";
  autoFocusName?: boolean;
  participantIds: string[];
  allMembers: Record<string, Member>;
};

export default function ExpenseItemRow({
  item,
  isOpen,
  onToggleOpen,
  onUpdateName,
  onUpdateAmount,
  onUpdateCategory,
  onToggleMember,
  onRemove,
  removeIconVisibility = "always",
  autoFocusName,
  participantIds,
  allMembers,
}: ExpenseItemRowProps) {
  const excludedCount = participantIds.length - item.splitIds.length;
  const each = item.splitIds.length > 0 ? item.amount / item.splitIds.length : 0;
  const showRemoveIcon =
    !!onRemove && (removeIconVisibility === "always" || (removeIconVisibility === "onOpen" && isOpen));

  return (
    <div className="bg-white rounded-[20px] overflow-hidden" style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}>
      <button onClick={onToggleOpen} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-[16px] shrink-0">
          {categoryMeta[item.category].icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body text-ink text-[14px] truncate">{item.name || "Untitled item"}</p>
          <p className="font-body text-grey-ink text-[11px] mt-0.5">
            {categoryMeta[item.category].label}
            {excludedCount > 0 && (
              <span className="font-bold text-coral"> · {excludedCount} excluded</span>
            )}
          </p>
        </div>
        <p className="font-body font-bold text-ink text-[15px] shrink-0">€{item.amount.toFixed(2)}</p>
        {item.confirmed === false && (
          <div className="flex items-center gap-1 bg-[#F2A93B]/15 rounded-full px-2 py-1 shrink-0">
            <span className="text-[10px]">⚠️</span>
          </div>
        )}
        {showRemoveIcon && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            className="w-7 h-7 rounded-full bg-coral/10 flex items-center justify-center shrink-0"
            aria-label="Remove item"
          >
            <span className="text-[13px]">🗑️</span>
          </button>
        )}
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
        >
          <path d="M3 5.5L7 9.5L11 5.5" stroke="#777C8D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-[#EDE7DA]">
              {/* name */}
              <div className="mt-3">
                <p className="font-body font-bold text-ink text-[13px] mb-1.5">Name</p>
                <input
                  autoFocus={autoFocusName}
                  type="text"
                  value={item.name}
                  onChange={(e) => onUpdateName(e.target.value)}
                  placeholder="e.g. Bacalhau à Brás"
                  className="font-body text-ink text-[14px] bg-[#FAF6EE] rounded-lg px-3 py-2 w-full outline-none"
                />
              </div>

              {/* amount */}
              <div className="flex items-center justify-between mt-3">
                <p className="font-body font-bold text-ink text-[13px]">Amount</p>
                <div className="flex items-center gap-1">
                  <span className="font-body font-bold text-ink text-[15px]">€</span>
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => onUpdateAmount(e.target.value)}
                    className="font-body font-bold text-ink text-[15px] bg-[#FAF6EE] rounded-lg px-2 py-1 w-[80px] text-right outline-none"
                  />
                </div>
              </div>

              {/* category */}
              <div className="mt-3">
                <p className="font-body font-bold text-ink text-[13px] mb-2">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_ORDER.map((cat) => {
                    const selected = item.category === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => onUpdateCategory(cat)}
                        className={`flex items-center gap-1 rounded-[10px] px-3 py-1.5 font-body font-bold text-[12px] transition-colors ${
                          selected ? "bg-teal text-white" : "bg-[#F0EBDD] text-ink"
                        }`}
                        style={
                          selected
                            ? {
                                boxShadow:
                                  "inset 0 0 0 1.5px rgba(28,37,65,0.3), inset 0 2px 1px rgba(28,37,65,0.25), inset 0 -1px 0px rgba(255,255,255,0.7)",
                              }
                            : undefined
                        }
                      >
                        <span>{categoryMeta[cat].icon}</span>
                        {categoryMeta[cat].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* split */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-body font-bold text-ink text-[13px]">Split</p>
                  <p className="font-body text-grey-ink text-[12px]">
                    {item.splitIds.length > 0 ? `€${each.toFixed(2)} each` : "No one included"}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5">
                  {participantIds.map((mid) => {
                    const m = allMembers[mid];
                    if (!m) return null;
                    const included = item.splitIds.includes(mid);
                    return (
                      <div key={mid} className="flex items-center gap-2.5">
                        <div style={{ opacity: included ? 1 : 0.4 }}>
                          <Avatar member={m} size={32} />
                        </div>
                        <p className={`font-body font-bold text-[13px] flex-1 ${included ? "text-ink" : "text-grey-ink"}`}>
                          {m.name}
                          {!included && (
                            <span className="font-body font-bold text-coral text-[10px] uppercase ml-2">Excluded</span>
                          )}
                        </p>
                        <Switch on={included} onToggle={() => onToggleMember(mid)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

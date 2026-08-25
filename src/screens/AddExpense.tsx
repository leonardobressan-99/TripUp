import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import AnimatedAmount from "../components/AnimatedAmount";
import ExpenseItemRow from "../components/ExpenseItemRow";
import ScreenHeader from "../components/ScreenHeader";
import Avatar from "../components/Avatar";
import { categoryMeta, CATEGORY_ORDER, type ExpenseCategory, type Member, type WorkingItem } from "../store/mockData";
import chevronIcon from "../assets/icons/Right_Arrow.svg";

type AddExpenseProps = {
  onBack: () => void;
  onScanReceipt: () => void;
  onSave: () => void;
  items: WorkingItem[];
  setItems: (updater: (prev: WorkingItem[]) => WorkingItem[]) => void;
  paidById: string;
  setPaidById: (id: string) => void;
  participantIds: string[];
  defaultSplitIds: string[];
  allMembers: Record<string, Member>;
  restaurantName: string;
  setRestaurantName: (name: string) => void;
  suggestedRestaurantName?: string;
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
    <div className={`bg-white rounded-[20px] ${className}`} style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}>
      {children}
    </div>
  );
}

let nextId = 1000;

export default function AddExpense({
  onBack,
  onScanReceipt,
  onSave,
  items,
  setItems,
  paidById,
  setPaidById,
  participantIds,
  defaultSplitIds,
  allMembers,
  restaurantName,
  setRestaurantName,
  suggestedRestaurantName,
}: AddExpenseProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pickingPayer, setPickingPayer] = useState(false);

  const amount = items.reduce((sum, i) => sum + i.amount, 0);
  const paidBy = allMembers[paidById];

  useEffect(() => {
    if (!restaurantName && suggestedRestaurantName) {
      setRestaurantName(suggestedRestaurantName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedRestaurantName]);

  function addItem(category: ExpenseCategory = "food") {
    const id = `manual-${nextId++}`;
    const newItem: WorkingItem = {
      id,
      name: "",
      amount: 0,
      category,
      splitIds: [...defaultSplitIds],
    };
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
  }

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <StatusBar tone="dark" />

      <div className="flex-1 overflow-y-auto px-5 pt-[64px] pb-[130px]">
        {/* header */}
        <ScreenHeader title="Lisbon trip" onBack={onBack} />
        <h1 className="font-body font-bold text-ink text-[32px] leading-tight mt-1">Add expense</h1>

        {/* amount */}
        <div className="flex items-end justify-center gap-2 mt-6 mb-6">
          <p className="font-heading font-normal text-ink text-[56px] leading-none">
            <AnimatedAmount value={amount} duration={0.5} />
          </p>
        </div>

        {/* restaurant */}
        <div className="mb-3">
          <p className="font-body font-bold text-grey-ink text-[12px] uppercase tracking-wide mb-2">Restaurant</p>
          <Card className="p-4">
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="e.g. Cafe Sunset"
              className="w-full font-body font-bold text-ink text-[16px] outline-none"
            />
          </Card>
        </div>

        {/* who paid */}
        <Card className="p-4">
          <button onClick={() => setPickingPayer((v) => !v)} className="w-full flex items-center gap-3 text-left">
            <Avatar member={paidBy} size={44} />
            <div className="flex-1">
              <p className="font-body font-bold text-ink text-[15px]">
                Paid by {paidBy.name}
                {paidBy.isYou ? " (You)" : ""}
              </p>
              <p className="font-body text-grey-ink text-[13px] mt-0.5">Tap to change</p>
            </div>
            <motion.svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              animate={{ rotate: pickingPayer ? 180 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <path d="M3 5.5L7 9.5L11 5.5" stroke="#777C8D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          </button>
          <AnimatePresence initial={false}>
            {pickingPayer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex gap-3 pt-4 mt-3 border-t border-[#EDE7DA] flex-wrap">
                  {participantIds.map((mid) => {
                    const m = allMembers[mid];
                    if (!m) return null;
                    const selected = mid === paidById;
                    return (
                      <button
                        key={mid}
                        onClick={() => {
                          setPaidById(mid);
                          setPickingPayer(false);
                        }}
                        className="flex flex-col items-center gap-1"
                      >
                        <Avatar member={m} size={44} ring={selected ? "#0EA5A0" : "transparent"} />
                        <span className="font-body font-bold text-ink text-[11px]">{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* scan receipt */}
        <button onClick={onScanReceipt} className="w-full mt-3 block text-left">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center text-[18px] shrink-0">
              📷
            </div>
            <div className="flex-1">
              <p className="font-body font-bold text-ink text-[15px]">Scan receipt</p>
              <p className="font-body text-grey-ink text-[13px] mt-0.5">Auto-fill amount and line items</p>
            </div>
            <img src={chevronIcon} alt="" className="w-5 h-5 shrink-0" />
          </Card>
        </button>

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
          <p className="font-body text-grey-ink text-[13px] text-center mt-6">
            No items yet — add one manually or scan your receipt.
          </p>
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
                          exit={{ opacity: 0, scale: 0.9 }}
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
                            onRemove={() => removeItem(item.id)}
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

      {/* sticky save button */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{ background: "linear-gradient(0deg, #FAF6EE 85%, rgba(250,246,238,0))" }}
      >
        <button onClick={onSave} className="w-full h-[54px] rounded-[10px] bg-teal flex items-center justify-center">
          <span className="font-body font-bold text-white text-[17px]">Save expense</span>
        </button>
      </div>
    </motion.div>
  );
}

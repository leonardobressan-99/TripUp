import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import ScreenHeader from "../components/ScreenHeader";
import { categoryMeta, CATEGORY_ORDER, type ExpenseCategory } from "../store/mockData";
import deleteBadge from "../assets/icons/Delete-badge.svg";

type CreatePollProps = {
  onBack: () => void;
  onCreate: (question: string, options: string[], category: ExpenseCategory) => void;
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[20px] p-4 ${className}`} style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}>
      {children}
    </div>
  );
}

let optionCounter = 0;

export default function CreatePoll({ onBack, onCreate }: CreatePollProps) {
  const [question, setQuestion] = useState("Where should we have our last dinner?");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [options, setOptions] = useState<{ id: string; value: string }[]>([
    { id: `opt-${optionCounter++}`, value: "Cafe Sunset" },
    { id: `opt-${optionCounter++}`, value: "Taberna da Rua" },
    { id: `opt-${optionCounter++}`, value: "Pastelaria Mimo" },
  ]);

  function updateOption(id: string, value: string) {
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, value } : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, { id: `opt-${optionCounter++}`, value: "" }]);
  }

  function removeOption(id: string) {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  }

  const validOptions = options.map((o) => o.value.trim()).filter(Boolean);
  const canCreate = question.trim().length > 0 && validOptions.length >= 2;

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "#FAF6EE" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <StatusBar tone="dark" />

      <div className="flex-1 overflow-y-auto px-5 pt-[64px] pb-10">
        <ScreenHeader title="Lisbon trip" onBack={onBack} />

        <p className="font-body font-bold text-teal text-[12px] uppercase tracking-wide mt-4">New poll</p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask the group something…"
          rows={2}
          className="w-full font-body font-bold text-ink text-[28px] leading-tight outline-none resize-none bg-transparent mt-2 pb-2 border-b-2 border-dashed border-grey-ink/25 focus:border-teal focus:border-solid transition-colors placeholder:text-grey-ink/50"
        />

        <div className="mt-6">
          <p className="font-body font-bold text-grey-ink text-[12px] uppercase tracking-wide mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_ORDER.map((cat) => {
              const selected = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
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

        <div className="flex items-center justify-between mt-6 mb-2">
          <p className="font-body font-bold text-grey-ink text-[12px] uppercase tracking-wide">Options</p>
          <button
            onClick={addOption}
            className="flex items-center gap-1 bg-teal/10 rounded-[10px] px-3 py-1.5"
          >
            <span className="text-[13px]">＋</span>
            <span className="font-body font-bold text-teal text-[12px]">Add option</span>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {options.map((option, i) => (
              <motion.div
                key={option.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
                <Card className="flex items-center gap-3">
                  <span className="font-body font-bold text-grey-ink text-[13px] w-4 shrink-0">{i + 1}</span>
                  <input
                    type="text"
                    value={option.value}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 font-body text-ink text-[15px] outline-none min-w-0"
                  />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(option.id)} aria-label="Remove option" className="shrink-0">
                      <img src={deleteBadge} alt="" className="w-6 h-6" />
                    </button>
                  )}
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button
          onClick={() => canCreate && onCreate(question.trim(), validOptions, category)}
          disabled={!canCreate}
          className="mt-6 w-full h-[54px] rounded-[10px] flex items-center justify-center"
          style={{ backgroundColor: canCreate ? "#0EA5A0" : "#D9D9D9" }}
        >
          <span className={`font-body font-bold text-[17px] ${canCreate ? "text-white" : "text-grey-ink"}`}>
            Create poll
          </span>
        </button>
      </div>
    </motion.div>
  );
}

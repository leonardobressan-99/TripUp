import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import ScreenHeader from "../components/ScreenHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import deleteBadge from "../assets/icons/Delete-badge.svg";
import { formatDayLabel, type ItineraryItem } from "../store/mockData";

type EditItineraryProps = {
  itinerary: ItineraryItem[];
  dayOptions: string[];
  onBack: () => void;
  onAdd: (item: Omit<ItineraryItem, "id">) => void;
  onUpdate: (id: string, patch: Partial<ItineraryItem>) => void;
  onRemove: (id: string) => void;
};

const ALL_DAY = "Free day";

/** Half-hour slots keep the picker short enough to scan without hunting. */
const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  return `${h}:${i % 2 ? "30" : "00"}`;
});

/** All-day plans sort above timed ones; the rest go by the clock. */
function byTime(a: ItineraryItem, b: ItineraryItem) {
  if (a.time === ALL_DAY && b.time !== ALL_DAY) return -1;
  if (b.time === ALL_DAY && a.time !== ALL_DAY) return 1;
  return a.time.localeCompare(b.time);
}

type Draft = {
  id: string | null;
  day: string;
  time: string;
  title: string;
  subtitle: string;
  allDay: boolean;
};

export default function EditItinerary({
  itinerary,
  dayOptions,
  onBack,
  onAdd,
  onUpdate,
  onRemove,
}: EditItineraryProps) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const pendingRemove = itinerary.find((i) => i.id === pendingRemoveId);

  const dayLabels = dayOptions.map(formatDayLabel);

  function openNew(day: string) {
    setDraft({ id: null, day, time: "09:00", title: "", subtitle: "", allDay: false });
  }

  function openExisting(item: ItineraryItem) {
    setDraft({
      id: item.id,
      day: item.day,
      time: item.time === ALL_DAY ? "09:00" : item.time,
      title: item.title,
      subtitle: item.subtitle ?? "",
      allDay: item.time === ALL_DAY,
    });
  }

  function saveDraft() {
    if (!draft || !draft.title.trim()) return;
    const payload = {
      day: draft.day,
      time: draft.allDay ? ALL_DAY : draft.time,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || undefined,
    };
    if (draft.id) onUpdate(draft.id, payload);
    else onAdd(payload);
    setDraft(null);
  }

  const planCount = itinerary.length;
  const plannedDays = new Set(itinerary.map((i) => i.day)).size;

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

      <div className="flex-1 overflow-y-auto px-5 pt-[64px] pb-10">
        <ScreenHeader title="Lisbon trip" onBack={onBack} />
        <h1 className="font-body font-bold text-ink text-[28px] leading-tight mt-1">Edit itinerary</h1>
        <p className="font-body text-grey-ink text-[13px] mt-1">
          {planCount} {planCount === 1 ? "plan" : "plans"} across {plannedDays} of {dayOptions.length} days
        </p>

        {/* Every day of the trip gets a card, including the empty ones — the
            gaps in a trip are the part worth acting on, and hiding them behind
            a flat list of what already exists buries exactly that. */}
        <div className="flex flex-col gap-3 mt-5">
          {dayLabels.map((label, dayIndex) => {
            const plans = itinerary.filter((i) => i.day === label).sort(byTime);
            return (
              <div
                key={label}
                className="bg-white rounded-[20px] p-4"
                style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-body font-bold text-teal text-[12px] uppercase tracking-wide">{label}</p>
                  <span className="font-body text-grey-ink text-[12px]">
                    {plans.length === 0
                      ? "Day " + (dayIndex + 1)
                      : `${plans.length} ${plans.length === 1 ? "plan" : "plans"}`}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {plans.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -40, scale: 0.94 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      <div className="flex items-center gap-3 py-2.5 border-t border-[#EDE7DA] first:border-t-0">
                        <button
                          onClick={() => openExisting(item)}
                          className="flex items-center gap-3 flex-1 min-w-0 text-left"
                        >
                          <span
                            className={`font-body font-bold text-[12px] rounded-full px-2 py-1 shrink-0 w-[64px] text-center ${
                              item.time === ALL_DAY ? "bg-teal/10 text-teal" : "bg-[#F0EBDD] text-ink"
                            }`}
                          >
                            {item.time === ALL_DAY ? "All day" : item.time}
                          </span>
                          <span className="min-w-0">
                            <span className="font-body font-bold text-ink text-[14px] block truncate">
                              {item.title || "Untitled plan"}
                            </span>
                            {item.subtitle && (
                              <span className="font-body text-grey-ink text-[12px] block truncate">
                                {item.subtitle}
                              </span>
                            )}
                          </span>
                        </button>
                        <button
                          onClick={() => setPendingRemoveId(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="shrink-0"
                        >
                          <img src={deleteBadge} alt="" className="w-6 h-6" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {plans.length === 0 && (
                  <p className="font-body text-grey-ink text-[13px] italic mb-3">Nothing planned yet</p>
                )}

                <button
                  onClick={() => openNew(label)}
                  className={`w-full h-10 rounded-[10px] flex items-center justify-center gap-1.5 ${
                    plans.length > 0 ? "mt-2" : ""
                  }`}
                  style={{ border: "1.5px dashed rgba(14,165,160,0.5)" }}
                >
                  <span className="text-teal text-[15px] leading-none">＋</span>
                  <span className="font-body font-bold text-teal text-[13px]">Add plan</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* editor sheet */}
      <AnimatePresence>
        {draft && (
          <>
            <motion.div
              className="absolute inset-0 z-30"
              style={{ background: "rgba(28,37,65,0.35)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setDraft(null)}
            />
            <motion.div
              className="absolute left-0 right-0 bottom-0 z-40 px-5 pt-6 pb-8 overflow-y-auto"
              style={{ backgroundColor: "#FAF6EE", borderRadius: "28px 28px 0 0", maxHeight: "88%" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="w-10 h-1.5 rounded-full bg-grey-ink/25 mx-auto mb-5" />
              <h2 className="font-body font-bold text-ink text-[20px] mb-4">
                {draft.id ? "Edit plan" : "New plan"}
              </h2>

              <p className="font-body font-bold text-grey-ink text-[11px] uppercase tracking-wide mb-1.5">
                What's the plan
              </p>
              <input
                autoFocus
                type="text"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. Tram 28 ride"
                className="w-full bg-white rounded-xl px-3 py-2.5 font-body text-ink text-[15px] outline-none"
                style={{ boxShadow: "0 4px 10px rgba(28,37,65,0.06)" }}
              />

              <p className="font-body font-bold text-grey-ink text-[11px] uppercase tracking-wide mt-4 mb-1.5">
                Where <span className="normal-case tracking-normal font-normal">(optional)</span>
              </p>
              <input
                type="text"
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                placeholder="e.g. Alfama"
                className="w-full bg-white rounded-xl px-3 py-2.5 font-body text-ink text-[15px] outline-none"
                style={{ boxShadow: "0 4px 10px rgba(28,37,65,0.06)" }}
              />

              <p className="font-body font-bold text-grey-ink text-[11px] uppercase tracking-wide mt-4 mb-2">
                Day
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {dayLabels.map((label) => {
                  const selected = draft.day === label;
                  return (
                    <button
                      key={label}
                      onClick={() => setDraft({ ...draft, day: label })}
                      className={`shrink-0 rounded-[10px] px-3 py-2 font-body font-bold text-[12px] transition-colors ${
                        selected ? "bg-teal text-white" : "bg-white text-ink"
                      }`}
                      style={selected ? undefined : { boxShadow: "0 4px 10px rgba(28,37,65,0.06)" }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <p className="font-body font-bold text-grey-ink text-[11px] uppercase tracking-wide mt-4 mb-2">
                When
              </p>
              <div className="flex items-center gap-2.5">
                {/* Two states rather than a "no time" entry buried in the list:
                    an all-day plan is a different kind of thing, not a time. */}
                <div className="flex rounded-[10px] bg-[#F0EBDD] p-1">
                  {[
                    { key: false, label: "At a time" },
                    { key: true, label: "All day" },
                  ].map((opt) => (
                    <button
                      key={String(opt.key)}
                      onClick={() => setDraft({ ...draft, allDay: opt.key })}
                      className={`rounded-[7px] px-3 py-1.5 font-body font-bold text-[12px] transition-colors ${
                        draft.allDay === opt.key ? "bg-white text-ink" : "text-grey-ink"
                      }`}
                      style={draft.allDay === opt.key ? { boxShadow: "0 2px 6px rgba(28,37,65,0.12)" } : undefined}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {!draft.allDay && (
                  <select
                    value={draft.time}
                    onChange={(e) => setDraft({ ...draft, time: e.target.value })}
                    className="font-body font-bold text-ink text-[15px] bg-white rounded-[10px] px-3 py-2 outline-none"
                    style={{ boxShadow: "0 4px 10px rgba(28,37,65,0.06)" }}
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <p className="font-body text-grey-ink text-[12px] mt-3">
                Plans sort themselves by time, so there's nothing to drag.
              </p>

              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={() => setDraft(null)}
                  className="flex-1 h-[52px] rounded-[10px] bg-[#F0EBDD] flex items-center justify-center"
                >
                  <span className="font-body font-bold text-ink text-[15px]">Cancel</span>
                </button>
                <button
                  onClick={saveDraft}
                  disabled={!draft.title.trim()}
                  className="flex-1 h-[52px] rounded-[10px] bg-teal flex items-center justify-center"
                  style={{ opacity: draft.title.trim() ? 1 : 0.45 }}
                >
                  <span className="font-body font-bold text-white text-[15px]">
                    {draft.id ? "Save plan" : "Add plan"}
                  </span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingRemove}
        title="Delete plan?"
        message={`"${pendingRemove?.title || "This plan"}" will be removed from the itinerary.`}
        onConfirm={() => {
          if (pendingRemoveId) onRemove(pendingRemoveId);
          setPendingRemoveId(null);
        }}
        onCancel={() => setPendingRemoveId(null)}
      />
    </motion.div>
  );
}

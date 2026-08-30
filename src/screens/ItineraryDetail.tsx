import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import Avatar from "../components/Avatar";
import backArrowIcon from "../assets/icons/Back_Arrow.svg";
import lisbonCover from "../assets/images/Lisbon.jpg";
import type { ItineraryItem, Member } from "../store/mockData";

type Tab = "details" | "group";

type ItineraryDetailProps = {
  item: ItineraryItem;
  /** Overrides the title once the poll has picked tonight's restaurant. */
  resolvedTitle?: string;
  memberIds: string[];
  allMembers: Record<string, Member>;
  visited: boolean;
  /** Hidden once the dinner is logged — there is nothing left to spend on. */
  showAddExpense: boolean;
  onBack: () => void;
  onAddExpense: () => void;
};

const TABS: { key: Tab; label: string }[] = [
  { key: "details", label: "Details" },
  { key: "group", label: "Group" },
];

/**
 * Every plan shares the trip's cover photo, so each one gets its own colour
 * wash over the top. Picked from the id rather than stored on the item, which
 * means a plan added in the editor is tinted too instead of falling back to a
 * flat grey card.
 */
const TINTS = [
  "20,80,120",
  "120,40,90",
  "18,110,100",
  "140,70,30",
  "60,50,130",
  "150,45,60",
];

function tintFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
      <span className="text-[18px] leading-none">{icon}</span>
      <span className="font-body font-bold text-ink text-[14px] text-center truncate w-full">{value}</span>
      <span className="font-body text-grey-ink text-[11px] uppercase tracking-wide">{label}</span>
    </div>
  );
}

export default function ItineraryDetail({
  item,
  resolvedTitle,
  memberIds,
  allMembers,
  visited,
  showAddExpense,
  onBack,
  onAddExpense,
}: ItineraryDetailProps) {
  const [tab, setTab] = useState<Tab>("details");
  const tabIndex = TABS.findIndex((t) => t.key === tab);

  const title = resolvedTitle ?? item.title;
  const members = memberIds.map((id) => allMembers[id]).filter(Boolean);
  const tint = tintFor(item.id);
  const allDay = item.time === "Free day";

  // Search the place rather than the plan's name: "Fado night" finds nothing
  // useful on a map, "Alfama Lisbon Portugal" lands where the group is going.
  const mapQuery = `${item.subtitle ?? title} Lisbon Portugal`;

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "#FAF6EE" }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <StatusBar tone="light" />

      <div className="flex-1 overflow-y-auto pb-[110px]">
        {/* hero */}
        <div className="relative w-full shrink-0" style={{ height: 290 }}>
          <img src={lisbonCover} alt="" className="absolute inset-0 w-full h-full object-cover" />
          {/* Two layers rather than one: a dark scrim gives the photo depth and
              keeps the white controls readable, then the tint colours it. A
              single coloured gradient just washes the image out pale. */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(18,13,10,0.55) 0%, rgba(18,13,10,0.3) 55%, rgba(18,13,10,0.5) 100%)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, rgba(${tint},0.62) 0%, rgba(${tint},0.42) 40%, rgba(26,19,14,0.5) 72%, #FAF6EE 100%)`,
            }}
          />

          <button
            onClick={onBack}
            aria-label="Back"
            className="absolute top-[64px] left-5 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.9)" }}
          >
            <img src={backArrowIcon} alt="" className="w-6 h-6" />
          </button>

          <span
            className="absolute top-[64px] right-5 h-9 px-3.5 rounded-full flex items-center font-body font-bold text-[12px]"
            style={{
              background: "rgba(255,255,255,0.9)",
              color: visited ? "#0EA5A0" : "#FF5C72",
            }}
          >
            {visited ? "Visited" : "Upcoming"}
          </span>

          <motion.div
            className="absolute inset-x-0 flex justify-center"
            style={{ bottom: 54 }}
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.12 }}
          >
            <div
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-[32px]"
              style={{ background: "#FFFFFF", boxShadow: "0 12px 24px rgba(0,0,0,0.25)" }}
            >
              {item.emoji ?? "📍"}
            </div>
          </motion.div>
        </div>

        {/* title card, lifted over the hero so the two read as one unit */}
        <div className="px-5 -mt-6">
          <div
            className="bg-white rounded-[20px] px-5 pt-5 pb-4"
            style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}
          >
            <h1 className="font-heading font-normal text-ink text-[26px] leading-tight text-center">{title}</h1>
            {item.subtitle && (
              <p className="font-body text-grey-ink text-[14px] mt-1 text-center">📍 {item.subtitle}</p>
            )}

            <div className="flex items-start gap-2 mt-5 pt-4 border-t border-[#EDE7DA]">
              <Stat icon="🕒" value={allDay ? "All day" : item.time} label="Time" />
              <div className="w-px self-stretch bg-[#EDE7DA]" />
              <Stat icon="📅" value={item.day.replace(", ", " ")} label="Day" />
              <div className="w-px self-stretch bg-[#EDE7DA]" />
              <Stat icon="⏱️" value={item.duration ?? "Flexible"} label="Length" />
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="px-5 pt-5">
          <div className="relative w-full flex bg-[#D9D9D9] rounded-full p-1" style={{ height: 44 }}>
            <motion.div
              className="absolute top-1 bottom-1 rounded-full bg-teal"
              initial={false}
              animate={{ left: `calc(${(tabIndex / TABS.length) * 100}% + 4px)` }}
              style={{
                width: `calc(${100 / TABS.length}% - 8px)`,
                boxShadow:
                  "inset 0 0 0 1.5px rgba(28,37,65,0.3), inset 0 2px 1px rgba(28,37,65,0.25), inset 0 -1px 0px rgba(255,255,255,0.7)",
              }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative z-10 flex-1 flex items-center justify-center font-body font-bold text-[14px] transition-colors ${
                  tab === t.key ? "text-white" : "text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* tab content */}
        <div className="px-5 pt-5">
          <AnimatePresence mode="wait">
            {tab === "details" ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                <h2 className="font-body font-bold text-ink text-[18px]">About this plan</h2>
                <p className="font-body text-grey-ink text-[13px] mt-0.5">
                  {item.day} · {allDay ? "no set time" : item.time}
                </p>

                {item.description ? (
                  <p className="font-body text-ink text-[14px] leading-relaxed mt-3">{item.description}</p>
                ) : (
                  <p className="font-body text-grey-ink text-[14px] leading-relaxed mt-3 italic">
                    No notes on this one yet — add some from Edit itinerary.
                  </p>
                )}

                {item.pending && resolvedTitle && (
                  <div
                    className="mt-4 rounded-[14px] px-4 py-3 flex items-center gap-2.5"
                    style={{ backgroundColor: "rgba(14,165,160,0.08)", border: "1.5px solid rgba(14,165,160,0.3)" }}
                  >
                    <span className="text-[16px]">🎉</span>
                    <span className="font-body font-bold text-teal text-[13px]">Decided by poll</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="group"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                <h2 className="font-body font-bold text-ink text-[18px]">Who's coming</h2>
                <p className="font-body text-grey-ink text-[13px] mt-0.5">
                  {members.length} {members.length === 1 ? "person" : "people"} on this trip
                </p>

                <div
                  className="bg-white rounded-[20px] p-4 mt-3 flex flex-col"
                  style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}
                >
                  {members.map((m, i) => (
                    <div
                      key={m.id}
                      className={`flex items-center gap-3 py-2.5 ${
                        i > 0 ? "border-t border-[#EDE7DA]" : ""
                      }`}
                    >
                      <Avatar member={m} size={38} />
                      <p className="font-body font-bold text-ink text-[15px] flex-1">
                        {m.name}
                        {m.isYou && <span style={{ opacity: 0.5 }}> (You)</span>}
                      </p>
                      {m.isOrganizer && (
                        <span className="font-body font-bold text-[11px] text-teal uppercase tracking-wide bg-teal/10 px-2 py-0.5 rounded-full">
                          Organizer
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* sticky actions */}
      <div
        className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 flex items-center gap-2.5"
        style={{ background: "linear-gradient(0deg, #FAF6EE 78%, rgba(250,246,238,0))" }}
      >
        <button
          onClick={() =>
            window.open(
              `https://www.google.com/maps/search/${encodeURIComponent(mapQuery)}`,
              "_blank",
              "noopener,noreferrer"
            )
          }
          className={`h-[52px] rounded-[10px] bg-teal flex items-center justify-center gap-2 ${
            showAddExpense ? "flex-1" : "w-full"
          }`}
        >
          <span className="font-body font-bold text-white text-[16px]">Get directions</span>
          <span className="text-white text-[16px] leading-none">→</span>
        </button>
        {showAddExpense && (
          <button
            onClick={onAddExpense}
            className="flex-1 h-[52px] rounded-[10px] bg-white flex items-center justify-center"
            style={{ border: "1.5px solid #0EA5A0" }}
          >
            <span className="font-body font-bold text-teal text-[16px]">Add expense</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

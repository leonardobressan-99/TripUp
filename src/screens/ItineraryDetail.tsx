import { motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import StatusBar from "../components/StatusBar";
import Avatar from "../components/Avatar";
import backArrowIcon from "../assets/icons/Back_Arrow.svg";
import chevronIcon from "../assets/icons/Right_Arrow.svg";
import lisbonCover from "../assets/images/Lisbon.webp";
import { expenseShares } from "../store/balances";
import type { ExpenseHistoryItem, ItineraryItem, Member } from "../store/mockData";

type ItineraryDetailProps = {
  item: ItineraryItem;
  /** Overrides the title once the poll has picked tonight's restaurant. */
  resolvedTitle?: string;
  memberIds: string[];
  allMembers: Record<string, Member>;
  visited: boolean;
  /** Hidden once the dinner is logged — there is nothing left to spend on. */
  showAddExpense: boolean;
  /** The expense logged against this plan, when there is one. */
  expense?: ExpenseHistoryItem | null;
  onBack: () => void;
  onAddExpense: () => void;
  /** Opens the logged expense so the split can be corrected from here. */
  onOpenExpense: (id: string) => void;
};

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
  expense,
  onBack,
  onAddExpense,
  onOpenExpense,
}: ItineraryDetailProps) {
  // The photo owns the top of the screen, and washing cream over it would only
  // spoil it — so the band has no height at all until the hero has scrolled
  // away, then grows in step with what is being cut off above.
  const fadeHeight = useMotionValue(0);
  const fadeSolid = useTransform(fadeHeight, (h) => h * 0.55);
  const fadeMid = useTransform(fadeHeight, (h) => h * 0.8);
  const fadeMask = useMotionTemplate`linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) ${fadeSolid}px, rgba(0,0,0,0.5) ${fadeMid}px, rgba(0,0,0,1) ${fadeHeight}px)`;

  const shares = expense ? expenseShares(expense, memberIds) : null;
  const payer = expense ? allMembers[expense.paidById] : null;

  const title = resolvedTitle ?? item.title;
  const members = memberIds.map((id) => allMembers[id]).filter(Boolean);
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

      <motion.div
        className={`flex-1 overflow-y-auto ${showAddExpense ? "pb-[110px]" : "pb-10"}`}
        style={{ WebkitMaskImage: fadeMask, maskImage: fadeMask }}
        onScroll={(e) => fadeHeight.set(Math.min(64, Math.max(0, e.currentTarget.scrollTop - 200)))}
      >
        {/* hero */}
        <div className="relative w-full shrink-0" style={{ height: 290 }}>
          <img
            src={item.image ?? lisbonCover}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Fades to the page background rather than a colour wash — the photo
              stays true, it just blends into the card sitting on top of it
              instead of ending in a hard edge. */}
          <div
            className="absolute inset-x-0 bottom-0"
            style={{ height: 96, background: "linear-gradient(180deg, rgba(250,246,238,0) 0%, #FAF6EE 100%)" }}
          />

          <button
            onClick={onBack}
            aria-label="Back"
            className="absolute top-[64px] left-5"
          >
            {/* Bare icon, no wrapping circle — matches ScreenHeader's back
                button exactly. The SVG already bakes in its own grey disc, so a
                second circle behind it (as this used to have) doubled up into a
                visible ring wherever it sat over a busy photo. */}
            <img src={backArrowIcon} alt="" className="w-7 h-7" />
          </button>

          <span
            className="absolute top-[64px] right-5 h-9 px-4 rounded-full flex items-center font-body font-bold text-[12px] uppercase tracking-wide"
            style={{
              // Outlined pill: a ring in the state colour over a pale fill of
              // the same hue, rather than a plain white chip.
              border: `1.5px solid ${visited ? "#0EA5A0" : "#FF5C72"}`,
              background: visited ? "rgba(240,251,250,0.94)" : "rgba(255,240,242,0.94)",
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

        {/* Title card, lifted over the hero so the two read as one unit.
            Needs its own stacking context: the hero's image is absolutely
            positioned, and a positioned element paints over a static sibling
            whatever the DOM order, so without this the photo covers the top of
            the card and slices the title in half. */}
        <div className="px-5 -mt-8 relative z-10">
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

        <div className="px-5 pt-5">
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

          {/* Directions belong with the description rather than pinned to
              the bottom of the screen: it reads as part of "where this
              is", and a sticky bar would sit over the cost card below. */}
          <button
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/${encodeURIComponent(mapQuery)}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="w-full h-[52px] rounded-[10px] bg-teal flex items-center justify-center gap-2 mt-4"
          >
            <span className="font-body font-bold text-white text-[16px]">Get directions</span>
            <span className="text-white text-[16px] leading-none">→</span>
          </button>

          {item.pending && resolvedTitle && (
            <div
              className="mt-4 rounded-[14px] px-4 py-3 flex items-center gap-2.5"
              style={{ backgroundColor: "rgba(14,165,160,0.08)", border: "1.5px solid rgba(14,165,160,0.3)" }}
            >
              <span className="text-[16px]">🎉</span>
              <span className="font-body font-bold text-teal text-[13px]">Decided by poll</span>
            </div>
          )}

          {expense && shares && payer && (
            <>
              <h2 className="font-body font-bold text-ink text-[18px] mt-7">What it cost</h2>
              <p className="font-body text-grey-ink text-[13px] mt-0.5">{expense.name}</p>

              {/* The whole card opens the expense for editing. The split
                  shown here is exactly what people want to change when
                  they spot something wrong, and making them go find the
                  same expense again under Budget is the long way round. */}
              <button
                type="button"
                onClick={() => onOpenExpense(expense.id)}
                className="w-full block text-left bg-white rounded-[20px] p-5 mt-3"
                style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-teal text-[32px] leading-tight">
                      €{expense.amount.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar member={payer} size={24} />
                      <p className="font-body text-grey-ink text-[13px]">
                        Paid by <span className="font-bold text-ink">{payer.name}</span>
                        {payer.isYou ? " (You)" : ""}
                      </p>
                    </div>
                  </div>
                  {/* Sits on the amount's own line rather than floating
                      against the middle of the block. */}
                  <img src={chevronIcon} alt="" className="w-5 h-5 shrink-0 mt-[9px]" />
                </div>

                <p className="font-body font-bold text-grey-ink text-[11px] uppercase tracking-wide mt-5 mb-2.5">
                  Split {shares.size} ways
                </p>
                <div className="flex flex-col">
                  {members.map((m, i) => {
                    const cents = shares.get(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-[#EDE7DA]" : ""}`}
                        style={{ opacity: cents ? 1 : 0.45 }}
                      >
                        <Avatar member={m} size={32} />
                        <p className="font-body font-bold text-ink text-[14px] flex-1">
                          {m.name}
                          {m.isYou && <span style={{ opacity: 0.5 }}> (You)</span>}
                        </p>
                        {cents ? (
                          <p className="font-body font-bold text-ink text-[14px]">€{(cents / 100).toFixed(2)}</p>
                        ) : (
                          /* Someone can sit out a single line on the receipt — the
                             wine everyone else shared — so say so rather than
                             showing them a misleading €0.00. */
                          <span className="font-body font-bold text-coral text-[11px] uppercase tracking-wide">
                            Not included
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Logging the spend is the one thing left to do on a plan that has no
          expense yet, so it stays pinned; everything else now sits in the flow. */}
      {showAddExpense && (
        <div
          className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
          style={{ background: "linear-gradient(0deg, #FAF6EE 78%, rgba(250,246,238,0))" }}
        >
          <button
            onClick={onAddExpense}
            className="w-full h-[52px] rounded-[10px] bg-white flex items-center justify-center"
            style={{ border: "1.5px solid #0EA5A0" }}
          >
            <span className="font-body font-bold text-teal text-[16px]">Add expense</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}

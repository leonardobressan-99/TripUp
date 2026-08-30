import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import AnimatedAmount from "../components/AnimatedAmount";
import MagicAddButton from "../components/MagicAddButton";
import ScreenHeader from "../components/ScreenHeader";
import { topFadeMask } from "../components/topFade";
import TripMap from "../components/TripMap";
import ActionSheet from "../components/ActionSheet";
import Avatar from "../components/Avatar";
import AvatarStack from "../components/AvatarStack";
import ConfirmDialog from "../components/ConfirmDialog";
import InfoDialog from "../components/InfoDialog";
import { PollIcon, ExpenseIcon, MemberIcon } from "../components/ActionIcons";
import checkBadge from "../assets/icons/check-badge.svg";
import creditCardIcon from "../assets/images/CreditCard.webp";
import applePayIcon from "../assets/images/ApplePay.webp";
import cashIcon from "../assets/images/Cash.webp";
import {
  trips,
  formatDateRange,
  formatSingleDate,
  tripSummaryText,
  formatDayLabel,
  type ExpenseHistoryItem,
  type ItineraryItem,
  type Member,
  type Poll,
} from "../store/mockData";
import { computeOpenBalances, computeRawBalances, type BalanceTxn, type SettlementRecord } from "../store/balances";
import chevronIcon from "../assets/icons/Right_Arrow.svg";
import backArrowIcon from "../assets/icons/Back_Arrow.svg";

type Tab = "summary" | "itinerary" | "budget";

type TripDetailProps = {
  onBack: () => void;
  onCreatePoll: () => void;
  onAddExpense: () => void;
  onOpenExpense: (id: string) => void;
  onOpenParticipants: (autoInvite?: boolean) => void;
  memberIds: string[];
  allMembers: Record<string, Member>;
  initialTab?: Tab;
  totalSpent: number;
  expenseList: ExpenseHistoryItem[];
  poll: Poll | null;
  settlements: SettlementRecord[];
  onSettleBalance: (fromId: string, toId: string, amount: number) => void;
  // Whether the Home -> TripDetail hero red-gradient fade has already
  // played this session. Lifted up to App.tsx rather than kept as local
  // state here: this screen fully unmounts and remounts on every trip
  // navigation (visiting Participants and coming back, for instance), so
  // local state would replay the fade every single time instead of just
  // the one real first arrival from Home.
  heroIntroPlayed: boolean;
  onHeroIntroPlayed: () => void;
  // Same reasoning for the map's cloud reveal, which additionally has to
  // survive switching between the Summary/Itinerary/Budget tabs.
  mapIntroPlayed: boolean;
  onMapIntroPlayed: () => void;
  itinerary: ItineraryItem[];
  dayOptions: string[];
  onEditItinerary: () => void;
  onOpenItineraryItem: (id: string) => void;
  // True once Ari has logged the dinner, which is the last thing the trip is
  // waiting on — the map then reads every stop as visited.
  tripComplete: boolean;
};

const TABS: Tab[] = ["summary", "itinerary", "budget"];
const TAB_LABELS: Record<Tab, string> = { summary: "Summary", itinerary: "Itinerary", budget: "Budget" };

/**
 * Height of the soft edge under the tabs. Capped at the panes' own top padding
 * so the mask is opaque again by the time the first card or photo begins: any
 * taller and it veils the top of that image while the pane sits at rest.
 */
const TAB_FADE = 20;

type BudgetStep = "list" | "settle" | "confirmed" | "recap";

// Kept identical to Home's HERO_TRANSITION - the two ends of a shared
// layoutId transition need matching timing/easing or the handoff itself
// looks like a stutter partway through.
const HERO_TRANSITION = { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const };
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: 0.18 + i * 0.1, ease: "easeOut" as const },
  }),
};

const PAYMENT_METHODS = [
  { id: "bank", icon: creditCardIcon, label: "Instant bank transfer", subtitle: "Arrives in seconds" },
  { id: "applepay", icon: applePayIcon, label: "Apple Pay", subtitle: "Fast & secure" },
  { id: "cash", icon: cashIcon, label: "Mark as paid in cash", subtitle: "No receipt" },
];

function Card({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`bg-white rounded-[20px] p-5 ${className}`}
      style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)", ...style }}
    >
      {children}
    </div>
  );
}

function MemberName({ member }: { member: Member }) {
  return (
    <>
      {member.name}
      {member.isYou && <span style={{ opacity: 0.5 }}> (You)</span>}
    </>
  );
}

function BalanceRow({
  b,
  allMembers,
  actionable,
  onPay,
  nudgeable = false,
  onNudge,
}: {
  b: { fromId: string; toId: string; amount: number; paid: boolean };
  allMembers: Record<string, Member>;
  actionable: boolean;
  onPay: () => void;
  nudgeable?: boolean;
  onNudge?: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0" style={{ opacity: b.paid ? 0.55 : 1 }}>
          <AvatarStack members={[allMembers[b.fromId], allMembers[b.toId]]} size={30} />
          <p className="font-body text-ink text-[14px] leading-snug">
            <span className="font-bold">
              <MemberName member={allMembers[b.fromId]} />
            </span>{" "}
            owes{" "}
            <span className="font-bold">
              <MemberName member={allMembers[b.toId]} />
            </span>
          </p>
        </div>
        <p
          className="font-body font-bold text-[15px] shrink-0"
          style={{ color: b.paid ? "#8A8578" : "#1C2541" }}
        >
          €{b.amount.toFixed(2)}
        </p>
      </div>
      {b.paid ? (
        <div className="flex justify-end">
          <span className="font-body font-bold text-teal text-[12px] flex items-center gap-1">
            <img src={checkBadge} alt="" className="w-4 h-4" />
            Paid
          </span>
        </div>
      ) : actionable ? (
        <button onClick={onPay} className="w-full h-10 rounded-[10px] bg-teal flex items-center justify-center">
          <span className="font-body font-bold text-white text-[14px]">Pay</span>
        </button>
      ) : nudgeable ? (
        <button
          onClick={onNudge}
          className="w-full h-11 rounded-[10px] flex items-center justify-center gap-1.5"
          style={{ border: "1.5px solid #0EA5A0", backgroundColor: "rgba(14,165,160,0.1)" }}
        >
          <span className="text-[13px]">🔔</span>
          <span className="font-body font-bold text-teal text-[13px]">Nudge</span>
        </button>
      ) : (
        <div className="flex justify-end">
          <span className="font-body font-bold text-[11px] uppercase tracking-wide text-grey-ink bg-[#F0EBDD] px-2.5 py-1.5 rounded-full">
            Pending
          </span>
        </div>
      )}
    </div>
  );
}

export default function TripDetail({
  onBack,
  onCreatePoll,
  onAddExpense,
  onOpenExpense,
  onOpenParticipants,
  memberIds,
  allMembers,
  initialTab,
  totalSpent,
  expenseList,
  poll,
  settlements,
  onSettleBalance,
  heroIntroPlayed,
  onHeroIntroPlayed,
  mapIntroPlayed,
  onMapIntroPlayed,
  itinerary,
  dayOptions,
  onEditItinerary,
  onOpenItineraryItem,
  tripComplete,
}: TripDetailProps) {
  const [tab, setTab] = useState<Tab>(initialTab ?? "summary");
  const [tabReady, setTabReady] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [budgetStep, setBudgetStep] = useState<BudgetStep>("list");
  const [activeTxn, setActiveTxn] = useState<BalanceTxn | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showMergeInfo, setShowMergeInfo] = useState(false);
  // Home's hero uses a vivid red-tinted gradient; this screen's smaller
  // card uses a plain dark one for text legibility. Left as a bare swap,
  // the two colors change instantly the moment the shared hero box lands
  // here, reading as a flash right as the box finishes resizing. Fading
  // the red tint out over the smaller card's dark gradient smooths that
  // handoff - but whether it's already played lives in App.tsx
  // (heroIntroPlayed), not as local state here: this screen fully
  // unmounts and remounts on every trip navigation (visiting
  // Participants and coming back, for instance), so local state
  // replayed the fade - and the flash it's meant to hide - on every
  // single remount instead of just the one real first arrival from Home.
  //
  // Driven by plain state + a CSS transition rather than Framer Motion's
  // initial/animate props: the tab-switch AnimatePresence above is
  // `initial={false}` for a good reason (so the whole tab doesn't slide
  // in from the side on this very first render), but that setting also
  // suppresses the `initial` prop on every motion component nested
  // inside it - so a motion.div here would jump straight to its `animate`
  // value with no visible fade at all, exactly on the one render this
  // needs to actually play.
  const [heroRedVisible, setHeroRedVisible] = useState(true);
  const tabIndex = TABS.indexOf(tab);
  const prevIndexRef = useRef(tabIndex);
  const direction = tabIndex > prevIndexRef.current ? 1 : -1;

  useEffect(() => {
    setTabReady(true);
  }, []);
  useEffect(() => {
    prevIndexRef.current = tabIndex;
  }, [tabIndex]);
  useEffect(() => {
    if (heroIntroPlayed) return;
    // Two rAFs, not one: the browser needs to actually paint the starting
    // opacity:1 frame before the flip to 0 is what triggers the CSS
    // transition. A single rAF can still land in the same paint as the
    // initial render on some browsers, skipping the transition entirely.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setHeroRedVisible(false));
    });
    const t = setTimeout(onHeroIntroPlayed, HERO_TRANSITION.duration * 1000 + 50);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trip = trips[0];
  const tripMembers = memberIds.map((id) => allMembers[id]).filter(Boolean);
  const pollWinner =
    poll && poll.closed
      ? [...poll.options].sort((a, b) => b.voterIds.length - a.voterIds.length)[0]
      : null;

  const currentUserId = tripMembers.find((m) => m.isYou)?.id ?? null;
  const isBudgetSubStep = tab === "budget" && budgetStep !== "list";
  // Ordered explicitly rather than by reversing the array: a plan added from
  // the editor lands at the end of the list, and reversing would float it to
  // the top of the page under a second, duplicate heading for its day.
  // Latest day first, and latest plan first within each day.
  const dayOrder = new Map(dayOptions.map((iso, i) => [formatDayLabel(iso), i]));
  const reversedItinerary = [...itinerary].sort((a, b) => {
    const dayDiff = (dayOrder.get(b.day) ?? 0) - (dayOrder.get(a.day) ?? 0);
    if (dayDiff !== 0) return dayDiff;
    // "Free day" has no clock position, so it sits at the foot of its day.
    if (a.time === "Free day") return 1;
    if (b.time === "Free day") return -1;
    return b.time.localeCompare(a.time);
  });

  const openBalances = computeOpenBalances(expenseList, memberIds, settlements);
  const allSettled = openBalances.length === 0;
  const recentSettlements = [...settlements].reverse().slice(0, 5);

  // Both lists are recomputed on every render, so logging an expense or
  // recording a payment immediately re-plans the transfers below rather than
  // appending to a stale list. The raw count is only used to show how much
  // consolidating actually saved.
  const rawBalanceCount = computeRawBalances(expenseList, memberIds, settlements).length;
  const mergedCount = rawBalanceCount - openBalances.length;

  const openKeys = new Set(openBalances.map((b) => `${b.fromId}-${b.toId}`));
  const latestSettlementByPair = new Map<string, SettlementRecord>();
  for (const s of settlements) latestSettlementByPair.set(`${s.fromId}-${s.toId}`, s);
  const paidRows = [...latestSettlementByPair.values()].filter(
    (s) => !openKeys.has(`${s.fromId}-${s.toId}`)
  );
  const balanceRows: { fromId: string; toId: string; amount: number; paid: boolean }[] = [
    ...openBalances.map((b) => ({ ...b, paid: false })),
    ...paidRows.map((s) => ({ fromId: s.fromId, toId: s.toId, amount: s.amount, paid: true })),
  ];
  const yourRows = balanceRows.filter((b) => b.fromId === currentUserId);
  const otherRows = balanceRows.filter((b) => b.fromId !== currentUserId);
  const yourOpenCount = yourRows.filter((b) => !b.paid).length;

  const yourShare = expenseList
    .flatMap((e) => e.items ?? [])
    .reduce((sum, item) => {
      if (!currentUserId || !item.splitIds.includes(currentUserId)) return sum;
      return sum + item.amount / item.splitIds.length;
    }, 0);

  function nudgeBalance(txn: BalanceTxn) {
    onSettleBalance(txn.fromId, txn.toId, txn.amount);
  }

  function endTrip() {
    openBalances.forEach((b) => onSettleBalance(b.fromId, b.toId, b.amount));
    setBudgetStep("recap");
  }

  function openSettle(txn: BalanceTxn) {
    setActiveTxn(txn);
    setSelectedMethod(null);
    setBudgetStep("settle");
  }

  function confirmSettle() {
    if (!activeTxn || !selectedMethod) return;
    onSettleBalance(activeTxn.fromId, activeTxn.toId, activeTxn.amount);
    setBudgetStep("confirmed");
  }

  function backToBalances() {
    setBudgetStep("list");
    setActiveTxn(null);
    setSelectedMethod(null);
  }

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "#FAF6EE" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <StatusBar tone="dark" />

      {/* header */}
      <ScreenHeader
        title={isBudgetSubStep ? "Budget" : "Trips"}
        onBack={isBudgetSubStep ? backToBalances : onBack}
        className="pt-[64px] px-5"
      />

      {/* segmented tabs */}
      {!isBudgetSubStep && (
        <div className="px-5 pt-5 shrink-0">
          <div className="relative w-full flex bg-[#D9D9D9] rounded-full p-1" style={{ height: 44 }}>
            <motion.div
              className="absolute top-1 bottom-1 rounded-full bg-teal"
              initial={false}
              animate={{ left: `calc(${(tabIndex / 3) * 100}% + 4px)` }}
              style={{
                width: "calc(33.333% - 8px)",
                boxShadow:
                  "inset 0 0 0 1.5px rgba(28,37,65,0.3), inset 0 2px 1px rgba(28,37,65,0.25), inset 0 -1px 0px rgba(255,255,255,0.7)",
              }}
              transition={tabReady ? { duration: 0.35, ease: "easeInOut" } : { duration: 0 }}
            />
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`relative z-10 flex-1 flex items-center justify-center font-body font-bold text-[14px] transition-colors ${
                  tab === t ? "text-white" : "text-ink"
                }`}
              >
                {TAB_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {tab === "summary" && (
            <motion.div
              key="summary"
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 overflow-y-auto px-5 pt-5 pb-28 flex flex-col gap-4"
              style={topFadeMask(TAB_FADE)}
            >
              <div className="relative w-full shrink-0" style={{ height: 200 }}>
                <motion.div
                  layoutId="hero-image"
                  className="absolute inset-0 rounded-[28px] overflow-hidden"
                  transition={HERO_TRANSITION}
                >
                  <img src={trip.cover} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0) 70%)",
                    }}
                  />
                  {!heroIntroPlayed && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(214,20,20,0.88) 0%, rgba(224,40,40,0.72) 22%, rgba(200,40,40,0.42) 42%, rgba(20,10,15,0.1) 58%, rgba(10,5,10,0.6) 100%)",
                        opacity: heroRedVisible ? 1 : 0,
                        transition: `opacity ${HERO_TRANSITION.duration}s ease-in`,
                      }}
                    />
                  )}
                </motion.div>
                <div className="absolute left-5 bottom-5 right-5 z-10">
                  <p className="font-body font-bold text-white/90 text-[13px]">
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </p>
                  <p className="font-heading font-normal text-white text-[30px] leading-tight mt-1">
                    {trip.name}, Portugal
                  </p>
                </div>
              </div>

              <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
                <Card>
                  <h2 className="font-body font-bold text-ink text-[20px]">Today Trip summary</h2>
                  <p className="font-body text-grey-ink text-[14px] mt-1.5">
                    {trip.name}, Portugal · {tripMembers.length} people
                  </p>
                  <p className="font-body text-ink text-[15px] mt-3 leading-relaxed">{tripSummaryText}</p>
                </Card>
              </motion.div>

              <motion.button
                custom={1}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => setTab("budget")}
                className="w-full block text-left"
              >
                <Card>
                  <div className="flex items-center justify-between">
                    <p className="font-body font-bold text-ink text-[20px]">Balance summary</p>
                    <img src={chevronIcon} alt="" className="w-5 h-5" />
                  </div>
                  <p className="font-heading font-semibold text-teal text-[38px] leading-tight mt-1">
                    <AnimatedAmount value={totalSpent} />
                  </p>
                  <p className="font-body text-grey-ink text-[13px] mt-1">Updated today</p>

                  <div className="mt-4 pt-4 border-t border-[#EDE7DA]">
                    <p className="font-body font-bold text-grey-ink text-[11px] uppercase tracking-wide">
                      Who owes whom
                    </p>
                    {allSettled ? (
                      <p className="font-body font-bold text-teal text-[13px] mt-2">🎉 All settled up</p>
                    ) : (
                      <div className="flex flex-col gap-2 mt-3">
                        {openBalances.map((b) => {
                          const isYours = b.fromId === currentUserId;
                          return (
                            <div
                              key={`${b.fromId}-${b.toId}`}
                              className="flex items-center justify-between rounded-[10px]"
                              style={
                                isYours
                                  ? { border: "1.5px solid #0EA5A0", background: "#F0FBFA", padding: "6px 8px" }
                                  : { padding: "0 8px" }
                              }
                            >
                              <div className="flex items-center gap-2.5">
                                <AvatarStack members={[allMembers[b.fromId], allMembers[b.toId]]} size={26} />
                                <p className="font-body text-ink text-[13px]">
                                  <span className="font-bold">
                                    <MemberName member={allMembers[b.fromId]} />
                                  </span>{" "}
                                  owes{" "}
                                  <span className="font-bold">
                                    <MemberName member={allMembers[b.toId]} />
                                  </span>
                                </p>
                              </div>
                              <p
                                className="font-body font-bold text-[13px] shrink-0"
                                style={{ color: isYours ? "#0EA5A0" : "#1C2541" }}
                              >
                                €{b.amount.toFixed(2)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.button>

              <motion.button
                custom={2}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => onOpenParticipants()}
                className="w-full block text-left"
              >
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-body font-bold text-ink text-[20px]">Participants</h2>
                    <img src={chevronIcon} alt="" className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-4">
                    {tripMembers.map((m) => (
                      <div key={m.id} className="flex items-center gap-3">
                        <Avatar member={m} size={44} />
                        <div>
                          <p className="font-body font-bold text-ink text-[15px] flex items-center gap-2">
                            {m.name}
                            {m.isYou && <span style={{ opacity: 0.5 }}> (You)</span>}
                            {m.isOrganizer && (
                              <span className="font-body font-bold text-[11px] text-teal uppercase tracking-wide bg-teal/10 px-2 py-0.5 rounded-full">
                                Organizer
                              </span>
                            )}
                          </p>
                          <p className="font-body text-grey-ink text-[13px]">{m.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.button>

              <motion.button
                custom={3}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                onClick={() => setShowEndConfirm(true)}
                className="w-full h-[54px] shrink-0 rounded-[10px] flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255,92,114,0.10)",
                  border: "1.5px solid rgba(255,92,114,0.55)",
                }}
              >
                <span className="font-body font-bold text-coral text-[16px]">End trip</span>
              </motion.button>
            </motion.div>
          )}

          {tab === "itinerary" && (
            <motion.div
              key="itinerary"
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 overflow-y-auto px-5 pt-5 pb-28 flex flex-col gap-4"
              style={topFadeMask(TAB_FADE)}
            >
              <TripMap
                introPlayed={mapIntroPlayed}
                onIntroPlayed={onMapIntroPlayed}
                dinnerPinLabel={pollWinner?.label}
                allVisited={tripComplete}
              />

              <Card>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-body font-bold text-ink text-[20px]">Plans</h2>
                  <button
                    onClick={onEditItinerary}
                    className="flex items-center gap-1.5 bg-teal/10 rounded-full px-3 py-1.5"
                  >
                    <span className="text-[12px]">✏️</span>
                    <span className="font-body font-bold text-teal text-[12px]">Edit</span>
                  </button>
                </div>
                <div className="flex flex-col">
                  {reversedItinerary.map((item, i) => (
                    <div key={item.id}>
                      {(i === 0 || reversedItinerary[i - 1].day !== item.day) && (
                        <p className="font-body font-bold text-[12px] text-teal uppercase tracking-wide mt-4 first:mt-0 mb-2">
                          {item.day}
                        </p>
                      )}
                      <div
                        className={`flex gap-3 pt-2.5 border-t border-[#EDE7DA] first:border-t-0 ${
                          item.pending && pollWinner && !tripComplete ? "pb-4" : "pb-2.5"
                        }`}
                      >
                        <p className="font-body text-grey-ink text-[13px] w-[64px] shrink-0 pt-0.5">{item.time}</p>
                        <div className="flex-1 min-w-0">
                          {/* The dinner isn't a plan yet while the poll is still
                              open — there's no place decided to open a page about,
                              so it gets neither a chevron nor a tap until then. */}
                          {item.pending && !pollWinner ? (
                            <p className="font-body font-bold text-teal text-[15px]">{item.title}</p>
                          ) : (
                            <button
                              onClick={() => onOpenItineraryItem(item.id)}
                              className="text-left w-full flex items-center gap-2"
                            >
                              <p className="font-body font-bold text-ink text-[15px]">
                                {item.pending && pollWinner ? `Last dinner — ${pollWinner.label}` : item.title}
                              </p>
                              <img src={chevronIcon} alt="" className="w-3.5 h-3.5 shrink-0 opacity-40" />
                            </button>
                          )}
                          {item.pending && pollWinner ? (
                            <>
                              <p className="font-body text-teal text-[13px] mt-0.5">🎉 Decided by poll</p>
                              {/* Once the dinner is logged there's nothing left to do here —
                                  Directions and Add expense stop being actions and start being clutter. */}
                              {!tripComplete && (
                                <div className="flex items-center gap-2 mt-5">
                                  <button
                                    onClick={() =>
                                      window.open(
                                        `https://www.google.com/maps/search/${encodeURIComponent(
                                          `${pollWinner.label} Lisbon Portugal`
                                        )}`,
                                        "_blank",
                                        "noopener,noreferrer"
                                      )
                                    }
                                    className="h-9 px-4 rounded-[10px] bg-white flex items-center justify-center"
                                    style={{ border: "1.5px solid #0EA5A0" }}
                                  >
                                    <span className="font-body font-bold text-teal text-[15px]">Directions</span>
                                  </button>
                                  <button
                                    onClick={onAddExpense}
                                    className="h-9 px-4 rounded-[10px] bg-teal flex items-center justify-center"
                                  >
                                    <span className="font-body font-bold text-white text-[15px]">Add expense</span>
                                  </button>
                                </div>
                              )}
                            </>
                          ) : (
                            item.subtitle && (
                              <p className="font-body text-grey-ink text-[13px] mt-0.5">{item.subtitle}</p>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {tab === "budget" && (
            <motion.div
              key="budget"
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 40 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 overflow-y-auto px-5 pt-5 pb-28"
              style={topFadeMask(TAB_FADE)}
            >
              <AnimatePresence mode="wait">
                {budgetStep === "list" && (
                  <motion.div
                    key="balance-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4"
                  >
                    <Card>
                      <p className="font-body font-bold text-ink text-[20px]">Total spent</p>
                      <p className="font-heading font-semibold text-teal text-[38px] leading-tight mt-1">
                        <AnimatedAmount value={totalSpent} />
                      </p>
                      <p className="font-body text-grey-ink text-[13px] mt-1">Across {tripMembers.length} people</p>
                    </Card>

                    <Card>
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="font-body font-bold text-ink text-[20px]">Balances</h2>
                        <span
                          className={`font-body font-bold text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${
                            allSettled ? "bg-teal/10 text-teal" : "bg-[#F2A93B]/15 text-[#B4761F]"
                          }`}
                        >
                          {allSettled ? "Settled" : `${openBalances.length} open`}
                        </span>
                      </div>
                      <p className={`font-body text-grey-ink text-[13px] ${mergedCount > 0 ? "mb-2" : "mb-4"}`}>
                        Across {expenseList.length} expenses
                      </p>
                      {mergedCount > 0 && (
                        <button
                          onClick={() => setShowMergeInfo(true)}
                          aria-label="How merging debts works"
                          className="inline-flex items-center gap-1.5 bg-teal/10 rounded-full pl-3 pr-2.5 py-1.5 mb-4"
                        >
                          <span className="text-[12px]">✨</span>
                          <span className="font-body font-bold text-teal text-[12px]">
                            {rawBalanceCount} debts merged into {openBalances.length}{" "}
                            {openBalances.length === 1 ? "transfer" : "transfers"}
                          </span>
                          <span
                            className="w-[16px] h-[16px] rounded-full flex items-center justify-center shrink-0"
                            style={{ border: "1.3px solid #0EA5A0" }}
                          >
                            <span className="font-body font-bold text-teal text-[11px] leading-none">i</span>
                          </span>
                        </button>
                      )}

                      <div
                        className={`rounded-[14px] p-3.5 ${otherRows.length > 0 ? "mb-4" : ""}`}
                        style={{ border: "1.5px solid #0EA5A0", background: "#F0FBFA" }}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="font-body font-bold text-teal text-[11px] uppercase tracking-wide">
                            Your payments
                          </p>
                          <span
                            className={`font-body font-bold text-[11px] uppercase tracking-wide px-2 py-0.5 rounded-full ${
                              yourOpenCount === 0 ? "bg-teal/15 text-teal" : "bg-[#F2A93B]/20 text-[#B4761F]"
                            }`}
                          >
                            {yourOpenCount === 0 ? "Settled" : `${yourOpenCount} to pay`}
                          </span>
                        </div>
                        {yourRows.length === 0 ? (
                          <p className="font-body font-bold text-teal text-[13px]">🎉 You're all settled up</p>
                        ) : (
                          <div className="flex flex-col gap-3">
                            {yourRows.map((b) => (
                              <BalanceRow
                                key={`${b.fromId}-${b.toId}`}
                                b={b}
                                allMembers={allMembers}
                                actionable={!b.paid}
                                onPay={() => openSettle(b)}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {otherRows.length > 0 && (
                        <>
                          <p className="font-body font-bold text-grey-ink text-[11px] uppercase tracking-wide mb-2.5">
                            Other balances
                          </p>
                          <div className="flex flex-col gap-3">
                            {otherRows.map((b) => (
                              <BalanceRow
                                key={`${b.fromId}-${b.toId}`}
                                b={b}
                                allMembers={allMembers}
                                actionable={false}
                                onPay={() => {}}
                                nudgeable={!b.paid && b.toId === currentUserId}
                                onNudge={() => nudgeBalance(b)}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </Card>

                    <Card>
                      <h2 className="font-body font-bold text-ink text-[20px] mb-3">Expenses</h2>
                      <div className="flex flex-col">
                        {expenseList.map((e, i) => (
                          <button
                            key={e.id}
                            onClick={() => onOpenExpense(e.id)}
                            className={`w-full flex items-center gap-3 py-3 text-left ${
                              i > 0 ? "border-t border-[#EDE7DA]" : ""
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-body font-bold text-ink text-[15px] truncate">{e.name}</p>
                              <p className="font-body text-grey-ink text-[13px] mt-0.5">{formatSingleDate(e.date)}</p>
                            </div>
                            <p className="font-body font-bold text-ink text-[15px] shrink-0">
                              €{e.amount.toFixed(2)}
                            </p>
                            <img src={chevronIcon} alt="" className="w-5 h-5 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </Card>

                  </motion.div>
                )}

                {budgetStep === "settle" && activeTxn && (
                  <motion.div
                    key="balance-settle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4"
                  >
                    <Card className="items-center text-center flex flex-col">
                      <AvatarStack
                        members={[allMembers[activeTxn.fromId], allMembers[activeTxn.toId]]}
                        size={44}
                      />
                      <p className="font-body text-ink text-[15px] mt-3">
                        <span className="font-bold">
                          <MemberName member={allMembers[activeTxn.fromId]} />
                        </span>{" "}
                        owes{" "}
                        <span className="font-bold">
                          <MemberName member={allMembers[activeTxn.toId]} />
                        </span>
                      </p>
                      <p className="font-heading font-semibold text-teal text-[38px] leading-tight mt-1">
                        €{activeTxn.amount.toFixed(2)}
                      </p>
                    </Card>

                    <div>
                      <p className="font-body font-bold text-grey-ink text-[12px] uppercase tracking-wide mb-2 px-1">
                        How?
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {PAYMENT_METHODS.map((m) => {
                          const selected = selectedMethod === m.id;
                          return (
                            <button
                              key={m.id}
                              onClick={() => setSelectedMethod(m.id)}
                              className="w-full text-left"
                            >
                              <Card
                                className="flex items-center gap-3 !p-3.5"
                                style={{ border: selected ? "1.5px solid #0EA5A0" : "1.5px solid transparent" }}
                              >
                                <div className="w-9 h-9 flex items-center justify-center shrink-0">
                                  <img src={m.icon} alt="" className="w-9 h-9 object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-body font-bold text-ink text-[14px]">{m.label}</p>
                                  <p className="font-body text-grey-ink text-[12px] mt-0.5">{m.subtitle}</p>
                                </div>
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                  style={{ border: `1.5px solid ${selected ? "#0EA5A0" : "#D9D3C4"}` }}
                                >
                                  {selected && <div className="w-2.5 h-2.5 rounded-full bg-teal" />}
                                </div>
                              </Card>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={confirmSettle}
                      disabled={!selectedMethod}
                      className="w-full h-[54px] rounded-[10px] bg-teal flex items-center justify-center disabled:opacity-40"
                    >
                      <span className="font-body font-bold text-white text-[16px]">
                        Pay €{activeTxn.amount.toFixed(2)}
                      </span>
                    </button>
                  </motion.div>
                )}

                {budgetStep === "confirmed" && activeTxn && (
                  <motion.div
                    key="balance-confirmed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center text-center pt-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.6, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                      className="w-20 h-20 rounded-full flex items-center justify-center text-[36px]"
                      style={{ background: "#FFFFFF", boxShadow: "0 12px 24px rgba(0,0,0,0.15)" }}
                    >
                      ✅
                    </motion.div>

                    <h1 className="font-heading font-normal text-ink text-[32px] leading-tight mt-4">Paid</h1>
                    <p className="font-body text-ink text-[15px] mt-1.5">
                      <span className="font-bold">
                        <MemberName member={allMembers[activeTxn.fromId]} />
                      </span>{" "}
                      →{" "}
                      <span className="font-bold">
                        <MemberName member={allMembers[activeTxn.toId]} />
                      </span>
                      , €{activeTxn.amount.toFixed(2)}
                    </p>

                    <div className="w-full bg-white rounded-[20px] p-4 mt-6 text-left" style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}>
                      <p className="font-body font-bold text-grey-ink text-[11px] uppercase tracking-wide mb-3">
                        Recent settlements
                      </p>
                      <div className="flex flex-col gap-2.5">
                        {recentSettlements.map((s) => (
                          <div key={s.id} className="flex items-center justify-between">
                            <p className="font-body text-ink text-[13px]">
                              <span className="font-bold">
                                <MemberName member={allMembers[s.fromId]} />
                              </span>{" "}
                              →{" "}
                              <span className="font-bold">
                                <MemberName member={allMembers[s.toId]} />
                              </span>
                            </p>
                            <span className="font-body font-bold text-teal text-[12px] flex items-center gap-1">
                              <img src={checkBadge} alt="" className="w-4 h-4" />
                              €{s.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="w-full mt-6 px-2 text-center font-body font-bold text-ink text-[15px] leading-snug">
                      It's your last night in Lisbon and everyone's settled up — want to end the trip?
                    </p>

                    <div className="w-full flex flex-col gap-3 mt-6">
                      <button
                        onClick={endTrip}
                        className="w-full h-[54px] rounded-[10px] flex items-center justify-center"
                        style={{
                          backgroundColor: "rgba(255,92,114,0.10)",
                          border: "1.5px solid rgba(255,92,114,0.55)",
                        }}
                      >
                        <span className="font-body font-bold text-coral text-[16px]">End trip</span>
                      </button>
                      <button
                        onClick={backToBalances}
                        className="w-full h-[54px] rounded-[10px] bg-white flex items-center justify-center"
                        style={{
                          border: "1px solid rgba(28,37,65,0.10)",
                          boxShadow: "0 2px 6px rgba(28,37,65,0.06)",
                        }}
                      >
                        <span className="font-body font-bold text-ink text-[16px]">Back to Budget</span>
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* trip recap — full-screen overlay */}
      <AnimatePresence>
        {budgetStep === "recap" && (
          <motion.div
            key="recap-fullscreen"
            className="absolute inset-0 z-40 flex flex-col overflow-hidden"
            style={{ backgroundColor: "#FAF6EE" }}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <StatusBar tone="light" />

            <div className="flex-1 overflow-y-auto">
              <div className="relative w-full shrink-0" style={{ height: 340 }}>
                <img src={trip.cover} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(28,20,14,0.6) 0%, rgba(40,24,14,0.35) 40%, rgba(28,20,14,0.1) 65%, #FAF6EE 100%)",
                  }}
                />
                <button
                  onClick={backToBalances}
                  aria-label="Back"
                  className="absolute top-[64px] left-5"
                >
                  {/* Bare icon, no wrapping circle — matches ScreenHeader's back
                      button exactly, instead of doubling into a visible ring
                      against this photo. */}
                  <img src={backArrowIcon} alt="" className="w-7 h-7" />
                </button>
                <motion.div
                  className="absolute inset-x-0 flex justify-center"
                  style={{ bottom: 20 }}
                  initial={{ opacity: 0, scale: 0.6, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-[36px]"
                    style={{ background: "#FFFFFF", boxShadow: "0 12px 24px rgba(0,0,0,0.25)" }}
                  >
                    {allSettled ? "✅" : "🏁"}
                  </div>
                </motion.div>
              </div>

              <div className="px-6 pt-6 pb-10 flex flex-col items-center text-center">
                <h1 className="font-heading font-normal text-ink text-[32px] leading-tight">
                  {allSettled ? "🎉 Lisbon is settled" : "Trip recap"}
                </h1>
                <p className="font-body text-grey-ink text-[14px] mt-1.5 px-4">
                  {allSettled
                    ? "Everyone paid their share. Trip balance is €0.00 — the whole group is even."
                    : `${openBalances.length} balance${openBalances.length === 1 ? "" : "s"} still open — settle up before the next trip.`}
                </p>

                <div
                  className="w-full bg-white rounded-[20px] p-5 mt-6 text-left"
                  style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}
                >
                  <p className="font-body font-bold text-grey-ink text-[11px] uppercase tracking-wide">
                    Total spent
                  </p>
                  <p className="font-heading font-semibold text-teal text-[32px] leading-tight mt-1">
                    <AnimatedAmount value={totalSpent} />
                  </p>
                  <p className="font-body text-grey-ink text-[13px] mt-1">
                    Across {tripMembers.length} people · {expenseList.length} expenses
                  </p>

                  <div className="mt-4 pt-4 border-t border-[#EDE7DA] flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <p className="font-body text-ink text-[14px]">Your share</p>
                      <p className="font-body font-bold text-ink text-[14px]">€{yourShare.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-body text-ink text-[14px]">Settlements</p>
                      <span
                        className={`font-body font-bold text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full ${
                          allSettled ? "bg-teal/10 text-teal" : "bg-[#F2A93B]/15 text-[#B4761F]"
                        }`}
                      >
                        {allSettled ? "All paid" : `${openBalances.length} open`}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onBack}
                  className="w-full h-[54px] rounded-[10px] bg-teal flex items-center justify-center mt-6"
                >
                  <span className="font-body font-bold text-white text-[16px]">Back to Trips</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* floating quick-action button */}
      {budgetStep !== "settle" && budgetStep !== "confirmed" && (
        <div className="absolute bottom-[30px] right-5 z-30">
          <MagicAddButton onClick={() => setFabOpen((v) => !v)} open={fabOpen} />
        </div>
      )}

      {/* quick-action sheet */}
      <ActionSheet
        open={fabOpen}
        onClose={() => setFabOpen(false)}
        items={[
          { key: "member", icon: <MemberIcon />, label: "Add member", onSelect: () => onOpenParticipants(true) },
          { key: "poll", icon: <PollIcon />, label: "Create poll", onSelect: onCreatePoll },
          { key: "expense", icon: <ExpenseIcon />, label: "Add expense", onSelect: onAddExpense },
        ]}
      />

      {/* end trip confirmation */}
      <ConfirmDialog
        open={showEndConfirm}
        title="End this trip?"
        message="All open balances will be marked as settled. This can't be undone."
        confirmLabel="End trip"
        onConfirm={() => {
          setShowEndConfirm(false);
          endTrip();
        }}
        onCancel={() => setShowEndConfirm(false)}
      />

      {/* what "N debts merged into M transfers" means */}
      <InfoDialog
        open={showMergeInfo}
        title="Fewer payments, same maths"
        onDismiss={() => setShowMergeInfo(false)}
      >
        <p className="font-body text-grey-ink text-[13px] leading-snug">
          Every expense creates a debt between whoever paid and whoever shared it — {rawBalanceCount} of
          them on this trip so far.
        </p>
        <p className="font-body text-grey-ink text-[13px] leading-snug">
          Rather than everyone paying each other back one by one, TripUp works out what each person is up
          or down overall and finds the shortest way to square up:{" "}
          <span className="font-bold text-ink">
            {openBalances.length} {openBalances.length === 1 ? "payment" : "payments"} instead of{" "}
            {rawBalanceCount}
          </span>
          .
        </p>
        <p className="font-body text-grey-ink text-[13px] leading-snug">
          Nobody ends up paying more or less — the money just takes a more direct route. If Mia owes you
          and you owe Jo, Mia pays Jo and you drop out of the middle.
        </p>
      </InfoDialog>
    </motion.div>
  );
}

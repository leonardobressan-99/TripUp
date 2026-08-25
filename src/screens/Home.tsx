import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import AvatarStack from "../components/AvatarStack";
import { trips, members, formatDateRange, formatShortDate, flagGradient, type Trip, type Member } from "../store/mockData";
import logoMark from "../assets/images/Logo_Mark_Teal.png";
import bellIcon from "../assets/images/3d_Notifications_Icon.png";
import mapIcon from "../assets/images/3d_Maps_Icon.png";
import bookingIcon from "../assets/images/3d_Booking_Icon.png";
import MagicAddButton from "../components/MagicAddButton";
import AnimatedAmount from "../components/AnimatedAmount";
import ActionSheet from "../components/ActionSheet";
import { PollIcon, ExpenseIcon, MemberIcon, TripIcon } from "../components/ActionIcons";
import upArrowIcon from "../assets/icons/up_Arrow.svg";

type HomeProps = {
  onOpenTrip: (tripId: string) => void;
  totalSpent: number;
  memberIds: string[];
  allMembers: Record<string, Member>;
  onCreatePoll: () => void;
  onAddExpense: () => void;
  onAddMember: () => void;
};

const todayDate = new Date("2026-08-24");
const today = `${todayDate.toLocaleDateString("en-US", { weekday: "long" })}, ${todayDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;

const FLAG_PALETTE = ["14,165,160", "255,92,114", "124,58,237", "217,119,6", "37,99,235"];

const HERO_TRANSITION = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

export default function Home({
  onOpenTrip,
  totalSpent,
  memberIds,
  allMembers,
  onCreatePoll,
  onAddExpense,
  onAddMember,
}: HomeProps) {
  const [tab, setTab] = useState<"next" | "past">("next");
  const [tabPillReady, setTabPillReady] = useState(false);
  const [customTrips, setCustomTrips] = useState<Trip[]>([]);
  const [fabMenuOpen, setFabMenuOpen] = useState(false);
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [newName, setNewName] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  useEffect(() => {
    setTabPillReady(true);
  }, []);

  const currentTrip = trips[0];
  const upcomingTrips = [...trips.slice(1), ...customTrips];
  const currentMembers = memberIds.map((id) => allMembers[id]).filter(Boolean);
  const you = members["ari"];

  function handleCreateTrip() {
    if (!newName.trim() || !newStart || !newEnd) return;
    const trip: Trip = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      cover: "",
      startDate: newStart,
      endDate: newEnd,
      spent: 0,
      memberIds: ["ari"],
      flagColor: FLAG_PALETTE[customTrips.length % FLAG_PALETTE.length],
    };
    setCustomTrips((prev) => [...prev, trip]);
    setShowAddTrip(false);
    setNewName("");
    setNewStart("");
    setNewEnd("");
    setTab("next");
  }

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ borderRadius: 0, backgroundColor: "#FAF6EE" }}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <StatusBar tone="dark" />

      {/* header */}
      <div className="pt-[64px] px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-[6px]">
          <img src={logoMark} alt="" className="w-[22px] h-auto" />
          <span className="font-body font-bold text-[20px] text-teal tracking-tight">TripUp</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-body text-[14px] text-grey-ink">{today}</span>
          <button className="relative shrink-0" aria-label="Notifications">
            <img src={bellIcon} alt="" className="w-[30px] h-[30px] object-contain" />
          </button>
        </div>
      </div>

      {/* content — fixed composition, no scroll */}
      <div className="flex-1 overflow-hidden px-5 pt-5 pb-[150px]">
        {/* hero card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onOpenTrip(currentTrip.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpenTrip(currentTrip.id);
          }}
          className="relative w-full text-left block cursor-pointer"
          style={{ height: 500 }}
        >
          <motion.div
            layoutId="hero-image"
            className="absolute inset-0 rounded-[32px] overflow-hidden"
            transition={HERO_TRANSITION}
          >
            <img src={currentTrip.cover} alt={currentTrip.name} className="absolute inset-0 w-full h-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(214,20,20,0.88) 0%, rgba(224,40,40,0.72) 22%, rgba(200,40,40,0.42) 42%, rgba(20,10,15,0.1) 58%, rgba(10,5,10,0.6) 100%)",
              }}
            />
          </motion.div>

          <div className="relative z-10 pt-9 px-6 text-center">
            <p className="font-body text-white/95 text-[15px]">Hi Ari, enjoy your last day in</p>
            <h1 className="font-heading font-normal text-white text-[64px] leading-[1.05] -mt-1">
              {currentTrip.name}
            </h1>
            <p className="font-body text-white/85 text-[14px] mt-1">
              {formatDateRange(currentTrip.startDate, currentTrip.endDate)}
            </p>
          </div>

          {/* frosted glass box */}
          <div
            className="absolute left-4 right-4 bottom-4 overflow-hidden"
            style={{
              borderRadius: 23,
              background: "linear-gradient(165deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.08) 55%, rgba(255,255,255,0.14) 100%)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.35)",
              boxShadow:
                "0 16px 30px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -14px 20px rgba(0,0,0,0.12)",
            }}
          >
            <div className="px-5 pt-4 pb-3 flex items-center justify-between">
              <div>
                <p className="font-body text-white/80 text-[13px]">Spent</p>
                <p className="font-body font-normal text-white text-[26px] leading-none mt-1">
                  <AnimatedAmount value={totalSpent} />
                </p>
              </div>
              <div className="text-right">
                <p className="font-body text-white/80 text-[13px] mb-1">{currentMembers.length} Friends</p>
                <AvatarStack members={currentMembers} size={30} max={currentMembers.length} ring="transparent" />
              </div>
            </div>

            <div className="px-4 pb-4">
              <div
                className="w-full bg-white text-teal font-body font-bold text-[16px] flex items-center justify-center"
                style={{ borderRadius: 10, height: 48 }}
              >
                Dive into your trip
              </div>
            </div>
          </div>
        </div>

        {/* segmented tabs */}
        <div className="mt-6 flex items-center justify-between">
          <div className="relative inline-flex bg-[#D9D9D9] rounded-full p-1" style={{ width: 249 }}>
            <motion.div
              className="absolute top-0.5 bottom-0.5 rounded-full"
              style={{ width: "calc(50% - 4px)" }}
              initial={false}
              animate={{
                left: tab === "next" ? "2px" : "calc(50% + 2px)",
                scale: [1, 1.06, 1],
                backgroundColor: ["#0EA5A0", "rgba(255,255,255,0.35)", "#0EA5A0"],
                backdropFilter: ["blur(0px)", "blur(8px)", "blur(0px)"],
                boxShadow: [
                  "0 0px 0px rgba(0,0,0,0)",
                  "0 6px 16px rgba(0,0,0,0.18)",
                  "0 0px 0px rgba(0,0,0,0)",
                ],
              }}
              transition={
                tabPillReady
                  ? { duration: 0.45, times: [0, 0.5, 1], ease: "easeInOut" }
                  : { duration: 0 }
              }
            />
            <button
              onClick={() => setTab("next")}
              className={`relative z-10 flex-1 py-0.5 rounded-full font-body font-bold text-[14px] text-center transition-colors ${
                tab === "next" ? "text-white" : "text-ink"
              }`}
            >
              Next Trips
            </button>
            <button
              onClick={() => setTab("past")}
              className={`relative z-10 flex-1 py-0.5 rounded-full font-body font-bold text-[14px] text-center transition-colors ${
                tab === "past" ? "text-white" : "text-ink"
              }`}
            >
              Past Trips
            </button>
          </div>
          <img src={upArrowIcon} alt="" className="w-7 h-7 shrink-0" />
        </div>

        {/* trip list — wallet-style stacked cards */}
        <AnimatePresence mode="wait">
          {tab === "next" ? (
            (() => {
              const CARD_HEIGHT = 290;
              const PEEK = 32;
              const INSET_STEP = 7;
              const sorted = [...upcomingTrips].sort(
                (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
              );
              const n = sorted.length;
              const containerVariants = {
                hidden: {},
                visible: { transition: { staggerChildren: 0.09 } },
                exit: { transition: { staggerChildren: 0.07, staggerDirection: -1 } },
              };
              const cardVariants = {
                hidden: { opacity: 0, y: 28 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" as const } },
                exit: { opacity: 0, y: 28, transition: { duration: 0.35, ease: "easeInOut" as const } },
              };
              return (
                <motion.div
                  key="next"
                  className="relative mt-4"
                  style={{ height: CARD_HEIGHT + (n - 1) * PEEK }}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {sorted.map((trip, frontDepth) => {
                    const layerFromBack = n - 1 - frontDepth;
                    const top = layerFromBack * PEEK;
                    const inset = frontDepth * INSET_STEP;
                    const zIndex = n - frontDepth;
                    return (
                      <motion.div
                        key={trip.id}
                        variants={cardVariants}
                        className="absolute overflow-hidden rounded-[28px]"
                        style={{
                          top,
                          left: inset,
                          right: inset,
                          height: CARD_HEIGHT,
                          zIndex,
                          boxShadow:
                            frontDepth === 0
                              ? "0 24px 40px rgba(28,37,65,0.28), 0 4px 10px rgba(28,37,65,0.14)"
                              : "0 8px 16px rgba(28,37,65,0.12)",
                        }}
                      >
                        {trip.cover ? (
                          <img src={trip.cover} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                          <div
                            className="absolute inset-0"
                            style={{
                              background: `linear-gradient(160deg, rgba(${trip.flagColor},0.95) 0%, rgba(${trip.flagColor},0.65) 100%)`,
                            }}
                          />
                        )}
                        <div className="absolute inset-0" style={{ background: flagGradient(trip.flagColor) }} />
                        <div className="relative z-10 flex items-center justify-between px-5 pt-4">
                          <span className="font-body font-bold text-white text-[15px] tracking-wide uppercase">
                            {trip.name}
                          </span>
                          <span className="font-body text-white/90 text-[13px]">
                            {formatShortDate(trip.startDate, trip.endDate)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            })()
          ) : (
            <motion.div
              key="past"
              initial={{ opacity: 0, y: -28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -28 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="py-10 text-center font-body text-grey-ink text-[14px]"
            >
              No past trips yet.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* bottom nav */}
      <div className="absolute bottom-[30px] left-5 right-5 flex items-center gap-3 z-20">
        <div
          className="flex-1 flex items-center p-1"
          style={{
            height: 64,
            borderRadius: 9999,
            background:
              "linear-gradient(165deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.12) 55%, rgba(255,255,255,0.22) 100%)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow:
              "0 16px 30px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -14px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div
            className="flex-1 flex flex-col items-center justify-center gap-0 py-0.5"
            style={{
              borderRadius: 9999,
              background: "rgba(255,255,255,0.4)",
              boxShadow:
                "inset 0 0 0 1.5px rgba(28,37,65,0.3), inset 0 2px 1px rgba(28,37,65,0.25), inset 0 -1px 0px rgba(255,255,255,0.7)",
            }}
          >
            <div className="h-[30px] flex items-center justify-center">
              <img src={mapIcon} alt="" className="w-[30px] h-[30px] object-contain" />
            </div>
            <span className="font-body font-bold text-[13px] text-ink">Trips</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-0 py-0.5">
            <div className="h-[30px] flex items-center justify-center">
              <img src={bookingIcon} alt="" className="w-[34px] h-[34px] object-contain opacity-80" />
            </div>
            <span className="font-body font-bold text-[13px] text-ink/80">Bookings</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-0 py-0.5">
            <div className="h-[30px] flex items-center justify-center">
              <img src={you.avatar} alt="" className="w-[30px] h-[30px] rounded-full object-cover" />
            </div>
            <span className="font-body font-bold text-[13px] text-ink/80">Settings</span>
          </div>
        </div>
        <MagicAddButton onClick={() => setFabMenuOpen((v) => !v)} open={fabMenuOpen} />
      </div>

      {/* quick-action sheet */}
      <ActionSheet
        open={fabMenuOpen}
        onClose={() => setFabMenuOpen(false)}
        items={[
          { key: "member", icon: <MemberIcon />, label: "Add member", onSelect: onAddMember },
          { key: "poll", icon: <PollIcon />, label: "Create poll", onSelect: onCreatePoll },
          { key: "expense", icon: <ExpenseIcon />, label: "Add expense", onSelect: onAddExpense },
          { key: "trip", icon: <TripIcon />, label: "Add Trip", onSelect: () => setShowAddTrip(true) },
        ]}
      />

      {/* add trip sheet */}
      <AnimatePresence>
        {showAddTrip && (
          <>
            <motion.div
              className="absolute inset-0 z-30"
              style={{ background: "rgba(28,37,65,0.35)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowAddTrip(false)}
            />
            <motion.div
              className="absolute left-0 right-0 bottom-0 z-40 px-5 pt-6 pb-8"
              style={{ backgroundColor: "#FAF6EE", borderRadius: "28px 28px 0 0" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="w-10 h-1.5 rounded-full bg-grey-ink/25 mx-auto mb-5" />
              <h2 className="font-body font-bold text-ink text-[20px] mb-4">Add a trip</h2>

              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-body font-bold text-ink text-[13px] mb-1.5">Trip name</p>
                  <input
                    autoFocus
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Paris"
                    className="w-full bg-white rounded-xl px-3 py-2.5 font-body text-ink text-[14px] outline-none"
                    style={{ boxShadow: "0 4px 10px rgba(28,37,65,0.06)" }}
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <p className="font-body font-bold text-ink text-[13px] mb-1.5">Start date</p>
                    <input
                      type="date"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full bg-white rounded-xl px-3 py-2.5 font-body text-ink text-[14px] outline-none"
                      style={{ boxShadow: "0 4px 10px rgba(28,37,65,0.06)" }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-body font-bold text-ink text-[13px] mb-1.5">End date</p>
                    <input
                      type="date"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full bg-white rounded-xl px-3 py-2.5 font-body text-ink text-[14px] outline-none"
                      style={{ boxShadow: "0 4px 10px rgba(28,37,65,0.06)" }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateTrip}
                className="mt-6 w-full h-[54px] rounded-[10px] bg-teal flex items-center justify-center"
              >
                <span className="font-body font-bold text-white text-[16px]">Create trip</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import PhoneFrame from "./components/PhoneFrame";
import Springboard from "./screens/Springboard";
import Home from "./screens/Home";
import TripDetail from "./screens/TripDetail";
import AddExpense from "./screens/AddExpense";
import ReceiptCapture from "./screens/ReceiptCapture";
import ScanReceipt from "./screens/ScanReceipt";
import ReceiptReview from "./screens/ReceiptReview";
import ExpenseDetail from "./screens/ExpenseDetail";
import ParticipantsDetail from "./screens/ParticipantsDetail";
import CreatePoll from "./screens/CreatePoll";
import PollDetail from "./screens/PollDetail";
import PollResult from "./screens/PollResult";
import {
  expenseHistory,
  trips,
  members,
  tripDayRange,
  activeParticipantIds,
  type ExpenseCategory,
  type ExpenseHistoryItem,
  type Member,
  type Poll,
  type PollOption,
  type WorkingItem,
} from "./store/mockData";
import type { SettlementRecord } from "./store/balances";

const TODAY_DATE = "2026-08-24";

type Screen =
  | "springboard"
  | "home"
  | "tripDetail"
  | "addExpense"
  | "receiptCapture"
  | "scanReceipt"
  | "receiptReview"
  | "expenseDetail"
  | "participants"
  | "createPoll"
  | "pollDetail"
  | "pollResult";

type Tab = "summary" | "itinerary" | "budget";

let savedExpenseCounter = 0;

const RESTART_MESSAGE = "tripup:restart";

function AppInner() {
  const [screen, setScreen] = useState<Screen>("springboard");
  const [expenseItems, setExpenseItems] = useState<WorkingItem[]>([]);
  const [paidById, setPaidById] = useState("ari");
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);
  const [savedExpenses, setSavedExpenses] = useState<ExpenseHistoryItem[]>([]);
  const [expenseOverrides, setExpenseOverrides] = useState<Record<string, ExpenseHistoryItem>>({});
  const [tripInitialTab, setTripInitialTab] = useState<Tab>("summary");
  const [tripMemberIds, setTripMemberIds] = useState<string[]>(trips[0].memberIds);
  const [customMembers, setCustomMembers] = useState<Record<string, Member>>({});
  const [memberJoinDates, setMemberJoinDates] = useState<Record<string, string>>(() =>
    Object.fromEntries(trips[0].memberIds.map((id) => [id, trips[0].startDate]))
  );
  const [memberJoinTimes, setMemberJoinTimes] = useState<Record<string, string>>(() =>
    Object.fromEntries(trips[0].memberIds.map((id) => [id, "00:00"]))
  );
  const [autoOpenInvite, setAutoOpenInvite] = useState(false);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [restaurantName, setRestaurantName] = useState("");
  const [settlements, setSettlements] = useState<SettlementRecord[]>([
    { id: "seed-settle-1", fromId: "ari", toId: "nic", amount: 109.33 },
    { id: "seed-settle-2", fromId: "mia", toId: "jo", amount: 251.0 },
    { id: "seed-settle-3", fromId: "nic", toId: "jo", amount: 165.68 },
    { id: "seed-settle-4", fromId: "mia", toId: "nic", amount: 85.33 },
  ]);

  const trip = trips[0];
  const dayOptions = tripDayRange(trip.startDate, trip.endDate);
  const expenseList = [...savedExpenses, ...expenseHistory].map((e) => expenseOverrides[e.id] ?? e);
  const totalSpent = expenseList.reduce((sum, e) => sum + e.amount, 0);
  const selectedExpense = expenseList.find((e) => e.id === selectedExpenseId) ?? null;
  const allMembers: Record<string, Member> = { ...members, ...customMembers };
  const pollWinnerLabel =
    poll && poll.closed
      ? poll.options.reduce((best, o) => (o.voterIds.length > best.voterIds.length ? o : best), poll.options[0])
          ?.label
      : undefined;
  const defaultSplitIdsToday = activeParticipantIds(tripMemberIds, memberJoinDates, TODAY_DATE, trip.startDate);

  function goToTrip(tab: Tab) {
    setTripInitialTab(tab);
    setScreen("tripDetail");
  }

  function updateMemberJoinDate(memberId: string, joinDate: string) {
    setMemberJoinDates((prev) => ({ ...prev, [memberId]: joinDate }));

    function resync(e: ExpenseHistoryItem): ExpenseHistoryItem {
      if (!e.items) return e;
      const shouldInclude = e.date >= joinDate;
      let changed = false;
      const items = e.items.map((it) => {
        const has = it.splitIds.includes(memberId);
        if (shouldInclude && !has) {
          changed = true;
          return { ...it, splitIds: [...it.splitIds, memberId] };
        }
        if (!shouldInclude && has) {
          changed = true;
          return { ...it, splitIds: it.splitIds.filter((id) => id !== memberId) };
        }
        return it;
      });
      return changed ? { ...e, items } : e;
    }

    setExpenseOverrides((prevOverrides) => {
      const next = { ...prevOverrides };
      for (const e of expenseHistory) {
        const current = next[e.id] ?? e;
        const resynced = resync(current);
        if (resynced !== current) next[e.id] = resynced;
      }
      return next;
    });

    setSavedExpenses((prevSaved) => prevSaved.map(resync));
  }

  function updateMemberJoinTime(memberId: string, time: string) {
    setMemberJoinTimes((prev) => ({ ...prev, [memberId]: time }));
  }

  function handleCreatePoll(question: string, optionLabels: string[], category: ExpenseCategory) {
    const options: PollOption[] = optionLabels.map((label, i) => ({ id: `opt-${i}`, label, voterIds: [] }));
    if (options[0]) options[0].voterIds.push("jo", "mia");
    if (options[1]) options[1].voterIds.push("nic");
    setPoll({ id: `poll-${Date.now()}`, question, options, createdById: "ari", closed: false, category });
    setTripInitialTab("itinerary");
    setScreen("pollDetail");
  }

  function handleVote(optionId: string) {
    setPoll((prev) => {
      if (!prev || prev.closed) return prev;
      return {
        ...prev,
        options: prev.options.map((o) => ({
          ...o,
          voterIds:
            o.id === optionId
              ? o.voterIds.includes("ari")
                ? o.voterIds
                : [...o.voterIds, "ari"]
              : o.voterIds.filter((id) => id !== "ari"),
        })),
      };
    });
  }

  function handleClosePoll() {
    setPoll((prev) => (prev ? { ...prev, closed: true } : prev));
  }

  function handleSettleBalance(fromId: string, toId: string, amount: number) {
    setSettlements((prev) => [...prev, { id: `settle-${Date.now()}`, fromId, toId, amount }]);
  }

  function handleNudgePoll() {
    setPoll((prev) => {
      if (!prev || prev.closed) return prev;
      const votedIds = new Set(prev.options.flatMap((o) => o.voterIds));
      const pending = tripMemberIds.filter((id) => !votedIds.has(id) && !allMembers[id]?.isYou);
      if (pending.length === 0) return prev;
      const options = prev.options.map((o) => ({ ...o, voterIds: [...o.voterIds] }));
      pending.forEach((id) => {
        const randomIndex = Math.floor(Math.random() * options.length);
        options[randomIndex].voterIds.push(id);
      });
      return { ...prev, options };
    });
  }

  return (
    <PhoneFrame>
      <AnimatePresence>
        {screen === "springboard" && <Springboard key="springboard" onOpenApp={() => setScreen("home")} />}
      </AnimatePresence>

      {screen === "home" && (
        <Home
          key="home"
          onOpenTrip={() => setScreen("tripDetail")}
          totalSpent={totalSpent}
          memberIds={tripMemberIds}
          allMembers={allMembers}
          onCreatePoll={() => setScreen(poll ? "pollDetail" : "createPoll")}
          onAddExpense={() => setScreen("receiptCapture")}
          onAddMember={() => {
            setAutoOpenInvite(true);
            setScreen("participants");
          }}
        />
      )}

      {screen === "tripDetail" && (
        <TripDetail
          key={`tripDetail-${tripInitialTab}`}
          onBack={() => setScreen("home")}
          onCreatePoll={() => setScreen(poll ? "pollDetail" : "createPoll")}
          onAddExpense={() => setScreen("receiptCapture")}
          onOpenExpense={(id) => {
            setSelectedExpenseId(id);
            setScreen("expenseDetail");
          }}
          onOpenParticipants={(autoInvite) => {
            setAutoOpenInvite(!!autoInvite);
            setScreen("participants");
          }}
          memberIds={tripMemberIds}
          allMembers={allMembers}
          initialTab={tripInitialTab}
          totalSpent={totalSpent}
          expenseList={expenseList}
          poll={poll}
          settlements={settlements}
          onSettleBalance={handleSettleBalance}
        />
      )}

      {screen === "createPoll" && (
        <CreatePoll key="createPoll" onBack={() => goToTrip("itinerary")} onCreate={handleCreatePoll} />
      )}

      {screen === "pollDetail" && poll && (
        <PollDetail
          key="pollDetail"
          poll={poll}
          participantIds={tripMemberIds}
          allMembers={allMembers}
          onBack={() => goToTrip("itinerary")}
          onVote={handleVote}
          onClose={() => {
            handleClosePoll();
            setScreen("pollResult");
          }}
          onNudge={handleNudgePoll}
        />
      )}

      {screen === "pollResult" && poll && (
        <PollResult
          key="pollResult"
          poll={poll}
          participantIds={tripMemberIds}
          onBack={() => goToTrip("itinerary")}
          onGoToItinerary={() => goToTrip("itinerary")}
        />
      )}

      {screen === "participants" && (
        <ParticipantsDetail
          key="participants"
          memberIds={tripMemberIds}
          allMembers={allMembers}
          memberJoinDates={memberJoinDates}
          memberJoinTimes={memberJoinTimes}
          dayOptions={dayOptions}
          tripStartDate={trip.startDate}
          autoOpenInvite={autoOpenInvite}
          onBack={() => goToTrip("summary")}
          onAddMember={(member) => {
            if (!members[member.id]) {
              setCustomMembers((prev) => ({ ...prev, [member.id]: member }));
            }
            setTripMemberIds((prev) => (prev.includes(member.id) ? prev : [...prev, member.id]));
            updateMemberJoinDate(member.id, TODAY_DATE);
            updateMemberJoinTime(member.id, "00:00");
          }}
          onRemoveMember={(id) => setTripMemberIds((prev) => prev.filter((m) => m !== id))}
          onUpdateJoinDate={updateMemberJoinDate}
          onUpdateJoinTime={updateMemberJoinTime}
        />
      )}

      {screen === "addExpense" && (
        <AddExpense
          key="addExpense"
          items={expenseItems}
          setItems={setExpenseItems}
          paidById={paidById}
          setPaidById={setPaidById}
          participantIds={tripMemberIds}
          defaultSplitIds={defaultSplitIdsToday}
          allMembers={allMembers}
          restaurantName={restaurantName}
          setRestaurantName={setRestaurantName}
          suggestedRestaurantName={pollWinnerLabel}
          onBack={() => goToTrip("summary")}
          onScanReceipt={() => setScreen("receiptCapture")}
          onSave={() => {
            if (expenseItems.length > 0) {
              const amount = expenseItems.reduce((s, i) => s + i.amount, 0);
              const newExpense: ExpenseHistoryItem = {
                id: `saved-${savedExpenseCounter++}`,
                name: restaurantName.trim() ? `Dinner · ${restaurantName.trim()}` : "Dinner",
                date: "2026-08-24",
                amount,
                paidById,
                items: expenseItems.map((i) => ({
                  name: i.name || "Untitled item",
                  amount: i.amount,
                  category: i.category,
                  splitIds: i.splitIds,
                })),
              };
              setSavedExpenses((prev) => [newExpense, ...prev]);
              setExpenseItems([]);
              setPaidById("ari");
              setRestaurantName("");
            }
            goToTrip("budget");
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {screen === "receiptCapture" && (
          <ReceiptCapture
            key="receiptCapture"
            onBack={() => (expenseItems.length > 0 ? setScreen("addExpense") : goToTrip("summary"))}
            onStartScanning={() => setScreen("scanReceipt")}
            onAddManually={() => setScreen("addExpense")}
          />
        )}
        {screen === "scanReceipt" && (
          <ScanReceipt key="scanReceipt" onBack={() => setScreen("receiptCapture")} onScanned={() => setScreen("receiptReview")} />
        )}
        {screen === "receiptReview" && (
          <ReceiptReview
            key="receiptReview"
            participantIds={tripMemberIds}
            defaultSplitIds={defaultSplitIdsToday}
            allMembers={allMembers}
            onBack={() => setScreen("addExpense")}
            onRetake={() => setScreen("receiptCapture")}
            onDone={(scannedItems) => {
              setExpenseItems((prev) => [...prev, ...scannedItems]);
              setScreen("addExpense");
            }}
          />
        )}
        {screen === "expenseDetail" && selectedExpense && (
          <ExpenseDetail
            key="expenseDetail"
            expense={selectedExpense}
            participantIds={tripMemberIds}
            allMembers={allMembers}
            memberJoinDates={memberJoinDates}
            tripStartDate={trip.startDate}
            onBack={() => goToTrip("budget")}
            onSaveEdits={(updated) => setExpenseOverrides((prev) => ({ ...prev, [updated.id]: updated }))}
          />
        )}
      </AnimatePresence>
    </PhoneFrame>
  );
}

function App() {
  const [resetKey, setResetKey] = useState(0);
  const [embedded, setEmbedded] = useState(true);

  useEffect(() => {
    setEmbedded(window.self !== window.top);
  }, []);

  // The same build serves both the standalone /app/ page and the iframe
  // embedded on the landing page. Listening for a postMessage lets the
  // landing page's own restart button (rendered outside the iframe, with
  // real layout margin) reset this app's state without a page reload,
  // regardless of which context it's running in.
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data === RESTART_MESSAGE) setResetKey((k) => k + 1);
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <>
      <AppInner key={resetKey} />
      {!embedded && (
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-[10px] border-[1.5px] border-[rgba(28,37,65,0.14)] bg-white px-5 py-3 font-body font-bold text-ink text-[14px] shadow-[0_8px_20px_rgba(28,37,65,0.08)] transition-[box-shadow,border-color] hover:border-ink hover:shadow-[0_10px_24px_rgba(28,37,65,0.14)]"
        >
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.87" />
            <path d="M13.5 2.5v3h-3" />
          </svg>
          Restart prototype
        </button>
      )}
    </>
  );
}

export default App;

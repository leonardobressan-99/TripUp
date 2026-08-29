import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import ScreenHeader from "../components/ScreenHeader";
import Avatar from "../components/Avatar";
import IOSKeyboard from "../components/IOSKeyboard";
import ConfirmDialog from "../components/ConfirmDialog";
import { members as canonicalMembers, formatSingleDate, type Member } from "../store/mockData";
import deleteBadge from "../assets/icons/Delete-badge.svg";

const DEFAULT_KEYBOARD_HEIGHT = 258;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, "0")}:00`);

type ParticipantsDetailProps = {
  memberIds: string[];
  allMembers: Record<string, Member>;
  memberJoinDates: Record<string, string>;
  memberJoinTimes: Record<string, string>;
  dayOptions: string[];
  tripStartDate: string;
  autoOpenInvite?: boolean;
  onBack: () => void;
  onAddMember: (member: Member) => void;
  onRemoveMember: (id: string) => void;
  onUpdateJoinDate: (id: string, date: string) => void;
  onUpdateJoinTime: (id: string, time: string) => void;
};

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[20px] p-4 ${className}`} style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}>
      {children}
    </div>
  );
}

let inviteCounter = 0;

export default function ParticipantsDetail({
  memberIds,
  allMembers,
  memberJoinDates,
  memberJoinTimes,
  dayOptions,
  tripStartDate,
  autoOpenInvite,
  onBack,
  onAddMember,
  onRemoveMember,
  onUpdateJoinDate,
  onUpdateJoinTime,
}: ParticipantsDetailProps) {
  const [showInvite, setShowInvite] = useState(!!autoOpenInvite);
  const [query, setQuery] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRemoveMember = pendingRemoveId ? allMembers[pendingRemoveId] : undefined;

  useEffect(() => {
    if (autoOpenInvite) setShowInvite(true);
  }, [autoOpenInvite]);

  useEffect(() => {
    if (!showInvite) setKeyboardOpen(false);
  }, [showInvite]);

  function typeChar(char: string) {
    setQuery((q) => q + char);
    inputRef.current?.focus();
  }

  function backspace() {
    setQuery((q) => q.slice(0, -1));
    inputRef.current?.focus();
  }

  const currentMembers = memberIds.map((id) => allMembers[id]).filter(Boolean);
  const suggested = Object.values(canonicalMembers).filter((m) => !memberIds.includes(m.id));
  const q = query.trim().toLowerCase();
  const matches = q.length > 0 ? suggested.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) : [];

  function openInvite() {
    setQuery("");
    setShowInvite(true);
  }

  function handleAddSuggested(member: Member) {
    onAddMember(member);
    setShowInvite(false);
  }

  function handleInviteByEmail() {
    const trimmed = query.trim();
    if (!trimmed) return;
    const namePart = trimmed.split("@")[0];
    const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const newMember: Member = {
      id: `invite-${inviteCounter++}`,
      name,
      avatar: "",
      email: trimmed,
    };
    onAddMember(newMember);
    setShowInvite(false);
  }

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ backgroundColor: "#FAF6EE" }}>
      <StatusBar tone="dark" />

      <div className="flex-1 overflow-y-auto px-5 pt-[64px] pb-10">
        <ScreenHeader title="Lisbon trip" onBack={onBack} />
        <h1 className="font-body font-bold text-ink text-[28px] leading-tight mt-1">Participants</h1>
        <p className="font-body text-grey-ink text-[14px] mt-1 mb-5">{currentMembers.length} people on this trip</p>

        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
          {currentMembers.map((m) => {
            const joinDate = memberJoinDates[m.id] ?? tripStartDate;
            const joinTime = memberJoinTimes[m.id] ?? "00:00";
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -40 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
              >
              <Card className="flex items-center gap-3">
                <Avatar member={m} size={44} />
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-ink text-[15px] flex items-center gap-1.5 flex-wrap">
                    {m.name}
                    {m.isYou && <span style={{ opacity: 0.5 }}> (You)</span>}
                    {m.isOrganizer ? (
                      <span className="font-body font-bold text-[11px] text-teal uppercase tracking-wide bg-teal/10 px-2 py-0.5 rounded-full">
                        Organizer
                      </span>
                    ) : (
                      <span className="font-body font-bold text-[11px] text-grey-ink uppercase tracking-wide bg-[#EDE7DA] px-2 py-0.5 rounded-full">
                        Member
                      </span>
                    )}
                  </p>
                  <p className="font-body text-grey-ink text-[13px] truncate mt-0.5">{m.email}</p>
                  <label className="flex items-center gap-1 mt-1.5">
                    <span className="font-body text-grey-ink text-[12px]">Splitting since</span>
                    <select
                      value={joinDate}
                      onChange={(e) => onUpdateJoinDate(m.id, e.target.value)}
                      className="font-body font-bold text-teal text-[12px] bg-transparent outline-none"
                    >
                      {dayOptions.map((d) => (
                        <option key={d} value={d}>
                          {formatSingleDate(d)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={joinTime}
                      onChange={(e) => onUpdateJoinTime(m.id, e.target.value)}
                      className="font-body font-bold text-teal text-[12px] bg-transparent outline-none"
                    >
                      {HOUR_OPTIONS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {!m.isYou && !m.isOrganizer && (
                  <button
                    onClick={() => setPendingRemoveId(m.id)}
                    aria-label={`Remove ${m.name}`}
                    className="shrink-0"
                  >
                    <img src={deleteBadge} alt="" className="w-7 h-7" />
                  </button>
                )}
              </Card>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>

        <button
          onClick={openInvite}
          className="w-full mt-5 h-[54px] rounded-[10px] flex items-center justify-center gap-2"
          style={{ border: "1.5px dashed rgba(28,37,65,0.28)" }}
        >
          <span className="text-teal text-[18px] leading-none">＋</span>
          <span className="font-body font-bold text-teal text-[15px]">Invite member</span>
        </button>
      </div>

      {/* invite sheet */}
      <AnimatePresence>
        {showInvite && (
          <>
            <motion.div
              className="absolute inset-0 z-30"
              style={{ background: "rgba(28,37,65,0.35)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowInvite(false)}
            />
            <motion.div
              className="absolute left-0 right-0 bottom-0 z-40 px-5 pt-6 overflow-y-auto"
              style={{ backgroundColor: "#FAF6EE", borderRadius: "28px 28px 0 0", maxHeight: "80%" }}
              initial={{ y: "100%" }}
              animate={{ y: 0, paddingBottom: keyboardOpen ? DEFAULT_KEYBOARD_HEIGHT + 24 : 32 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="w-10 h-1.5 rounded-full bg-grey-ink/25 mx-auto mb-5" />
              <h2 className="font-body font-bold text-ink text-[20px] mb-4">Invite member</h2>

              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setKeyboardOpen(true)}
                onBlur={() => setKeyboardOpen(false)}
                placeholder="Name or email"
                className="w-full bg-white rounded-xl px-3 py-2.5 font-body text-ink text-[14px] outline-none"
                style={{ boxShadow: "0 4px 10px rgba(28,37,65,0.06)" }}
              />

              {matches.length > 0 && (
                <div className="flex flex-col gap-2 mt-3">
                  {matches.map((m) => (
                    <button
                      key={m.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleAddSuggested(m)}
                      className="w-full flex items-center gap-3 bg-white rounded-[10px] px-3 py-2.5 text-left"
                      style={{ boxShadow: "0 4px 10px rgba(28,37,65,0.06)" }}
                    >
                      <Avatar member={m} size={38} />
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-bold text-ink text-[14px]">{m.name}</p>
                        <p className="font-body text-grey-ink text-[12px] truncate">{m.email}</p>
                      </div>
                      <span className="font-body font-bold text-teal text-[13px] shrink-0">Add</span>
                    </button>
                  ))}
                </div>
              )}

              {q.length > 0 && matches.length === 0 && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleInviteByEmail}
                  className="mt-4 w-full h-[54px] rounded-[10px] bg-teal flex items-center justify-center"
                >
                  <span className="font-body font-bold text-white text-[16px]">Invite "{query.trim()}"</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {keyboardOpen && (
          <IOSKeyboard
            onChar={typeChar}
            onBackspace={backspace}
            onReturn={() => {
              if (matches.length > 0) {
                handleAddSuggested(matches[0]);
              } else if (q.length > 0) {
                handleInviteByEmail();
              } else {
                inputRef.current?.blur();
              }
            }}
            returnLabel="Done"
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingRemoveMember}
        title="Remove participant?"
        message={`${pendingRemoveMember?.name ?? "This person"} will be removed from the trip and from future splits.`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (pendingRemoveId) onRemoveMember(pendingRemoveId);
          setPendingRemoveId(null);
        }}
        onCancel={() => setPendingRemoveId(null)}
      />
    </div>
  );
}

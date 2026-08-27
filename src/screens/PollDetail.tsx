import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import ScreenHeader from "../components/ScreenHeader";
import AvatarStack from "../components/AvatarStack";
import Avatar from "../components/Avatar";
import checkBadge from "../assets/icons/check-badge.svg";
import { categoryMeta, type Member, type Poll } from "../store/mockData";

type PollDetailProps = {
  poll: Poll;
  participantIds: string[];
  allMembers: Record<string, Member>;
  onBack: () => void;
  onVote: (optionId: string) => void;
  onClose: () => void;
  onNudge: () => void;
};

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
      className={`bg-white rounded-[20px] p-4 ${className}`}
      style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)", ...style }}
    >
      {children}
    </div>
  );
}

export default function PollDetail({
  poll,
  participantIds,
  allMembers,
  onBack,
  onVote,
  onClose,
  onNudge,
}: PollDetailProps) {
  const [nudged, setNudged] = useState(false);
  const totalVotes = poll.options.reduce((s, o) => s + o.voterIds.length, 0);
  const maxVotes = Math.max(0, ...poll.options.map((o) => o.voterIds.length));
  const winnerId =
    poll.closed && maxVotes > 0 ? poll.options.find((o) => o.voterIds.length === maxVotes)?.id : null;

  const votedIds = new Set(poll.options.flatMap((o) => o.voterIds));
  const roster = participantIds.map((id) => allMembers[id]).filter(Boolean);
  const pendingCount = roster.filter((m) => !votedIds.has(m.id) && !m.isYou).length;
  const youMember = roster.find((m) => m.isYou);
  const youNeedToVote = !poll.closed && !!youMember && !votedIds.has(youMember.id);

  function handleNudge() {
    onNudge();
    setNudged(true);
    setTimeout(() => setNudged(false), 2200);
  }

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
        <span className="font-body font-bold text-teal text-[11px] uppercase tracking-wide bg-teal/10 px-2.5 py-1 rounded-full inline-flex items-center gap-1 mt-4">
          <span>{categoryMeta[poll.category].icon}</span>
          {categoryMeta[poll.category].label}
        </span>
        <h1 className="font-body font-bold text-ink text-[28px] leading-tight mt-2">{poll.question}</h1>
        {poll.closed && <p className="font-body text-grey-ink text-[13px] mt-1.5">Poll closed</p>}

        <div className="flex items-center gap-2.5 mt-4">
          {roster.map((m) => {
            const voted = votedIds.has(m.id);
            return (
              <div key={m.id} className="relative shrink-0" style={{ opacity: voted ? 1 : 0.4 }}>
                <Avatar member={m} size={30} ring="#FAF6EE" />
                {voted && (
                  <img
                    src={checkBadge}
                    alt=""
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full"
                    style={{ background: "#FAF6EE" }}
                  />
                )}
              </div>
            );
          })}
          <p className="font-body text-grey-ink text-[12px] ml-1">
            {votedIds.size} of {roster.length} voted
          </p>
        </div>

        {youNeedToVote && (
          <div className="mt-3 flex items-center gap-2.5">
            <span className="text-[16px]">🗳️</span>
            <span className="font-body font-bold text-coral text-[13px]">
              You haven't voted yet — pick an option below
            </span>
          </div>
        )}

        {!poll.closed && pendingCount > 0 && (
          <div className="mt-3">
            <button
              onClick={handleNudge}
              className="w-full h-11 rounded-[10px] flex items-center justify-center gap-2"
              style={{ border: "1.5px solid #0EA5A0", backgroundColor: "rgba(14,165,160,0.1)" }}
            >
              <span className="text-[15px]">🔔</span>
              <span className="font-body font-bold text-teal text-[14px]">
                Nudge {pendingCount} {pendingCount === 1 ? "person" : "people"} who haven't voted
              </span>
            </button>
            <AnimatePresence>
              {nudged && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-body font-bold text-teal text-[12px] text-center mt-2"
                >
                  🔔 Nudge sent — everyone just voted!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-5">
          {poll.options.map((option) => {
            const votes = option.voterIds.length;
            const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
            const youVoted = option.voterIds.includes("ari");
            const isWinner = option.id === winnerId;
            const voters = option.voterIds.map((id) => allMembers[id]).filter(Boolean);

            return (
              <button
                key={option.id}
                onClick={() => !poll.closed && onVote(option.id)}
                disabled={poll.closed}
                className="w-full text-left"
              >
                <Card
                  style={{
                    boxShadow: isWinner
                      ? "0 10px 24px rgba(14,165,160,0.25)"
                      : "0 10px 24px rgba(28,37,65,0.08)",
                    border: youVoted && !poll.closed ? "1.5px solid #0EA5A0" : isWinner ? "1.5px solid #0EA5A0" : "1.5px solid transparent",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-body font-bold text-ink text-[15px] flex items-center gap-1.5">
                      {option.label}
                      {isWinner && <span className="text-[13px]">🏆</span>}
                      {youVoted && !poll.closed && (
                        <span className="font-body font-bold text-[10px] text-teal uppercase tracking-wide bg-teal/10 px-2 py-0.5 rounded-full">
                          Your vote
                        </span>
                      )}
                    </p>
                    <p className="font-body font-bold text-ink text-[14px] shrink-0">
                      {votes} vote{votes === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="w-full h-2 rounded-full bg-[#EDE7DA] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "#0EA5A0" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                    />
                  </div>

                  {voters.length > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <AvatarStack members={voters} size={24} ring="#FFFFFF" />
                      <p className="font-body text-grey-ink text-[12px]">{pct}%</p>
                    </div>
                  )}
                </Card>
              </button>
            );
          })}
        </div>

        {poll.closed ? (
          <Card className="mt-5 flex items-center gap-3">
            <span className="text-[22px]">🎉</span>
            <div>
              <p className="font-body font-bold text-ink text-[15px]">
                {winnerId ? poll.options.find((o) => o.id === winnerId)?.label : "No votes cast"} won the vote
              </p>
              <p className="font-body text-grey-ink text-[13px] mt-0.5">The poll is now closed</p>
            </div>
          </Card>
        ) : (
          <button
            onClick={onClose}
            className="mt-6 w-full h-[54px] rounded-[10px] bg-teal flex items-center justify-center"
          >
            <span className="font-body font-bold text-white text-[16px]">Close poll</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

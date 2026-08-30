import { motion } from "framer-motion";
import StatusBar from "../components/StatusBar";
import restaurantPhoto from "../assets/images/RestaurantWinner.jpg";
import backArrowIcon from "../assets/icons/Back_Arrow.svg";
import type { Poll } from "../store/mockData";

type PollResultProps = {
  poll: Poll;
  participantIds: string[];
  onBack: () => void;
  onGoToItinerary: () => void;
};

export default function PollResult({ poll, participantIds, onBack, onGoToItinerary }: PollResultProps) {
  const votedCount = new Set(poll.options.flatMap((o) => o.voterIds)).size;
  const maxVotes = Math.max(0, ...poll.options.map((o) => o.voterIds.length));
  const winner = poll.options.find((o) => o.voterIds.length === maxVotes) ?? poll.options[0];

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "#FAF6EE" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <StatusBar tone="light" />

      <div className="relative w-full shrink-0" style={{ height: 340 }}>
        <img src={restaurantPhoto} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "50% 30%" }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(28,20,14,0.6) 0%, rgba(40,24,14,0.35) 40%, rgba(28,20,14,0.1) 65%, #FAF6EE 100%)",
          }}
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
            🍽️
          </div>
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10 flex flex-col items-center text-center">
        <span className="font-body font-bold text-teal text-[13px] uppercase tracking-wide bg-teal/10 px-3 py-1 rounded-full">
          🏆 Won the vote
        </span>
        <h1 className="font-heading font-normal text-ink text-[40px] leading-tight mt-3">{winner.label}</h1>
        <p className="font-body text-grey-ink text-[14px] mt-1">
          {votedCount} of {participantIds.length} vote{participantIds.length === 1 ? "" : "s"}
        </p>

        <div
          className="w-full bg-white rounded-[20px] p-4 mt-6 flex items-center gap-3"
          style={{ boxShadow: "0 10px 24px rgba(28,37,65,0.08)" }}
        >
          <span className="text-[20px] shrink-0">✅</span>
          <p className="font-body text-ink text-[14px] text-left">
            <span className="font-bold">{winner.label}</span> has been added to your itinerary for tonight's last
            dinner.
          </p>
        </div>

        <button
          onClick={onGoToItinerary}
          className="mt-8 w-full h-[54px] rounded-[10px] bg-teal flex items-center justify-center"
        >
          <span className="font-body font-bold text-white text-[16px]">Go to itinerary</span>
        </button>
      </div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import StatusBar from "../components/StatusBar";
import Dock from "../components/Dock";
import appIcon from "../assets/images/IconTripUp_DEF.webp";

type SpringboardProps = {
  onOpenApp: () => void;
};

export default function Springboard({ onOpenApp }: SpringboardProps) {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ backgroundColor: "#1C2541" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      <StatusBar tone="light" />

      <div className="absolute left-0 right-0 flex flex-col items-center" style={{ top: 380 }}>
        <button onClick={onOpenApp} className="flex flex-col items-center gap-[6px]" aria-label="Open TripUp">
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-[64px] h-[64px] flex items-center justify-center overflow-hidden"
            style={{ borderRadius: 16, backgroundColor: "#FAF6EE" }}
          >
            <img src={appIcon} alt="" className="w-full h-full object-cover" />
          </motion.div>
          <span className="font-body text-[11px] text-white/90">TripUp</span>
        </button>
      </div>

      <Dock />
    </motion.div>
  );
}

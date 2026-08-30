import { motion } from "framer-motion";
import StatusBar from "../components/StatusBar";
import logoMark from "../assets/images/Logo_Mark_Teal.webp";

type SplashProps = {
  onEnter: () => void;
};

export default function Splash({ onEnter }: SplashProps) {
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 30%, #16324a 0%, #101a30 42%, #0a1020 78%, #05070d 100%)",
      }}
      onClick={onEnter}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <StatusBar tone="light" />

      <motion.div
        layoutId="app-logo-mark"
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        <img src={logoMark} alt="TripUp" className="w-[92px] h-auto drop-shadow-[0_0_40px_rgba(14,165,160,0.45)]" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="absolute bottom-[86px] font-body text-[13px] tracking-[0.14em] uppercase text-white/40"
      >
        Tap to continue
      </motion.p>
    </motion.div>
  );
}

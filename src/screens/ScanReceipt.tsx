import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StatusBar from "../components/StatusBar";
import ScreenHeader from "../components/ScreenHeader";
import receiptPhoto from "../assets/images/skewed-receipt-card.webp";

type ScanReceiptProps = {
  onBack: () => void;
  onScanned: () => void;
};

const STEPS = ["Reading receipt…", "Detecting items…", "Matching prices…", "Almost done…"];

export default function ScanReceipt({ onBack, onScanned }: ScanReceiptProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 420);
    const doneTimer = setTimeout(() => {
      onScanned();
    }, 1900);
    return () => {
      clearInterval(stepTimer);
      clearTimeout(doneTimer);
    };
  }, [onScanned]);

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "#FAF6EE" }}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <StatusBar tone="dark" />

      <div className="px-5 pt-[64px]">
        <ScreenHeader title="Lisbon trip" onBack={onBack} />
        <h1 className="font-body font-bold text-ink text-[32px] leading-tight mt-1">Scan receipt</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 -mt-10">
        <div
          className="relative rounded-[20px] overflow-hidden"
          style={{ width: 220, height: 158, transform: "rotate(-2deg)", boxShadow: "0 20px 40px rgba(28,37,65,0.3)" }}
        >
          <img src={receiptPhoto} alt="Scanned receipt" className="w-full h-full object-cover" />
          <motion.div
            className="absolute left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(90deg, rgba(14,165,160,0) 0%, #0EA5A0 50%, rgba(14,165,160,0) 100%)" }}
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(14,165,160,0.08)" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="flex items-center gap-2 mt-7">
          <motion.div
            className="w-2 h-2 rounded-full bg-teal"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="font-body font-bold text-ink text-[15px]"
            >
              ✨ {STEPS[stepIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="w-[200px] h-[4px] rounded-full bg-[#EDE7DA] mt-5 overflow-hidden">
          <motion.div
            className="h-full bg-teal rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.85, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

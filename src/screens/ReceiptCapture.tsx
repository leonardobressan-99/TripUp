import { motion } from "framer-motion";
import StatusBar from "../components/StatusBar";
import ScreenHeader from "../components/ScreenHeader";
import receiptPhoto from "../assets/images/skewed-receipt-card.jpg";

type ReceiptCaptureProps = {
  onBack: () => void;
  onStartScanning: () => void;
  onAddManually: () => void;
};

function Corner({ top, bottom, left, right }: { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean }) {
  return (
    <div
      className="absolute w-8 h-8"
      style={{
        top: top ? 14 : undefined,
        bottom: bottom ? 14 : undefined,
        left: left ? 14 : undefined,
        right: right ? 14 : undefined,
        borderTop: top ? "3px solid #0EA5A0" : undefined,
        borderBottom: bottom ? "3px solid #0EA5A0" : undefined,
        borderLeft: left ? "3px solid #0EA5A0" : undefined,
        borderRight: right ? "3px solid #0EA5A0" : undefined,
        borderRadius:
          top && left ? "10px 0 0 0" : top && right ? "0 10px 0 0" : bottom && left ? "0 0 0 10px" : "0 0 10px 0",
      }}
    />
  );
}

export default function ReceiptCapture({ onBack, onStartScanning, onAddManually }: ReceiptCaptureProps) {
  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "#12161F" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <StatusBar tone="light" />

      <div className="px-5 pt-[64px]">
        <ScreenHeader title="Lisbon trip" onBack={onBack} dark />
        <h1 className="font-body font-bold text-white text-[28px] leading-tight mt-1">Scan receipt</h1>
      </div>

      {/* viewfinder */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-6">
        <div
          className="relative w-full overflow-hidden"
          style={{ maxWidth: 300, aspectRatio: "3 / 4", borderRadius: 24, background: "#000" }}
        >
          <img src={receiptPhoto} alt="Align receipt" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)" }} />

          <motion.div
            className="absolute left-4 right-4 h-[2px]"
            style={{ background: "linear-gradient(90deg, rgba(14,165,160,0) 0%, #0EA5A0 50%, rgba(14,165,160,0) 100%)" }}
            animate={{ top: ["18%", "82%", "18%"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />

          <Corner top left />
          <Corner top right />
          <Corner bottom left />
          <Corner bottom right />
        </div>

        <p className="font-body font-bold text-white/70 text-[13px] mt-5 text-center">
          Align the receipt within the frame
        </p>
      </div>

      {/* actions */}
      <div className="px-5 pb-10 flex flex-col gap-3">
        <button
          onClick={onStartScanning}
          className="w-full h-[54px] rounded-[10px] bg-teal flex items-center justify-center"
        >
          <span className="font-body font-bold text-white text-[16px]">📸 Start scanning</span>
        </button>
        <button
          onClick={onAddManually}
          className="w-full h-[54px] rounded-[10px] flex items-center justify-center"
          style={{ border: "1.5px solid rgba(255,255,255,0.3)" }}
        >
          <span className="font-body font-bold text-white text-[15px]">Add manually</span>
        </button>
      </div>
    </motion.div>
  );
}

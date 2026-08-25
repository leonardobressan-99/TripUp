import { motion } from "framer-motion";

function Sparkle({
  size,
  top,
  left,
  right,
  bottom,
  delay,
  color,
}: {
  size: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  delay: number;
  color: string;
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ position: "absolute", top, left, right, bottom }}
      initial={{ opacity: 0, scale: 0.3, rotate: -20 }}
      animate={{ opacity: [0, 1, 0], scale: [0.3, 1, 0.3], rotate: [-20, 10, -20] }}
      transition={{ duration: 1.8, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <path
        d="M12 0C12 6.6 12.4 8.5 13.5 9.6C14.6 10.7 16.5 11.1 24 12C16.5 12.9 14.6 13.3 13.5 14.4C12.4 15.5 12 17.4 12 24C12 17.4 11.6 15.5 10.5 14.4C9.4 13.3 7.5 12.9 0 12C7.5 11.1 9.4 10.7 10.5 9.6C11.6 8.5 12 6.6 12 0Z"
        fill={color}
      />
    </motion.svg>
  );
}

type MagicAddButtonProps = {
  onClick?: () => void;
  iconColor?: string;
  open?: boolean;
};

export default function MagicAddButton({ onClick, iconColor = "#FFFFFF", open = false }: MagicAddButtonProps) {
  return (
    <div className="relative w-[64px] h-[64px] shrink-0">
      {/* breathing magic glow */}
      <motion.div
        className="absolute -inset-2 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(14,165,160,0.55) 0%, rgba(14,165,160,0) 70%)",
          filter: "blur(6px)",
        }}
        animate={{ opacity: [0.35, 0.8, 0.35], scale: [0.92, 1.08, 0.92] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* sparkles */}
      <Sparkle size={12} top={-6} right={-4} delay={0} color="#0EA5A0" />
      <Sparkle size={8} bottom={-2} left={-6} delay={0.6} color="#FFFFFF" />
      <Sparkle size={9} top={6} left={-8} delay={1.2} color="#0EA5A0" />

      {/* glass button */}
      <button
        onClick={onClick}
        aria-label="Add"
        className="relative w-full h-full rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(165deg, #16BCB2 0%, #0EA5A0 55%, #0B8B86 100%)",
          border: "1px solid rgba(255,255,255,0.45)",
          boxShadow:
            "0 18px 30px rgba(14,165,160,0.38), 0 6px 14px rgba(28,37,65,0.18), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -10px 14px rgba(0,0,0,0.15)",
        }}
      >
        <motion.svg
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 26 }}
        >
          <path
            d="M13 3V23M3 13H23"
            stroke={iconColor}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </motion.svg>
      </button>
    </div>
  );
}

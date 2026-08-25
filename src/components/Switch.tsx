import { motion } from "framer-motion";

type SwitchProps = {
  on: boolean;
  onToggle: () => void;
};

export default function Switch({ on, onToggle }: SwitchProps) {
  return (
    <button
      onClick={onToggle}
      className="relative shrink-0"
      style={{ width: 44, height: 26, borderRadius: 999 }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ backgroundColor: on ? "#0EA5A0" : "#D9D9D9" }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="absolute top-[3px] rounded-full bg-white"
        style={{ width: 20, height: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.25)" }}
        animate={{ left: on ? 21 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />
    </button>
  );
}

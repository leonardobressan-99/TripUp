import { useState } from "react";
import { motion } from "framer-motion";

type IOSKeyboardProps = {
  onChar: (char: string) => void;
  onBackspace: () => void;
  onReturn: () => void;
  returnLabel?: string;
};

const LETTER_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

const SYMBOL_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["-", "/", ":", ";", "(", ")", "$", "&", "@", '"'],
  [".", ",", "?", "!", "'"],
];

function Key({
  children,
  onClick,
  flex = 1,
  className = "",
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  flex?: number;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      aria-label={ariaLabel}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={{ flex }}
      className={`h-[42px] rounded-[6px] bg-white flex items-center justify-center font-body text-ink text-[19px] active:bg-[#E3E5E9] ${className}`}
    >
      {children}
    </button>
  );
}

export default function IOSKeyboard({ onChar, onBackspace, onReturn, returnLabel = "return" }: IOSKeyboardProps) {
  const [shift, setShift] = useState(true);
  const [mode, setMode] = useState<"letters" | "symbols">("letters");

  function typeChar(c: string) {
    onChar(shift && mode === "letters" ? c.toUpperCase() : c);
    if (shift && mode === "letters") setShift(false);
  }

  const rows = mode === "letters" ? LETTER_ROWS : SYMBOL_ROWS;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 380, damping: 34 }}
      className="absolute left-0 right-0 bottom-0 z-50 pt-2 px-2.5"
      style={{
        backgroundColor: "#D1D3D9",
        boxShadow: "0 -1px 0 rgba(0,0,0,0.1)",
        paddingBottom: 26,
      }}
    >
      {/* predictive bar */}
      <div className="flex items-center justify-around px-2 pb-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <span className="font-body text-ink/70 text-[14px] italic">Ari</span>
        <span className="font-body text-ink text-[14px] font-bold" style={{ borderLeft: "1px solid rgba(0,0,0,0.15)", borderRight: "1px solid rgba(0,0,0,0.15)", padding: "0 14px" }}>
          "Ari"
        </span>
        <span className="font-body text-ink/70 text-[14px] italic">Ari's</span>
      </div>

      <div className="flex flex-col gap-[6px] mt-1.5">
        <div className="flex gap-[6px] px-[3px]">
          {rows[0].map((k) => (
            <Key key={k} onClick={() => typeChar(k)}>
              {k}
            </Key>
          ))}
        </div>
        <div className="flex gap-[6px] px-[20px]">
          {rows[1].map((k) => (
            <Key key={k} onClick={() => typeChar(k)}>
              {k}
            </Key>
          ))}
        </div>
        <div className="flex gap-[6px] px-[3px]">
          {mode === "letters" ? (
            <Key
              flex={1.5}
              ariaLabel="Shift"
              onClick={() => setShift((s) => !s)}
              className="!bg-[#ADB0B8]"
            >
              <span className={`text-[16px] text-white ${shift ? "opacity-100 font-bold" : "opacity-60 font-normal"}`}>⇧</span>
            </Key>
          ) : (
            <Key flex={1.5} onClick={() => {}} className="!bg-[#ADB0B8] text-white text-[15px]">
              #+=
            </Key>
          )}
          {rows[2].map((k) => (
            <Key key={k} onClick={() => typeChar(k)}>
              {k}
            </Key>
          ))}
          <Key flex={1.5} ariaLabel="Backspace" onClick={onBackspace} className="!bg-[#ADB0B8] text-white text-[16px]">
            ⌫
          </Key>
        </div>
        <div className="flex gap-[6px] px-[3px]">
          <Key
            flex={1.6}
            onClick={() => setMode((m) => (m === "letters" ? "symbols" : "letters"))}
            className="!bg-[#ADB0B8] text-white text-[12px] font-bold"
          >
            {mode === "letters" ? "123" : "ABC"}
          </Key>
          <Key flex={5.2} ariaLabel="Space" onClick={() => onChar(" ")}>
            <span className="text-[13px] text-ink/50 tracking-wide">space</span>
          </Key>
          <Key flex={2.7} ariaLabel="Return" onClick={onReturn} className="!bg-teal text-white text-[12px] font-bold">
            {returnLabel}
          </Key>
        </div>
      </div>
    </motion.div>
  );
}

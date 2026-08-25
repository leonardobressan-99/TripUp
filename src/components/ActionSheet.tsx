import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ActionSheetItem = {
  key: string;
  icon: ReactNode;
  label: string;
  onSelect: () => void;
};

type ActionSheetProps = {
  open: boolean;
  onClose: () => void;
  items: ActionSheetItem[];
};

export default function ActionSheet({ open, onClose, items }: ActionSheetProps) {
  const singleLine = items.length <= 3;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-30"
            style={{ background: "rgba(28,37,65,0.35)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute left-0 right-0 bottom-0 z-40 px-5 pt-6 pb-8"
            style={{ backgroundColor: "#FAF6EE", borderRadius: "28px 28px 0 0" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          >
            <div className="w-10 h-1.5 rounded-full bg-grey-ink/25 mx-auto mb-5" />
            {singleLine ? (
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-4">
                {items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      onClose();
                      item.onSelect();
                    }}
                    className="flex flex-col items-center gap-2 py-1"
                  >
                    <div className="w-14 h-14 flex items-center justify-center shrink-0">{item.icon}</div>
                    <span className="font-body font-bold text-ink text-[12.5px] text-center leading-tight whitespace-nowrap">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      onClose();
                      item.onSelect();
                    }}
                    className="flex flex-col items-center gap-2 py-1"
                  >
                    <div className="w-14 h-14 flex items-center justify-center shrink-0">{item.icon}</div>
                    <span className="font-body font-bold text-ink text-[12.5px] text-center leading-tight">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

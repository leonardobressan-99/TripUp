import { motion, AnimatePresence } from "framer-motion";

type InfoDialogProps = {
  open: boolean;
  title: string;
  /** Body copy. Takes nodes so callers can lay out several paragraphs. */
  children: React.ReactNode;
  dismissLabel?: string;
  onDismiss: () => void;
};

/**
 * Explains something and gets out of the way — same card, backdrop and spring
 * as ConfirmDialog, but with a single acknowledging button instead of a
 * destructive choice, so an explanation never looks like it needs a decision.
 */
export default function InfoDialog({
  open,
  title,
  children,
  dismissLabel = "Got it",
  onDismiss,
}: InfoDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-50"
            style={{ background: "rgba(28,37,65,0.35)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onDismiss}
          />
          <div className="absolute inset-0 z-50 flex items-center justify-center px-8 pointer-events-none">
            <motion.div
              className="w-full bg-white rounded-[20px] px-5 pt-5 pb-4 pointer-events-auto"
              style={{ boxShadow: "0 18px 40px rgba(28,37,65,0.25)" }}
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            >
              <p className="font-body font-bold text-ink text-[17px]">{title}</p>
              <div className="mt-2 flex flex-col gap-2.5">{children}</div>

              <button
                onClick={onDismiss}
                className="w-full h-11 rounded-[10px] bg-teal flex items-center justify-center mt-5"
              >
                <span className="font-body font-bold text-white text-[14px]">{dismissLabel}</span>
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

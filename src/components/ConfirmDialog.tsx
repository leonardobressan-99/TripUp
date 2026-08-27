import { motion, AnimatePresence } from "framer-motion";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
            onClick={onCancel}
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
              <p className="font-body text-grey-ink text-[13px] mt-1.5 leading-snug">{message}</p>

              <div className="flex gap-2.5 mt-5">
                <button
                  onClick={onCancel}
                  className="flex-1 h-11 rounded-[10px] bg-[#F0EBDD] flex items-center justify-center"
                >
                  <span className="font-body font-bold text-ink text-[14px]">{cancelLabel}</span>
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 h-11 rounded-[10px] bg-coral flex items-center justify-center"
                >
                  <span className="font-body font-bold text-white text-[14px]">{confirmLabel}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

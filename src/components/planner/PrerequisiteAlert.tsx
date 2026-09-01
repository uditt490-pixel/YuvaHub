import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface PrerequisiteAlertProps {
  message: string | null;
  onClose: () => void;
  autoCloseDuration?: number; // Optional auto-dismiss in milliseconds
}

export const PrerequisiteAlert: React.FC<PrerequisiteAlertProps> = ({
  message,
  onClose,
  autoCloseDuration,
}) => {
  React.useEffect(() => {
    if (!message || !autoCloseDuration) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseDuration);

    return () => clearTimeout(timer);
  }, [message, autoCloseDuration, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -20, x: "-50%" }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          role="alert"
          aria-live="assertive"
          className="fixed top-20 left-1/2 z-50 flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-5 py-3.5 rounded-xl shadow-xl backdrop-blur-md select-none max-w-md w-full sm:w-auto"
        >
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium leading-snug flex-1">{message}</span>
          <button
            onClick={onClose}
            aria-label="Close notification"
            className="p-1 text-amber-400/70 hover:text-amber-200 hover:bg-amber-500/20 rounded-lg transition-colors ml-2 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

import React from "react";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface PrerequisiteAlertProps {
  message: string;
  onClose: () => void;
}

export const PrerequisiteAlert: React.FC<PrerequisiteAlertProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl shadow-lg backdrop-blur-md"
    >
      <AlertCircle className="w-5 h-5 text-red-500" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 hover:text-red-300">
        &times;
      </button>
    </motion.div>
  );
};

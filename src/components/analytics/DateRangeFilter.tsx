import React from "react";
import { motion } from "framer-motion";

interface FilterProps {
  value: string;
  onChange: (val: string) => void;
}

export const DateRangeFilter: React.FC<FilterProps> = ({ value, onChange }) => {
  const options = [
    { label: "7 Days", val: "7d" },
    { label: "30 Days", val: "30d" },
    { label: "90 Days", val: "90d" },
    { label: "All Time", val: "all" },
  ];

  return (
    <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 w-max">
      {options.map((opt) => {
        const isSelected = value === opt.val;
        return (
          <button
            key={opt.val}
            onClick={() => onChange(opt.val)}
            className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isSelected ? "text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId="active-pill"
                className="absolute inset-0 bg-blue-600 rounded-md"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

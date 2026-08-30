import React from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FunnelProps {
  data: { step: string; count: number }[];
}

export const ConversionFunnel: React.FC<FunnelProps> = ({ data }) => {
  const colors = ["#3b82f6", "#8b5cf6", "#10b981"]; // Blue, Purple, Green

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-900 rounded-xl shadow-lg border border-gray-800"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Conversion Funnel</h3>
      <div className="h-64 w-full">
        {data.every((d) => d.count === 0) ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Not enough data to generate funnel.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="step" type="category" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af" }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
};

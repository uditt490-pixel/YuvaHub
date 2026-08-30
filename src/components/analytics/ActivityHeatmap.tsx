import React from "react";
import { motion } from "framer-motion";

interface HeatmapProps {
  data: { date: string; count: number }[];
}

export const ActivityHeatmap: React.FC<HeatmapProps> = ({ data }) => {
  // Simple representation of a heatmap
  // In a real implementation, you would map this to a grid of weeks/days like GitHub
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="p-4 bg-gray-900 rounded-xl shadow-lg border border-gray-800">
      <h3 className="text-lg font-semibold text-white mb-4">Activity Heatmap</h3>
      <div className="flex flex-wrap gap-1">
        {data.length === 0 ? (
          <p className="text-gray-400 text-sm">No activity recorded for this period.</p>
        ) : (
          data.map((day, i) => {
            const intensity = day.count / maxCount;
            // Generate a color from dark gray to bright blue based on intensity
            const opacity = Math.max(0.2, intensity);

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.01 }}
                className="w-4 h-4 rounded-sm bg-blue-500"
                style={{ opacity }}
                title={`${day.date}: ${day.count} events`}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

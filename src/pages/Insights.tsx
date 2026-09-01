import React, { useEffect, useState } from "react";
import { ActivityHeatmap } from "../components/analytics/ActivityHeatmap";
import { ConversionFunnel } from "../components/analytics/ConversionFunnel";
import { CategoryDonutChart } from "../components/analytics/CategoryDonutChart";
import { DateRangeFilter } from "../components/analytics/DateRangeFilter";
import { useAppContext } from "../context/AppContext";

export const Insights: React.FC = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAppContext();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // Assuming there is an apiClient or you can just fetch directly
        const token = await user?.getIdToken();
        const res = await fetch(`/api/analytics/insights?dateRange=${dateRange}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [dateRange, user]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Insights</h1>
          <p className="text-gray-500 dark:text-gray-400">Track your engagement and success on YuvaHub</p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <ActivityHeatmap data={metrics.heatmapData || []} />
          </div>
          <CategoryDonutChart data={metrics.categoryBreakdown || []} />
          <ConversionFunnel data={metrics.funnel || []} />
        </div>
      ) : (
        <p className="text-gray-500">Failed to load metrics.</p>
      )}
    </div>
  );
};

export default Insights;

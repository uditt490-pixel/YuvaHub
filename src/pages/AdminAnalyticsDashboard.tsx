import React, { useEffect, useState } from "react";
import { DateRangeFilter } from "../components/analytics/DateRangeFilter";
import { useAppContext } from "../context/AppContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const AdminAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAppContext();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const token = await user?.getIdToken();
        const res = await fetch(`/api/analytics/admin/dashboard?dateRange=${dateRange}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin metrics:", err);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400">Overview of platform engagement and active users</p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-sm font-medium text-gray-400">Total Events Captured</h3>
              <p className="text-3xl font-bold text-white mt-2">{metrics.totalEvents || 0}</p>
            </div>
            {/* Additional metric cards can go here */}
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Active Users (DAU)</h3>
            <div className="h-80 w-full">
              {metrics.dauData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.dauData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }}
                    />
                    <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-gray-500">No data available</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Failed to load platform metrics.</p>
      )}
    </div>
  );
};

export default AdminAnalyticsDashboard;

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScraperHealth } from '../../pages/ScraperHealthDashboard';
import { Activity } from 'lucide-react';

interface Props {
  sources: ScraperHealth[];
}

export const ScraperTimeSeriesChart: React.FC<Props> = ({ sources }) => {
  // Generate some display data. Ideally, this would be fetched as a time series from the backend.
  // For the dashboard overview, we can visualize the current snapshot comparison
  const data = useMemo(() => {
    return sources.map(s => ({
      name: s.name,
      successRate: s.successRate,
      responseTime: s.responseTimeMs
    }));
  }, [sources]);

  return (
    <div className="bg-surface dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          Latency Overview
        </h3>
      </div>
      
      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#93c5fd' }}
              />
              <Area 
                type="monotone" 
                dataKey="responseTime" 
                name="Latency (ms)"
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorLatency)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Waiting for telemetry data...
          </div>
        )}
      </div>
    </div>
  );
};

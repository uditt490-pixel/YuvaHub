// ═══════════════════════════════════════════════════════════════════
// Traffic Heatmap — API Traffic Visualization Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { BarChart3, Activity, Ban, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { TrafficTimeSeries, RateLimitEvent } from '../../types/rateLimiting';

interface Props { traffic: TrafficTimeSeries[]; events: RateLimitEvent[]; isLoading: boolean; }

export const TrafficHeatmap: React.FC<Props> = ({ traffic, events, isLoading }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'traffic' | 'events'>('traffic');

  if (isLoading) return <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"><div className="h-6 bg-slate-200 rounded w-48 mb-4" /><div className="h-48 bg-slate-100 rounded-xl" /></div>;

  const maxReq = Math.max(...traffic.map(t => t.requests), 1);
  const maxBlock = Math.max(...traffic.map(t => t.blocked), 1);

  const limitedEvents = events.filter(e => e.wasLimited);
  const errorEvents = events.filter(e => e.statusCode >= 400);

  const totalReqs = traffic.reduce((a, t) => a + t.requests, 0);
  const totalBlocked = traffic.reduce((a, t) => a + t.blocked, 0);
  const totalErrors = traffic.reduce((a, t) => a + t.errors, 0);
  const avgLatency = (traffic.reduce((a, t) => a + t.latency, 0) / traffic.length).toFixed(0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50"><BarChart3 className="h-5 w-5 text-indigo-600" /></div>
            <div><h3 className="text-lg font-bold text-slate-800">API Traffic</h3><p className="text-xs text-slate-500">48-hour traffic overview</p></div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-0.5">
            {(['traffic', 'events'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${viewMode === m ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'traffic' && (
        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { l: 'Total Requests', v: totalReqs.toLocaleString(), c: 'text-blue-600', icon: <Activity className="h-3.5 w-3.5" /> },
              { l: 'Total Blocked', v: totalBlocked.toLocaleString(), c: 'text-red-600', icon: <Ban className="h-3.5 w-3.5" /> },
              { l: 'Total Errors', v: totalErrors.toLocaleString(), c: 'text-amber-600', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
              { l: 'Avg Latency', v: `${avgLatency}ms`, c: 'text-indigo-600', icon: <Clock className="h-3.5 w-3.5" /> }
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className={`flex items-center gap-1 text-xs ${s.c} font-semibold`}>{s.icon}{s.l}</div>
                <div className={`text-lg font-extrabold ${s.c} mt-1`}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="relative">
            <div className="flex items-end gap-px h-48 border-b border-slate-200 pb-1">
              {traffic.map((t, i) => (
                <div key={i} className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                  <div className="w-full flex gap-px items-end" style={{ height: '100%' }}>
                    <div className="flex-1 bg-blue-400 rounded-t transition-all hover:bg-blue-500" style={{ height: `${(t.requests / maxReq) * 100}%` }} />
                    <div className="flex-1 bg-red-400 rounded-t transition-all hover:bg-red-500" style={{ height: `${(t.blocked / maxBlock) * 100}%` }} />
                  </div>
                  {hoveredBar === i && (
                    <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-xl">
                      <div className="font-bold mb-1">{new Date(t.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' })}</div>
                      <div className="text-blue-300">Requests: {t.requests}</div>
                      <div className="text-red-300">Blocked: {t.blocked}</div>
                      <div className="text-amber-300">Errors: {t.errors}</div>
                      <div className="text-indigo-300">Latency: {t.latency}ms</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-3 rounded bg-blue-400" />Requests</span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-3 rounded bg-red-400" />Blocked</span>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'events' && (
        <div className="p-6 max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {events.slice(0, 30).map(evt => (
              <div key={evt.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${evt.wasLimited ? 'bg-red-50 border border-red-200' : evt.statusCode >= 400 ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-100'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${evt.wasLimited ? 'bg-red-500' : evt.statusCode >= 400 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                <span className="font-mono text-xs text-slate-500 w-16 flex-shrink-0">{evt.method}</span>
                <span className="font-mono text-xs text-slate-700 truncate flex-1">{evt.endpoint}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.statusCode === 200 ? 'bg-emerald-100 text-emerald-700' : evt.statusCode === 429 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{evt.statusCode}</span>
                <span className="text-xs text-slate-400 hidden sm:block">{evt.responseTimeMs}ms</span>
                <span className="text-xs text-slate-400 hidden md:block">{evt.clientName}</span>
                <span className="text-[10px] text-slate-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficHeatmap;

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

  if (isLoading) return <div className="bg-surface rounded-2xl border border-border-theme p-6 animate-pulse"><div className="h-6 bg-border-theme rounded w-48 mb-4" /><div className="h-48 bg-surface-secondary rounded-xl" /></div>;

  const maxReq = Math.max(...traffic.map(t => t.requests), 1);
  const maxBlock = Math.max(...traffic.map(t => t.blocked), 1);

  const limitedEvents = events.filter(e => e.wasLimited);
  const errorEvents = events.filter(e => e.statusCode >= 400);

  const totalReqs = traffic.reduce((a, t) => a + t.requests, 0);
  const totalBlocked = traffic.reduce((a, t) => a + t.blocked, 0);
  const totalErrors = traffic.reduce((a, t) => a + t.errors, 0);
  const avgLatency = (traffic.reduce((a, t) => a + t.latency, 0) / traffic.length).toFixed(0);

  return (
    <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
      <div className="px-6 py-4 border-b border-border-theme">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20"><BarChart3 className="h-5 w-5 text-indigo-400" /></div>
            <div><h3 className="text-lg font-bold text-text-primary">API Traffic</h3><p className="text-xs text-text-muted">48-hour traffic overview</p></div>
          </div>
          <div className="flex items-center gap-1 bg-surface-secondary rounded-xl p-0.5">
            {(['traffic', 'events'] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${viewMode === m ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted'}`}>{m}</button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'traffic' && (
        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { l: 'Total Requests', v: totalReqs.toLocaleString(), c: 'text-blue-400', icon: <Activity className="h-3.5 w-3.5" /> },
              { l: 'Total Blocked', v: totalBlocked.toLocaleString(), c: 'text-red-400', icon: <Ban className="h-3.5 w-3.5" /> },
              { l: 'Total Errors', v: totalErrors.toLocaleString(), c: 'text-amber-400', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
              { l: 'Avg Latency', v: `${avgLatency}ms`, c: 'text-indigo-400', icon: <Clock className="h-3.5 w-3.5" /> }
            ].map((s, i) => (
              <div key={i} className="bg-surface rounded-xl p-3 border border-border-theme">
                <div className={`flex items-center gap-1 text-xs ${s.c} font-semibold`}>{s.icon}{s.l}</div>
                <div className={`text-lg font-extrabold ${s.c} mt-1`}>{s.v}</div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="relative">
            <div className="flex items-end gap-px h-48 border-b border-border-theme pb-1">
              {traffic.map((t, i) => (
                <div key={i} className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer" onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)}>
                  <div className="w-full flex gap-px items-end" style={{ height: '100%' }}>
                    <div className="flex-1 bg-blue-400 rounded-t transition-all hover:bg-blue-500/200" style={{ height: `${(t.requests / maxReq) * 100}%` }} />
                    <div className="flex-1 bg-red-400 rounded-t transition-all hover:bg-red-500/200" style={{ height: `${(t.blocked / maxBlock) * 100}%` }} />
                  </div>
                  {hoveredBar === i && (
                    <div className="absolute bottom-full mb-2 bg-surface-secondary text-white text-[10px] rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-xl">
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
              <span className="flex items-center gap-1.5 text-xs text-text-muted"><span className="w-3 h-3 rounded bg-blue-400" />Requests</span>
              <span className="flex items-center gap-1.5 text-xs text-text-muted"><span className="w-3 h-3 rounded bg-red-400" />Blocked</span>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'events' && (
        <div className="p-6 max-h-[400px] overflow-y-auto">
          <div className="space-y-2">
            {events.slice(0, 30).map(evt => (
              <div key={evt.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${evt.wasLimited ? 'bg-red-500/20 border border-red-500/30' : evt.statusCode >= 400 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-surface border border-border-theme'}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${evt.wasLimited ? 'bg-red-500/200' : evt.statusCode >= 400 ? 'bg-amber-500/200' : 'bg-emerald-500/200'}`} />
                <span className="font-mono text-xs text-text-muted w-16 flex-shrink-0">{evt.method}</span>
                <span className="font-mono text-xs text-text-primary truncate flex-1">{evt.endpoint}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.statusCode === 200 ? 'bg-emerald-500/200/20 text-emerald-400' : evt.statusCode === 429 ? 'bg-red-500/200/20 text-red-400' : 'bg-amber-500/200/20 text-amber-400'}`}>{evt.statusCode}</span>
                <span className="text-xs text-text-muted hidden sm:block">{evt.responseTimeMs}ms</span>
                <span className="text-xs text-text-muted hidden md:block">{evt.clientName}</span>
                <span className="text-[10px] text-text-muted">{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficHeatmap;

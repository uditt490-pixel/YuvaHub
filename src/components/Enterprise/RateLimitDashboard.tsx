// ─── Rate Limit Dashboard Component ───────────────────────────────────────────
// Rate limiting dashboard with real-time usage gauges, throttling indicators,
// per-key limits, strategy config, and burst visualization.

import React, { useState } from 'react';
import {
  Gauge, AlertTriangle, CheckCircle2, Clock, Shield, Zap, Activity,
  TrendingUp, TrendingDown, Settings, ChevronDown, ChevronUp, Info,
  RefreshCw, Timer, XCircle,
} from 'lucide-react';
import { RateLimitStatus } from '../../types/apiGateway';

interface RateLimitDashboardProps {
  statusList: RateLimitStatus[];
  isLoading: boolean;
}

function UsageGauge({ current, max, label, color }: { current: number; max: number; label: string; color: string }) {
  const pct = Math.min((current / max) * 100, 100);
  const isHigh = pct > 80;
  const isCritical = pct > 95;

  return (
    <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
        {isCritical && <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />}
      </div>
      <div className="relative">
        <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isCritical ? 'bg-red-500/200' : isHigh ? 'bg-amber-500/200' : color
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-black text-text-primary">{current.toLocaleString()}</span>
          <span className="text-xs font-bold text-text-muted">/ {max.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold ${isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : 'text-emerald-400'}`}>
            {pct.toFixed(1)}% utilized
          </span>
          <span className="text-[10px] text-text-muted font-bold">per window</span>
        </div>
      </div>
    </div>
  );
}

function UsageBar({ timestamp, requests, blocked, maxRequests }: { timestamp: string; requests: number; blocked: number; maxRequests: number }) {
  const time = new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const pct = Math.min((requests / maxRequests) * 100, 100);

  return (
    <div className="flex items-center gap-2 group">
      <span className="text-[10px] font-mono text-text-muted w-14 shrink-0">{time}</span>
      <div className="flex-1 flex items-center gap-1">
        <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-red-400' : pct > 50 ? 'bg-amber-400' : 'bg-indigo-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {blocked > 0 && (
          <span className="text-[9px] font-bold text-red-500">-{blocked}</span>
        )}
      </div>
      <span className="text-[10px] font-bold text-text-secondary w-12 text-right">{requests}</span>
    </div>
  );
}

export const RateLimitDashboard: React.FC<RateLimitDashboardProps> = ({ statusList, isLoading }) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border-theme p-4 animate-pulse">
              <div className="h-3 w-20 bg-surface-secondary rounded mb-3" />
              <div className="h-3 w-full bg-surface-secondary rounded mb-3" />
              <div className="h-6 w-24 bg-surface-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Aggregate stats
  const totalCurrent = statusList.reduce((sum, s) => sum + s.currentUsage, 0);
  const totalMax = statusList.reduce((sum, s) => sum + s.maxUsage, 0);
  const throttledCount = statusList.filter(s => s.isThrottled).length;
  const avgUtilization = totalMax > 0 ? Math.round((totalCurrent / totalMax) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            <span className="text-[10px] font-bold text-text-muted uppercase">Total Usage</span>
          </div>
          <p className="text-2xl font-black text-text-primary">{totalCurrent.toLocaleString()}</p>
          <p className="text-xs text-text-muted mt-0.5">/ {totalMax.toLocaleString()} total limit</p>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-4 w-4 text-emerald-500" />
            <span className="text-[10px] font-bold text-text-muted uppercase">Avg Utilization</span>
          </div>
          <p className={`text-2xl font-black ${avgUtilization > 80 ? 'text-red-400' : avgUtilization > 50 ? 'text-amber-400' : 'text-text-primary'}`}>
            {avgUtilization}%
          </p>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-[10px] font-bold text-text-muted uppercase">Throttled Keys</span>
          </div>
          <p className="text-2xl font-black text-red-400">{throttledCount}</p>
          <p className="text-xs text-text-muted mt-0.5">of {statusList.length} active keys</p>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <span className="text-[10px] font-bold text-text-muted uppercase">Strategy</span>
          </div>
          <p className="text-sm font-black text-text-primary">Sliding Window</p>
          <p className="text-xs text-text-muted mt-0.5">Token bucket fallback</p>
        </div>
      </div>

      {/* Per-Key Status */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">Per-Key Rate Limits</h3>

        {statusList.map(status => {
          const isExpanded = expandedKey === status.keyId;
          const pct = status.maxUsage > 0 ? (status.currentUsage / status.maxUsage) * 100 : 0;

          return (
            <div key={status.keyId} className={`bg-surface rounded-xl border overflow-hidden transition-all ${status.isThrottled ? 'border-red-500/30 shadow-red-100 shadow-md' : 'border-border-theme shadow-sm'}`}>
              {/* Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface/50 transition-colors"
                onClick={() => setExpandedKey(isExpanded ? null : status.keyId)}
              >
                <div className={`w-3 h-3 rounded-full ${status.isThrottled ? 'bg-red-500/200 animate-pulse' : pct > 80 ? 'bg-amber-500/200' : 'bg-emerald-500/200'}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-text-primary">{status.keyName}</h4>
                  <p className="text-xs text-text-muted">{status.keyId}</p>
                </div>

                {/* Usage bar inline */}
                <div className="hidden md:block w-40">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${pct > 95 ? 'bg-red-500/200' : pct > 80 ? 'bg-amber-500/200' : 'bg-emerald-500/200'}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-text-secondary w-12 text-right">{pct.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {status.isThrottled ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500/200/20 text-red-400 rounded-lg text-[10px] font-black border border-red-500/30">
                      <XCircle className="h-3 w-3" /> THROTTLED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/200/20 text-emerald-400 rounded-lg text-[10px] font-black border border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3" /> OK
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border-theme space-y-4 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-surface rounded-lg p-3">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Current Window</span>
                      <p className="text-sm font-bold text-text-primary mt-0.5">{status.currentUsage.toLocaleString()} / {status.maxUsage.toLocaleString()}</p>
                    </div>
                    <div className="bg-surface rounded-lg p-3">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Window Start</span>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{new Date(status.windowStart).toLocaleTimeString()}</p>
                    </div>
                    <div className="bg-surface rounded-lg p-3">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Window End</span>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{new Date(status.windowEnd).toLocaleTimeString()}</p>
                    </div>
                    <div className="bg-surface rounded-lg p-3">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Retry After</span>
                      <p className="text-sm font-bold text-text-primary mt-0.5">{status.retryAfterMs ? `${status.retryAfterMs / 1000}s` : 'N/A'}</p>
                    </div>
                  </div>

                  {/* Usage Chart */}
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase mb-2 block">Last 24h Usage Pattern</span>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {status.historicalUsage.map(point => (
                        <UsageBar
                          key={point.timestamp}
                          timestamp={point.timestamp}
                          requests={point.requests}
                          blocked={point.blocked}
                          maxRequests={status.maxUsage / 24}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RateLimitDashboard;

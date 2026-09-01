// ═══════════════════════════════════════════════════════════════════
// Rate Limiting Metrics Card — Dashboard Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  Activity, Shield, ShieldAlert, Ban, Clock, Zap, Globe,
  Server, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw,
  ArrowDownRight, ArrowUpRight, BarChart3, Eye
} from 'lucide-react';
import { DashboardMetrics } from '../../types/rateLimiting';

interface Props { metrics: DashboardMetrics | null; isLoading: boolean; onRefresh: () => void; }

function AnimNum({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => { let c = 0; const inc = target / 40; const t = setInterval(() => { c += inc; if (c >= target) { setVal(target); clearInterval(t); } else setVal(Math.round(c)); }, 25); return () => clearInterval(t); }, [target]);
  return <span>{val.toLocaleString()}{suffix}</span>;
}

export const RateLimitMetricsCard: React.FC<Props> = ({ metrics, isLoading, onRefresh }) => {
  if (isLoading || !metrics) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-surface rounded-2xl border border-border-theme p-5 animate-pulse"><div className="h-4 bg-border-theme rounded w-24 mb-3" /><div className="h-8 bg-border-theme rounded w-16" /></div>)}</div>;
  }

  const cards = [
    { label: 'Total Requests', value: metrics.totalRequests24h, sub: 'last 24 hours', icon: <Activity className="h-5 w-5" />, color: 'text-blue-400', bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50' },
    { label: 'Blocked', value: metrics.blockedRequests24h, sub: `${((metrics.blockedRequests24h / metrics.totalRequests24h) * 100).toFixed(2)}% of traffic`, icon: <Ban className="h-5 w-5" />, color: 'text-red-400', bg: 'bg-gradient-to-br from-red-50 to-red-100/50' },
    { label: 'Rate Limit Hits', value: metrics.rateLimitHits24h, sub: '429 responses sent', icon: <ShieldAlert className="h-5 w-5" />, color: 'text-amber-400', bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50' },
    { label: 'Active Alerts', value: metrics.activeAlerts, sub: `${metrics.criticalAlerts} critical`, icon: <AlertTriangle className="h-5 w-5" />, color: metrics.criticalAlerts > 0 ? 'text-red-400' : 'text-emerald-400', bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50' },
    { label: 'Avg Response', value: metrics.avgResponseTimeMs, suffix: 'ms', sub: 'across all endpoints', icon: <Clock className="h-5 w-5" />, color: 'text-indigo-400', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50' },
    { label: 'Block Success', value: metrics.blockSuccessRate, suffix: '%', sub: `${metrics.bandwidthSavedGB}GB saved`, icon: <Shield className="h-5 w-5" />, color: 'text-emerald-400', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">API Protection Overview</h2>
        <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface border border-border-theme rounded-lg hover:bg-surface transition-all">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`${c.bg} rounded-2xl border border-border-theme p-5 hover:shadow-md transition-all group`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-muted">{c.label}</span>
              <span className={`p-1.5 rounded-lg bg-surface/70 ${c.color} group-hover:scale-110 transition-transform`}>{c.icon}</span>
            </div>
            <div className={`text-2xl font-extrabold ${c.color} tracking-tight`}><AnimNum target={c.value} suffix={c.suffix} /></div>
            <div className="text-xs text-text-muted mt-1">{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RateLimitMetricsCard;

// ═══════════════════════════════════════════════════════════════════
// Cost Metrics Cards — Dashboard Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, TrendingDown, PiggyBank, Server,
  AlertTriangle, RefreshCw, ArrowUpRight, ArrowDownRight, Zap, BarChart3, Clock
} from 'lucide-react';
import { CostMetrics } from '../../types/costOptimization';

interface Props { metrics: CostMetrics | null; isLoading: boolean; onRefresh: () => void; }

function AnimNum({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => { let c = 0; const inc = Math.max(target / 40, 1); const t = setInterval(() => { c += inc; if (c >= target) { setVal(target); clearInterval(t); } else setVal(Math.round(c)); }, 25); return () => clearInterval(t); }, [target]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

function formatCost(n: number) { return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n.toFixed(0)}`; }

export const CostMetricsCards: React.FC<Props> = ({ metrics, isLoading, onRefresh }) => {
  if (isLoading || !metrics) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-surface rounded-2xl border border-border-theme p-5 animate-pulse"><div className="h-4 bg-border-theme rounded w-24 mb-3" /><div className="h-8 bg-border-theme rounded w-16" /></div>)}</div>;

  const spendTrend = metrics.spendChangePercent < 0;
  const cards = [
    { label: 'Spend MTD', value: formatCost(metrics.totalSpendMTD), sub: `${formatCost(metrics.totalSpendLastMonth)} last month`, icon: <DollarSign className="h-5 w-5" />, color: 'text-blue-400', bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50' },
    { label: 'Spend Change', value: `${Math.abs(metrics.spendChangePercent).toFixed(1)}%`, sub: spendTrend ? '↓ Decreased' : '↑ Increased', icon: spendTrend ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />, color: spendTrend ? 'text-emerald-400' : 'text-red-400', bg: `bg-gradient-to-br ${spendTrend ? 'from-emerald-50 to-emerald-100/50' : 'from-red-50 to-red-100/50'}` },
    { label: 'Savings Realized', value: formatCost(metrics.totalSavingsRealized), sub: `${formatCost(metrics.pendingSavings)} pending`, icon: <PiggyBank className="h-5 w-5" />, color: 'text-emerald-400', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50' },
    { label: 'Idle Resources', value: metrics.idleResources.toString(), sub: `of ${metrics.activeResources} active`, icon: <Server className="h-5 w-5" />, color: metrics.idleResources > 5 ? 'text-amber-400' : 'text-text-secondary', bg: 'bg-gradient-to-br from-amber-50 to-amber-100/50' },
    { label: 'Waste %', value: `${metrics.wastePercent}%`, sub: 'estimated waste', icon: <Zap className="h-5 w-5" />, color: metrics.wastePercent > 15 ? 'text-red-400' : 'text-emerald-400', bg: `bg-gradient-to-br ${metrics.wastePercent > 15 ? 'from-red-50 to-red-100/50' : 'from-emerald-50 to-emerald-100/50'}` },
    { label: 'Open Alerts', value: metrics.openAlerts.toString(), sub: `${metrics.criticalAlerts} critical`, icon: <AlertTriangle className="h-5 w-5" />, color: metrics.openAlerts > 0 ? 'text-orange-400' : 'text-emerald-400', bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">Cloud Spend Overview</h2>
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
            <div className={`text-2xl font-extrabold ${c.color} tracking-tight`}>{c.value}</div>
            <div className="text-xs text-text-muted mt-1">{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostMetricsCards;

// ═══════════════════════════════════════════════════════════════════
// Fraud Risk Score Card — Dashboard Metrics Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, TrendingUp, TrendingDown, Zap,
  DollarSign, AlertTriangle, Clock, Activity, Target, RefreshCw,
  ArrowUpRight, ArrowDownRight, Eye, Ban, CheckCircle2, BarChart3
} from 'lucide-react';
import { DashboardMetrics } from '../../types/fraudDetection';

interface Props {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const FraudRiskScoreCard: React.FC<Props> = ({ metrics, isLoading, onRefresh }) => {
  const [animScore, setAnimScore] = useState(0);

  useEffect(() => {
    if (metrics) {
      let cur = 0; const target = Math.round(100 - metrics.fraudRate);
      const timer = setInterval(() => { cur += 2; if (cur >= target) { setAnimScore(target); clearInterval(timer); } else setAnimScore(cur); }, 20);
      return () => clearInterval(timer);
    }
  }, [metrics]);

  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border-theme p-5 animate-pulse">
            <div className="h-4 bg-border-theme rounded w-24 mb-3" /><div className="h-8 bg-border-theme rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const scoreColor = animScore >= 97 ? 'text-emerald-400' : animScore >= 90 ? 'text-amber-400' : 'text-red-400';
  const scoreRing = animScore >= 97 ? '#10b981' : animScore >= 90 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 36;

  const cards = [
    {
      label: 'System Accuracy', custom: (
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#e2e8f0" strokeWidth="5" />
              <circle cx="40" cy="40" r="36" fill="none" stroke={scoreRing} strokeWidth="5"
                strokeDasharray={`${(animScore / 100) * circumference} ${circumference}`} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-lg font-extrabold ${scoreColor}`}>{animScore}%</span>
          </div>
          <div><div className="text-xs text-text-muted">System Accuracy</div><div className={`text-xs font-semibold ${scoreColor}`}>{animScore >= 97 ? 'Excellent' : animScore >= 90 ? 'Good' : 'Needs Attention'}</div></div>
        </div>
      ), color: 'text-indigo-400', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50'
    },
    {
      label: 'Transactions (24h)', value: metrics.totalTransactions24h.toLocaleString(),
      sub: `${metrics.flaggedTransactions24h} flagged`, icon: <Activity className="h-5 w-5" />, color: 'text-blue-400', bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50'
    },
    {
      label: 'Blocked', value: metrics.blockedTransactions24h,
      sub: `₹${(metrics.blockedAmount24h / 1000).toFixed(0)}K saved`, icon: <Ban className="h-5 w-5" />, color: 'text-red-400', bg: 'bg-gradient-to-br from-red-50 to-red-100/50'
    },
    {
      label: 'Active Alerts', value: metrics.activeAlerts,
      sub: `${metrics.criticalAlerts} critical`, icon: <AlertTriangle className="h-5 w-5" />, color: metrics.criticalAlerts > 0 ? 'text-orange-400' : 'text-emerald-400', bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50'
    },
    {
      label: 'Avg Risk Score', value: metrics.avgRiskScore.toFixed(1),
      sub: metrics.avgRiskScore < 30 ? 'Low risk' : 'Moderate risk', icon: <ShieldAlert className="h-5 w-5" />, color: metrics.avgRiskScore < 30 ? 'text-emerald-400' : 'text-amber-400', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50'
    },
    {
      label: 'Volume (24h)', value: `₹${(metrics.totalVolume24h / 100000).toFixed(1)}L`,
      sub: `Fraud rate: ${metrics.fraudRate}%`, icon: <DollarSign className="h-5 w-5" />, color: 'text-violet-600', bg: 'bg-gradient-to-br from-violet-50 to-violet-100/50'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">Fraud Detection Overview</h2>
        <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface border border-border-theme rounded-lg hover:bg-surface transition-all">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className={`${card.bg} rounded-2xl border border-border-theme p-5 hover:shadow-md transition-all group`}>
            {card.custom || (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text-muted">{card.label}</span>
                  <span className={`p-1.5 rounded-lg bg-surface/70 ${card.color} group-hover:scale-110 transition-transform`}>{card.icon}</span>
                </div>
                <div className={`text-2xl font-extrabold ${card.color} tracking-tight`}>{card.value}</div>
                <div className="text-xs text-text-muted mt-1">{card.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FraudRiskScoreCard;

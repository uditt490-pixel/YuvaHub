// ═══════════════════════════════════════════════════════════════════
// Anomaly Detection Panel — User Risk Profiles Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, User, MapPin, Smartphone, Clock,
  AlertTriangle, ChevronDown, ChevronRight, TrendingUp, TrendingDown,
  Activity, Globe, CreditCard, BarChart3, Eye, CheckCircle2
} from 'lucide-react';
import { UserRiskProfile, RiskLevel } from '../../types/fraudDetection';

interface Props {
  profiles: UserRiskProfile[];
  isLoading: boolean;
}

const RISK_CONFIG: Record<RiskLevel, { bg: string; text: string; border: string; color: string; label: string }> = {
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', color: '#ef4444', label: 'Critical' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', color: '#f97316', label: 'High' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', color: '#f59e0b', label: 'Medium' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', color: '#3b82f6', label: 'Low' },
  minimal: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', color: '#10b981', label: 'Minimal' }
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80, h = 24, padding = 2;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * (w - 2 * padding) + padding},${h - padding - ((v - min) / range) * (h - 2 * padding)}`).join(' ');
  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function formatMoney(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export const AnomalyDetectionPanel: React.FC<Props> = ({ profiles, isLoading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'risk' | 'flagged' | 'amount'>('risk');

  const sorted = [...profiles].sort((a, b) => {
    if (sortBy === 'risk') return b.overallRiskScore - a.overallRiskScore;
    if (sortBy === 'flagged') return b.flaggedTransactions - a.flaggedTransactions;
    return b.totalAmount30d - a.totalAmount30d;
  });

  if (isLoading) {
    return <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"><div className="h-6 bg-slate-200 rounded w-48 mb-4" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl mb-3" />)}</div>;
  }

  const criticalUsers = profiles.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-50"><ShieldAlert className="h-5 w-5 text-orange-600" /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Anomaly Detection</h3>
              <p className="text-xs text-slate-500">{profiles.length} users · {criticalUsers} high-risk</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-0.5">
            {(['risk', 'flagged', 'amount'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${sortBy === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {s === 'risk' ? 'Risk Score' : s === 'flagged' ? 'Flagged Txns' : 'Total Volume'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="divide-y divide-slate-50 max-h-[700px] overflow-y-auto">
        {sorted.map(user => {
          const cfg = RISK_CONFIG[user.riskLevel];
          const isExpanded = expandedId === user.userId;
          const trend = user.trendScores;
          const trendDir = trend[trend.length - 1] > trend[0] ? 'up' : 'down';

          return (
            <div key={user.userId} className={`transition-all ${isExpanded ? cfg.bg : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-4 px-6 py-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : user.userId)}>
                {/* Risk Score Ring */}
                <div className="relative w-12 h-12 flex-shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke={cfg.color} strokeWidth="3"
                      strokeDasharray={`${(user.overallRiskScore / 100) * 125.66} 125.66`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: cfg.color }}>
                    {Math.round(user.overallRiskScore)}
                  </span>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{user.userName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                    {!user.kycVerified && <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-bold">No KYC</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{user.totalTransactions} txns</span>
                    <span>{user.flaggedTransactions} flagged</span>
                    <span>{user.devicesUsed} devices</span>
                    <span>{user.countriesAccessed.length} countries</span>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="hidden sm:block">
                  <Sparkline data={trend} color={cfg.color} />
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-slate-700">{formatMoney(user.totalAmount30d)}</div>
                  <div className="text-[10px] text-slate-400">30d volume</div>
                </div>

                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-6 pb-5 space-y-4">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Avg Transaction', value: formatMoney(user.averageTransactionAmount) },
                      { label: 'Max Single', value: formatMoney(user.maxSingleTransaction) },
                      { label: 'Account Age', value: `${user.accountAge} days` },
                      { label: 'Prev Incidents', value: user.previousIncidents.toString() }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 border border-slate-200">
                        <div className="text-[10px] text-slate-400">{stat.label}</div>
                        <div className="text-sm font-bold text-slate-700">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Location & Device Info */}
                  <div className="flex flex-wrap gap-2">
                    {user.countriesAccessed.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                        <Globe className="h-3 w-3" />{c}
                      </span>
                    ))}
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-600">
                      <Smartphone className="h-3 w-3" />{user.devicesUsed} devices
                    </span>
                  </div>

                  {/* Risk Factors */}
                  {user.riskFactors.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Risk Factors</h5>
                      <div className="space-y-1.5">
                        {user.riskFactors.map(rf => (
                          <div key={rf.id} className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                              rf.status === 'active' ? 'bg-red-100 text-red-700' : rf.status === 'mitigated' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>{rf.status}</span>
                            <span className="text-slate-500 capitalize">{rf.category}</span>
                            <span className="flex-1 text-slate-700">{rf.description}</span>
                            <span className="font-mono font-semibold text-slate-500">{rf.impact}pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnomalyDetectionPanel;

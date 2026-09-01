// ═══════════════════════════════════════════════════════════════════
// Compliance Metrics Card — Dashboard Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, ShieldAlert, Shield, CheckCircle2, XCircle,
  AlertTriangle, RefreshCw, FileText, Clock, Activity, Eye
} from 'lucide-react';
import { ComplianceMetrics } from '../../types/complianceAudit';

interface Props { metrics: ComplianceMetrics | null; isLoading: boolean; onRefresh: () => void; }

export const ComplianceMetricsCard: React.FC<Props> = ({ metrics, isLoading, onRefresh }) => {
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => { if (metrics) { let c = 0; const t = setInterval(() => { c += 2; if (c >= metrics.overallScore) { setAnimScore(metrics.overallScore); clearInterval(t); } else setAnimScore(c); }, 20); return () => clearInterval(t); } }, [metrics]);

  if (isLoading || !metrics) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-surface rounded-2xl border border-border-theme p-5 animate-pulse"><div className="h-4 bg-border-theme rounded w-24 mb-3" /><div className="h-8 bg-border-theme rounded w-16" /></div>)}</div>;

  const scoreColor = animScore >= 90 ? 'text-emerald-400' : animScore >= 75 ? 'text-amber-400' : 'text-red-400';
  const scoreRing = animScore >= 90 ? '#10b981' : animScore >= 75 ? '#f59e0b' : '#ef4444';
  const circ = 2 * Math.PI * 36;

  const cards = [
    {
      label: 'Compliance Score', custom: (
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="#e2e8f0" strokeWidth="5" />
              <circle cx="40" cy="40" r="36" fill="none" stroke={scoreRing} strokeWidth="5" strokeDasharray={`${(animScore / 100) * circ} ${circ}`} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-lg font-extrabold ${scoreColor}`}>{animScore.toFixed(0)}%</span>
          </div>
          <div><div className="text-xs text-text-muted">Overall Score</div><div className={`text-xs font-semibold ${scoreColor}`}>{animScore >= 90 ? 'Compliant' : animScore >= 75 ? 'At Risk' : 'Action Needed'}</div></div>
        </div>
      ), color: 'text-indigo-400', bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50'
    },
    { label: 'Compliant', value: metrics.compliantCount, sub: `of ${metrics.totalRequirements}`, icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-emerald-400', bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50' },
    { label: 'Non-Compliant', value: metrics.nonCompliantCount, sub: 'needs remediation', icon: <XCircle className="h-5 w-5" />, color: 'text-red-400', bg: 'bg-gradient-to-br from-red-50 to-red-100/50' },
    { label: 'Active Audits', value: metrics.activeAudits, sub: `${metrics.completedAudits} completed`, icon: <Eye className="h-5 w-5" />, color: 'text-blue-400', bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50' },
    { label: 'Open Alerts', value: metrics.openAlerts, sub: `${metrics.criticalAlerts} critical`, icon: <AlertTriangle className="h-5 w-5" />, color: metrics.openAlerts > 0 ? 'text-orange-400' : 'text-emerald-400', bg: 'bg-gradient-to-br from-orange-50 to-orange-100/50' },
    { label: 'Documents', value: metrics.documentsCurrent, sub: `${metrics.documentsOutdated} outdated`, icon: <FileText className="h-5 w-5" />, color: 'text-violet-600', bg: 'bg-gradient-to-br from-violet-50 to-violet-100/50' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">Compliance Overview</h2>
        <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary bg-surface border border-border-theme rounded-lg hover:bg-surface transition-all">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <div key={i} className={`${c.bg} rounded-2xl border border-border-theme p-5 hover:shadow-md transition-all group`}>
            {c.custom || (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-text-muted">{c.label}</span>
                  <span className={`p-1.5 rounded-lg bg-surface/70 ${c.color} group-hover:scale-110 transition-transform`}>{c.icon}</span>
                </div>
                <div className={`text-2xl font-extrabold ${c.color} tracking-tight`}>{c.value}</div>
                <div className="text-xs text-text-muted mt-1">{c.sub}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceMetricsCard;

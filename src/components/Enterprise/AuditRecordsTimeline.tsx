// ═══════════════════════════════════════════════════════════════════
// Audit Records Timeline — Component
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { Eye, CheckCircle2, Clock, AlertTriangle, XCircle, Calendar, User, Target } from 'lucide-react';
import { AuditRecord, AuditStatus } from '../../types/complianceAudit';

interface Props { audits: AuditRecord[]; isLoading: boolean; }

const STATUS_CONFIG: Record<AuditStatus, { bg: string; text: string; icon: React.ReactNode; color: string }> = {
  scheduled: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Calendar className="h-3.5 w-3.5" />, color: 'bg-blue-500/200' },
  in_progress: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <Eye className="h-3.5 w-3.5" />, color: 'bg-amber-500/200' },
  completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'bg-emerald-500/200' },
  failed: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle className="h-3.5 w-3.5" />, color: 'bg-red-500/200' },
  remediation: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: <AlertTriangle className="h-3.5 w-3.5" />, color: 'bg-orange-500/200' }
};

export const AuditRecordsTimeline: React.FC<Props> = ({ audits, isLoading }) => {
  if (isLoading) return <div className="bg-surface rounded-2xl border border-border-theme p-6 animate-pulse"><div className="h-6 bg-border-theme rounded w-48 mb-4" />{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-surface-secondary rounded-xl mb-3" />)}</div>;

  return (
    <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
      <div className="px-6 py-4 border-b border-border-theme">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20"><Eye className="h-5 w-5 text-emerald-400" /></div>
          <div><h3 className="text-lg font-bold text-text-primary">Audit Records</h3><p className="text-xs text-text-muted">{audits.length} audits · {audits.filter(a => a.status === 'completed').length} completed</p></div>
        </div>
      </div>
      <div className="p-6">
        <div className="relative pl-6">
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border-theme" />
          {audits.map((audit, idx) => {
            const sc = STATUS_CONFIG[audit.status];
            return (
              <div key={audit.id} className="relative mb-6 last:mb-0">
                <div className={`absolute -left-3.5 top-2 w-3 h-3 rounded-full ${sc.color} ring-2 ring-white`} />
                <div className={`rounded-xl border p-5 transition-all ${audit.status === 'in_progress' ? `${sc.bg} ${sc.text.replace('text-', 'border-').replace('-700', '-200')}` : 'border-border-theme hover:border-border-theme'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${sc.bg} ${sc.text} flex items-center gap-1`}>{sc.icon} {audit.status.replace(/_/g, ' ')}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/200/20 text-indigo-400">{audit.framework}</span>
                    </div>
                    <span className="text-xs text-text-muted">{new Date(audit.startDate).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-base font-bold text-text-primary mb-1">{audit.title}</h4>
                  <p className="text-xs text-text-muted mb-3">{audit.scope}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-surface rounded-lg p-2.5 border border-border-theme"><div className="text-[10px] text-text-muted">Auditor</div><div className="text-xs font-semibold text-text-primary flex items-center gap-1"><User className="h-3 w-3" />{audit.auditor}</div></div>
                    <div className="bg-surface rounded-lg p-2.5 border border-border-theme"><div className="text-[10px] text-text-muted">Findings</div><div className={`text-xs font-bold ${audit.criticalFindings > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{audit.findings} total · {audit.criticalFindings} critical</div></div>
                    <div className="bg-surface rounded-lg p-2.5 border border-border-theme"><div className="text-[10px] text-text-muted">Pass Rate</div><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-surface-secondary rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${audit.passRate}%`, backgroundColor: audit.passRate >= 90 ? '#10b981' : audit.passRate >= 70 ? '#f59e0b' : '#ef4444' }} /></div><span className="text-xs font-bold text-text-primary">{audit.passRate.toFixed(0)}%</span></div></div>
                    <div className="bg-surface rounded-lg p-2.5 border border-border-theme"><div className="text-[10px] text-text-muted">End Date</div><div className="text-xs font-semibold text-text-primary">{audit.endDate ? new Date(audit.endDate).toLocaleDateString() : 'Ongoing'}</div></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AuditRecordsTimeline;

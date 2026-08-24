// ═══════════════════════════════════════════════════════════════════
// Audit Records Timeline — Component
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { Eye, CheckCircle2, Clock, AlertTriangle, XCircle, Calendar, User, Target } from 'lucide-react';
import { AuditRecord, AuditStatus } from '../../types/complianceAudit';

interface Props { audits: AuditRecord[]; isLoading: boolean; }

const STATUS_CONFIG: Record<AuditStatus, { bg: string; text: string; icon: React.ReactNode; color: string }> = {
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Calendar className="h-3.5 w-3.5" />, color: 'bg-blue-500' },
  in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Eye className="h-3.5 w-3.5" />, color: 'bg-amber-500' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'bg-emerald-500' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle className="h-3.5 w-3.5" />, color: 'bg-red-500' },
  remediation: { bg: 'bg-orange-50', text: 'text-orange-700', icon: <AlertTriangle className="h-3.5 w-3.5" />, color: 'bg-orange-500' }
};

export const AuditRecordsTimeline: React.FC<Props> = ({ audits, isLoading }) => {
  if (isLoading) return <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"><div className="h-6 bg-slate-200 rounded w-48 mb-4" />{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl mb-3" />)}</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50"><Eye className="h-5 w-5 text-emerald-600" /></div>
          <div><h3 className="text-lg font-bold text-slate-800">Audit Records</h3><p className="text-xs text-slate-500">{audits.length} audits · {audits.filter(a => a.status === 'completed').length} completed</p></div>
        </div>
      </div>
      <div className="p-6">
        <div className="relative pl-6">
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-200" />
          {audits.map((audit, idx) => {
            const sc = STATUS_CONFIG[audit.status];
            return (
              <div key={audit.id} className="relative mb-6 last:mb-0">
                <div className={`absolute -left-3.5 top-2 w-3 h-3 rounded-full ${sc.color} ring-2 ring-white`} />
                <div className={`rounded-xl border p-5 transition-all ${audit.status === 'in_progress' ? `${sc.bg} ${sc.text.replace('text-', 'border-').replace('-700', '-200')}` : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${sc.bg} ${sc.text} flex items-center gap-1`}>{sc.icon} {audit.status.replace(/_/g, ' ')}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">{audit.framework}</span>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(audit.startDate).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1">{audit.title}</h4>
                  <p className="text-xs text-slate-500 mb-3">{audit.scope}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-lg p-2.5 border border-slate-200"><div className="text-[10px] text-slate-400">Auditor</div><div className="text-xs font-semibold text-slate-700 flex items-center gap-1"><User className="h-3 w-3" />{audit.auditor}</div></div>
                    <div className="bg-white rounded-lg p-2.5 border border-slate-200"><div className="text-[10px] text-slate-400">Findings</div><div className={`text-xs font-bold ${audit.criticalFindings > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{audit.findings} total · {audit.criticalFindings} critical</div></div>
                    <div className="bg-white rounded-lg p-2.5 border border-slate-200"><div className="text-[10px] text-slate-400">Pass Rate</div><div className="flex items-center gap-2"><div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${audit.passRate}%`, backgroundColor: audit.passRate >= 90 ? '#10b981' : audit.passRate >= 70 ? '#f59e0b' : '#ef4444' }} /></div><span className="text-xs font-bold text-slate-700">{audit.passRate.toFixed(0)}%</span></div></div>
                    <div className="bg-white rounded-lg p-2.5 border border-slate-200"><div className="text-[10px] text-slate-400">End Date</div><div className="text-xs font-semibold text-slate-700">{audit.endDate ? new Date(audit.endDate).toLocaleDateString() : 'Ongoing'}</div></div>
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

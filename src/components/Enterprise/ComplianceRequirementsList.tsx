// ═══════════════════════════════════════════════════════════════════
// Compliance Requirements List — Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, Clock, Search, Shield,
  ChevronDown, FileText, User, Calendar
} from 'lucide-react';
import { ComplianceRequirement, ComplianceFramework, ComplianceStatus, RiskRating } from '../../types/complianceAudit';

interface Props { requirements: ComplianceRequirement[]; isLoading: boolean; }

const STATUS_CONFIG: Record<ComplianceStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  compliant: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  non_compliant: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <XCircle className="h-3.5 w-3.5" /> },
  partially_compliant: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  in_progress: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Clock className="h-3.5 w-3.5" /> },
  not_applicable: { bg: 'bg-surface', text: 'text-text-muted', icon: <Shield className="h-3.5 w-3.5" /> }
};

const RISK_CONFIG: Record<RiskRating, { bg: string; text: string }> = {
  critical: { bg: 'bg-red-500/200/20', text: 'text-red-400' },
  high: { bg: 'bg-orange-500/200/20', text: 'text-orange-400' },
  medium: { bg: 'bg-amber-500/200/20', text: 'text-amber-400' },
  low: { bg: 'bg-blue-500/200/20', text: 'text-blue-400' },
  informational: { bg: 'bg-surface-secondary', text: 'text-text-secondary' }
};

export const ComplianceRequirementsList: React.FC<Props> = ({ requirements, isLoading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fwFilter, setFwFilter] = useState<ComplianceFramework | 'all'>('all');
  const [stFilter, setStFilter] = useState<ComplianceStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = requirements.filter(r => {
    if (fwFilter !== 'all' && r.framework !== fwFilter) return false;
    if (stFilter !== 'all' && r.status !== stFilter) return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.controlId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading) return <div className="bg-surface rounded-2xl border border-border-theme p-6 animate-pulse"><div className="h-6 bg-border-theme rounded w-48 mb-4" />{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-surface-secondary rounded-xl mb-3" />)}</div>;

  return (
    <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
      <div className="px-6 py-4 border-b border-border-theme">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20"><Shield className="h-5 w-5 text-indigo-400" /></div>
            <div><h3 className="text-lg font-bold text-text-primary">Requirements</h3><p className="text-xs text-text-muted">{filtered.length} of {requirements.length} controls</p></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input type="text" placeholder="Search controls..." className="w-full pl-9 pr-4 py-2 bg-surface border border-border-theme rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="px-3 py-2 bg-surface border border-border-theme rounded-xl text-xs font-medium text-text-secondary" value={fwFilter} onChange={e => setFwFilter(e.target.value as ComplianceFramework | 'all')}>
            <option value="all">All Frameworks</option>
            {(['SOC2','GDPR','HIPAA','PCI_DSS','ISO27001','NIST','CCPA','FERPA'] as ComplianceFramework[]).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="px-3 py-2 bg-surface border border-border-theme rounded-xl text-xs font-medium text-text-secondary" value={stFilter} onChange={e => setStFilter(e.target.value as ComplianceStatus | 'all')}>
            <option value="all">All Status</option>
            {(['compliant','non_compliant','partially_compliant','in_progress','not_applicable'] as ComplianceStatus[]).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>
      <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
        {filtered.map(req => {
          const sc = STATUS_CONFIG[req.status];
          const rc = RISK_CONFIG[req.riskRating];
          const isExpanded = expandedId === req.id;
          return (
            <div key={req.id} className={`transition-all ${isExpanded ? 'bg-surface' : 'hover:bg-surface/50'}`}>
              <div className="flex items-center gap-4 px-6 py-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : req.id)}>
                <div className={`p-2 rounded-xl ${sc.bg} ${sc.text} flex-shrink-0`}>{sc.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-text-primary truncate">{req.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/200/20 text-indigo-400">{req.framework}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rc.bg} ${rc.text}`}>{req.riskRating}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="font-mono">{req.controlId}</span>
                    <span>{req.evidenceCount} evidence</span>
                    <span>Owner: {req.owner}</span>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-text-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isExpanded && (
                <div className="px-6 pb-5 space-y-3">
                  <p className="text-sm text-text-secondary">{req.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Last Assessed</div><div className="text-xs font-bold text-text-primary">{new Date(req.lastAssessed).toLocaleDateString()}</div></div>
                    <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Next Assessment</div><div className="text-xs font-bold text-text-primary">{new Date(req.nextAssessment).toLocaleDateString()}</div></div>
                    <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Evidence</div><div className="text-xs font-bold text-text-primary">{req.evidenceCount} documents</div></div>
                    <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Status</div><div className={`text-xs font-bold capitalize ${sc.text}`}>{req.status.replace(/_/g, ' ')}</div></div>
                  </div>
                  {req.notes && <div className="px-3 py-2 bg-amber-500/20 rounded-lg border border-amber-500/30 text-xs text-amber-400 font-medium">📌 {req.notes}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComplianceRequirementsList;

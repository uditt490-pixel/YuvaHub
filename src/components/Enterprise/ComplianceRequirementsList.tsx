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
  compliant: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  non_compliant: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircle className="h-3.5 w-3.5" /> },
  partially_compliant: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  in_progress: { bg: 'bg-blue-50', text: 'text-blue-700', icon: <Clock className="h-3.5 w-3.5" /> },
  not_applicable: { bg: 'bg-slate-50', text: 'text-slate-500', icon: <Shield className="h-3.5 w-3.5" /> }
};

const RISK_CONFIG: Record<RiskRating, { bg: string; text: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700' },
  informational: { bg: 'bg-slate-100', text: 'text-slate-600' }
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

  if (isLoading) return <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"><div className="h-6 bg-slate-200 rounded w-48 mb-4" />{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl mb-3" />)}</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50"><Shield className="h-5 w-5 text-indigo-600" /></div>
            <div><h3 className="text-lg font-bold text-slate-800">Requirements</h3><p className="text-xs text-slate-500">{filtered.length} of {requirements.length} controls</p></div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search controls..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600" value={fwFilter} onChange={e => setFwFilter(e.target.value as ComplianceFramework | 'all')}>
            <option value="all">All Frameworks</option>
            {(['SOC2','GDPR','HIPAA','PCI_DSS','ISO27001','NIST','CCPA','FERPA'] as ComplianceFramework[]).map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600" value={stFilter} onChange={e => setStFilter(e.target.value as ComplianceStatus | 'all')}>
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
            <div key={req.id} className={`transition-all ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
              <div className="flex items-center gap-4 px-6 py-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : req.id)}>
                <div className={`p-2 rounded-xl ${sc.bg} ${sc.text} flex-shrink-0`}>{sc.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{req.title}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">{req.framework}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rc.bg} ${rc.text}`}>{req.riskRating}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="font-mono">{req.controlId}</span>
                    <span>{req.evidenceCount} evidence</span>
                    <span>Owner: {req.owner}</span>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isExpanded && (
                <div className="px-6 pb-5 space-y-3">
                  <p className="text-sm text-slate-600">{req.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-400">Last Assessed</div><div className="text-xs font-bold text-slate-700">{new Date(req.lastAssessed).toLocaleDateString()}</div></div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-400">Next Assessment</div><div className="text-xs font-bold text-slate-700">{new Date(req.nextAssessment).toLocaleDateString()}</div></div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-400">Evidence</div><div className="text-xs font-bold text-slate-700">{req.evidenceCount} documents</div></div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-400">Status</div><div className={`text-xs font-bold capitalize ${sc.text}`}>{req.status.replace(/_/g, ' ')}</div></div>
                  </div>
                  {req.notes && <div className="px-3 py-2 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-700 font-medium">📌 {req.notes}</div>}
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

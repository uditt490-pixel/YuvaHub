// ═══════════════════════════════════════════════════════════════════
// Compliance Documents Manager — Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  FileText, File, FileCheck, FileClock, Archive, Clock,
  ChevronDown, User, Calendar, Shield
} from 'lucide-react';
import { ComplianceDocument, ComplianceFramework } from '../../types/complianceAudit';

interface Props { documents: ComplianceDocument[]; isLoading: boolean; }

const STATUS_CONFIG = {
  current: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <FileCheck className="h-3.5 w-3.5" /> },
  outdated: { bg: 'bg-red-50', text: 'text-red-700', icon: <FileClock className="h-3.5 w-3.5" /> },
  draft: { bg: 'bg-blue-50', text: 'text-blue-700', icon: <File className="h-3.5 w-3.5" /> },
  archived: { bg: 'bg-slate-50', text: 'text-slate-500', icon: <Archive className="h-3.5 w-3.5" /> }
} as const;

const TYPE_CONFIG = {
  policy: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  procedure: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  evidence: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  report: { bg: 'bg-amber-100', text: 'text-amber-700' },
  risk_assessment: { bg: 'bg-red-100', text: 'text-red-700' }
} as const;

export const ComplianceDocumentsManager: React.FC<Props> = ({ documents, isLoading }) => {
  const [fwFilter, setFwFilter] = useState<ComplianceFramework | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = documents.filter(d => {
    if (fwFilter !== 'all' && d.framework !== fwFilter) return false;
    if (typeFilter !== 'all' && d.type !== typeFilter) return false;
    return true;
  });

  if (isLoading) return <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"><div className="h-6 bg-slate-200 rounded w-48 mb-4" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl mb-3" />)}</div>;

  const grouped = filtered.reduce((acc, doc) => {
    if (!acc[doc.framework]) acc[doc.framework] = [];
    acc[doc.framework].push(doc);
    return acc;
  }, {} as Record<ComplianceFramework, ComplianceDocument[]>);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-50"><FileText className="h-5 w-5 text-violet-600" /></div>
            <div><h3 className="text-lg font-bold text-slate-800">Documents</h3><p className="text-xs text-slate-500">{filtered.length} documents · {documents.filter(d => d.status === 'outdated').length} outdated</p></div>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600" value={fwFilter} onChange={e => setFwFilter(e.target.value as ComplianceFramework | 'all')}>
              <option value="all">All Frameworks</option>
              {(['SOC2','GDPR','HIPAA','PCI_DSS','ISO27001','NIST','CCPA','FERPA'] as ComplianceFramework[]).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {(['policy','procedure','evidence','report','risk_assessment']).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {Object.entries(grouped).map(([fw, docs]) => (
          <div key={fw}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />{fw} ({docs.length})
            </h4>
            <div className="space-y-2">
              {docs.map(doc => {
                const stCfg = STATUS_CONFIG[doc.status];
                const tpCfg = TYPE_CONFIG[doc.type];
                const isExpiring = doc.expiresAt && new Date(doc.expiresAt) < new Date();
                return (
                  <div key={doc.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm ${isExpiring ? 'border-red-200 bg-red-50/30' : 'border-slate-200 hover:border-slate-300'}`}>
                    <div className={`p-2 rounded-lg ${stCfg.bg} ${stCfg.text} flex-shrink-0`}>{stCfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h5 className="text-sm font-semibold text-slate-800 truncate">{doc.name}</h5>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tpCfg.bg} ${tpCfg.text}`}>{doc.type.replace(/_/g, ' ')}</span>
                        {isExpiring && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">EXPIRED</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{doc.owner}</span>
                        <span>{doc.version}</span>
                        <span>{doc.size}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(doc.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${stCfg.bg} ${stCfg.text} flex-shrink-0`}>{doc.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceDocumentsManager;

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
  current: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <FileCheck className="h-3.5 w-3.5" /> },
  outdated: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <FileClock className="h-3.5 w-3.5" /> },
  draft: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <File className="h-3.5 w-3.5" /> },
  archived: { bg: 'bg-surface', text: 'text-text-muted', icon: <Archive className="h-3.5 w-3.5" /> }
} as const;

const TYPE_CONFIG = {
  policy: { bg: 'bg-indigo-500/200/20', text: 'text-indigo-400' },
  procedure: { bg: 'bg-cyan-500/200/20', text: 'text-cyan-400' },
  evidence: { bg: 'bg-emerald-500/200/20', text: 'text-emerald-400' },
  report: { bg: 'bg-amber-500/200/20', text: 'text-amber-400' },
  risk_assessment: { bg: 'bg-red-500/200/20', text: 'text-red-400' }
} as const;

export const ComplianceDocumentsManager: React.FC<Props> = ({ documents, isLoading }) => {
  const [fwFilter, setFwFilter] = useState<ComplianceFramework | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = documents.filter(d => {
    if (fwFilter !== 'all' && d.framework !== fwFilter) return false;
    if (typeFilter !== 'all' && d.type !== typeFilter) return false;
    return true;
  });

  if (isLoading) return <div className="bg-surface rounded-2xl border border-border-theme p-6 animate-pulse"><div className="h-6 bg-border-theme rounded w-48 mb-4" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-surface-secondary rounded-xl mb-3" />)}</div>;

  const grouped = filtered.reduce((acc, doc) => {
    if (!acc[doc.framework]) acc[doc.framework] = [];
    acc[doc.framework].push(doc);
    return acc;
  }, {} as Record<ComplianceFramework, ComplianceDocument[]>);

  return (
    <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
      <div className="px-6 py-4 border-b border-border-theme">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-50"><FileText className="h-5 w-5 text-violet-600" /></div>
            <div><h3 className="text-lg font-bold text-text-primary">Documents</h3><p className="text-xs text-text-muted">{filtered.length} documents · {documents.filter(d => d.status === 'outdated').length} outdated</p></div>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 bg-surface border border-border-theme rounded-xl text-xs font-medium text-text-secondary" value={fwFilter} onChange={e => setFwFilter(e.target.value as ComplianceFramework | 'all')}>
              <option value="all">All Frameworks</option>
              {(['SOC2','GDPR','HIPAA','PCI_DSS','ISO27001','NIST','CCPA','FERPA'] as ComplianceFramework[]).map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select className="px-3 py-2 bg-surface border border-border-theme rounded-xl text-xs font-medium text-text-secondary" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {(['policy','procedure','evidence','report','risk_assessment']).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
        {Object.entries(grouped).map(([fw, docs]) => (
          <div key={fw}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />{fw} ({docs.length})
            </h4>
            <div className="space-y-2">
              {docs.map(doc => {
                const stCfg = STATUS_CONFIG[doc.status];
                const tpCfg = TYPE_CONFIG[doc.type];
                const isExpiring = doc.expiresAt && new Date(doc.expiresAt) < new Date();
                return (
                  <div key={doc.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:shadow-sm ${isExpiring ? 'border-red-500/30 bg-red-500/20/30' : 'border-border-theme hover:border-border-theme'}`}>
                    <div className={`p-2 rounded-lg ${stCfg.bg} ${stCfg.text} flex-shrink-0`}>{stCfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h5 className="text-sm font-semibold text-text-primary truncate">{doc.name}</h5>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tpCfg.bg} ${tpCfg.text}`}>{doc.type.replace(/_/g, ' ')}</span>
                        {isExpiring && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/200/20 text-red-400">EXPIRED</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
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

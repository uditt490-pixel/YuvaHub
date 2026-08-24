// ═══════════════════════════════════════════════════════════════════
// Enterprise Compliance & Regulatory Audit Hub — Main Page
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, ShieldCheck, Eye, FileText, AlertTriangle, ShieldAlert,
  RefreshCw, X
} from 'lucide-react';
import { ComplianceMetricsCard } from '../../components/Enterprise/ComplianceMetricsCard';
import { ComplianceRequirementsList } from '../../components/Enterprise/ComplianceRequirementsList';
import { AuditRecordsTimeline } from '../../components/Enterprise/AuditRecordsTimeline';
import { ComplianceDocumentsManager } from '../../components/Enterprise/ComplianceDocumentsManager';
import { ComplianceAuditService } from '../../services/ComplianceAuditService';
import { ComplianceMetrics, ComplianceRequirement, AuditRecord, ComplianceDocument, ComplianceAlert } from '../../types/complianceAudit';

type Tab = 'overview' | 'requirements' | 'audits' | 'documents' | 'alerts';
const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <Eye className="h-4 w-4" /> },
  { id: 'requirements', label: 'Requirements', icon: <Shield className="h-4 w-4" /> },
  { id: 'audits', label: 'Audits', icon: <ShieldCheck className="h-4 w-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="h-4 w-4" /> }
];
const SEV_COLORS: Record<string, string> = { P0: 'bg-red-500', P1: 'bg-orange-500', P2: 'bg-amber-500', P3: 'bg-blue-500' };

export const ComplianceAuditHub: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const [m, r, a, d, al] = await Promise.all([
        ComplianceAuditService.getMetrics(), ComplianceAuditService.getRequirements(),
        ComplianceAuditService.getAudits(), ComplianceAuditService.getDocuments(), ComplianceAuditService.getAlerts()
      ]);
      setMetrics(m); setRequirements(r); setAudits(a); setDocuments(d); setAlerts(al);
    } catch { setError('Failed to load compliance data.'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);
  useEffect(() => { if (!autoRefresh) return; const i = setInterval(load, 30000); return () => clearInterval(i); }, [autoRefresh, load]);

  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');

  const render = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <ComplianceMetricsCard metrics={metrics} isLoading={isLoading} onRefresh={load} />
            {openAlerts.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-xl"><ShieldAlert className="h-5 w-5 text-red-600" /></div>
                  <div><h3 className="text-sm font-bold text-red-800">Compliance Alerts ({openAlerts.length})</h3><p className="text-xs text-red-600">Requires immediate attention</p></div>
                  <button onClick={() => setTab('alerts')} className="ml-auto px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">View All</button>
                </div>
                <div className="space-y-2">{openAlerts.slice(0, 3).map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 bg-white/80 rounded-xl border border-red-100">
                    <div className={`w-2 h-2 rounded-full ${SEV_COLORS[a.severity]}`} />
                    <span className="text-sm font-medium text-slate-800 truncate flex-1">{a.title}</span>
                    <span className="text-xs text-slate-500">{a.framework}</span>
                  </div>
                ))}</div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AuditRecordsTimeline audits={audits.slice(0, 3)} isLoading={isLoading} />
              <ComplianceDocumentsManager documents={documents.slice(0, 6)} isLoading={isLoading} />
            </div>
          </div>
        );
      case 'requirements':
        return <ComplianceRequirementsList requirements={requirements} isLoading={isLoading} />;
      case 'audits':
        return <AuditRecordsTimeline audits={audits} isLoading={isLoading} />;
      case 'documents':
        return <ComplianceDocumentsManager documents={documents} isLoading={isLoading} />;
      case 'alerts':
        return (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-50"><AlertTriangle className="h-5 w-5 text-orange-600" /></div>
                <div><h3 className="text-lg font-bold text-slate-800">Compliance Alerts</h3><p className="text-xs text-slate-500">{alerts.length} total · {openAlerts.length} open</p></div>
              </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[700px] overflow-y-auto">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="px-6 py-4 animate-pulse"><div className="h-4 bg-slate-200 rounded w-full" /></div>) :
                alerts.map(a => (
                  <div key={a.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${SEV_COLORS[a.severity]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-800">{a.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${a.status === 'open' ? 'bg-red-100 text-red-700' : a.status === 'investigating' ? 'bg-amber-100 text-amber-700' : a.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{a.status}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">{a.framework}</span>
                        </div>
                        <p className="text-xs text-slate-500">{a.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          {a.relatedControl && <span>Control: {a.relatedControl}</span>}
                          <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-full flex items-center gap-1"><Shield className="h-3 w-3" /> Enterprise</span>
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Compliance Active</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Compliance & Regulatory Audit Hub</h1>
              <p className="text-slate-500 mt-1">Track compliance across SOC2, GDPR, HIPAA, PCI DSS, ISO27001, and more.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${autoRefresh ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
              <button onClick={load} disabled={isLoading} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium text-sm shadow-sm disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh
              </button>
            </div>
          </div>
        </header>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center justify-between"><span>{error}</span><button onClick={() => setError(null)} className="p-1 rounded hover:bg-red-100"><X className="h-4 w-4" /></button></div>}

        <div className="mb-6">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 overflow-x-auto">
            {TABS.map(t => {
              const active = tab === t.id;
              const badge = t.id === 'alerts' && openAlerts.length > 0 ? openAlerts.length : undefined;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
                  {t.icon}{t.label}{badge && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white min-w-[20px] text-center">{badge}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <main>{render()}</main>
        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400"><p>Compliance & Regulatory Audit Hub · Powered by YuvaHub Enterprise</p></footer>
      </div>
    </div>
  );
};

export default ComplianceAuditHub;

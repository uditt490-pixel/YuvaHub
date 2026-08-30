// ─── Enterprise Data Loss Prevention Hub ──────────────────────────────────────
// Full page container for DLP: policies, scans, incidents, classifications,
// metrics dashboard, and incident detail modal with timeline.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Search, AlertTriangle, CheckCircle2, Clock, Eye, FileText,
  Activity, TrendingUp, TrendingDown, Filter, RefreshCw, X, Bell,
  BarChart3, Users, Target, Zap, ShieldAlert, Lock, Globe,
} from 'lucide-react';
import {
  DlpPolicy, DlpScan, DlpIncident, DlpIncidentStatus, DlpSeverity,
  DlpMetrics, DataClassification, DlpIncidentFilters,
} from '../../types/dataLossPrevention';
import { DlpService } from '../../services/DataLossPreventionService';
import { DlpPolicyEditor } from '../../components/Enterprise/DlpPolicyEditor';
import { DlpScanResults } from '../../components/Enterprise/DlpScanResults';
import { DlpIncidentTracker } from '../../components/Enterprise/DlpIncidentTracker';

type PageView = 'overview' | 'policies' | 'scans' | 'incidents' | 'classifications';

const VIEW_TABS: Array<{ id: PageView; label: string; icon: React.ReactNode; badge?: string }> = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'policies', label: 'Policies', icon: <Shield className="h-4 w-4" /> },
  { id: 'scans', label: 'Scans', icon: <Search className="h-4 w-4" /> },
  { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'classifications', label: 'Classifications', icon: <Lock className="h-4 w-4" /> },
];

const CLASSIFICATION_COLORS: Record<string, string> = {
  PUBLIC: 'bg-emerald-500/200', INTERNAL: 'bg-blue-500/200', CONFIDENTIAL: 'bg-amber-500/200',
  RESTRICTED: 'bg-red-500/200', PROHIBITED: 'bg-rose-600',
};

function formatBytes(b: number): string {
  if (b >= 1e9) return `${(b / 1e9).toFixed(1)} GB`;
  if (b >= 1e6) return `${(b / 1e6).toFixed(1)} MB`;
  return `${(b / 1e3).toFixed(1)} KB`;
}

function formatNumber(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

// ─── Overview Dashboard ───────────────────────────────────────────────────────

const OverviewDashboard: React.FC<{ metrics: DlpMetrics | null; classifications: DataClassification[]; isLoading: boolean }> = ({ metrics, classifications, isLoading }) => {
  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border-theme p-4 animate-pulse">
              <div className="h-3 w-20 bg-surface-secondary rounded mb-2" />
              <div className="h-7 w-16 bg-surface-secondary rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/200 rounded-l-xl" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Policies</span>
          <p className="text-2xl font-black text-text-primary mt-1">{metrics.activePolicies}</p>
          <span className="text-xs text-text-muted">of {metrics.totalPolicies} total</span>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500/200 rounded-l-xl" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Scans (24h)</span>
          <p className="text-2xl font-black text-text-primary mt-1">{metrics.scansLast24h}</p>
          <span className="text-xs text-text-muted">{formatNumber(metrics.totalScans)} total</span>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-red-500/200 rounded-l-xl" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Open Incidents</span>
          <p className={`text-2xl font-black mt-1 ${metrics.openIncidents > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{metrics.openIncidents}</p>
          <span className="text-xs text-text-muted">{metrics.criticalIncidents} critical</span>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-amber-500/200 rounded-l-xl" />
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Matches (24h)</span>
          <p className="text-2xl font-black text-text-primary mt-1">{metrics.matchesLast24h}</p>
          <span className="text-xs text-text-muted">{formatNumber(metrics.totalMatchesEver)} total</span>
        </div>
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase">False Positive Rate</span>
          <p className="text-2xl font-black text-text-primary mt-1">{metrics.falsePositiveRate}%</p>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase">MTTD</span>
          <p className="text-2xl font-black text-text-primary mt-1">{metrics.mttdMinutes}m</p>
          <span className="text-xs text-text-muted">Mean time to detect</span>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase">MTTR</span>
          <p className="text-2xl font-black text-text-primary mt-1">{metrics.mttrHours}h</p>
          <span className="text-xs text-text-muted">Mean time to resolve</span>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
          <span className="text-[10px] font-bold text-text-muted uppercase">Total Incidents</span>
          <p className="text-2xl font-black text-text-primary mt-1">{formatNumber(metrics.totalIncidents)}</p>
        </div>
      </div>

      {/* Data Type & Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Matches by Data Type</h4>
          <div className="space-y-2.5">
            {metrics.dataTypeBreakdown.map(d => (
              <div key={d.dataType} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-text-secondary w-28 truncate">{d.dataType.replace(/_/g, ' ')}</span>
                <div className="flex-1 h-3 bg-surface-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500/200 rounded-full transition-all duration-700" style={{ width: `${Math.max(d.percentage, 2)}%` }} />
                </div>
                <span className="text-xs font-bold text-text-primary w-16 text-right">{formatNumber(d.count)}</span>
                <span className="text-[10px] font-bold text-text-muted w-10 text-right">{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Incidents by Severity</h4>
          <div className="space-y-3">
            {metrics.severityBreakdown.map(s => {
              const colors: Record<string, string> = { CRITICAL: 'bg-red-500/200', HIGH: 'bg-orange-500/200', MEDIUM: 'bg-amber-500/200', LOW: 'bg-blue-500/200' };
              return (
                <div key={s.severity} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-text-secondary w-16">{s.severity}</span>
                  <div className="flex-1 h-4 bg-surface-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${colors[s.severity] || 'bg-slate-400'}`} style={{ width: `${Math.max(s.percentage, 2)}%` }} />
                  </div>
                  <span className="text-xs font-bold text-text-primary w-16 text-right">{s.count}</span>
                  <span className="text-[10px] font-bold text-text-muted w-10 text-right">{s.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Violators & Classifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Top Violators</h4>
          <div className="space-y-3">
            {metrics.topViolators.map((v, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">{v.user.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary">{v.user}</p>
                  <p className="text-[10px] text-text-muted">{v.team}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary">{v.incidentCount}</p>
                  <p className={`text-[10px] font-bold ${v.riskScore > 60 ? 'text-red-500' : v.riskScore > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>Risk: {v.riskScore}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Data Classifications</h4>
          <div className="space-y-3">
            {classifications.map(cls => (
              <div key={cls.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
                <div className={`w-10 h-10 rounded-xl ${CLASSIFICATION_COLORS[cls.level]} flex items-center justify-center text-white text-lg shadow-md`}>{cls.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-primary">{cls.name} <span className="text-text-muted">({cls.level})</span></p>
                  <p className="text-[10px] text-text-muted">{cls.resourceCount.toLocaleString()} resources · {formatBytes(cls.totalSizeBytes)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {cls.encryptionRequired && <span title="Encryption required"><Lock className="h-3 w-3 text-amber-500" /></span>}
                  {cls.auditRequired && <span title="Audit required"><Eye className="h-3 w-3 text-blue-500" /></span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 14-Day Trend */}
      <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">14-Day Trend</h4>
        <div className="flex items-end gap-1 h-20">
          {metrics.trendData.map((d, i) => {
            const maxVal = Math.max(...metrics.trendData.map(t => t.incidents + t.matches), 1);
            const totalHeight = ((d.matches + d.incidents) / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-px" title={`${d.date}: ${d.scans} scans, ${d.matches} matches, ${d.incidents} incidents`}>
                <div className="w-full flex flex-col rounded-t-sm overflow-hidden" style={{ height: `${Math.max(totalHeight, 4)}%`, minHeight: '4px' }}>
                  <div className="bg-indigo-400" style={{ height: `${(d.matches / (d.matches + d.incidents || 1)) * 100}%` }} />
                  <div className="bg-red-500/200" style={{ height: `${(d.incidents / (d.matches + d.incidents || 1)) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-text-muted">
          <span>{metrics.trendData[0]?.date}</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-400" /> Matches</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500/200" /> Incidents</span>
          </span>
          <span>{metrics.trendData[metrics.trendData.length - 1]?.date}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Classifications Panel ────────────────────────────────────────────────────

const ClassificationsPanel: React.FC<{ classifications: DataClassification[]; isLoading: boolean }> = ({ classifications, isLoading }) => {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {classifications.map(cls => (
        <div key={cls.id} className="bg-surface rounded-xl border border-border-theme p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${CLASSIFICATION_COLORS[cls.level]} flex items-center justify-center text-white text-xl shadow-lg`}>{cls.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-text-primary">{cls.name}</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${CLASSIFICATION_COLORS[cls.level]} text-white`}>{cls.level}</span>
              </div>
              <p className="text-xs text-text-muted">{cls.description}</p>
              <div className="flex items-center gap-4 mt-2 text-[11px] text-text-muted">
                <span>{cls.resourceCount.toLocaleString()} resources</span>
                <span>{formatBytes(cls.totalSizeBytes)}</span>
                <span>Retention: {cls.retentionDays}d</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {cls.encryptionRequired && (
                <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold border border-amber-500/30">
                  <Lock className="h-3 w-3" /> Encryption
                </span>
              )}
              {cls.accessControlRequired && (
                <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-bold border border-blue-500/30">
                  <Eye className="h-3 w-3" /> Access Control
                </span>
              )}
              {cls.auditRequired && (
                <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-[10px] font-bold border border-purple-500/30">
                  <FileText className="h-3 w-3" /> Audit
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cls.dataTypes.map(dt => (
              <span key={dt} className="px-2 py-0.5 bg-surface-secondary text-text-secondary rounded text-[10px] font-bold">{dt.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const DlpHub: React.FC = () => {
  const [activeView, setActiveView] = useState<PageView>('overview');
  const [policies, setPolicies] = useState<DlpPolicy[]>([]);
  const [scans, setScans] = useState<DlpScan[]>([]);
  const [incidents, setIncidents] = useState<DlpIncident[]>([]);
  const [metrics, setMetrics] = useState<DlpMetrics | null>(null);
  const [classifications, setClassifications] = useState<DataClassification[]>([]);

  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const [isLoadingScans, setIsLoadingScans] = useState(true);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingClassifications, setIsLoadingClassifications] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoadingMetrics(true);
    setIsLoadingClassifications(true);
    const [m, c] = await Promise.all([DlpService.getMetrics(), DlpService.getClassifications()]);
    setMetrics(m);
    setClassifications(c);
    setIsLoadingMetrics(false);
    setIsLoadingClassifications(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (activeView === 'policies' && policies.length === 0) {
      setIsLoadingPolicies(true);
      DlpService.getPolicies().then(d => { setPolicies(d); setIsLoadingPolicies(false); });
    }
    if (activeView === 'scans' && scans.length === 0) {
      setIsLoadingScans(true);
      DlpService.getScans().then(d => { setScans(d); setIsLoadingScans(false); });
    }
    if (activeView === 'incidents' && incidents.length === 0) {
      setIsLoadingIncidents(true);
      DlpService.getIncidents().then(d => { setIncidents(d); setIsLoadingIncidents(false); });
    }
  }, [activeView]);

  const handleUpdateIncidentStatus = async (incidentId: string, status: DlpIncidentStatus) => {
    await DlpService.updateIncidentStatus(incidentId, status);
    setIncidents(prev => prev.map(inc => inc.id === incidentId ? { ...inc, status, closedAt: status === 'CLOSED' ? new Date().toISOString() : inc.closedAt } : inc));
  };

  const openIncidents = incidents.filter(i => i.status === 'NEW' || i.status === 'INVESTIGATING').length;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 font-sans">
      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-surface p-6 rounded-3xl border border-border-theme shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-surface-secondary text-text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-border-theme">
                <Shield className="h-4 w-4" /> Data Protection
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Data Loss Prevention</h1>
            <p className="text-sm text-text-muted mt-2 max-w-xl">
              Sensitive data scanning, policy management, incident tracking, and data classification enforcement.
            </p>
          </div>
          <button onClick={loadData}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-bold text-text-secondary hover:bg-surface transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Policies</span>
            <p className="text-2xl font-black text-text-primary mt-1">{metrics?.activePolicies ?? '...'}</p>
            <span className="text-xs text-text-muted">active</span>
          </div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Scans (24h)</span>
            <p className="text-2xl font-black text-text-primary mt-1">{metrics?.scansLast24h ?? '...'}</p>
            <span className="text-xs text-text-muted">{formatNumber(metrics?.totalMatchesEver ?? 0)} total matches</span>
          </div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Open Incidents</span>
            <p className={`text-2xl font-black mt-1 ${openIncidents > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{openIncidents}</p>
            <span className="text-xs text-text-muted">{incidents.length} total</span>
          </div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">MTTD / MTTR</span>
            <p className="text-2xl font-black text-text-primary mt-1">{metrics?.mttdMinutes ?? '...'}m / {metrics?.mttrHours ?? '...'}h</p>
            <span className="text-xs text-text-muted">detect / resolve</span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-surface p-1.5 rounded-xl border border-border-theme shadow-sm overflow-x-auto">
          {VIEW_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeView === tab.id ? 'bg-primary-blue text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-surface'
              }`}>
              {tab.icon} {tab.label}
              {tab.id === 'incidents' && openIncidents > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeView === tab.id ? 'bg-surface/20 text-white' : 'bg-red-500/200/20 text-red-400'}`}>{openIncidents}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeView === 'overview' && <OverviewDashboard metrics={metrics} classifications={classifications} isLoading={isLoadingMetrics || isLoadingClassifications} />}
        {activeView === 'policies' && <DlpPolicyEditor policies={policies} isLoading={isLoadingPolicies} />}
        {activeView === 'scans' && <DlpScanResults scans={scans} isLoading={isLoadingScans} />}
        {activeView === 'incidents' && <DlpIncidentTracker incidents={incidents} isLoading={isLoadingIncidents} onUpdateStatus={handleUpdateIncidentStatus} />}
        {activeView === 'classifications' && <ClassificationsPanel classifications={classifications} isLoading={isLoadingClassifications} />}
      </div>
    </div>
  );
};

export default DlpHub;

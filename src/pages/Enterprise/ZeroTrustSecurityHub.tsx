import React, { useState, useEffect } from 'react';
import {
  SecurityEvent,
  SecurityPolicyRule,
  ZeroTrustAnalytics,
  ZeroTrustFilter,
  QuarantinePayload
} from '../../types/zeroTrustSecurity';
import { ZeroTrustSecurityService } from '../../services/ZeroTrustSecurityService';
import { ZeroTrustMetricsCard } from '../../components/Enterprise/ZeroTrustMetricsCard';
import { ZeroTrustFilterToolbar } from '../../components/Enterprise/ZeroTrustFilterToolbar';
import { SecurityEventDetailModal } from '../../components/Enterprise/SecurityEventDetailModal';
import { EmergencyLockdownModal } from '../../components/Enterprise/EmergencyLockdownModal';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  LayoutGrid,
  List,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Globe,
  Server,
  Zap,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const ZeroTrustSecurityHub: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [policies, setPolicies] = useState<SecurityPolicyRule[]>([]);
  const [analytics, setAnalytics] = useState<ZeroTrustAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'grid' | 'table' | 'policies'>('grid');

  // Filters
  const [filters, setFilters] = useState<ZeroTrustFilter>({
    searchQuery: '',
    threatSeverity: 'ALL',
    gateProtocol: 'ALL',
    status: 'ALL',
    minRiskScore: 0,
    sortBy: 'riskScore',
    sortOrder: 'desc'
  });

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [quarantineTarget, setQuarantineTarget] = useState<SecurityEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warn' } | null>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [evts, pols, stats] = await Promise.all([
        ZeroTrustSecurityService.getSecurityEvents(filters),
        ZeroTrustSecurityService.getPolicies(),
        ZeroTrustSecurityService.getAnalytics()
      ]);
      setEvents(evts);
      setPolicies(pols);
      setAnalytics(stats);
    } catch (err) {
      showToast('Failed to load security telemetry', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleQuarantineConfirm = async (payload: QuarantinePayload) => {
    try {
      const updated = await ZeroTrustSecurityService.executeQuarantine(payload);
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      if (selectedEvent && selectedEvent.id === updated.id) {
        setSelectedEvent(updated);
      }
      setQuarantineTarget(null);
      showToast(`🚨 IP ${updated.sourceIp} quarantined & token revoked`, 'success');
      const stats = await ZeroTrustSecurityService.getAnalytics();
      setAnalytics(stats);
    } catch (err: any) {
      showToast(err.message || 'Quarantine action failed', 'warn');
    }
  };

  const handleTogglePolicy = async (policyId: string, currentEnabled: boolean) => {
    try {
      const updated = await ZeroTrustSecurityService.togglePolicy(policyId, !currentEnabled);
      setPolicies((prev) => prev.map((p) => (p.id === policyId ? updated : p)));
      showToast(`Policy '${updated.ruleName}' ${updated.enabled ? 'activated' : 'disabled'}`);
    } catch (err) {
      showToast('Failed to toggle policy', 'warn');
    }
  };

  const handleExportCsv = () => {
    const csv = ZeroTrustSecurityService.exportCSV(events);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `YuvaHub_ZeroTrust_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Zero-Trust Audit Log CSV');
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      threatSeverity: 'ALL',
      gateProtocol: 'ALL',
      status: 'ALL',
      minRiskScore: 0,
      sortBy: 'riskScore',
      sortOrder: 'desc'
    });
  };

  const getSeverityBadge = (sev: SecurityEvent['threatSeverity']) => {
    switch (sev) {
      case 'CRITICAL_BREACH':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300';
      case 'HIGH':
        return 'bg-orange-500/200/20 text-orange-800 border-orange-500/30 dark:bg-orange-950 dark:text-orange-300';
      case 'MEDIUM':
        return 'bg-amber-500/200/20 text-amber-800 border-amber-500/30 dark:bg-amber-950 dark:text-amber-300';
      case 'LOW':
        return 'bg-emerald-500/200/20 text-emerald-800 border-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300';
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 text-text-primary dark:text-slate-100 p-4 sm:p-6 lg:p-10 font-sans space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 bg-primary-blue text-white dark:bg-surface dark:text-text-primary border border-border-theme animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface dark:bg-primary-blue p-6 rounded-3xl border border-border-theme dark:border-border-theme shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-rose-200 dark:border-rose-900">
              <Lock className="w-3.5 h-3.5" /> Zero-Trust Ingress Gateway
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-secondary dark:bg-surface-secondary text-text-secondary dark:text-slate-300 text-[10px] font-mono font-bold">
              SOC-2 Type II / NIST 800-207
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight">
            Zero-Trust Campus Security & Access Gateway
          </h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-text-muted mt-1">
            Continuous identity verification, automated IP threat quarantine, and ephemeral token governance.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-surface-secondary dark:bg-surface-secondary p-1.5 rounded-2xl border border-border-theme dark:border-border-theme">
          <button
            onClick={() => setActiveView('grid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'grid'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Ingress Stream
          </button>
          <button
            onClick={() => setActiveView('table')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'table'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4" /> Audit Ledger
          </button>
          <button
            onClick={() => setActiveView('policies')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'policies'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" /> Access Policies
          </button>
        </div>
      </div>

      {/* Analytics KPI Block */}
      {analytics && <ZeroTrustMetricsCard analytics={analytics} />}

      {/* Filter Toolbar */}
      <ZeroTrustFilterToolbar
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        onExportCsv={handleExportCsv}
        totalMatches={events.length}
      />

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Analyzing Ingress Cryptographic Packets...
          </p>
        </div>
      ) : activeView === 'grid' ? (
        /* Ingress Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="p-5 rounded-3xl bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme shadow-sm hover:shadow-md hover:border-rose-500 transition-all cursor-pointer space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-bold text-text-primary dark:text-white">
                    {event.eventId}
                  </div>
                  <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                    <Globe className="w-3 h-3 text-blue-500" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${getSeverityBadge(event.threatSeverity)}`}>
                  {event.threatSeverity.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-xs font-mono font-semibold text-text-primary dark:text-slate-300 truncate">
                {event.userPrincipal}
              </div>

              {/* Risk Meter */}
              <div className="p-3 rounded-2xl bg-surface dark:bg-surface-secondary/60 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-text-muted">Threat Risk Score</span>
                  <span className={event.riskScore > 70 ? 'text-rose-600 font-extrabold' : 'text-blue-400 font-extrabold'}>
                    {event.riskScore}/100
                  </span>
                </div>
                <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={event.riskScore > 70 ? 'bg-rose-600 h-full rounded-full' : 'bg-blue-600 h-full rounded-full'}
                    style={{ width: `${event.riskScore}%` }}
                  />
                </div>
              </div>

              {/* Target & Protocol */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/40">
                  <div className="text-[10px] text-text-muted font-bold uppercase">Protocol</div>
                  <div className="font-bold text-text-primary dark:text-slate-200 mt-0.5 truncate">
                    {event.gateProtocol.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/40">
                  <div className="text-[10px] text-text-muted font-bold uppercase">Status</div>
                  <div className="font-bold text-text-primary dark:text-slate-200 mt-0.5">
                    {event.status}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border-theme dark:border-border-theme flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuarantineTarget(event);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1 hover:bg-rose-100 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" /> Quarantine
                </button>
                <span className="text-xs font-bold text-blue-400 dark:text-blue-400 flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : activeView === 'table' ? (
        /* Table View */
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface dark:bg-surface-secondary/80 border-b border-border-theme dark:border-border-theme text-text-muted dark:text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Event ID & IP</th>
                  <th className="p-4">Principal User</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">Protocol</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Risk</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-surface dark:hover:bg-surface-secondary/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-text-primary dark:text-white">{event.eventId}</div>
                      <div className="text-[11px] font-mono text-text-muted">{event.sourceIp}</div>
                    </td>
                    <td className="p-4 font-mono text-text-primary dark:text-slate-200">
                      {event.userPrincipal}
                    </td>
                    <td className="p-4 font-mono text-text-secondary dark:text-text-muted truncate max-w-[200px]">
                      {event.targetResource}
                    </td>
                    <td className="p-4 font-semibold text-blue-400 dark:text-blue-400">
                      {event.gateProtocol.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getSeverityBadge(event.threatSeverity)}`}>
                        {event.threatSeverity}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-rose-600">
                      {event.riskScore}/100
                    </td>
                    <td className="p-4 font-bold text-text-primary dark:text-slate-300">
                      {event.status}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="px-3 py-1 rounded-lg bg-blue-500/20 dark:bg-blue-950 text-blue-400 dark:text-blue-400 font-bold hover:bg-blue-500/200/20"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => setQuarantineTarget(event)}
                        className="px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold hover:bg-rose-100"
                      >
                        Quarantine
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Policy Rules Engine */
        <div className="space-y-4">
          <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            Zero-Trust Boundary Enforcement Policies
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="p-6 rounded-3xl bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm text-text-primary dark:text-white">
                      {policy.ruleName}
                    </span>
                    <button
                      onClick={() => handleTogglePolicy(policy.id, policy.enabled)}
                      className="text-blue-400 dark:text-blue-400 cursor-pointer"
                    >
                      {policy.enabled ? <ToggleRight className="w-7 h-7 text-emerald-500" /> : <ToggleLeft className="w-7 h-7 text-text-muted" />}
                    </button>
                  </div>
                  <p className="text-xs text-text-muted dark:text-text-muted leading-relaxed">
                    {policy.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-theme dark:border-border-theme space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Gate Protocol:</span>
                    <span className="font-semibold text-blue-400 dark:text-blue-400">{policy.gateProtocol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Matched Ingress Packets:</span>
                    <span className="font-bold text-emerald-400">{policy.matchedCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspector Modal */}
      {selectedEvent && (
        <SecurityEventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onQuarantine={(evt) => {
            setSelectedEvent(null);
            setQuarantineTarget(evt);
          }}
        />
      )}

      {/* Emergency Lockdown Quarantine Modal */}
      {quarantineTarget && (
        <EmergencyLockdownModal
          event={quarantineTarget}
          onClose={() => setQuarantineTarget(null)}
          onConfirm={handleQuarantineConfirm}
        />
      )}
    </div>
  );
};

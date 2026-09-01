// ═══════════════════════════════════════════════════════════════════
// Enterprise API Rate Limiting & Abuse Prevention Hub — Main Page
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, ShieldAlert, Activity, BarChart3, Settings, Users,
  RefreshCw, AlertTriangle, X, Clock
} from 'lucide-react';
import { RateLimitMetricsCard } from '../../components/Enterprise/RateLimitMetricsCard';
import { AbuseClientTracker } from '../../components/Enterprise/AbuseClientTracker';
import { TrafficHeatmap } from '../../components/Enterprise/TrafficHeatmap';
import { RateLimitRulesManager } from '../../components/Enterprise/RateLimitRulesManager';
import { RateLimitingService } from '../../services/RateLimitingService';
import { DashboardMetrics, RateLimitRule, APIEndpoint, AbusiveClient, RateLimitEvent, AbuseAlert, TrafficTimeSeries } from '../../types/rateLimiting';

type Tab = 'overview' | 'clients' | 'traffic' | 'rules' | 'alerts' | 'endpoints';
const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <Activity className="h-4 w-4" /> },
  { id: 'clients', label: 'Abusive Clients', icon: <Users className="h-4 w-4" /> },
  { id: 'traffic', label: 'Traffic', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'rules', label: 'Rate Limits', icon: <Settings className="h-4 w-4" /> },
  { id: 'endpoints', label: 'Endpoints', icon: <Shield className="h-4 w-4" /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="h-4 w-4" /> }
];
const SEV_COLORS: Record<string, string> = { P0: 'bg-red-500/200', P1: 'bg-orange-500/200', P2: 'bg-amber-500/200', P3: 'bg-blue-500/200' };
const METHOD_COLORS: Record<string, string> = { GET: 'bg-emerald-500/200/20 text-emerald-400', POST: 'bg-blue-500/200/20 text-blue-400', PUT: 'bg-amber-500/200/20 text-amber-400', DELETE: 'bg-red-500/200/20 text-red-400', PATCH: 'bg-purple-500/200/20 text-purple-400' };

export const RateLimitingAbusePreventionHub: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [rules, setRules] = useState<RateLimitRule[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [clients, setClients] = useState<AbusiveClient[]>([]);
  const [events, setEvents] = useState<RateLimitEvent[]>([]);
  const [alerts, setAlerts] = useState<AbuseAlert[]>([]);
  const [traffic, setTraffic] = useState<TrafficTimeSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const [m, r, e, c, ev, a, t] = await Promise.all([
        RateLimitingService.getMetrics(), RateLimitingService.getRules(), RateLimitingService.getEndpoints(),
        RateLimitingService.getAbusiveClients(), RateLimitingService.getEvents(), RateLimitingService.getAlerts(), RateLimitingService.getTraffic()
      ]);
      setMetrics(m); setRules(r); setEndpoints(e); setClients(c); setEvents(ev); setAlerts(a); setTraffic(t);
    } catch { setError('Failed to load rate limiting data.'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);
  useEffect(() => { if (!autoRefresh) return; const i = setInterval(load, 30000); return () => clearInterval(i); }, [autoRefresh, load]);

  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');

  const handleToggleRule = async (id: string, enabled: boolean) => {
    await RateLimitingService.toggleRule(id, enabled);
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled } : r));
  };
  const handleBlock = async (id: string) => {
    await RateLimitingService.blockClient(id);
    setClients(prev => prev.map(c => c.id === id ? { ...c, isBlocked: true, blockStatus: 'active' } : c));
  };
  const handleLift = async (id: string) => {
    await RateLimitingService.liftBlock(id);
    setClients(prev => prev.map(c => c.id === id ? { ...c, isBlocked: false, blockStatus: 'lifted' } : c));
  };

  const render = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <RateLimitMetricsCard metrics={metrics} isLoading={isLoading} onRefresh={load} />
            {openAlerts.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-500/30 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-500/200/20 rounded-xl"><ShieldAlert className="h-5 w-5 text-red-400" /></div>
                  <div><h3 className="text-sm font-bold text-red-800">Active Abuse Alerts ({openAlerts.length})</h3><p className="text-xs text-red-400">Requires attention</p></div>
                  <button onClick={() => setTab('alerts')} className="ml-auto px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">View All</button>
                </div>
                <div className="space-y-2">
                  {openAlerts.slice(0, 3).map(a => (
                    <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 bg-surface/80 rounded-xl border border-red-100">
                      <div className={`w-2 h-2 rounded-full ${SEV_COLORS[a.severity]}`} />
                      <span className="text-sm font-medium text-text-primary truncate flex-1">{a.title}</span>
                      <span className="text-xs text-text-muted">{a.category.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <TrafficHeatmap traffic={traffic.slice(0, 24)} events={events.slice(0, 15)} isLoading={isLoading} />
            <AbuseClientTracker clients={clients.slice(0, 5)} isLoading={isLoading} onBlock={handleBlock} onLift={handleLift} />
          </div>
        );
      case 'clients':
        return <AbuseClientTracker clients={clients} isLoading={isLoading} onBlock={handleBlock} onLift={handleLift} />;
      case 'traffic':
        return <TrafficHeatmap traffic={traffic} events={events} isLoading={isLoading} />;
      case 'rules':
        return <RateLimitRulesManager rules={rules} isLoading={isLoading} onToggle={handleToggleRule} />;
      case 'endpoints':
        return (
          <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
            <div className="px-6 py-4 border-b border-border-theme">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/20"><Shield className="h-5 w-5 text-blue-400" /></div>
                <div><h3 className="text-lg font-bold text-text-primary">Protected Endpoints</h3><p className="text-xs text-text-muted">{endpoints.length} endpoints monitored</p></div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-surface border-b border-border-theme text-left">
                  <th className="px-6 py-3 font-semibold text-text-secondary">Endpoint</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary text-center">Method</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary text-center">Avg Latency</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary text-center">P99</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary text-center">Req/min</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary text-center">Error Rate</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary text-center">Tier</th>
                  <th className="px-4 py-3 font-semibold text-text-secondary text-center">Auth</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? Array.from({ length: 5 }).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={8} className="px-6 py-4"><div className="h-4 bg-border-theme rounded w-full" /></td></tr>) :
                    endpoints.map(ep => (
                      <tr key={ep.id} className="hover:bg-surface transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-text-primary">{ep.path}</td>
                        <td className="px-4 py-3 text-center"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${METHOD_COLORS[ep.method]}`}>{ep.method}</span></td>
                        <td className="px-4 py-3 text-center font-mono text-xs">{ep.avgLatencyMs}ms</td>
                        <td className="px-4 py-3 text-center font-mono text-xs">{ep.p99LatencyMs}ms</td>
                        <td className="px-4 py-3 text-center font-mono text-xs">{ep.requestsPerMin}</td>
                        <td className="px-4 py-3 text-center"><span className={`font-mono text-xs font-bold ${ep.errorRate > 5 ? 'text-red-400' : ep.errorRate > 2 ? 'text-amber-400' : 'text-emerald-400'}`}>{ep.errorRate}%</span></td>
                        <td className="px-4 py-3 text-center text-xs capitalize">{ep.rateLimitTier}</td>
                        <td className="px-4 py-3 text-center">{ep.isAuthenticated ? <span className="text-emerald-400">✓</span> : <span className="text-slate-300">—</span>}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
            <div className="px-6 py-4 border-b border-border-theme">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/20"><AlertTriangle className="h-5 w-5 text-orange-400" /></div>
                <div><h3 className="text-lg font-bold text-text-primary">Abuse Alerts</h3><p className="text-xs text-text-muted">{alerts.length} total · {openAlerts.length} open</p></div>
              </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[700px] overflow-y-auto">
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="px-6 py-4 animate-pulse"><div className="h-4 bg-border-theme rounded w-full" /></div>) :
                alerts.map(a => (
                  <div key={a.id} className="px-6 py-4 hover:bg-surface transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${SEV_COLORS[a.severity]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-text-primary">{a.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            a.status === 'open' ? 'bg-red-500/200/20 text-red-400' : a.status === 'investigating' ? 'bg-amber-500/200/20 text-amber-400' : a.status === 'resolved' ? 'bg-emerald-500/200/20 text-emerald-400' : 'bg-surface-secondary text-text-muted'
                          }`}>{a.status}</span>
                        </div>
                        <p className="text-xs text-text-muted">{a.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                          <span className="capitalize">{a.category.replace(/_/g, ' ')}</span>
                          <span>Risk: {a.riskScore.toFixed(0)}</span>
                          {a.assignee && <span>→ {a.assignee}</span>}
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
    <div className="min-h-screen bg-surface/50 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/200/20 rounded-full flex items-center gap-1"><Shield className="h-3 w-3" /> Enterprise</span>
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/200/20 rounded-full flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Protection Active</span>
              </div>
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">API Rate Limiting & Abuse Prevention</h1>
              <p className="text-text-muted mt-1">Protect APIs from abuse, DDoS, and malicious traffic patterns.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${autoRefresh ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-surface border-border-theme text-text-secondary hover:bg-surface'}`}>
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-indigo-500/200 animate-pulse' : 'bg-slate-300'}`} />Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
              <button onClick={load} disabled={isLoading} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-theme text-text-primary rounded-xl hover:bg-surface transition-all font-medium text-sm shadow-sm disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />Refresh
              </button>
            </div>
          </div>
        </header>

        {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium flex items-center justify-between"><span>{error}</span><button onClick={() => setError(null)} className="p-1 rounded hover:bg-red-500/200/20"><X className="h-4 w-4" /></button></div>}

        <div className="mb-6">
          <div className="flex items-center gap-1 bg-surface rounded-xl border border-border-theme p-1 overflow-x-auto">
            {TABS.map(t => {
              const active = tab === t.id;
              const badge = t.id === 'alerts' && openAlerts.length > 0 ? openAlerts.length : undefined;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-sm' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}>
                  {t.icon}{t.label}
                  {badge && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/200 text-white min-w-[20px] text-center">{badge}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <main>{render()}</main>
        <footer className="mt-12 pt-6 border-t border-border-theme text-center text-xs text-text-muted"><p>API Rate Limiting & Abuse Prevention Hub · Powered by YuvaHub Enterprise</p></footer>
      </div>
    </div>
  );
};

export default RateLimitingAbusePreventionHub;

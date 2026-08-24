// ═══════════════════════════════════════════════════════════════════
// Enterprise Cost Optimization & Cloud Spend Analytics — Main Page
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, TrendingUp, Lightbulb, Target, Server, BarChart3,
  AlertTriangle, RefreshCw, X
} from 'lucide-react';
import { CostMetricsCards } from '../../components/Enterprise/CostMetricsCards';
import { SpendTimeSeriesChart } from '../../components/Enterprise/SpendTimeSeriesChart';
import { BudgetTracker } from '../../components/Enterprise/BudgetTracker';
import { CostRecommendations } from '../../components/Enterprise/CostRecommendations';
import { CostOptimizationService } from '../../services/CostOptimizationService';
import { CostMetrics, CloudResource, CostRecommendation, CostBudget, CostAlert, SpendTimeSeries } from '../../types/costOptimization';

type Tab = 'overview' | 'resources' | 'recommendations' | 'budgets' | 'alerts';
const TABS: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'resources', label: 'Resources', icon: <Server className="h-4 w-4" /> },
  { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="h-4 w-4" /> },
  { id: 'budgets', label: 'Budgets', icon: <Target className="h-4 w-4" /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="h-4 w-4" /> }
];
const SEV_COLORS: Record<string, string> = { P0: 'bg-red-500', P1: 'bg-orange-500', P2: 'bg-amber-500', P3: 'bg-blue-500' };
const PROVIDER_COLORS: Record<string, string> = { aws: 'bg-amber-100 text-amber-700', gcp: 'bg-blue-100 text-blue-700', azure: 'bg-cyan-100 text-cyan-700', self_hosted: 'bg-slate-100 text-slate-600' };
const STATUS_COLORS: Record<string, string> = { active: 'bg-emerald-100 text-emerald-700', idle: 'bg-amber-100 text-amber-700', terminated: 'bg-red-100 text-red-700', reserved: 'bg-indigo-100 text-indigo-700', spot: 'bg-purple-100 text-purple-700' };

function formatCost(n: number) { return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n.toFixed(0)}`; }

export const CostOptimizationHub: React.FC = () => {
  const [tab, setTab] = useState<Tab>('overview');
  const [metrics, setMetrics] = useState<CostMetrics | null>(null);
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [recs, setRecs] = useState<CostRecommendation[]>([]);
  const [budgets, setBudgets] = useState<CostBudget[]>([]);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [traffic, setTraffic] = useState<SpendTimeSeries[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true); setError(null);
    try {
      const [m, r, rec, b, a, t] = await Promise.all([
        CostOptimizationService.getMetrics(), CostOptimizationService.getResources(),
        CostOptimizationService.getRecommendations(), CostOptimizationService.getBudgets(),
        CostOptimizationService.getAlerts(), CostOptimizationService.getTraffic()
      ]);
      setMetrics(m); setResources(r); setRecs(rec); setBudgets(b); setAlerts(a); setTraffic(t);
    } catch { setError('Failed to load cost data.'); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);
  useEffect(() => { if (!autoRefresh) return; const i = setInterval(load, 30000); return () => clearInterval(i); }, [autoRefresh, load]);

  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');

  const handleAcceptRec = async (id: string) => { await CostOptimizationService.acceptRec(id); setRecs(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' as const } : r)); };
  const handleDismissRec = async (id: string) => { await CostOptimizationService.dismissRec(id); setRecs(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' as const } : r)); };

  const render = () => {
    switch (tab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <CostMetricsCards metrics={metrics} isLoading={isLoading} onRefresh={load} />
            {openAlerts.length > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-xl"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
                  <div><h3 className="text-sm font-bold text-red-800">Active Cost Alerts ({openAlerts.length})</h3><p className="text-xs text-red-600">Requires attention</p></div>
                  <button onClick={() => setTab('alerts')} className="ml-auto px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700">View All</button>
                </div>
                <div className="space-y-2">{openAlerts.slice(0, 3).map(a => (
                  <div key={a.id} className="flex items-center gap-3 px-4 py-2.5 bg-white/80 rounded-xl border border-red-100">
                    <div className={`w-2 h-2 rounded-full ${SEV_COLORS[a.severity]}`} />
                    <span className="text-sm font-medium text-slate-800 truncate flex-1">{a.title}</span>
                    <span className="text-xs text-slate-500">{formatCost(a.amount)}</span>
                  </div>
                ))}</div>
              </div>
            )}
            <SpendTimeSeriesChart traffic={traffic} budgets={budgets} isLoading={isLoading} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetTracker budgets={budgets.slice(0, 4)} isLoading={isLoading} />
              <CostRecommendations recommendations={recs.slice(0, 4)} isLoading={isLoading} onAccept={handleAcceptRec} onDismiss={handleDismissRec} />
            </div>
          </div>
        );
      case 'resources':
        return (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50"><Server className="h-5 w-5 text-blue-600" /></div>
                <div><h3 className="text-lg font-bold text-slate-800">Cloud Resources</h3><p className="text-xs text-slate-500">{resources.length} resources tracked</p></div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-200 text-left">
                  <th className="px-6 py-3 font-semibold text-slate-600">Resource</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Provider</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Category</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Monthly Cost</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Trend</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Utilization</th>
                  <th className="px-4 py-3 font-semibold text-slate-600 text-center">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? Array.from({ length: 8 }).map((_, i) => <tr key={i} className="animate-pulse"><td colSpan={7} className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-full" /></td></tr>) :
                    resources.map(res => (
                      <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3">
                          <div className="font-semibold text-slate-800 text-xs">{res.name}</div>
                          <div className="text-[10px] text-slate-400">{res.region}</div>
                        </td>
                        <td className="px-4 py-3 text-center"><span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${PROVIDER_COLORS[res.provider]}`}>{res.provider}</span></td>
                        <td className="px-4 py-3 text-center text-xs capitalize">{res.category}</td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-800">{formatCost(res.monthlyCost)}</td>
                        <td className="px-4 py-3 text-center"><span className={`font-mono text-xs font-bold ${res.costTrend > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{res.costTrend > 0 ? '+' : ''}{res.costTrend.toFixed(1)}%</span></td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${res.utilizationPercent}%`, backgroundColor: res.utilizationPercent < 20 ? '#ef4444' : res.utilizationPercent < 50 ? '#f59e0b' : '#10b981' }} />
                            </div>
                            <span className="text-xs font-mono text-slate-600">{res.utilizationPercent.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${STATUS_COLORS[res.status]}`}>{res.status}</span></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'recommendations':
        return <CostRecommendations recommendations={recs} isLoading={isLoading} onAccept={handleAcceptRec} onDismiss={handleDismissRec} />;
      case 'budgets':
        return <BudgetTracker budgets={budgets} isLoading={isLoading} />;
      case 'alerts':
        return (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-50"><AlertTriangle className="h-5 w-5 text-orange-600" /></div>
                <div><h3 className="text-lg font-bold text-slate-800">Cost Alerts</h3><p className="text-xs text-slate-500">{alerts.length} total · {openAlerts.length} open</p></div>
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
                        </div>
                        <p className="text-xs text-slate-500">{a.description}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                          <span className="capitalize">{a.type.replace(/_/g, ' ')}</span>
                          <span>{formatCost(a.amount)}</span>
                          <span className="capitalize">{a.category}</span>
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
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-full flex items-center gap-1"><DollarSign className="h-3 w-3" /> Enterprise</span>
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Cost Optimization</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cost Optimization & Cloud Spend Analytics</h1>
              <p className="text-slate-500 mt-1">Optimize cloud spending with intelligent recommendations and budget tracking.</p>
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
        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400"><p>Cost Optimization & Cloud Spend Analytics Hub · Powered by YuvaHub Enterprise</p></footer>
      </div>
    </div>
  );
};

export default CostOptimizationHub;

// ═══════════════════════════════════════════════════════════════════
// Enterprise Fraud Detection & Risk Intelligence Hub — Main Page
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, ShieldAlert, CreditCard, Radio, Users, Settings,
  RefreshCw, Search, Filter, AlertTriangle, Ban, CheckCircle2,
  Clock, Eye, X, ToggleLeft, ToggleRight
} from 'lucide-react';
import { FraudRiskScoreCard } from '../../components/Enterprise/FraudRiskScoreCard';
import { TransactionMonitor } from '../../components/Enterprise/TransactionMonitor';
import { ThreatIntelligenceFeed } from '../../components/Enterprise/ThreatIntelligenceFeed';
import { AnomalyDetectionPanel } from '../../components/Enterprise/AnomalyDetectionPanel';
import { FraudDetectionService } from '../../services/FraudDetectionService';
import {
  Transaction, UserRiskProfile, ThreatIntelligence, FraudAlert,
  FraudRule, DashboardMetrics, TransactionStatus, RiskLevel
} from '../../types/fraudDetection';

type ActiveTab = 'overview' | 'transactions' | 'threats' | 'anomalies' | 'rules' | 'alerts';

const TABS: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <Eye className="h-4 w-4" /> },
  { id: 'transactions', label: 'Transactions', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'threats', label: 'Threat Intel', icon: <Radio className="h-4 w-4" /> },
  { id: 'anomalies', label: 'User Risk', icon: <Users className="h-4 w-4" /> },
  { id: 'rules', label: 'Detection Rules', icon: <Settings className="h-4 w-4" /> },
  { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="h-4 w-4" /> }
];

const SEV_COLORS = { P0: 'bg-red-500/200', P1: 'bg-orange-500/200', P2: 'bg-amber-500/200', P3: 'bg-blue-500/200' };
const RULE_ACTION_COLORS: Record<string, string> = { block: 'bg-red-500/200/20 text-red-400', flag: 'bg-amber-500/200/20 text-amber-400', challenge: 'bg-orange-500/200/20 text-orange-400', monitor: 'bg-blue-500/200/20 text-blue-400', notify: 'bg-surface-secondary text-text-secondary' };

export const FraudDetectionHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<UserRiskProfile[]>([]);
  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [m, t, p, th, al, r] = await Promise.all([
        FraudDetectionService.getMetrics(),
        FraudDetectionService.getTransactions({ statusFilter, riskFilter, searchQuery, timeRange: '24h' }),
        FraudDetectionService.getUserProfiles(),
        FraudDetectionService.getThreats(),
        FraudDetectionService.getAlerts(),
        FraudDetectionService.getRules()
      ]);
      setMetrics(m); setTransactions(t); setProfiles(p); setThreats(th); setAlerts(al); setRules(r);
    } catch { setError('Failed to load fraud detection data.'); }
    finally { setIsLoading(false); }
  }, [statusFilter, riskFilter, searchQuery]);

  useEffect(() => { const t = setTimeout(loadData, 200); return () => clearTimeout(t); }, [loadData]);
  useEffect(() => { if (!autoRefresh) return; const i = setInterval(loadData, 30000); return () => clearInterval(i); }, [autoRefresh, loadData]);

  const openAlerts = alerts.filter(a => a.status === 'open' || a.status === 'investigating');
  const openAlertCount = openAlerts.length;

  const handleBlock = async (id: string) => {
    await FraudDetectionService.blockTransaction(id);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'blocked' as const, riskScore: 100, riskLevel: 'critical' as const } : t));
  };

  const handleToggleRule = async (id: string, enabled: boolean) => {
    await FraudDetectionService.toggleRule(id, enabled);
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled } : r));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <FraudRiskScoreCard metrics={metrics} isLoading={isLoading} onRefresh={loadData} />
            {openAlertCount > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-500/30 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-500/200/20 rounded-xl"><Ban className="h-5 w-5 text-red-400" /></div>
                  <div>
                    <h3 className="text-sm font-bold text-red-800">Active Fraud Alerts ({openAlertCount})</h3>
                    <p className="text-xs text-red-400">Requires immediate attention</p>
                  </div>
                  <button onClick={() => setActiveTab('alerts')} className="ml-auto px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">View All</button>
                </div>
                <div className="space-y-2">
                  {openAlerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="flex items-center gap-3 px-4 py-2.5 bg-surface/80 rounded-xl border border-red-100">
                      <div className={`w-2 h-2 rounded-full ${SEV_COLORS[alert.severity]}`} />
                      <span className="text-sm font-medium text-text-primary truncate flex-1">{alert.title}</span>
                      <span className="text-xs text-text-muted">Risk: {alert.riskScore.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TransactionMonitor transactions={transactions.slice(0, 5)} isLoading={isLoading} onBlock={handleBlock}
                searchQuery="" onSearchChange={() => {}} statusFilter="all" onStatusFilterChange={() => {}} riskFilter="all" onRiskFilterChange={() => {}} />
              <ThreatIntelligenceFeed threats={threats.slice(0, 4)} isLoading={isLoading} />
            </div>
          </div>
        );
      case 'transactions':
        return (
          <TransactionMonitor transactions={transactions} isLoading={isLoading} onBlock={handleBlock}
            searchQuery={searchQuery} onSearchChange={setSearchQuery}
            statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
            riskFilter={riskFilter} onRiskFilterChange={setRiskFilter} />
        );
      case 'threats':
        return <ThreatIntelligenceFeed threats={threats} isLoading={isLoading} />;
      case 'anomalies':
        return <AnomalyDetectionPanel profiles={profiles} isLoading={isLoading} />;
      case 'rules':
        return (
          <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
            <div className="px-6 py-4 border-b border-border-theme">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-50"><Settings className="h-5 w-5 text-violet-600" /></div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Detection Rules</h3>
                  <p className="text-xs text-text-muted">{rules.length} rules · {rules.filter(r => r.enabled).length} active</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <div key={i} className="px-6 py-4 animate-pulse"><div className="h-4 bg-border-theme rounded w-full" /></div>)
              ) : rules.map(rule => (
                <div key={rule.id} className="px-6 py-4 hover:bg-surface transition-colors">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleToggleRule(rule.id, !rule.enabled)} className="flex-shrink-0">
                      {rule.enabled ? <ToggleRight className="h-8 w-8 text-indigo-400" /> : <ToggleLeft className="h-8 w-8 text-slate-300" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-text-primary">{rule.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${RULE_ACTION_COLORS[rule.action]}`}>{rule.action}</span>
                        <div className={`w-2 h-2 rounded-full ${SEV_COLORS[rule.severity]}`} />
                      </div>
                      <p className="text-xs text-text-muted mt-0.5">{rule.condition}</p>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="text-sm font-mono font-bold text-text-primary">{rule.triggerCount}</div>
                      <div className="text-[10px] text-text-muted">triggers</div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className={`text-sm font-mono font-bold ${rule.falsePositiveRate > 10 ? 'text-red-400' : 'text-text-primary'}`}>{rule.falsePositiveRate}%</div>
                      <div className="text-[10px] text-text-muted">FP rate</div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden md:block">
                      <div className="text-xs text-text-muted">{rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never'}</div>
                      <div className="text-[10px] text-text-muted">last fired</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
            <div className="px-6 py-4 border-b border-border-theme">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-orange-500/20"><AlertTriangle className="h-5 w-5 text-orange-400" /></div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Fraud Alerts</h3>
                  <p className="text-xs text-text-muted">{alerts.length} total · {openAlertCount} open</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-50 max-h-[700px] overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <div key={i} className="px-6 py-4 animate-pulse"><div className="h-4 bg-border-theme rounded w-full" /></div>)
              ) : alerts.map(alert => (
                <div key={alert.id} className="px-6 py-4 hover:bg-surface transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${SEV_COLORS[alert.severity]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-text-primary">{alert.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          alert.status === 'open' ? 'bg-red-500/200/20 text-red-400' : alert.status === 'investigating' ? 'bg-amber-500/200/20 text-amber-400' : alert.status === 'resolved' ? 'bg-emerald-500/200/20 text-emerald-400' : 'bg-surface-secondary text-text-muted'
                        }`}>{alert.status}</span>
                      </div>
                      <p className="text-xs text-text-muted">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-text-muted">
                        <span>Risk: {alert.riskScore.toFixed(0)}</span>
                        <span>{alert.relatedTransactions.length} txns</span>
                        <span>{alert.relatedUsers.length} users</span>
                        {alert.assignee && <span>→ {alert.assignee}</span>}
                        <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                      </div>
                      {alert.resolution && <div className="mt-2 px-3 py-2 bg-emerald-500/20 rounded-lg text-xs text-emerald-400">✓ {alert.resolution}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface/50 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/200/20 rounded-full flex items-center gap-1"><Shield className="h-3 w-3" /> Enterprise</span>
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-red-400 bg-red-500/200/20 rounded-full flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Fraud Detection Active</span>
              </div>
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Fraud Detection & Risk Intelligence</h1>
              <p className="text-text-muted mt-1">Real-time transaction monitoring, risk scoring, and threat intelligence.</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${autoRefresh ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-surface border-border-theme text-text-secondary hover:bg-surface'}`}>
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-indigo-500/200 animate-pulse' : 'bg-slate-300'}`} />
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
              <button onClick={loadData} disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-theme text-text-primary rounded-xl hover:bg-surface transition-all font-medium text-sm shadow-sm disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="p-1 rounded hover:bg-red-500/200/20"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-1 bg-surface rounded-xl border border-border-theme p-1 overflow-x-auto">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id;
              const badge = tab.id === 'alerts' && openAlertCount > 0 ? openAlertCount : undefined;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-text-secondary hover:bg-surface hover:text-text-primary'}`}>
                  {tab.icon}{tab.label}
                  {badge && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/200 text-white min-w-[20px] text-center">{badge}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <main>{renderContent()}</main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border-theme text-center text-xs text-text-muted">
          <p>Fraud Detection & Risk Intelligence Hub · Powered by YuvaHub Enterprise</p>
        </footer>
      </div>
    </div>
  );
};

export default FraudDetectionHub;

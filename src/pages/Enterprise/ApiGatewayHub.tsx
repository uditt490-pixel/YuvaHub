// ─── Enterprise API Gateway Hub ───────────────────────────────────────────────
// Full page container orchestrating the API Gateway Manager: key lifecycle,
// rate limiting dashboard, usage analytics, endpoints, alerts, and webhooks.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal, Key, Gauge, BarChart3, Globe, Bell, Webhook, Shield, AlertTriangle,
  CheckCircle2, XCircle, Clock, TrendingUp, ArrowUpRight, RefreshCw, Filter,
  Settings, Zap, Eye, ExternalLink, X,
} from 'lucide-react';
import {
  ApiKey, ApiEndpoint, ApiUsageMetrics, RateLimitStatus,
  ApiGatewayAlert, ApiWebhook, HttpVerb,
} from '../../types/apiGateway';
import { ApiGatewayService } from '../../services/ApiGatewayService';
import { ApiKeyManager } from '../../components/Enterprise/ApiKeyManager';
import { RateLimitDashboard } from '../../components/Enterprise/RateLimitDashboard';
import { ApiUsageAnalytics } from '../../components/Enterprise/ApiUsageAnalytics';

type PageView = 'keys' | 'rateLimits' | 'analytics' | 'endpoints' | 'alerts' | 'webhooks';

const VIEW_TABS: Array<{ id: PageView; label: string; icon: React.ReactNode; badge?: string }> = [
  { id: 'keys', label: 'API Keys', icon: <Key className="h-4 w-4" /> },
  { id: 'rateLimits', label: 'Rate Limits', icon: <Gauge className="h-4 w-4" /> },
  { id: 'analytics', label: 'Usage Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'endpoints', label: 'Endpoints', icon: <Globe className="h-4 w-4" /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell className="h-4 w-4" /> },
  { id: 'webhooks', label: 'Webhooks', icon: <Webhook className="h-4 w-4" /> },
];

const ALERT_SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  LOW: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: <Bell className="h-4 w-4" /> },
  MEDIUM: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', icon: <AlertTriangle className="h-4 w-4" /> },
  HIGH: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', icon: <AlertTriangle className="h-4 w-4" /> },
  CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: <XCircle className="h-4 w-4" /> },
};

const METHOD_COLORS: Record<HttpVerb, string> = {
  GET: 'bg-emerald-500/200/20 text-emerald-400 border-emerald-500/30',
  POST: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30',
  PUT: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30',
  PATCH: 'bg-purple-500/200/20 text-purple-400 border-purple-500/30',
  DELETE: 'bg-red-500/200/20 text-red-400 border-red-500/30',
  OPTIONS: 'bg-surface-secondary text-text-secondary border-border-theme',
  HEAD: 'bg-surface-secondary text-text-secondary border-border-theme',
};

const ENDPOINT_STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/200/20 text-emerald-400 border-emerald-500/30',
  DEPRECATED: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30',
  MAINTENANCE: 'bg-purple-500/200/20 text-purple-400 border-purple-500/30',
  DISABLED: 'bg-surface-secondary text-text-secondary border-border-theme',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatTimeAgo(timestamp: string | undefined): string {
  if (!timestamp) return 'Never';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Endpoints Panel ──────────────────────────────────────────────────────────

const EndpointsPanel: React.FC<{ endpoints: ApiEndpoint[]; isLoading: boolean }> = ({ endpoints, isLoading }) => {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<HttpVerb | 'ALL'>('ALL');

  const filtered = endpoints.filter(ep => {
    if (search && !ep.path.toLowerCase().includes(search.toLowerCase()) && !ep.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (methodFilter !== 'ALL' && ep.method !== methodFilter) return false;
    return true;
  });

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search endpoints..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={methodFilter}
          onChange={e => setMethodFilter(e.target.value as HttpVerb | 'ALL')}
          className="px-3 py-2.5 text-xs font-bold bg-surface border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(ep => (
          <div key={ep.id} className="bg-surface rounded-xl border border-border-theme p-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${METHOD_COLORS[ep.method]}`}>{ep.method}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono font-bold text-text-primary">{ep.path}</code>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${ENDPOINT_STATUS_COLORS[ep.status]}`}>{ep.status}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{ep.description}</p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-text-muted">
                  <span>{formatNumber(ep.totalRequests)} reqs</span>
                  <span>{ep.avgLatencyMs}ms avg</span>
                  <span>{ep.p99LatencyMs}ms p99</span>
                  <span className={ep.errorRate > 2 ? 'text-red-500 font-bold' : ''}>{ep.errorRate}% errors</span>
                  <span>{ep.version}</span>
                  {ep.deprecatedSince && <span className="text-amber-400">Since {ep.deprecatedSince}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Alerts Panel ─────────────────────────────────────────────────────────────

const AlertsPanel: React.FC<{ alerts: ApiGatewayAlert[]; isLoading: boolean }> = ({ alerts, isLoading }) => {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const sev = ALERT_SEVERITY_COLORS[alert.severity] || ALERT_SEVERITY_COLORS.MEDIUM;
        const isResolved = !!alert.resolvedAt;

        return (
          <div key={alert.id} className={`bg-surface rounded-xl border overflow-hidden transition-all ${isResolved ? 'opacity-60' : 'shadow-sm'}`}>
            <div className={`px-4 py-2 ${sev.bg} border-b ${sev.border}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {sev.icon}
                  <span className={`text-[10px] font-black uppercase ${sev.text}`}>{alert.severity}</span>
                  <span className="text-[10px] font-bold text-text-muted uppercase">{alert.type.replace(/_/g, ' ')}</span>
                </div>
                {isResolved ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" /> Resolved
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                    <XCircle className="h-3 w-3" /> Active
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-text-primary">{alert.title}</h4>
              <p className="text-xs text-text-muted mt-1">{alert.description}</p>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-text-muted">
                <span>{formatTimeAgo(alert.triggeredAt)}</span>
                <span>Value: <strong className="text-text-primary">{alert.currentValue}</strong> / Threshold: {alert.thresholdValue}</span>
                {alert.acknowledgedBy && <span>Ack by: <strong className="text-text-primary">{alert.acknowledgedBy}</strong></span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Webhooks Panel ───────────────────────────────────────────────────────────

const WebhooksPanel: React.FC<{ webhooks: ApiWebhook[]; isLoading: boolean }> = ({ webhooks, isLoading }) => {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {webhooks.map(wh => (
        <div key={wh.id} className="bg-surface rounded-xl border border-border-theme p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                wh.status === 'ACTIVE' ? 'bg-emerald-500/200' :
                wh.status === 'FAILED' ? 'bg-red-500/200 animate-pulse' :
                wh.status === 'PAUSED' ? 'bg-amber-500/200' : 'bg-slate-300'
              }`} />
              <h4 className="text-sm font-bold text-text-primary">{wh.name}</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                wh.status === 'ACTIVE' ? 'bg-emerald-500/200/20 text-emerald-400' :
                wh.status === 'FAILED' ? 'bg-red-500/200/20 text-red-400' : 'bg-surface-secondary text-text-secondary'
              }`}>{wh.status}</span>
            </div>
          </div>
          <div className="bg-surface rounded-lg p-3 mb-3">
            <span className="text-[10px] font-bold text-text-muted uppercase">URL</span>
            <p className="text-xs font-mono text-text-primary break-all mt-0.5">{wh.url}</p>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {wh.events.map(evt => (
              <span key={evt} className="px-2 py-0.5 bg-indigo-500/200/20 text-indigo-400 rounded text-[10px] font-bold border border-indigo-100">{evt}</span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-text-muted">
            <span>{wh.successCount.toLocaleString()} success</span>
            <span className={wh.failureCount > 10 ? 'text-red-500 font-bold' : ''}>{wh.failureCount} failures</span>
            <span>{wh.avgResponseTimeMs}ms avg</span>
            <span>Last: {formatTimeAgo(wh.lastTriggeredAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Key Detail Modal ─────────────────────────────────────────────────────────

const KeyDetailModal: React.FC<{
  keyData: ApiKey | null;
  isOpen: boolean;
  onClose: () => void;
}> = ({ keyData, isOpen, onClose }) => {
  if (!isOpen || !keyData) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start p-4 pt-16 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface rounded-3xl shadow-2xl max-w-2xl w-full border border-border-theme overflow-hidden mb-16">
        <div className="px-6 py-5 border-b border-border-theme flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/200/20 text-indigo-400 border border-indigo-500/30">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">{keyData.name}</h3>
              <p className="text-xs text-text-muted font-mono">{keyData.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-border-theme text-text-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto no-scrollbar">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface rounded-xl p-3 border border-border-theme">
              <span className="text-[10px] font-bold text-text-muted uppercase">Status</span>
              <p className="text-sm font-bold text-text-primary mt-0.5">{keyData.status}</p>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-border-theme">
              <span className="text-[10px] font-bold text-text-muted uppercase">Scope</span>
              <p className="text-sm font-bold text-text-primary mt-0.5">{keyData.scope.replace(/_/g, ' ')}</p>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-border-theme">
              <span className="text-[10px] font-bold text-text-muted uppercase">Environment</span>
              <p className="text-sm font-bold text-text-primary mt-0.5">{keyData.environment}</p>
            </div>
            <div className="bg-surface rounded-xl p-3 border border-border-theme">
              <span className="text-[10px] font-bold text-text-muted uppercase">Owner</span>
              <p className="text-sm font-bold text-text-primary mt-0.5">{keyData.ownerName}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-500/200/20 rounded-xl p-3 border border-indigo-500/30">
              <span className="text-[10px] font-bold text-indigo-400 uppercase">Requests</span>
              <p className="text-lg font-black text-indigo-400">{formatNumber(keyData.totalRequests)}</p>
            </div>
            <div className="bg-amber-500/200/20 rounded-xl p-3 border border-amber-500/30">
              <span className="text-[10px] font-bold text-amber-400 uppercase">Error Rate</span>
              <p className="text-lg font-black text-amber-400">{keyData.errorRate}%</p>
            </div>
            <div className="bg-emerald-500/200/20 rounded-xl p-3 border border-emerald-500/30">
              <span className="text-[10px] font-bold text-emerald-400 uppercase">Avg Latency</span>
              <p className="text-lg font-black text-emerald-400">{keyData.avgLatencyMs}ms</p>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Permissions</span>
            <div className="flex flex-wrap gap-1.5">
              {keyData.permissions.map(p => (
                <span key={p} className="px-2.5 py-1 bg-indigo-500/200/20 text-indigo-400 rounded-lg text-[11px] font-bold border border-indigo-100">{p}</span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Tags</span>
            <div className="flex flex-wrap gap-1.5">
              {keyData.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-surface-secondary text-text-secondary rounded-lg text-[11px] font-bold">{tag}</span>
              ))}
            </div>
          </div>

          {keyData.revokeReason && (
            <div className="bg-red-500/200/20 rounded-xl p-3 border border-red-500/30">
              <span className="text-[10px] font-bold text-red-400 uppercase">Revoke Reason</span>
              <p className="text-sm text-red-400 mt-0.5">{keyData.revokeReason}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-theme bg-surface/50 flex items-center justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-white bg-primary-blue hover:bg-indigo-700 rounded-xl transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const ApiGatewayHub: React.FC = () => {
  const [activeView, setActiveView] = useState<PageView>('keys');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [metrics, setMetrics] = useState<ApiUsageMetrics | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus[]>([]);
  const [alerts, setAlerts] = useState<ApiGatewayAlert[]>([]);
  const [webhooks, setWebhooks] = useState<ApiWebhook[]>([]);

  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [isLoadingEndpoints, setIsLoadingEndpoints] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingRateLimits, setIsLoadingRateLimits] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true);

  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);

  const loadKeys = useCallback(async () => {
    setIsLoadingKeys(true);
    const data = await ApiGatewayService.getApiKeys();
    setApiKeys(data);
    setIsLoadingKeys(false);
  }, []);

  const loadMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    const data = await ApiGatewayService.getUsageMetrics();
    setMetrics(data);
    setIsLoadingMetrics(false);
  }, []);

  const loadRateLimits = useCallback(async () => {
    setIsLoadingRateLimits(true);
    const keys = await ApiGatewayService.getApiKeys();
    const statusList: RateLimitStatus[] = keys.filter(k => k.status === 'ACTIVE').map(k => ({
      keyId: k.id,
      keyName: k.name,
      currentUsage: Math.round(Math.random() * k.rateLimit.limits[1]?.maxRequests || 1000),
      maxUsage: k.rateLimit.limits[1]?.maxRequests || 1000,
      usagePercentage: 0,
      windowStart: new Date(Date.now() - 3600000).toISOString(),
      windowEnd: new Date(Date.now()).toISOString(),
      isThrottled: Math.random() > 0.85,
      retryAfterMs: Math.random() > 0.85 ? 5000 : undefined,
      historicalUsage: Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        requests: Math.round(Math.random() * (k.rateLimit.limits[1]?.maxRequests || 1000) * 0.8),
        blocked: Math.random() > 0.7 ? Math.round(Math.random() * 50) : 0,
        latencyP50: Math.round(Math.random() * 150 + 50),
        latencyP99: Math.round(Math.random() * 500 + 200),
      })),
    }));
    statusList.forEach(s => { s.usagePercentage = s.maxUsage > 0 ? Math.round((s.currentUsage / s.maxUsage) * 100) : 0; });
    setRateLimitStatus(statusList);
    setIsLoadingRateLimits(false);
  }, []);

  useEffect(() => { loadKeys(); loadMetrics(); }, [loadKeys, loadMetrics]);

  useEffect(() => {
    if (activeView === 'rateLimits' && rateLimitStatus.length === 0) loadRateLimits();
    if (activeView === 'endpoints' && endpoints.length === 0) {
      setIsLoadingEndpoints(true);
      ApiGatewayService.getEndpoints().then(data => { setEndpoints(data); setIsLoadingEndpoints(false); });
    }
    if (activeView === 'alerts' && alerts.length === 0) {
      setIsLoadingAlerts(true);
      ApiGatewayService.getAlerts().then(data => { setAlerts(data); setIsLoadingAlerts(false); });
    }
    if (activeView === 'webhooks' && webhooks.length === 0) {
      setIsLoadingWebhooks(true);
      ApiGatewayService.getWebhooks().then(data => { setWebhooks(data); setIsLoadingWebhooks(false); });
    }
  }, [activeView]);

  const activeKeyCount = apiKeys.filter(k => k.status === 'ACTIVE').length;
  const unresolvedAlerts = alerts.filter(a => !a.resolvedAt).length;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 font-sans">
      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-surface p-6 rounded-3xl border border-border-theme shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-surface-secondary text-text-secondary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-border-theme">
                <Terminal className="h-4 w-4" /> Developer Platform
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">API Gateway Manager</h1>
            <p className="text-sm text-text-muted mt-2 max-w-xl">
              Manage API keys, rate limits, usage analytics, endpoints, alerts, and webhook configurations.
            </p>
          </div>
          <button
            onClick={() => { loadKeys(); loadMetrics(); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-bold text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">API Keys</span>
            <p className="text-2xl font-black text-text-primary mt-1">{apiKeys.length}</p>
            <span className="text-xs text-text-secondary">{activeKeyCount} active</span>
          </div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Endpoints</span>
            <p className="text-2xl font-black text-text-primary mt-1">{endpoints.length}</p>
            <span className="text-xs text-text-secondary">{endpoints.filter(e => e.status === 'ACTIVE').length} active</span>
          </div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Requests</span>
            <p className="text-2xl font-black text-text-primary mt-1">{metrics ? `${(metrics.totalRequests / 1_000_000).toFixed(1)}M` : '...'}</p>
            <span className="text-xs text-text-secondary">{metrics?.errorRate}% error rate</span>
          </div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Alerts</span>
            <p className={`text-2xl font-black mt-1 ${unresolvedAlerts > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{unresolvedAlerts}</p>
            <span className="text-xs text-text-secondary">{alerts.length} total</span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-surface p-1.5 rounded-xl border border-border-theme shadow-sm overflow-x-auto">
          {VIEW_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeView === tab.id ? 'bg-primary-blue text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-surface-secondary'
              }`}
            >
              {tab.icon} {tab.label}
              {tab.id === 'alerts' && unresolvedAlerts > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  activeView === tab.id ? 'bg-surface/20 text-white' : 'bg-red-500/200/20 text-red-400'
                }`}>{unresolvedAlerts}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeView === 'keys' && <ApiKeyManager keys={apiKeys} isLoading={isLoadingKeys} onSelectKey={setSelectedKey} />}
        {activeView === 'rateLimits' && <RateLimitDashboard statusList={rateLimitStatus} isLoading={isLoadingRateLimits} />}
        {activeView === 'analytics' && <ApiUsageAnalytics metrics={metrics} isLoading={isLoadingMetrics} />}
        {activeView === 'endpoints' && <EndpointsPanel endpoints={endpoints} isLoading={isLoadingEndpoints} />}
        {activeView === 'alerts' && <AlertsPanel alerts={alerts} isLoading={isLoadingAlerts} />}
        {activeView === 'webhooks' && <WebhooksPanel webhooks={webhooks} isLoading={isLoadingWebhooks} />}
      </div>

      {/* Key Detail Modal */}
      <KeyDetailModal keyData={selectedKey} isOpen={selectedKey !== null} onClose={() => setSelectedKey(null)} />
    </div>
  );
};

export default ApiGatewayHub;

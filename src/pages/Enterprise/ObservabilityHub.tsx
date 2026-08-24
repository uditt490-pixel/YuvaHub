// ═══════════════════════════════════════════════════════════════════
// Enterprise Observability & Uptime Monitor Hub — Main Page
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye, Activity, GitBranch, Shield, AlertTriangle, Clock,
  Search, Filter, RefreshCw, Download, Calendar,
  ChevronDown, Bell, Settings, CheckCircle2, X,
  Monitor, Server, Link2, Target, Zap, MoreVertical,
  ExternalLink, ArrowLeft
} from 'lucide-react';
import { ObservabilityMetricsCard } from '../../components/Enterprise/ObservabilityMetricsCard';
import { ServiceDependencyGraph } from '../../components/Enterprise/ServiceDependencyGraph';
import { UptimeIncidentTimeline } from '../../components/Enterprise/UptimeIncidentTimeline';
import { SLATracker } from '../../components/Enterprise/SLATracker';
import { ObservabilityService } from '../../services/ObservabilityService';
import {
  MonitoredService, ServiceGroup, Incident, FilterState,
  OverallHealthScore, DependencyNode, DependencyEdge, SLATarget,
  ServiceStatus
} from '../../types/observability';

type ActiveTab = 'overview' | 'services' | 'dependencies' | 'incidents' | 'sla';

const TAB_CONFIG: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; count?: number }> = [
  { id: 'overview', label: 'Overview', icon: <Eye className="h-4 w-4" /> },
  { id: 'services', label: 'Services', icon: <Server className="h-4 w-4" /> },
  { id: 'dependencies', label: 'Dependencies', icon: <GitBranch className="h-4 w-4" /> },
  { id: 'incidents', label: 'Incidents', icon: <AlertTriangle className="h-4 w-4" /> },
  { id: 'sla', label: 'SLA Targets', icon: <Target className="h-4 w-4" /> }
];

const STATUS_OPTIONS: Array<{ value: ServiceStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'operational', label: 'Operational' },
  { value: 'degraded', label: 'Degraded' },
  { value: 'partial_outage', label: 'Partial Outage' },
  { value: 'major_outage', label: 'Major Outage' },
  { value: 'maintenance', label: 'Maintenance' }
];

const STATUS_COLORS: Record<ServiceStatus, { bg: string; text: string; dot: string }> = {
  operational: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  degraded: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  partial_outage: { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  major_outage: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  maintenance: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' }
};

export const ObservabilityHub: React.FC = () => {
  // ─── State ─────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [healthScore, setHealthScore] = useState<OverallHealthScore | null>(null);
  const [services, setServices] = useState<MonitoredService[]>([]);
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dependencies, setDependencies] = useState<{ nodes: DependencyNode[]; edges: DependencyEdge[] }>({ nodes: [], edges: [] });
  const [slaTargets, setSlaTargets] = useState<SLATarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    statusFilter: 'all',
    severityFilter: 'all',
    groupFilter: '',
    searchQuery: '',
    timeRange: '24h'
  });

  // ─── Data Loading ──────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [score, svcList, groupList, incidentList, depData, slaData] = await Promise.all([
        ObservabilityService.getHealthScore(),
        ObservabilityService.getServices(filters),
        ObservabilityService.getGroups(),
        ObservabilityService.getIncidents(filters),
        ObservabilityService.getDependencies(),
        ObservabilityService.getSLATargets()
      ]);
      setHealthScore(score);
      setServices(svcList);
      setGroups(groupList);
      setIncidents(incidentList);
      setDependencies(depData);
      setSlaTargets(slaData);
    } catch (err) {
      setError('Failed to load observability data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(loadAllData, 200);
    return () => clearTimeout(timer);
  }, [loadAllData]);

  // Auto-refresh
  useEffect(() => {
    if (!isAutoRefreshing) return;
    const interval = setInterval(loadAllData, 30000);
    return () => clearInterval(interval);
  }, [isAutoRefreshing, loadAllData]);

  // ─── Active Incident Count for Badge ───────────────────────
  const activeIncidentCount = incidents.filter(i => i.state !== 'resolved' && i.state !== 'closed').length;

  // ─── Render Helpers ────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <ObservabilityMetricsCard
              healthScore={healthScore}
              services={services}
              isLoading={isLoading}
              onRefresh={loadAllData}
            />

            {/* Quick Incident Summary */}
            {activeIncidentCount > 0 && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <Zap className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-800">Active Incidents ({activeIncidentCount})</h3>
                    <p className="text-xs text-red-600">Immediate attention required</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('incidents')}
                    className="ml-auto px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
                <div className="space-y-2">
                  {incidents.filter(i => i.state === 'investigating' || i.state === 'identified').slice(0, 3).map(inc => (
                    <div key={inc.id} className="flex items-center gap-3 px-4 py-2.5 bg-white/80 rounded-xl border border-red-100">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-red-500">{inc.severity}</span>
                      <span className="text-sm font-medium text-slate-800 truncate flex-1">{inc.title}</span>
                      <span className="text-xs text-slate-500 capitalize">{inc.state}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Status Overview */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Server className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-800">Service Status</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.slice(0, 9).map(svc => {
                  const colors = STATUS_COLORS[svc.status];
                  return (
                    <div key={svc.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all">
                      <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} flex-shrink-0`}>
                        {svc.status !== 'operational' && svc.status !== 'maintenance' && (
                          <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} animate-ping opacity-75`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{svc.name}</div>
                        <div className="text-xs text-slate-400">{svc.responseTimeMs}ms · {svc.uptimePercentage30d}%</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${colors.bg} ${colors.text}`}>
                        {svc.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick SLA Overview */}
            <SLATracker slaTargets={slaTargets.slice(0, 4)} isLoading={isLoading} />
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative flex-1 w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    value={filters.searchQuery}
                    onChange={(e) => setFilters(f => ({ ...f, searchQuery: e.target.value, statusFilter: f.statusFilter }))}
                  />
                </div>
                <select
                  className="appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  value={filters.statusFilter}
                  onChange={(e) => setFilters(f => ({ ...f, statusFilter: e.target.value as ServiceStatus | 'all' }))}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <select
                  className="appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  value={filters.groupFilter}
                  onChange={(e) => setFilters(f => ({ ...f, groupFilter: e.target.value }))}
                >
                  <option value="">All Groups</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Services Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-6 py-3 font-semibold text-slate-600">Service</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Response</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Uptime (30d)</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Error Rate</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Requests/s</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Dependencies</th>
                      <th className="text-center px-4 py-3 font-semibold text-slate-600">Last Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                          <td className="px-4 py-4"><div className="h-5 bg-slate-200 rounded w-20 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-16 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-14 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-12 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-14 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-8 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-slate-200 rounded w-20 mx-auto" /></td>
                        </tr>
                      ))
                    ) : (
                      services.map(svc => {
                        const colors = STATUS_COLORS[svc.status];
                        return (
                          <tr key={svc.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                                <div>
                                  <div className="font-semibold text-slate-800">{svc.name}</div>
                                  <div className="text-xs text-slate-400 truncate max-w-[200px]">{svc.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${colors.bg} ${colors.text}`}>
                                {svc.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`font-mono font-bold ${svc.responseTimeMs > 500 ? 'text-red-600' : svc.responseTimeMs > 200 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {svc.responseTimeMs}ms
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`font-bold ${svc.uptimePercentage30d >= 99.9 ? 'text-emerald-600' : svc.uptimePercentage30d >= 99 ? 'text-amber-600' : 'text-red-600'}`}>
                                {svc.uptimePercentage30d}%
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`font-mono font-bold ${svc.errorRate < 1 ? 'text-emerald-600' : svc.errorRate < 3 ? 'text-amber-600' : 'text-red-600'}`}>
                                {svc.errorRate}%
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center font-mono text-slate-600">
                              {svc.requestRate.toLocaleString()}
                            </td>
                            <td className="px-4 py-4 text-center font-mono text-slate-600">
                              {svc.dependencies.length}
                            </td>
                            <td className="px-4 py-4 text-center text-xs text-slate-500">
                              {new Date(svc.lastHealthCheck).toLocaleTimeString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {!isLoading && services.length === 0 && (
                <div className="p-8 text-center">
                  <Server className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No services match your filters</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'dependencies':
        return (
          <ServiceDependencyGraph
            nodes={dependencies.nodes}
            edges={dependencies.edges}
            isLoading={isLoading}
          />
        );

      case 'incidents':
        return (
          <UptimeIncidentTimeline
            incidents={incidents}
            isLoading={isLoading}
            selectedIncidentId={selectedIncidentId}
            onIncidentSelect={setSelectedIncidentId}
          />
        );

      case 'sla':
        return (
          <SLATracker
            slaTargets={slaTargets}
            isLoading={isLoading}
          />
        );

      default:
        return null;
    }
  };

  // ─── Main Render ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">

        {/* Page Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 rounded-full flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Enterprise
                </span>
                {healthScore && (
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 ${
                    healthScore.score >= 90 ? 'text-emerald-700 bg-emerald-100' : healthScore.score >= 70 ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100'
                  }`}>
                    <Activity className="h-3 w-3" />
                    Health: {healthScore.score}%
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Observability & Uptime Monitor
              </h1>
              <p className="text-slate-500 mt-1">
                Real-time system health monitoring, incident management, and SLA compliance tracking.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto-refresh Toggle */}
              <button
                onClick={() => setIsAutoRefreshing(!isAutoRefreshing)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  isAutoRefreshing
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isAutoRefreshing ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                Auto-refresh {isAutoRefreshing ? 'ON' : 'OFF'}
              </button>

              {/* Refresh */}
              <button
                onClick={loadAllData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all font-medium text-sm shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {/* Time Range */}
              <select
                className="appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                value={filters.timeRange}
                onChange={(e) => setFilters(f => ({ ...f, timeRange: e.target.value as FilterState['timeRange'] }))}
              >
                <option value="1h">Last 1 Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="p-1 rounded hover:bg-red-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 overflow-x-auto">
            {TAB_CONFIG.map(tab => {
              const isActive = activeTab === tab.id;
              const badge = tab.id === 'incidents' && activeIncidentCount > 0 ? activeIncidentCount : undefined;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white min-w-[20px] text-center">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <main>
          {renderTabContent()}
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>Observability Hub · Powered by YuvaHub Enterprise · Real-time monitoring at scale</p>
        </footer>
      </div>
    </div>
  );
};

export default ObservabilityHub;

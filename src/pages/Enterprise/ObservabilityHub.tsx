import React, { useState, useEffect } from 'react';
import { ObservabilityService } from '../../services/ObservabilityService';
import { ServiceMetric, Incident, SLAMetrics, SystemHealthScore } from '../../types/observability';
import { ObservabilityMetricsCard } from '../../components/Enterprise/ObservabilityMetricsCard';
import { ServiceDependencyGraph } from '../../components/Enterprise/ServiceDependencyGraph';
import { UptimeIncidentTimeline } from '../../components/Enterprise/UptimeIncidentTimeline';
import { SLATracker } from '../../components/Enterprise/SLATracker';
import { ShieldCheck, AlertTriangle, RefreshCw, Layers, Calendar, Search, Filter } from 'lucide-react';

export const ObservabilityHub: React.FC = () => {
  const [metrics, setMetrics] = useState<ServiceMetric[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sla, setSla] = useState<SLAMetrics>({ targetUptime: 99.9, currentUptime: 99.87, errorBudgetRemaining: 12.4, burnRate: 1.4 });
  const [healthScore, setHealthScore] = useState<SystemHealthScore>({ overallScore: 92, totalServices: 5, operationalServices: 4, degradedServices: 1, outageServices: 0 });
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [activeTab, setActiveTab] = useState<'overview' | 'dependencies' | 'incidents' | 'sla'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchData = () => {
    setMetrics(ObservabilityService.getServiceMetrics());
    setIncidents(ObservabilityService.getActiveIncidents());
    setSla(ObservabilityService.getSLATracking());
    setHealthScore(ObservabilityService.getSystemHealthScore());
  };

  useEffect(() => {
    fetchData();
    if (!autoRefresh) return;
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, timeRange]);

  const filteredMetrics = metrics.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5 border-border-theme">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-white">Enterprise Observability Hub</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/200/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
                Enterprise
              </span>
            </div>
            <p className="text-sm text-text-muted mt-1">Real-time system health topology telemetry, service dependencies, and SLA error budgets.</p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3.5 py-2 border rounded-xl bg-primary-blue border-border-theme text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="1h">Last 1 Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                autoRefresh 
                  ? 'bg-emerald-500/200/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-primary-blue text-text-muted border-border-theme hover:bg-surface-secondary'
              }`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Auto-Refresh On (30s)' : 'Auto-Refresh Off'}
            </button>
          </div>
        </div>

        {/* Primary Animated Health Metrics Dashboard */}
        <ObservabilityMetricsCard healthScore={healthScore} metrics={metrics} />

        {/* Primary Tab Navigation */}
        <div className="flex gap-2 border-b border-border-theme">
          {(['overview', 'dependencies', 'incidents', 'sla'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all -mb-px ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/200/5'
                  : 'border-transparent text-text-muted hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Tab Views */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Active Incidents Alert Ribbon */}
            {incidents.length > 0 && (
              <div className="p-4 bg-amber-500/200/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-amber-300">Active Structural Disruptions ({incidents.length})</h4>
                  {incidents.map((inc) => (
                    <p key={inc.id} className="text-xs text-amber-200/90">
                      <span className="font-bold bg-amber-500/200/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px] mr-2">{inc.severity}</span>
                      {inc.title} — Status: <span className="italic font-semibold">{inc.status}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Filterable Search & Status Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-primary-blue p-4 border border-border-theme rounded-2xl">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search microservices by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-border-theme rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="h-4 w-4 text-text-muted" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-border-theme rounded-xl text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="operational">Operational</option>
                  <option value="degraded">Degraded</option>
                  <option value="outage">Outage</option>
                </select>
              </div>
            </div>

            {/* Service Inventory Status Table */}
            <div className="bg-primary-blue border border-border-theme rounded-3xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 border-b border-border-theme text-text-muted font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Service Name & ID</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">24h Uptime</th>
                    <th className="px-6 py-4">Mean Latency</th>
                    <th className="px-6 py-4">Error Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredMetrics.map((svc) => (
                    <tr key={svc.id} className="hover:bg-slate-850/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-white text-sm">{svc.name}</div>
                        <code className="text-[11px] text-indigo-400 font-mono">{svc.id}</code>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase ${
                          svc.status === 'operational' ? 'bg-emerald-500/200/10 text-emerald-400 border border-emerald-500/20' :
                          svc.status === 'degraded' ? 'bg-amber-500/200/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {svc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{svc.uptime24h}%</td>
                      <td className="px-6 py-4 font-bold text-white">{svc.latencyMs} ms</td>
                      <td className="px-6 py-4 font-bold text-white">{svc.errorRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'dependencies' && <ServiceDependencyGraph services={metrics} />}

        {activeTab === 'incidents' && <UptimeIncidentTimeline incidents={incidents} />}

        {activeTab === 'sla' && <SLATracker sla={sla} />}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, Clock, Database, 
  Server, ShieldAlert, XCircle, RotateCw, Play, BarChart3, AlertOctagon,
  Search, ChevronDown, ChevronUp, Terminal, Filter, RefreshCw, Check, X
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import AdminExpiryDashboard from '../tabs/AdminExpiryDashboard';

interface ScraperItem {
  name: string;
  status: 'healthy' | 'degraded' | 'failing' | string;
  lastRun: string;
  items: number;
  failures: number;
  proxyHealth?: string;
}

interface ScraperLog {
  id: string;
  sourceName: string;
  status: 'success' | 'error' | string;
  startTime: string;
  endTime: string;
  durationMs: number;
  opportunitiesAdded: number;
  statusCode: number;
  errorMessage: string | null;
  stackTrace: string | null;
}

const chartData = [
  { name: 'Mon', activeUsers: 1200, oppsAdded: 40 },
  { name: 'Tue', activeUsers: 1250, oppsAdded: 35 },
  { name: 'Wed', activeUsers: 1400, oppsAdded: 50 },
  { name: 'Thu', activeUsers: 1350, oppsAdded: 60 },
  { name: 'Fri', activeUsers: 1540, oppsAdded: 80 },
  { name: 'Sat', activeUsers: 1480, oppsAdded: 128 },
  { name: 'Sun', activeUsers: 1520, oppsAdded: 90 },
];

const AdminDashboard = () => {
  const { user } = useAppContext();
  const [activeTab, setActiveTab] = useState<'telemetry' | 'moderation' | 'expiry'>('telemetry');
  
  const [stats, setStats] = useState({
    activeUsers: 1540,
    opportunitiesAdded: 128,
    fallbackRate: 1.8,
    apiLatency: 95,
    healthPercentage: 98.5,
    totalExecutions: 342,
    failedExecutions: 2
  });

  const [scrapers, setScrapers] = useState<ScraperItem[]>([
    { name: 'Devpost Scraper', status: 'healthy', lastRun: '15m ago', items: 42, failures: 0, proxyHealth: 'green' },
    { name: 'Unstop Scraper', status: 'degraded', lastRun: '45m ago', items: 18, failures: 1, proxyHealth: 'amber' },
    { name: 'BullMQ Queue', status: 'healthy', lastRun: 'Live', items: 56, failures: 0, proxyHealth: 'green' }
  ]);

  const [healthMetrics, setHealthMetrics] = useState<any>(null);
  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [moderationReports, setModerationReports] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [triggeringSource, setTriggeringSource] = useState<string | null>(null);

  // Search & Filter state for Logs
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setRefreshing(true);
    const token = await user?.getIdToken?.() || localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    try {
      const [statsRes, scrapersRes, modRes, healthRes] = await Promise.all([
        fetch('/api/v1/admin/scraper-stats', { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/v1/admin/scrapers', { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/v1/reports/queue', { headers }).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/v1/admin/scraper-health', { headers }).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);

      if (statsRes && !statsRes.error) {
        setStats(prev => ({ ...prev, ...statsRes }));
      }
      if (healthRes?.data?.sources) {
        setHealthMetrics(healthRes.data);
      }
      const scrapersList = Array.isArray(scrapersRes) ? scrapersRes : (scrapersRes?.items ?? scrapersRes?.data ?? []);
      if (scrapersRes && scrapersList.length > 0) {
        setScrapers(scrapersList);
      }
      const modList = Array.isArray(modRes) ? modRes : (modRes?.items ?? modRes?.data ?? []);
      if (modRes && Array.isArray(modList)) {
        setModerationReports(modList);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRunScraper = async (sourceName: string) => {
    setTriggeringSource(sourceName);
    const token = await user?.getIdToken?.() || localStorage.getItem('token');
    try {
      const res = await fetch('/api/v1/admin/trigger-scraper', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ source_name: sourceName })
      });
      const data = await res.json();
      if (data.log) {
        setLogs(prev => [data.log, ...prev]);
      }
      fetchDashboardData();
    } catch (err) {
      console.error(`Failed to trigger scraper for ${sourceName}:`, err);
    } finally {
      setTriggeringSource(null);
    }
  };

  const handleModerate = async (id: string, action: 'approve' | 'reject' | 'dismiss' | 'remove' | 'ban' | string) => {
    const token = await user?.getIdToken?.() || localStorage.getItem('token');
    try {
      await fetch(`/api/v1/reports/${id}/resolve`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      setModerationReports(prev => prev.filter(rep => (rep._id || rep.id) !== id));
    } catch (err) {
      console.error(`Failed to ${action} opp:`, err);
    }
  };

  // Filtered logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.sourceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (log.errorMessage || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleAccordion = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  // Access Protection Check
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = Boolean(
    user?.role === 'admin' || 
    user?.isAdmin || 
    (user?.email && adminEmails.includes(user.email.toLowerCase())) || 
    (import.meta.env.DEV && user?.email)
  );

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-surface rounded-2xl border border-red-200 text-center space-y-4 shadow-xs">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-serif font-bold text-text-primary">Admin Panel Access Restricted</h2>
        <p className="text-xs text-text-secondary max-w-md mx-auto">
          You must be logged in as an authorized administrator to view the central scraper telemetry dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface p-6 rounded-2xl border border-border-theme shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-text-primary">Central Scraper Telemetry</h1>
              <p className="text-xs text-text-secondary">Real-time scraper telemetry, execution logs & data ingestion monitoring.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="flex bg-background border border-border-theme p-1 rounded-xl text-xs font-bold">
            <button 
              onClick={() => setActiveTab('telemetry')}
              className={`px-4 py-2 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'telemetry' ? 'bg-primary-blue text-white shadow-xs font-extrabold' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Telemetry
            </button>
            <button 
              onClick={() => setActiveTab('moderation')}
              className={`px-4 py-2 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'moderation' ? 'bg-primary-blue text-white shadow-xs font-extrabold' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Moderation Queue
              {moderationReports.length > 0 && <span className="ml-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">{moderationReports.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('expiry')}
              className={`px-4 py-2 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'expiry' ? 'bg-primary-blue text-white shadow-xs font-extrabold' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Expiry Management
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="px-3.5 py-2 bg-surface border border-border-theme hover:bg-surface-secondary rounded-xl text-xs font-extrabold uppercase tracking-wider text-text-secondary flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'telemetry' ? (
        <>
          {/* Top Telemetry Vitals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface p-5 rounded-2xl border border-border-theme shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary mb-1 flex items-center justify-between">
                Active Scrapers <Server className="w-4 h-4 text-primary-blue" />
              </div>
              <div className="text-2xl font-serif font-bold text-text-primary flex items-baseline gap-2 mt-1">
                {scrapers.filter(s => s.status !== 'failing').length} / {scrapers.length}
                <span className="text-xs font-bold text-emerald-700">Active</span>
              </div>
            </div>

            <div className="bg-surface p-5 rounded-2xl border border-border-theme shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary mb-1 flex items-center justify-between">
                Data Ingested (24h) <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                +{stats.opportunitiesAdded || 128} <span className="text-xs text-text-muted font-sans font-normal">items</span>
              </div>
            </div>

            <div className="bg-surface p-5 rounded-2xl border border-border-theme shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary mb-1 flex items-center justify-between">
                Active Users <BarChart3 className="w-4 h-4 text-primary-blue" />
              </div>
              <div className="text-2xl font-serif font-bold text-primary-blue mt-1">
                {stats.activeUsers || 1540}
              </div>
            </div>

            <div className="bg-surface p-5 rounded-2xl border border-border-theme shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary mb-1 flex items-center justify-between">
                Total Cron Executions <Clock className="w-4 h-4 text-text-muted" />
              </div>
              <div className="text-2xl font-serif font-bold text-text-primary mt-1">
                {stats.totalExecutions || 342}
              </div>
            </div>
          </div>

          {/* Recharts Analytics */}
          <div className="bg-surface p-6 rounded-2xl border border-border-theme shadow-xs">
            <h3 className="text-base font-serif font-bold text-text-primary mb-6">Platform Analytics (Past 7 Days)</h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#b56b37" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#b56b37" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOpps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8ded1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#603620', fontSize: 11}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#603620', fontSize: 11}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#603620', fontSize: 11}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e8ded1', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="activeUsers" stroke="#b56b37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                  <Area yAxisId="right" type="monotone" dataKey="oppsAdded" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOpps)" name="Opportunities Added" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scraper Health Dashboard Panel (#585) */}
          <div className="bg-surface rounded-2xl border border-border-theme shadow-xs space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border-theme pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-text-primary">Scraper Reliability & Performance Health</h3>
                <p className="text-xs text-text-secondary">Live monitoring of source reliability, response times, failure counts & success rates.</p>
              </div>
              {healthMetrics?.summary && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full uppercase">
                    Success Rate: {healthMetrics.summary.overallSuccessRate}%
                  </span>
                  <span className="text-[10px] font-extrabold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full uppercase">
                    Avg Response: {healthMetrics.summary.avgResponseTimeMs} ms
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(healthMetrics?.sources || [
                { name: 'Devpost', status: 'healthy', lastSuccessfulScrape: new Date().toISOString(), failureCount: 0, successRate: 98.5, responseTimeMs: 420, opportunitiesCollected: 42 },
                { name: 'Unstop', status: 'degraded', lastSuccessfulScrape: new Date(Date.now() - 300000).toISOString(), failureCount: 1, successRate: 92.0, responseTimeMs: 650, opportunitiesCollected: 18 },
                { name: 'MLH', status: 'healthy', lastSuccessfulScrape: new Date().toISOString(), failureCount: 0, successRate: 100.0, responseTimeMs: 380, opportunitiesCollected: 25 },
                { name: 'Kaggle', status: 'healthy', lastSuccessfulScrape: new Date().toISOString(), failureCount: 0, successRate: 99.0, responseTimeMs: 490, opportunitiesCollected: 12 },
                { name: 'AICTE', status: 'healthy', lastSuccessfulScrape: new Date().toISOString(), failureCount: 0, successRate: 95.5, responseTimeMs: 510, opportunitiesCollected: 15 },
              ]).map((hs: any) => {
                const isFailing = hs.status === 'failing' || hs.failureCount > 3;
                return (
                  <div
                    key={hs.name}
                    className={`rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all border ${
                      isFailing
                        ? 'bg-red-50/50 border-red-300 ring-1 ring-red-400'
                        : hs.status === 'degraded'
                        ? 'bg-amber-50/40 border-amber-300'
                        : 'bg-background border-border-theme hover:border-primary-blue'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isFailing ? (
                          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                        ) : hs.status === 'degraded' ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        <div>
                          <h4 className="font-serif font-bold text-xs text-text-primary">{hs.name} Adapter</h4>
                          <p className="text-[10px] text-text-muted">
                            Last Scrape: {hs.lastSuccessfulScrape ? new Date(hs.lastSuccessfulScrape).toLocaleTimeString() : 'Recently'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                          isFailing
                            ? 'bg-red-100 text-red-800 border-red-300 font-bold'
                            : hs.status === 'degraded'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {hs.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-border-theme/60 pt-2 text-text-secondary">
                      <div>
                        Success Rate: <span className="font-extrabold text-text-primary">{hs.successRate}%</span>
                      </div>
                      <div>
                        Failures: <span className={`font-extrabold ${hs.failureCount > 0 ? 'text-red-600' : 'text-text-primary'}`}>{hs.failureCount}</span>
                      </div>
                      <div>
                        Response Time: <span className="font-extrabold text-text-primary">{hs.responseTimeMs} ms</span>
                      </div>
                      <div>
                        Opps Collected: <span className="font-extrabold text-text-primary">{hs.opportunitiesCollected}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scraper Fleet Status Grid */}
          <div className="bg-surface rounded-2xl border border-border-theme shadow-xs space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-border-theme pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-text-primary">Scraper Fleet & Queues</h3>
                <p className="text-xs text-text-secondary">Monitor active web scrapers and trigger manual execution runs.</p>
              </div>
              <span className="text-[10px] font-extrabold px-3 py-1 bg-surface-secondary text-primary-blue border border-border-theme rounded-full uppercase">
                {scrapers.length} Monitored Sources
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scrapers.map((s) => {
                const isFailing = s.status === 'failing' || s.failures > 0;
                const isDegraded = s.status === 'degraded';
                const isTriggering = triggeringSource === s.name;

                return (
                  <div
                    key={s.name}
                    className="bg-background border border-border-theme rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-primary-blue transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        {isFailing ? (
                          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                        ) : isDegraded ? (
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        <div>
                          <h4 className="font-serif font-bold text-xs text-text-primary">{s.name}</h4>
                          <p className="text-[10px] text-text-muted">Last Scrape: {s.lastRun || 'Recently'}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                          isFailing
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : isDegraded
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border-theme text-xs">
                      <div className="text-text-secondary text-xs">
                        Queue: <span className="font-bold text-text-primary">{s.items || 0} items</span>
                      </div>

                      <button
                        onClick={() => handleRunScraper(s.name)}
                        disabled={isTriggering}
                        className="px-3 py-1.5 bg-primary-blue hover:bg-[#603620] text-white font-extrabold uppercase text-[10px] tracking-wider rounded-lg flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                      >
                        {isTriggering ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3" />
                            Run Job
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : activeTab === 'expiry' ? (
        <AdminExpiryDashboard />
      ) : (
        /* Moderation Queue Tab */
        <div className="bg-surface rounded-2xl border border-border-theme shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-serif font-bold text-text-primary">Content Moderation Queue</h3>
            <p className="text-xs text-text-secondary">Review opportunities flagged by users or automatically marked as low quality.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-theme bg-background text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
                  <th className="py-3 px-4">Content Type</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ded1] text-xs font-medium">
                {moderationReports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-text-muted font-medium">
                      <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      Queue is completely clear.
                    </td>
                  </tr>
                ) : (
                  moderationReports.map((report) => (
                    <tr key={report._id || report.id} className="hover:bg-background transition-colors">
                      <td className="py-3.5 px-4 font-bold text-text-primary capitalize">
                        {report.contentType}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded text-[10px] font-extrabold uppercase border bg-red-50 text-red-700 border-red-200">
                          {report.reason}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary max-w-[200px] truncate">
                        {report.description || 'No description provided'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleModerate(report._id || report.id, 'dismiss')}
                            className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer text-[10px] font-bold"
                          >
                            Dismiss
                          </button>
                          <button 
                            onClick={() => handleModerate(report._id || report.id, 'remove')}
                            className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer text-[10px] font-bold"
                          >
                            Remove
                          </button>
                          <button 
                            onClick={() => handleModerate(report._id || report.id, 'ban')}
                            className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer text-[10px] font-bold"
                          >
                            Ban User
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

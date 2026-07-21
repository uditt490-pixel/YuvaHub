import React, { useState, useEffect } from 'react';
import { 
  Activity, AlertTriangle, CheckCircle, Clock, Database, 
  Server, ShieldAlert, XCircle, RotateCw, Play, BarChart3, AlertOctagon,
  Search, ChevronDown, ChevronUp, Terminal, Filter, RefreshCw, Check, X
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

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
  const [activeTab, setActiveTab] = useState<'telemetry' | 'moderation'>('telemetry');
  
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

  const [logs, setLogs] = useState<ScraperLog[]>([]);
  const [moderationOpps, setModerationOpps] = useState<any[]>([]);
  
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
      const [statsRes, scrapersRes, modRes] = await Promise.all([
        fetch('/api/v1/admin/scraper-stats', { headers }).then(r => r.json()).catch(() => null),
        fetch('/api/v1/admin/scrapers', { headers }).then(r => r.json()).catch(() => null),
        fetch('/api/v1/admin/moderation-queue', { headers }).then(r => r.json()).catch(() => null)
      ]);

      if (statsRes && !statsRes.error) {
        setStats(prev => ({ ...prev, ...statsRes }));
      }
      if (scrapersRes && Array.isArray(scrapersRes) && scrapersRes.length > 0) {
        setScrapers(scrapersRes);
      }
      if (modRes && Array.isArray(modRes)) {
        setModerationOpps(modRes);
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

  const handleModerate = async (id: string, action: 'approve' | 'reject') => {
    const token = await user?.getIdToken?.() || localStorage.getItem('token');
    try {
      await fetch(`/api/v1/admin/moderate/${id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });
      setModerationOpps(prev => prev.filter(opp => (opp._id || opp.id) !== id));
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
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-2xl border border-red-200 text-center space-y-4 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Admin Panel Access Restricted</h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          You must be logged in as an authorized administrator to view the central scraper telemetry dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 bg-gray-50/50 min-h-screen animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Central Scraper Health Dashboard</h1>
              <p className="text-xs text-gray-500 font-medium">Real-time scraper telemetry, execution logs & data ingestion monitoring.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
          <div className="flex bg-gray-100 p-1 rounded-xl text-sm font-semibold">
            <button 
              onClick={() => setActiveTab('telemetry')}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'telemetry' ? 'bg-white shadow-2xs text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Telemetry
            </button>
            <button 
              onClick={() => setActiveTab('moderation')}
              className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'moderation' ? 'bg-white shadow-2xs text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Moderation Queue
              {moderationOpps.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{moderationOpps.length}</span>}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Live
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
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
            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center justify-between">
                Active Scrapers <Server className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-gray-900 flex items-baseline gap-2">
                {scrapers.filter(s => s.status !== 'failing').length} / {scrapers.length}
                <span className="text-xs font-bold text-emerald-600">Active</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center justify-between">
                Data Ingested (24h) <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600">
                +{stats.opportunitiesAdded || 128} <span className="text-xs text-gray-400 font-normal">items</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center justify-between">
                Active Users <BarChart3 className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-indigo-600">
                {stats.activeUsers || 1540}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 flex items-center justify-between">
                Total Cron Executions <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-black text-gray-900">
                {stats.totalExecutions || 342}
              </div>
            </div>
          </div>

          {/* Recharts Analytics */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Analytics (Past 7 Days)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOpps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="activeUsers" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" name="Active Users" />
                  <Area yAxisId="right" type="monotone" dataKey="oppsAdded" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorOpps)" name="Opportunities Added" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scraper Fleet Status Grid */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Scraper Fleet & Queues</h3>
                <p className="text-xs text-gray-500 font-medium">Monitor active web scrapers and trigger manual execution runs via BullMQ.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
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
                    className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-blue-200 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        {isFailing ? (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        ) : isDegraded ? (
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{s.name}</h4>
                          <p className="text-xs text-gray-500">Last Scrape: {s.lastRun || 'Recently'}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isFailing
                            ? 'bg-red-100 text-red-700'
                            : isDegraded
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                      <div className="text-gray-600 font-medium">
                        Active/Waiting: <span className="font-bold text-gray-900">{s.items || 0} items</span>
                      </div>

                      <button
                        onClick={() => handleRunScraper(s.name)}
                        disabled={isTriggering}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50 text-xs cursor-pointer"
                      >
                        {isTriggering ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
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
      ) : (
        /* Moderation Queue Tab */
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Content Moderation Queue</h3>
            <p className="text-xs text-gray-500 font-medium">Review opportunities flagged by users or automatically marked as low quality.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Flags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium">
                {moderationOpps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 font-medium">
                      <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      Queue is completely clear.
                    </td>
                  </tr>
                ) : (
                  moderationOpps.map((opp) => (
                    <tr key={opp._id || opp.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {opp.title}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {opp.org || opp.organization || 'Unknown'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-1 rounded font-bold ${(opp.source_quality_score || 0) < 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {opp.source_quality_score || 0}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {opp.flagged ? <span className="text-red-600 font-bold">User Flagged</span> : <span className="text-gray-400">System</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleModerate(opp._id || opp.id, 'approve')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleModerate(opp._id || opp.id, 'reject')}
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors cursor-pointer"
                            title="Reject & Delete"
                          >
                            <X className="w-4 h-4" />
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

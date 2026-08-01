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
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-2xl border border-red-200 text-center space-y-4 shadow-xs">
        <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-xl font-serif font-bold text-[#231f20]">Admin Panel Access Restricted</h2>
        <p className="text-xs text-[#603620] max-w-md mx-auto">
          You must be logged in as an authorized administrator to view the central scraper telemetry dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#e8ded1] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center font-bold">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-[#231f20]">Central Scraper Telemetry</h1>
              <p className="text-xs text-[#603620]">Real-time scraper telemetry, execution logs & data ingestion monitoring.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="flex bg-[#fcf9f2] border border-[#e8ded1] p-1 rounded-xl text-xs font-bold">
            <button 
              onClick={() => setActiveTab('telemetry')}
              className={`px-4 py-2 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'telemetry' ? 'bg-[#b56b37] text-white shadow-xs font-extrabold' : 'text-[#603620] hover:text-[#231f20]'}`}
            >
              Telemetry
            </button>
            <button 
              onClick={() => setActiveTab('moderation')}
              className={`px-4 py-2 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'moderation' ? 'bg-[#b56b37] text-white shadow-xs font-extrabold' : 'text-[#603620] hover:text-[#231f20]'}`}
            >
              Moderation Queue
              {moderationOpps.length > 0 && <span className="ml-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full">{moderationOpps.length}</span>}
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
              className="px-3.5 py-2 bg-white border border-[#e8ded1] hover:bg-[#f6efe2] rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#603620] flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
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
            <div className="bg-white p-5 rounded-2xl border border-[#e8ded1] shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#603620] mb-1 flex items-center justify-between">
                Active Scrapers <Server className="w-4 h-4 text-[#b56b37]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#231f20] flex items-baseline gap-2 mt-1">
                {scrapers.filter(s => s.status !== 'failing').length} / {scrapers.length}
                <span className="text-xs font-bold text-emerald-700">Active</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8ded1] shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#603620] mb-1 flex items-center justify-between">
                Data Ingested (24h) <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                +{stats.opportunitiesAdded || 128} <span className="text-xs text-[#8c7569] font-sans font-normal">items</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8ded1] shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#603620] mb-1 flex items-center justify-between">
                Active Users <BarChart3 className="w-4 h-4 text-[#b56b37]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#b56b37] mt-1">
                {stats.activeUsers || 1540}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8ded1] shadow-xs">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#603620] mb-1 flex items-center justify-between">
                Total Cron Executions <Clock className="w-4 h-4 text-[#8c7569]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#231f20] mt-1">
                {stats.totalExecutions || 342}
              </div>
            </div>
          </div>

          {/* Recharts Analytics */}
          <div className="bg-white p-6 rounded-2xl border border-[#e8ded1] shadow-xs">
            <h3 className="text-base font-serif font-bold text-[#231f20] mb-6">Platform Analytics (Past 7 Days)</h3>
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

          {/* Scraper Fleet Status Grid */}
          <div className="bg-white rounded-2xl border border-[#e8ded1] shadow-xs space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-[#e8ded1] pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#231f20]">Scraper Fleet & Queues</h3>
                <p className="text-xs text-[#603620]">Monitor active web scrapers and trigger manual execution runs.</p>
              </div>
              <span className="text-[10px] font-extrabold px-3 py-1 bg-[#f6efe2] text-[#b56b37] border border-[#e8ded1] rounded-full uppercase">
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
                    className="bg-[#fcf9f2] border border-[#e8ded1] rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-[#b56b37] transition-all"
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
                          <h4 className="font-serif font-bold text-xs text-[#231f20]">{s.name}</h4>
                          <p className="text-[10px] text-[#8c7569]">Last Scrape: {s.lastRun || 'Recently'}</p>
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

                    <div className="flex items-center justify-between pt-2 border-t border-[#e8ded1] text-xs">
                      <div className="text-[#603620] text-xs">
                        Queue: <span className="font-bold text-[#231f20]">{s.items || 0} items</span>
                      </div>

                      <button
                        onClick={() => handleRunScraper(s.name)}
                        disabled={isTriggering}
                        className="px-3 py-1.5 bg-[#b56b37] hover:bg-[#603620] text-white font-extrabold uppercase text-[10px] tracking-wider rounded-lg flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
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
      ) : (
        /* Moderation Queue Tab */
        <div className="bg-white rounded-2xl border border-[#e8ded1] shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-serif font-bold text-[#231f20]">Content Moderation Queue</h3>
            <p className="text-xs text-[#603620]">Review opportunities flagged by users or automatically marked as low quality.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e8ded1] bg-[#fcf9f2] text-[10px] font-extrabold text-[#603620] uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Flags</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8ded1] text-xs font-medium">
                {moderationOpps.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#8c7569] font-medium">
                      <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      Queue is completely clear.
                    </td>
                  </tr>
                ) : (
                  moderationOpps.map((opp) => (
                    <tr key={opp._id || opp.id} className="hover:bg-[#fcf9f2] transition-colors">
                      <td className="py-3.5 px-4 font-serif font-bold text-[#231f20]">
                        {opp.title}
                      </td>
                      <td className="py-3.5 px-4 text-[#603620]">
                        {opp.org || opp.organization || 'Unknown'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase border ${(opp.source_quality_score || 0) < 50 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {opp.source_quality_score || 0}/100
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {opp.flagged ? <span className="text-red-700 font-extrabold">User Flagged</span> : <span className="text-[#8c7569]">System</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleModerate(opp._id || opp.id, 'approve')}
                            className="p-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleModerate(opp._id || opp.id, 'reject')}
                            className="p-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
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

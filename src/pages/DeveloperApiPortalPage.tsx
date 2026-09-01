import React, { useState } from 'react';
import { Code, Key, ShieldCheck, Search, CheckCircle2, Clock, Activity, Cpu, Sparkles, Terminal, Copy, Lock } from 'lucide-react';
import ApiKeyCard from '../components/ApiKeyCard';
import ApiStreamTimeline from '../components/ApiStreamTimeline';

export interface DeveloperApiKeyItem {
  id: string;
  keyName: string;
  environment: 'PRODUCTION' | 'STAGING' | 'SANDBOX';
  apiKeyMasked: string;
  monthlyQuotaUsagePercent: number;
  rateLimitReqSec: number;
  allowedIpRanges: string;
  status: 'ACTIVE' | 'RATE_LIMITED' | 'REVOKED';
  lastUsedAgo: string;
}

const DEVELOPER_API_KEYS: DeveloperApiKeyItem[] = [
  {
    id: 'api-101',
    keyName: 'Production AI Matcher Service Key',
    environment: 'PRODUCTION',
    apiKeyMasked: 'yh_live_99812********************x821',
    monthlyQuotaUsagePercent: 64.2,
    rateLimitReqSec: 100,
    allowedIpRanges: '104.21.82.0/24 (Vercel Edge)',
    status: 'ACTIVE',
    lastUsedAgo: '2 mins ago',
  },
  {
    id: 'api-102',
    keyName: 'Staging Scraper Webhook Consumer',
    environment: 'STAGING',
    apiKeyMasked: 'yh_stage_44123********************m091',
    monthlyQuotaUsagePercent: 12.8,
    rateLimitReqSec: 25,
    allowedIpRanges: '192.168.1.0/24 (Internal CI/CD)',
    status: 'ACTIVE',
    lastUsedAgo: '15 mins ago',
  },
  {
    id: 'api-103',
    keyName: 'Legacy Student Portal API Integration',
    environment: 'SANDBOX',
    apiKeyMasked: 'yh_sand_11029********************p441',
    monthlyQuotaUsagePercent: 98.9,
    rateLimitReqSec: 10,
    allowedIpRanges: '0.0.0.0/0 (Global Sandbox)',
    status: 'RATE_LIMITED',
    lastUsedAgo: '1 hour ago',
  },
];

export default function DeveloperApiPortalPage() {
  const [apiKeys, setApiKeys] = useState<DeveloperApiKeyItem[]>(DEVELOPER_API_KEYS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'keys' | 'api-stream'>('keys');
  const [selectedKeyModal, setSelectedKeyModal] = useState<DeveloperApiKeyItem | null>(null);

  const activeKeysCount = apiKeys.filter(k => k.status === 'ACTIVE').length;

  const filteredKeys = apiKeys.filter(k =>
    k.keyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.environment.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.apiKeyMasked.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen  p-6 md:p-10 font-sans">
      {/* Header Banner */}
      <header className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-cyan-500/20 text-cyan-300 text-xs px-3 py-1 rounded-full font-semibold border border-cyan-500/30 flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" /> YuvaHub Developer Portal
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> OAuth 2.0 & mTLS Enterprise Security
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-200 bg-clip-text text-transparent">
              Developer API Key & Webhook Management Portal
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
              API key provisioning, rate-limit quota monitoring, IP whitelist configuration, and live GraphQL/REST endpoint telemetry stream.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-cyan-600/30 transition flex items-center gap-2 border border-cyan-400/20 text-sm">
              <Key className="w-4 h-4" /> Generate New API Key
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Provisioned Keys</span>
              <Key className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{activeKeysCount} Keys</div>
            <div className="text-emerald-400 text-xs mt-2 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Zero Compromised Credentials
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>System Response Latency</span>
              <Cpu className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">24.5 ms</div>
            <div className="text-blue-400 text-xs mt-2 font-medium">
              P99 Global Edge Response Time
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Monthly API Requests</span>
              <Terminal className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">1.42 M</div>
            <div className="text-indigo-400 text-xs mt-2 font-medium">
              99.99% Uptime Guarantee
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('keys')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'keys'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Key className="w-4 h-4" /> Provisioned API Keys
            </button>
            <button
              onClick={() => setActiveTab('api-stream')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'api-stream'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" /> Live API Telemetry Stream
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search key or environment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Tab Body */}
        {activeTab === 'api-stream' ? (
          <ApiStreamTimeline />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredKeys.map((keyItem) => (
              <ApiKeyCard
                key={keyItem.id}
                keyItem={keyItem}
                onInspect={() => setSelectedKeyModal(keyItem)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal View */}
      {selectedKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedKeyModal(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>

            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedKeyModal.keyName}</h3>
                <div className="text-xs text-slate-400 font-mono">Env: {selectedKeyModal.environment}</div>
              </div>
              <span className="bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded font-mono text-xs font-bold border border-cyan-500/30">
                {selectedKeyModal.status}
              </span>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">API Key Token</span>
                <span className="text-cyan-300 font-bold">{selectedKeyModal.apiKeyMasked}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 block">Allowed IP Ranges</span>
                <span className="text-white font-semibold">{selectedKeyModal.allowedIpRanges}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedKeyModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs transition"
              >
                Close Key Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

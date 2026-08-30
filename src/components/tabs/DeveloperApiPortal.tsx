import React, { useState, useMemo } from 'react';
import {
  Code,
  Key,
  Webhook,
  Activity,
  Terminal,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Globe,
  Sliders,
  Shield,
  Layers,
  Server,
  Zap,
  Play,
  X,
  FileJson
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { EmptyState } from '../ui/states';

export default function DeveloperApiPortal() {
  const { user } = useAppContext();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'keys' | 'sandbox' | 'webhooks' | 'telemetry' | 'sdks'>('keys');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // API Keys Vault State
  const [apiKeys, setApiKeys] = useState([
    {
      id: 'key_prod_8819',
      name: 'Production Server Secret',
      token: 'yh_live_9981240158a7bc129481fe',
      created: '2026-06-10',
      lastUsed: '2 minutes ago',
      scope: 'read:opportunities write:submissions',
      environment: 'PRODUCTION'
    },
    {
      id: 'key_dev_4412',
      name: 'Local Dev Testing Token',
      token: 'yh_test_7712390145ef882194a001',
      created: '2026-07-01',
      lastUsed: '1 hour ago',
      scope: 'read:opportunities',
      environment: 'SANDBOX'
    }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeyId, setShowKeyId] = useState<string | null>(null);

  // Webhooks State
  const [webhooks, setWebhooks] = useState([
    {
      id: 'wh_101',
      url: 'https://api.myuniversity.edu/webhooks/yuvahub',
      events: ['opportunity.created', 'application.status_updated'],
      active: true,
      successRate: '99.4%'
    }
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  // Sandbox State
  const [sandboxEndpoint, setSandboxEndpoint] = useState<'GET /opportunities' | 'POST /search'>('GET /opportunities');
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  // Active SDK Language
  const [selectedSdkLang, setSelectedSdkLang] = useState<'curl' | 'typescript' | 'python' | 'go'>('typescript');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Add Key Handler
  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const newKey = {
      id: `key_${Date.now()}`,
      name: newKeyName.trim(),
      token: `yh_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Just now',
      scope: 'read:opportunities write:submissions',
      environment: 'PRODUCTION'
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setNotification({ type: 'success', message: `Created API key: ${newKey.name}` });
  };

  // Delete Key
  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
    setNotification({ type: 'success', message: 'Revoked API secret key.' });
  };

  // Add Webhook
  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;

    const newWh = {
      id: `wh_${Date.now()}`,
      url: newWebhookUrl.trim(),
      events: ['opportunity.created'],
      active: true,
      successRate: '100%'
    };

    setWebhooks([...webhooks, newWh]);
    setNewWebhookUrl('');
    setNotification({ type: 'success', message: 'Registered Webhook endpoint!' });
  };

  // Execute Sandbox Request
  const handleRunSandbox = () => {
    setSandboxLoading(true);
    setTimeout(() => {
      if (sandboxEndpoint === 'GET /opportunities') {
        setSandboxResponse({
          status: 200,
          statusText: "OK",
          latencyMs: 38,
          payload: {
            success: true,
            totalItems: 3500,
            items: [
              { id: "opp_991", title: "Google Summer of Code 2026", type: "Fellowship", stipend: "$10,000" },
              { id: "opp_992", title: "Microsoft Imagine Cup 2026", type: "Hackathon", stipend: "$100,000" }
            ]
          }
        });
      } else {
        setSandboxResponse({
          status: 200,
          statusText: "OK",
          latencyMs: 44,
          payload: {
            query: "AI Engineering",
            results: 18,
            items: [{ id: "opp_101", title: "AI Research Assistant", org: "Google AI" }]
          }
        });
      }
      setSandboxLoading(false);
    }, 500);
  };

  // Code Snippets
  const codeSnippets = useMemo(() => {
    const token = apiKeys[0]?.token || 'YOUR_YUVAHUB_API_KEY';
    return {
      curl: `curl -X GET "https://yuvahub.xyz/api/v1/opportunities" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json"`,
      typescript: `import { YuvaHubClient } from '@yuvahub/sdk';

const client = new YuvaHubClient({
  apiKey: '${token}'
});

const response = await client.opportunities.list({
  category: 'ai_ml',
  limit: 10
});

console.log(response.items);`,
      python: `from yuvahub import YuvaHub

client = YuvaHub(api_key="${token}")

response = client.opportunities.list(
    category="ai_ml",
    limit=10
)

print(response.items)`,
      go: `package main

import (
    "fmt"
    "github.com/yuvahub/sdk-go"
)

func main() {
    client := yuvahub.NewClient("${token}")
    opps, err := client.Opportunities.List("ai_ml")
    if err != nil {
        panic(err)
    }
    fmt.Println(opps)
}`
    };
  }, [apiKeys]);

  // Export OpenAPI Manifest
  const handleExportOpenApi = () => {
    const openApiSpec = {
      openapi: "3.0.0",
      info: { title: "YuvaHub Developer API", version: "1.0.0", description: "Public API for opportunities and career match telemetry." },
      servers: [{ url: "https://yuvahub.xyz/api/v1" }],
      paths: {
        "/opportunities": {
          get: { summary: "List verified opportunities", responses: { "200": { description: "Success" } } }
        }
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(openApiSpec, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_OpenAPI_Spec_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setNotification({ type: 'success', message: 'Downloaded OpenAPI 3.0 Manifest!' });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      
      {/* Top Banner Header - Brand Theme */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <Code className="w-3.5 h-3.5 text-indigo-400" /> YuvaHub Open API v1.0
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                All Gateways Operational
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Developer API Portal & <span className="text-primary-blue italic">Telemetry</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Manage Bearer API keys, register webhook event subscriptions, test live REST endpoints in sandbox, and monitor API traffic analytics.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-base text-primary-blue">
              84%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Daily Quota Usage</div>
              <div className="text-xs font-extrabold text-white">8,420 / 10,000 Requests</div>
              <div className="text-[11px] text-emerald-400 font-semibold">Avg Latency: 38ms • 99.9% Uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-border-theme dark:border-slate-800 pb-3">
        {[
          { id: 'keys', label: 'API Keys Vault', icon: Key },
          { id: 'sandbox', label: 'API Sandbox', icon: Terminal },
          { id: 'webhooks', label: 'Webhooks', icon: Webhook },
          { id: 'telemetry', label: 'Traffic Analytics', icon: Activity },
          { id: 'sdks', label: 'SDK & Spec', icon: Code }
        ].map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-primary-blue border-primary-blue text-white shadow-sm scale-[1.02]'
                  : 'bg-surface dark:bg-slate-900 border-border-theme dark:border-slate-800 text-text-secondary dark:text-slate-300 hover:bg-surface-secondary'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-primary-blue'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification */}
      {notification.message && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#63703d]/15 border border-[#63703d]/30 text-[#63703d] text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab 1: API Keys */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-theme dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">API Keys Vault</h2>
                <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">Generate and manage secret bearer tokens for API integration.</p>
              </div>

              <form onSubmit={handleCreateKey} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Key name (e.g. Prod Server)"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  className="bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-text-primary outline-none"
                />
                <button type="submit" className="bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl px-4 py-2 flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Plus className="w-4 h-4" /> Create Key
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {apiKeys.map(key => (
                <div key={key.id} className="p-4 rounded-2xl bg-background dark:bg-slate-800/60 border border-border-theme dark:border-slate-700 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm text-text-primary dark:text-white">{key.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#603620] text-[#f3e4bd]">
                          {key.environment}
                        </span>
                      </div>
                      <span className="text-[11px] text-text-muted block font-medium">Created: {key.created} • Last used: {key.lastUsed}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => setShowKeyId(showKeyId === key.id ? null : key.id)} className="p-2 text-text-secondary hover:text-text-primary">
                        {showKeyId === key.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => copyToClipboard(key.token, key.id)} className="p-2 text-primary-blue hover:text-[#96552a]">
                        {copiedKey === key.id ? <Check className="w-4 h-4 text-[#63703d]" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDeleteKey(key.id)} className="p-2 text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-700 font-mono text-xs text-text-primary dark:text-slate-200">
                    {showKeyId === key.id ? key.token : `${key.token.substring(0, 10)}********************`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sandbox */}
      {activeTab === 'sandbox' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
          <div className="flex justify-between items-center border-b border-border-theme dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">Live Endpoint Sandbox</h2>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">Test API requests directly from your browser.</p>
            </div>

            <button
              onClick={handleRunSandbox}
              disabled={sandboxLoading}
              className="bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {sandboxLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              <span>Execute Request</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className="font-bold text-text-secondary uppercase">Target Endpoint</label>
              <select
                value={sandboxEndpoint}
                onChange={e => setSandboxEndpoint(e.target.value as any)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              >
                <option value="GET /opportunities">GET /api/v1/opportunities</option>
                <option value="POST /search">POST /api/v1/search</option>
              </select>
            </div>
          </div>

          {sandboxResponse && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3 text-xs font-bold text-[#63703d]">
                <span>Status: {sandboxResponse.status} {sandboxResponse.statusText}</span>
                <span>• Latency: {sandboxResponse.latencyMs}ms</span>
              </div>
              <pre className="p-4 rounded-2xl bg-[#231f20] text-[#f3e4bd] font-mono text-xs overflow-x-auto">
                {JSON.stringify(sandboxResponse.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Webhooks */}
      {activeTab === 'webhooks' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-border-theme dark:border-slate-800 pb-4">
            <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">Webhook Subscriptions</h2>
            <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">Receive real-time HTTP POST notifications when new opportunities are listed.</p>
          </div>

          <form onSubmit={handleAddWebhook} className="flex gap-3">
            <input
              type="url"
              placeholder="https://your-server.com/webhook-listener"
              value={newWebhookUrl}
              onChange={e => setNewWebhookUrl(e.target.value)}
              className="flex-1 bg-background border border-border-theme rounded-xl p-2.5 text-xs text-text-primary outline-none"
            />
            <button type="submit" className="bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl px-5 py-2.5 flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Webhook
            </button>
          </form>

          <div className="space-y-3 pt-2">
            {webhooks.map(wh => (
              <div key={wh.id} className="flex items-center justify-between p-4 rounded-2xl bg-background border border-border-theme text-xs">
                <div>
                  <span className="font-bold text-text-primary">{wh.url}</span>
                  <span className="text-[10px] text-text-muted block font-semibold">Events: {wh.events.join(', ')}</span>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#63703d]/15 text-[#63703d]">
                  Active ({wh.successRate})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Telemetry */}
      {activeTab === 'telemetry' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2">
            <span className="text-xs text-text-muted font-bold uppercase">Average Latency</span>
            <div className="text-2xl font-serif font-bold text-primary-blue">38 ms</div>
            <span className="text-[10px] text-[#63703d] font-semibold">Faster than 98% of endpoints</span>
          </div>

          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2">
            <span className="text-xs text-text-muted font-bold uppercase">Success Rate</span>
            <div className="text-2xl font-serif font-bold text-[#63703d]">99.94%</div>
            <span className="text-[10px] text-text-muted font-semibold">0.06% client 4xx errors</span>
          </div>

          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-2">
            <span className="text-xs text-text-muted font-bold uppercase">Total Bandwidth</span>
            <div className="text-2xl font-serif font-bold text-text-primary dark:text-white">1.42 GB</div>
            <span className="text-[10px] text-text-secondary font-semibold">Last 30 days active payload</span>
          </div>
        </div>
      )}

      {/* Tab 5: SDK & Spec */}
      {activeTab === 'sdks' && (
        <div className="space-y-6">
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-theme dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">SDK Code Generators & Spec</h2>
                <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">Ready-to-use code snippets in multiple programming languages.</p>
              </div>

              <button onClick={handleExportOpenApi} className="px-4 py-2.5 bg-primary-blue hover:bg-[#96552a] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" /> Download OpenAPI Spec
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-border-theme pb-2">
              {['typescript', 'curl', 'python', 'go'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedSdkLang(lang as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    selectedSdkLang === lang ? 'bg-[#231f20] text-white' : 'bg-surface text-text-secondary border border-border-theme'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <pre className="p-4 rounded-2xl bg-[#231f20] text-[#f3e4bd] font-mono text-xs overflow-x-auto">
              {codeSnippets[selectedSdkLang]}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

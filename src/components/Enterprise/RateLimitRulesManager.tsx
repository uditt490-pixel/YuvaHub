// ═══════════════════════════════════════════════════════════════════
// Rate Limit Rules Manager — Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Settings, Shield, Zap, Clock, ToggleLeft, ToggleRight,
  ChevronDown, ChevronRight, ExternalLink, Hash, Server,
  AlertTriangle, CheckCircle2
} from 'lucide-react';
import { RateLimitRule, RateLimitTier } from '../../types/rateLimiting';

interface Props { rules: RateLimitRule[]; isLoading: boolean; onToggle: (id: string, enabled: boolean) => void; }

const TIER_COLORS: Record<RateLimitTier, { bg: string; text: string; border: string; icon: string }> = {
  free: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: '🔓' },
  starter: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '🚀' },
  pro: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: '⚡' },
  enterprise: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '🏢' },
  unlimited: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '♾️' }
};

export const RateLimitRulesManager: React.FC<Props> = ({ rules, isLoading, onToggle }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"><div className="h-6 bg-slate-200 rounded w-48 mb-4" />{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl mb-3" />)}</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-50"><Settings className="h-5 w-5 text-violet-600" /></div>
          <div><h3 className="text-lg font-bold text-slate-800">Rate Limit Rules</h3><p className="text-xs text-slate-500">{rules.length} rules · {rules.filter(r => r.enabled).length} active</p></div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {rules.map(rule => {
          const tc = TIER_COLORS[rule.tier];
          const isExpanded = expandedId === rule.id;
          return (
            <div key={rule.id} className={`rounded-xl border transition-all ${isExpanded ? `${tc.bg} ${tc.border}` : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rule.id)}>
                <button onClick={e => { e.stopPropagation(); onToggle(rule.id, !rule.enabled); }} className="flex-shrink-0">
                  {rule.enabled ? <ToggleRight className="h-8 w-8 text-indigo-600" /> : <ToggleLeft className="h-8 w-8 text-slate-300" />}
                </button>
                <div className="text-2xl flex-shrink-0">{tc.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800">{rule.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tc.bg} ${tc.text}`}>{rule.tier}</span>
                    {!rule.enabled && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">DISABLED</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-slate-800">{rule.maxRequests.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">reqs / {rule.timeWindow}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-amber-600">{rule.burstLimit.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">burst</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-extrabold text-red-600">{rule.triggerCount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">triggers</div>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-200/50 mt-2 space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                    {[{ l: 'Max Requests', v: `${rule.maxRequests.toLocaleString()} / ${rule.timeWindow}` }, { l: 'Burst Limit', v: rule.burstLimit.toLocaleString() }, { l: 'Retry After', v: `${rule.retryAfterSeconds}s` }, { l: 'Last Triggered', v: rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : 'Never' }].map((s, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-400">{s.l}</div><div className="text-xs font-bold text-slate-700">{s.v}</div></div>
                    ))}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Protected Endpoints ({rule.endpoints.length})</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.endpoints.map((ep, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600">{ep}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Response Headers: <code className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">{rule.headers.limit}</code></span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RateLimitRulesManager;

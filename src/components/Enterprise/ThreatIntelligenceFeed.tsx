// ═══════════════════════════════════════════════════════════════════
// Threat Intelligence Feed Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, Eye,
  Globe, Hash, Mail, Link2, FileWarning, Clock, ChevronDown,
  ExternalLink, Zap, Radio, Server, Bug
} from 'lucide-react';
import { ThreatIntelligence, ThreatType, AlertSeverity, FeedSource } from '../../types/fraudDetection';

interface Props {
  threats: ThreatIntelligence[];
  isLoading: boolean;
}

const SEV_CONFIG: Record<AlertSeverity, { bg: string; text: string; border: string; label: string }> = {
  P0: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Critical' },
  P1: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'Major' },
  P2: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Moderate' },
  P3: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'Low' }
};

const THREAT_ICONS: Record<ThreatType, React.ReactNode> = {
  phishing: <Mail className="h-4 w-4" />,
  credential_stuffing: <Bug className="h-4 w-4" />,
  account_takeover: <ShieldAlert className="h-4 w-4" />,
  identity_theft: <Shield className="h-4 w-4" />,
  synthetic_fraud: <FileWarning className="h-4 w-4" />,
  money_laundering: <Hash className="h-4 w-4" />,
  bot_attack: <Server className="h-4 w-4" />,
  insider_threat: <Eye className="h-4 w-4" />
};

const SOURCE_CONFIG: Record<FeedSource, { bg: string; text: string }> = {
  internal: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  osint: { bg: 'bg-blue-100', text: 'text-blue-700' },
  darkweb: { bg: 'bg-red-100', text: 'text-red-700' },
  partner: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  government: { bg: 'bg-purple-100', text: 'text-purple-700' },
  threat_intel: { bg: 'bg-amber-100', text: 'text-amber-700' }
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const ThreatIntelligenceFeed: React.FC<Props> = ({ threats, isLoading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterSource, setFilterSource] = useState<FeedSource | 'all'>('all');
  const [filterSev, setFilterSev] = useState<AlertSeverity | 'all'>('all');

  const filtered = threats.filter(t => {
    if (filterSource !== 'all' && t.source !== filterSource) return false;
    if (filterSev !== 'all' && t.severity !== filterSev) return false;
    return true;
  });

  if (isLoading) {
    return <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"><div className="h-6 bg-slate-200 rounded w-48 mb-4" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl mb-3" />)}</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50"><Radio className="h-5 w-5 text-red-600" /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Threat Intelligence</h3>
              <p className="text-xs text-slate-500">{threats.length} feeds · {threats.filter(t => t.isActive).length} active</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600" value={filterSource} onChange={e => setFilterSource(e.target.value as FeedSource | 'all')}>
              <option value="all">All Sources</option>
              {(['internal','osint','darkweb','partner','government','threat_intel'] as FeedSource[]).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600" value={filterSev} onChange={e => setFilterSev(e.target.value as AlertSeverity | 'all')}>
              <option value="all">All Severity</option>
              {(['P0','P1','P2','P3'] as AlertSeverity[]).map(s => <option key={s} value={s}>{SEV_CONFIG[s].label} ({s})</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Threat Cards */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {filtered.map(threat => {
          const sev = SEV_CONFIG[threat.severity];
          const src = SOURCE_CONFIG[threat.source];
          const isExpanded = expandedId === threat.id;
          return (
            <div key={threat.id} className={`rounded-xl border transition-all ${isExpanded ? `${sev.bg} ${sev.border}` : 'border-slate-200 hover:border-slate-300'}`}>
              <div className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : threat.id)}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${sev.bg} ${sev.text} flex-shrink-0`}>{THREAT_ICONS[threat.threatType]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${sev.bg} ${sev.text} border ${sev.border}`}>{sev.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${src.bg} ${src.text}`}>{threat.source.replace(/_/g, ' ')}</span>
                      {threat.isActive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800">{threat.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(threat.publishedAt)}</span>
                      <span>Confidence: {threat.confidence}%</span>
                      <span>{threat.iocs.length} IOCs</span>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-slate-200/50 mt-2">
                  <p className="text-sm text-slate-600 mt-3 mb-4">{threat.description}</p>
                  {/* IOCs */}
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Indicators of Compromise ({threat.iocs.length})</h5>
                  <div className="space-y-1.5 mb-4">
                    {threat.iocs.map((ioc, idx) => (
                      <div key={idx} className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] uppercase font-bold">{ioc.type}</span>
                        <span className="flex-1 font-mono text-slate-700 truncate">{ioc.value}</span>
                        <span className="text-slate-400">{ioc.confidence}%</span>
                      </div>
                    ))}
                  </div>
                  {/* Mitigations */}
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Mitigations</h5>
                  <div className="space-y-1">
                    {threat.mitigations.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                        <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />{m}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-8 text-sm text-slate-400">No threats match your filters</div>}
      </div>
    </div>
  );
};

export default ThreatIntelligenceFeed;

// ═══════════════════════════════════════════════════════════════════
// Abuse Client Tracker — Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  ShieldAlert, ShieldCheck, Ban, Eye, Clock, Globe, MapPin,
  AlertTriangle, ChevronDown, ExternalLink, Activity, Zap,
  BarChart3, Server, Hash, ArrowRight
} from 'lucide-react';
import { AbusiveClient, AbuseCategory, AlertSeverity } from '../../types/rateLimiting';

interface Props { clients: AbusiveClient[]; isLoading: boolean; onBlock: (id: string) => void; onLift: (id: string) => void; }

const CAT_COLORS: Record<AbuseCategory, { bg: string; text: string }> = {
  brute_force: { bg: 'bg-red-500/200/20', text: 'text-red-400' }, scraping: { bg: 'bg-orange-500/200/20', text: 'text-orange-400' },
  ddos: { bg: 'bg-red-500/200/20', text: 'text-red-400' }, credential_stuffing: { bg: 'bg-amber-500/200/20', text: 'text-amber-400' },
  api_abuse: { bg: 'bg-purple-500/200/20', text: 'text-purple-400' }, spam: { bg: 'bg-pink-100', text: 'text-pink-700' },
  enumeration: { bg: 'bg-blue-500/200/20', text: 'text-blue-400' }, bot_traffic: { bg: 'bg-surface-secondary', text: 'text-text-primary' }
};
const SEV_DOT: Record<AlertSeverity, string> = { P0: 'bg-red-500/200', P1: 'bg-orange-500/200', P2: 'bg-amber-500/200', P3: 'bg-blue-500/200' };

function MiniBar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-px h-8">
      {data.map((v, i) => <div key={i} className="w-1.5 rounded-t transition-all" style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.3 + (v / max) * 0.7 }} />)}
    </div>
  );
}

export const AbuseClientTracker: React.FC<Props> = ({ clients, isLoading, onBlock, onLift }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<AbuseCategory | 'all'>('all');
  const [sevFilter, setSevFilter] = useState<AlertSeverity | 'all'>('all');
  const [sortBy, setSortBy] = useState<'risk' | 'requests' | 'blocked'>('risk');

  const filtered = clients.filter(c => {
    if (catFilter !== 'all' && c.abuseCategory !== catFilter) return false;
    if (sevFilter !== 'all' && c.severity !== sevFilter) return false;
    return true;
  }).sort((a, b) => sortBy === 'risk' ? b.riskScore - a.riskScore : sortBy === 'requests' ? b.requestCount - a.requestCount : b.blockedRequests - a.blockedRequests);

  if (isLoading) return <div className="bg-surface rounded-2xl border border-border-theme p-6 animate-pulse"><div className="h-6 bg-border-theme rounded w-48 mb-4" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-surface-secondary rounded-xl mb-3" />)}</div>;

  return (
    <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
      <div className="px-6 py-4 border-b border-border-theme">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/20"><ShieldAlert className="h-5 w-5 text-red-400" /></div>
            <div><h3 className="text-lg font-bold text-text-primary">Abusive Clients</h3><p className="text-xs text-text-muted">{clients.length} tracked · {clients.filter(c => c.isBlocked).length} blocked</p></div>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 bg-surface border border-border-theme rounded-xl text-xs font-medium text-text-secondary" value={catFilter} onChange={e => setCatFilter(e.target.value as AbuseCategory | 'all')}>
              <option value="all">All Categories</option>
              {(['brute_force','scraping','ddos','credential_stuffing','api_abuse','spam','enumeration','bot_traffic'] as AbuseCategory[]).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
            <select className="px-3 py-2 bg-surface border border-border-theme rounded-xl text-xs font-medium text-text-secondary" value={sevFilter} onChange={e => setSevFilter(e.target.value as AlertSeverity | 'all')}>
              <option value="all">All Severity</option>
              {(['P0','P1','P2','P3'] as AlertSeverity[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-1 bg-surface-secondary rounded-xl p-0.5">
              {(['risk','requests','blocked'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all capitalize ${sortBy === s ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted'}`}>
                  {s === 'risk' ? 'Risk' : s === 'requests' ? 'Requests' : 'Blocked'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
        {filtered.map(client => {
          const cc = CAT_COLORS[client.abuseCategory];
          const isExpanded = expandedId === client.id;
          return (
            <div key={client.id} className={`transition-all ${isExpanded ? 'bg-surface' : 'hover:bg-surface/50'}`}>
              <div className="flex items-center gap-4 px-6 py-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : client.id)}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: SEV_DOT[client.severity] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-text-primary truncate">{client.clientName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cc.bg} ${cc.text}`}>{client.abuseCategory.replace(/_/g, ' ')}</span>
                    {client.isBlocked && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/200/20 text-red-400">BLOCKED</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                    <span>{client.requestCount.toLocaleString()} reqs</span>
                    <span>{client.blockedRequests.toLocaleString()} blocked</span>
                    <span>{client.uniqueEndpoints} endpoints</span>
                  </div>
                </div>
                <MiniBar data={client.requestPattern} color={SEV_DOT[client.severity]} />
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className={`text-lg font-extrabold ${client.riskScore > 80 ? 'text-red-400' : client.riskScore > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>{client.riskScore.toFixed(0)}</div>
                  <div className="text-[10px] text-text-muted">risk</div>
                </div>
                <ChevronDown className={`h-5 w-5 text-text-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isExpanded && (
                <div className="px-6 pb-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[{ l: 'IP Address', v: client.ipAddress }, { l: 'First Seen', v: new Date(client.firstSeen).toLocaleDateString() }, { l: 'Last Seen', v: new Date(client.lastSeen).toLocaleDateString() }, { l: 'Countries', v: client.countries.join(', ') }, { l: 'Block Status', v: client.blockStatus || 'N/A' }].map((s, i) => (
                      <div key={i} className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">{s.l}</div><div className="text-xs font-semibold text-text-primary truncate">{s.v}</div></div>
                    ))}
                  </div>
                  {client.blockReason && <div className="px-3 py-2 bg-red-500/20 rounded-lg border border-red-500/30 text-xs text-red-400 font-medium">🚫 {client.blockReason}</div>}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Evidence ({client.evidence.length})</h5>
                    <div className="space-y-1.5">
                      {client.evidence.map(ev => (
                        <div key={ev.id} className="flex items-center gap-3 px-3 py-2 bg-surface rounded-lg border border-border-theme text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${CAT_COLORS[ev.type].bg} ${CAT_COLORS[ev.type].text}`}>{ev.type.replace(/_/g, ' ')}</span>
                          <span className="flex-1 text-text-primary">{ev.description}</span>
                          <span className="text-text-muted">{ev.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!client.isBlocked ? (
                      <button onClick={e => { e.stopPropagation(); onBlock(client.id); }} className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"><Ban className="h-3.5 w-3.5 inline mr-1" /> Block Client</button>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); onLift(client.id); }} className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"><ShieldCheck className="h-3.5 w-3.5 inline mr-1" /> Lift Block</button>
                    )}
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

export default AbuseClientTracker;

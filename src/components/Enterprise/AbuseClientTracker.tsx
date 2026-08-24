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
  brute_force: { bg: 'bg-red-100', text: 'text-red-700' }, scraping: { bg: 'bg-orange-100', text: 'text-orange-700' },
  ddos: { bg: 'bg-red-100', text: 'text-red-700' }, credential_stuffing: { bg: 'bg-amber-100', text: 'text-amber-700' },
  api_abuse: { bg: 'bg-purple-100', text: 'text-purple-700' }, spam: { bg: 'bg-pink-100', text: 'text-pink-700' },
  enumeration: { bg: 'bg-blue-100', text: 'text-blue-700' }, bot_traffic: { bg: 'bg-slate-100', text: 'text-slate-700' }
};
const SEV_DOT: Record<AlertSeverity, string> = { P0: 'bg-red-500', P1: 'bg-orange-500', P2: 'bg-amber-500', P3: 'bg-blue-500' };

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

  if (isLoading) return <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"><div className="h-6 bg-slate-200 rounded w-48 mb-4" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-slate-100 rounded-xl mb-3" />)}</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50"><ShieldAlert className="h-5 w-5 text-red-600" /></div>
            <div><h3 className="text-lg font-bold text-slate-800">Abusive Clients</h3><p className="text-xs text-slate-500">{clients.length} tracked · {clients.filter(c => c.isBlocked).length} blocked</p></div>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600" value={catFilter} onChange={e => setCatFilter(e.target.value as AbuseCategory | 'all')}>
              <option value="all">All Categories</option>
              {(['brute_force','scraping','ddos','credential_stuffing','api_abuse','spam','enumeration','bot_traffic'] as AbuseCategory[]).map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600" value={sevFilter} onChange={e => setSevFilter(e.target.value as AlertSeverity | 'all')}>
              <option value="all">All Severity</option>
              {(['P0','P1','P2','P3'] as AlertSeverity[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-0.5">
              {(['risk','requests','blocked'] as const).map(s => (
                <button key={s} onClick={() => setSortBy(s)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all capitalize ${sortBy === s ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
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
            <div key={client.id} className={`transition-all ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
              <div className="flex items-center gap-4 px-6 py-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : client.id)}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: SEV_DOT[client.severity] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{client.clientName}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${cc.bg} ${cc.text}`}>{client.abuseCategory.replace(/_/g, ' ')}</span>
                    {client.isBlocked && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">BLOCKED</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span>{client.requestCount.toLocaleString()} reqs</span>
                    <span>{client.blockedRequests.toLocaleString()} blocked</span>
                    <span>{client.uniqueEndpoints} endpoints</span>
                  </div>
                </div>
                <MiniBar data={client.requestPattern} color={SEV_DOT[client.severity]} />
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className={`text-lg font-extrabold ${client.riskScore > 80 ? 'text-red-600' : client.riskScore > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{client.riskScore.toFixed(0)}</div>
                  <div className="text-[10px] text-slate-400">risk</div>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isExpanded && (
                <div className="px-6 pb-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {[{ l: 'IP Address', v: client.ipAddress }, { l: 'First Seen', v: new Date(client.firstSeen).toLocaleDateString() }, { l: 'Last Seen', v: new Date(client.lastSeen).toLocaleDateString() }, { l: 'Countries', v: client.countries.join(', ') }, { l: 'Block Status', v: client.blockStatus || 'N/A' }].map((s, i) => (
                      <div key={i} className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-400">{s.l}</div><div className="text-xs font-semibold text-slate-700 truncate">{s.v}</div></div>
                    ))}
                  </div>
                  {client.blockReason && <div className="px-3 py-2 bg-red-50 rounded-lg border border-red-200 text-xs text-red-700 font-medium">🚫 {client.blockReason}</div>}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Evidence ({client.evidence.length})</h5>
                    <div className="space-y-1.5">
                      {client.evidence.map(ev => (
                        <div key={ev.id} className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${CAT_COLORS[ev.type].bg} ${CAT_COLORS[ev.type].text}`}>{ev.type.replace(/_/g, ' ')}</span>
                          <span className="flex-1 text-slate-700">{ev.description}</span>
                          <span className="text-slate-400">{ev.count}x</span>
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

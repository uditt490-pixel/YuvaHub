// ═══════════════════════════════════════════════════════════════════
// Cost Recommendations — Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Lightbulb, TrendingDown, ChevronDown, CheckCircle2, XCircle,
  Clock, AlertTriangle, Zap, Server, Archive, ArrowRight
} from 'lucide-react';
import { CostRecommendation, RecommendationType, RecommendationStatus, AlertSeverity } from '../../types/costOptimization';

interface Props { recommendations: CostRecommendation[]; isLoading: boolean; onAccept: (id: string) => void; onDismiss: (id: string) => void; }

const TYPE_CONFIG: Record<RecommendationType, { icon: React.ReactNode; color: string; bg: string }> = {
  rightsize: { icon: <Server className="h-4 w-4" />, color: 'text-blue-700', bg: 'bg-blue-100' },
  reserved_instance: { icon: <Clock className="h-4 w-4" />, color: 'text-indigo-700', bg: 'bg-indigo-100' },
  spot_instance: { icon: <Zap className="h-4 w-4" />, color: 'text-amber-700', bg: 'bg-amber-100' },
  delete: { icon: <XCircle className="h-4 w-4" />, color: 'text-red-700', bg: 'bg-red-100' },
  archive: { icon: <Archive className="h-4 w-4" />, color: 'text-purple-700', bg: 'bg-purple-100' },
  ' downgrade': { icon: <TrendingDown className="h-4 w-4" />, color: 'text-orange-700', bg: 'bg-orange-100' },
  schedule: { icon: <Clock className="h-4 w-4" />, color: 'text-cyan-700', bg: 'bg-cyan-100' },
  migrate: { icon: <ArrowRight className="h-4 w-4" />, color: 'text-emerald-700', bg: 'bg-emerald-100' }
};

const STATUS_CONFIG: Record<RecommendationStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  accepted: { bg: 'bg-blue-100', text: 'text-blue-700' },
  dismissed: { bg: 'bg-slate-100', text: 'text-slate-500' },
  implemented: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  expired: { bg: 'bg-red-100', text: 'text-red-500' }
};

const SEV_DOT: Record<AlertSeverity, string> = { P0: 'bg-red-500', P1: 'bg-orange-500', P2: 'bg-amber-500', P3: 'bg-blue-500' };

function formatCost(n: number) { return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n.toFixed(0)}`; }

export const CostRecommendations: React.FC<Props> = ({ recommendations, isLoading, onAccept, onDismiss }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<RecommendationType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<RecommendationStatus | 'all'>('all');

  const filtered = recommendations.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const totalSavings = filtered.filter(r => r.status === 'pending').reduce((a, r) => a + r.estimatedSavings, 0);

  if (isLoading) return <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse"><div className="h-6 bg-slate-200 rounded w-48 mb-4" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl mb-3" />)}</div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50"><Lightbulb className="h-5 w-5 text-emerald-600" /></div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Cost Recommendations</h3>
              <p className="text-xs text-slate-500">{filtered.length} recommendations · {formatCost(totalSavings)} potential savings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600" value={filterType} onChange={e => setFilterType(e.target.value as RecommendationType | 'all')}>
              <option value="all">All Types</option>
              {(['rightsize','reserved_instance','spot_instance','delete','archive',' downgrade','schedule','migrate'] as RecommendationType[]).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
            <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600" value={filterStatus} onChange={e => setFilterStatus(e.target.value as RecommendationStatus | 'all')}>
              <option value="all">All Status</option>
              {(['pending','accepted','dismissed','implemented','expired'] as RecommendationStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
        {filtered.map(rec => {
          const tc = TYPE_CONFIG[rec.type];
          const sc = STATUS_CONFIG[rec.status];
          const isExpanded = expandedId === rec.id;
          return (
            <div key={rec.id} className={`transition-all ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}>
              <div className="flex items-center gap-4 px-6 py-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rec.id)}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SEV_DOT[rec.severity]}`} />
                <div className={`p-2 rounded-xl ${tc.bg} ${tc.color} flex-shrink-0`}>{tc.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{rec.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>{rec.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="capitalize">{rec.type.replace(/_/g, ' ')}</span>
                    <span>{rec.provider.toUpperCase()}</span>
                    <span>{rec.implementationEffort} effort</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-extrabold text-emerald-600">{formatCost(rec.estimatedSavings)}</div>
                  <div className="text-[10px] text-slate-400">{rec.estimatedSavingsPercent}% saved</div>
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isExpanded && (
                <div className="px-6 pb-5 space-y-3">
                  <p className="text-sm text-slate-600">{rec.description}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-400">Resource</div><div className="text-xs font-bold text-slate-700 truncate">{rec.resourceName}</div></div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-400">Risk Score</div><div className={`text-xs font-bold ${rec.riskScore > 50 ? 'text-red-600' : 'text-emerald-600'}`}>{rec.riskScore.toFixed(0)}/100</div></div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-400">Valid Until</div><div className="text-xs font-bold text-slate-700">{new Date(rec.validUntil).toLocaleDateString()}</div></div>
                    <div className="bg-white rounded-xl p-3 border border-slate-200"><div className="text-[10px] text-slate-400">Category</div><div className="text-xs font-bold text-slate-700 capitalize">{rec.category}</div></div>
                  </div>
                  {rec.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={e => { e.stopPropagation(); onAccept(rec.id); }} className="px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"><CheckCircle2 className="h-3.5 w-3.5 inline mr-1" /> Accept</button>
                      <button onClick={e => { e.stopPropagation(); onDismiss(rec.id); }} className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"><XCircle className="h-3.5 w-3.5 inline mr-1" /> Dismiss</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CostRecommendations;

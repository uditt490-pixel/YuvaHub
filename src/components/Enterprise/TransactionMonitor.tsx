// ═══════════════════════════════════════════════════════════════════
// Transaction Monitor — Live Transaction Feed Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Search, Filter, ShieldAlert, ShieldCheck, Ban, Eye, Clock,
  MapPin, Smartphone, AlertTriangle, ChevronDown, ChevronRight,
  ExternalLink, ArrowRight, X, Globe, CreditCard, Hash
} from 'lucide-react';
import { Transaction, TransactionStatus, RiskLevel } from '../../types/fraudDetection';

interface Props {
  transactions: Transaction[];
  isLoading: boolean;
  onBlock: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: TransactionStatus | 'all';
  onStatusFilterChange: (s: TransactionStatus | 'all') => void;
  riskFilter: RiskLevel | 'all';
  onRiskFilterChange: (r: RiskLevel | 'all') => void;
}

const STATUS_CONFIG: Record<TransactionStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  approved: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <ShieldCheck className="h-3 w-3" /> },
  flagged: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <AlertTriangle className="h-3 w-3" /> },
  blocked: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <Ban className="h-3 w-3" /> },
  pending_review: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Eye className="h-3 w-3" /> },
  reversed: { bg: 'bg-surface', text: 'text-text-secondary', icon: <ArrowRight className="h-3 w-3" /> }
};

const RISK_CONFIG: Record<RiskLevel, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-red-500/200/20', text: 'text-red-400', dot: 'bg-red-500/200' },
  high: { bg: 'bg-orange-500/200/20', text: 'text-orange-400', dot: 'bg-orange-500/200' },
  medium: { bg: 'bg-amber-500/200/20', text: 'text-amber-400', dot: 'bg-amber-500/200' },
  low: { bg: 'bg-blue-500/200/20', text: 'text-blue-400', dot: 'bg-blue-500/200' },
  minimal: { bg: 'bg-emerald-500/200/20', text: 'text-emerald-400', dot: 'bg-emerald-500/200' }
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export const TransactionMonitor: React.FC<Props> = ({
  transactions, isLoading, onBlock, searchQuery, onSearchChange,
  statusFilter, onStatusFilterChange, riskFilter, onRiskFilterChange
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expanded = transactions.find(t => t.id === expandedId);

  return (
    <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
      {/* Header + Filters */}
      <div className="px-6 py-4 border-b border-border-theme">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20"><CreditCard className="h-5 w-5 text-blue-400" /></div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Transaction Monitor</h3>
              <p className="text-xs text-text-muted">{transactions.length} transactions loaded</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="relative flex-1 w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input type="text" placeholder="Search by ID, user, merchant..." className="w-full pl-9 pr-4 py-2 bg-surface border border-border-theme rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={searchQuery} onChange={e => onSearchChange(e.target.value)} />
          </div>
          <select className="px-3 py-2 bg-surface border border-border-theme rounded-xl text-xs font-medium text-text-secondary" value={statusFilter} onChange={e => onStatusFilterChange(e.target.value as TransactionStatus | 'all')}>
            <option value="all">All Status</option>
            {(['approved','flagged','blocked','pending_review','reversed'] as TransactionStatus[]).map(s => <option key={s} value={s}>{STATUS_CONFIG[s].icon} {s.replace(/_/g, ' ')}</option>)}
          </select>
          <select className="px-3 py-2 bg-surface border border-border-theme rounded-xl text-xs font-medium text-text-secondary" value={riskFilter} onChange={e => onRiskFilterChange(e.target.value as RiskLevel | 'all')}>
            <option value="all">All Risk</option>
            {(['critical','high','medium','low','minimal'] as RiskLevel[]).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-border-theme text-left">
              <th className="px-6 py-3 font-semibold text-text-secondary">Transaction</th>
              <th className="px-4 py-3 font-semibold text-text-secondary text-center">Risk</th>
              <th className="px-4 py-3 font-semibold text-text-secondary text-center">Amount</th>
              <th className="px-4 py-3 font-semibold text-text-secondary text-center">Status</th>
              <th className="px-4 py-3 font-semibold text-text-secondary">Location</th>
              <th className="px-4 py-3 font-semibold text-text-secondary text-center">Anomalies</th>
              <th className="px-4 py-3 font-semibold text-text-secondary text-center">Time</th>
              <th className="px-4 py-3 font-semibold text-text-secondary text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={8} className="px-6 py-4"><div className="h-4 bg-border-theme rounded w-full" /></td></tr>
              ))
            ) : (
              transactions.slice(0, 50).map(txn => {
                const sCfg = STATUS_CONFIG[txn.status];
                const rCfg = RISK_CONFIG[txn.riskLevel];
                const isExpanded = expandedId === txn.id;
                return (
                  <React.Fragment key={txn.id}>
                    <tr className={`hover:bg-surface transition-colors cursor-pointer ${isExpanded ? 'bg-blue-500/20/30' : ''}`} onClick={() => setExpandedId(isExpanded ? null : txn.id)}>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${rCfg.dot}`} />
                          <div>
                            <div className="font-mono font-semibold text-text-primary text-xs">{txn.id}</div>
                            <div className="text-xs text-text-muted">{txn.userName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${rCfg.bg} ${rCfg.text}`}>
                          {txn.riskScore.toFixed(0)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-bold text-text-primary">₹{txn.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${sCfg.bg} ${sCfg.text}`}>
                          {sCfg.icon} {txn.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-text-secondary flex items-center gap-1"><Globe className="h-3 w-3" />{txn.geoLocation.country} · {txn.geoLocation.city}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {txn.anomalyFlags.length > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/200/20 text-orange-400 text-xs font-bold">{txn.anomalyFlags.length} flags</span>
                        ) : <span className="text-xs text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-text-muted">{formatTime(txn.timestamp)}</td>
                      <td className="px-4 py-3 text-center">
                        {txn.status !== 'blocked' && (
                          <button onClick={e => { e.stopPropagation(); onBlock(txn.id); }} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/200/20 transition-colors">
                            <Ban className="h-3 w-3 inline mr-0.5" /> Block
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && expanded && (
                      <tr><td colSpan={8} className="px-6 py-4 bg-surface/80 border-t border-border-theme">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                          <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">IP Address</div><div className="text-xs font-mono font-semibold text-text-primary">{expanded.ipAddress}</div></div>
                          <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Device ID</div><div className="text-xs font-mono font-semibold text-text-primary truncate">{expanded.deviceFingerprint}</div></div>
                          <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Merchant Category</div><div className="text-xs font-semibold text-text-primary capitalize">{expanded.merchantCategory}</div></div>
                          <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Rules Triggered</div><div className="text-xs font-semibold text-text-primary">{expanded.rulesTriggered.length} rules</div></div>
                        </div>
                        {expanded.anomalyFlags.length > 0 && (
                          <div>
                            <h5 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Anomaly Flags</h5>
                            <div className="space-y-1.5">
                              {expanded.anomalyFlags.map(flag => (
                                <div key={flag.id} className="flex items-center gap-3 px-3 py-2 bg-surface rounded-lg border border-border-theme text-xs">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/200/20 text-red-400`}>{flag.severity}</span>
                                  <span className="flex-1 text-text-primary">{flag.description}</span>
                                  <span className="text-text-muted">{flag.confidence}%</span>
                                  {flag.mitigated && <span className="text-emerald-400 font-semibold">Mitigated</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {expanded.notes && <div className="mt-3 px-3 py-2 bg-amber-500/20 rounded-lg border border-amber-500/30 text-xs text-amber-400 font-medium">📌 {expanded.notes}</div>}
                      </td></tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionMonitor;

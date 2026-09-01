// ─── DLP Policy Editor Component ──────────────────────────────────────────────
// Policy rules editor with status toggles, severity badges, scope indicators,
// action configuration, and create/edit workflow.

import React, { useState } from 'react';
import {
  Shield, Plus, Search, Filter, Edit3, Trash2, ToggleLeft, ToggleRight,
  AlertTriangle, Clock, ChevronDown, ChevronUp, Eye, Copy, Settings,
  PlayCircle, PauseCircle, Archive,
} from 'lucide-react';
import { DlpPolicy, DlpPolicyStatus, DlpSeverity, DlpDataType, DlpScanScope } from '../../types/dataLossPrevention';

interface DlpPolicyEditorProps {
  policies: DlpPolicy[];
  isLoading: boolean;
}

const STATUS_CONFIG: Record<DlpPolicyStatus, { label: string; color: string; icon: React.ReactNode }> = {
  ACTIVE: { label: 'Active', color: 'bg-emerald-500/200/20 text-emerald-400 border-emerald-500/30', icon: <PlayCircle className="h-3.5 w-3.5" /> },
  PAUSED: { label: 'Paused', color: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30', icon: <PauseCircle className="h-3.5 w-3.5" /> },
  DRAFT: { label: 'Draft', color: 'bg-surface-secondary text-text-secondary border-border-theme', icon: <Edit3 className="h-3.5 w-3.5" /> },
  ARCHIVED: { label: 'Archived', color: 'bg-surface-secondary text-text-muted border-border-theme', icon: <Archive className="h-3.5 w-3.5" /> },
};

const SEVERITY_COLORS: Record<DlpSeverity, string> = {
  LOW: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30',
  MEDIUM: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30',
  HIGH: 'bg-orange-500/200/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/200/20 text-red-400 border-red-500/30',
};

function formatTimeAgo(timestamp: string | undefined): string {
  if (!timestamp) return 'Never';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const DlpPolicyEditor: React.FC<DlpPolicyEditorProps> = ({ policies, isLoading }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DlpPolicyStatus | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = policies.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">DLP Policies ({filtered.length})</h3>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-primary-blue text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Create Policy
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input type="text" placeholder="Search policies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as DlpPolicyStatus | 'ALL')}
          className="px-3 py-2.5 text-xs font-bold bg-surface border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(policy => {
          const stConf = STATUS_CONFIG[policy.status];
          const isExpanded = expandedId === policy.id;
          return (
            <div key={policy.id} className={`bg-surface rounded-xl border overflow-hidden transition-all ${policy.status === 'ACTIVE' ? 'border-border-theme shadow-sm' : 'border-border-theme opacity-80'}`}>
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : policy.id)}>
                <div className={`p-2 rounded-xl border ${stConf.color}`}>{stConf.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-text-primary truncate">{policy.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${SEVERITY_COLORS[policy.severity]}`}>{policy.severity}</span>
                  </div>
                  <p className="text-xs text-text-muted truncate">{policy.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted">
                    <span>{policy.rules.length} rules</span>
                    <span>{policy.scopes.length} scopes</span>
                    <span>{policy.actions.join(', ')}</span>
                    {policy.triggerCount > 0 && <span>{policy.triggerCount.toLocaleString()} triggers</span>}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-text-muted transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border-theme space-y-3 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">Created</span><p className="text-xs font-bold text-text-primary mt-0.5">{new Date(policy.createdAt).toLocaleDateString()}</p></div>
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">Updated</span><p className="text-xs font-bold text-text-primary mt-0.5">{new Date(policy.updatedAt).toLocaleDateString()}</p></div>
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">Last Triggered</span><p className="text-xs font-bold text-text-primary mt-0.5">{formatTimeAgo(policy.lastTriggeredAt)}</p></div>
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">Threshold</span><p className="text-xs font-bold text-text-primary mt-0.5">{policy.matchThreshold} matches / max {policy.maxMatches}</p></div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase mb-1.5 block">Rules</span>
                    <div className="space-y-1.5">
                      {policy.rules.map(rule => (
                        <div key={rule.id} className="flex items-center gap-3 px-3 py-2 bg-surface rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-emerald-500/200' : 'bg-slate-300'}`} />
                          <span className="text-xs font-bold text-text-primary flex-1">{rule.name}</span>
                          <code className="text-[10px] font-mono text-text-muted max-w-[200px] truncate">{rule.pattern}</code>
                          <span className="text-[10px] text-text-muted">Confidence: {rule.confidenceThreshold}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border-theme">
                    <div className="flex items-center gap-1.5">
                      <button className="p-2 rounded-lg text-text-muted hover:text-indigo-400 hover:bg-indigo-500/20 transition-colors" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button className="p-2 rounded-lg text-text-muted hover:text-amber-400 hover:bg-amber-500/20 transition-colors" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                      <button className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/20 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
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

export default DlpPolicyEditor;

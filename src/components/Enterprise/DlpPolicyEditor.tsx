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
  ACTIVE: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <PlayCircle className="h-3.5 w-3.5" /> },
  PAUSED: { label: 'Paused', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <PauseCircle className="h-3.5 w-3.5" /> },
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: <Edit3 className="h-3.5 w-3.5" /> },
  ARCHIVED: { label: 'Archived', color: 'bg-slate-100 text-slate-400 border-slate-200', icon: <Archive className="h-3.5 w-3.5" /> },
};

const SEVERITY_COLORS: Record<DlpSeverity, string> = {
  LOW: 'bg-blue-100 text-blue-700 border-blue-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
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
    return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-white rounded-xl border border-slate-200 animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">DLP Policies ({filtered.length})</h3>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Create Policy
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search policies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as DlpPolicyStatus | 'ALL')}
          className="px-3 py-2.5 text-xs font-bold bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
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
            <div key={policy.id} className={`bg-white rounded-xl border overflow-hidden transition-all ${policy.status === 'ACTIVE' ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-80'}`}>
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : policy.id)}>
                <div className={`p-2 rounded-xl border ${stConf.color}`}>{stConf.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{policy.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${SEVERITY_COLORS[policy.severity]}`}>{policy.severity}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{policy.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                    <span>{policy.rules.length} rules</span>
                    <span>{policy.scopes.length} scopes</span>
                    <span>{policy.actions.join(', ')}</span>
                    {policy.triggerCount > 0 && <span>{policy.triggerCount.toLocaleString()} triggers</span>}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3"><span className="text-[10px] font-bold text-slate-400 uppercase">Created</span><p className="text-xs font-bold text-slate-800 mt-0.5">{new Date(policy.createdAt).toLocaleDateString()}</p></div>
                    <div className="bg-slate-50 rounded-lg p-3"><span className="text-[10px] font-bold text-slate-400 uppercase">Updated</span><p className="text-xs font-bold text-slate-800 mt-0.5">{new Date(policy.updatedAt).toLocaleDateString()}</p></div>
                    <div className="bg-slate-50 rounded-lg p-3"><span className="text-[10px] font-bold text-slate-400 uppercase">Last Triggered</span><p className="text-xs font-bold text-slate-800 mt-0.5">{formatTimeAgo(policy.lastTriggeredAt)}</p></div>
                    <div className="bg-slate-50 rounded-lg p-3"><span className="text-[10px] font-bold text-slate-400 uppercase">Threshold</span><p className="text-xs font-bold text-slate-800 mt-0.5">{policy.matchThreshold} matches / max {policy.maxMatches}</p></div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Rules</span>
                    <div className="space-y-1.5">
                      {policy.rules.map(rule => (
                        <div key={rule.id} className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span className="text-xs font-bold text-slate-700 flex-1">{rule.name}</span>
                          <code className="text-[10px] font-mono text-slate-500 max-w-[200px] truncate">{rule.pattern}</code>
                          <span className="text-[10px] text-slate-400">Confidence: {rule.confidenceThreshold}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <button className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button className="p-2 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                      <button className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
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

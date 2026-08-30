// ─── API Key Manager Component ────────────────────────────────────────────────
// API key lifecycle management with key list, status badges, usage stats,
// rotation alerts, create/revoke actions, and detail modal.

import React, { useState } from 'react';
import {
  Key, Plus, Search, Shield, Clock, AlertTriangle, CheckCircle2, XCircle,
  Eye, EyeOff, Copy, RefreshCw, Trash2, ChevronDown, ChevronUp,
  Globe, Users, Activity, ExternalLink, X, Filter,
} from 'lucide-react';
import { ApiKey, ApiKeyStatus, ApiKeyScope, ApiKeyEnvironment } from '../../types/apiGateway';

interface ApiKeyManagerProps {
  keys: ApiKey[];
  isLoading: boolean;
  onSelectKey: (key: ApiKey) => void;
}

const STATUS_CONFIG: Record<ApiKeyStatus, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  ACTIVE: { label: 'Active', color: 'bg-emerald-500/200/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500/200', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REVOKED: { label: 'Revoked', color: 'bg-surface-secondary text-text-secondary border-border-theme', dot: 'bg-slate-400', icon: <XCircle className="h-3.5 w-3.5" /> },
  EXPIRED: { label: 'Expired', color: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-500/200', icon: <Clock className="h-3.5 w-3.5" /> },
  SUSPENDED: { label: 'Suspended', color: 'bg-red-500/200/20 text-red-400 border-red-500/30', dot: 'bg-red-500/200', icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  PENDING_ROTATION: { label: 'Rotation Due', color: 'bg-purple-500/200/20 text-purple-400 border-purple-500/30', dot: 'bg-purple-500/200', icon: <RefreshCw className="h-3.5 w-3.5" /> },
};

const SCOPE_COLORS: Record<ApiKeyScope, string> = {
  READ_ONLY: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30',
  READ_WRITE: 'bg-emerald-500/200/20 text-emerald-400 border-emerald-500/30',
  ADMIN: 'bg-red-500/200/20 text-red-400 border-red-500/30',
  WEBHOOK_ONLY: 'bg-orange-500/200/20 text-orange-400 border-orange-500/30',
  CUSTOM: 'bg-purple-500/200/20 text-purple-400 border-purple-500/30',
};

const ENV_COLORS: Record<ApiKeyEnvironment, string> = {
  PRODUCTION: 'bg-red-500/200/20 text-red-400 border-red-500/30',
  STAGING: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30',
  DEVELOPMENT: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30',
  SANDBOX: 'bg-surface-secondary text-text-secondary border-border-theme',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function formatTimeAgo(timestamp: string | undefined): string {
  if (!timestamp) return 'Never';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ keys, isLoading, onSelectKey }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApiKeyStatus | 'ALL'>('ALL');
  const [envFilter, setEnvFilter] = useState<ApiKeyEnvironment | 'ALL'>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const filteredKeys = keys.filter(k => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!k.name.toLowerCase().includes(q) && !k.ownerName.toLowerCase().includes(q) && !k.keyPrefix.toLowerCase().includes(q)) return false;
    }
    if (statusFilter !== 'ALL' && k.status !== statusFilter) return false;
    if (envFilter !== 'ALL' && k.environment !== envFilter) return false;
    return true;
  });

  const toggleReveal = (keyId: string) => {
    setRevealedKeys(prev => {
      const next = new Set(prev);
      if (next.has(keyId)) next.delete(keyId);
      else next.add(keyId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border-theme p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-surface-secondary rounded" />
                <div className="h-3 w-32 bg-surface-secondary rounded" />
              </div>
              <div className="h-6 w-20 bg-surface-secondary rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">API Keys ({filteredKeys.length})</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              showFilters ? 'bg-indigo-500/200/20 border-indigo-500/30 text-indigo-400' : 'bg-surface border-border-theme text-text-secondary hover:bg-surface'
            }`}
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
          <button className="flex items-center gap-1.5 px-4 py-1.5 bg-primary-blue text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Generate Key
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, owner, or key prefix..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {showFilters && (
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ApiKeyStatus | 'ALL')}
            className="px-3 py-1.5 text-xs font-bold bg-surface border border-border-theme rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="REVOKED">Revoked</option>
            <option value="EXPIRED">Expired</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <select
            value={envFilter}
            onChange={e => setEnvFilter(e.target.value as ApiKeyEnvironment | 'ALL')}
            className="px-3 py-1.5 text-xs font-bold bg-surface border border-border-theme rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Environments</option>
            <option value="PRODUCTION">Production</option>
            <option value="STAGING">Staging</option>
            <option value="DEVELOPMENT">Development</option>
            <option value="SANDBOX">Sandbox</option>
          </select>
        </div>
      )}

      {/* Key List */}
      <div className="space-y-2">
        {filteredKeys.map(key => {
          const statusConf = STATUS_CONFIG[key.status];
          const isRevealed = revealedKeys.has(key.id);

          return (
            <div
              key={key.id}
              className="bg-surface rounded-xl border border-border-theme p-4 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onSelectKey(key)}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-2.5 rounded-xl border ${statusConf.color}`}>
                  <Key className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-text-primary truncate">{key.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${statusConf.color}`}>
                      {statusConf.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ENV_COLORS[key.environment]}`}>
                      {key.environment}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <code className="text-xs font-mono text-text-muted bg-surface px-2 py-0.5 rounded">
                      {isRevealed ? key.maskedKey : `sk_${key.keyPrefix}...****`}
                    </code>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleReveal(key.id); }}
                      className="p-1 rounded text-text-muted hover:text-text-secondary"
                    >
                      {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-text-muted">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {key.ownerName}</span>
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {key.teamName}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatTimeAgo(key.lastUsedAt)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">{formatNumber(key.totalRequests)}</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase">Requests</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${key.errorRate > 2 ? 'text-red-400' : key.errorRate > 1 ? 'text-amber-400' : 'text-text-primary'}`}>
                      {key.errorRate}%
                    </p>
                    <p className="text-[10px] text-text-muted font-bold uppercase">Error Rate</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">{key.avgLatencyMs}ms</p>
                    <p className="text-[10px] text-text-muted font-bold uppercase">Avg Latency</p>
                  </div>
                </div>
              </div>

              {/* Rotation Warning */}
              {key.rotationDueAt && key.status === 'ACTIVE' && (
                <div className="mt-3 px-3 py-2 bg-purple-500/20 rounded-lg border border-purple-100 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-[11px] font-bold text-purple-400">
                    Rotation due {formatTimeAgo(key.rotationDueAt)}
                  </span>
                </div>
              )}

              {/* Tags */}
              <div className="flex items-center gap-1.5 mt-3">
                {key.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-surface text-text-muted rounded text-[10px] font-bold border border-border-theme">
                    {tag}
                  </span>
                ))}
                <span className={`ml-auto px-2 py-0.5 rounded text-[10px] font-bold border ${SCOPE_COLORS[key.scope]}`}>
                  {key.scope.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApiKeyManager;

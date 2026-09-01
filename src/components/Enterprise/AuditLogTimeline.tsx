// ─── Audit Log Timeline ───────────────────────────────────────────────────────
// Renders a grouped-by-date timeline of audit log entries with severity
// indicators, expand/collapse, and inline quick-view for each entry.

import React, { useState } from 'react';
import {
  ChevronDown, ChevronRight, AlertTriangle, Info, Shield, ShieldAlert,
  Clock, User, Globe2, ExternalLink, Filter,
} from 'lucide-react';
import { AuditTimelineGroup, AuditLogEntry, AuditSeverity, AuditCategory } from '../../types/auditLog';

interface AuditLogTimelineProps {
  groups: AuditTimelineGroup[];
  isLoading: boolean;
  onSelectEntry: (entry: AuditLogEntry) => void;
}

const SEVERITY_CONFIG: Record<AuditSeverity, { dot: string; badge: string; label: string }> = {
  INFO: { dot: 'bg-emerald-500/200', badge: 'bg-emerald-500/200/20 text-emerald-400 border-emerald-500/30', label: 'INFO' },
  WARNING: { dot: 'bg-amber-500/200', badge: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30', label: 'WARNING' },
  CRITICAL: { dot: 'bg-red-500/200', badge: 'bg-red-500/200/20 text-red-400 border-red-500/30', label: 'CRITICAL' },
  EMERGENCY: { dot: 'bg-rose-600', badge: 'bg-rose-100 text-rose-700 border-rose-200', label: 'EMERGENCY' },
};

const CATEGORY_COLORS: Record<AuditCategory, string> = {
  AUTHENTICATION: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30',
  AUTHORIZATION: 'bg-purple-500/200/20 text-purple-400 border-purple-500/30',
  DATA_MODIFICATION: 'bg-orange-500/200/20 text-orange-400 border-orange-500/30',
  DATA_EXPORT: 'bg-teal-500/200/20 text-teal-400 border-teal-500/30',
  USER_MANAGEMENT: 'bg-indigo-500/200/20 text-indigo-400 border-indigo-500/30',
  SYSTEM_CONFIG: 'bg-surface-secondary text-text-primary border-border-theme',
  BILLING: 'bg-green-100 text-green-700 border-green-200',
  SECURITY: 'bg-red-500/200/20 text-red-400 border-red-500/30',
  API_ACCESS: 'bg-cyan-500/200/20 text-cyan-400 border-cyan-500/30',
  INTEGRATION: 'bg-violet-100 text-violet-700 border-violet-200',
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatExactTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

// ─── Timeline Entry Card ──────────────────────────────────────────────────────

const TimelineEntryCard: React.FC<{
  entry: AuditLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: () => void;
}> = ({ entry, isExpanded, onToggle, onSelect }) => {
  const sev = SEVERITY_CONFIG[entry.severity];
  const catColor = CATEGORY_COLORS[entry.category];

  return (
    <div className={`relative pl-8 pb-1 group`}>
      {/* Timeline line */}
      <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-border-theme group-hover:bg-indigo-300 transition-colors" />

      {/* Timeline dot */}
      <div className={`absolute left-0 top-4 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 ${sev.dot}`}>
        <div className="w-2 h-2 bg-surface rounded-full" />
      </div>

      {/* Card */}
      <div
        className={`ml-4 bg-surface rounded-xl border transition-all cursor-pointer ${
          isExpanded
            ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100'
            : 'border-border-theme hover:border-border-theme hover:shadow-sm'
        }`}
      >
        {/* Main row */}
        <div className="flex items-center gap-3 p-3.5" onClick={onToggle}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${sev.badge}`}>
                {sev.label}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${catColor}`}>
                {entry.category.replace(/_/g, ' ')}
              </span>
              <span className="text-[10px] font-bold text-text-muted">{entry.action.replace(/_/g, ' ')}</span>
            </div>
            <p className="text-sm font-bold text-text-primary truncate">{entry.description}</p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-text-muted font-medium">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" /> {entry.actorName}
              </span>
              <span className="flex items-center gap-1">
                <Globe2 className="h-3 w-3" /> {entry.region}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {formatTimeAgo(entry.timestamp)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {entry.riskScore > 60 && (
              <span className="px-2 py-0.5 bg-red-500/200/20 text-red-400 rounded text-[10px] font-black border border-red-500/30">
                HIGH RISK
              </span>
            )}
            <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Expanded Detail */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-border-theme space-y-3 animate-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-surface rounded-lg p-3">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Time</p>
                <p className="text-xs font-bold text-text-primary">{formatExactTime(entry.timestamp)}</p>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Resource</p>
                <p className="text-xs font-bold text-text-primary truncate">{entry.resourceType.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-text-muted font-mono truncate">{entry.resourceName}</p>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Actor</p>
                <p className="text-xs font-bold text-text-primary">{entry.actorName}</p>
                <p className="text-[10px] text-text-muted">{entry.actorRole}</p>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Risk Score</p>
                <p className={`text-xs font-bold ${entry.riskScore > 60 ? 'text-red-400' : entry.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {entry.riskScore}/100
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-text-muted">
                <span className="font-mono">{entry.id}</span>
                <span>•</span>
                <span>{entry.actorIp}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
              >
                View Full Detail <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Timeline Component ──────────────────────────────────────────────────

export const AuditLogTimeline: React.FC<AuditLogTimelineProps> = ({
  groups,
  isLoading,
  onSelectEntry,
}) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleEntry = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (date: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="pl-8 relative">
            <div className="absolute left-0 top-4 w-6 h-6 rounded-full bg-border-theme animate-pulse" />
            <div className="ml-4 bg-surface rounded-xl border border-border-theme p-4 animate-pulse">
              <div className="flex gap-2 mb-2">
                <div className="h-5 w-16 bg-surface-secondary rounded" />
                <div className="h-5 w-20 bg-surface-secondary rounded" />
              </div>
              <div className="h-4 w-3/4 bg-surface-secondary rounded mb-2" />
              <div className="h-3 w-1/2 bg-surface-secondary rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border-theme border-dashed p-16 text-center">
        <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-text-primary">No Audit Events Found</h3>
        <p className="text-sm text-text-muted mt-2 max-w-md mx-auto">
          No audit log entries match your current filter criteria. Try broadening your filters or adjusting the time range.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map(group => {
        const isCollapsed = collapsedGroups.has(group.date);

        return (
          <div key={group.date}>
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(group.date)}
              className="flex items-center gap-3 mb-4 group/header cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-text-muted group-hover/header:text-indigo-500 transition-colors" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-text-muted group-hover/header:text-indigo-500 transition-colors" />
                )}
                <h3 className="text-sm font-black text-text-primary uppercase tracking-wide">{group.label}</h3>
              </div>
              <div className="flex-1 h-px bg-border-theme group-hover/header:bg-indigo-200 transition-colors" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-muted">{group.totalEvents} events</span>
                {group.criticalCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/200/20 text-red-400 rounded text-[10px] font-black border border-red-500/30">
                    <AlertTriangle className="h-3 w-3" /> {group.criticalCount} critical
                  </span>
                )}
              </div>
            </button>

            {/* Entries */}
            {!isCollapsed && (
              <div className="space-y-3 ml-1">
                {group.entries.map(entry => (
                  <TimelineEntryCard
                    key={entry.id}
                    entry={entry}
                    isExpanded={expandedEntries.has(entry.id)}
                    onToggle={() => toggleEntry(entry.id)}
                    onSelect={() => onSelectEntry(entry)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AuditLogTimeline;

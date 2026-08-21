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
  INFO: { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'INFO' },
  WARNING: { dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-200', label: 'WARNING' },
  CRITICAL: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700 border-red-200', label: 'CRITICAL' },
  EMERGENCY: { dot: 'bg-rose-600', badge: 'bg-rose-100 text-rose-700 border-rose-200', label: 'EMERGENCY' },
};

const CATEGORY_COLORS: Record<AuditCategory, string> = {
  AUTHENTICATION: 'bg-blue-100 text-blue-700 border-blue-200',
  AUTHORIZATION: 'bg-purple-100 text-purple-700 border-purple-200',
  DATA_MODIFICATION: 'bg-orange-100 text-orange-700 border-orange-200',
  DATA_EXPORT: 'bg-teal-100 text-teal-700 border-teal-200',
  USER_MANAGEMENT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  SYSTEM_CONFIG: 'bg-slate-100 text-slate-700 border-slate-200',
  BILLING: 'bg-green-100 text-green-700 border-green-200',
  SECURITY: 'bg-red-100 text-red-700 border-red-200',
  API_ACCESS: 'bg-cyan-100 text-cyan-700 border-cyan-200',
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
      <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-slate-200 group-hover:bg-indigo-300 transition-colors" />

      {/* Timeline dot */}
      <div className={`absolute left-0 top-4 w-6 h-6 rounded-full border-2 border-white shadow-sm flex items-center justify-center z-10 ${sev.dot}`}>
        <div className="w-2 h-2 bg-white rounded-full" />
      </div>

      {/* Card */}
      <div
        className={`ml-4 bg-white rounded-xl border transition-all cursor-pointer ${
          isExpanded
            ? 'border-indigo-300 shadow-md ring-1 ring-indigo-100'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
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
              <span className="text-[10px] font-bold text-slate-400">{entry.action.replace(/_/g, ' ')}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">{entry.description}</p>
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 font-medium">
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
              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-black border border-red-200">
                HIGH RISK
              </span>
            )}
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>

        {/* Expanded Detail */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-1 duration-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Time</p>
                <p className="text-xs font-bold text-slate-800">{formatExactTime(entry.timestamp)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Resource</p>
                <p className="text-xs font-bold text-slate-800 truncate">{entry.resourceType.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{entry.resourceName}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Actor</p>
                <p className="text-xs font-bold text-slate-800">{entry.actorName}</p>
                <p className="text-[10px] text-slate-500">{entry.actorRole}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Risk Score</p>
                <p className={`text-xs font-bold ${entry.riskScore > 60 ? 'text-red-600' : entry.riskScore > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {entry.riskScore}/100
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="font-mono">{entry.id}</span>
                <span>•</span>
                <span>{entry.actorIp}</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
            <div className="absolute left-0 top-4 w-6 h-6 rounded-full bg-slate-200 animate-pulse" />
            <div className="ml-4 bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
              <div className="flex gap-2 mb-2">
                <div className="h-5 w-16 bg-slate-100 rounded" />
                <div className="h-5 w-20 bg-slate-100 rounded" />
              </div>
              <div className="h-4 w-3/4 bg-slate-100 rounded mb-2" />
              <div className="h-3 w-1/2 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-16 text-center">
        <Filter className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-700">No Audit Events Found</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
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
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover/header:text-indigo-500 transition-colors" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover/header:text-indigo-500 transition-colors" />
                )}
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">{group.label}</h3>
              </div>
              <div className="flex-1 h-px bg-slate-200 group-hover/header:bg-indigo-200 transition-colors" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{group.totalEvents} events</span>
                {group.criticalCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-black border border-red-200">
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

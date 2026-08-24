// ═══════════════════════════════════════════════════════════════════
// Uptime Incident Timeline Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  AlertTriangle, Clock, CheckCircle2, Eye, XCircle,
  ChevronDown, ChevronRight, User, ExternalLink,
  Shield, MessageSquare, GitCommit, Search, Filter,
  Calendar, ArrowRight, X, AlertCircle
} from 'lucide-react';
import { Incident, IncidentSeverity, IncidentState, IncidentUpdate } from '../../types/observability';

interface IncidentTimelineProps {
  incidents: Incident[];
  isLoading: boolean;
  selectedIncidentId: string | null;
  onIncidentSelect: (id: string | null) => void;
}

const SEVERITY_CONFIG: Record<IncidentSeverity, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
  P0: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: <XCircle className="h-3.5 w-3.5" />, label: 'Critical' },
  P1: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: <AlertCircle className="h-3.5 w-3.5" />, label: 'Major' },
  P2: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: <AlertTriangle className="h-3.5 w-3.5" />, label: 'Moderate' },
  P3: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: <Eye className="h-3.5 w-3.5" />, label: 'Minor' },
  P4: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', icon: <Clock className="h-3.5 w-3.5" />, label: 'Info' }
};

const STATE_CONFIG: Record<IncidentState, { bg: string; text: string; icon: React.ReactNode; color: string }> = {
  investigating: { bg: 'bg-red-50', text: 'text-red-700', icon: <Search className="h-3.5 w-3.5" />, color: 'bg-red-500' },
  identified: { bg: 'bg-orange-50', text: 'text-orange-700', icon: <Filter className="h-3.5 w-3.5" />, color: 'bg-orange-500' },
  monitoring: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Eye className="h-3.5 w-3.5" />, color: 'bg-amber-500' },
  resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: 'bg-emerald-500' },
  closed: { bg: 'bg-slate-50', text: 'text-slate-600', icon: <Shield className="h-3.5 w-3.5" />, color: 'bg-slate-400' }
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${diffDays}d ago`;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export const UptimeIncidentTimeline: React.FC<IncidentTimelineProps> = ({
  incidents,
  isLoading,
  selectedIncidentId,
  onIncidentSelect
}) => {
  const [filterSeverity, setFilterSeverity] = useState<IncidentSeverity | 'all'>('all');
  const [filterState, setFilterState] = useState<IncidentState | 'all'>('all');

  const filteredIncidents = incidents.filter(inc => {
    if (filterSeverity !== 'all' && inc.severity !== filterSeverity) return false;
    if (filterState !== 'all' && inc.state !== filterState) return false;
    return true;
  });

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-xl mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Incidents & Timeline</h3>
              <p className="text-xs text-slate-500">{incidents.length} total · {incidents.filter(i => i.state === 'investigating' || i.state === 'identified').length} active</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="appearance-none px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as IncidentSeverity | 'all')}
            >
              <option value="all">All Severities</option>
              {(['P0', 'P1', 'P2', 'P3', 'P4'] as IncidentSeverity[]).map(s => (
                <option key={s} value={s}>{SEVERITY_CONFIG[s].label} ({s})</option>
              ))}
            </select>
            <select
              className="appearance-none px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as IncidentState | 'all')}
            >
              <option value="all">All States</option>
              {(['investigating', 'identified', 'monitoring', 'resolved', 'closed'] as IncidentState[]).map(s => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[400px]">
        {/* Incident List */}
        <div className={`${selectedIncident ? 'lg:col-span-2 border-r border-slate-100' : 'lg:col-span-5'} divide-y divide-slate-50 max-h-[600px] overflow-y-auto`}>
          {filteredIncidents.length === 0 && (
            <div className="p-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">No incidents match your filters</p>
            </div>
          )}
          {filteredIncidents.map(incident => {
            const sevConfig = SEVERITY_CONFIG[incident.severity];
            const stateConfig = STATE_CONFIG[incident.state];
            const isActive = incident.state === 'investigating' || incident.state === 'identified' || incident.state === 'monitoring';
            const isSelected = selectedIncidentId === incident.id;

            return (
              <div
                key={incident.id}
                onClick={() => onIncidentSelect(isSelected ? null : incident.id)}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected ? 'bg-indigo-50/50 border-l-2 border-l-indigo-500' : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Severity Badge */}
                  <div className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-bold ${sevConfig.bg} ${sevConfig.text} border ${sevConfig.border} flex items-center gap-1`}>
                    {sevConfig.icon}
                    {incident.severity}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">{incident.title}</h4>
                      {isActive && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* State Badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${stateConfig.bg} ${stateConfig.text}`}>
                        {stateConfig.icon}
                        <span className="capitalize">{incident.state}</span>
                      </span>

                      <span className="text-xs text-slate-400">{formatRelativeTime(incident.createdAt)}</span>
                    </div>

                    {/* Impact */}
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{incident.impactSummary}</p>

                    {/* Assignees */}
                    <div className="flex items-center gap-1 mt-2">
                      {incident.assignees.slice(0, 3).map((a, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-xs text-slate-600">
                          <User className="h-3 w-3" />
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selectedIncident && (
          <div className="lg:col-span-3 p-6 overflow-y-auto max-h-[600px]">
            {/* Incident Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${SEVERITY_CONFIG[selectedIncident.severity].bg} ${SEVERITY_CONFIG[selectedIncident.severity].text} border ${SEVERITY_CONFIG[selectedIncident.severity].border}`}>
                    {SEVERITY_CONFIG[selectedIncident.severity].icon} {selectedIncident.severity}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATE_CONFIG[selectedIncident.state].bg} ${STATE_CONFIG[selectedIncident.state].text} flex items-center gap-1`}>
                    {STATE_CONFIG[selectedIncident.state].icon}
                    <span className="capitalize">{selectedIncident.state}</span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{selectedIncident.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{selectedIncident.description}</p>
              </div>
              <button
                onClick={() => onIncidentSelect(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Impact Box */}
            <div className={`p-4 rounded-xl mb-6 border ${
              selectedIncident.state === 'resolved' || selectedIncident.state === 'closed'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {selectedIncident.state === 'resolved' || selectedIncident.state === 'closed'
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  : <AlertTriangle className="h-4 w-4 text-amber-600" />
                }
                <span className="text-sm font-semibold text-slate-700">Impact Summary</span>
              </div>
              <p className="text-sm text-slate-600">{selectedIncident.impactSummary}</p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Created', value: formatDateTime(selectedIncident.createdAt) },
                { label: 'Updated', value: formatDateTime(selectedIncident.updatedAt) },
                { label: 'Assignees', value: selectedIncident.assignees.join(', ') },
                { label: 'Services', value: `${selectedIncident.affectedServiceIds.length} affected` }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div className="text-xs text-slate-400 mb-0.5">{item.label}</div>
                  <div className="text-sm font-semibold text-slate-700 truncate">{item.value}</div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-indigo-500" />
                Timeline ({selectedIncident.timeline.length} updates)
              </h4>
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-px bg-slate-200" />

                {selectedIncident.timeline.map((update, idx) => {
                  const stateCfg = STATE_CONFIG[update.state];
                  return (
                    <div key={update.id} className="relative mb-6 last:mb-0">
                      {/* Dot */}
                      <div className={`absolute -left-3.5 top-1 w-3 h-3 rounded-full ${stateCfg.color} ring-2 ring-white`} />

                      <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stateCfg.bg} ${stateCfg.text} capitalize`}>
                              {update.state}
                            </span>
                            {update.isPublic && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-indigo-600 bg-indigo-50 uppercase">
                                Public
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{formatDateTime(update.timestamp)}</span>
                        </div>
                        <p className="text-sm text-slate-700">{update.message}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                          <User className="h-3 w-3" />
                          {update.author}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Root Cause */}
            {selectedIncident.rootCause && (
              <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-bold text-indigo-700">Root Cause Analysis</span>
                </div>
                <p className="text-sm text-slate-700">{selectedIncident.rootCause}</p>
                {selectedIncident.postMortemUrl && (
                  <a
                    href={selectedIncident.postMortemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Full Post-Mortem
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UptimeIncidentTimeline;

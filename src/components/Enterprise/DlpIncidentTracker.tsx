// ─── DLP Incident Tracker Component ───────────────────────────────────────────
// Incident tracking panel with severity badges, status workflow, timeline,
// evidence viewer, and assignment management.

import React, { useState } from 'react';
import {
  AlertTriangle, Clock, CheckCircle2, XCircle, Eye, Shield, User,
  ChevronDown, ChevronUp, ExternalLink, FileText, MessageSquare,
} from 'lucide-react';
import { DlpIncident, DlpIncidentStatus, DlpSeverity, DlpIncidentCategory } from '../../types/dataLossPrevention';

interface DlpIncidentTrackerProps {
  incidents: DlpIncident[];
  isLoading: boolean;
  onUpdateStatus: (incidentId: string, status: DlpIncidentStatus) => void;
}

const STATUS_CONFIG: Record<DlpIncidentStatus, { label: string; color: string; dot: string }> = {
  NEW: { label: 'New', color: 'bg-red-500/200/20 text-red-400 border-red-500/30', dot: 'bg-red-500/200' },
  INVESTIGATING: { label: 'Investigating', color: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-500/200' },
  CONTAINED: { label: 'Contained', color: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-500/200' },
  REMEDIATED: { label: 'Remediated', color: 'bg-emerald-500/200/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500/200' },
  FALSE_POSITIVE: { label: 'False Positive', color: 'bg-surface-secondary text-text-secondary border-border-theme', dot: 'bg-slate-400' },
  CLOSED: { label: 'Closed', color: 'bg-surface-secondary text-text-muted border-border-theme', dot: 'bg-slate-300' },
};

const SEVERITY_COLORS: Record<DlpSeverity, string> = {
  LOW: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30',
  MEDIUM: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30',
  HIGH: 'bg-orange-500/200/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/200/20 text-red-400 border-red-500/30',
};

const TIMELINE_EVENT_ICONS: Record<string, string> = {
  DETECTED: '🔍', ASSIGNED: '👤', INVESTIGATING: '🔬', COMMENT: '💬',
  ESCALATED: '🚨', CONTAINED: '🛡️', REMEDIATED: '✅', CLOSED: '📦',
  REOPENED: '🔄', FALSE_POSITIVE: '❌',
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export const DlpIncidentTracker: React.FC<DlpIncidentTrackerProps> = ({ incidents, isLoading, onUpdateStatus }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DlpIncidentStatus | 'ALL'>('ALL');

  const filtered = incidents.filter(i => statusFilter === 'ALL' || i.status === statusFilter);

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Incidents ({filtered.length})</h3>
        <div className="flex gap-1 flex-wrap">
          {(['ALL', 'NEW', 'INVESTIGATING', 'CONTAINED', 'REMEDIATED', 'CLOSED'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${statusFilter === s ? 'bg-primary-blue text-white' : 'bg-surface border border-border-theme text-text-muted hover:bg-surface'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(incident => {
          const stConf = STATUS_CONFIG[incident.status];
          const isExpanded = expandedId === incident.id;
          return (
            <div key={incident.id} className={`bg-surface rounded-xl border overflow-hidden transition-all ${incident.severity === 'CRITICAL' ? 'border-red-500/30 shadow-red-100 shadow-md' : 'border-border-theme shadow-sm'}`}>
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-surface/50 transition-colors" onClick={() => setExpandedId(isExpanded ? null : incident.id)}>
                <div className={`w-3 h-3 rounded-full ${stConf.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-text-primary truncate">{incident.title}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${SEVERITY_COLORS[incident.severity]}`}>{incident.severity}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${stConf.color}`}>{stConf.label}</span>
                  </div>
                  <p className="text-xs text-text-muted truncate">{incident.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                    <span>{incident.category.replace(/_/g, ' ')}</span>
                    <span>{incident.dataType.replace(/_/g, ' ')}</span>
                    <span>{incident.matchCount} matches</span>
                    <span>Risk: {incident.riskScore}/100</span>
                    <span>{formatTimeAgo(incident.detectedAt)}</span>
                    {incident.assignedTo && <span>→ {incident.assignedTo}</span>}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-text-muted transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border-theme space-y-4 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">Affected User</span><p className="text-xs font-bold text-text-primary mt-0.5">{incident.affectedUser}</p><p className="text-[10px] text-text-muted">{incident.affectedUserTeam}</p></div>
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">Resource</span><p className="text-xs font-bold text-text-primary mt-0.5 truncate">{incident.affectedResource}</p></div>
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">Data Volume</span><p className="text-xs font-bold text-text-primary mt-0.5">{(incident.dataVolumeBytes / 1000000).toFixed(1)} MB</p></div>
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">Policy</span><p className="text-xs font-bold text-text-primary mt-0.5">{incident.policyName}</p></div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase mb-2 block">Incident Timeline</span>
                    <div className="space-y-3 ml-2 border-l-2 border-border-theme pl-4">
                      {incident.timeline.map(evt => (
                        <div key={evt.id} className="relative">
                          <div className="absolute -left-[21px] top-0 w-3.5 h-3.5 rounded-full bg-surface border-2 border-border-theme flex items-center justify-center text-[8px]">
                            {TIMELINE_EVENT_ICONS[evt.type] || '•'}
                          </div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-black text-text-muted uppercase">{evt.type}</span>
                            <span className="text-[10px] text-text-muted">{formatTimeAgo(evt.timestamp)}</span>
                          </div>
                          <p className="text-xs text-text-primary">{evt.description}</p>
                          <p className="text-[10px] text-text-muted">by {evt.actor} ({evt.actorRole})</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence */}
                  {incident.evidence.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase mb-2 block">Evidence ({incident.evidence.length})</span>
                      <div className="space-y-2">
                        {incident.evidence.map(ev => (
                          <div key={ev.id} className="flex items-center gap-3 px-3 py-2.5 bg-surface rounded-lg border border-border-theme">
                            <FileText className="h-4 w-4 text-text-muted shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-text-primary">{ev.title}</p>
                              <p className="text-[10px] text-text-muted">{ev.description}</p>
                            </div>
                            <span className="text-[10px] text-text-muted">{ev.type.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution */}
                  {incident.resolution && (
                    <div className="bg-emerald-500/20 rounded-xl p-3 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">Resolution</span>
                      <p className="text-xs text-emerald-400 mt-0.5">{incident.resolution}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border-theme">
                    {incident.status === 'NEW' && (
                      <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(incident.id, 'INVESTIGATING'); }}
                        className="px-3 py-1.5 bg-amber-500/200/20 text-amber-400 rounded-lg text-[11px] font-bold border border-amber-500/30 hover:bg-amber-200 transition-colors">
                        Start Investigation
                      </button>
                    )}
                    {incident.status === 'INVESTIGATING' && (
                      <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(incident.id, 'CONTAINED'); }}
                        className="px-3 py-1.5 bg-blue-500/200/20 text-blue-400 rounded-lg text-[11px] font-bold border border-blue-500/30 hover:bg-blue-200 transition-colors">
                        Mark Contained
                      </button>
                    )}
                    {incident.status === 'CONTAINED' && (
                      <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(incident.id, 'REMEDIATED'); }}
                        className="px-3 py-1.5 bg-emerald-500/200/20 text-emerald-400 rounded-lg text-[11px] font-bold border border-emerald-500/30 hover:bg-emerald-200 transition-colors">
                        Mark Remediated
                      </button>
                    )}
                    {incident.status === 'REMEDIATED' && (
                      <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(incident.id, 'CLOSED'); }}
                        className="px-3 py-1.5 bg-surface-secondary text-text-primary rounded-lg text-[11px] font-bold border border-border-theme hover:bg-border-theme transition-colors">
                        Close Incident
                      </button>
                    )}
                    {incident.status !== 'CLOSED' && incident.status !== 'FALSE_POSITIVE' && (
                      <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(incident.id, 'FALSE_POSITIVE'); }}
                        className="px-3 py-1.5 text-text-muted hover:text-text-secondary rounded-lg text-[11px] font-bold hover:bg-surface-secondary transition-colors ml-auto">
                        Mark False Positive
                      </button>
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

export default DlpIncidentTracker;

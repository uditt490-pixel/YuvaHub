// ─── DLP Scan Results Component ───────────────────────────────────────────────
// Scan results viewer with status indicators, match details, file info,
// confidence scores, and false positive marking.

import React, { useState } from 'react';
import {
  Search, AlertTriangle, CheckCircle2, XCircle, Clock, Eye, FileText,
  Shield, ChevronDown, ChevronUp, ExternalLink, Filter,
} from 'lucide-react';
import { DlpScan, DlpScanStatus, DlpScanMatch, DlpSeverity, DlpDataType } from '../../types/dataLossPrevention';

interface DlpScanResultsProps {
  scans: DlpScan[];
  isLoading: boolean;
}

const STATUS_CONFIG: Record<DlpScanStatus, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', color: 'text-slate-500', dot: 'bg-slate-400', icon: <Clock className="h-4 w-4" /> },
  RUNNING: { label: 'Running', color: 'text-blue-600', dot: 'bg-blue-500 animate-pulse', icon: <Search className="h-4 w-4 animate-spin" /> },
  COMPLETED: { label: 'Completed', color: 'text-emerald-600', dot: 'bg-emerald-500', icon: <CheckCircle2 className="h-4 w-4" /> },
  FAILED: { label: 'Failed', color: 'text-red-600', dot: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> },
  CANCELLED: { label: 'Cancelled', color: 'text-slate-400', dot: 'bg-slate-300', icon: <XCircle className="h-4 w-4" /> },
};

const SEVERITY_COLORS: Record<DlpSeverity, string> = {
  LOW: 'bg-blue-100 text-blue-700 border-blue-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
};

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

export const DlpScanResults: React.FC<DlpScanResultsProps> = ({ scans, isLoading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<DlpScanStatus | 'ALL'>('ALL');

  const filtered = scans.filter(s => statusFilter === 'ALL' || s.status === statusFilter);

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Scan Results ({filtered.length})</h3>
        <div className="flex gap-1">
          {(['ALL', 'RUNNING', 'COMPLETED', 'FAILED'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${statusFilter === s ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(scan => {
          const stConf = STATUS_CONFIG[scan.status];
          const isExpanded = expandedId === scan.id;
          return (
            <div key={scan.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : scan.id)}>
                <div className={`${stConf.color}`}>{stConf.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-slate-800">{scan.name}</h4>
                    <span className={`text-[10px] font-bold ${stConf.color}`}>{stConf.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{scan.targetResource}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                    <span>{scan.scope.replace(/_/g, ' ')}</span>
                    <span>{scan.totalFilesScanned} files</span>
                    <span>{formatBytes(scan.totalDataScannedBytes)}</span>
                    {scan.durationMs && <span>{formatDuration(scan.durationMs)}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {scan.matchesFound > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black border border-red-200">
                      <AlertTriangle className="h-3 w-3" /> {scan.matchesFound} matches
                    </span>
                  )}
                  {scan.incidentsCreated > 0 && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold border border-amber-200">
                      {scan.incidentsCreated} incidents
                    </span>
                  )}
                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3"><span className="text-[10px] font-bold text-slate-400 uppercase">Initiated By</span><p className="text-xs font-bold text-slate-800 mt-0.5">{scan.initiatedBy}</p></div>
                    <div className="bg-slate-50 rounded-lg p-3"><span className="text-[10px] font-bold text-slate-400 uppercase">Trigger</span><p className="text-xs font-bold text-slate-800 mt-0.5">{scan.trigger}</p></div>
                    <div className="bg-slate-50 rounded-lg p-3"><span className="text-[10px] font-bold text-slate-400 uppercase">Policies Evaluated</span><p className="text-xs font-bold text-slate-800 mt-0.5">{scan.policiesEvaluated}</p></div>
                    <div className="bg-slate-50 rounded-lg p-3"><span className="text-[10px] font-bold text-slate-400 uppercase">Started</span><p className="text-xs font-bold text-slate-800 mt-0.5">{new Date(scan.startedAt).toLocaleString()}</p></div>
                  </div>

                  {scan.errorMessage && (
                    <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                      <span className="text-[10px] font-bold text-red-500 uppercase">Error</span>
                      <p className="text-xs text-red-700 mt-0.5">{scan.errorMessage}</p>
                    </div>
                  )}

                  {scan.results.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Match Details</span>
                      <div className="space-y-2">
                        {scan.results.map(match => (
                          <div key={match.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${match.isFalsePositive ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-red-50/50 border-red-100'}`}>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black border ${SEVERITY_COLORS[match.severity]}`}>{match.severity}</span>
                            <span className="text-xs font-bold text-slate-700 w-28 truncate">{match.dataType.replace(/_/g, ' ')}</span>
                            <code className="text-[11px] font-mono text-slate-600 flex-1 truncate">{match.matchedContent}</code>
                            <span className="text-[10px] font-bold text-slate-500">{match.confidence}%</span>
                            <span className="text-[10px] text-slate-400">{match.fileName}:{match.lineNumber}</span>
                            {match.isFalsePositive && <span className="text-[9px] font-bold text-slate-400">FALSE POSITIVE</span>}
                          </div>
                        ))}
                      </div>
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

export default DlpScanResults;

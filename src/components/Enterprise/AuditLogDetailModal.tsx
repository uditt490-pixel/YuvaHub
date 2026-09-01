// ─── Audit Log Detail Modal ───────────────────────────────────────────────────
// Full detail view for a single audit log entry with metadata, diff viewer,
// actor info, geo info, and compliance context.

import React, { useState } from 'react';
import {
  X, User, Globe2, Clock, Shield, FileText, Copy, Check, ChevronDown, ChevronUp,
  AlertTriangle, Info, ExternalLink, MapPin, Monitor, Key,
} from 'lucide-react';
import { AuditLogEntry, AuditSeverity } from '../../types/auditLog';

interface AuditLogDetailModalProps {
  entry: AuditLogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

const SEVERITY_CONFIG: Record<AuditSeverity, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
  INFO: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: <Info className="h-4 w-4" /> },
  WARNING: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', icon: <AlertTriangle className="h-4 w-4" /> },
  CRITICAL: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: <AlertTriangle className="h-4 w-4" /> },
  EMERGENCY: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: <Shield className="h-4 w-4" /> },
};

const CopyableField: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-text-primary truncate max-w-[280px]">{value}</span>
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-surface-secondary text-text-muted hover:text-text-secondary transition-colors"
          title="Copy"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
};

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ entry, isOpen, onClose }) => {
  const [showMetadata, setShowMetadata] = useState(false);
  const [showDiff, setShowDiff] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'actor' | 'technical'>('overview');

  if (!isOpen || !entry) return null;

  const sevConfig = SEVERITY_CONFIG[entry.severity];

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start p-4 pt-16 bg-primary-blue/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface rounded-3xl shadow-2xl max-w-3xl w-full border border-border-theme overflow-hidden mb-16">

        {/* Header */}
        <div className="px-6 py-5 border-b border-border-theme flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${sevConfig.bg} ${sevConfig.text} border ${sevConfig.border}`}>
              {sevConfig.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Audit Entry Detail</h3>
              <p className="text-xs text-text-muted font-mono">{entry.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-border-theme text-text-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Severity Banner */}
        <div className={`px-6 py-3 ${sevConfig.bg} border-b ${sevConfig.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${sevConfig.bg} ${sevConfig.text} border ${sevConfig.border}`}>
                {entry.severity}
              </span>
              <span className="text-sm font-bold text-text-primary">{entry.description}</span>
            </div>
            <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              entry.riskScore > 60 ? 'bg-red-500/200/20 text-red-400' :
              entry.riskScore > 30 ? 'bg-amber-500/200/20 text-amber-400' :
              'bg-emerald-500/200/20 text-emerald-400'
            }`}>
              Risk: {entry.riskScore}/100
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-border-theme">
          <div className="flex gap-1">
            {(['overview', 'actor', 'technical'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-400'
                    : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'actor' ? 'Actor Details' : 'Technical'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">

          {activeTab === 'overview' && (
            <>
              {/* Key Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface rounded-xl p-4 border border-border-theme">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-text-muted" />
                    <span className="text-xs font-bold text-text-muted uppercase">Timestamp</span>
                  </div>
                  <p className="text-sm font-bold text-text-primary">{new Date(entry.timestamp).toLocaleString()}</p>
                  <p className="text-xs text-text-muted mt-0.5">{new Date(entry.timestamp).toISOString()}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-border-theme">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-text-muted" />
                    <span className="text-xs font-bold text-text-muted uppercase">Action</span>
                  </div>
                  <p className="text-sm font-bold text-text-primary">{entry.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-text-muted mt-0.5">{entry.category.replace(/_/g, ' ')}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-border-theme">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="h-4 w-4 text-text-muted" />
                    <span className="text-xs font-bold text-text-muted uppercase">Resource</span>
                  </div>
                  <p className="text-sm font-bold text-text-primary">{entry.resourceType.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-text-muted mt-0.5 font-mono truncate">{entry.resourceName}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-border-theme">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe2 className="h-4 w-4 text-text-muted" />
                    <span className="text-xs font-bold text-text-muted uppercase">Region</span>
                  </div>
                  <p className="text-sm font-bold text-text-primary">{entry.region}</p>
                  <p className="text-xs text-text-muted mt-0.5">{entry.geoLocation.city}, {entry.geoLocation.country}</p>
                </div>
              </div>

              {/* Diff Viewer */}
              {(entry.previousValue || entry.newValue) && (
                <div>
                  <button
                    onClick={() => setShowDiff(!showDiff)}
                    className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest mb-3"
                  >
                    {showDiff ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    Change Diff
                  </button>
                  {showDiff && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {entry.previousValue && (
                        <div className="bg-red-500/20 rounded-xl border border-red-500/30 p-4">
                          <p className="text-[10px] font-bold text-red-400 uppercase mb-2">Previous Value</p>
                          <pre className="text-xs font-mono text-red-800 whitespace-pre-wrap break-all">{entry.previousValue}</pre>
                        </div>
                      )}
                      {entry.newValue && (
                        <div className="bg-emerald-500/20 rounded-xl border border-emerald-500/30 p-4">
                          <p className="text-[10px] font-bold text-emerald-400 uppercase mb-2">New Value</p>
                          <pre className="text-xs font-mono text-emerald-800 whitespace-pre-wrap break-all">{entry.newValue}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'actor' && (
            <>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {entry.actorName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-text-primary">{entry.actorName}</h4>
                    <p className="text-sm text-text-secondary">{entry.actorRole}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <CopyableField label="Email" value={entry.actorEmail} />
                  <CopyableField label="User ID" value={entry.actorId} />
                  <CopyableField label="Session ID" value={entry.sessionId} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface rounded-xl p-4 border border-border-theme">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe2 className="h-4 w-4 text-text-muted" />
                    <span className="text-xs font-bold text-text-muted uppercase">IP Address</span>
                  </div>
                  <p className="text-sm font-mono font-bold text-text-primary">{entry.actorIp}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-border-theme">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-text-muted" />
                    <span className="text-xs font-bold text-text-muted uppercase">Geo Location</span>
                  </div>
                  <p className="text-sm font-bold text-text-primary">{entry.geoLocation.city}, {entry.geoLocation.country}</p>
                  <p className="text-xs text-text-muted font-mono">{entry.geoLocation.latitude.toFixed(4)}, {entry.geoLocation.longitude.toFixed(4)}</p>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4 border border-border-theme">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4 text-text-muted" />
                  <span className="text-xs font-bold text-text-muted uppercase">User Agent</span>
                </div>
                <p className="text-xs font-mono text-text-primary break-all">{entry.actorUserAgent}</p>
              </div>
            </>
          )}

          {activeTab === 'technical' && (
            <>
              <CopyableField label="Request ID" value={entry.requestId} />
              <CopyableField label="Session ID" value={entry.sessionId} />
              <CopyableField label="Actor IP" value={entry.actorIp} />

              {/* Affected Users */}
              {entry.affectedUsers.length > 0 && (
                <div className="bg-amber-500/20 rounded-xl p-4 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase">Affected Users ({entry.affectedUsers.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.affectedUsers.slice(0, 10).map(uid => (
                      <span key={uid} className="px-2 py-0.5 bg-amber-500/200/20 text-amber-800 rounded text-[10px] font-mono">{uid}</span>
                    ))}
                    {entry.affectedUsers.length > 10 && (
                      <span className="px-2 py-0.5 bg-amber-500/200/20 text-amber-800 rounded text-[10px] font-bold">+{entry.affectedUsers.length - 10} more</span>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <button
                  onClick={() => setShowMetadata(!showMetadata)}
                  className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-widest mb-3"
                >
                  {showMetadata ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  Raw Metadata
                </button>
                {showMetadata && (
                  <div className="bg-primary-blue rounded-xl p-4 overflow-x-auto">
                    <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                      {JSON.stringify(entry.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-theme bg-surface/50 flex items-center justify-between">
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(entry, null, 2)).catch(() => {})}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-text-secondary hover:bg-border-theme rounded-xl transition-colors"
          >
            <Copy className="h-3.5 w-3.5" /> Copy Full Entry
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-white bg-primary-blue hover:bg-indigo-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailModal;

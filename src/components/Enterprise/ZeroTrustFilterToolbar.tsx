import React from 'react';
import { ZeroTrustFilter, ThreatSeverity, GateProtocol, AccessStatus } from '../../types/zeroTrustSecurity';
import { Search, Download, RotateCcw, ArrowUpDown, ShieldCheck } from 'lucide-react';

interface ZeroTrustFilterToolbarProps {
  filters: ZeroTrustFilter;
  onChange: (filters: ZeroTrustFilter) => void;
  onReset: () => void;
  onExportCsv: () => void;
  totalMatches: number;
}

export const ZeroTrustFilterToolbar: React.FC<ZeroTrustFilterToolbarProps> = ({
  filters,
  onChange,
  onReset,
  onExportCsv,
  totalMatches
}) => {
  return (
    <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm space-y-4">
      {/* Search and Action Buttons */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by event ID, IP, principal, location, or resource..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme text-xs text-text-primary dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl bg-surface-secondary dark:bg-surface-secondary hover:bg-border-theme dark:hover:bg-slate-700 text-text-primary dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={onReset}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary dark:hover:text-slate-300 hover:bg-surface-secondary dark:hover:bg-surface-secondary transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-border-theme dark:border-border-theme text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Threat Severity
          </label>
          <select
            value={filters.threatSeverity}
            onChange={(e) => onChange({ ...filters, threatSeverity: e.target.value as any })}
            className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL_BREACH">Critical Breach</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low / Normal</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Gate Protocol
          </label>
          <select
            value={filters.gateProtocol}
            onChange={(e) => onChange({ ...filters, gateProtocol: e.target.value as any })}
            className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
          >
            <option value="ALL">All Protocols</option>
            <option value="BIOMETRIC_PASSKEY">Biometric Passkey</option>
            <option value="MTLS_HANDSHAKE">mTLS Handshake</option>
            <option value="JWT_ZERO_TRUST">JWT Zero-Trust</option>
            <option value="OAUTH2_PKCE">OAuth2 PKCE</option>
            <option value="EPHEMERAL_SSH">Ephemeral SSH</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Access Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as any })}
            className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="GRANTED">Granted</option>
            <option value="DENIED">Denied</option>
            <option value="QUARANTINED">Quarantined</option>
            <option value="UNDER_REVIEW">Under Review</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Min Risk Score ({filters.minRiskScore || 0})
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.minRiskScore}
            onChange={(e) => onChange({ ...filters, minRiskScore: Number(e.target.value) })}
            className="w-full accent-blue-600 mt-1 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Sort By
          </label>
          <div className="flex items-center gap-1">
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
            >
              <option value="riskScore">Risk Score</option>
              <option value="timestamp">Timestamp</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() =>
                onChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
              }
              className="p-2 rounded-lg bg-surface-secondary dark:bg-surface-secondary text-text-secondary dark:text-slate-300 hover:bg-border-theme transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted dark:text-text-muted">
        <span>
          Showing <strong className="text-text-primary dark:text-white">{totalMatches}</strong> audited security events
        </span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-400 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" /> Zero-Trust Gateways Online
        </span>
      </div>
    </div>
  );
};

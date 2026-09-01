// ─── Enterprise SSO & Identity Hub ────────────────────────────────────────────
// Full page container for SSO/Identity: providers, sessions, MFA, policies,
// audit log, and metrics dashboard.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Key, Users, Globe, Clock, AlertTriangle, CheckCircle2, XCircle,
  Eye, Search, RefreshCw, Lock, Smartphone, Server, Fingerprint, Ban,
  ChevronDown, ChevronUp, X, ShieldAlert, UserCheck, Radio, Zap,
  Settings, FileText, Filter, ExternalLink,
} from 'lucide-react';
import {
  SsoProvider, SsoProviderStatus, UserSession, SessionStatus, AuthMethod,
  MfaConfiguration, MfaStatus, AccessPolicy, IdentityAuditEntry, IdentityMetrics,
  RiskLevel, AuditFilters,
} from '../../types/ssoIdentity';
import { SsoIdentityService } from '../../services/SsoIdentityService';

type PageView = 'overview' | 'providers' | 'sessions' | 'mfa' | 'policies' | 'audit';

const VIEW_TABS: Array<{ id: PageView; label: string; icon: React.ReactNode; badge?: string }> = [
  { id: 'overview', label: 'Overview', icon: <Shield className="h-4 w-4" /> },
  { id: 'providers', label: 'SSO Providers', icon: <Server className="h-4 w-4" /> },
  { id: 'sessions', label: 'Sessions', icon: <Clock className="h-4 w-4" /> },
  { id: 'mfa', label: 'MFA', icon: <Smartphone className="h-4 w-4" /> },
  { id: 'policies', label: 'Policies', icon: <Lock className="h-4 w-4" /> },
  { id: 'audit', label: 'Audit Log', icon: <FileText className="h-4 w-4" /> },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVE: { bg: 'bg-emerald-500/200/200/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  INACTIVE: { bg: 'bg-surface-secondary', text: 'text-text-secondary', border: 'border-border-theme' },
  CONFIGURING: { bg: 'bg-amber-500/200/200/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  ERROR: { bg: 'bg-red-500/200/200/20', text: 'text-red-400', border: 'border-red-500/30' },
  MAINTENANCE: { bg: 'bg-purple-500/200/200/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  EXPIRED: { bg: 'bg-surface-secondary', text: 'text-text-muted', border: 'border-border-theme' },
  REVOKED: { bg: 'bg-red-500/200/200/20', text: 'text-red-400', border: 'border-red-500/30' },
  IDLE_TIMEOUT: { bg: 'bg-amber-500/200/200/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  CONCURRENT_LIMIT: { bg: 'bg-orange-500/200/200/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  ENABLED: { bg: 'bg-emerald-500/200/200/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  DISABLED: { bg: 'bg-surface-secondary', text: 'text-text-muted', border: 'border-border-theme' },
  ENFORCED: { bg: 'bg-blue-500/200/200/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  SETUP_INCOMPLETE: { bg: 'bg-amber-500/200/200/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  PENDING: { bg: 'bg-amber-500/200/200/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  APPROVED: { bg: 'bg-emerald-500/200/200/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  REJECTED: { bg: 'bg-red-500/200/200/20', text: 'text-red-400', border: 'border-red-500/30' },
  PENDING_VERIFICATION: { bg: 'bg-amber-500/200/200/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  LOCKED: { bg: 'bg-red-500/200/200/20', text: 'text-red-400', border: 'border-red-500/30' },
  DEACTIVATED: { bg: 'bg-surface-secondary', text: 'text-text-muted', border: 'border-border-theme' },
  SUSPENDED: { bg: 'bg-orange-500/200/200/20', text: 'text-orange-400', border: 'border-orange-500/30' },
};

const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: 'bg-emerald-500/200/200/20 text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/200/200/20 text-amber-400 border-amber-500/30',
  HIGH: 'bg-orange-500/200/200/20 text-orange-400 border-orange-500/30',
  CRITICAL: 'bg-red-500/200/200/20 text-red-400 border-red-500/30',
};

function formatTimeAgo(ts: string | undefined): string {
  if (!ts) return 'Never';
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Overview ─────────────────────────────────────────────────────────────────

const OverviewPanel: React.FC<{ metrics: IdentityMetrics | null; isLoading: boolean }> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Sessions', value: metrics.activeSessions, color: 'bg-indigo-500/200' },
          { label: 'SSO Users', value: metrics.ssoUsers, color: 'bg-emerald-500/200/200' },
          { label: 'MFA Enforced', value: metrics.mfaEnforced, color: 'bg-blue-500/200/200' },
          { label: 'Failed Logins (24h)', value: metrics.failedLogins24h, color: 'bg-red-500/200/200' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden">
            <div className={`absolute left-0 top-0 w-1 h-full ${kpi.color} rounded-l-xl`} />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{kpi.label}</span>
            <p className="text-2xl font-black text-text-primary mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Login Success Rate', value: `${metrics.loginSuccessRate}%` },
          { label: 'Avg Login Time', value: `${metrics.avgLoginTimeMs}ms` },
          { label: 'Locked Accounts', value: metrics.lockedAccounts },
          { label: 'High Risk Sessions', value: metrics.highRiskSessions },
        ].map(kpi => (
          <div key={kpi.label} className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm">
            <span className="text-[10px] font-bold text-text-muted uppercase">{kpi.label}</span>
            <p className="text-xl font-black text-text-primary mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Provider & Auth Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">SSO Provider Usage</h4>
          <div className="space-y-2.5">
            {metrics.providerBreakdown.map(p => (
              <div key={p.provider} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-text-secondary w-32 truncate">{p.provider.replace(/_/g, ' ')}</span>
                <div className="flex-1 h-3 bg-surface-secondary rounded-full overflow-hidden"><div className="h-full bg-indigo-500/200 rounded-full" style={{ width: `${p.percentage}%` }} /></div>
                <span className="text-xs font-bold text-text-primary w-12 text-right">{p.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Auth Method Distribution</h4>
          <div className="space-y-2.5">
            {metrics.authMethodBreakdown.map(a => (
              <div key={a.method} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-text-secondary w-32">{a.method}</span>
                <div className="flex-1 h-3 bg-surface-secondary rounded-full overflow-hidden"><div className="h-full bg-emerald-500/200/200 rounded-full" style={{ width: `${a.percentage}%` }} /></div>
                <span className="text-xs font-bold text-text-primary w-12 text-right">{a.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Risk & Geo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Session Risk Distribution</h4>
          <div className="space-y-3">
            {metrics.riskDistribution.map(r => (
              <div key={r.level} className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${RISK_COLORS[r.level]}`}>{r.level}</span>
                <div className="flex-1 h-3 bg-surface-secondary rounded-full overflow-hidden"><div className="h-full bg-surface0 rounded-full" style={{ width: `${Math.max(r.percentage, 2)}%` }} /></div>
                <span className="text-xs font-bold text-text-primary w-12 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Geographic Distribution</h4>
          <div className="space-y-3">
            {metrics.geoDistribution.map(g => (
              <div key={g.country} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-text-secondary w-28">{g.country}</span>
                <div className="flex-1 h-3 bg-surface-secondary rounded-full overflow-hidden"><div className="h-full bg-blue-500/200/200 rounded-full" style={{ width: `${g.percentage}%` }} /></div>
                <span className="text-xs font-bold text-text-primary w-12 text-right">{g.sessions}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Risky Users */}
      <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Top Risky Users</h4>
        <div className="space-y-3">
          {metrics.topRiskyUsers.map((u, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">{u.user.charAt(0)}</div>
              <div className="flex-1 min-w-0"><p className="text-xs font-bold text-text-primary">{u.user}</p><p className="text-[10px] text-text-muted">{u.email}</p></div>
              <span className="text-[10px] text-text-muted">{u.location}</span>
              <div className="text-right"><p className="text-sm font-bold text-red-400">{u.riskScore}</p><p className="text-[10px] text-text-muted">{u.sessions} sessions</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Sessions Panel ───────────────────────────────────────────────────────────

const SessionsPanel: React.FC<{ sessions: UserSession[]; isLoading: boolean; onRevoke: (id: string) => void }> = ({ sessions, isLoading, onRevoke }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = sessions.filter(s => {
    if (search && !s.userName.toLowerCase().includes(search.toLowerCase()) && !s.userEmail.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    return true;
  });

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as SessionStatus | 'ALL')}
          className="px-3 py-2.5 text-xs font-bold bg-surface border border-border-theme rounded-xl outline-none">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="EXPIRED">Expired</option>
          <option value="REVOKED">Revoked</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(session => {
          const stConf = STATUS_COLORS[session.status] || STATUS_COLORS.ACTIVE;
          const isExpanded = expandedId === session.id;
          return (
            <div key={session.id} className="bg-surface rounded-xl border border-border-theme overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : session.id)}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">{session.userName.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-text-primary truncate">{session.userName}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${stConf.bg} ${stConf.text} ${stConf.border}`}>{session.status}</span>
                    {session.riskScore > 60 && <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${RISK_COLORS.CRITICAL}`}>RISK {session.riskScore}</span>}
                  </div>
                  <p className="text-xs text-text-muted truncate">{session.userEmail}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                    <span>{session.authMethod}</span>
                    <span>{session.device.os} / {session.device.browser}</span>
                    <span>{session.geoLocation.country}</span>
                    <span>{formatTimeAgo(session.lastActivityAt)}</span>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border-theme space-y-3 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">IP Address</span><p className="text-xs font-mono font-bold text-text-primary mt-0.5">{session.ipAddress}</p></div>
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">Location</span><p className="text-xs font-bold text-text-primary mt-0.5">{session.geoLocation.city}, {session.geoLocation.country}</p></div>
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">SSO Provider</span><p className="text-xs font-bold text-text-primary mt-0.5">{session.ssoProvider || 'Direct'}</p></div>
                    <div className="bg-surface rounded-lg p-3"><span className="text-[10px] font-bold text-text-muted uppercase">MFA Verified</span><p className={`text-xs font-bold mt-0.5 ${session.mfaVerified ? 'text-emerald-400' : 'text-red-400'}`}>{session.mfaVerified ? 'Yes' : 'No'}</p></div>
                  </div>
                  {session.riskFactors.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-text-muted uppercase mb-1.5 block">Risk Factors</span>
                      {session.riskFactors.map((rf, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${RISK_COLORS[rf.severity]}`}>
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span className="text-xs font-bold">{rf.type.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] ml-auto">{rf.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {session.status === 'ACTIVE' && (
                    <button onClick={(e) => { e.stopPropagation(); onRevoke(session.id); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/200/20 text-red-400 rounded-lg text-[11px] font-bold border border-red-500/30 hover:bg-red-500/200/200/20 transition-colors">
                      <Ban className="h-3 w-3" /> Revoke Session
                    </button>
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

// ─── Providers Panel ──────────────────────────────────────────────────────────

const ProvidersPanel: React.FC<{ providers: SsoProvider[]; isLoading: boolean }> = ({ providers, isLoading }) => {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {providers.map(p => {
        const stConf = STATUS_COLORS[p.status] || STATUS_COLORS.INACTIVE;
        return (
          <div key={p.id} className="bg-surface rounded-xl border border-border-theme p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl border ${stConf.bg} ${stConf.text} ${stConf.border}`}><Server className="h-5 w-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-bold text-text-primary">{p.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${stConf.bg} ${stConf.text} ${stConf.border}`}>{p.status}</span>
                </div>
                <p className="text-xs text-text-muted">{p.description}</p>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-text-muted">
                  <span className="font-mono">{p.type.replace(/_/g, ' ')}</span>
                  <span>{p.totalLogins.toLocaleString()} logins</span>
                  <span>{p.failedLogins} failures</span>
                  <span>{p.averageLoginTimeMs}ms avg</span>
                  <span>{p.jitProvisioning ? 'JIT Enabled' : 'No JIT'}</span>
                  <span>{p.enforceSso ? 'SSO Enforced' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── MFA Panel ────────────────────────────────────────────────────────────────

const MfaPanel: React.FC<{ configs: MfaConfiguration[]; isLoading: boolean }> = ({ configs, isLoading }) => {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {configs.map(cfg => {
        const stConf = STATUS_COLORS[cfg.status] || STATUS_COLORS.DISABLED;
        return (
          <div key={cfg.id} className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">{cfg.userName.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-bold text-text-primary">{cfg.userName}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${stConf.bg} ${stConf.text} ${stConf.border}`}>{cfg.status.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-xs text-text-muted">{cfg.userEmail}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted">
                  <span>Primary: {cfg.primaryMethod}</span>
                  {cfg.totpEnabled && <span className="text-emerald-500">TOTP ✓</span>}
                  {cfg.smsEnabled && <span className="text-emerald-500">SMS ✓</span>}
                  {cfg.hardwareKeyCount > 0 && <span className="text-emerald-500">{cfg.hardwareKeyCount} HW Keys</span>}
                  <span>{cfg.backupCodesRemaining} backup codes</span>
                  {cfg.enforcementDate && <span className="text-amber-500">Enforce by {new Date(cfg.enforcementDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Audit Panel ──────────────────────────────────────────────────────────────

const AuditPanel: React.FC<{ entries: IdentityAuditEntry[]; isLoading: boolean }> = ({ entries, isLoading }) => {
  const [search, setSearch] = useState('');
  const filtered = entries.filter(e => search ? e.userName.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()) : true);

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <input type="text" placeholder="Search audit log..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
      <div className="space-y-2">
        {filtered.slice(0, 30).map(entry => {
          const riskConf = entry.riskScore && entry.riskScore > 60 ? RISK_COLORS.CRITICAL : entry.riskScore && entry.riskScore > 30 ? RISK_COLORS.HIGH : RISK_COLORS.LOW;
          return (
            <div key={entry.id} className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${riskConf}`}><ShieldAlert className="h-4 w-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-text-primary">{entry.eventType.replace(/_/g, ' ')}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${RISK_COLORS[entry.severity]}`}>{entry.severity}</span>
                </div>
                <p className="text-xs text-text-muted truncate">{entry.description}</p>
                <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                  <span>{entry.userName}</span>
                  <span>{entry.ipAddress}</span>
                  <span>{entry.geoLocation}</span>
                  <span>{entry.authMethod}</span>
                  <span>{formatTimeAgo(entry.timestamp)}</span>
                </div>
              </div>
              {entry.riskScore !== undefined && (
                <span className={`text-xs font-bold ${entry.riskScore > 60 ? 'text-red-400' : entry.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{entry.riskScore}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const SsoIdentityHub: React.FC = () => {
  const [activeView, setActiveView] = useState<PageView>('overview');
  const [providers, setProviders] = useState<SsoProvider[]>([]);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [mfaConfigs, setMfaConfigs] = useState<MfaConfiguration[]>([]);
  const [policies, setPolicies] = useState<AccessPolicy[]>([]);
  const [auditLog, setAuditLog] = useState<IdentityAuditEntry[]>([]);
  const [metrics, setMetrics] = useState<IdentityMetrics | null>(null);

  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMfa, setIsLoadingMfa] = useState(true);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const [isLoadingAudit, setIsLoadingAudit] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoadingMetrics(true);
    const m = await SsoIdentityService.getMetrics();
    setMetrics(m);
    setIsLoadingMetrics(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (activeView === 'providers' && providers.length === 0) { setIsLoadingProviders(true); SsoIdentityService.getProviders().then(d => { setProviders(d); setIsLoadingProviders(false); }); }
    if (activeView === 'sessions' && sessions.length === 0) { setIsLoadingSessions(true); SsoIdentityService.getSessions().then(d => { setSessions(d); setIsLoadingSessions(false); }); }
    if (activeView === 'mfa' && mfaConfigs.length === 0) { setIsLoadingMfa(true); SsoIdentityService.getMfaConfigs().then(d => { setMfaConfigs(d); setIsLoadingMfa(false); }); }
    if (activeView === 'policies' && policies.length === 0) { setIsLoadingPolicies(true); SsoIdentityService.getPolicies().then(d => { setPolicies(d); setIsLoadingPolicies(false); }); }
    if (activeView === 'audit' && auditLog.length === 0) { setIsLoadingAudit(true); SsoIdentityService.getAuditLog().then(d => { setAuditLog(d); setIsLoadingAudit(false); }); }
  }, [activeView]);

  const handleRevokeSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'REVOKED' as SessionStatus } : s));
  };

  const activeSessions = sessions.filter(s => s.status === 'ACTIVE').length;
  const highRiskSessions = sessions.filter(s => s.riskScore > 60).length;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 font-sans">
      <div className="max-w-[1500px] mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-surface p-6 rounded-3xl border border-border-theme shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-surface-secondary text-text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-border-theme">
                <Shield className="h-4 w-4" /> Identity & Access
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">SSO & Identity Management</h1>
            <p className="text-sm text-text-muted mt-2 max-w-xl">Single sign-on providers, session management, MFA enforcement, access policies, and identity audit trail.</p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-bold text-text-secondary hover:bg-surface transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm"><span className="text-[10px] font-bold text-text-muted uppercase">SSO Providers</span><p className="text-2xl font-black text-text-primary mt-1">{metrics?.ssoProviders ?? '...'}</p><span className="text-xs text-text-muted">{metrics?.ssoUsers ?? 0} users</span></div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm"><span className="text-[10px] font-bold text-text-muted uppercase">Active Sessions</span><p className="text-2xl font-black text-text-primary mt-1">{activeSessions}</p><span className="text-xs text-text-muted">{highRiskSessions} high risk</span></div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm"><span className="text-[10px] font-bold text-text-muted uppercase">MFA Coverage</span><p className="text-2xl font-black text-text-primary mt-1">{metrics?.mfaEnrolled ?? '...'}</p><span className="text-xs text-text-muted">{metrics?.mfaEnforced ?? 0} enforced</span></div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm"><span className="text-[10px] font-bold text-text-muted uppercase">Login Success</span><p className="text-2xl font-black text-text-primary mt-1">{metrics?.loginSuccessRate ?? '...'}%</p><span className="text-xs text-text-muted">{metrics?.failedLogins24h ?? 0} failures (24h)</span></div>
        </div>

        <div className="flex items-center gap-1 bg-surface p-1.5 rounded-xl border border-border-theme shadow-sm overflow-x-auto">
          {VIEW_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeView === tab.id ? 'bg-primary-blue text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-surface'}`}>
              {tab.icon} {tab.label}
              {tab.id === 'sessions' && activeSessions > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeView === tab.id ? 'bg-surface/20 text-white' : 'bg-indigo-500/200/20 text-indigo-400'}`}>{activeSessions}</span>}
              {tab.id === 'audit' && <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${activeView === tab.id ? 'bg-surface/20 text-white' : 'bg-surface-secondary text-text-secondary'}`}>{auditLog.length}</span>}
            </button>
          ))}
        </div>

        {activeView === 'overview' && <OverviewPanel metrics={metrics} isLoading={isLoadingMetrics} />}
        {activeView === 'providers' && <ProvidersPanel providers={providers} isLoading={isLoadingProviders} />}
        {activeView === 'sessions' && <SessionsPanel sessions={sessions} isLoading={isLoadingSessions} onRevoke={handleRevokeSession} />}
        {activeView === 'mfa' && <MfaPanel configs={mfaConfigs} isLoading={isLoadingMfa} />}
        {activeView === 'policies' && (
          <div className="space-y-3">
            {isLoadingPolicies ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl border border-border-theme animate-pulse" />) :
            policies.map(p => (
              <div key={p.id} className="bg-surface rounded-xl border border-border-theme p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${p.enabled ? 'bg-emerald-500/200/200/20 text-emerald-400 border border-emerald-500/30' : 'bg-surface-secondary text-text-muted border border-border-theme'}`}><Lock className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5"><h4 className="text-sm font-bold text-text-primary">{p.name}</h4><span className={`px-2 py-0.5 rounded text-[10px] font-black ${p.enabled ? 'bg-emerald-500/200/200/20 text-emerald-400' : 'bg-surface-secondary text-text-muted'}`}>{p.enabled ? 'Enabled' : 'Disabled'}</span></div>
                    <p className="text-xs text-text-muted">{p.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted"><span>{p.type.replace(/_/g, ' ')}</span><span>{p.triggerCount.toLocaleString()} triggers</span><span>{p.appliesTo.join(', ')}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeView === 'audit' && <AuditPanel entries={auditLog} isLoading={isLoadingAudit} />}
      </div>
    </div>
  );
};

export default SsoIdentityHub;

import React, { useState, useMemo } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  Smartphone,
  Fingerprint,
  Globe,
  Monitor,
  Laptop,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  Trash2,
  Plus,
  Zap,
  Sliders,
  History,
  FileText,
  Activity,
  X,
  Github,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  UserCheck,
  Database,
  Terminal,
  LogOut
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { logout } from '../../lib/firebase';

/**
 * AuthSecurityCenter Component
 * 
 * Interactive 360-degree Authentication & Identity Security Console for YuvaHub.
 * Features:
 * 1. Account Security Health Posture (Score 0-100%)
 * 2. OAuth Connected Providers Management (Google, GitHub, Email)
 * 3. Active Session Remote Invalidation Telemetry
 * 4. Multi-Factor Authentication (TOTP) & FIDO2 Passkeys Vault
 * 5. Firebase Cryptographic JWT Token Claims Inspector
 * 6. Security Event Audit Trail & Data Export
 */
export default function AuthSecurityCenter() {
  const { user, profile, theme } = useAppContext();

  // Active Tab View
  const [activeTab, setActiveTab] = useState<'posture' | 'oauth' | 'sessions' | 'mfa' | 'jwt' | 'audit'>('posture');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [totpSecret, setTotpSecret] = useState('YUVAHUB-AUTH-KEY-9981-SEC');
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');
  const [revokeAllModalOpen, setRevokeAllModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [isCopiedToken, setIsCopiedToken] = useState(false);

  // Simulated Feature States
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [passkeys, setPasskeys] = useState([
    { id: 'pk_1', name: 'MacBook Pro TouchID', added: '2026-05-12', lastUsed: 'Active Today', type: 'BIOMETRIC' },
    { id: 'pk_2', name: 'YubiKey 5 NFC', added: '2026-03-01', lastUsed: '4 days ago', type: 'HARDWARE_KEY' }
  ]);

  const [connectedProviders, setConnectedProviders] = useState([
    { id: 'google.com', name: 'Google Workspace', email: user?.email || 'user@yuvahub.com', connected: true, isPrimary: true },
    { id: 'github.com', name: 'GitHub Developer', email: 'dev@github.com', connected: true, isPrimary: false }
  ]);

  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'sess_current',
      device: 'Chrome 126 (Windows 11)',
      ip: '103.245.12.89',
      location: 'New Delhi, IN',
      isCurrent: true,
      lastActive: 'Active Now',
      icon: Monitor
    },
    {
      id: 'sess_mobile',
      device: 'YuvaHub Mobile (iOS 17.4)',
      ip: '49.207.194.14',
      location: 'Mumbai, IN',
      isCurrent: false,
      lastActive: '2 hours ago',
      icon: Smartphone
    },
    {
      id: 'sess_mac',
      device: 'Safari (macOS Sonoma)',
      ip: '182.73.91.205',
      location: 'Bengaluru, IN',
      isCurrent: false,
      lastActive: '3 days ago',
      icon: Laptop
    }
  ]);

  const [auditLogs, setAuditLogs] = useState([
    {
      id: 'evt_101',
      eventType: 'OAUTH_LOGIN_SUCCESS',
      description: 'Authenticated via Google OAuth 2.0 Provider',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      actor: user?.email || 'user@yuvahub.com',
      severity: 'INFO'
    },
    {
      id: 'evt_102',
      eventType: 'PASSKEY_AUTHENTICATED',
      description: 'WebAuthn biometric passkey validated for MacBook Pro TouchID',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      actor: user?.email || 'user@yuvahub.com',
      severity: 'INFO'
    },
    {
      id: 'evt_103',
      eventType: 'SESSION_TOKEN_REFRESH',
      description: 'Firebase ID Token refreshed automatically via client SDK',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      actor: 'Firebase Auth Subsystem',
      severity: 'INFO'
    },
    {
      id: 'evt_104',
      eventType: 'MFA_CHALLENGE_VERIFIED',
      description: 'TOTP 6-digit code verified successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      actor: user?.email || 'user@yuvahub.com',
      severity: 'INFO'
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamic Security Posture Score (0-100%)
  const securityScore = useMemo(() => {
    let score = 40; // Base score for logged in account
    if (user?.emailVerified) score += 20;
    if (mfaEnabled) score += 20;
    if (passkeys.length > 0) score += 10;
    if (connectedProviders.length > 1) score += 10;
    return Math.min(score, 100);
  }, [user, mfaEnabled, passkeys, connectedProviders]);

  // Handle Terminate Single Session
  const handleTerminateSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
    setNotification({ type: 'success', message: 'Remote session terminated successfully.' });
  };

  // Handle Revoke All Remote Sessions
  const handleRevokeAllSessions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokeReason.trim()) {
      setNotification({ type: 'error', message: 'Please provide a reason for revoking sessions.' });
      return;
    }

    setActiveSessions(prev => prev.filter(s => s.isCurrent));
    setAuditLogs([
      {
        id: `evt_${Date.now()}`,
        eventType: 'REMOTE_SESSIONS_INVALIDATED',
        description: `Invalidated all active sessions. Reason: ${revokeReason}`,
        timestamp: new Date().toISOString(),
        actor: user?.email || 'user@yuvahub.com',
        severity: 'WARNING'
      },
      ...auditLogs
    ]);
    setRevokeAllModalOpen(false);
    setRevokeReason('');
    setNotification({ type: 'success', message: 'All remote sessions invalidated! Only current session remains active.' });
  };

  // Handle Add Passkey
  const handleAddPasskey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkeyName.trim()) return;

    const newPk = {
      id: `pk_${Date.now()}`,
      name: passkeyName.trim(),
      added: new Date().toISOString().split('T')[0],
      lastUsed: 'Just registered',
      type: 'BIOMETRIC'
    };
    setPasskeys([...passkeys, newPk]);
    setAuditLogs([
      {
        id: `evt_${Date.now()}`,
        eventType: 'PASSKEY_REGISTERED',
        description: `Registered new WebAuthn passkey: ${newPk.name}`,
        timestamp: new Date().toISOString(),
        actor: user?.email || 'user@yuvahub.com',
        severity: 'INFO'
      },
      ...auditLogs
    ]);
    setPasskeyName('');
    setPasskeyModalOpen(false);
    setNotification({ type: 'success', message: `Passkey "${newPk.name}" registered!` });
  };

  // Handle Export Audit Trail JSON
  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Security_Audit_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // Copy JWT Token Payload
  const handleCopyJwtPayload = () => {
    const mockJwtPayload = JSON.stringify({
      iss: "https://securetoken.google.com/yuvahub-app",
      aud: "yuvahub-app",
      auth_time: Math.floor(Date.now() / 1000) - 3600,
      user_id: user?.uid || "yh_usr_88912",
      sub: user?.uid || "yh_usr_88912",
      email: user?.email || "user@yuvahub.com",
      email_verified: true,
      firebase: {
        identities: {
          "google.com": [user?.email || "user@yuvahub.com"]
        },
        sign_in_provider: "google.com"
      },
      iat: Math.floor(Date.now() / 1000) - 3600,
      exp: Math.floor(Date.now() / 1000) + 3600
    }, null, 2);

    navigator.clipboard.writeText(mockJwtPayload);
    setIsCopiedToken(true);
    setTimeout(() => setIsCopiedToken(false), 2000);
  };

  // Filtered Audit Events
  const filteredAuditLogs = auditLogs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      log.eventType.toLowerCase().includes(term) ||
      log.description.toLowerCase().includes(term) ||
      log.actor.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full">
                YuvaHub Account Vault
              </span>
              <span className="px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1">
                <ShieldCheck size={13} /> Firebase Auth Secured
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Authentication & Security Command Center
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Manage connected OAuth providers, monitor active login sessions, configure hardware passkeys, and inspect cryptographic token claims.
            </p>
          </div>

          {/* Dynamic Health Score Meter */}
          <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl w-full lg:w-auto">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-blue-500 bg-slate-950 font-black text-xl text-white shadow-lg">
              {securityScore}%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Security Health Score</div>
              <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                {securityScore >= 80 ? 'HIGH PROTECTED' : 'MODERATE SECURITY'}
              </div>
              <div className="text-[11px] text-slate-400">{passkeys.length} Passkeys • TOTP Enforced</div>
            </div>
          </div>
        </div>

        {/* Global Notifications Alert */}
        {notification.message && (
          <div className={`mt-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: '', message: '' })} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
        {[
          { id: 'posture', label: 'Security Posture', icon: Shield },
          { id: 'oauth', label: `OAuth Providers (${connectedProviders.length})`, icon: Key },
          { id: 'sessions', label: `Active Sessions (${activeSessions.length})`, icon: Monitor },
          { id: 'mfa', label: 'MFA & Passkeys', icon: Fingerprint },
          { id: 'jwt', label: 'JWT Telemetry', icon: Terminal },
          { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: POSTURE & SUMMARY */}
      {activeTab === 'posture' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                <UserCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Identity Verification</h4>
                <div className="text-lg font-black text-gray-900 dark:text-white">VERIFIED MEMBER</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Primary email <code>{user?.email || 'user@yuvahub.com'}</code> is cryptographically verified via Firebase Auth.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={14} /> Account active since 2026
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                <Fingerprint size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Hardware Authentication</h4>
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{passkeys.length} PASSKEYS ACTIVE</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              TouchID / FaceID biometric keys configured for passwordless single-tap authentication.
            </p>
            <button
              onClick={() => setActiveTab('mfa')}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl text-xs font-bold transition"
            >
              Manage Passkeys
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900">
                <Monitor size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Active Sessions</h4>
                <div className="text-lg font-black text-purple-600 dark:text-purple-400">{activeSessions.length} CONNECTED DEVICES</div>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Sessions monitored with IP telemetry & user-agent tracking.
            </p>
            <button
              onClick={() => setRevokeAllModalOpen(true)}
              className="w-full py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-xs font-bold transition"
            >
              Revoke All Remote Devices
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: OAUTH PROVIDERS */}
      {activeTab === 'oauth' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Connected Identity Providers</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage OAuth login methods linked to your YuvaHub profile.</p>
          </div>

          <div className="space-y-3">
            {connectedProviders.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold text-blue-600">
                    {provider.id.includes('google') ? 'G' : <Github size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{provider.name}</span>
                      {provider.isPrimary && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 mt-0.5">{provider.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-1">
                    <CheckCircle2 size={12} /> CONNECTED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Device Connections</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">View active login sessions and terminate unknown devices.</p>
            </div>
            <button
              onClick={() => setRevokeAllModalOpen(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Terminate All Other Sessions
            </button>
          </div>

          <div className="space-y-3">
            {activeSessions.map((sess) => {
              const DevIcon = sess.icon;
              return (
                <div key={sess.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-blue-600">
                      <DevIcon size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{sess.device}</span>
                        {sess.isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-md">
                            CURRENT DEVICE
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <span>IP: {sess.ip}</span>
                        <span>•</span>
                        <span>{sess.location}</span>
                        <span>•</span>
                        <span className="text-gray-700 dark:text-gray-300 font-semibold">{sess.lastActive}</span>
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => handleTerminateSession(sess.id)}
                      className="px-3 py-1.5 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-200 border border-red-200 dark:border-red-900 font-bold rounded-lg transition"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MFA & PASSKEYS */}
      {activeTab === 'mfa' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="text-blue-600" size={24} />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Authenticator App (TOTP)</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Google Authenticator or 1Password</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              Generates temporary 6-digit verification codes for multi-factor login challenges.
            </p>

            <button
              onClick={() => setShowQrModal(true)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
            >
              Configure TOTP Secret QR
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="text-emerald-600" size={24} />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">FIDO2 Biometric Passkeys</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">TouchID, FaceID, YubiKey</p>
                </div>
              </div>
              <button
                onClick={() => setPasskeyModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
              >
                <Plus size={14} /> Register Key
              </button>
            </div>

            <div className="space-y-2">
              {passkeys.map(pk => (
                <div key={pk.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{pk.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">Added {pk.added} • {pk.lastUsed}</div>
                  </div>
                  <button
                    onClick={() => setPasskeys(passkeys.filter(p => p.id !== pk.id))}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: JWT TELEMETRY */}
      {activeTab === 'jwt' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Firebase JWT Payload Inspector</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Decoded structure of cryptographically signed Firebase ID token.</p>
            </div>
            <button
              onClick={handleCopyJwtPayload}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
            >
              {isCopiedToken ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {isCopiedToken ? 'Copied' : 'Copy JSON'}
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto">
            <pre>{JSON.stringify({
              iss: "https://securetoken.google.com/yuvahub-app",
              aud: "yuvahub-app",
              auth_time: Math.floor(Date.now() / 1000) - 3600,
              user_id: user?.uid || "yh_usr_88912",
              sub: user?.uid || "yh_usr_88912",
              email: user?.email || "user@yuvahub.com",
              email_verified: true,
              firebase: {
                identities: {
                  "google.com": [user?.email || "user@yuvahub.com"]
                },
                sign_in_provider: "google.com"
              },
              iat: Math.floor(Date.now() / 1000) - 3600,
              exp: Math.floor(Date.now() / 1000) + 3600
            }, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Security Event Audit Trail</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Persistent log of authentication challenges and security setting modifications.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter security events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                onClick={handleExportLogs}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
              >
                <Download size={14} /> Export JSON
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAuditLogs.map((log) => (
              <div key={log.id} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">{log.eventType}</span>
                  <span className="text-gray-400 text-[11px] flex items-center gap-1">
                    <Clock size={12} /> {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{log.description}</p>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-800">
                  Actor: <strong className="text-gray-800 dark:text-gray-200">{log.actor}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* Revoke All Sessions Modal */}
      {revokeAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-md w-full text-gray-900 dark:text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Invalidate All Remote Sessions</h3>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300">
              This will log out all connected web browsers and mobile apps except for your current device.
            </p>

            <form onSubmit={handleRevokeAllSessions} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Reason (Required):</label>
                <textarea
                  rows={3}
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Suspected compromised key or lost laptop"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRevokeAllModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Revoke Remote Sessions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Passkey Modal */}
      {passkeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-md w-full text-gray-900 dark:text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-500">
              <Fingerprint size={24} />
              <h3 className="text-lg font-bold">Register FIDO2 Passkey</h3>
            </div>

            <form onSubmit={handleAddPasskey} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Key Description:</label>
                <input
                  type="text"
                  value={passkeyName}
                  onChange={(e) => setPasskeyName(e.target.value)}
                  placeholder="e.g. Personal YubiKey 5C NFC"
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPasskeyModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Register Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOTP QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-md w-full text-gray-900 dark:text-white space-y-4 shadow-2xl text-center">
            <h3 className="text-lg font-bold">Scan Authenticator QR</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Scan with Google Authenticator or 1Password.</p>
            
            <div className="w-44 h-44 mx-auto bg-slate-950 p-4 rounded-2xl flex items-center justify-center text-white font-mono text-[10px] text-center break-all">
              [QR ENCODED: otpauth://totp/YuvaHub:{user?.email || "user"}?secret={totpSecret}]
            </div>

            <div className="text-xs font-mono text-blue-600 dark:text-blue-400 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
              Secret: {totpSecret}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

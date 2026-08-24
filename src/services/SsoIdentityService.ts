// ─── Enterprise SSO & Identity Management Service ─────────────────────────────

import {
  SsoProvider, SsoProviderType, SsoProviderStatus, UserSession, SessionStatus,
  AuthMethod, MfaConfiguration, MfaMethod, MfaStatus, AccessPolicy,
  AccessPolicyType, IdentityAuditEntry, IdentityMetrics, RiskLevel, SessionDevice,
} from '../types/ssoIdentity';

const USERS = [
  { id: 'usr_001', name: 'Priya Sharma', email: 'priya@yuvaHub.io', role: 'Super Admin' },
  { id: 'usr_002', name: 'Rohan Gupta', email: 'rohan@yuvaHub.io', role: 'Platform Engineer' },
  { id: 'usr_003', name: 'Aisha Patel', email: 'aisha@yuvaHub.io', role: 'Security Analyst' },
  { id: 'usr_004', name: 'Vikram Singh', email: 'vikram@yuvaHub.io', role: 'Billing Manager' },
  { id: 'usr_005', name: 'Meera Iyer', email: 'meera@yuvaHub.io', role: 'DevOps Lead' },
  { id: 'usr_006', name: 'Arjun Reddy', email: 'arjun@yuvaHub.io', role: 'Support Engineer' },
  { id: 'usr_007', name: 'Neha Kapoor', email: 'neha@yuvaHub.io', role: 'Product Manager' },
  { id: 'usr_008', name: 'Ravi Kumar', email: 'ravi@enterprise.co', role: 'External Admin' },
  { id: 'usr_009', name: 'Sneha Joshi', email: 'sneha@enterprise.co', role: 'External Viewer' },
  { id: 'usr_010', name: 'Amit Verma', email: 'amit@partner.io', role: 'Partner Admin' },
];

const IP_POOL = ['103.21.58.14', '192.168.1.42', '45.33.112.6', '104.236.228.48', '203.0.113.50', '198.51.100.23'];
const DEVICES: SessionDevice[] = [
  { type: 'DESKTOP', os: 'macOS 14.0', browser: 'Chrome 120', isTrusted: true, deviceFingerprint: 'fp_mac_chrome_001' },
  { type: 'DESKTOP', os: 'Windows 11', browser: 'Edge 120', isTrusted: true, deviceFingerprint: 'fp_win_edge_002' },
  { type: 'MOBILE', os: 'iOS 17.2', browser: 'Safari 17', isTrusted: false, deviceFingerprint: 'fp_ios_safari_003' },
  { type: 'TABLET', os: 'iPadOS 17.2', browser: 'Safari 17', isTrusted: false, deviceFingerprint: 'fp_ipad_safari_004' },
  { type: 'DESKTOP', os: 'Ubuntu 22.04', browser: 'Firefox 121', isTrusted: false, deviceFingerprint: 'fp_linux_ff_005' },
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function generateId(p: string): string { return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }

// ─── Mock Data ────────────────────────────────────────────────────────────────

function mockProviders(): SsoProvider[] {
  const configs: Array<{ name: string; type: SsoProviderType; status: SsoProviderStatus }> = [
    { name: 'Google Workspace', type: 'GOOGLE_WORKSPACE', status: 'ACTIVE' },
    { name: 'Azure Active Directory', type: 'AZURE_AD', status: 'ACTIVE' },
    { name: 'Okta SSO', type: 'OKTA', status: 'ACTIVE' },
    { name: 'Corporate LDAP', type: 'LDAP', status: 'ACTIVE' },
    { name: 'Partner SAML', type: 'SAML_2_0', status: 'CONFIGURING' },
    { name: 'Custom OIDC', type: 'OIDC', status: 'INACTIVE' },
  ];
  return configs.map((cfg, i) => ({
    id: generateId('sso'), name: cfg.name, type: cfg.type, status: cfg.status,
    description: `${cfg.name} identity provider for ${cfg.type.replace(/_/g, ' ')} authentication`,
    issuerUrl: `https://accounts.google.com/.well-known/openid-configuration`,
    clientId: `client_${Math.random().toString(36).slice(2, 12)}`,
    authorizationEndpoint: `https://accounts.google.com/o/oauth2/auth`,
    tokenEndpoint: `https://oauth2.googleapis.com/token`,
    ACSUrl: `https://app.yuvaHub.io/auth/sso/${cfg.type.toLowerCase()}/callback`,
    entityId: `https://app.yuvaHub.io/auth/sso/${cfg.type.toLowerCase()}`,
    attributes: [
      { ssoAttribute: 'email', localAttribute: 'email', required: true },
      { ssoAttribute: 'name', localAttribute: 'displayName', required: true },
      { ssoAttribute: 'groups', localAttribute: 'role', required: false },
    ],
    groupMapping: [
      { ssoGroup: 'Admins', localRole: 'Super Admin', autoAssign: true },
      { ssoGroup: 'Engineers', localRole: 'Developer', autoAssign: true },
    ],
    jitProvisioning: i < 3, jitRoleMapping: 'Developer', enforceSso: i < 2,
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 180).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
    lastLoginAt: cfg.status === 'ACTIVE' ? new Date(Date.now() - Math.random() * 86400000 * 7).toISOString() : undefined,
    lastTestAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    totalLogins: cfg.status === 'ACTIVE' ? randInt(500, 12000) : 0,
    failedLogins: cfg.status === 'ACTIVE' ? randInt(10, 200) : 0,
    averageLoginTimeMs: randInt(800, 3000),
    tags: [cfg.type.toLowerCase(), cfg.status.toLowerCase()],
  }));
}

function mockSessions(): UserSession[] {
  const statuses: SessionStatus[] = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'EXPIRED', 'REVOKED', 'IDLE_TIMEOUT'];
  const authMethods: AuthMethod[] = ['SSO', 'SSO', 'MFA', 'PASSWORD', 'API_KEY'];
  return Array.from({ length: 35 }, (_, i) => {
    const user = pick(USERS);
    const status = i < 20 ? 'ACTIVE' : pick(statuses);
    const createdMs = Date.now() - Math.random() * 86400000 * 7;
    const device = pick(DEVICES);
    const riskScore = status === 'ACTIVE' ? (Math.random() > 0.8 ? randInt(60, 95) : randInt(0, 35)) : 0;
    return {
      id: generateId('sess'), userId: user.id, userName: user.name, userEmail: user.email, userRole: user.role,
      status, authMethod: pick(authMethods),
      ssoProvider: Math.random() > 0.3 ? pick(['Google Workspace', 'Azure Active Directory', 'Okta SSO']) : undefined,
      ipAddress: pick(IP_POOL), userAgent: `Mozilla/5.0 (${device.os}) ${device.browser}`,
      device,
      geoLocation: { country: pick(['India', 'United States', 'United Kingdom', 'Germany', 'Singapore']), city: pick(['Mumbai', 'New York', 'London', 'Frankfurt', 'Singapore']), region: pick(['AP-SOUTH', 'US-EAST', 'EU-WEST', 'EU-CENTRAL', 'AP-EAST']), latitude: 0, longitude: 0 },
      createdAt: new Date(createdMs).toISOString(),
      lastActivityAt: new Date(createdMs + Math.random() * 86400000 * 2).toISOString(),
      expiresAt: new Date(createdMs + 24 * 3600000).toISOString(),
      idleExpiresAt: new Date(createdMs + 3600000).toISOString(),
      mfaVerified: Math.random() > 0.3,
      riskScore,
      riskFactors: riskScore > 50 ? [
        { type: pick(['NEW_DEVICE', 'NEW_LOCATION', 'UNUSUAL_TIME', 'VELOCITY'] as const), severity: riskScore > 80 ? 'CRITICAL' : 'HIGH', description: 'Unusual login pattern detected', detectedAt: new Date(createdMs).toISOString() },
      ] : [],
    };
  });
}

function mockMfaConfigs(): MfaConfiguration[] {
  const methods: MfaMethod[] = ['TOTP', 'SMS', 'EMAIL', 'HARDWARE_KEY'];
  return USERS.slice(0, 8).map(user => ({
    id: generateId('mfa'), userId: user.id, userName: user.name, userEmail: user.email,
    status: Math.random() > 0.3 ? 'ENABLED' : Math.random() > 0.5 ? 'ENFORCED' : 'SETUP_INCOMPLETE',
    primaryMethod: pick(methods), backupMethods: ['BACKUP_CODES'],
    totpEnabled: Math.random() > 0.5, totpVerifiedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 86400000 * 30).toISOString() : undefined,
    smsEnabled: Math.random() > 0.6, smsPhoneNumber: Math.random() > 0.6 ? '+91-98765-43210' : undefined,
    hardwareKeyCount: Math.random() > 0.8 ? randInt(1, 3) : 0,
    backupCodesGenerated: true, backupCodesRemaining: randInt(5, 10),
    lastVerifiedAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    enforcementDate: Math.random() > 0.5 ? new Date(Date.now() + 30 * 86400000).toISOString() : undefined,
    createdAt: new Date(Date.now() - Math.random() * 86400000 * 90).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
  }));
}

function mockPolicies(): AccessPolicy[] {
  const configs: Array<{ name: string; type: AccessPolicyType; desc: string }> = [
    { name: 'Corporate IP Allowlist', type: 'IP_ALLOWLIST', desc: 'Allow access only from corporate IP ranges' },
    { name: 'VPN Enforcement', type: 'IP_ALLOWLIST', desc: 'Require VPN connection for remote access' },
    { name: 'Geo-Restriction: High Risk Countries', type: 'GEO_RESTRICTION', desc: 'Block access from high-risk geolocations' },
    { name: 'Business Hours Only', type: 'TIME_BASED', desc: 'Restrict admin access to business hours (IST)' },
    { name: 'Trusted Device Requirement', type: 'DEVICE_TRUST', desc: 'Require trusted device for sensitive operations' },
    { name: 'Risk-Based MFA Challenge', type: 'RISK_BASED', desc: 'Require MFA when risk score exceeds threshold' },
    { name: 'RBAC: Admin Actions', type: 'ROLE_BASED', desc: 'Additional verification for admin-level actions' },
  ];
  return configs.map((cfg, i) => ({
    id: generateId('pol'), name: cfg.name, description: cfg.desc, type: cfg.type,
    enabled: i < 5, priority: i + 1,
    rules: [{ id: generateId('rule'), name: `Default ${cfg.type.replace(/_/g, ' ')} rule`, condition: 'always', action: i < 3 ? 'ALLOW' : 'CHALLENGE', parameters: {} }],
    appliesTo: i < 2 ? ['all'] : ['admin', 'super_admin'],
    enforceOnSso: i < 3, createdAt: new Date(Date.now() - Math.random() * 86400000 * 120).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
    lastTriggeredAt: i < 5 ? new Date(Date.now() - Math.random() * 86400000 * 7).toISOString() : undefined,
    triggerCount: randInt(50, 5000), tags: [cfg.type.toLowerCase()],
  }));
}

function mockAuditLog(): IdentityAuditEntry[] {
  const eventTypes = ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'MFA_VERIFY', 'SESSION_CREATE', 'SESSION_REVOKE', 'SSO_CALLBACK', 'PASSWORD_CHANGE', 'ACCOUNT_LOCK', 'ROLE_CHANGE', 'POLICY_VIOLATION', 'RISK_DETECTED'];
  return Array.from({ length: 40 }, (_, i) => {
    const user = pick(USERS);
    const event = pick(eventTypes);
    const isHighRisk = event === 'LOGIN_FAILED' || event === 'ACCOUNT_LOCK' || event === 'POLICY_VIOLATION' || event === 'RISK_DETECTED';
    return {
      id: generateId('audit'), timestamp: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
      eventType: event as IdentityAuditEntry['eventType'],
      severity: (isHighRisk ? (Math.random() > 0.5 ? 'HIGH' : 'CRITICAL') : pick(['LOW', 'MEDIUM'])) as RiskLevel,
      userId: user.id, userName: user.name, userEmail: user.email,
      description: `${event.replace(/_/g, ' ').toLowerCase()} for ${user.name}`,
      ipAddress: pick(IP_POOL), geoLocation: pick(['Mumbai, IN', 'New York, US', 'London, UK', 'Frankfurt, DE']),
      device: pick(DEVICES.map(d => `${d.os} / ${d.browser}`)),
      authMethod: pick(['SSO', 'MFA', 'PASSWORD', 'API_KEY'] as AuthMethod[]),
      ssoProvider: Math.random() > 0.5 ? pick(['Google Workspace', 'Azure AD', 'Okta']) : undefined,
      metadata: { sessionId: `sess_${randInt(1000, 9999)}`, traceId: `tr_${Math.random().toString(36).slice(2, 10)}` },
      riskScore: isHighRisk ? randInt(60, 95) : randInt(0, 30),
    };
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function mockMetrics(): IdentityMetrics {
  return {
    totalUsers: 156, activeUsers: 142, activeSessions: 47, ssoUsers: 128, mfaEnrolled: 134, mfaEnforced: 89,
    failedLogins24h: 23, lockedAccounts: 3, highRiskSessions: 5, ssoProviders: 4, activePolicies: 5,
    avgLoginTimeMs: 1240, loginSuccessRate: 94.2,
    providerBreakdown: [
      { provider: 'GOOGLE_WORKSPACE', count: 68, percentage: 47.9 },
      { provider: 'AZURE_AD', count: 35, percentage: 24.6 },
      { provider: 'OKTA', count: 25, percentage: 17.6 },
      { provider: 'LDAP', count: 14, percentage: 9.9 },
    ],
    authMethodBreakdown: [
      { method: 'SSO', count: 128, percentage: 55.4 },
      { method: 'MFA', count: 56, percentage: 24.2 },
      { method: 'PASSWORD', count: 34, percentage: 14.7 },
      { method: 'API_KEY', count: 13, percentage: 5.6 },
    ],
    sessionTrend: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
      active: randInt(30, 60), created: randInt(10, 30), revoked: randInt(2, 10),
    })),
    riskDistribution: [
      { level: 'LOW', count: 32, percentage: 68.1 },
      { level: 'MEDIUM', count: 8, percentage: 17.0 },
      { level: 'HIGH', count: 5, percentage: 10.6 },
      { level: 'CRITICAL', count: 2, percentage: 4.3 },
    ],
    topRiskyUsers: [
      { user: 'Ravi Kumar', email: 'ravi@enterprise.co', riskScore: 82, sessions: 3, location: 'Frankfurt, DE' },
      { user: 'Amit Verma', email: 'amit@partner.io', riskScore: 71, sessions: 2, location: 'Singapore' },
      { user: 'Sneha Joshi', email: 'sneha@enterprise.co', riskScore: 65, sessions: 1, location: 'New York, US' },
    ],
    geoDistribution: [
      { country: 'India', sessions: 28, percentage: 59.6 },
      { country: 'United States', sessions: 10, percentage: 21.3 },
      { country: 'United Kingdom', sessions: 5, percentage: 10.6 },
      { country: 'Germany', sessions: 3, percentage: 6.4 },
      { country: 'Singapore', sessions: 1, percentage: 2.1 },
    ],
    loginTrend: Array.from({ length: 24 }, (_, hour) => ({
      hour, success: randInt(5, 30), failed: randInt(0, 3),
    })),
  };
}

// ─── Service Class ────────────────────────────────────────────────────────────

export class SsoIdentityService {
  private static cachedProviders: SsoProvider[] | null = null;
  private static cachedSessions: UserSession[] | null = null;
  private static cachedMfa: MfaConfiguration[] | null = null;
  private static cachedPolicies: AccessPolicy[] | null = null;
  private static cachedAudit: IdentityAuditEntry[] | null = null;
  private static cachedMetrics: IdentityMetrics | null = null;

  static async getProviders(): Promise<SsoProvider[]> {
    await new Promise(r => setTimeout(r, 500));
    if (!this.cachedProviders) this.cachedProviders = mockProviders();
    return this.cachedProviders;
  }
  static async getSessions(): Promise<UserSession[]> {
    await new Promise(r => setTimeout(r, 550));
    if (!this.cachedSessions) this.cachedSessions = mockSessions();
    return this.cachedSessions;
  }
  static async getMfaConfigs(): Promise<MfaConfiguration[]> {
    await new Promise(r => setTimeout(r, 400));
    if (!this.cachedMfa) this.cachedMfa = mockMfaConfigs();
    return this.cachedMfa;
  }
  static async getPolicies(): Promise<AccessPolicy[]> {
    await new Promise(r => setTimeout(r, 350));
    if (!this.cachedPolicies) this.cachedPolicies = mockPolicies();
    return this.cachedPolicies;
  }
  static async getAuditLog(): Promise<IdentityAuditEntry[]> {
    await new Promise(r => setTimeout(r, 450));
    if (!this.cachedAudit) this.cachedAudit = mockAuditLog();
    return this.cachedAudit;
  }
  static async getMetrics(): Promise<IdentityMetrics> {
    await new Promise(r => setTimeout(r, 400));
    if (!this.cachedMetrics) this.cachedMetrics = mockMetrics();
    return this.cachedMetrics;
  }
}

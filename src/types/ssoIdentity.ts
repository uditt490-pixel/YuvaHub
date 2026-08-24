// ─── Enterprise SSO & Identity Management Types ───────────────────────────────

export type SsoProviderType = 'SAML_2_0' | 'OIDC' | 'OAUTH_2' | 'LDAP' | 'AZURE_AD' | 'GOOGLE_WORKSPACE' | 'OKTA' | 'CUSTOM';

export type SsoProviderStatus = 'ACTIVE' | 'INACTIVE' | 'CONFIGURING' | 'ERROR' | 'MAINTENANCE';

export type SessionStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED' | 'IDLE_TIMEOUT' | 'CONCURRENT_LIMIT';

export type MfaMethod = 'TOTP' | 'SMS' | 'EMAIL' | 'HARDWARE_KEY' | 'PUSH_NOTIFICATION' | 'BACKUP_CODES';

export type MfaStatus = 'ENABLED' | 'DISABLED' | 'ENFORCED' | 'SETUP_INCOMPLETE';

export type AuthMethod = 'PASSWORD' | 'SSO' | 'MFA' | 'API_KEY' | 'CERTIFICATE' | 'PASSKEY';

export type AccessPolicyType = 'IP_ALLOWLIST' | 'IP_DENYLIST' | 'GEO_RESTRICTION' | 'TIME_BASED' | 'DEVICE_TRUST' | 'RISK_BASED' | 'ROLE_BASED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type UserAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING_VERIFICATION' | 'DEACTIVATED';

// ─── SSO Provider ─────────────────────────────────────────────────────────────

export interface SsoProvider {
  id: string;
  name: string;
  type: SsoProviderType;
  status: SsoProviderStatus;
  description: string;
  issuerUrl?: string;
  clientId?: string;
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
  userInfoEndpoint?: string;
  metadataUrl?: string;
  certificate?: string;
  ACSUrl: string;
  SLOUrl?: string;
  entityId: string;
  attributes: SsoAttributeMapping[];
  groupMapping: SsoGroupMapping[];
  jitProvisioning: boolean;
  jitRoleMapping: string;
  enforceSso: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  lastTestAt?: string;
  totalLogins: number;
  failedLogins: number;
  averageLoginTimeMs: number;
  tags: string[];
}

export interface SsoAttributeMapping {
  ssoAttribute: string;
  localAttribute: string;
  required: boolean;
  transform?: string;
}

export interface SsoGroupMapping {
  ssoGroup: string;
  localRole: string;
  autoAssign: boolean;
}

// ─── User Session ─────────────────────────────────────────────────────────────

export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  status: SessionStatus;
  authMethod: AuthMethod;
  ssoProvider?: string;
  ipAddress: string;
  userAgent: string;
  device: SessionDevice;
  geoLocation: SessionGeoLocation;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  idleExpiresAt: string;
  mfaVerified: boolean;
  riskScore: number;
  riskFactors: RiskFactor[];
}

export interface SessionDevice {
  type: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';
  os: string;
  browser: string;
  isTrusted: boolean;
  deviceFingerprint: string;
}

export interface SessionGeoLocation {
  country: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
}

export interface RiskFactor {
  type: 'NEW_DEVICE' | 'NEW_LOCATION' | 'UNUSUAL_TIME' | 'VELOCITY' | 'IMPOSSIBLE_TRAVEL' | 'VPN_DETECTED' | 'TOR_DETECTED';
  severity: RiskLevel;
  description: string;
  detectedAt: string;
}

// ─── MFA Configuration ────────────────────────────────────────────────────────

export interface MfaConfiguration {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: MfaStatus;
  primaryMethod: MfaMethod;
  backupMethods: MfaMethod[];
  totpEnabled: boolean;
  totpVerifiedAt?: string;
  smsEnabled: boolean;
  smsPhoneNumber?: string;
  hardwareKeyCount: number;
  backupCodesGenerated: boolean;
  backupCodesRemaining: number;
  lastVerifiedAt?: string;
  enforcementDate?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Access Policies ──────────────────────────────────────────────────────────

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  type: AccessPolicyType;
  enabled: boolean;
  priority: number;
  rules: AccessPolicyRule[];
  appliesTo: string[];
  enforceOnSso: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
  tags: string[];
}

export interface AccessPolicyRule {
  id: string;
  name: string;
  condition: string;
  action: 'ALLOW' | 'DENY' | 'CHALLENGE' | 'ALERT';
  parameters: Record<string, string | number | boolean>;
}

// ─── Identity Audit Log ───────────────────────────────────────────────────────

export interface IdentityAuditEntry {
  id: string;
  timestamp: string;
  eventType: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'MFA_SETUP' | 'MFA_VERIFY' | 'SESSION_CREATE' | 'SESSION_REVOKE' | 'SSO_CALLBACK' | 'PASSWORD_CHANGE' | 'ACCOUNT_LOCK' | 'ACCOUNT_UNLOCK' | 'ROLE_CHANGE' | 'POLICY_VIOLATION' | 'DEVICE_TRUST' | 'RISK_DETECTED';
  severity: RiskLevel;
  userId: string;
  userName: string;
  userEmail: string;
  description: string;
  ipAddress: string;
  geoLocation: string;
  device: string;
  authMethod: AuthMethod;
  ssoProvider?: string;
  metadata: Record<string, string>;
  riskScore?: number;
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface IdentityMetrics {
  totalUsers: number;
  activeUsers: number;
  activeSessions: number;
  ssoUsers: number;
  mfaEnrolled: number;
  mfaEnforced: number;
  failedLogins24h: number;
  lockedAccounts: number;
  highRiskSessions: number;
  ssoProviders: number;
  activePolicies: number;
  avgLoginTimeMs: number;
  loginSuccessRate: number;
  providerBreakdown: Array<{ provider: SsoProviderType; count: number; percentage: number }>;
  authMethodBreakdown: Array<{ method: AuthMethod; count: number; percentage: number }>;
  sessionTrend: Array<{ date: string; active: number; created: number; revoked: number }>;
  riskDistribution: Array<{ level: RiskLevel; count: number; percentage: number }>;
  topRiskyUsers: Array<{ user: string; email: string; riskScore: number; sessions: number; location: string }>;
  geoDistribution: Array<{ country: string; sessions: number; percentage: number }>;
  loginTrend: Array<{ hour: number; success: number; failed: number }>;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface SessionFilters {
  searchQuery: string;
  statuses: SessionStatus[];
  authMethods: AuthMethod[];
  riskLevels: RiskLevel[];
  dateRange: '1H' | '6H' | '24H' | '7D';
  showHighRiskOnly: boolean;
}

export interface AuditFilters {
  searchQuery: string;
  eventTypes: string[];
  severities: RiskLevel[];
  dateRange: '24H' | '7D' | '30D';
  userId?: string;
}

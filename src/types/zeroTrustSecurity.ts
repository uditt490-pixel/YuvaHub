export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_BREACH';

export type GateProtocol =
  | 'OAUTH2_PKCE'
  | 'EPHEMERAL_SSH'
  | 'MTLS_HANDSHAKE'
  | 'JWT_ZERO_TRUST'
  | 'BIOMETRIC_PASSKEY'
  | 'IP_GEO_FENCE';

export type AccessStatus = 'GRANTED' | 'DENIED' | 'QUARANTINED' | 'UNDER_REVIEW';

export interface SecurityEvent {
  id: string;
  eventId: string;
  timestamp: string;
  sourceIp: string;
  location: string;
  userPrincipal: string;
  userRole: string;
  targetResource: string;
  gateProtocol: GateProtocol;
  threatSeverity: ThreatSeverity;
  riskScore: number; // 0 - 100
  status: AccessStatus;
  anomaliesDetected: string[];
  userAgent: string;
  mitigationTaken?: string;
  mitigatedBy?: string;
}

export interface SecurityPolicyRule {
  id: string;
  ruleName: string;
  description: string;
  gateProtocol: GateProtocol;
  enforceMfa: boolean;
  maxRiskThreshold: number;
  autoQuarantine: boolean;
  enabled: boolean;
  matchedCount: number;
}

export interface ZeroTrustAnalytics {
  totalRequestsToday: number;
  blockedAttacks: number;
  activeQuarantines: number;
  averageRiskScore: number;
  soc2ComplianceScore: number;
  threatDistribution: { severity: ThreatSeverity; count: number; percentage: number }[];
  protocolVelocity: { protocol: GateProtocol; requestCount: number; blockRate: number }[];
}

export interface ZeroTrustFilter {
  searchQuery: string;
  threatSeverity: ThreatSeverity | 'ALL';
  gateProtocol: GateProtocol | 'ALL';
  status: AccessStatus | 'ALL';
  minRiskScore: number;
  sortBy: 'riskScore' | 'timestamp' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface QuarantinePayload {
  eventId: string;
  userPrincipal: string;
  sourceIp: string;
  quarantineDurationHours: number;
  reason: string;
  authorizedBy: string;
}

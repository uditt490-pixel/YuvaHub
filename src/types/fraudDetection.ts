// ═══════════════════════════════════════════════════════════════════
// Enterprise Fraud Detection & Risk Intelligence — Type Definitions
// ═══════════════════════════════════════════════════════════════════

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';
export type TransactionStatus = 'approved' | 'flagged' | 'blocked' | 'pending_review' | 'reversed';
export type ThreatType = 'phishing' | 'credential_stuffing' | 'account_takeover' | 'identity_theft' | 'synthetic_fraud' | 'money_laundering' | 'bot_attack' | 'insider_threat';
export type AnomalyType = 'velocity_breach' | 'geo_mismatch' | 'device_change' | 'amount_anomaly' | 'time_anomaly' | 'behavior_shift' | 'ip_reputation' | 'network_anomaly';
export type AlertSeverity = 'P0' | 'P1' | 'P2' | 'P3';
export type RuleAction = 'block' | 'flag' | 'challenge' | 'monitor' | 'notify';
export type FeedSource = 'internal' | 'osint' | 'darkweb' | 'partner' | 'government' | 'threat_intel';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  currency: string;
  type: 'payment' | 'transfer' | 'withdrawal' | 'refund' | 'deposit';
  status: TransactionStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  merchantCategory: string;
  ipAddress: string;
  deviceFingerprint: string;
  geoLocation: { country: string; city: string; lat: number; lng: number };
  anomalyFlags: AnomalyFlag[];
  timestamp: string;
  processedAt: string;
  rulesTriggered: string[];
  notes?: string;
}

export interface AnomalyFlag {
  id: string;
  type: AnomalyType;
  description: string;
  severity: AlertSeverity;
  confidence: number;
  detectedAt: string;
  mitigated: boolean;
}

export interface UserRiskProfile {
  userId: string;
  userName: string;
  email: string;
  overallRiskScore: number;
  riskLevel: RiskLevel;
  totalTransactions: number;
  flaggedTransactions: number;
  blockedTransactions: number;
  totalAmount30d: number;
  averageTransactionAmount: number;
  maxSingleTransaction: number;
  countriesAccessed: string[];
  devicesUsed: number;
  accountAge: number;
  lastActivity: string;
  previousIncidents: number;
  kycVerified: boolean;
  riskFactors: RiskFactor[];
  trendScores: number[];
}

export interface RiskFactor {
  id: string;
  category: string;
  description: string;
  impact: number;
  detectedAt: string;
  status: 'active' | 'mitigated' | 'expired';
}

export interface ThreatIntelligence {
  id: string;
  title: string;
  description: string;
  threatType: ThreatType;
  severity: AlertSeverity;
  confidence: number;
  source: FeedSource;
  iocs: IOC[];
  affectedSystems: string[];
  publishedAt: string;
  expiresAt?: string;
  references: string[];
  mitigations: string[];
  isActive: boolean;
}

export interface IOC {
  type: 'ip' | 'domain' | 'hash' | 'email' | 'url' | 'file_name';
  value: string;
  confidence: number;
  firstSeen: string;
  lastSeen: string;
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: RuleAction;
  severity: AlertSeverity;
  enabled: boolean;
  triggerCount: number;
  falsePositiveRate: number;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FraudAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  relatedTransactions: string[];
  relatedUsers: string[];
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  assignee?: string;
  resolution?: string;
}

export interface DashboardMetrics {
  totalTransactions24h: number;
  flaggedTransactions24h: number;
  blockedTransactions24h: number;
  totalVolume24h: number;
  avgRiskScore: number;
  activeAlerts: number;
  criticalAlerts: number;
  blockedAmount24h: number;
  fraudRate: number;
  systemAccuracy: number;
  avgResponseTimeMs: number;
  rulesTriggered24h: number;
}

export interface FraudDetectionState {
  metrics: DashboardMetrics | null;
  transactions: Transaction[];
  userProfiles: UserRiskProfile[];
  threats: ThreatIntelligence[];
  alerts: FraudAlert[];
  rules: FraudRule[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: TransactionStatus | 'all';
  riskFilter: RiskLevel | 'all';
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  selectedTransactionId: string | null;
  selectedAlertId: string | null;
}

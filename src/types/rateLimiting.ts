// ═══════════════════════════════════════════════════════════════════
// Enterprise API Rate Limiting & Abuse Prevention — Type Definitions
// ═══════════════════════════════════════════════════════════════════

export type RateLimitTier = 'free' | 'starter' | 'pro' | 'enterprise' | 'unlimited';
export type AbuseCategory = 'brute_force' | 'scraping' | 'ddos' | 'credential_stuffing' | 'api_abuse' | 'spam' | 'enumeration' | 'bot_traffic';
export type BlockStatus = 'active' | 'expired' | 'lifted' | 'pending_review';
export type AlertSeverity = 'P0' | 'P1' | 'P2' | 'P3';
export type TimeWindow = '1m' | '5m' | '15m' | '1h' | '6h' | '24h';
export type MetricType = 'requests' | 'errors' | 'latency' | 'bandwidth' | 'blocked';

export interface RateLimitRule {
  id: string;
  name: string;
  description: string;
  tier: RateLimitTier;
  maxRequests: number;
  timeWindow: TimeWindow;
  burstLimit: number;
  retryAfterSeconds: number;
  enabled: boolean;
  endpoints: string[];
  headers: { limit: string; remaining: string; reset: string };
  triggerCount: number;
  lastTriggered?: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  avgLatencyMs: number;
  p99LatencyMs: number;
  requestsPerMin: number;
  errorRate: number;
  rateLimitTier: RateLimitTier;
  isAuthenticated: boolean;
  lastAccessed: string;
}

export interface AbusiveClient {
  id: string;
  clientId: string;
  clientName: string;
  ipAddress: string;
  abuseCategory: AbuseCategory;
  severity: AlertSeverity;
  riskScore: number;
  requestCount: number;
  blockedRequests: number;
  uniqueEndpoints: number;
  countries: string[];
  firstSeen: string;
  lastSeen: string;
  isBlocked: boolean;
  blockStatus?: BlockStatus;
  blockExpiry?: string;
  blockReason?: string;
  requestPattern: number[];
  evidence: AbuseEvidence[];
}

export interface AbuseEvidence {
  id: string;
  type: AbuseCategory;
  description: string;
  endpoint: string;
  timestamp: string;
  count: number;
  severity: AlertSeverity;
}

export interface RateLimitEvent {
  id: string;
  clientId: string;
  clientName: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  wasLimited: boolean;
  limitTier: RateLimitTier;
  remaining: number;
  resetAt: string;
  timestamp: string;
  ipAddress: string;
}

export interface AbuseAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AbuseCategory;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  affectedEndpoints: string[];
  affectedClients: string[];
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  assignee?: string;
}

export interface DashboardMetrics {
  totalRequests24h: number;
  blockedRequests24h: number;
  uniqueClients24h: number;
  avgResponseTimeMs: number;
  blockedClients: number;
  activeAlerts: number;
  criticalAlerts: number;
  rateLimitHits24h: number;
  blockSuccessRate: number;
  bandwidthSavedGB: number;
  totalEndpoints: number;
  abuseDetected: number;
}

export interface TrafficTimeSeries {
  timestamp: string;
  requests: number;
  blocked: number;
  errors: number;
  latency: number;
}

export interface RateLimitingState {
  metrics: DashboardMetrics | null;
  rules: RateLimitRule[];
  endpoints: APIEndpoint[];
  abusiveClients: AbusiveClient[];
  events: RateLimitEvent[];
  alerts: AbuseAlert[];
  traffic: TrafficTimeSeries[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  categoryFilter: AbuseCategory | 'all';
  severityFilter: AlertSeverity | 'all';
  timeRange: TimeWindow;
  selectedClientId: string | null;
}

// ─── Enterprise API Gateway Types ─────────────────────────────────────────────
// Full type definitions for the API Gateway Manager with key lifecycle,
// rate limiting, usage analytics, endpoints, and webhook management.

export type ApiKeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'SUSPENDED' | 'PENDING_ROTATION';

export type ApiKeyScope = 'READ_ONLY' | 'READ_WRITE' | 'ADMIN' | 'WEBHOOK_ONLY' | 'CUSTOM';

export type ApiKeyEnvironment = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT' | 'SANDBOX';

export type RateLimitWindow = 'SECOND' | 'MINUTE' | 'HOUR' | 'DAY' | 'MONTH';

export type HttpVerb = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export type EndpointStatus = 'ACTIVE' | 'DEPRECATED' | 'MAINTENANCE' | 'DISABLED';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type WebhookStatus = 'ACTIVE' | 'PAUSED' | 'FAILED' | 'DISABLED';

export type UsageTimeGranularity = 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';

// ─── API Key ──────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  description: string;
  keyPrefix: string;
  keyHash: string;
  maskedKey: string;
  status: ApiKeyStatus;
  scope: ApiKeyScope;
  environment: ApiKeyEnvironment;
  permissions: string[];
  rateLimit: RateLimitConfig;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  teamId: string;
  teamName: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokeReason?: string;
  rotationDueAt?: string;
  metadata: Record<string, string | number | boolean>;
  tags: string[];
  totalRequests: number;
  errorRate: number;
  avgLatencyMs: number;
  endpointsAllowed: string[];
  ipWhitelist: string[];
  ipBlacklist: string[];
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

export interface RateLimitConfig {
  id: string;
  name: string;
  enabled: boolean;
  limits: RateLimitTier[];
  strategy: 'FIXED_WINDOW' | 'SLIDING_WINDOW' | 'TOKEN_BUCKET' | 'LEAKY_BUCKET';
  burstCapacity: number;
  burstWindowMs: number;
  retryAfterMs: number;  penalizeHeaders: boolean;
  keyBy: 'IP' | 'API_KEY' | 'USER_ID' | 'ENDPOINT';
  customHeaders: Record<string, string>;
}

export interface RateLimitTier {
  window: RateLimitWindow;
  maxRequests: number;
  maxBytes?: number;
  penaltyMultiplier: number;
}

export interface RateLimitStatus {
  keyId: string;
  keyName: string;
  currentUsage: number;
  maxUsage: number;
  usagePercentage: number;
  windowStart: string;
  windowEnd: string;
  isThrottled: boolean;
  throttledUntil?: string;
  retryAfterMs?: number;
  historicalUsage: RateLimitUsagePoint[];
}

export interface RateLimitUsagePoint {
  timestamp: string;
  requests: number;
  blocked: number;
  latencyP50: number;
  latencyP99: number;
}

// ─── API Endpoint ─────────────────────────────────────────────────────────────

export interface ApiEndpoint {
  id: string;
  path: string;
  method: HttpVerb;
  description: string;
  version: string;
  status: EndpointStatus;
  tags: string[];
  requiresAuth: boolean;
  rateLimitOverride?: Partial<RateLimitConfig>;
  avgLatencyMs: number;
  p99LatencyMs: number;
  errorRate: number;
  totalRequests: number;
  lastCalledAt?: string;
  documentation?: string;
  deprecatedSince?: string;
  sunsetDate?: string;
  requestSchema?: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
}

// ─── Usage Analytics ──────────────────────────────────────────────────────────

export interface ApiUsageMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalBandwidthBytes: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRate: number;
  uniqueConsumers: number;
  requestsTrend: number;
  bandwidthTrend: number;
  latencyTrend: number;
  timeSeriesData: ApiUsageTimeSeries[];
  topEndpoints: ApiEndpointUsage[];
  topConsumers: ApiConsumerUsage[];
  errorBreakdown: ApiErrorBreakdown[];
  latencyDistribution: LatencyBucket[];
  statusCodes: StatusCodeDistribution[];
  regionBreakdown: RegionUsage[];
  hourlyPattern: HourlyPattern[];
}

export interface ApiUsageTimeSeries {
  timestamp: string;
  requests: number;
  bandwidth: number;
  errors: number;
  avgLatency: number;
}

export interface ApiEndpointUsage {
  endpointId: string;
  path: string;
  method: HttpVerb;
  requests: number;
  avgLatency: number;
  errorRate: number;
  trend: number;
}

export interface ApiConsumerUsage {
  keyId: string;
  keyName: string;
  ownerName: string;
  requests: number;
  bandwidth: number;
  errorRate: number;
}

export interface ApiErrorBreakdown {
  statusCode: number;
  count: number;
  percentage: number;
  topPaths: string[];
}

export interface LatencyBucket {
  range: string;
  count: number;
  percentage: number;
}

export interface StatusCodeDistribution {
  code: string;
  count: number;
  percentage: number;
  color: string;
}

export interface RegionUsage {
  region: string;
  requests: number;
  percentage: number;
  avgLatency: number;
}

export interface HourlyPattern {
  hour: number;
  avgRequests: number;
  avgLatency: number;
  errorRate: number;
}

// ─── API Gateway Alerts ───────────────────────────────────────────────────────

export interface ApiGatewayAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  type: 'RATE_LIMIT_EXCEEDED' | 'HIGH_ERROR_RATE' | 'SLOW_RESPONSE' | 'KEY_ABUSE' | 'ENDPOINT_DOWN' | 'BANDWIDTH_SPIKE' | 'AUTH_FAILURE';
  triggeredAt: string;
  resolvedAt?: string;
  keyId?: string;
  endpointId?: string;
  currentValue: number;
  thresholdValue: number;
  acknowledgedBy?: string;
  autoResolve: boolean;
}

// ─── Webhook Configuration ────────────────────────────────────────────────────

export interface ApiWebhook {
  id: string;
  name: string;
  url: string;
  status: WebhookStatus;
  events: string[];
  secret: string;
  createdAt: string;
  lastTriggeredAt?: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  failureCount: number;
  successCount: number;
  avgResponseTimeMs: number;
  headers: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
    timeoutMs: number;
  };
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface ApiKeyFilters {
  searchQuery: string;
  statuses: ApiKeyStatus[];
  scopes: ApiKeyScope[];
  environments: ApiKeyEnvironment[];
  teamFilter: string;
  sortBy: 'name' | 'createdAt' | 'lastUsedAt' | 'totalRequests' | 'errorRate';
  sortDirection: 'ASC' | 'DESC';
}

export interface UsageFilters {
  timeRange: '1H' | '6H' | '24H' | '7D' | '30D';
  granularity: UsageTimeGranularity;
  keyId?: string;
  endpointId?: string;
  method?: HttpVerb;
  statusCode?: number;
}

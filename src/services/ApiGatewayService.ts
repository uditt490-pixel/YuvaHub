// ─── Enterprise API Gateway Service ───────────────────────────────────────────
// Generates realistic mock data for the API Gateway Manager feature.
// Includes API keys, rate limits, usage analytics, endpoints, alerts, and webhooks.

import {
  ApiKey, ApiKeyStatus, ApiKeyScope, ApiKeyEnvironment, RateLimitConfig,
  RateLimitStatus, RateLimitUsagePoint, ApiEndpoint, HttpVerb, EndpointStatus,
  ApiUsageMetrics, ApiUsageTimeSeries, ApiEndpointUsage, ApiConsumerUsage,
  ApiErrorBreakdown, LatencyBucket, StatusCodeDistribution, RegionUsage,
  HourlyPattern, ApiGatewayAlert, AlertSeverity, ApiWebhook, WebhookStatus,
  RateLimitWindow,
} from '../types/apiGateway';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_VERSIONS = ['v1', 'v2', 'v3'];
const REGIONS = ['US-EAST', 'EU-WEST', 'AP-SOUTH', 'US-WEST', 'EU-CENTRAL'];
const TEAMS = [
  { id: 'team_001', name: 'Platform Engineering', members: ['Priya Sharma', 'Meera Iyer'] },
  { id: 'team_002', name: 'Backend Services', members: ['Rohan Gupta', 'Arjun Reddy'] },
  { id: 'team_003', name: 'External Integrations', members: ['Vikram Singh', 'Neha Kapoor'] },
  { id: 'team_004', name: 'Mobile Squad', members: ['Aisha Patel'] },
];

const ENDPOINTS: Array<{ path: string; method: HttpVerb; description: string; version: string }> = [
  { path: '/api/v2/users', method: 'GET', description: 'List all users with pagination', version: 'v2' },
  { path: '/api/v2/users', method: 'POST', description: 'Create a new user account', version: 'v2' },
  { path: '/api/v2/users/:id', method: 'PUT', description: 'Update user profile', version: 'v2' },
  { path: '/api/v2/opportunities', method: 'GET', description: 'Search and filter opportunities', version: 'v2' },
  { path: '/api/v2/opportunities', method: 'POST', description: 'Submit a new opportunity', version: 'v2' },
  { path: '/api/v2/opportunities/:id/apply', method: 'POST', description: 'Apply to an opportunity', version: 'v2' },
  { path: '/api/v2/teams', method: 'GET', description: 'List all teams', version: 'v2' },
  { path: '/api/v2/teams/:id/members', method: 'GET', description: 'List team members', version: 'v2' },
  { path: '/api/v3/analytics/events', method: 'POST', description: 'Track analytics event', version: 'v3' },
  { path: '/api/v3/analytics/reports', method: 'GET', description: 'Generate analytics report', version: 'v3' },
  { path: '/api/v2/billing/invoices', method: 'GET', description: 'List billing invoices', version: 'v2' },
  { path: '/api/v2/billing/payment-methods', method: 'POST', description: 'Add payment method', version: 'v2' },
  { path: '/api/v2/notifications/send', method: 'POST', description: 'Send notification', version: 'v2' },
  { path: '/api/v2/webhooks', method: 'GET', description: 'List webhook configurations', version: 'v2' },
  { path: '/api/v1/search', method: 'GET', description: 'Full-text search (deprecated)', version: 'v1' },
  { path: '/api/v3/ai/recommendations', method: 'GET', description: 'AI-powered recommendations', version: 'v3' },
  { path: '/api/v2/auth/tokens', method: 'POST', description: 'Exchange auth tokens', version: 'v2' },
  { path: '/api/v2/files/upload', method: 'POST', description: 'Upload file to cloud storage', version: 'v2' },
];

const KEY_NAMES = [
  'Production Web App', 'Mobile iOS SDK', 'Mobile Android SDK', 'Staging Integration',
  'Partner API Access', 'CI/CD Pipeline', 'Analytics Service', 'Internal Dashboard',
  'External Partner Portal', 'Webhook Relay Service', 'Data Export Service', 'Dev Sandbox',
];

const ALERT_TITLES: Record<string, string[]> = {
  RATE_LIMIT_EXCEEDED: ['Rate limit exceeded for key', 'Throttle triggered on endpoint', 'Quota exhaustion imminent'],
  HIGH_ERROR_RATE: ['Error rate spike detected', '5xx errors above threshold', 'API degradation on critical path'],
  SLOW_RESPONSE: ['P99 latency exceeding 5s', 'Response time degradation', 'Timeout errors increasing'],
  KEY_ABUSE: ['Suspicious key usage pattern', 'Unusual IP address detected', 'Brute force attempt on API'],
  ENDPOINT_DOWN: ['Health check failing', 'Endpoint returning 503', 'Service unresponsive'],
  BANDWIDTH_SPIKE: ['Bandwidth usage 3x normal', 'Large payload detected', 'Data transfer anomaly'],
  AUTH_FAILURE: ['Repeated auth failures', 'Invalid token usage', 'Token expiration cascade'],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateKeyPrefix(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

// ─── Mock Data Generators ─────────────────────────────────────────────────────

function generateMockApiKey(index: number): ApiKey {
  const status: ApiKeyStatus = index % 8 === 0 ? 'REVOKED' : index % 12 === 0 ? 'EXPIRED' : index % 15 === 0 ? 'SUSPENDED' : 'ACTIVE';
  const scope: ApiKeyScope = pick(['READ_ONLY', 'READ_WRITE', 'ADMIN', 'CUSTOM']);
  const env: ApiKeyEnvironment = pick(['PRODUCTION', 'STAGING', 'DEVELOPMENT', 'SANDBOX']);
  const team = pick(TEAMS);
  const owner = pick(team.members);
  const createdMs = Date.now() - Math.random() * 86400000 * 180;

  return {
    id: generateId('key'),
    name: pick(KEY_NAMES) + ` ${index + 1}`,
    description: `API key for ${env.toLowerCase()} environment - ${scope.replace(/_/g, ' ').toLowerCase()} access`,
    keyPrefix: generateKeyPrefix(),
    keyHash: `hash_${Math.random().toString(36).slice(2, 16)}`,
    maskedKey: `sk_${generateKeyPrefix()}...****`,
    status,
    scope,
    environment: env,
    permissions: scope === 'ADMIN' ? ['read', 'write', 'delete', 'admin'] : scope === 'READ_WRITE' ? ['read', 'write'] : ['read'],
    rateLimit: {
      id: generateId('rl'),
      name: `${env} Default Rate Limit`,
      enabled: true,
      limits: [
        { window: 'SECOND', maxRequests: env === 'PRODUCTION' ? 100 : 10, penaltyMultiplier: 2 },
        { window: 'MINUTE', maxRequests: env === 'PRODUCTION' ? 1000 : 100, penaltyMultiplier: 1.5 },
        { window: 'HOUR', maxRequests: env === 'PRODUCTION' ? 50000 : 5000, penaltyMultiplier: 1 },
        { window: 'DAY', maxRequests: env === 'PRODUCTION' ? 500000 : 50000, penaltyMultiplier: 1 },
      ],
      strategy: pick(['FIXED_WINDOW', 'SLIDING_WINDOW', 'TOKEN_BUCKET']),
      burstCapacity: env === 'PRODUCTION' ? 500 : 50,
      burstWindowMs: 10000,
      retryAfterMs: 5000,
      penalizeHeaders: true,
      keyBy: 'API_KEY',
      customHeaders: {},
    },
    ownerId: `usr_${randInt(100, 999)}`,
    ownerName: owner,
    ownerEmail: `${owner.split(' ')[0].toLowerCase()}@yuvaHub.io`,
    teamId: team.id,
    teamName: team.name,
    createdAt: new Date(createdMs).toISOString(),
    updatedAt: new Date(createdMs + Math.random() * 86400000 * 30).toISOString(),
    lastUsedAt: status === 'ACTIVE' ? new Date(Date.now() - Math.random() * 86400000 * 7).toISOString() : undefined,
    expiresAt: Math.random() > 0.5 ? new Date(createdMs + 365 * 86400000).toISOString() : undefined,
    revokedAt: status === 'REVOKED' ? new Date(createdMs + Math.random() * 86400000 * 60).toISOString() : undefined,
    revokedBy: status === 'REVOKED' ? 'Priya Sharma' : undefined,
    revokeReason: status === 'REVOKED' ? pick(['Key compromised', 'Team member left', 'Rotation overdue', 'Unused key cleanup']) : undefined,
    rotationDueAt: Math.random() > 0.7 ? new Date(Date.now() + Math.random() * 86400000 * 30).toISOString() : undefined,
    metadata: { region: pick(REGIONS), apiKeyVersion: pick(API_VERSIONS) },
    tags: [env.toLowerCase(), scope.toLowerCase().replace(/_/g, '-')],
    totalRequests: status === 'ACTIVE' ? randInt(1000, 500000) : randInt(0, 50000),
    errorRate: status === 'ACTIVE' ? Math.round(Math.random() * 5 * 10) / 10 : 0,
    avgLatencyMs: status === 'ACTIVE' ? randInt(50, 400) : 0,
    endpointsAllowed: ENDPOINTS.slice(0, randInt(3, 12)).map(e => e.path),
    ipWhitelist: Math.random() > 0.5 ? [`${randInt(10, 200)}.${randInt(0, 255)}.${randInt(0, 255)}.0/24`] : [],
    ipBlacklist: [],
  };
}

function generateMockEndpoints(): ApiEndpoint[] {
  return ENDPOINTS.map((ep, i) => {
    const status: EndpointStatus = ep.version === 'v1' ? 'DEPRECATED' : i % 10 === 0 ? 'MAINTENANCE' : 'ACTIVE';
    return {
      id: `ep_${i}`,
      path: ep.path,
      method: ep.method,
      description: ep.description,
      version: ep.version,
      status,
      tags: [ep.version, ep.method.toLowerCase()],
      requiresAuth: true,
      rateLimitOverride: undefined,
      avgLatencyMs: randInt(30, 500),
      p99LatencyMs: randInt(200, 2000),
      errorRate: Math.round(Math.random() * 3 * 10) / 10,
      totalRequests: randInt(10000, 2000000),
      lastCalledAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      deprecatedSince: ep.version === 'v1' ? '2024-01-15' : undefined,
      sunsetDate: ep.version === 'v1' ? '2024-12-31' : undefined,
    };
  });
}

function generateMockUsageMetrics(): ApiUsageMetrics {
  const timeSeries: ApiUsageTimeSeries[] = Array.from({ length: 168 }, (_, i) => { // 7 days of hourly data
    const timestamp = new Date(Date.now() - (167 - i) * 3600000);
    const baseRequests = 800 + Math.sin(i / 24 * Math.PI * 2) * 300;
    const requests = Math.max(0, Math.round(baseRequests + (Math.random() - 0.5) * 400));
    return {
      timestamp: timestamp.toISOString(),
      requests,
      bandwidth: requests * randInt(1000, 5000),
      errors: Math.round(requests * (Math.random() * 0.03)),
      avgLatency: randInt(80, 250),
    };
  });

  return {
    totalRequests: 12_456_789,
    successfulRequests: 12_334_567,
    failedRequests: 122_222,
    totalBandwidthBytes: 45_678_901_234,
    avgLatencyMs: 142,
    p95LatencyMs: 380,
    p99LatencyMs: 890,
    errorRate: 0.98,
    uniqueConsumers: 47,
    requestsTrend: 12.3,
    bandwidthTrend: 8.7,
    latencyTrend: -3.2,
    timeSeriesData: timeSeries,
    topEndpoints: [
      { endpointId: 'ep_3', path: '/api/v2/opportunities', method: 'GET', requests: 4_234_567, avgLatency: 95, errorRate: 0.5, trend: 15.2 },
      { endpointId: 'ep_0', path: '/api/v2/users', method: 'GET', requests: 3_123_456, avgLatency: 78, errorRate: 0.3, trend: 8.1 },
      { endpointId: 'ep_9', path: '/api/v3/analytics/reports', method: 'GET', requests: 1_987_654, avgLatency: 320, errorRate: 1.2, trend: 22.5 },
      { endpointId: 'ep_15', path: '/api/v3/ai/recommendations', method: 'GET', requests: 1_456_789, avgLatency: 450, errorRate: 2.1, trend: 45.3 },
      { endpointId: 'ep_8', path: '/api/v3/analytics/events', method: 'POST', requests: 987_654, avgLatency: 45, errorRate: 0.1, trend: 5.6 },
    ],
    topConsumers: [
      { keyId: 'key_001', keyName: 'Production Web App', ownerName: 'Priya Sharma', requests: 5_678_901, bandwidth: 23_456_789_012, errorRate: 0.5 },
      { keyId: 'key_002', keyName: 'Mobile iOS SDK', ownerName: 'Aisha Patel', requests: 3_456_789, bandwidth: 12_345_678_901, errorRate: 0.8 },
      { keyId: 'key_003', keyName: 'Analytics Service', ownerName: 'Rohan Gupta', requests: 1_987_654, bandwidth: 5_678_901_234, errorRate: 1.5 },
      { keyId: 'key_004', keyName: 'Partner API Access', ownerName: 'Vikram Singh', requests: 876_543, bandwidth: 3_456_789_012, errorRate: 2.1 },
      { keyId: 'key_005', keyName: 'CI/CD Pipeline', ownerName: 'Meera Iyer', requests: 456_789, bandwidth: 789_012_345, errorRate: 0.2 },
    ],
    errorBreakdown: [
      { statusCode: 400, count: 45_678, percentage: 37.4, topPaths: ['/api/v2/users', '/api/v2/opportunities'] },
      { statusCode: 401, count: 28_901, percentage: 23.6, topPaths: ['/api/v2/users', '/api/v2/billing/invoices'] },
      { statusCode: 404, count: 22_345, percentage: 18.3, topPaths: ['/api/v2/users/:id', '/api/v2/teams/:id'] },
      { statusCode: 429, count: 15_678, percentage: 12.8, topPaths: ['/api/v3/ai/recommendations'] },
      { statusCode: 500, count: 9_620, percentage: 7.9, topPaths: ['/api/v2/files/upload'] },
    ],
    latencyDistribution: [
      { range: '0-50ms', count: 2_345_678, percentage: 18.8 },
      { range: '50-100ms', count: 4_567_890, percentage: 36.7 },
      { range: '100-200ms', count: 3_456_789, percentage: 27.8 },
      { range: '200-500ms', count: 1_678_901, percentage: 13.5 },
      { range: '500ms-1s', count: 345_678, percentage: 2.8 },
      { range: '1s-5s', count: 56_789, percentage: 0.5 },
      { range: '>5s', count: 5_264, percentage: 0.04 },
    ],
    statusCodes: [
      { code: '2xx', count: 12_334_567, percentage: 99.02, color: 'bg-emerald-500' },
      { code: '3xx', count: 0, percentage: 0, color: 'bg-blue-500' },
      { code: '4xx', count: 112_602, percentage: 0.90, color: 'bg-amber-500' },
      { code: '5xx', count: 9_620, percentage: 0.08, color: 'bg-red-500' },
    ],
    regionBreakdown: [
      { region: 'AP-SOUTH', requests: 5_678_901, percentage: 45.6, avgLatency: 120 },
      { region: 'US-EAST', requests: 3_456_789, percentage: 27.8, avgLatency: 180 },
      { region: 'EU-WEST', requests: 2_345_678, percentage: 18.8, avgLatency: 210 },
      { region: 'US-WEST', requests: 678_901, percentage: 5.4, avgLatency: 195 },
      { region: 'EU-CENTRAL', requests: 296_520, percentage: 2.4, avgLatency: 220 },
    ],
    hourlyPattern: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      avgRequests: Math.round(800 + Math.sin((hour - 6) / 24 * Math.PI * 2) * 400 + Math.random() * 100),
      avgLatency: randInt(100, 200),
      errorRate: Math.round(Math.random() * 2 * 10) / 10,
    })),
  };
}

function generateMockAlerts(): ApiGatewayAlert[] {
  const alerts: ApiGatewayAlert[] = [];
  const types = Object.keys(ALERT_TITLES) as Array<keyof typeof ALERT_TITLES>;

  for (let i = 0; i < 15; i++) {
    const type = pick(types) as ApiGatewayAlert['type'];
    const severity: AlertSeverity = type === 'ENDPOINT_DOWN' ? 'CRITICAL' : pick(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
    const triggeredMs = Date.now() - Math.random() * 86400000 * 7;
    const isResolved = Math.random() > 0.4;

    alerts.push({
      id: generateId('alert'),
      title: pick(ALERT_TITLES[type]),
      description: `Automated alert triggered for ${type.replace(/_/g, ' ').toLowerCase()} event on ${pick(REGIONS)} region.`,
      severity,
      type,
      triggeredAt: new Date(triggeredMs).toISOString(),
      resolvedAt: isResolved ? new Date(triggeredMs + randInt(60000, 3600000)).toISOString() : undefined,
      keyId: Math.random() > 0.5 ? `key_${randInt(1, 10)}` : undefined,
      endpointId: Math.random() > 0.5 ? `ep_${randInt(0, 17)}` : undefined,
      currentValue: severity === 'CRITICAL' ? randInt(80, 100) : randInt(40, 80),
      thresholdValue: severity === 'CRITICAL' ? 80 : 50,
      acknowledgedBy: isResolved ? pick(TEAMS.flatMap(t => t.members)) : undefined,
      autoResolve: severity === 'LOW',
    });
  }

  return alerts.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
}

function generateMockWebhooks(): ApiWebhook[] {
  const events = ['opportunity.created', 'opportunity.updated', 'user.registered', 'team.created', 'invoice.paid', 'alert.triggered'];
  return [
    {
      id: generateId('whk'), name: 'Slack Notifications', url: 'https://hooks.slack.com/services/T00/B00/xxx', status: 'ACTIVE',
      events: ['opportunity.created', 'alert.triggered'], secret: `whsec_${generateKeyPrefix()}`,
      createdAt: new Date(Date.now() - 86400000 * 90).toISOString(), lastTriggeredAt: new Date(Date.now() - 3600000).toISOString(),
      lastSuccessAt: new Date(Date.now() - 3600000).toISOString(), failureCount: 3, successCount: 1247,
      avgResponseTimeMs: 180, headers: { 'Content-Type': 'application/json' },
      retryPolicy: { maxRetries: 3, backoffMs: 5000, timeoutMs: 10000 },
    },
    {
      id: generateId('whk'), name: 'Analytics Pipeline', url: 'https://analytics.yuvaHub.io/events', status: 'ACTIVE',
      events: ['user.registered', 'opportunity.created', 'team.created'], secret: `whsec_${generateKeyPrefix()}`,
      createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), lastTriggeredAt: new Date(Date.now() - 1800000).toISOString(),
      lastSuccessAt: new Date(Date.now() - 1800000).toISOString(), failureCount: 12, successCount: 8901,
      avgResponseTimeMs: 95, headers: { 'X-API-Key': 'analytics_key_***' },
      retryPolicy: { maxRetries: 5, backoffMs: 2000, timeoutMs: 5000 },
    },
    {
      id: generateId('whk'), name: 'Billing Sync', url: 'https://billing-sync.yuvaHub.io/webhook', status: 'FAILED',
      events: ['invoice.paid'], secret: `whsec_${generateKeyPrefix()}`,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastTriggeredAt: new Date(Date.now() - 7200000).toISOString(),
      lastFailureAt: new Date(Date.now() - 7200000).toISOString(), failureCount: 45, successCount: 234,
      avgResponseTimeMs: 0, headers: {},
      retryPolicy: { maxRetries: 3, backoffMs: 10000, timeoutMs: 15000 },
    },
  ];
}

// ─── Service Class ────────────────────────────────────────────────────────────

export class ApiGatewayService {
  private static cachedKeys: ApiKey[] | null = null;
  private static cachedEndpoints: ApiEndpoint[] | null = null;
  private static cachedMetrics: ApiUsageMetrics | null = null;

  static async getApiKeys(): Promise<ApiKey[]> {
    await new Promise(r => setTimeout(r, 600));
    if (!this.cachedKeys) {
      this.cachedKeys = Array.from({ length: 20 }, (_, i) => generateMockApiKey(i));
    }
    return this.cachedKeys;
  }

  static async getEndpoints(): Promise<ApiEndpoint[]> {
    await new Promise(r => setTimeout(r, 400));
    if (!this.cachedEndpoints) this.cachedEndpoints = generateMockEndpoints();
    return this.cachedEndpoints;
  }

  static async getUsageMetrics(): Promise<ApiUsageMetrics> {
    await new Promise(r => setTimeout(r, 500));
    if (!this.cachedMetrics) this.cachedMetrics = generateMockUsageMetrics();
    return this.cachedMetrics;
  }

  static async getAlerts(): Promise<ApiGatewayAlert[]> {
    await new Promise(r => setTimeout(r, 350));
    return generateMockAlerts();
  }

  static async getWebhooks(): Promise<ApiWebhook[]> {
    await new Promise(r => setTimeout(r, 300));
    return generateMockWebhooks();
  }

  static async getKeyUsageHistory(keyId: string): Promise<RateLimitUsagePoint[]> {
    await new Promise(r => setTimeout(r, 300));
    return Array.from({ length: 24 }, (_, i) => ({
      timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      requests: randInt(100, 2000),
      blocked: randInt(0, 50),
      latencyP50: randInt(50, 200),
      latencyP99: randInt(200, 800),
    }));
  }
}

// ═══════════════════════════════════════════════════════════════════
// Enterprise API Rate Limiting & Abuse Prevention — Service Layer
// ═══════════════════════════════════════════════════════════════════

import {
  RateLimitRule, RateLimitTier, TimeWindow, APIEndpoint,
  AbusiveClient, AbuseCategory, AlertSeverity, RateLimitEvent,
  AbuseAlert, DashboardMetrics, TrafficTimeSeries, BlockStatus
} from '../types/rateLimiting';

function gid(p: string) { return `${p}-${Math.random().toString(36).substring(2, 10)}`; }
function rand(a: number, b: number) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randf(a: number, b: number, d = 2) { return parseFloat((Math.random() * (b - a) + a).toFixed(d)); }
function pick<T>(a: T[]) { return a[Math.floor(Math.random() * a.length)]; }
function dstr(d: number) { const dt = new Date(); dt.setDate(dt.getDate() - rand(0, Math.abs(d))); dt.setHours(rand(0, 23), rand(0, 59)); return dt.toISOString(); }

const CLIENTS = ['MobileApp-iOS','MobileApp-Android','WebDashboard','PartnerAPI-Meridian','InternalService-Auth','InternalService-Pay','BatchProcessor','LegacyClient-v2','MLPipeline','AnalyticsCollector','ExternalBot-Unknown','ScraperBot-Google','CredentialBot-Auto','LoadTester-K6','CronJob-Reports'];

const ENDPOINTS = [
  { path: '/api/v1/auth/login', method: 'POST' as const, desc: 'User authentication', tier: 'free' as RateLimitTier },
  { path: '/api/v1/users', method: 'GET' as const, desc: 'List users', tier: 'pro' as RateLimitTier },
  { path: '/api/v1/payments', method: 'POST' as const, desc: 'Process payment', tier: 'enterprise' as RateLimitTier },
  { path: '/api/v1/search', method: 'GET' as const, desc: 'Full-text search', tier: 'starter' as RateLimitTier },
  { path: '/api/v1/uploads', method: 'POST' as const, desc: 'File upload', tier: 'pro' as RateLimitTier },
  { path: '/api/v1/reports', method: 'GET' as const, desc: 'Generate reports', tier: 'free' as RateLimitTier },
  { path: '/api/v1/webhooks', method: 'POST' as const, desc: 'Webhook callbacks', tier: 'enterprise' as RateLimitTier },
  { path: '/api/v1/analytics', method: 'GET' as const, desc: 'Analytics data', tier: 'starter' as RateLimitTier },
  { path: '/api/v1/notifications', method: 'GET' as const, desc: 'User notifications', tier: 'free' as RateLimitTier },
  { path: '/api/v1/settings', method: 'PUT' as const, desc: 'Update settings', tier: 'pro' as RateLimitTier }
];

const ABUSE_CATS: AbuseCategory[] = ['brute_force','scraping','ddos','credential_stuffing','api_abuse','spam','enumeration','bot_traffic'];
const SEVS: AlertSeverity[] = ['P0','P1','P2','P3'];
const TIERS: RateLimitTier[] = ['free','starter','pro','enterprise','unlimited'];
const TIMEWINDOWS: TimeWindow[] = ['1m','5m','15m','1h','6h','24h'];

function genRules(): RateLimitRule[] {
  return TIERS.map((tier, i) => ({
    id: gid('rule'), name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier Rate Limit`,
    description: `Rate limit policy for ${tier} tier API consumers`,
    tier, maxRequests: [100, 500, 2000, 10000, 100000][i],
    timeWindow: ['1m','5m','15m','1h','6h'][i] as TimeWindow,
    burstLimit: [20, 100, 500, 2000, 20000][i],
    retryAfterSeconds: [60, 30, 15, 5, 1][i],
    enabled: i < 4,
    endpoints: ENDPOINTS.slice(0, rand(3, 10)).map(e => e.path),
    headers: { limit: 'X-RateLimit-Limit', remaining: 'X-RateLimit-Remaining', reset: 'X-RateLimit-Reset' },
    triggerCount: rand(0, 5000),
    lastTriggered: Math.random() > 0.2 ? dstr(7) : undefined,
    createdAt: dstr(180), updatedAt: dstr(30)
  }));
}

function genEndpoints(): APIEndpoint[] {
  return ENDPOINTS.map((e, i) => ({
    id: `ep-${i + 1}`, path: e.path, method: e.method, description: e.desc,
    avgLatencyMs: rand(10, 300), p99LatencyMs: rand(200, 2000),
    requestsPerMin: rand(5, 500), errorRate: randf(0, 8),
    rateLimitTier: e.tier, isAuthenticated: e.method !== 'GET' || i > 4,
    lastAccessed: dstr(1)
  }));
}

function genAbusiveClients(): AbusiveClient[] {
  return CLIENTS.map((name, i) => {
    const cat = pick(ABUSE_CATS);
    const sev = pick(SEVS);
    const isBlocked = Math.random() > 0.6;
    return {
      id: gid('cl'), clientId: `cli-${String(i + 1).padStart(3, '0')}`, clientName: name,
      ipAddress: `${rand(10, 223)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`,
      abuseCategory: cat, severity: sev, riskScore: randf(20, 100),
      requestCount: rand(100, 50000), blockedRequests: rand(10, 5000),
      uniqueEndpoints: rand(1, 10), countries: [pick(['IN','US','GB','DE','CN','RU','BR'])],
      firstSeen: dstr(60), lastSeen: dstr(1), isBlocked,
      blockStatus: isBlocked ? (pick(['active','expired','lifted'] as BlockStatus[])) : undefined,
      blockExpiry: isBlocked ? dstr(-30) : undefined,
      blockReason: isBlocked ? pick(['Rate limit exceeded','Suspicious activity','Credential stuffing','DDoS pattern','API abuse']) : undefined,
      requestPattern: Array.from({ length: 24 }, () => rand(0, 100)),
      evidence: Array.from({ length: rand(1, 4) }, () => ({
        id: gid('ev'), type: cat,
        description: `Detected ${cat.replace(/_/g, ' ')} pattern on ${pick(ENDPOINTS).path}`,
        endpoint: pick(ENDPOINTS).path, timestamp: dstr(14),
        count: rand(5, 500), severity: pick(SEVS)
      }))
    };
  });
}

function genEvents(): RateLimitEvent[] {
  return Array.from({ length: 60 }, (_, i) => {
    const client = pick(CLIENTS);
    const ep = pick(ENDPOINTS);
    return {
      id: gid('evt'), clientId: `cli-${rand(1, 15).toString().padStart(3, '0')}`, clientName: client,
      endpoint: ep.path, method: ep.method,
      statusCode: pick([200, 200, 200, 200, 429, 429, 500]),
      responseTimeMs: rand(5, 1500), wasLimited: Math.random() > 0.85,
      limitTier: pick(TIERS), remaining: rand(0, 1000),
      resetAt: dstr(-1), timestamp: dstr(3), ipAddress: `${rand(10, 223)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`
    };
  });
}

function genAlerts(): AbuseAlert[] {
  return Array.from({ length: 10 }, () => ({
    id: gid('alert'), title: pick(['Brute force login attempts','DDoS traffic pattern detected','Credential stuffing campaign','API scraping detected','Suspicious enumeration pattern','Bot traffic surge','Spam submission flood','Unauthorized API abuse']),
    description: 'Automated abuse detection engine triggered. Multiple indicators correlated.',
    severity: pick(SEVS), category: pick(ABUSE_CATS),
    status: pick(['open','open','investigating','resolved','dismissed'] as const),
    affectedEndpoints: [pick(ENDPOINTS).path], affectedClients: [pick(CLIENTS)],
    riskScore: randf(30, 98), createdAt: dstr(14), updatedAt: dstr(1),
    assignee: pick(['security-team','ops-lead','api-platform'])
  }));
}

function genTraffic(): TrafficTimeSeries[] {
  return Array.from({ length: 48 }, (_, i) => {
    const hour = new Date(Date.now() - (48 - i) * 3600000);
    const base = 500 + Math.sin(i / 6) * 300;
    return {
      timestamp: hour.toISOString(),
      requests: Math.round(base + rand(-50, 150)),
      blocked: Math.round(rand(5, 40)),
      errors: Math.round(rand(2, 20)),
      latency: randf(20, 200)
    };
  });
}

function genMetrics(): DashboardMetrics {
  return {
    totalRequests24h: rand(800000, 2000000), blockedRequests24h: rand(5000, 50000),
    uniqueClients24h: rand(200, 800), avgResponseTimeMs: rand(30, 120),
    blockedClients: rand(10, 50), activeAlerts: rand(3, 15), criticalAlerts: rand(0, 4),
    rateLimitHits24h: rand(1000, 20000), blockSuccessRate: randf(95, 99.9),
    bandwidthSavedGB: randf(0.5, 15), totalEndpoints: ENDPOINTS.length, abuseDetected: rand(2, 12)
  };
}

export class RateLimitingService {
  private static rules = genRules();
  private static endpoints = genEndpoints();
  private static clients = genAbusiveClients();
  private static events = genEvents();
  private static alerts = genAlerts();
  private static traffic = genTraffic();

  static async getMetrics(): Promise<DashboardMetrics> { await new Promise(r => setTimeout(r, 200)); return genMetrics(); }
  static async getRules(): Promise<RateLimitRule[]> { await new Promise(r => setTimeout(r, 200)); return [...this.rules]; }
  static async getEndpoints(): Promise<APIEndpoint[]> { await new Promise(r => setTimeout(r, 200)); return [...this.endpoints]; }
  static async getAbusiveClients(): Promise<AbusiveClient[]> { await new Promise(r => setTimeout(r, 250)); return [...this.clients]; }
  static async getEvents(): Promise<RateLimitEvent[]> { await new Promise(r => setTimeout(r, 250)); return [...this.events]; }
  static async getAlerts(): Promise<AbuseAlert[]> { await new Promise(r => setTimeout(r, 200)); return [...this.alerts]; }
  static async getTraffic(): Promise<TrafficTimeSeries[]> { await new Promise(r => setTimeout(r, 300)); return [...this.traffic]; }
  static async toggleRule(id: string, enabled: boolean): Promise<RateLimitRule | undefined> { await new Promise(r => setTimeout(r, 150)); const r = this.rules.find(x => x.id === id); if (r) r.enabled = enabled; return r; }
  static async blockClient(id: string): Promise<AbusiveClient | undefined> { await new Promise(r => setTimeout(r, 200)); const c = this.clients.find(x => x.id === id); if (c) { c.isBlocked = true; c.blockStatus = 'active'; } return c; }
  static async liftBlock(id: string): Promise<AbusiveClient | undefined> { await new Promise(r => setTimeout(r, 200)); const c = this.clients.find(x => x.id === id); if (c) { c.isBlocked = false; c.blockStatus = 'lifted'; } return c; }
}

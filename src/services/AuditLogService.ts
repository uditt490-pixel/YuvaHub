// ─── Enterprise Audit Log Service ─────────────────────────────────────────────
// Generates realistic mock data for the Audit Log & Activity Timeline feature.
// Includes mock entries, metrics aggregation, filtering, and streaming simulation.

import {
  AuditLogEntry,
  AuditMetrics,
  AuditTimelineGroup,
  AuditCategory,
  AuditSeverity,
  AuditAction,
  AuditResourceType,
  AuditStreamEvent,
  AuditLogFilters,
  TimeRange,
  ComplianceMapping,
} from '../types/auditLog';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTOR_POOL: Array<{ id: string; name: string; email: string; role: string }> = [
  { id: 'usr_001', name: 'Priya Sharma', email: 'priya@yuvaHub.io', role: 'Super Admin' },
  { id: 'usr_002', name: 'Rohan Gupta', email: 'rohan@yuvaHub.io', role: 'Platform Engineer' },
  { id: 'usr_003', name: 'Aisha Patel', email: 'aisha@yuvaHub.io', role: 'Security Analyst' },
  { id: 'usr_004', name: 'Vikram Singh', email: 'vikram@yuvaHub.io', role: 'Billing Manager' },
  { id: 'usr_005', name: 'Meera Iyer', email: 'meera@yuvaHub.io', role: 'DevOps Lead' },
  { id: 'usr_006', name: 'Arjun Reddy', email: 'arjun@yuvaHub.io', role: 'Support Engineer' },
  { id: 'usr_007', name: 'Neha Kapoor', email: 'neha@yuvaHub.io', role: 'Product Manager' },
  { id: 'usr_008', name: 'System Bot', email: 'system@yuvaHub.io', role: 'System' },
  { id: 'usr_009', name: 'Ravi Kumar', email: 'ravi@enterprise.co', role: 'Customer Admin' },
  { id: 'usr_010', name: 'Sneha Joshi', email: 'sneha@enterprise.co', role: 'Customer Viewer' },
];

const IP_POOL = [
  '103.21.58.14', '192.168.1.42', '172.16.0.8', '45.33.112.6',
  '10.0.0.100', '203.0.113.50', '198.51.100.23', '104.236.228.48',
];

const REGIONS = ['US-EAST', 'EU-WEST', 'AP-SOUTH', 'US-WEST', 'EU-CENTRAL', 'AP-EAST'];

const GEO_MAP: Record<string, { country: string; city: string; latitude: number; longitude: number }> = {
  'US-EAST': { country: 'United States', city: 'New York', latitude: 40.7128, longitude: -74.006 },
  'EU-WEST': { country: 'United Kingdom', city: 'London', latitude: 51.5074, longitude: -0.1278 },
  'AP-SOUTH': { country: 'India', city: 'Mumbai', latitude: 19.076, longitude: 72.8777 },
  'US-WEST': { country: 'United States', city: 'San Francisco', latitude: 37.7749, longitude: -122.4194 },
  'EU-CENTRAL': { country: 'Germany', city: 'Frankfurt', latitude: 50.1109, longitude: 8.6821 },
  'AP-EAST': { country: 'Singapore', city: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
};

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
];

const DESCRIPTION_TEMPLATES: Record<AuditAction, string[]> = {
  CREATE: ['Created new {resource}', 'Added {resource} to system', 'Provisioned {resource}'],
  UPDATE: ['Modified {resource} configuration', 'Updated {resource} properties', 'Changed {resource} settings'],
  DELETE: ['Removed {resource} from system', 'Soft-deleted {resource}', 'Archived {resource}'],
  LOGIN: ['User authenticated via SSO', 'Session established via OAuth2', 'Direct login with MFA'],
  LOGOUT: ['Session terminated gracefully', 'User signed out', 'Session expired after inactivity'],
  LOGIN_FAILED: ['Failed login attempt — invalid credentials', 'SSO authentication rejected', 'MFA verification failed'],
  EXPORT: ['Exported {resource} data to CSV', 'Generated report from {resource}', 'Bulk data export initiated'],
  IMPORT: ['Imported dataset into {resource}', 'Bulk user import completed', 'External data sync for {resource}'],
  PERMISSION_CHANGE: ['Updated permission set for {resource}', 'Modified access control list', 'Changed resource visibility'],
  CONFIG_CHANGE: ['System configuration updated', 'Feature configuration modified', 'Service parameters adjusted'],
  ROLE_ASSIGN: ['Assigned new role to user', 'Role mapping updated', 'Privilege escalation approved'],
  ROLE_REVOKE: ['Revoked role from user', 'Access level downgraded', 'Role assignment removed'],
  KEY_ROTATE: ['API key rotated successfully', 'Service credentials rotated', 'Encryption key cycled'],
  KEY_REVOKE: ['API key revoked', 'Service credential invalidated', 'Access token blacklisted'],
  PAYMENT_PROCESSED: ['Payment of $2,499 processed', 'Invoice settled successfully', 'Subscription charge applied'],
  SUBSCRIPTION_CHANGED: ['Plan upgraded to Enterprise', 'Subscription renewed', 'Billing cycle adjusted'],
  WEBHOOK_FIRED: ['Webhook delivered to endpoint', 'Event notification dispatched', 'Callback triggered successfully'],
  MFA_ENABLED: ['Multi-factor authentication activated', 'TOTP device registered', 'Hardware key enrolled'],
  MFA_DISABLED: ['Multi-factor authentication deactivated', 'Backup codes regenerated', 'Recovery method updated'],
  PASSWORD_RESET: ['Password reset request initiated', 'Password successfully changed', 'Reset link generated'],
  ACCOUNT_LOCKED: ['Account locked after 5 failed attempts', 'Suspicious activity detected — account locked', 'Admin-initiated account lock'],
  ACCOUNT_UNLOCKED: ['Account unlocked by administrator', 'Manual unlock processed', 'Auto-unlock after cooldown'],
  DATA_ACCESS: ['Sensitive data accessed', 'PII record viewed', 'Confidential report opened'],
  BULK_UPDATE: ['Bulk update applied to 2,400 records', 'Mass status change executed', 'Batch processing completed'],
  INTEGRATION_SYNC: ['Third-party sync initiated', 'Integration data reconciled', 'External API connected'],
  BACKUP_CREATED: ['Full system backup completed', 'Incremental backup stored', 'Database snapshot created'],
  BACKUP_RESTORED: ['System restored from backup', 'Database rollback executed', 'Configuration restore completed'],
  FEATURE_FLAG_TOGGLED: ['Feature flag toggled in production', 'Experiment variant switched', 'Flag rollout percentage adjusted'],
  ENVIRONMENT_DEPLOYED: ['Deployment to staging environment', 'Production release deployed', 'Canary deployment initiated'],
};

const RESOURCE_NAMES: Record<AuditResourceType, string[]> = {
  USER: ['user-8821', 'user-9903', 'user-4421', 'user-1187'],
  TEAM: ['engineering', 'platform', 'security', 'devops'],
  ROLE: ['super_admin', 'billing_manager', 'viewer', 'editor'],
  PERMISSION: ['read:audit_logs', 'write:billing', 'admin:users', 'delete:integrations'],
  API_KEY: ['pk_live_***4a2f', 'pk_test_***8b3c', 'sk_prod_***1d5e'],
  BILLING_ACCOUNT: ['acct_ent_001', 'acct_ent_002', 'acct_pro_003'],
  SUBSCRIPTION: ['sub_enterprise_annual', 'sub_pro_monthly', 'sub_starter'],
  FEATURE_FLAG: ['dark-mode-v2', 'ai-matching', 'beta-dashboard', 'new-onboarding'],
  INTEGRATION: ['slack-sync', 'github-oauth', 'stripe-billing', 'sendgrid-mail'],
  DATASET: ['user_analytics_q3', 'revenue_report', 'eng_metrics'],
  FILE: ['export_2024.csv', 'compliance_report.pdf', 'audit_trail.json'],
  WEBHOOK: ['slack-alerts', 'billing-events', 'security-notifications'],
  ENVIRONMENT: ['production', 'staging', 'development', 'canary'],
  AUDIT_LOG: ['log_export_001', 'log_archive_002'],
  SESSION: ['sess_abc123', 'sess_def456', 'sess_ghi789'],
  NOTIFICATION: ['alert_critical_001', 'digest_weekly_002'],
  TEMPLATE: ['email_welcome', 'invoice_template', 'report_layout'],
  POLICY: ['data_retention', 'access_control', 'incident_response'],
};

const RESOURCE_TYPES: AuditResourceType[] = [
  'USER', 'TEAM', 'ROLE', 'PERMISSION', 'API_KEY', 'BILLING_ACCOUNT',
  'SUBSCRIPTION', 'FEATURE_FLAG', 'INTEGRATION', 'DATASET', 'FILE',
  'WEBHOOK', 'ENVIRONMENT', 'SESSION', 'NOTIFICATION', 'TEMPLATE', 'POLICY',
];

const CATEGORIES: AuditCategory[] = [
  'AUTHENTICATION', 'AUTHORIZATION', 'DATA_MODIFICATION', 'DATA_EXPORT',
  'USER_MANAGEMENT', 'SYSTEM_CONFIG', 'BILLING', 'SECURITY', 'API_ACCESS', 'INTEGRATION',
];

const ACTIONS: AuditAction[] = [
  'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'EXPORT',
  'IMPORT', 'PERMISSION_CHANGE', 'CONFIG_CHANGE', 'ROLE_ASSIGN', 'ROLE_REVOKE',
  'KEY_ROTATE', 'KEY_REVOKE', 'PAYMENT_PROCESSED', 'SUBSCRIPTION_CHANGED',
  'WEBHOOK_FIRED', 'MFA_ENABLED', 'MFA_DISABLED', 'PASSWORD_RESET',
  'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'DATA_ACCESS', 'BULK_UPDATE',
  'INTEGRATION_SYNC', 'BACKUP_CREATED', 'BACKUP_RESTORED',
  'FEATURE_FLAG_TOGGLED', 'ENVIRONMENT_DEPLOYED',
];

const SEVERITY_MAP: Record<AuditAction, AuditSeverity> = {
  LOGIN: 'INFO',
  LOGOUT: 'INFO',
  CREATE: 'INFO',
  UPDATE: 'INFO',
  DELETE: 'WARNING',
  LOGIN_FAILED: 'WARNING',
  EXPORT: 'INFO',
  IMPORT: 'INFO',
  PERMISSION_CHANGE: 'WARNING',
  CONFIG_CHANGE: 'WARNING',
  ROLE_ASSIGN: 'WARNING',
  ROLE_REVOKE: 'WARNING',
  KEY_ROTATE: 'INFO',
  KEY_REVOKE: 'CRITICAL',
  PAYMENT_PROCESSED: 'INFO',
  SUBSCRIPTION_CHANGED: 'INFO',
  WEBHOOK_FIRED: 'INFO',
  MFA_ENABLED: 'INFO',
  MFA_DISABLED: 'WARNING',
  PASSWORD_RESET: 'WARNING',
  ACCOUNT_LOCKED: 'CRITICAL',
  ACCOUNT_UNLOCKED: 'WARNING',
  DATA_ACCESS: 'INFO',
  BULK_UPDATE: 'WARNING',
  INTEGRATION_SYNC: 'INFO',
  BACKUP_CREATED: 'INFO',
  BACKUP_RESTORED: 'INFO',
  FEATURE_FLAG_TOGGLED: 'INFO',
  ENVIRONMENT_DEPLOYED: 'INFO',
};

const SEVERITY_BOOST: Record<string, AuditSeverity> = {
  'ACCOUNT_LOCKED': 'EMERGENCY',
  'KEY_REVOKE': 'EMERGENCY',
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

function formatDescription(action: AuditAction, resourceType: AuditResourceType): string {
  const templates = DESCRIPTION_TEMPLATES[action] || [`${action} performed on ${resourceType}`];
  const template = pick(templates);
  const resourceName = pick(RESOURCE_NAMES[resourceType] || ['resource']);
  return template.replace('{resource}', resourceName);
}

// ─── Mock Data Generator ──────────────────────────────────────────────────────

function generateMockEntry(index: number, timestampOverride?: string): AuditLogEntry {
  const category = pick(CATEGORIES);
  const action = pick(ACTIONS);
  const resourceType = pick(RESOURCE_TYPES);
  const actor = pick(ACTOR_POOL);
  const region = pick(REGIONS);
  const severity = SEVERITY_BOOST[action] || SEVERITY_MAP[action] || 'INFO';
  const isFailed = action === 'LOGIN_FAILED' || action === 'ACCOUNT_LOCKED';

  const timestamp = timestampOverride || new Date(
    Date.now() - Math.random() * 90 * 86400000
  ).toISOString();

  const riskScore = isFailed
    ? randInt(60, 95)
    : action === 'ROLE_ASSIGN' || action === 'ROLE_REVOKE' || action === 'KEY_REVOKE'
      ? randInt(40, 75)
      : randInt(0, 35);

  const resourceName = pick(RESOURCE_NAMES[resourceType] || ['unknown']);
  const resourceId = `res_${randInt(10000, 99999)}`;

  const metadata: Record<string, string | number | boolean> = {
    sessionId: `sess_${Math.random().toString(36).slice(2, 14)}`,
    traceId: `tr_${Math.random().toString(36).slice(2, 14)}`,
    latencyMs: randInt(12, 450),
    apiVersion: `v${randInt(1, 4)}.${randInt(0, 9)}`,
    environment: pick(['production', 'staging', 'development']),
    region,
  };

  if (action === 'EXPORT' || action === 'IMPORT') {
    metadata.fileSize = `${(Math.random() * 50).toFixed(1)} MB`;
    metadata.recordCount = randInt(100, 50000);
  }

  if (action === 'PAYMENT_PROCESSED') {
    metadata.amount = `$${randInt(99, 9999)}`;
    metadata.currency = 'USD';
    metadata.invoiceId = `INV-${randInt(10000, 99999)}`;
  }

  if (action === 'FEATURE_FLAG_TOGGLED') {
    metadata.flagKey = pick(['dark-mode-v2', 'ai-matching', 'beta-dashboard', 'new-onboarding']);
    metadata.previousState = pick(['true', 'false']);
    metadata.newState = pick(['true', 'false']);
  }

  const previousValue = ['UPDATE', 'DELETE', 'ROLE_REVOKE', 'KEY_REVOKE', 'MFA_DISABLED'].includes(action)
    ? JSON.stringify({ status: 'active', modified: true })
    : undefined;

  const newValue = ['CREATE', 'UPDATE', 'ROLE_ASSIGN', 'KEY_ROTATE', 'MFA_ENABLED'].includes(action)
    ? JSON.stringify({ status: 'active', modified: false, created: true })
    : undefined;

  return {
    id: generateId('aud'),
    timestamp,
    category,
    severity,
    action,
    resourceType,
    resourceId,
    resourceName,
    actorId: actor.id,
    actorName: actor.name,
    actorEmail: actor.email,
    actorRole: actor.role,
    actorIp: pick(IP_POOL),
    actorUserAgent: pick(USER_AGENTS),
    description: formatDescription(action, resourceType),
    metadata,
    previousValue,
    newValue,
    affectedUsers: action === 'BULK_UPDATE'
      ? Array.from({ length: randInt(10, 200) }, (_, i) => `user_${i}`)
      : [],
    region,
    sessionId: metadata.sessionId as string,
    requestId: `req_${Math.random().toString(36).slice(2, 14)}`,
    riskScore,
    geoLocation: GEO_MAP[region] || GEO_MAP['US-EAST'],
  };
}

function generateMockEntries(count: number = 200): AuditLogEntry[] {
  const entries: AuditLogEntry[] = [];

  // Generate a mix of recent and older entries
  for (let i = 0; i < count; i++) {
    const ageDays = Math.random() * 90;
    const timestamp = new Date(Date.now() - ageDays * 86400000).toISOString();
    entries.push(generateMockEntry(i, timestamp));
  }

  // Ensure some critical/emergency events exist
  const criticalActions: AuditAction[] = ['ACCOUNT_LOCKED', 'KEY_REVOKE', 'LOGIN_FAILED'];
  for (let i = 0; i < 15; i++) {
    const entry = generateMockEntry(count + i);
    entry.action = pick(criticalActions);
    entry.severity = SEVERITY_BOOST[entry.action] || 'CRITICAL';
    entry.riskScore = randInt(70, 98);
    entries.push(entry);
  }

  // Add a cluster of very recent events (last hour) for real-time feel
  for (let i = 0; i < 12; i++) {
    const timestamp = new Date(Date.now() - Math.random() * 3600000).toISOString();
    entries.push(generateMockEntry(count + 15 + i, timestamp));
  }

  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return entries;
}

// ─── Service Class ────────────────────────────────────────────────────────────

export class AuditLogService {
  private static cachedEntries: AuditLogEntry[] | null = null;

  static async getEntries(filters?: Partial<AuditLogFilters>): Promise<AuditLogEntry[]> {
    await new Promise(r => setTimeout(r, 700));

    if (!this.cachedEntries) {
      this.cachedEntries = generateMockEntries(200);
    }

    let result = [...this.cachedEntries];

    if (filters) {
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(e =>
          e.description.toLowerCase().includes(q) ||
          e.resourceName.toLowerCase().includes(q) ||
          e.actorName.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q)
        );
      }

      if (filters.categories && filters.categories.length > 0) {
        result = result.filter(e => filters.categories!.includes(e.category));
      }

      if (filters.severities && filters.severities.length > 0) {
        result = result.filter(e => filters.severities!.includes(e.severity));
      }

      if (filters.actions && filters.actions.length > 0) {
        result = result.filter(e => filters.actions!.includes(e.action));
      }

      if (filters.resourceTypes && filters.resourceTypes.length > 0) {
        result = result.filter(e => filters.resourceTypes!.includes(e.resourceType));
      }

      if (filters.timeRange && filters.timeRange !== 'CUSTOM') {
        const now = Date.now();
        const rangeMs: Record<string, number> = {
          '1H': 3600000,
          '6H': 21600000,
          '24H': 86400000,
          '7D': 604800000,
          '30D': 2592000000,
          '90D': 7776000000,
        };
        const cutoff = now - (rangeMs[filters.timeRange] || 86400000);
        result = result.filter(e => new Date(e.timestamp).getTime() >= cutoff);
      }

      if (filters.timeRange === 'CUSTOM') {
        if (filters.customDateFrom) {
          result = result.filter(e => new Date(e.timestamp) >= new Date(filters.customDateFrom!));
        }
        if (filters.customDateTo) {
          result = result.filter(e => new Date(e.timestamp) <= new Date(filters.customDateTo!));
        }
      }

      if (filters.actorSearch) {
        const aq = filters.actorSearch.toLowerCase();
        result = result.filter(e =>
          e.actorName.toLowerCase().includes(aq) ||
          e.actorEmail.toLowerCase().includes(aq)
        );
      }

      if (filters.minRiskScore !== undefined) {
        result = result.filter(e => e.riskScore >= filters.minRiskScore!);
      }

      if (filters.maxRiskScore !== undefined) {
        result = result.filter(e => e.riskScore <= filters.maxRiskScore!);
      }

      const sortKey = filters.sortBy || 'timestamp';
      const sortDir = filters.sortDirection || 'DESC';
      result.sort((a, b) => {
        const aVal = a[sortKey as keyof AuditLogEntry];
        const bVal = b[sortKey as keyof AuditLogEntry];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDir === 'DESC'
            ? bVal.localeCompare(aVal)
            : aVal.localeCompare(bVal);
        }
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDir === 'DESC' ? bVal - aVal : aVal - bVal;
        }
        return 0;
      });
    }

    return result;
  }

  static async getMetrics(): Promise<AuditMetrics> {
    await new Promise(r => setTimeout(r, 500));

    const entries = this.cachedEntries || generateMockEntries(200);
    const now = Date.now();
    const day24hAgo = now - 86400000;
    const day48hAgo = now - 172800000;

    const eventsLast24h = entries.filter(e => new Date(e.timestamp).getTime() >= day24hAgo).length;
    const eventsPrev24h = entries.filter(e => {
      const t = new Date(e.timestamp).getTime();
      return t >= day48hAgo && t < day24hAgo;
    }).length;
    const eventsTrend = eventsPrev24h === 0 ? 0 : Math.round(((eventsLast24h - eventsPrev24h) / eventsPrev24h) * 100);

    const uniqueActors = new Set(entries.map(e => e.actorId)).size;
    const criticalEvents = entries.filter(e => e.severity === 'CRITICAL' || e.severity === 'EMERGENCY').length;
    const failedLogins = entries.filter(e => e.action === 'LOGIN_FAILED' || e.action === 'ACCOUNT_LOCKED').length;

    const riskScoreAvg = Math.round(entries.reduce((sum, e) => sum + e.riskScore, 0) / entries.length);

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    entries.forEach(e => {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category: category as AuditCategory,
        count,
        percentage: Math.round((count / entries.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Hourly distribution (last 24h)
    const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => {
      const count = entries.filter(e => {
        const d = new Date(e.timestamp);
        return d.getHours() === hour && d.getTime() >= day24hAgo;
      }).length;
      return { hour, count };
    });

    // Severity breakdown
    const severityCounts: Record<string, number> = {};
    entries.forEach(e => {
      severityCounts[e.severity] = (severityCounts[e.severity] || 0) + 1;
    });
    const severityBreakdown = (['INFO', 'WARNING', 'CRITICAL', 'EMERGENCY'] as AuditSeverity[]).map(severity => ({
      severity,
      count: severityCounts[severity] || 0,
      percentage: Math.round(((severityCounts[severity] || 0) / entries.length) * 100),
    }));

    // Top actors
    const actorCounts: Record<string, { name: string; email: string; count: number; totalRisk: number }> = {};
    entries.forEach(e => {
      if (!actorCounts[e.actorId]) {
        actorCounts[e.actorId] = { name: e.actorName, email: e.actorEmail, count: 0, totalRisk: 0 };
      }
      actorCounts[e.actorId].count++;
      actorCounts[e.actorId].totalRisk += e.riskScore;
    });
    const topActors = Object.values(actorCounts)
      .map(a => ({
        actorName: a.name,
        email: a.email,
        eventCount: a.count,
        riskScore: Math.round(a.totalRisk / a.count),
      }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 5);

    // Top resources
    const resourceCounts: Record<string, number> = {};
    entries.forEach(e => {
      resourceCounts[e.resourceType] = (resourceCounts[e.resourceType] || 0) + 1;
    });
    const topResources = Object.entries(resourceCounts)
      .map(([resourceType, count]) => ({ resourceType: resourceType as AuditResourceType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Region breakdown
    const regionCounts: Record<string, number> = {};
    entries.forEach(e => {
      regionCounts[e.region] = (regionCounts[e.region] || 0) + 1;
    });
    const regionBreakdown = Object.entries(regionCounts)
      .map(([region, count]) => ({
        region,
        count,
        percentage: Math.round((count / entries.length) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalEvents: entries.length,
      criticalEvents,
      uniqueActors,
      failedLogins,
      riskScoreAvg,
      eventsLast24h,
      eventsTrend,
      topCategories,
      hourlyDistribution,
      severityBreakdown,
      topActors,
      topResources,
      regionBreakdown,
    };
  }

  static async getTimelineGroups(filters?: Partial<AuditLogFilters>): Promise<AuditTimelineGroup[]> {
    const entries = await this.getEntries(filters);

    const groupsMap = new Map<string, AuditLogEntry[]>();

    entries.forEach(entry => {
      const date = entry.timestamp.split('T')[0];
      if (!groupsMap.has(date)) {
        groupsMap.set(date, []);
      }
      groupsMap.get(date)!.push(entry);
    });

    const groups: AuditTimelineGroup[] = [];
    groupsMap.forEach((groupEntries, date) => {
      const d = new Date(date + 'T12:00:00Z');
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);

      let label: string;
      if (diffDays === 0) label = 'Today';
      else if (diffDays === 1) label = 'Yesterday';
      else if (diffDays < 7) label = d.toLocaleDateString('en-US', { weekday: 'long' });
      else label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      groups.push({
        date,
        label,
        entries: groupEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        totalEvents: groupEntries.length,
        criticalCount: groupEntries.filter(e => e.severity === 'CRITICAL' || e.severity === 'EMERGENCY').length,
      });
    });

    return groups.sort((a, b) => b.date.localeCompare(a.date));
  }

  static async streamEvent(): Promise<AuditStreamEvent> {
    await new Promise(r => setTimeout(r, 200));
    const entry = generateMockEntry(0, new Date().toISOString());
    entry.timestamp = new Date().toISOString();

    return {
      type: 'NEW_ENTRY',
      entry,
      timestamp: new Date().toISOString(),
    };
  }

  static async getComplianceMappings(): Promise<ComplianceMapping[]> {
    await new Promise(r => setTimeout(r, 400));
    return [
      {
        framework: 'SOC 2',
        controlId: 'CC6.1',
        controlName: 'Logical Access Controls',
        description: 'System must log all authentication events and access control changes.',
        status: 'COMPLIANT',
        lastChecked: new Date().toISOString(),
        relevantCategories: ['AUTHENTICATION', 'AUTHORIZATION', 'SECURITY'],
      },
      {
        framework: 'SOC 2',
        controlId: 'CC7.2',
        controlName: 'Monitoring Activities',
        description: 'Security events must be monitored and alerts triggered for anomalies.',
        status: 'COMPLIANT',
        lastChecked: new Date().toISOString(),
        relevantCategories: ['SECURITY', 'SYSTEM_CONFIG'],
      },
      {
        framework: 'GDPR',
        controlId: 'Art. 30',
        controlName: 'Records of Processing Activities',
        description: 'Maintain a record of all data processing activities including exports.',
        status: 'COMPLIANT',
        lastChecked: new Date().toISOString(),
        relevantCategories: ['DATA_MODIFICATION', 'DATA_EXPORT', 'USER_MANAGEMENT'],
      },
      {
        framework: 'HIPAA',
        controlId: '§164.312(b)',
        controlName: 'Audit Controls',
        description: 'Implement hardware, software, and/or procedural mechanisms to record and examine activity.',
        status: 'PARTIAL',
        lastChecked: new Date().toISOString(),
        relevantCategories: ['AUTHENTICATION', 'DATA_MODIFICATION', 'DATA_EXPORT'],
      },
      {
        framework: 'ISO 27001',
        controlId: 'A.12.4',
        controlName: 'Logging and Monitoring',
        description: 'Event logs recording user activities, exceptions, and information security events.',
        status: 'COMPLIANT',
        lastChecked: new Date().toISOString(),
        relevantCategories: ['AUTHENTICATION', 'AUTHORIZATION', 'SYSTEM_CONFIG', 'SECURITY'],
      },
      {
        framework: 'PCI DSS',
        controlId: 'Req. 10.1',
        controlName: 'Audit Trail Implementation',
        description: 'Implement audit trails to link all access to system components to each individual user.',
        status: 'NON_COMPLIANT',
        lastChecked: new Date().toISOString(),
        relevantCategories: ['BILLING', 'DATA_MODIFICATION', 'API_ACCESS'],
      },
    ];
  }
}

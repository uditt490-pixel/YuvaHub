// ─── Audit Log Core Types ─────────────────────────────────────────────────────

export type AuditCategory =
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'DATA_MODIFICATION'
  | 'DATA_EXPORT'
  | 'USER_MANAGEMENT'
  | 'SYSTEM_CONFIG'
  | 'BILLING'
  | 'SECURITY'
  | 'API_ACCESS'
  | 'INTEGRATION';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'EXPORT'
  | 'IMPORT'
  | 'PERMISSION_CHANGE'
  | 'CONFIG_CHANGE'
  | 'ROLE_ASSIGN'
  | 'ROLE_REVOKE'
  | 'KEY_ROTATE'
  | 'KEY_REVOKE'
  | 'PAYMENT_PROCESSED'
  | 'SUBSCRIPTION_CHANGED'
  | 'WEBHOOK_FIRED'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'DATA_ACCESS'
  | 'BULK_UPDATE'
  | 'INTEGRATION_SYNC'
  | 'BACKUP_CREATED'
  | 'BACKUP_RESTORED'
  | 'FEATURE_FLAG_TOGGLED'
  | 'ENVIRONMENT_DEPLOYED';

export type AuditResourceType =
  | 'USER'
  | 'TEAM'
  | 'ROLE'
  | 'PERMISSION'
  | 'API_KEY'
  | 'BILLING_ACCOUNT'
  | 'SUBSCRIPTION'
  | 'FEATURE_FLAG'
  | 'INTEGRATION'
  | 'DATASET'
  | 'FILE'
  | 'WEBHOOK'
  | 'ENVIRONMENT'
  | 'AUDIT_LOG'
  | 'SESSION'
  | 'NOTIFICATION'
  | 'TEMPLATE'
  | 'POLICY';

export type ExportFormat = 'CSV' | 'JSON' | 'PDF';

export type TimeRange = '1H' | '6H' | '24H' | '7D' | '30D' | '90D' | 'CUSTOM';

export type SortDirection = 'ASC' | 'DESC';

// ─── Audit Log Entry ──────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  category: AuditCategory;
  severity: AuditSeverity;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  actorIp: string;
  actorUserAgent: string;
  description: string;
  metadata: Record<string, string | number | boolean>;
  previousValue?: string;
  newValue?: string;
  affectedUsers: string[];
  region: string;
  sessionId: string;
  requestId: string;
  riskScore: number; // 0-100
  geoLocation: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

// ─── Filter & Query Types ─────────────────────────────────────────────────────

export interface AuditLogFilters {
  searchQuery: string;
  categories: AuditCategory[];
  severities: AuditSeverity[];
  actions: AuditAction[];
  resourceTypes: AuditResourceType[];
  timeRange: TimeRange;
  customDateFrom: string;
  customDateTo: string;
  actorSearch: string;
  resourceSearch: string;
  minRiskScore: number;
  maxRiskScore: number;
  sortBy: keyof AuditLogEntry;
  sortDirection: SortDirection;
}

export interface AuditLogExportConfig {
  format: ExportFormat;
  filters: AuditLogFilters;
  includeMetadata: boolean;
  includeActorDetails: boolean;
  maxRows: number;
}

// ─── Metrics & Aggregations ───────────────────────────────────────────────────

export interface AuditMetrics {
  totalEvents: number;
  criticalEvents: number;
  uniqueActors: number;
  failedLogins: number;
  riskScoreAvg: number;
  eventsLast24h: number;
  eventsTrend: number; // percentage change vs previous period
  topCategories: Array<{ category: AuditCategory; count: number; percentage: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  severityBreakdown: Array<{ severity: AuditSeverity; count: number; percentage: number }>;
  topActors: Array<{ actorName: string; email: string; eventCount: number; riskScore: number }>;
  topResources: Array<{ resourceType: AuditResourceType; count: number }>;
  regionBreakdown: Array<{ region: string; count: number; percentage: number }>;
}

// ─── Timeline Group ───────────────────────────────────────────────────────────

export interface AuditTimelineGroup {
  date: string;
  label: string;
  entries: AuditLogEntry[];
  totalEvents: number;
  criticalCount: number;
}

// ─── Real-time Stream ─────────────────────────────────────────────────────────

export interface AuditStreamEvent {
  type: 'NEW_ENTRY' | 'ENTRY_UPDATED' | 'METRICS_UPDATE';
  entry?: AuditLogEntry;
  metrics?: Partial<AuditMetrics>;
  timestamp: string;
}

// ─── Compliance Mapping ───────────────────────────────────────────────────────

export interface ComplianceMapping {
  framework: string;
  controlId: string;
  controlName: string;
  description: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL' | 'NOT_APPLICABLE';
  lastChecked: string;
  relevantCategories: AuditCategory[];
}

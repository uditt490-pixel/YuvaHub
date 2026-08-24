// ═══════════════════════════════════════════════════════════════════
// Enterprise Observability & Uptime Monitor — Type Definitions
// ═══════════════════════════════════════════════════════════════════

export type ServiceStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';
export type IncidentSeverity = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
export type IncidentState = 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'closed';
export type MetricUnit = 'ms' | 'req/s' | 'count' | 'percent' | 'bytes' | 'errors/min';
export type AlertChannel = 'slack' | 'email' | 'pagerduty' | 'webhook' | 'sms';

export interface MonitoredService {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  group: string;
  url?: string;
  port?: number;
  healthCheckEndpoint: string;
  healthCheckIntervalMs: number;
  lastHealthCheck: string;
  uptimePercentage30d: number;
  uptimePercentage90d: number;
  responseTimeMs: number;
  errorRate: number;
  requestRate: number;
  dependencies: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceGroup {
  id: string;
  name: string;
  description: string;
  serviceIds: string[];
  aggregateStatus: ServiceStatus;
}

export interface UptimeRecord {
  id: string;
  serviceId: string;
  timestamp: string;
  status: ServiceStatus;
  responseTimeMs: number;
  statusCode: number;
  errorMessage?: string;
  region: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  state: IncidentState;
  affectedServiceIds: string[];
  impactSummary: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  createdBy: string;
  assignees: string[];
  timeline: IncidentUpdate[];
  rootCause?: string;
  postMortemUrl?: string;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  timestamp: string;
  state: IncidentState;
  message: string;
  author: string;
  isPublic: boolean;
}

export interface SystemMetric {
  id: string;
  serviceId: string;
  name: string;
  value: number;
  unit: MetricUnit;
  timestamp: string;
  labels: Record<string, string>;
}

export interface MetricTimeSeries {
  metricName: string;
  unit: MetricUnit;
  dataPoints: Array<{
    timestamp: string;
    value: number;
    labels?: Record<string, string>;
  }>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  serviceId: string;
  metricName: string;
  condition: 'above' | 'below' | 'equals' | 'not_equals';
  threshold: number;
  durationSeconds: number;
  severity: IncidentSeverity;
  channels: AlertChannel[];
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
}

export interface SLATarget {
  id: string;
  serviceId: string;
  name: string;
  targetUptime: number;
  targetResponseTimeMs: number;
  targetErrorRate: number;
  currentUptime: number;
  currentResponseTimeMs: number;
  currentErrorRate: number;
  periodDays: number;
  status: 'meeting' | 'at_risk' | 'breached';
  burnRate?: number;
  errorBudgetRemaining: number;
  errorBudgetTotal: number;
  periodStart: string;
  periodEnd: string;
}

export interface DependencyNode {
  id: string;
  name: string;
  status: ServiceStatus;
  type: 'service' | 'database' | 'cache' | 'queue' | 'external';
  latencyMs: number;
}

export interface DependencyEdge {
  source: string;
  target: string;
  latencyMs: number;
  errorRate: number;
  callsPerSecond: number;
}

export interface ObservabilityState {
  services: MonitoredService[];
  groups: ServiceGroup[];
  incidents: Incident[];
  activeIncidents: Incident[];
  resolvedIncidents: Incident[];
  metrics: SystemMetric[];
  alertRules: AlertRule[];
  slaTargets: SLATarget[];
  dependencies: { nodes: DependencyNode[]; edges: DependencyEdge[] };
  isLoading: boolean;
  error: string | null;
  selectedServiceId: string | null;
  selectedIncidentId: string | null;
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
  searchQuery: string;
}

export interface FilterState {
  statusFilter: ServiceStatus | 'all';
  severityFilter: IncidentSeverity | 'all';
  groupFilter: string;
  searchQuery: string;
  timeRange: '1h' | '6h' | '24h' | '7d' | '30d';
}

export interface OverallHealthScore {
  score: number;
  totalServices: number;
  operationalCount: number;
  degradedCount: number;
  outageCount: number;
  maintenanceCount: number;
  averageResponseTime: number;
  averageUptime: number;
  openIncidents: number;
  criticalIncidents: number;
}

// ═══════════════════════════════════════════════════════════════════
// Enterprise Observability & Uptime Monitor — Service Layer
// ═══════════════════════════════════════════════════════════════════

import {
  MonitoredService, ServiceGroup, Incident, IncidentUpdate, IncidentSeverity,
  IncidentState, UptimeRecord, SystemMetric, MetricTimeSeries, AlertRule,
  SLATarget, DependencyNode, DependencyEdge, FilterState, OverallHealthScore,
  ServiceStatus, AlertChannel
} from '../types/observability';

// ─── Mock Data Generators ────────────────────────────────────────

const SERVICE_NAMES = [
  'API Gateway', 'Auth Service', 'User Service', 'Payment Processor',
  'Notification Engine', 'Email Service', 'Search Index', 'Cache Layer',
  'Database Primary', 'Database Replica', 'File Storage', 'CDN Edge',
  'Analytics Pipeline', 'Recommendation Engine', 'Rate Limiter',
  'WebSocket Hub', 'Cron Scheduler', 'Log Aggregator', 'Metrics Collector'
];

const SERVICE_GROUPS: ServiceGroup[] = [
  { id: 'grp-core', name: 'Core Infrastructure', description: 'Primary platform services', serviceIds: ['svc-1', 'svc-2', 'svc-3', 'svc-12'], aggregateStatus: 'operational' },
  { id: 'grp-data', name: 'Data Layer', description: 'Database and caching services', serviceIds: ['svc-8', 'svc-9', 'svc-10', 'svc-11'], aggregateStatus: 'degraded' },
  { id: 'grp-comm', name: 'Communication', description: 'Notification and messaging services', serviceIds: ['svc-5', 'svc-6', 'svc-16'], aggregateStatus: 'operational' },
  { id: 'grp-analytics', name: 'Analytics & ML', description: 'Analytics and recommendation services', serviceIds: ['svc-13', 'svc-14', 'svc-18', 'svc-19'], aggregateStatus: 'operational' },
  { id: 'grp-infra', name: 'Platform Infrastructure', description: 'Supporting infrastructure services', serviceIds: ['svc-7', 'svc-15', 'svc-17'], aggregateStatus: 'operational' }
];

const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1'];

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
  return date.toISOString();
}

const STATUS_OPTIONS: ServiceStatus[] = ['operational', 'operational', 'operational', 'operational', 'degraded', 'partial_outage', 'maintenance'];

function generateServices(): MonitoredService[] {
  return SERVICE_NAMES.map((name, idx) => {
    const status = idx === 8 ? 'degraded' : randomChoice(STATUS_OPTIONS);
    const deps = idx > 2 ? Array.from({ length: randomBetween(1, 3) }, (_, i) => `svc-${randomBetween(1, idx)}`) : [];
    const uniqueDeps = [...new Set(deps)].filter(d => d !== `svc-${idx + 1}`);
    return {
      id: `svc-${idx + 1}`,
      name,
      description: `${name} — handles ${name.toLowerCase()} operations for the platform`,
      status,
      group: randomChoice(SERVICE_GROUPS).id,
      url: `https://${name.toLowerCase().replace(/\s+/g, '-')}.yuva-hub.com`,
      port: 3000 + idx,
      healthCheckEndpoint: `/health`,
      healthCheckIntervalMs: randomChoice([10000, 15000, 30000, 60000]),
      lastHealthCheck: randomDate(0),
      uptimePercentage30d: status === 'operational' ? randomFloat(99.5, 99.99) : randomFloat(95.0, 99.4),
      uptimePercentage90d: status === 'operational' ? randomFloat(99.7, 99.99) : randomFloat(96.0, 99.5),
      responseTimeMs: status === 'operational' ? randomBetween(15, 180) : randomBetween(200, 2500),
      errorRate: status === 'operational' ? randomFloat(0, 0.5) : randomFloat(1.0, 15.0),
      requestRate: randomBetween(50, 5000),
      dependencies: uniqueDeps,
      tags: ['production', 'v2', idx < 5 ? 'critical' : 'standard'],
      createdAt: randomDate(365),
      updatedAt: randomDate(7)
    };
  });
}

function generateIncidents(): Incident[] {
  const titles = [
    { title: 'Elevated error rates on Payment Processor', severity: 'P1' as IncidentSeverity, state: 'investigating' as IncidentState },
    { title: 'Database primary replication lag exceeds 5s', severity: 'P2' as IncidentSeverity, state: 'identified' as IncidentState },
    { title: 'Cache Layer memory pressure detected', severity: 'P2' as IncidentSeverity, state: 'monitoring' as IncidentState },
    { title: 'Scheduled maintenance: CDN SSL certificate rotation', severity: 'P4' as IncidentSeverity, state: 'resolved' as IncidentState },
    { title: 'Auth Service latency spike in ap-south-1', severity: 'P3' as IncidentSeverity, state: 'resolved' as IncidentState },
    { title: 'Notification Engine message queue backlog', severity: 'P1' as IncidentSeverity, state: 'closed' as IncidentState },
    { title: 'Search Index reindexing failed mid-operation', severity: 'P2' as IncidentSeverity, state: 'resolved' as IncidentState },
    { title: 'Rate Limiter false positives blocking legitimate traffic', severity: 'P3' as IncidentSeverity, state: 'closed' as IncidentState }
  ];

  const states: IncidentState[] = ['investigating', 'identified', 'monitoring', 'resolved', 'closed'];

  return titles.map((item, idx) => {
    const createdAt = randomDate(30);
    const affectedServices = [`svc-${randomBetween(1, 19)}`, `svc-${randomBetween(1, 19)}`];
    const uniqueServices = [...new Set(affectedServices)];
    const timeline: IncidentUpdate[] = states.slice(0, states.indexOf(item.state) + 1).map((state, tIdx) => ({
      id: generateId('upd'),
      incidentId: `inc-${idx + 1}`,
      timestamp: new Date(new Date(createdAt).getTime() + tIdx * 1800000).toISOString(),
      state,
      message: getIncidentUpdateMessage(state),
      author: randomChoice(['ops-bot', 'sarah.k', 'devops-lead', 'platform-team']),
      isPublic: state !== 'investigating'
    }));

    return {
      id: `inc-${idx + 1}`,
      title: item.title,
      description: `Automated detection: ${item.title}. Initial triage performed by ${randomChoice(['ops-bot', 'sarah.k', 'devops-lead'])}.`,
      severity: item.severity,
      state: item.state,
      affectedServiceIds: uniqueServices,
      impactSummary: item.state === 'resolved' || item.state === 'closed'
        ? 'No ongoing impact. Service fully recovered.'
        : `Impact: ${randomChoice(['Elevated latency', 'Intermittent errors', 'Reduced throughput', 'Partial unavailability'])} affecting ~${randomBetween(5, 35)}% of requests.`,
      createdAt,
      updatedAt: randomDate(1),
      resolvedAt: item.state === 'resolved' || item.state === 'closed' ? randomDate(1) : undefined,
      closedAt: item.state === 'closed' ? randomDate(0) : undefined,
      createdBy: randomChoice(['ops-bot', 'sarah.k', 'devops-lead']),
      assignees: [randomChoice(['sarah.k', 'devops-lead', 'platform-team']), randomChoice(['ops-bot', 'backend-sre'])],
      timeline,
      rootCause: item.state === 'resolved' || item.state === 'closed'
        ? randomChoice([
            'Root cause identified as a misconfigured connection pool limit following the last deployment.',
            'Memory leak in the connection handler was patched in hotfix v2.14.3.',
            'DNS resolution failure in the target region due to upstream provider outage.',
            'Configuration drift between staging and production environments.',
            'Unoptimized database query causing full table scans under high load.'
          ])
        : undefined,
      postMortemUrl: item.state === 'closed' ? `https://docs.yuva-hub.com/postmortems/inc-${idx + 1}` : undefined
    };
  });
}

function getIncidentUpdateMessage(state: IncidentState): string {
  const messages: Record<IncidentState, string[]> = {
    investigating: [
      'We are investigating reports of elevated error rates. More updates to follow.',
      'Automated alerting triggered. Team is actively investigating.',
      'Received multiple alerts for this service. Investigating root cause.'
    ],
    identified: [
      'Root cause identified as a downstream dependency failure. Working on remediation.',
      'Issue traced to a configuration change in the last deployment. Rolling back.',
      'Identified the problematic component. Applying fix now.'
    ],
    monitoring: [
      'Fix deployed. Monitoring service recovery across all regions.',
      'Recovery in progress. Monitoring for 30 minutes before closing.',
      'Metrics returning to normal. Continued monitoring for stability.'
    ],
    resolved: [
      'Service fully recovered. All metrics back to baseline.',
      'Incident resolved. Post-mortem to follow within 48 hours.',
      'No further impact observed. Incident marked as resolved.'
    ],
    closed: [
      'Post-mortem published. Preventive measures implemented.',
      'Incident closed. Alert rules updated to catch this issue earlier.',
      'Final review completed. No further action required.'
    ]
  };
  return randomChoice(messages[state]);
}

function generateTimeSeries(metricName: string, unit: string, min: number, max: number, points: number = 60): MetricTimeSeries {
  const dataPoints = Array.from({ length: points }, (_, i) => ({
    timestamp: new Date(Date.now() - (points - i) * 60000).toISOString(),
    value: randomFloat(min, max)
  }));
  return { metricName, unit: unit as any, dataPoints };
}

function generateAlertRules(): AlertRule[] {
  const rules: Array<{ name: string; metric: string; cond: 'above' | 'below'; threshold: number; severity: IncidentSeverity; channels: AlertChannel[] }> = [
    { name: 'High Error Rate', metric: 'error_rate', cond: 'above', threshold: 5.0, severity: 'P1', channels: ['slack', 'pagerduty'] },
    { name: 'Slow Response Time', metric: 'response_time_p99', cond: 'above', threshold: 2000, severity: 'P2', channels: ['slack'] },
    { name: 'Low Uptime', metric: 'uptime', cond: 'below', threshold: 99.0, severity: 'P1', channels: ['slack', 'email', 'pagerduty'] },
    { name: 'Request Rate Drop', metric: 'request_rate', cond: 'below', threshold: 10, severity: 'P3', channels: ['slack'] },
    { name: 'Memory High Usage', metric: 'memory_usage', cond: 'above', threshold: 85, severity: 'P2', channels: ['slack', 'email'] },
    { name: 'Queue Depth Critical', metric: 'queue_depth', cond: 'above', threshold: 10000, severity: 'P1', channels: ['slack', 'pagerduty', 'sms'] }
  ];

  return rules.map((r, idx) => ({
    id: `alert-${idx + 1}`,
    name: r.name,
    description: `Alert when ${r.metric} is ${r.cond} ${r.threshold}`,
    serviceId: idx < SERVICE_NAMES.length ? `svc-${idx + 1}` : 'svc-1',
    metricName: r.metric,
    condition: r.cond,
    threshold: r.threshold,
    durationSeconds: randomChoice([60, 120, 300, 600]),
    severity: r.severity,
    channels: r.channels,
    enabled: idx < 4,
    lastTriggered: idx < 2 ? randomDate(3) : undefined,
    triggerCount: randomBetween(0, 47),
    createdAt: randomDate(90)
  }));
}

function generateSLATargets(): SLATarget[] {
  return SERVICE_NAMES.slice(0, 12).map((name, idx) => {
    const targetUptime = idx < 5 ? 99.95 : 99.9;
    const currentUptime = idx === 8 ? 98.7 : randomFloat(targetUptime - 0.1, 99.99);
    const targetRT = idx < 5 ? 100 : 200;
    const currentRT = idx === 8 ? randomBetween(800, 2500) : randomBetween(15, targetRT + 50);
    const errorBudgetTotal = (100 - targetUptime);
    const errorBudgetUsed = Math.max(0, errorBudgetTotal - (100 - currentUptime));
    const errorBudgetRemaining = Math.max(0, errorBudgetTotal - errorBudgetUsed);
    const status = currentUptime >= targetUptime ? 'meeting' : currentUptime >= targetUptime - 0.05 ? 'at_risk' : 'breached';

    return {
      id: `sla-${idx + 1}`,
      serviceId: `svc-${idx + 1}`,
      name: `${name} SLA`,
      targetUptime,
      targetResponseTimeMs: targetRT,
      targetErrorRate: idx < 5 ? 0.5 : 1.0,
      currentUptime,
      currentResponseTimeMs: currentRT,
      currentErrorRate: idx === 8 ? randomFloat(2, 8) : randomFloat(0, 0.8),
      periodDays: 30,
      status: status as 'meeting' | 'at_risk' | 'breached',
      burnRate: status === 'breached' ? randomFloat(2.0, 8.0) : randomFloat(0.1, 1.2),
      errorBudgetRemaining,
      errorBudgetTotal,
      periodStart: new Date(Date.now() - 30 * 86400000).toISOString(),
      periodEnd: new Date().toISOString()
    };
  });
}

function generateDependencies(): { nodes: DependencyNode[]; edges: DependencyEdge[] } {
  const nodes: DependencyNode[] = SERVICE_NAMES.map((name, idx) => ({
    id: `svc-${idx + 1}`,
    name,
    status: idx === 8 ? 'degraded' : randomChoice(['operational', 'operational', 'operational']),
    type: idx === 8 || idx === 9 ? 'database' : idx === 10 ? 'cache' : idx === 11 ? 'queue' : idx === 12 ? 'external' : 'service',
    latencyMs: idx === 8 ? randomBetween(50, 500) : randomBetween(5, 100)
  }));

  const edges: DependencyEdge[] = [];
  SERVICE_NAMES.forEach((_, idx) => {
    const deps = idx > 2 ? generateServices()[idx].dependencies : [];
    deps.forEach(depId => {
      edges.push({
        source: `svc-${idx + 1}`,
        target: depId,
        latencyMs: randomBetween(2, 150),
        errorRate: randomFloat(0, 2),
        callsPerSecond: randomBetween(10, 2000)
      });
    });
  });

  return { nodes, edges };
}

// ─── Main Service ────────────────────────────────────────────────

export class ObservabilityService {
  private static services: MonitoredService[] = generateServices();
  private static incidents: Incident[] = generateIncidents();
  private static alertRules: AlertRule[] = generateAlertRules();
  private static slaTargets: SLATarget[] = generateSLATargets();
  private static dependencies = generateDependencies();

  static async getServices(filters: FilterState): Promise<MonitoredService[]> {
    await new Promise(r => setTimeout(r, 300));
    let result = [...this.services];
    if (filters.statusFilter !== 'all') {
      result = result.filter(s => s.status === filters.statusFilter);
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (filters.groupFilter) {
      const group = SERVICE_GROUPS.find(g => g.id === filters.groupFilter);
      if (group) result = result.filter(s => group.serviceIds.includes(s.id));
    }
    return result;
  }

  static async getGroups(): Promise<ServiceGroup[]> {
    await new Promise(r => setTimeout(r, 200));
    return [...SERVICE_GROUPS];
  }

  static async getIncidents(filters: FilterState): Promise<Incident[]> {
    await new Promise(r => setTimeout(r, 300));
    let result = [...this.incidents];
    if (filters.severityFilter !== 'all') {
      result = result.filter(i => i.severity === filters.severityFilter);
    }
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }
    return result;
  }

  static async getIncidentById(id: string): Promise<Incident | undefined> {
    await new Promise(r => setTimeout(r, 150));
    return this.incidents.find(i => i.id === id);
  }

  static async getMetrics(serviceId: string, timeRange: string): Promise<MetricTimeSeries[]> {
    await new Promise(r => setTimeout(r, 400));
    const points = timeRange === '1h' ? 60 : timeRange === '6h' ? 72 : timeRange === '24h' ? 96 : timeRange === '7d' ? 84 : 90;
    return [
      generateTimeSeries('response_time_p50', 'ms', 20, 200, points),
      generateTimeSeries('response_time_p99', 'ms', 100, 2000, points),
      generateTimeSeries('error_rate', 'percent', 0, 5, points),
      generateTimeSeries('request_rate', 'req/s', 100, 5000, points)
    ];
  }

  static async getUptimeHistory(serviceId: string, days: number): Promise<UptimeRecord[]> {
    await new Promise(r => setTimeout(r, 300));
    return Array.from({ length: days }, (_, i) => ({
      id: generateId('up'),
      serviceId,
      timestamp: new Date(Date.now() - (days - i) * 86400000).toISOString(),
      status: randomChoice(['operational', 'operational', 'operational', 'degraded']) as ServiceStatus,
      responseTimeMs: randomBetween(15, 300),
      statusCode: randomChoice([200, 200, 200, 200, 201, 500, 503]),
      region: randomChoice(REGIONS)
    }));
  }

  static async getAlertRules(): Promise<AlertRule[]> {
    await new Promise(r => setTimeout(r, 200));
    return [...this.alertRules];
  }

  static async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'triggerCount'>): Promise<AlertRule> {
    await new Promise(r => setTimeout(r, 300));
    const newRule: AlertRule = {
      ...rule,
      id: generateId('alert'),
      triggerCount: 0,
      createdAt: new Date().toISOString()
    };
    this.alertRules.push(newRule);
    return newRule;
  }

  static async deleteAlertRule(id: string): Promise<boolean> {
    await new Promise(r => setTimeout(r, 200));
    this.alertRules = this.alertRules.filter(r => r.id !== id);
    return true;
  }

  static async toggleAlertRule(id: string, enabled: boolean): Promise<AlertRule | undefined> {
    await new Promise(r => setTimeout(r, 200));
    const rule = this.alertRules.find(r => r.id === id);
    if (rule) rule.enabled = enabled;
    return rule;
  }

  static async getSLATargets(): Promise<SLATarget[]> {
    await new Promise(r => setTimeout(r, 300));
    return [...this.slaTargets];
  }

  static async getDependencies(): Promise<{ nodes: DependencyNode[]; edges: DependencyEdge[] }> {
    await new Promise(r => setTimeout(r, 400));
    return { ...this.dependencies };
  }

  static async getHealthScore(): Promise<OverallHealthScore> {
    await new Promise(r => setTimeout(r, 250));
    const operational = this.services.filter(s => s.status === 'operational').length;
    const degraded = this.services.filter(s => s.status === 'degraded').length;
    const outage = this.services.filter(s => s.status === 'partial_outage' || s.status === 'major_outage').length;
    const maintenance = this.services.filter(s => s.status === 'maintenance').length;
    const activeIncidents = this.incidents.filter(i => i.state !== 'resolved' && i.state !== 'closed');
    const criticalIncidents = activeIncidents.filter(i => i.severity === 'P0' || i.severity === 'P1');
    const avgResponse = Math.round(this.services.reduce((a, s) => a + s.responseTimeMs, 0) / this.services.length);
    const avgUptime = parseFloat((this.services.reduce((a, s) => a + s.uptimePercentage30d, 0) / this.services.length).toFixed(3));
    const score = Math.round((operational / this.services.length) * 100 - criticalIncidents.length * 5);

    return {
      score: Math.max(0, Math.min(100, score)),
      totalServices: this.services.length,
      operationalCount: operational,
      degradedCount: degraded,
      outageCount: outage,
      maintenanceCount: maintenance,
      averageResponseTime: avgResponse,
      averageUptime: avgUptime,
      openIncidents: activeIncidents.length,
      criticalIncidents: criticalIncidents.length
    };
  }

  static async acknowledgeIncident(incidentId: string, assignee: string): Promise<Incident | undefined> {
    await new Promise(r => setTimeout(r, 300));
    const incident = this.incidents.find(i => i.id === incidentId);
    if (incident && !incident.assignees.includes(assignee)) {
      incident.assignees.push(assignee);
    }
    return incident;
  }
}

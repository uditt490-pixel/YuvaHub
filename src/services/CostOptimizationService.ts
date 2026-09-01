// ═══════════════════════════════════════════════════════════════════
// Enterprise Cost Optimization & Cloud Spend Analytics — Service
// ═══════════════════════════════════════════════════════════════════

import {
  CloudResource, CloudProvider, CostCategory, CostRecommendation, RecommendationType,
  RecommendationStatus, CostBudget, BudgetPeriod, CostAlert, AlertSeverity,
  SpendTimeSeries, CostMetrics
} from '../types/costOptimization';

const gid = (p: string) => `${p}-${Math.random().toString(36).substring(2, 10)}`;
const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const randf = (a: number, b: number, d = 2) => parseFloat((Math.random() * (b - a) + a).toFixed(d));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const dstr = (d: number) => { const dt = new Date(); dt.setDate(dt.getDate() - rand(0, Math.abs(d))); dt.setHours(rand(0, 23)); return dt.toISOString(); };

const PROVIDERS: CloudProvider[] = ['aws', 'gcp', 'azure', 'alibaba', 'self_hosted'];
const CATEGORIES: CostCategory[] = ['compute', 'storage', 'network', 'database', 'serverless', 'cdn', 'monitoring', 'security', 'ai_ml', 'other'];
const SERVICES: Record<CloudProvider, string[]> = {
  aws: ['EC2', 'S3', 'RDS', 'Lambda', 'CloudFront', 'ElastiCache', 'SQS', 'DynamoDB', 'EKS', 'SageMaker'],
  gcp: ['GCE', 'GCS', 'Cloud SQL', 'Cloud Functions', 'Cloud CDN', 'Memorystore', 'Pub/Sub', 'BigQuery', 'GKE', 'Vertex AI'],
  azure: ['VM', 'Blob Storage', 'SQL Database', 'Functions', 'CDN', 'Redis Cache', 'Service Bus', 'Cosmos DB', 'AKS', 'Azure ML'],
  alibaba: ['ECS', 'OSS', 'RDS', 'Function Compute', 'CDN', 'ApsaraDB for Redis', 'Message Queue', 'PolarDB', 'ACK', 'Machine Learning Platform for AI'],
  self_hosted: ['K8s Nodes', 'PostgreSQL', 'Redis', 'Nginx', 'MinIO', 'RabbitMQ', 'Prometheus', 'Grafana', 'Jenkins', 'GitLab']
};
const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'ap-northeast-1', 'eu-central-1'];

function genResources(): CloudResource[] {
  const resources: CloudResource[] = [];
  let id = 1;
  for (const provider of PROVIDERS) {
    for (let i = 0; i < 8; i++) {
      const svc = pick(SERVICES[provider]);
      const cat = pick(CATEGORIES);
      const cost = randf(5, 8000);
      const prevCost = cost * randf(0.7, 1.3);
      resources.push({
        id: `res-${String(id++).padStart(3, '0')}`, name: `${svc}-${pick(['prod', 'staging', 'dev', 'test'])}-${pick(['a', 'b', 'c', '01', '02'])}`,
        provider, category: cat, service: svc, region: pick(REGIONS),
        monthlyCost: cost, previousMonthCost: prevCost,
        costTrend: ((cost - prevCost) / prevCost) * 100,
        utilizationPercent: randf(0, 100), idleHours24h: rand(0, 24),
        tags: [provider, cat, pick(['production', 'staging', 'development'])],
        status: pick(['active', 'active', 'active', 'idle', 'reserved', 'spot']),
        createdAt: dstr(365), lastActivity: dstr(14)
      });
    }
  }
  return resources;
}

function genRecommendations(resources: CloudResource[]): CostRecommendation[] {
  return Array.from({ length: 15 }, (_, i) => {
    const res = pick(resources);
    const type = pick(['rightsize', 'reserved_instance', 'spot_instance', 'delete', 'archive', 'downgrade', 'schedule', 'migrate'] as RecommendationType[]);
    return {
      id: gid('rec'), title: `${type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}: ${res.name}`,
      description: `Recommendation to ${type.replace(/_/g, ' ')} ${res.name} to reduce cloud spend.`,
      type, severity: pick(['P0', 'P1', 'P2', 'P3'] as AlertSeverity[]),
      resourceId: res.id, resourceName: res.name, provider: res.provider, category: res.category,
      estimatedSavings: randf(10, 5000), estimatedSavingsPercent: randf(5, 60),
      implementationEffort: pick(['low', 'medium', 'high']),
      status: pick(['pending', 'pending', 'accepted', 'dismissed', 'implemented'] as RecommendationStatus[]),
      riskScore: randf(5, 80), createdAt: dstr(30), validUntil: dstr(-30)
    };
  });
}

function genBudgets(): CostBudget[] {
  return [...CATEGORIES.slice(0, 6).map(cat => ({
    id: gid('bud'), name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Budget`, category: cat as CostCategory,
    provider: 'all' as CloudProvider | 'all', limitAmount: rand(5000, 50000),
    spentAmount: rand(1000, 55000), period: 'monthly' as BudgetPeriod,
    alertThresholdPercent: 80, currentUsagePercent: 0, forecastedAmount: 0,
    startDate: dstr(30), endDate: dstr(-30), isOverBudget: false
  })), ...PROVIDERS.slice(0, 3).map(prov => ({
    id: gid('bud'), name: `${prov.toUpperCase()} Cloud Budget`, category: 'all' as CostCategory,
    provider: prov, limitAmount: rand(20000, 100000),
    spentAmount: rand(10000, 110000), period: 'monthly' as BudgetPeriod,
    alertThresholdPercent: 80, currentUsagePercent: 0, forecastedAmount: 0,
    startDate: dstr(30), endDate: dstr(-30), isOverBudget: false
  }))];
}

function finalizeBudgets(budgets: CostBudget[]): CostBudget[] {
  return budgets.map(b => {
    b.currentUsagePercent = parseFloat(((b.spentAmount / b.limitAmount) * 100).toFixed(1));
    b.forecastedAmount = b.spentAmount * randf(1.0, 1.3);
    b.isOverBudget = b.spentAmount > b.limitAmount;
    return b;
  });
}

function genAlerts(): CostAlert[] {
  return Array.from({ length: 10 }, () => ({
    id: gid('alert'), title: pick(['Monthly budget exceeded', 'Sudden cost spike detected', 'Idle resources wasting $500+', 'Forecast exceeds budget', 'Unusual API call volume', 'Reserved instance expiring']),
    description: 'Automated cost anomaly detection triggered.',
    severity: pick(['P0', 'P1', 'P2', 'P3'] as AlertSeverity[]),
    category: pick(CATEGORIES), provider: pick(PROVIDERS.slice(0, 3)),
    type: pick(['budget_exceeded', 'spike_detected', 'anomaly', 'waste_detected', 'forecast_exceeded'] as const),
    status: pick(['open', 'open', 'investigating', 'resolved', 'dismissed'] as const),
    amount: randf(50, 15000), createdAt: dstr(14)
  }));
}

function genTraffic(): SpendTimeSeries[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (30 - i));
    return {
      date: d.toISOString().split('T')[0],
      aws: randf(800, 3000), gcp: randf(300, 1500), azure: randf(200, 800), total: 0
    };
  }).map(t => ({ ...t, total: t.aws + t.gcp + t.azure }));
}

function genMetrics(resources: CloudResource[], recs: CostRecommendation[], alerts: CostAlert[]): CostMetrics {
  const totalMTD = resources.reduce((a, r) => a + r.monthlyCost, 0);
  const totalPrev = resources.reduce((a, r) => a + r.previousMonthCost, 0);
  return {
    totalSpendMTD: totalMTD, totalSpendLastMonth: totalPrev,
    spendChangePercent: ((totalMTD - totalPrev) / totalPrev) * 100,
    totalSavingsRealized: recs.filter(r => r.status === 'implemented').reduce((a, r) => a + r.estimatedSavings, 0),
    pendingSavings: recs.filter(r => r.status === 'pending').reduce((a, r) => a + r.estimatedSavings, 0),
    activeResources: resources.filter(r => r.status === 'active').length,
    idleResources: resources.filter(r => r.utilizationPercent < 10).length,
    wastePercent: randf(5, 25), forecastEndMonth: totalMTD * randf(1.0, 1.15),
    budgetUsedPercent: randf(55, 95), openAlerts: alerts.filter(a => a.status === 'open').length,
    criticalAlerts: alerts.filter(a => a.severity === 'P0' || a.severity === 'P1').length
  };
}

export class CostOptimizationService {
  private static resources = genResources();
  private static recs = genRecommendations(this.resources);
  private static budgets = finalizeBudgets(genBudgets());
  private static alerts = genAlerts();
  private static traffic = genTraffic();
  private static metrics = genMetrics(this.resources, this.recs, this.alerts);

  static async getMetrics() { await new Promise(r => setTimeout(r, 200)); return { ...this.metrics }; }
  static async getResources() { await new Promise(r => setTimeout(r, 300)); return [...this.resources]; }
  static async getRecommendations() { await new Promise(r => setTimeout(r, 250)); return [...this.recs]; }
  static async getBudgets() { await new Promise(r => setTimeout(r, 200)); return [...this.budgets]; }
  static async getAlerts() { await new Promise(r => setTimeout(r, 200)); return [...this.alerts]; }
  static async getTraffic() { await new Promise(r => setTimeout(r, 300)); return [...this.traffic]; }
  static async acceptRec(id: string) { await new Promise(r => setTimeout(r, 150)); const r = this.recs.find(x => x.id === id); if (r) r.status = 'accepted'; return r; }
  static async dismissRec(id: string) { await new Promise(r => setTimeout(r, 150)); const r = this.recs.find(x => x.id === id); if (r) r.status = 'dismissed'; return r; }
}

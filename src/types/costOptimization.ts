// ═══════════════════════════════════════════════════════════════════
// Enterprise Cost Optimization & Cloud Spend Analytics — Types
// ═══════════════════════════════════════════════════════════════════

export type CloudProvider = 'aws' | 'gcp' | 'azure' | 'alibaba' | 'self_hosted';
export type CostCategory = 'compute' | 'storage' | 'network' | 'database' | 'serverless' | 'cdn' | 'monitoring' | 'security' | 'ai_ml' | 'other';
export type RecommendationType = 'rightsize' | 'reserved_instance' | 'spot_instance' | 'delete' | 'archive' | ' downgrade' | 'schedule' | 'migrate';
export type RecommendationStatus = 'pending' | 'accepted' | 'dismissed' | 'implemented' | 'expired';
export type AlertSeverity = 'P0' | 'P1' | 'P2' | 'P3';
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface CloudResource {
  id: string;
  name: string;
  provider: CloudProvider;
  category: CostCategory;
  service: string;
  region: string;
  monthlyCost: number;
  previousMonthCost: number;
  costTrend: number;
  utilizationPercent: number;
  idleHours24h: number;
  tags: string[];
  status: 'active' | 'idle' | 'terminated' | 'reserved' | 'spot';
  createdAt: string;
  lastActivity: string;
}

export interface CostRecommendation {
  id: string;
  title: string;
  description: string;
  type: RecommendationType;
  severity: AlertSeverity;
  resourceId: string;
  resourceName: string;
  provider: CloudProvider;
  category: CostCategory;
  estimatedSavings: number;
  estimatedSavingsPercent: number;
  implementationEffort: 'low' | 'medium' | 'high';
  status: RecommendationStatus;
  riskScore: number;
  createdAt: string;
  validUntil: string;
}

export interface CostBudget {
  id: string;
  name: string;
  category: CostCategory | 'all';
  provider: CloudProvider | 'all';
  limitAmount: number;
  spentAmount: number;
  period: BudgetPeriod;
  alertThresholdPercent: number;
  currentUsagePercent: number;
  forecastedAmount: number;
  startDate: string;
  endDate: string;
  isOverBudget: boolean;
}

export interface CostAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: CostCategory;
  provider: CloudProvider;
  type: 'budget_exceeded' | 'spike_detected' | 'anomaly' | 'waste_detected' | 'forecast_exceeded';
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  amount: number;
  createdAt: string;
}

export interface SpendTimeSeries {
  date: string;
  aws: number;
  gcp: number;
  azure: number;
  total: number;
}

export interface CostMetrics {
  totalSpendMTD: number;
  totalSpendLastMonth: number;
  spendChangePercent: number;
  totalSavingsRealized: number;
  pendingSavings: number;
  activeResources: number;
  idleResources: number;
  wastePercent: number;
  forecastEndMonth: number;
  budgetUsedPercent: number;
  openAlerts: number;
  criticalAlerts: number;
}

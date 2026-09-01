export type SeverityLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
export type ServiceStatus = 'operational' | 'degraded' | 'outage';

export interface ServiceMetric {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime24h: number;
  latencyMs: number;
  errorRate: number;
  dependencies: string[];
}

export interface Incident {
  id: string;
  title: string;
  serviceId: string;
  severity: SeverityLevel;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface SLAMetrics {
  targetUptime: number;
  currentUptime: number;
  errorBudgetRemaining: number;
  burnRate: number;
}

export interface SystemHealthScore {
  overallScore: number;
  totalServices: number;
  operationalServices: number;
  degradedServices: number;
  outageServices: number;
}

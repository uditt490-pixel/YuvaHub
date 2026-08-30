import { ServiceMetric, Incident, SLAMetrics, SystemHealthScore } from '../types/observability';

export class ObservabilityService {
  public static getServiceMetrics(): ServiceMetric[] {
    return [
      { id: 'auth-v2', name: 'Authentication Service', status: 'operational', uptime24h: 99.98, latencyMs: 45, errorRate: 0.02, dependencies: ['db-primary'] },
      { id: 'gateway', name: 'API Edge Gateway', status: 'operational', uptime24h: 100, latencyMs: 12, errorRate: 0.00, dependencies: ['auth-v2', 'quiz-engine'] },
      { id: 'quiz-engine', name: 'Live Quiz Engine', status: 'degraded', uptime24h: 98.45, latencyMs: 340, errorRate: 2.15, dependencies: ['redis-cache'] },
      { id: 'db-primary', name: 'PostgreSQL Core Cluster', status: 'operational', uptime24h: 99.99, latencyMs: 8, errorRate: 0.01, dependencies: [] },
      { id: 'redis-cache', name: 'Redis Matchmaking Buffer', status: 'operational', uptime24h: 99.95, latencyMs: 2, errorRate: 0.05, dependencies: [] }
    ];
  }

  public static getActiveIncidents(): Incident[] {
    return [
      {
        id: 'inc-902',
        title: 'Increased latency and timeouts during quiz socket allocation pools',
        serviceId: 'quiz-engine',
        severity: 'P1',
        status: 'identified',
        createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'inc-899',
        title: 'Transient connection resets on secondary DB read replica',
        serviceId: 'db-primary',
        severity: 'P3',
        status: 'monitoring',
        createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60000).toISOString()
      }
    ];
  }

  public static getSLATracking(): SLAMetrics {
    return {
      targetUptime: 99.90,
      currentUptime: 99.87,
      errorBudgetRemaining: 12.4,
      burnRate: 1.4
    };
  }

  public static getSystemHealthScore(): SystemHealthScore {
    const metrics = this.getServiceMetrics();
    const totalServices = metrics.length;
    const operationalServices = metrics.filter(m => m.status === 'operational').length;
    const degradedServices = metrics.filter(m => m.status === 'degraded').length;
    const outageServices = metrics.filter(m => m.status === 'outage').length;

    const overallScore = Math.round(
      ((operationalServices * 100) + (degradedServices * 60) + (outageServices * 0)) / totalServices
    );

    return {
      overallScore,
      totalServices,
      operationalServices,
      degradedServices,
      outageServices
    };
  }
}

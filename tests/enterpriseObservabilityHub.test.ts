import { describe, it, expect } from 'vitest';
import { ObservabilityService } from '../src/services/ObservabilityService.js';

describe('Enterprise Observability & Uptime Monitor Hub (#851)', () => {
  it('should return microservice metrics with required schema attributes', () => {
    const metrics = ObservabilityService.getServiceMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.length).toBeGreaterThan(0);

    const first = metrics[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('status');
    expect(first).toHaveProperty('uptime24h');
    expect(first).toHaveProperty('latencyMs');
    expect(first).toHaveProperty('errorRate');
    expect(first).toHaveProperty('dependencies');
  });

  it('should return active incidents with P0-P4 severities', () => {
    const incidents = ObservabilityService.getActiveIncidents();
    expect(incidents).toBeDefined();
    expect(incidents.length).toBeGreaterThan(0);

    const inc = incidents[0];
    expect(inc).toHaveProperty('id');
    expect(inc).toHaveProperty('title');
    expect(inc).toHaveProperty('severity');
    expect(['P0', 'P1', 'P2', 'P3', 'P4']).toContain(inc.severity);
  });

  it('should return valid SLA metrics and error budget values', () => {
    const sla = ObservabilityService.getSLATracking();
    expect(sla).toBeDefined();
    expect(sla.targetUptime).toBeGreaterThan(90);
    expect(sla.errorBudgetRemaining).toBeGreaterThan(0);
    expect(sla.burnRate).toBeDefined();
  });

  it('should calculate overall system health score correctly', () => {
    const health = ObservabilityService.getSystemHealthScore();
    expect(health).toBeDefined();
    expect(health.overallScore).toBeGreaterThanOrEqual(0);
    expect(health.overallScore).toBeLessThanOrEqual(100);
    expect(health.totalServices).toBe(5);
  });
});

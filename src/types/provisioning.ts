export type ResourceType = 'COMPUTE' | 'DATABASE' | 'STORAGE' | 'CACHE' | 'NETWORK';
export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'PROVISIONING' | 'OFFLINE';

export interface CloudResourceDef {
  id: string;
  name: string;
  type: ResourceType;
  region: string;
  tier: string;
  hourlyCost: number;
  health: HealthStatus;
  uptimePercentage: number;
}

export interface ResourceTemplate {
  templateId: string;
  displayName: string;
  type: ResourceType;
  description: string;
  baseHourlyCost: number;
  availableRegions: string[];
}

export interface ProvisioningMetrics {
  totalActiveResources: number;
  totalMonthlyProjectedCost: number;
  overallSystemHealth: number;
  activeDeployments: number;
}

import { CloudResourceDef, ResourceTemplate, ProvisioningMetrics } from '../types/provisioning';

export class ProvisioningService {
    public static async getMetrics(): Promise<ProvisioningMetrics> {
        await new Promise(r => setTimeout(r, 450));
        return {
            totalActiveResources: 34,
            totalMonthlyProjectedCost: 8450.50,
            overallSystemHealth: 98.4,
            activeDeployments: 2
        };
    }

    public static async getTemplates(): Promise<ResourceTemplate[]> {
        await new Promise(r => setTimeout(r, 600));
        return [
            { templateId: 'tpl_c1', displayName: 'General Compute (C5.large)', type: 'COMPUTE', description: 'Standard intensive compute node.', baseHourlyCost: 0.12, availableRegions: ['us-east-1', 'eu-west-1'] },
            { templateId: 'tpl_c2', displayName: 'Memory Optimized (R5.xl)', type: 'COMPUTE', description: 'High memory capacity for caching.', baseHourlyCost: 0.35, availableRegions: ['us-east-1', 'ap-south-1'] },
            { templateId: 'tpl_d1', displayName: 'Relational DB (Postgres)', type: 'DATABASE', description: 'Multi-AZ managed relational store.', baseHourlyCost: 0.45, availableRegions: ['global'] },
            { templateId: 'tpl_s1', displayName: 'Object Store', type: 'STORAGE', description: 'Highly durable infinite object storage.', baseHourlyCost: 0.05, availableRegions: ['global'] }
        ];
    }

    public static async getActiveResources(): Promise<CloudResourceDef[]> {
        await new Promise(r => setTimeout(r, 850));
        return [
            { id: 'res_1', name: 'api-gateway-node-1', type: 'COMPUTE', region: 'us-east-1', tier: 'C5.large', hourlyCost: 0.12, health: 'HEALTHY', uptimePercentage: 99.9 },
            { id: 'res_2', name: 'core-database-primary', type: 'DATABASE', region: 'us-east-1', tier: 'High-IO', hourlyCost: 0.85, health: 'HEALTHY', uptimePercentage: 100 },
            { id: 'res_3', name: 'redis-cache-cluster', type: 'CACHE', region: 'eu-west-1', tier: 'R5.xl', hourlyCost: 0.35, health: 'DEGRADED', uptimePercentage: 94.2 },
            { id: 'res_4', name: 'media-storage-bucket', type: 'STORAGE', region: 'global', tier: 'Standard', hourlyCost: 0.05, health: 'HEALTHY', uptimePercentage: 100 }
        ];
    }

    public static async deployResource(templateId: string, region: string): Promise<boolean> {
        await new Promise(r => setTimeout(r, 1500));
        console.log(`Deployed ${templateId} into ${region}`);
        return true;
    }
}

import { FeatureFlag, ExperimentMetrics, Environment } from '../types/featureFlags';

export class FeatureFlagService {
    public static async getFeatureFlags(env: Environment = 'PRODUCTION'): Promise<FeatureFlag[]> {
        await new Promise(r => setTimeout(r, 700));

        const mockFlags: FeatureFlag[] = [
            {
                id: 'flag_001',
                key: 'enable-new-checkout-flow',
                name: 'New Checkout Flow redesign',
                description: 'Toggles the 2026 redesign of the enterprise billing checkout portal.',
                type: 'EXPERIMENT',
                tags: ['billing', 'frontend', 'core'],
                owner: 'jane.smith@enterprise.co',
                createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
                environments: {
                    PRODUCTION: { isEnabled: true, rolloutPercentage: 50, targetingRules: [] },
                    STAGING: { isEnabled: true, rolloutPercentage: 100, targetingRules: [] },
                    DEVELOPMENT: { isEnabled: true, rolloutPercentage: 100, targetingRules: [] }
                }
            },
            {
                id: 'flag_002',
                key: 'api-rate-limiting-v2',
                name: 'Strict API Rate Limiting',
                description: 'Enforces strict rate limits on public graphQL endpoints.',
                type: 'BOOLEAN',
                tags: ['backend', 'security', 'api'],
                owner: 'sec-ops@enterprise.co',
                createdAt: new Date(Date.now() - 150 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
                environments: {
                    PRODUCTION: {
                        isEnabled: true,
                        rolloutPercentage: 100,
                        targetingRules: [
                            { id: 'rule_1', attribute: 'tier', operator: 'NOT_IN', values: ['ENTERPRISE'] }
                        ]
                    },
                    STAGING: { isEnabled: true, rolloutPercentage: 100, targetingRules: [] },
                    DEVELOPMENT: { isEnabled: false, rolloutPercentage: 0, targetingRules: [] }
                }
            },
            {
                id: 'flag_003',
                key: 'ai-copilot-beta',
                name: 'AI Coding Copilot',
                description: 'Beta access for the Antigravity local coding assistant.',
                type: 'MULTIVARIATE',
                tags: ['ai', 'experimental'],
                owner: 'karan.chaos@yuva.hub',
                createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
                updatedAt: new Date().toISOString(),
                environments: {
                    PRODUCTION: {
                        isEnabled: false,
                        rolloutPercentage: 5,
                        targetingRules: [
                            { id: 'rule_2', attribute: 'region', operator: 'EQUALS', values: ['US-EAST', 'EU-WEST'] }
                        ]
                    },
                    STAGING: { isEnabled: true, rolloutPercentage: 75, targetingRules: [] },
                    DEVELOPMENT: { isEnabled: true, rolloutPercentage: 100, targetingRules: [] }
                }
            },
            {
                id: 'flag_004',
                key: 'legacy-data-migration',
                name: 'S3 to Glacier DB move',
                description: 'Operational kill-switch for background migration job.',
                type: 'BOOLEAN',
                tags: ['ops', 'infrastructure'],
                owner: 'sysadmin',
                createdAt: new Date(Date.now() - 365 * 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 200 * 86400000).toISOString(),
                environments: {
                    PRODUCTION: { isEnabled: false, rolloutPercentage: 0, targetingRules: [] },
                    STAGING: { isEnabled: false, rolloutPercentage: 0, targetingRules: [] },
                    DEVELOPMENT: { isEnabled: false, rolloutPercentage: 0, targetingRules: [] }
                }
            }
        ];

        // In a real app we might filter by environment, but here we return all so the UI can toggle them based on currently viewed env.
        return mockFlags;
    }

    public static async getExperimentMetrics(flagId: string): Promise<ExperimentMetrics | null> {
        await new Promise(r => setTimeout(r, 900));

        if (flagId !== 'flag_001') return null; // We only mock metrics for the checkout flow experiment

        return {
            flagId,
            totalParticipants: 145020,
            durationDays: 28,
            confidenceInterval: 98.5,
            variants: [
                { variantName: 'Control', allocationPercentage: 50, conversionRate: 12.4, sampleSize: 72500, isWinning: false },
                { variantName: 'Treatment', allocationPercentage: 50, conversionRate: 16.8, sampleSize: 72520, isWinning: true }
            ]
        };
    }

    public static async toggleEnvironmentStatus(flagId: string, env: Environment, status: boolean): Promise<boolean> {
        await new Promise(r => setTimeout(r, 600));
        console.log(`Toggled flag ${flagId} in ${env} to ${status}`);
        return true;
    }

    public static async updateRolloutTarget(flagId: string, env: Environment, percentage: number): Promise<boolean> {
        await new Promise(r => setTimeout(r, 450));
        console.log(`Updated rollout for ${flagId} in ${env} to ${percentage}%`);
        return true;
    }
}

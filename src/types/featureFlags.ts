export type FlagType = 'BOOLEAN' | 'MULTIVARIATE' | 'EXPERIMENT';
export type Environment = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';
export type RuleOperator = 'EQUALS' | 'CONTAINS' | 'IN' | 'NOT_IN' | 'STARTS_WITH';

export interface TargetingRule {
    id: string;
    attribute: string;
    operator: RuleOperator;
    values: string[];
}

export interface EnvironmentStatus {
    isEnabled: boolean;
    rolloutPercentage: number;
    targetingRules: TargetingRule[];
}

export interface FeatureFlag {
    id: string;
    key: string;
    name: string;
    description: string;
    type: FlagType;
    tags: string[];
    owner: string;
    createdAt: string;
    updatedAt: string;
    environments: Record<Environment, EnvironmentStatus>;
}

export interface ExperimentVariance {
    variantName: string;
    allocationPercentage: number;
    conversionRate: number;
    sampleSize: number;
    isWinning: boolean;
}

export interface ExperimentMetrics {
    flagId: string;
    totalParticipants: number;
    durationDays: number;
    confidenceInterval: number;
    variants: ExperimentVariance[];
}

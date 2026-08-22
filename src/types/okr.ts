export type ObjectiveStatus = 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'COMPLETED' | 'DRAFT';
export type AlignmentLevel = 'COMPANY' | 'DEPARTMENT' | 'TEAM' | 'INDIVIDUAL';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface KeyResult {
    id: string;
    title: string;
    initialValue: number;
    currentValue: number;
    targetValue: number;
    unit: string;
    weight: number; // 0 to 1
    ownerName: string;
    lastUpdated: string;
}

export interface MetricMilestone {
    date: string;
    projected: number;
    actual?: number;
}

export interface Objective {
    id: string;
    title: string;
    description: string;
    status: ObjectiveStatus;
    progressPercentage: number;
    alignment: AlignmentLevel;
    departmentName?: string;
    teamName?: string;
    ownerName: string;
    ownerAvatar?: string;
    parentObjectiveId?: string;
    keyResults: KeyResult[];
    quarter: Quarter;
    year: number;
    tags: string[];
}

export interface AlignmentMetrics {
    totalCompanyObjectives: number;
    overallCompanyProgress: number;
    objectivesAtRisk: number;
    topPerformingDepartment: string;
    alignmentScore: number;
}

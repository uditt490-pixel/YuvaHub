import { Objective, KeyResult, AlignmentMetrics } from '../types/okr';

export class OkrService {
    private static calculateProgress(krs: KeyResult[]): number {
        if (!krs || krs.length === 0) return 0;
        let totalWeight = 0;
        let totalScore = 0;

        for (const kr of krs) {
            totalWeight += kr.weight;
            let krProgress = 0;
            if (kr.targetValue > kr.initialValue) {
                krProgress = ((kr.currentValue - kr.initialValue) / (kr.targetValue - kr.initialValue)) * 100;
            } else {
                krProgress = ((kr.initialValue - kr.currentValue) / (kr.initialValue - kr.targetValue)) * 100;
            }
            totalScore += (Math.max(0, Math.min(100, krProgress)) * kr.weight);
        }

        return totalWeight > 0 ? (totalScore / totalWeight) : 0;
    }

    public static async getMetrics(): Promise<AlignmentMetrics> {
        await new Promise(r => setTimeout(r, 650));
        return {
            totalCompanyObjectives: 8,
            overallCompanyProgress: 68.4,
            objectivesAtRisk: 2,
            topPerformingDepartment: 'Engineering',
            alignmentScore: 92
        };
    }

    public static async getObjectives(quarter: string, year: number): Promise<Objective[]> {
        await new Promise(r => setTimeout(r, 900));

        // Complex deterministic mock factory for Objectives
        const companyObj1: Objective = {
            id: 'OBJ-COMP-01',
            title: 'Expand to European Enterprise Market',
            description: 'Establish a strong foothold in EMEA with targeted localizations and dedicated EU infrastructure to comply with GDPR requirements out of the box.',
            status: 'ON_TRACK',
            progressPercentage: 62.5,
            alignment: 'COMPANY',
            ownerName: 'Sarah CEO',
            quarter: quarter as any,
            year: year,
            tags: ['Expansion', 'EMEA', 'Strategic'],
            keyResults: [
                { id: 'KR-101', title: 'Sign 5 new EU enterprise logos', initialValue: 0, currentValue: 3, targetValue: 5, unit: 'Logos', weight: 0.6, ownerName: 'Jim Sales', lastUpdated: new Date().toISOString() },
                { id: 'KR-102', title: 'Achieve 100% GDPR Compliance Audit', initialValue: 0, currentValue: 75, targetValue: 100, unit: '%', weight: 0.4, ownerName: 'Pam Security', lastUpdated: new Date().toISOString() }
            ]
        };

        const companyObj2: Objective = {
            id: 'OBJ-COMP-02',
            title: 'Achieve Industry Leading Platform Reliability',
            description: 'Ensure that all YuvaHub services maintain highest uptimes in the industry to support enterprise scaling requirements globally.',
            status: 'AT_RISK',
            progressPercentage: 45.0,
            alignment: 'COMPANY',
            ownerName: 'Alex CTO',
            quarter: quarter as any,
            year: year,
            tags: ['Engineering', 'Uptime'],
            keyResults: [
                { id: 'KR-201', title: 'Reduce MTTR to under 15 minutes', initialValue: 45, currentValue: 22, targetValue: 15, unit: 'minutes', weight: 0.5, ownerName: 'DevOps Lead', lastUpdated: new Date().toISOString() },
                { id: 'KR-202', title: 'Maintain 99.99% core infrastructure uptime', initialValue: 99.9, currentValue: 99.95, targetValue: 99.99, unit: '%', weight: 0.5, ownerName: 'DevOps Lead', lastUpdated: new Date().toISOString() }
            ]
        };

        const deptObj1: Objective = {
            id: 'OBJ-DEPT-01',
            title: 'Rollout EU-Central Database Shards',
            description: 'Migrate European tenants to localized database shards for sub-20ms latency and data residency.',
            status: 'ON_TRACK',
            progressPercentage: 80.0,
            alignment: 'DEPARTMENT',
            departmentName: 'Engineering',
            ownerName: 'Dan Director',
            parentObjectiveId: 'OBJ-COMP-01',
            quarter: quarter as any,
            year: year,
            tags: ['Infrastructure', 'Compliance'],
            keyResults: [
                { id: 'KR-301', title: 'Migrate 100% of EU tenant core data', initialValue: 0, currentValue: 85, targetValue: 100, unit: '%', weight: 0.7, ownerName: 'Data Team', lastUpdated: new Date().toISOString() },
                { id: 'KR-302', title: 'Reduce EU p99 latency below 30ms', initialValue: 110, currentValue: 35, targetValue: 30, unit: 'ms', weight: 0.3, ownerName: 'Network Team', lastUpdated: new Date().toISOString() }
            ]
        };

        const teamObj1: Objective = {
            id: 'OBJ-TEAM-01',
            title: 'Zero Downtime Postgres Migration',
            description: 'Execute the database shard migration without causing any read/write disruptions to European customers.',
            status: 'COMPLETED',
            progressPercentage: 100.0,
            alignment: 'TEAM',
            departmentName: 'Engineering',
            teamName: 'Backend Core',
            ownerName: 'Frank Lead',
            parentObjectiveId: 'OBJ-DEPT-01',
            quarter: quarter as any,
            year: year,
            tags: ['Database', 'Zero-Downtime'],
            keyResults: [
                { id: 'KR-401', title: 'Downtime seconds during switchover', initialValue: 60, currentValue: 0, targetValue: 0, unit: 'seconds', weight: 1.0, ownerName: 'Frank Lead', lastUpdated: new Date().toISOString() }
            ]
        };

        // Simulate complex hierarchical list
        return [companyObj1, companyObj2, deptObj1, teamObj1];
    }

    public static async updateKeyResult(krId: string, newValue: number): Promise<boolean> {
        await new Promise(r => setTimeout(r, 600));
        console.log(`Updated KR ${krId} to ${newValue}`);
        return true;
    }
}

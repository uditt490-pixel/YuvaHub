import { ComplianceFramework, SecurityVulnerability, ComplianceOverview, Framework, ReportConfiguration } from '../types/compliance';

export class ComplianceService {
    private static MOCK_FRAMEWORKS: ComplianceFramework[] = [
        {
            id: 'fw_01',
            name: 'SOC2',
            overallScore: 94.5,
            lastAssessed: new Date().toISOString(),
            controlsTotal: 120,
            controlsPassed: 115,
            controlsFailed: 5,
            trend: 'IMPROVING'
        },
        {
            id: 'fw_02',
            name: 'GDPR',
            overallScore: 88.2,
            lastAssessed: new Date(Date.now() - 86400000 * 5).toISOString(),
            controlsTotal: 65,
            controlsPassed: 58,
            controlsFailed: 7,
            trend: 'STABLE'
        },
        {
            id: 'fw_03',
            name: 'HIPAA',
            overallScore: 99.1,
            lastAssessed: new Date(Date.now() - 86400000 * 2).toISOString(),
            controlsTotal: 184,
            controlsPassed: 183,
            controlsFailed: 1,
            trend: 'IMPROVING'
        },
        {
            id: 'fw_04',
            name: 'ISO27001',
            overallScore: 76.4,
            lastAssessed: new Date(Date.now() - 86400000 * 12).toISOString(),
            controlsTotal: 96,
            controlsPassed: 72,
            controlsFailed: 24,
            trend: 'DEGRADING'
        }
    ];

    public static async getFrameworks(): Promise<ComplianceFramework[]> {
        await new Promise(r => setTimeout(r, 600));
        return this.MOCK_FRAMEWORKS;
    }

    public static async getOverview(): Promise<ComplianceOverview> {
        await new Promise(r => setTimeout(r, 450));
        const avg = this.MOCK_FRAMEWORKS.reduce((sum, f) => sum + f.overallScore, 0) / this.MOCK_FRAMEWORKS.length;

        return {
            activeFrameworks: this.MOCK_FRAMEWORKS.length,
            averageScore: Number(avg.toFixed(1)),
            openCriticalIssues: 3,
            daysUntilNextAudit: 14,
        };
    }

    public static async getVulnerabilities(frameworkFilter?: Framework, showRemediated = false): Promise<SecurityVulnerability[]> {
        await new Promise(r => setTimeout(r, 900));

        const allVulns: SecurityVulnerability[] = [
            {
                id: 'vuln_1001',
                title: 'Unencrypted S3 Bucket in us-east-1',
                description: 'Customer data backups found in an unencrypted remote storage bucket violating encryption-at-rest policies.',
                severity: 'CRITICAL',
                frameworksAffected: ['SOC2', 'HIPAA'],
                detectedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
                resourceId: 'arn:aws:s3:::customer-backups-raw',
                status: 'OPEN',
                assignedTo: 'Security Ops Team'
            },
            {
                id: 'vuln_1002',
                title: 'Missing DPIA for European Analytics Segment',
                description: 'Data Protection Impact Assessment is missing for the newly rolled out marketing analytics tracking.',
                severity: 'HIGH',
                frameworksAffected: ['GDPR'],
                detectedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                resourceId: 'Project: Analytics v2',
                status: 'OPEN',
            },
            {
                id: 'vuln_1003',
                title: 'Legacy TLS version supported on internal load balancer',
                description: 'Internal ALB allowing TLS v1.0 which is deprecated by modern standards.',
                severity: 'MEDIUM',
                frameworksAffected: ['SOC2', 'ISO27001', 'PCI-DSS'],
                detectedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
                resourceId: 'alb-internal-metrics-prod',
                status: 'IN_REVIEW',
                assignedTo: 'NetEng Team'
            },
            {
                id: 'vuln_1004',
                title: 'Unauthorized Port Expose (SSH)',
                description: 'Security group rule allowing 0.0.0.0/0 on port 22.',
                severity: 'CRITICAL',
                frameworksAffected: ['SOC2', 'ISO27001', 'PCI-DSS', 'HIPAA'],
                detectedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
                resourceId: 'sg-0834adbadfbda',
                status: 'REMEDIATED',
                assignedTo: 'Security Automation'
            }
        ];

        let filtered = allVulns;
        if (frameworkFilter) {
            filtered = filtered.filter(v => v.frameworksAffected.includes(frameworkFilter));
        }
        if (!showRemediated) {
            filtered = filtered.filter(v => v.status !== 'REMEDIATED');
        }

        return filtered;
    }

    public static async generateReport(config: ReportConfiguration): Promise<void> {
        // Simulate long-running job for compiling a report
        await new Promise(r => setTimeout(r, 1800));
        console.log('Report generated with config:', config);
        return;
    }
}

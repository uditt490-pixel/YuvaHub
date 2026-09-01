export type Framework = 'SOC2' | 'HIPAA' | 'GDPR' | 'ISO27001' | 'PCI-DSS';
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AuditStatus = 'PASSED' | 'FAILED' | 'IN_PROGRESS' | 'SCHEDULED';

export interface ComplianceFramework {
    id: string;
    name: Framework;
    overallScore: number;
    lastAssessed: string;
    controlsTotal: number;
    controlsPassed: number;
    controlsFailed: number;
    trend: 'IMPROVING' | 'DEGRADING' | 'STABLE';
}

export interface SecurityVulnerability {
    id: string;
    title: string;
    description: string;
    severity: Severity;
    frameworksAffected: Framework[];
    detectedAt: string;
    resourceId: string;
    assignedTo?: string;
    status: 'OPEN' | 'IN_REVIEW' | 'REMEDIATED';
}

export interface ReportConfiguration {
    reportName: string;
    frameworks: Framework[];
    dateFrom: string;
    dateTo: string;
    includeRemediated: boolean;
    format: 'PDF' | 'JSON' | 'CSV';
    recipients: string[];
}

export interface ComplianceOverview {
    activeFrameworks: number;
    averageScore: number;
    openCriticalIssues: number;
    daysUntilNextAudit: number;
}

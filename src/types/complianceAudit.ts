// ═══════════════════════════════════════════════════════════════════
// Enterprise Compliance & Regulatory Audit — Type Definitions
// ═══════════════════════════════════════════════════════════════════

export type ComplianceFramework = 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI_DSS' | 'ISO27001' | 'NIST' | 'CCPA' | 'FERPA';
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'partially_compliant' | 'in_progress' | 'not_applicable';
export type AuditStatus = 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'remediation';
export type RiskRating = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type AlertSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export interface ComplianceRequirement {
  id: string;
  framework: ComplianceFramework;
  controlId: string;
  title: string;
  description: string;
  status: ComplianceStatus;
  owner: string;
  lastAssessed: string;
  nextAssessment: string;
  evidenceCount: number;
  riskRating: RiskRating;
  notes?: string;
}

export interface AuditRecord {
  id: string;
  title: string;
  framework: ComplianceFramework;
  status: AuditStatus;
  auditor: string;
  startDate: string;
  endDate?: string;
  findings: number;
  criticalFindings: number;
  passRate: number;
  scope: string;
  notes?: string;
}

export interface ComplianceDocument {
  id: string;
  name: string;
  framework: ComplianceFramework;
  type: 'policy' | 'procedure' | 'evidence' | 'report' | 'risk_assessment';
  status: 'current' | 'outdated' | 'draft' | 'archived';
  owner: string;
  lastUpdated: string;
  expiresAt?: string;
  version: string;
  size: string;
}

export interface ComplianceAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  framework: ComplianceFramework;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  relatedControl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceMetrics {
  overallScore: number;
  totalRequirements: number;
  compliantCount: number;
  nonCompliantCount: number;
  partiallyCompliantCount: number;
  inProgressCount: number;
  activeAudits: number;
  completedAudits: number;
  openAlerts: number;
  criticalAlerts: number;
  documentsCurrent: number;
  documentsOutdated: number;
}

export interface ComplianceState {
  metrics: ComplianceMetrics | null;
  requirements: ComplianceRequirement[];
  audits: AuditRecord[];
  documents: ComplianceDocument[];
  alerts: ComplianceAlert[];
  isLoading: boolean;
  error: string | null;
  frameworkFilter: ComplianceFramework | 'all';
  statusFilter: ComplianceStatus | 'all';
  searchQuery: string;
  selectedTab: string;
}

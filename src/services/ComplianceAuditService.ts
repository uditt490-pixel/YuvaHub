// ═══════════════════════════════════════════════════════════════════
// Enterprise Compliance & Regulatory Audit — Service Layer
// ═══════════════════════════════════════════════════════════════════

import {
  ComplianceFramework, ComplianceRequirement, ComplianceStatus, RiskRating,
  AuditRecord, AuditStatus, ComplianceDocument, ComplianceAlert,
  AlertSeverity, ComplianceMetrics
} from '../types/complianceAudit';

const gid = (p: string) => `${p}-${Math.random().toString(36).substring(2, 10)}`;
const rand = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const randf = (a: number, b: number, d = 2) => parseFloat((Math.random() * (b - a) + a).toFixed(d));
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const dstr = (d: number) => { const dt = new Date(); dt.setDate(dt.getDate() - rand(0, Math.abs(d))); return dt.toISOString(); };

const FRAMEWORKS: ComplianceFramework[] = ['SOC2', 'GDPR', 'HIPAA', 'PCI_DSS', 'ISO27001', 'NIST', 'CCPA', 'FERPA'];
const STATUSES: ComplianceStatus[] = ['compliant', 'compliant', 'compliant', 'non_compliant', 'partially_compliant', 'in_progress'];
const SEVS: AlertSeverity[] = ['P0', 'P1', 'P2', 'P3'];
const OWNERS = ['security-team', 'compliance-officer', 'devops-lead', 'platform-team', 'legal-team', 'data-protection'];
const CONTROL_TITLES = [
  'Access Control Policy', 'Data Encryption at Rest', 'Incident Response Plan', 'Vendor Risk Assessment',
  'Employee Security Training', 'Network Segmentation', 'Backup & Recovery', 'Vulnerability Management',
  'Change Management Process', 'Data Retention Policy', 'Audit Logging', 'Multi-Factor Authentication',
  'Data Classification', 'Privacy Impact Assessment', 'Business Continuity Plan', 'Penetration Testing'
];

function genRequirements(): ComplianceRequirement[] {
  return FRAMEWORKS.flatMap(fw =>
    CONTROL_TITLES.slice(0, rand(4, 8)).map(ct => ({
      id: gid('req'), framework: fw, controlId: `${fw}-${rand(100, 999)}`,
      title: ct, description: `${ct} requirement for ${fw} compliance framework.`,
      status: pick(STATUSES as ComplianceStatus[]), owner: pick(OWNERS),
      lastAssessed: dstr(90), nextAssessment: dstr(-30),
      evidenceCount: rand(0, 12), riskRating: pick(['critical', 'high', 'medium', 'low', 'informational'] as RiskRating[]),
      notes: Math.random() > 0.7 ? 'Requires remediation before next audit cycle.' : undefined
    }))
  );
}

function genAudits(): AuditRecord[] {
  return FRAMEWORKS.slice(0, 6).map(fw => ({
    id: gid('aud'), title: `${fw} Annual Compliance Audit`,
    framework: fw, status: pick(['completed', 'completed', 'in_progress', 'remediation', 'scheduled'] as AuditStatus[]),
    auditor: pick(['Internal Audit Team', 'Deloitte', 'PwC', 'KPMG', 'EY']),
    startDate: dstr(60), endDate: Math.random() > 0.4 ? dstr(30) : undefined,
    findings: rand(0, 25), criticalFindings: rand(0, 5),
    passRate: randf(70, 100), scope: `${fw} compliance controls and documentation review`
  }));
}

function genDocuments(): ComplianceDocument[] {
  const types = ['policy', 'procedure', 'evidence', 'report', 'risk_assessment'] as const;
  return FRAMEWORKS.flatMap(fw =>
    types.slice(0, rand(2, 5)).map(t => ({
      id: gid('doc'), name: `${fw} ${t.replace(/_/g, ' ')}`.replace(/\b\w/g, c => c.toUpperCase()),
      framework: fw, type: t, status: pick(['current', 'current', 'outdated', 'draft'] as const),
      owner: pick(OWNERS), lastUpdated: dstr(120), expiresAt: Math.random() > 0.3 ? dstr(-90) : undefined,
      version: `v${rand(1, 5)}.${rand(0, 3)}`, size: `${rand(10, 500)}KB`
    }))
  );
}

function genAlerts(): ComplianceAlert[] {
  return Array.from({ length: 10 }, () => ({
    id: gid('alert'), title: pick([
      'Access control policy expired', 'Encryption certificate renewal required', 'Vendor assessment overdue',
      'Training completion below threshold', 'Audit finding unresolved', 'Data retention policy gap',
      'Incident response plan not updated', 'Penetration test overdue', 'Privacy policy update needed'
    ]),
    description: 'Compliance monitoring system detected a potential regulatory gap.',
    severity: pick(SEVS), framework: pick(FRAMEWORKS),
    status: pick(['open', 'open', 'investigating', 'resolved', 'dismissed'] as const),
    relatedControl: `${pick(FRAMEWORKS)}-${rand(100, 999)}`,
    createdAt: dstr(14), updatedAt: dstr(1)
  }));
}

function genMetrics(reqs: ComplianceRequirement[], audits: AuditRecord[], alerts: ComplianceAlert[]): ComplianceMetrics {
  return {
    overallScore: randf(75, 98),
    totalRequirements: reqs.length,
    compliantCount: reqs.filter(r => r.status === 'compliant').length,
    nonCompliantCount: reqs.filter(r => r.status === 'non_compliant').length,
    partiallyCompliantCount: reqs.filter(r => r.status === 'partially_compliant').length,
    inProgressCount: reqs.filter(r => r.status === 'in_progress').length,
    activeAudits: audits.filter(a => a.status === 'in_progress' || a.status === 'scheduled').length,
    completedAudits: audits.filter(a => a.status === 'completed').length,
    openAlerts: alerts.filter(a => a.status === 'open' || a.status === 'investigating').length,
    criticalAlerts: alerts.filter(a => a.severity === 'P0' || a.severity === 'P1').length,
    documentsCurrent: rand(15, 30), documentsOutdated: rand(2, 8)
  };
}

export class ComplianceAuditService {
  private static reqs = genRequirements();
  private static audits = genAudits();
  private static docs = genDocuments();
  private static alerts = genAlerts();

  static async getMetrics() { await new Promise(r => setTimeout(r, 200)); return genMetrics(this.reqs, this.audits, this.alerts); }
  static async getRequirements() { await new Promise(r => setTimeout(r, 250)); return [...this.reqs]; }
  static async getAudits() { await new Promise(r => setTimeout(r, 200)); return [...this.audits]; }
  static async getDocuments() { await new Promise(r => setTimeout(r, 200)); return [...this.docs]; }
  static async getAlerts() { await new Promise(r => setTimeout(r, 200)); return [...this.alerts]; }
}

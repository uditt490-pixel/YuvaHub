// ─── Enterprise Data Loss Prevention Service ──────────────────────────────────
// Generates realistic mock data for the DLP system with policies, scan results,
// incidents, classifications, and metrics.

import {
  DlpPolicy, DlpPolicyStatus, DlpScan, DlpScanStatus, DlpScanScope,
  DlpIncident, DlpIncidentStatus, DlpIncidentCategory, DlpSeverity,
  DlpDataType, DlpAction, DlpMetrics, DlpScanMatch,
  DataClassification, DlpIncidentEvent, DlpEvidence,
} from '../types/dataLossPrevention';

// ─── Constants ────────────────────────────────────────────────────────────────

const DATA_TYPES: DlpDataType[] = [
  'CREDIT_CARD', 'SSN', 'EMAIL', 'PHONE', 'PASSPORT', 'DRIVER_LICENSE',
  'BANK_ACCOUNT', 'IP_ADDRESS', 'API_KEY', 'PASSWORD', 'MEDICAL_RECORD',
  'NATIONAL_ID', 'ADDRESS', 'DATE_OF_BIRTH', 'NAME',
];

const SCOPES: DlpScanScope[] = ['UPLOAD', 'DOWNLOAD', 'EMAIL_ATTACHMENT', 'API_PAYLOAD', 'DATABASE_EXPORT', 'FILE_SHARE', 'CLOUD_STORAGE'];

const POLICY_NAMES = [
  'Credit Card Detection', 'PII Protection', 'API Key Leakage Prevention',
  'Medical Records Guard', 'Password Exposure Block', 'Financial Data Shield',
  'GDPR Compliance Scanner', 'HIPAA Data Monitor', 'Intellectual Property Guard',
  'Customer Data Firewall', 'Employee PII Watch', 'Export Control Monitor',
];

const TEAM_MEMBERS = [
  { name: 'Priya Sharma', email: 'priya@yuvaHub.io', team: 'Platform Engineering' },
  { name: 'Rohan Gupta', email: 'rohan@yuvaHub.io', team: 'Backend Services' },
  { name: 'Aisha Patel', email: 'aisha@yuvaHub.io', team: 'Security' },
  { name: 'Vikram Singh', email: 'vikram@yuvaHub.io', team: 'Billing' },
  { name: 'Meera Iyer', email: 'meera@yuvaHub.io', team: 'DevOps' },
  { name: 'Arjun Reddy', email: 'arjun@yuvaHub.io', team: 'Support' },
  { name: 'Neha Kapoor', email: 'neha@yuvaHub.io', team: 'Product' },
  { name: 'Ravi Kumar', email: 'ravi@enterprise.co', team: 'External Partner' },
];

const RESOURCE_TYPES = ['file', 'email', 'database_table', 'api_request', 'cloud_object', 'message'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function generateId(p: string): string { return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }

// ─── Mock Data ────────────────────────────────────────────────────────────────

function mockPolicies(): DlpPolicy[] {
  return POLICY_NAMES.map((name, i) => {
    const status: DlpPolicyStatus = i < 8 ? 'ACTIVE' : i < 10 ? 'PAUSED' : 'DRAFT';
    const dt = pick(DATA_TYPES);
    return {
      id: `pol_${i}`, name, description: `Automated DLP policy to detect and protect ${dt.replace(/_/g, ' ').toLowerCase()} data across ${SCOPES.slice(0, randInt(2, 5)).join(', ').toLowerCase()} scopes.`,
      status, priority: randInt(1, 10),
      rules: [{ id: `rule_${i}_1`, name: `${dt} Pattern Rule`, dataType: dt, pattern: dt === 'CREDIT_CARD' ? '\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b' : '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b', isRegex: true, confidenceThreshold: 85, enabled: true, description: `Detect ${dt.replace(/_/g, ' ').toLowerCase()} patterns` }],
      scopes: SCOPES.slice(0, randInt(2, 5)), dataTypes: [dt, pick(DATA_TYPES)],
      actions: pick([['BLOCK', 'ALERT'], ['QUARANTINE', 'NOTIFY'], ['ALERT', 'LOG', 'ESCALATE'], ['ENCRYPT', 'ALERT']] as DlpAction[][]),
      severity: pick(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as DlpSeverity[]),
      matchThreshold: randInt(1, 5), maxMatches: randInt(10, 500),
      exclusionPatterns: [], inclusionPatterns: [],
      exemptions: [{ id: `ex_${i}`, name: 'Test Data Exemption', pattern: '*test*', reason: 'Excludes test/sandbox data', approvedBy: 'Aisha Patel' }],
      createdBy: pick(TEAM_MEMBERS.map(m => m.name)), createdAt: new Date(Date.now() - Math.random() * 86400000 * 120).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
      lastTriggeredAt: status === 'ACTIVE' ? new Date(Date.now() - Math.random() * 86400000 * 7).toISOString() : undefined,
      triggerCount: status === 'ACTIVE' ? randInt(50, 2000) : 0, tags: [dt.toLowerCase()],
    };
  });
}

function mockScanMatch(scanId: string, policyId: string, policyName: string, idx: number): DlpScanMatch {
  const dt = pick(DATA_TYPES);
  const user = pick(TEAM_MEMBERS);
  return {
    id: generateId('match'), scanId, policyId, policyName, dataType: dt,
    severity: pick(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as DlpSeverity[]),
    confidence: randInt(70, 99),
    matchedContent: dt === 'CREDIT_CARD' ? '4242-****-****-7890' : dt === 'EMAIL' ? 'user@external-domain.com' : dt === 'API_KEY' ? 'sk_live_****a2f1' : '***REDACTED***',
    redactedContent: '***REDACTED***',
    filePath: `/uploads/${pick(['exports', 'reports', 'data', 'uploads'])}/file_${randInt(1000, 9999)}.csv`,
    lineNumber: randInt(1, 5000), columnStart: randInt(0, 50), columnEnd: randInt(50, 100),
    context: `Row ${randInt(1, 5000)} in data export batch`,
    fileName: `data_export_${randInt(1000, 9999)}.csv`, fileType: 'csv', fileSizeBytes: randInt(100000, 5000000),
    resourceOwner: user.name, resourceOwnerEmail: user.email,
    detectedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    actionTaken: pick(['BLOCK', 'QUARANTINE', 'ALERT', 'REDACT'] as DlpAction[]),
    isFalsePositive: Math.random() > 0.85,
    metadata: { region: pick(['US-EAST', 'EU-WEST', 'AP-SOUTH']), source: pick(['upload', 'export', 'api']) },
  };
}

function mockScans(): DlpScan[] {
  return Array.from({ length: 15 }, (_, i) => {
    const status: DlpScanStatus = i < 3 ? 'COMPLETED' : i < 5 ? 'RUNNING' : i < 7 ? 'PENDING' : i === 8 ? 'FAILED' : 'COMPLETED';
    const matchCount = status === 'COMPLETED' ? randInt(0, 45) : 0;
    return {
      id: generateId('scan'), name: `Scan #${1000 + i}`, status,
      trigger: pick(['MANUAL', 'SCHEDULED', 'POLICY_TRIGGER'] as const),
      scope: pick(SCOPES),
      targetResource: `/data/${pick(['exports', 'uploads', 'reports', 'databases'])}/batch_${randInt(100, 999)}`,
      resourceType: pick(RESOURCE_TYPES),
      initiatedBy: pick(TEAM_MEMBERS.map(m => m.name)),
      startedAt: new Date(Date.now() - Math.random() * 86400000 * 14).toISOString(),
      completedAt: status === 'COMPLETED' || status === 'FAILED' ? new Date(Date.now() - Math.random() * 86400000 * 14 + randInt(60000, 600000)).toISOString() : undefined,
      durationMs: status === 'COMPLETED' ? randInt(5000, 120000) : undefined,
      totalFilesScanned: randInt(10, 500), totalDataScannedBytes: randInt(10000000, 500000000),
      matchesFound: matchCount, incidentsCreated: matchCount > 10 ? randInt(1, 5) : 0,
      policiesEvaluated: randInt(5, 12),
      results: Array.from({ length: Math.min(matchCount, 8) }, (_, j) => mockScanMatch(`scan_${i}`, `pol_${randInt(0, 7)}`, pick(POLICY_NAMES), j)),
      errorMessage: status === 'FAILED' ? 'Connection timeout to database replica' : undefined,
    };
  }).sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

function mockIncidents(): DlpIncident[] {
  const statuses: DlpIncidentStatus[] = ['NEW', 'INVESTIGATING', 'CONTAINED', 'REMEDIATED', 'CLOSED'];
  return Array.from({ length: 12 }, (_, i) => {
    const status: DlpIncidentStatus = i < 2 ? 'NEW' : i < 5 ? 'INVESTIGATING' : i < 7 ? 'CONTAINED' : i < 9 ? 'REMEDIATED' : 'CLOSED';
    const user = pick(TEAM_MEMBERS);
    const dt = pick(DATA_TYPES);
    const cat: DlpIncidentCategory = pick(['DATA_LEAK', 'POLICY_VIOLATION', 'INSIDER_THREAT', 'EXFILTRATION', 'COMPLIANCE_BREACH']);
    const sev: DlpSeverity = i < 2 ? 'CRITICAL' : i < 4 ? 'HIGH' : 'MEDIUM';
    const createdMs = Date.now() - Math.random() * 86400000 * 30;
    const timeline: DlpIncidentEvent[] = [
      { id: generateId('evt'), timestamp: new Date(createdMs).toISOString(), type: 'DETECTED', actor: 'DLP System', actorRole: 'SYSTEM', description: `Sensitive ${dt.replace(/_/g, ' ').toLowerCase()} detected in ${pick(RESOURCE_TYPES).replace(/_/g, ' ')}`, metadata: {} },
    ];
    if (status !== 'NEW') timeline.push({ id: generateId('evt'), timestamp: new Date(createdMs + 300000).toISOString(), type: 'ASSIGNED', actor: 'Aisha Patel', actorRole: 'Security Lead', description: 'Incident assigned for investigation', metadata: { assignee: 'Aisha Patel' } });
    if (['INVESTIGATING', 'CONTAINED', 'REMEDIATED', 'CLOSED'].includes(status)) timeline.push({ id: generateId('evt'), timestamp: new Date(createdMs + 600000).toISOString(), type: 'INVESTIGATING', actor: 'Aisha Patel', actorRole: 'Security Lead', description: 'Investigation started. Reviewing data access logs and affected resources.', metadata: {} });
    if (['CONTAINED', 'REMEDIATED', 'CLOSED'].includes(status)) timeline.push({ id: generateId('evt'), timestamp: new Date(createdMs + 3600000).toISOString(), type: 'CONTAINED', actor: 'Meera Iyer', actorRole: 'DevOps Lead', description: 'Access to affected resource restricted. Affected file quarantined.', metadata: {} });
    if (['REMEDIATED', 'CLOSED'].includes(status)) timeline.push({ id: generateId('evt'), timestamp: new Date(createdMs + 86400000).toISOString(), type: 'REMEDIATED', actor: 'Priya Sharma', actorRole: 'Platform Engineer', description: 'Root cause identified: overly permissive export policy. Policy updated.', metadata: {} });
    if (status === 'CLOSED') timeline.push({ id: generateId('evt'), timestamp: new Date(createdMs + 86400000 * 2).toISOString(), type: 'CLOSED', actor: 'Aisha Patel', actorRole: 'Security Lead', description: 'Incident resolved. No further action required.', metadata: {} });

    return {
      id: generateId('inc'), title: `${cat.replace(/_/g, ' ')}: ${dt.replace(/_/g, ' ')} exposure detected`,
      description: `Multiple instances of sensitive ${dt.replace(/_/g, ' ').toLowerCase()} data were found in ${pick(RESOURCE_TYPES).replace(/_/g, ' ')} resources, triggering the ${pick(POLICY_NAMES)} policy.`,
      severity: sev, status, category: cat, policyId: `pol_${randInt(0, 7)}`, policyName: pick(POLICY_NAMES),
      scanId: generateId('scan'), matchIds: Array.from({ length: randInt(1, 10) }, () => generateId('match')),
      dataType: dt, affectedUser: user.name, affectedUserEmail: user.email, affectedUserTeam: user.team,
      affectedResource: `/data/${pick(['exports', 'uploads', 'reports'])}/file_${randInt(1000, 9999)}.csv`,
      resourceType: pick(RESOURCE_TYPES), matchCount: randInt(1, 50),
      dataVolumeBytes: randInt(10000, 50000000),
      detectedAt: new Date(createdMs).toISOString(), reportedAt: new Date(createdMs + 60000).toISOString(),
      investigatedAt: status !== 'NEW' ? new Date(createdMs + 300000).toISOString() : undefined,
      containedAt: ['CONTAINED', 'REMEDIATED', 'CLOSED'].includes(status) ? new Date(createdMs + 3600000).toISOString() : undefined,
      remediatedAt: ['REMEDIATED', 'CLOSED'].includes(status) ? new Date(createdMs + 86400000).toISOString() : undefined,
      closedAt: status === 'CLOSED' ? new Date(createdMs + 86400000 * 2).toISOString() : undefined,
      assignedTo: status !== 'NEW' ? 'Aisha Patel' : undefined,
      assignedTeam: status !== 'NEW' ? 'Security' : undefined,
      resolution: status === 'CLOSED' ? 'Policy updated. Export permissions restricted. Employee retrained.' : undefined,
      timeline, evidence: [
        { id: generateId('ev'), type: 'SCAN_RESULT' as DlpEvidence['type'], title: 'DLP Scan Match', description: `Matched ${dt.replace(/_/g, ' ')} pattern with ${randInt(80, 99)}% confidence`, content: `Matched: sk_live_****a2f1 at line ${randInt(1, 1000)}`, collectedAt: new Date(createdMs).toISOString(), collectedBy: 'DLP System' },
        { id: generateId('ev'), type: 'AUDIT_LOG' as DlpEvidence['type'], title: 'Access Log', description: `User ${user.name} accessed the affected resource`, content: `GET /api/v2/data/export?id=file_${randInt(1000, 9999)} — 200 OK`, collectedAt: new Date(createdMs - 60000).toISOString(), collectedBy: 'Audit System' },
      ],
      riskScore: sev === 'CRITICAL' ? randInt(80, 98) : sev === 'HIGH' ? randInt(60, 80) : randInt(30, 60),
      isEscalated: sev === 'CRITICAL', tags: [dt.toLowerCase(), cat.toLowerCase()],
      relatedIncidentIds: [],
    };
  }).sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
}

function mockClassifications(): DataClassification[] {
  return [
    { id: 'cls_1', name: 'Public', description: 'Information that can be freely shared', level: 'PUBLIC', color: 'bg-emerald-500', icon: '🌐', dataTypes: ['EMAIL', 'NAME'], retentionDays: 365, encryptionRequired: false, accessControlRequired: false, auditRequired: false, resourceCount: 12450, totalSizeBytes: 2_500_000_000, lastScanAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'cls_2', name: 'Internal', description: 'For internal use only', level: 'INTERNAL', color: 'bg-blue-500', icon: '🏢', dataTypes: ['EMAIL', 'PHONE', 'ADDRESS'], retentionDays: 730, encryptionRequired: false, accessControlRequired: true, auditRequired: false, resourceCount: 8900, totalSizeBytes: 5_600_000_000, lastScanAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 'cls_3', name: 'Confidential', description: 'Sensitive business data requiring protection', level: 'CONFIDENTIAL', color: 'bg-amber-500', icon: '🔒', dataTypes: ['CREDIT_CARD', 'BANK_ACCOUNT', 'API_KEY'], retentionDays: 365, encryptionRequired: true, accessControlRequired: true, auditRequired: true, resourceCount: 3200, totalSizeBytes: 1_200_000_000, lastScanAt: new Date(Date.now() - 3600000 * 6).toISOString() },
    { id: 'cls_4', name: 'Restricted', description: 'Highly sensitive personal data (PII)', level: 'RESTRICTED', color: 'bg-red-500', icon: '⛔', dataTypes: ['SSN', 'PASSPORT', 'DRIVER_LICENSE', 'NATIONAL_ID'], retentionDays: 180, encryptionRequired: true, accessControlRequired: true, auditRequired: true, resourceCount: 890, totalSizeBytes: 450_000_000, lastScanAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'cls_5', name: 'Prohibited', description: 'Data that must never be stored or transmitted', level: 'PROHIBITED', color: 'bg-rose-600', icon: '🚫', dataTypes: ['PASSWORD', 'MEDICAL_RECORD', 'GENETIC_DATA', 'BIOMETRIC'], retentionDays: 0, encryptionRequired: true, accessControlRequired: true, auditRequired: true, resourceCount: 45, totalSizeBytes: 12_000_000, lastScanAt: new Date(Date.now() - 1800000).toISOString() },
  ];
}

function mockMetrics(): DlpMetrics {
  const trendData = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
    scans: randInt(5, 25), matches: randInt(10, 80), incidents: randInt(0, 5),
  }));
  return {
    totalPolicies: 12, activePolicies: 8, totalScans: 1847, scansLast24h: randInt(8, 20),
    totalIncidents: 342, openIncidents: 7, criticalIncidents: 2,
    matchesLast24h: randInt(15, 60), totalMatchesEver: 12_890, falsePositiveRate: 12.3,
    avgResponseTimeMinutes: 18, avgResolutionTimeHours: 4.2, mttdMinutes: 12, mttrHours: 3.8,
    dataTypeBreakdown: [
      { dataType: 'CREDIT_CARD', count: 3400, percentage: 26.4 },
      { dataType: 'API_KEY', count: 2800, percentage: 21.7 },
      { dataType: 'EMAIL', count: 2100, percentage: 16.3 },
      { dataType: 'SSN', count: 1800, percentage: 14.0 },
      { dataType: 'PHONE', count: 1200, percentage: 9.3 },
      { dataType: 'PASSWORD', count: 900, percentage: 7.0 },
      { dataType: 'NAME', count: 690, percentage: 5.3 },
    ],
    severityBreakdown: [
      { severity: 'CRITICAL', count: 28, percentage: 8.2 },
      { severity: 'HIGH', count: 89, percentage: 26.0 },
      { severity: 'MEDIUM', count: 156, percentage: 45.6 },
      { severity: 'LOW', count: 69, percentage: 20.2 },
    ],
    scopeBreakdown: [
      { scope: 'FILE_SHARE', count: 520, percentage: 28.2 },
      { scope: 'EMAIL_ATTACHMENT', count: 410, percentage: 22.2 },
      { scope: 'CLOUD_STORAGE', count: 350, percentage: 18.9 },
      { scope: 'DATABASE_EXPORT', count: 280, percentage: 15.2 },
      { scope: 'API_PAYLOAD', count: 180, percentage: 9.7 },
      { scope: 'UPLOAD', count: 107, percentage: 5.8 },
    ],
    trendData,
    topViolators: [
      { user: 'Ravi Kumar', email: 'ravi@enterprise.co', team: 'External Partner', incidentCount: 8, riskScore: 82 },
      { user: 'Vikram Singh', email: 'vikram@yuvaHub.io', team: 'Billing', incidentCount: 5, riskScore: 61 },
      { user: 'Arjun Reddy', email: 'arjun@yuvaHub.io', team: 'Support', incidentCount: 3, riskScore: 45 },
    ],
    topPolicies: [
      { policyId: 'pol_0', policyName: 'Credit Card Detection', triggerCount: 3400, matchRate: 26.4 },
      { policyId: 'pol_4', policyName: 'API Key Leakage Prevention', triggerCount: 2800, matchRate: 21.7 },
      { policyId: 'pol_1', policyName: 'PII Protection', triggerCount: 2100, matchRate: 16.3 },
    ],
  };
}

// ─── Service Class ────────────────────────────────────────────────────────────

export class DlpService {
  private static cachedPolicies: DlpPolicy[] | null = null;
  private static cachedScans: DlpScan[] | null = null;
  private static cachedIncidents: DlpIncident[] | null = null;
  private static cachedMetrics: DlpMetrics | null = null;
  private static cachedClassifications: DataClassification[] | null = null;

  static async getPolicies(): Promise<DlpPolicy[]> {
    await new Promise(r => setTimeout(r, 500));
    if (!this.cachedPolicies) this.cachedPolicies = mockPolicies();
    return this.cachedPolicies;
  }

  static async getScans(): Promise<DlpScan[]> {
    await new Promise(r => setTimeout(r, 600));
    if (!this.cachedScans) this.cachedScans = mockScans();
    return this.cachedScans;
  }

  static async getIncidents(): Promise<DlpIncident[]> {
    await new Promise(r => setTimeout(r, 550));
    if (!this.cachedIncidents) this.cachedIncidents = mockIncidents();
    return this.cachedIncidents;
  }

  static async getMetrics(): Promise<DlpMetrics> {
    await new Promise(r => setTimeout(r, 400));
    if (!this.cachedMetrics) this.cachedMetrics = mockMetrics();
    return this.cachedMetrics;
  }

  static async getClassifications(): Promise<DataClassification[]> {
    await new Promise(r => setTimeout(r, 350));
    if (!this.cachedClassifications) this.cachedClassifications = mockClassifications();
    return this.cachedClassifications;
  }

  static async updateIncidentStatus(incidentId: string, status: DlpIncidentStatus, resolution?: string): Promise<void> {
    await new Promise(r => setTimeout(r, 300));
    if (this.cachedIncidents) {
      this.cachedIncidents = this.cachedIncidents.map(inc =>
        inc.id === incidentId ? { ...inc, status, resolution, closedAt: status === 'CLOSED' ? new Date().toISOString() : inc.closedAt } : inc
      );
    }
  }
}

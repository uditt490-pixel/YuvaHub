// ─── Enterprise Data Loss Prevention Types ────────────────────────────────────
// Full type definitions for the DLP system with sensitive data scanning,
// policy rules, incident tracking, data classifications, and compliance.

export type DlpPolicyStatus = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'ARCHIVED';

export type DlpSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type DlpDataType =
  | 'CREDIT_CARD'
  | 'SSN'
  | 'EMAIL'
  | 'PHONE'
  | 'PASSPORT'
  | 'DRIVER_LICENSE'
  | 'BANK_ACCOUNT'
  | 'IP_ADDRESS'
  | 'API_KEY'
  | 'PASSWORD'
  | 'MEDICAL_RECORD'
  | 'GENETIC_DATA'
  | 'BIOMETRIC'
  | 'NATIONAL_ID'
  | 'ADDRESS'
  | 'DATE_OF_BIRTH'
  | 'NAME'
  | 'CUSTOM';

export type DlpAction = 'BLOCK' | 'QUARANTINE' | 'ALERT' | 'LOG' | 'ENCRYPT' | 'REDACT' | 'NOTIFY' | 'ESCALATE';

export type DlpScanScope = 'UPLOAD' | 'DOWNLOAD' | 'EMAIL_ATTACHMENT' | 'API_PAYLOAD' | 'DATABASE_EXPORT' | 'FILE_SHARE' | 'CLOUD_STORAGE' | 'CLIPBOARD';

export type DlpScanStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type DlpIncidentStatus = 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'REMEDIATED' | 'FALSE_POSITIVE' | 'CLOSED';

export type DlpIncidentCategory = 'DATA_LEAK' | 'UNAUTHORIZED_ACCESS' | 'POLICY_VIOLATION' | 'INSIDER_THREAT' | 'EXFILTRATION' | 'COMPLIANCE_BREACH';

export type DlpEntityRisk = 'LOW' | 'MEDIUM' | 'HIGH';

// ─── DLP Policy ───────────────────────────────────────────────────────────────

export interface DlpPolicy {
  id: string;
  name: string;
  description: string;
  status: DlpPolicyStatus;
  priority: number;
  rules: DlpPolicyRule[];
  scopes: DlpScanScope[];
  dataTypes: DlpDataType[];
  actions: DlpAction[];
  severity: DlpSeverity;
  matchThreshold: number;
  maxMatches: number;
  exclusionPatterns: string[];
  inclusionPatterns: string[];
  exemptions: DlpExemption[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastTriggeredAt?: string;
  triggerCount: number;
  tags: string[];
}

export interface DlpPolicyRule {
  id: string;
  name: string;
  dataType: DlpDataType;
  pattern: string;
  isRegex: boolean;
  confidenceThreshold: number;
  enabled: boolean;
  description: string;
}

export interface DlpExemption {
  id: string;
  name: string;
  pattern: string;
  reason: string;
  approvedBy: string;
  expiresAt?: string;
}

// ─── Scan Results ─────────────────────────────────────────────────────────────

export interface DlpScan {
  id: string;
  name: string;
  status: DlpScanStatus;
  trigger: 'MANUAL' | 'SCHEDULED' | 'POLICY_TRIGGER' | 'API';
  scope: DlpScanScope;
  targetResource: string;
  resourceType: string;
  initiatedBy: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  totalFilesScanned: number;
  totalDataScannedBytes: number;
  matchesFound: number;
  incidentsCreated: number;
  policiesEvaluated: number;
  results: DlpScanMatch[];
  errorMessage?: string;
}

export interface DlpScanMatch {
  id: string;
  scanId: string;
  policyId: string;
  policyName: string;
  dataType: DlpDataType;
  severity: DlpSeverity;
  confidence: number;
  matchedContent: string;
  redactedContent: string;
  filePath: string;
  lineNumber: number;
  columnStart: number;
  columnEnd: number;
  context: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  resourceOwner: string;
  resourceOwnerEmail: string;
  detectedAt: string;
  actionTaken: DlpAction;
  isFalsePositive: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  metadata: Record<string, string | number | boolean>;
}

// ─── DLP Incidents ────────────────────────────────────────────────────────────

export interface DlpIncident {
  id: string;
  title: string;
  description: string;
  severity: DlpSeverity;
  status: DlpIncidentStatus;
  category: DlpIncidentCategory;
  policyId: string;
  policyName: string;
  scanId: string;
  matchIds: string[];
  dataType: DlpDataType;
  affectedUser: string;
  affectedUserEmail: string;
  affectedUserTeam: string;
  affectedResource: string;
  resourceType: string;
  matchCount: number;
  dataVolumeBytes: number;
  detectedAt: string;
  reportedAt: string;
  investigatedAt?: string;
  containedAt?: string;
  remediatedAt?: string;
  closedAt?: string;
  assignedTo?: string;
  assignedTeam?: string;
  resolution?: string;
  timeline: DlpIncidentEvent[];
  evidence: DlpEvidence[];
  riskScore: number;
  isEscalated: boolean;
  tags: string[];
  relatedIncidentIds: string[];
}

export interface DlpIncidentEvent {
  id: string;
  timestamp: string;
  type: 'DETECTED' | 'ASSIGNED' | 'INVESTIGATING' | 'COMMENT' | 'ESCALATED' | 'CONTAINED' | 'REMEDIATED' | 'CLOSED' | 'REOPENED' | 'FALSE_POSITIVE';
  actor: string;
  actorRole: string;
  description: string;
  metadata: Record<string, string>;
}

export interface DlpEvidence {
  id: string;
  type: 'SCAN_RESULT' | 'FILE_SNAPSHOT' | 'AUDIT_LOG' | 'SCREENSHOT' | 'EMAIL_HEADER' | 'NETWORK_LOG';
  title: string;
  description: string;
  content: string;
  collectedAt: string;
  collectedBy: string;
  hash?: string;
}

// ─── Data Classification ──────────────────────────────────────────────────────

export interface DataClassification {
  id: string;
  name: string;
  description: string;
  level: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'PROHIBITED';
  color: string;
  icon: string;
  dataTypes: DlpDataType[];
  retentionDays: number;
  encryptionRequired: boolean;
  accessControlRequired: boolean;
  auditRequired: boolean;
  resourceCount: number;
  totalSizeBytes: number;
  lastScanAt?: string;
}

// ─── Metrics & Analytics ──────────────────────────────────────────────────────

export interface DlpMetrics {
  totalPolicies: number;
  activePolicies: number;
  totalScans: number;
  scansLast24h: number;
  totalIncidents: number;
  openIncidents: number;
  criticalIncidents: number;
  matchesLast24h: number;
  totalMatchesEver: number;
  falsePositiveRate: number;
  avgResponseTimeMinutes: number;
  avgResolutionTimeHours: number;
  mttdMinutes: number;
  mttrHours: number;
  dataTypeBreakdown: Array<{ dataType: DlpDataType; count: number; percentage: number }>;
  severityBreakdown: Array<{ severity: DlpSeverity; count: number; percentage: number }>;
  scopeBreakdown: Array<{ scope: DlpScanScope; count: number; percentage: number }>;
  trendData: Array<{ date: string; scans: number; matches: number; incidents: number }>;
  topViolators: Array<{ user: string; email: string; team: string; incidentCount: number; riskScore: number }>;
  topPolicies: Array<{ policyId: string; policyName: string; triggerCount: number; matchRate: number }>;
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface DlpIncidentFilters {
  searchQuery: string;
  statuses: DlpIncidentStatus[];
  severities: DlpSeverity[];
  categories: DlpIncidentCategory[];
  dataTypes: DlpDataType[];
  dateRange: '24H' | '7D' | '30D' | '90D';
  sortBy: 'detectedAt' | 'severity' | 'matchCount' | 'riskScore';
  sortDirection: 'ASC' | 'DESC';
}

export interface DlpScanFilters {
  searchQuery: string;
  statuses: DlpScanStatus[];
  scopes: DlpScanScope[];
  dateRange: '24H' | '7D' | '30D';
}

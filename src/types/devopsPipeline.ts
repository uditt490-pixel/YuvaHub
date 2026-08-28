// ─── Enterprise DevOps Pipeline Manager Types ─────────────────────────────────

export type PipelineStatus = 'ACTIVE' | 'PAUSED' | 'DISABLED' | 'ARCHIVED';

export type BuildStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'TIMEOUT';

export type StageStatus = 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'SKIPPED' | 'CANCELLED';

export type DeployStatus = 'PENDING' | 'IN_PROGRESS' | 'SUCCEEDED' | 'FAILED' | 'ROLLED_BACK' | 'CANCELLED';

export type Environment = 'DEVELOPMENT' | 'STAGING' | 'PRE_PRODUCTION' | 'PRODUCTION';

export type TriggerType = 'PUSH' | 'PULL_REQUEST' | 'SCHEDULE' | 'MANUAL' | 'API' | 'TAG' | 'RELEASE';

export type ArtifactType = 'DOCKER_IMAGE' | 'NPM_PACKAGE' | 'BUILD_ARCHIVE' | 'SOURCE_BUNDLE' | 'BINARY' | 'HELM_CHART';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  repository: string;
  branch: string;
  status: PipelineStatus;
  stages: PipelineStage[];
  triggers: TriggerType[];
  schedules: PipelineSchedule[];
  environment: Environment;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  lastRunStatus?: BuildStatus;
  totalRuns: number;
  successRate: number;
  avgDurationMs: number;
  owner: string;
  ownerTeam: string;
  concurrency: number;
  timeoutMinutes: number;
  notifications: PipelineNotification[];
  variables: PipelineVariable[];
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  type: 'SOURCE' | 'BUILD' | 'TEST' | 'SECURITY_SCAN' | 'PACKAGE' | 'DEPLOY' | 'NOTIFY' | 'APPROVAL';
  status: StageStatus;
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
  jobs: PipelineJob[];
  allowFailure: boolean;
  environment?: Environment;
}

export interface PipelineJob {
  id: string;
  name: string;
  stageId: string;
  status: StageStatus;
  runner?: string;
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
  steps: PipelineStep[];
  logs: string;
  artifacts: PipelineArtifact[];
}

export interface PipelineStep {
  id: string;
  name: string;
  status: StageStatus;
  durationMs?: number;
  command?: string;
  output?: string;
}

// ─── Build ────────────────────────────────────────────────────────────────────

export interface Build {
  id: string;
  number: number;
  pipelineId: string;
  pipelineName: string;
  status: BuildStatus;
  trigger: TriggerType;
  branch: string;
  commitSha: string;
  commitMessage: string;
  commitAuthor: string;
  commitAuthorEmail: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  stages: BuildStageResult[];
  artifacts: PipelineArtifact[];
  coverage?: number;
  testsPassed: number;
  testsFailed: number;
  testsTotal: number;
  lintErrors: number;
  securityIssues: SecurityIssue[];
  deployedTo?: Environment;
  environment?: Environment;
  metadata: Record<string, string>;
}

export interface BuildStageResult {
  stageId: string;
  stageName: string;
  status: StageStatus;
  durationMs?: number;
  jobs: number;
  passed: number;
  failed: number;
}

// ─── Deployment ───────────────────────────────────────────────────────────────

export interface Deployment {
  id: string;
  pipelineId: string;
  pipelineName: string;
  buildId: string;
  buildNumber: number;
  environment: Environment;
  status: DeployStatus;
  version: string;
  commitSha: string;
  commitMessage: string;
  deployedBy: string;
  deployedAt: string;
  completedAt?: string;
  durationMs?: number;
  healthCheckStatus?: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
  rollbackAvailable: boolean;
  previousVersion?: string;
  approvals: DeploymentApproval[];
  changelog: string[];
  metrics: DeploymentMetrics;
}

export interface DeploymentApproval {
  id: string;
  approver: string;
  approverEmail: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  respondedAt?: string;
  comment?: string;
}

export interface DeploymentMetrics {
  errorRateBefore: number;
  errorRateAfter: number;
  latencyP50Before: number;
  latencyP50After: number;
  latencyP99Before: number;
  latencyP99After: number;
  cpuUsageBefore: number;
  cpuUsageAfter: number;
  memoryUsageBefore: number;
  memoryUsageAfter: number;
}

// ─── Artifacts & Security ─────────────────────────────────────────────────────

export interface PipelineArtifact {
  id: string;
  name: string;
  type: ArtifactType;
  sizeBytes: number;
  downloadUrl: string;
  createdAt: string;
  expiresAt: string;
}

export interface SecurityIssue {
  id: string;
  severity: Severity;
  category: string;
  description: string;
  file?: string;
  line?: number;
  cvss?: number;
  cve?: string;
  fixAvailable: boolean;
}

// ─── Schedule & Notifications ─────────────────────────────────────────────────

export interface PipelineSchedule {
  id: string;
  name: string;
  cron: string;
  branch: string;
  enabled: boolean;
  lastRunAt?: string;
  nextRunAt: string;
}

export interface PipelineNotification {
  channel: 'SLACK' | 'EMAIL' | 'WEBHOOK';
  events: BuildStatus[];
  target: string;
  enabled: boolean;
}

export interface PipelineVariable {
  key: string;
  value: string;
  masked: boolean;
  protected: boolean;
  environment?: Environment;
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface DevopsMetrics {
  totalPipelines: number;
  activePipelines: number;
  totalBuilds: number;
  buildsLast24h: number;
  successRate: number;
  avgBuildDurationMs: number;
  totalDeployments: number;
  deploymentsLast24h: number;
  deploymentSuccessRate: number;
  avgDeployDurationMs: number;
  rollbackRate: number;
  mttrMinutes: number;
  leadTimeHours: number;
  deployFrequency: number;
  changeFailureRate: number;
  pipelineTrend: Array<{ date: string; builds: number; succeeded: number; failed: number }>;
  environmentHealth: Array<{ environment: Environment; status: 'HEALTHY' | 'DEGRADED' | 'DOWN'; uptime: number; lastDeploy: string; version: string }>;
  topPipelines: Array<{ pipelineId: string; name: string; runs: number; successRate: number; avgDurationMs: number }>;
  buildTimeDistribution: Array<{ range: string; count: number; percentage: number }>;
  failureReasons: Array<{ reason: string; count: number; percentage: number }>;
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface PipelineFilters {
  searchQuery: string;
  statuses: PipelineStatus[];
  environments: Environment[];
  triggers: TriggerType[];
  teamFilter: string;
  sortBy: 'name' | 'lastRunAt' | 'successRate' | 'totalRuns';
  sortDirection: 'ASC' | 'DESC';
}

export interface BuildFilters {
  searchQuery: string;
  statuses: BuildStatus[];
  branches: string[];
  dateRange: '24H' | '7D' | '30D';
  triggerType?: TriggerType;
}

// ─── Enterprise DevOps Pipeline Service ───────────────────────────────────────
// Generates realistic mock data for the DevOps Pipeline Manager.

import {
  Pipeline, PipelineStatus, Build, BuildStatus, BuildStageResult,
  Deployment, DeployStatus, Environment, DevopsMetrics,
  StageStatus, TriggerType, SecurityIssue, Severity,
} from '../types/devopsPipeline';

const PIPELINE_NAMES = [
  'yuvaHub-web-app', 'yuvaHub-api-server', 'yuvaHub-mobile-sdk',
  'yuvaHub-analytics-service', 'yuvaHub-billing-engine', 'yuvaHub-notification-worker',
  'yuvaHub-search-indexer', 'yuvaHub-auth-service', 'yuvaHub-file-processor',
  'yuvaHub-realtime-gateway', 'yuvaHub-ml-pipeline', 'yuvaHub-docs-site',
];

const REPOS = [
  'Anubhutisharma-07/yuvaHub-web', 'Anubhutisharma-07/yuvaHub-api',
  'Anubhutisharma-07/yuvaHub-sdk', 'Anubhutisharma-07/yuvaHub-analytics',
  'Anubhutisharma-07/yuvaHub-billing', 'Anubhutisharma-07/yuvaHub-infra',
];

const BRANCHES = ['main', 'develop', 'feature/new-dashboard', 'hotfix/auth-fix', 'release/v2.4.0'];
const COMMITS = [
  { sha: 'a1b2c3d', msg: 'feat(dashboard): Add real-time analytics widgets', author: 'Priya Sharma' },
  { sha: 'e4f5g6h', msg: 'fix(auth): Resolve SSO timeout issue', author: 'Rohan Gupta' },
  { sha: 'i7j8k9l', msg: 'chore(deps): Upgrade React to v19.1', author: 'Meera Iyer' },
  { sha: 'm0n1o2p', msg: 'feat(api): Add v3 recommendations endpoint', author: 'Arjun Reddy' },
  { sha: 'q3r4s5t', msg: 'fix(billing): Correct invoice calculation', author: 'Vikram Singh' },
  { sha: 'u6v7w8x', msg: 'refactor(search): Optimize Meilisearch queries', author: 'Aisha Patel' },
  { sha: 'y9z0a1b', msg: 'feat(notifications): Multi-channel delivery', author: 'Neha Kapoor' },
  { sha: 'c2d3e4f', msg: 'security(scan): Patch XSS vulnerability', author: 'Aisha Patel' },
];

const STAGE_NAMES = ['Source', 'Install', 'Lint & Typecheck', 'Unit Tests', 'Integration Tests', 'Security Scan', 'Build', 'Deploy', 'Smoke Tests', 'Notify'];

const TRIGGER_TYPES: TriggerType[] = ['PUSH', 'PULL_REQUEST', 'SCHEDULE', 'MANUAL', 'TAG', 'RELEASE'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function generateId(p: string): string { return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }

// ─── Mock Pipelines ───────────────────────────────────────────────────────────

function mockPipelines(): Pipeline[] {
  return PIPELINE_NAMES.map((name, i) => {
    const status: PipelineStatus = i < 10 ? 'ACTIVE' : i < 11 ? 'PAUSED' : 'DISABLED';
    const lastRunStatus: BuildStatus = status === 'ACTIVE' ? (Math.random() > 0.15 ? 'SUCCESS' : 'FAILED') : 'CANCELLED';
    return {
      id: generateId('pl'), name, description: `CI/CD pipeline for ${name.replace(/-/g, ' ')} service`,
      repository: REPOS[i % REPOS.length], branch: pick(BRANCHES), status,
      stages: STAGE_NAMES.slice(0, randInt(5, 8)).map((sName, si) => ({
        id: generateId('stg'), name: sName, order: si, type: si === 0 ? 'SOURCE' : si < 3 ? 'BUILD' : si < 5 ? 'TEST' : si === 5 ? 'SECURITY_SCAN' : si === 6 ? 'PACKAGE' : si === 7 ? 'DEPLOY' : 'NOTIFY',
        status: 'SUCCESS' as StageStatus, jobs: [], allowFailure: sName === 'Lint & Typecheck',
      })),
      triggers: ['PUSH', 'PULL_REQUEST', pick(['SCHEDULE', 'MANUAL', 'TAG'])],
      schedules: [{ id: generateId('sch'), name: 'Nightly Build', cron: '0 2 * * *', branch: 'main', enabled: true, nextRunAt: new Date(Date.now() + 3600000 * 6).toISOString() }],
      environment: pick(['DEVELOPMENT', 'STAGING', 'PRODUCTION'] as Environment[]),
      tags: [name.includes('web') ? 'frontend' : name.includes('api') ? 'backend' : 'service', pick(['critical', 'standard', 'experimental'])],
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 180).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
      lastRunAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
      lastRunStatus, totalRuns: randInt(100, 5000), successRate: Math.round((85 + Math.random() * 15) * 10) / 10,
      avgDurationMs: randInt(120000, 600000),
      owner: pick(['Priya Sharma', 'Rohan Gupta', 'Meera Iyer', 'Arjun Reddy']),
      ownerTeam: pick(['Platform Engineering', 'Backend Services', 'DevOps', 'Mobile Squad']),
      concurrency: randInt(1, 5), timeoutMinutes: pick([15, 30, 45, 60]),
      notifications: [{ channel: 'SLACK', events: ['FAILED'], target: '#build-alerts', enabled: true }],
      variables: [{ key: 'NODE_ENV', value: 'production', masked: false, protected: false }],
    };
  });
}

// ─── Mock Builds ──────────────────────────────────────────────────────────────

function mockBuilds(pipelines: Pipeline[]): Build[] {
  const builds: Build[] = [];
  pipelines.filter(p => p.status === 'ACTIVE').forEach(pipeline => {
    const count = randInt(5, 15);
    for (let i = 0; i < count; i++) {
      const commit = pick(COMMITS);
      const status: BuildStatus = i === 0 ? (Math.random() > 0.15 ? 'SUCCESS' : 'FAILED') : i < 3 ? 'RUNNING' : pick(['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED', 'CANCELLED']);
      const startedMs = Date.now() - Math.random() * 86400000 * 14;
      builds.push({
        id: generateId('bld'), number: 1000 + pipeline.totalRuns - i, pipelineId: pipeline.id, pipelineName: pipeline.name,
        status, trigger: pick(TRIGGER_TYPES), branch: pipeline.branch, commitSha: commit.sha,
        commitMessage: commit.msg, commitAuthor: commit.author, commitAuthorEmail: `${commit.author.split(' ')[0].toLowerCase()}@yuvaHub.io`,
        startedAt: new Date(startedMs).toISOString(),
        completedAt: ['SUCCESS', 'FAILED', 'CANCELLED'].includes(status) ? new Date(startedMs + randInt(60000, 600000)).toISOString() : undefined,
        durationMs: ['SUCCESS', 'FAILED', 'CANCELLED'].includes(status) ? randInt(60000, 600000) : undefined,
        stages: pipeline.stages.map(s => ({
          stageId: s.id, stageName: s.name, status: status === 'CANCELLED' ? 'CANCELLED' as StageStatus : Math.random() > 0.1 ? 'SUCCESS' as StageStatus : 'FAILED' as StageStatus,
          durationMs: randInt(5000, 120000), jobs: 1, passed: 1, failed: Math.random() > 0.9 ? 1 : 0,
        })),
        artifacts: status === 'SUCCESS' ? [{ id: generateId('art'), name: `${pipeline.name}-${commit.sha}.tar.gz`, type: 'BUILD_ARCHIVE', sizeBytes: randInt(10000000, 200000000), downloadUrl: `https://artifacts.yuvaHub.io/${pipeline.name}/${commit.sha}/build.tar.gz`, createdAt: new Date(startedMs + 300000).toISOString(), expiresAt: new Date(startedMs + 30 * 86400000).toISOString() }] : [],
        coverage: status === 'SUCCESS' ? randInt(72, 98) : undefined,
        testsPassed: randInt(80, 200), testsFailed: status === 'FAILED' ? randInt(1, 10) : 0, testsTotal: randInt(80, 200),
        lintErrors: status === 'FAILED' ? randInt(1, 25) : 0,
        securityIssues: Math.random() > 0.7 ? [{ id: generateId('sec'), severity: pick(['LOW', 'MEDIUM', 'HIGH'] as Severity[]), category: pick(['XSS', 'SQL Injection', 'Dependency Vulnerability', 'Hardcoded Secret']), description: `Potential ${pick(['XSS', 'injection', 'vulnerability'])} detected in source code`, fixAvailable: true }] : [],
        deployedTo: status === 'SUCCESS' && Math.random() > 0.5 ? pick(['STAGING', 'PRODUCTION'] as Environment[]) : undefined,
        metadata: { ci: 'GitHub Actions', runner: pick(['ubuntu-latest', 'self-hosted-linux', 'macos-latest']) },
      });
    }
  });
  return builds.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

// ─── Mock Deployments ─────────────────────────────────────────────────────────

function mockDeployments(pipelines: Pipeline[]): Deployment[] {
  return pipelines.filter(p => p.status === 'ACTIVE').slice(0, 8).map((pipeline, i) => {
    const status: DeployStatus = i < 2 ? 'SUCCEEDED' : i < 4 ? 'IN_PROGRESS' : i < 5 ? 'FAILED' : i < 6 ? 'ROLLED_BACK' : 'SUCCEEDED';
    const deployMs = Date.now() - Math.random() * 86400000 * 7;
    return {
      id: generateId('dep'), pipelineId: pipeline.id, pipelineName: pipeline.name,
      buildId: generateId('bld'), buildNumber: pipeline.totalRuns - i,
      environment: pick(['STAGING', 'PRE_PRODUCTION', 'PRODUCTION'] as Environment[]), status,
      version: `v${randInt(2, 5)}.${randInt(0, 9)}.${randInt(0, 20)}`,
      commitSha: pick(COMMITS).sha, commitMessage: pick(COMMITS).msg,
      deployedBy: pick(['Priya Sharma', 'Meera Iyer', 'CI Bot']),
      deployedAt: new Date(deployMs).toISOString(),
      completedAt: ['SUCCEEDED', 'FAILED', 'ROLLED_BACK'].includes(status) ? new Date(deployMs + randInt(60000, 600000)).toISOString() : undefined,
      durationMs: ['SUCCEEDED', 'FAILED', 'ROLLED_BACK'].includes(status) ? randInt(60000, 600000) : undefined,
      healthCheckStatus: status === 'SUCCEEDED' ? ('HEALTHY' as const) : status === 'FAILED' ? ('UNHEALTHY' as const) : ('DEGRADED' as const),
      rollbackAvailable: status === 'SUCCEEDED', previousVersion: `v${randInt(2, 5)}.${randInt(0, 9)}.${randInt(0, 20)}`,
      approvals: status === 'IN_PROGRESS' ? [{ id: generateId('apr'), approver: 'Priya Sharma', approverEmail: 'priya@yuvaHub.io', status: 'PENDING' as const, requestedAt: new Date(deployMs).toISOString() }] : [],
      changelog: [pick(COMMITS).msg, pick(COMMITS).msg],
      metrics: {
        errorRateBefore: Math.round(Math.random() * 2 * 10) / 10, errorRateAfter: Math.round(Math.random() * 2 * 10) / 10,
        latencyP50Before: randInt(80, 200), latencyP50After: randInt(80, 200),
        latencyP99Before: randInt(300, 800), latencyP99After: randInt(300, 800),
        cpuUsageBefore: randInt(20, 60), cpuUsageAfter: randInt(20, 60),
        memoryUsageBefore: randInt(30, 70), memoryUsageAfter: randInt(30, 70),
      },
    };
  }).sort((a, b) => new Date(b.deployedAt).getTime() - new Date(a.deployedAt).getTime());
}

// ─── Mock Metrics ─────────────────────────────────────────────────────────────

function mockMetrics(): DevopsMetrics {
  return {
    totalPipelines: 12, activePipelines: 10, totalBuilds: 4832, buildsLast24h: randInt(15, 40),
    successRate: 91.3, avgBuildDurationMs: 245000, totalDeployments: 847, deploymentsLast24h: randInt(2, 8),
    deploymentSuccessRate: 94.2, avgDeployDurationMs: 180000, rollbackRate: 3.8,
    mttrMinutes: 22, leadTimeHours: 4.5, deployFrequency: 8.2, changeFailureRate: 4.1,
    pipelineTrend: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
      builds: randInt(15, 40), succeeded: randInt(12, 35), failed: randInt(0, 5),
    })),
    environmentHealth: [
      { environment: 'PRODUCTION', status: 'HEALTHY', uptime: 99.97, lastDeploy: new Date(Date.now() - 3600000 * 6).toISOString(), version: 'v4.2.1' },
      { environment: 'PRE_PRODUCTION', status: 'HEALTHY', uptime: 99.90, lastDeploy: new Date(Date.now() - 3600000 * 2).toISOString(), version: 'v4.3.0-rc.1' },
      { environment: 'STAGING', status: 'DEGRADED', uptime: 98.50, lastDeploy: new Date(Date.now() - 1800000).toISOString(), version: 'v4.3.0-rc.2' },
      { environment: 'DEVELOPMENT', status: 'HEALTHY', uptime: 99.80, lastDeploy: new Date(Date.now() - 600000).toISOString(), version: 'v4.4.0-dev.12' },
    ],
    topPipelines: PIPELINE_NAMES.slice(0, 5).map((name, i) => ({
      pipelineId: `pl_${i}`, name, runs: randInt(200, 5000), successRate: Math.round((85 + Math.random() * 15) * 10) / 10, avgDurationMs: randInt(120000, 600000),
    })),
    buildTimeDistribution: [
      { range: '< 1m', count: 450, percentage: 9.3 },
      { range: '1-3m', count: 1800, percentage: 37.3 },
      { range: '3-5m', count: 1500, percentage: 31.0 },
      { range: '5-10m', count: 800, percentage: 16.6 },
      { range: '10-20m', count: 230, percentage: 4.8 },
      { range: '> 20m', count: 52, percentage: 1.1 },
    ],
    failureReasons: [
      { reason: 'Test Failure', count: 189, percentage: 42.3 },
      { reason: 'Lint / Type Errors', count: 98, percentage: 22.0 },
      { reason: 'Build Timeout', count: 67, percentage: 15.0 },
      { reason: 'Dependency Error', count: 45, percentage: 10.1 },
      { reason: 'Security Scan Block', count: 32, percentage: 7.2 },
      { reason: 'Infrastructure Error', count: 15, percentage: 3.4 },
    ],
  };
}

// ─── Service Class ────────────────────────────────────────────────────────────

export class DevopsPipelineService {
  private static cachedPipelines: Pipeline[] | null = null;
  private static cachedBuilds: Build[] | null = null;
  private static cachedDeployments: Deployment[] | null = null;
  private static cachedMetrics: DevopsMetrics | null = null;

  static async getPipelines(): Promise<Pipeline[]> {
    await new Promise(r => setTimeout(r, 500));
    if (!this.cachedPipelines) this.cachedPipelines = mockPipelines();
    return this.cachedPipelines;
  }

  static async getBuilds(): Promise<Build[]> {
    await new Promise(r => setTimeout(r, 600));
    if (!this.cachedBuilds) {
      const pipelines = await this.getPipelines();
      this.cachedBuilds = mockBuilds(pipelines);
    }
    return this.cachedBuilds;
  }

  static async getDeployments(): Promise<Deployment[]> {
    await new Promise(r => setTimeout(r, 550));
    if (!this.cachedDeployments) {
      const pipelines = await this.getPipelines();
      this.cachedDeployments = mockDeployments(pipelines);
    }
    return this.cachedDeployments;
  }

  static async getMetrics(): Promise<DevopsMetrics> {
    await new Promise(r => setTimeout(r, 400));
    if (!this.cachedMetrics) this.cachedMetrics = mockMetrics();
    return this.cachedMetrics;
  }
}

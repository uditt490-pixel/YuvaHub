// ─── Enterprise DevOps Pipeline Hub ───────────────────────────────────────────
// Full page container for DevOps Pipeline Manager: pipelines, builds,
// deployments, environment health, metrics, and build detail modal.

import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch, Play, Pause, CheckCircle2, XCircle, Clock, AlertTriangle,
  Search, Filter, RefreshCw, Rocket, Shield, BarChart3, Terminal,
  Package, ExternalLink, ChevronDown, ChevronUp, Eye, X, Globe,
  Zap, TrendingUp, TrendingDown, Activity, Server, Timer, RotateCcw,
} from 'lucide-react';
import {
  Pipeline, PipelineStatus, Build, BuildStatus, Deployment, DeployStatus,
  Environment, DevopsMetrics, StageStatus,
} from '../../types/devopsPipeline';
import { DevopsPipelineService } from '../../services/DevopsPipelineService';

type PageView = 'pipelines' | 'builds' | 'deployments' | 'environments' | 'analytics';

const VIEW_TABS: Array<{ id: PageView; label: string; icon: React.ReactNode }> = [
  { id: 'pipelines', label: 'Pipelines', icon: <GitBranch className="h-4 w-4" /> },
  { id: 'builds', label: 'Builds', icon: <Terminal className="h-4 w-4" /> },
  { id: 'deployments', label: 'Deployments', icon: <Rocket className="h-4 w-4" /> },
  { id: 'environments', label: 'Environments', icon: <Globe className="h-4 w-4" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> },
];

const BUILD_STATUS_CONFIG: Record<BuildStatus, { label: string; color: string; dot: string; icon: React.ReactNode }> = {
  PENDING: { label: 'Pending', color: 'bg-surface-secondary text-text-secondary border-border-theme', dot: 'bg-slate-400', icon: <Clock className="h-4 w-4" /> },
  QUEUED: { label: 'Queued', color: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400', icon: <Clock className="h-4 w-4" /> },
  RUNNING: { label: 'Running', color: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-500/200 animate-pulse', icon: <Play className="h-4 w-4 animate-pulse" /> },
  SUCCESS: { label: 'Success', color: 'bg-emerald-500/200/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500/200', icon: <CheckCircle2 className="h-4 w-4" /> },
  FAILED: { label: 'Failed', color: 'bg-red-500/200/20 text-red-400 border-red-500/30', dot: 'bg-red-500/200', icon: <XCircle className="h-4 w-4" /> },
  CANCELLED: { label: 'Cancelled', color: 'bg-surface-secondary text-text-muted border-border-theme', dot: 'bg-slate-400', icon: <XCircle className="h-4 w-4" /> },
  TIMEOUT: { label: 'Timeout', color: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-500/200', icon: <Timer className="h-4 w-4" /> },
};

const DEPLOY_STATUS_CONFIG: Record<DeployStatus, { label: string; color: string; dot: string }> = {
  PENDING: { label: 'Pending', color: 'bg-surface-secondary text-text-secondary border-border-theme', dot: 'bg-slate-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500/200/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-500/200 animate-pulse' },
  SUCCEEDED: { label: 'Succeeded', color: 'bg-emerald-500/200/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500/200' },
  FAILED: { label: 'Failed', color: 'bg-red-500/200/20 text-red-400 border-red-500/30', dot: 'bg-red-500/200' },
  ROLLED_BACK: { label: 'Rolled Back', color: 'bg-amber-500/200/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-500/200' },
  CANCELLED: { label: 'Cancelled', color: 'bg-surface-secondary text-text-muted border-border-theme', dot: 'bg-slate-400' },
};

const ENV_CONFIG: Record<Environment, { color: string; icon: string }> = {
  DEVELOPMENT: { color: 'bg-blue-500/200', icon: '🔧' },
  STAGING: { color: 'bg-amber-500/200', icon: '🧪' },
  PRE_PRODUCTION: { color: 'bg-purple-500/200', icon: '🔍' },
  PRODUCTION: { color: 'bg-emerald-500/200', icon: '🚀' },
};

const STAGE_STATUS_COLORS: Record<StageStatus, string> = {
  PENDING: 'bg-border-theme', RUNNING: 'bg-blue-500/200 animate-pulse', SUCCESS: 'bg-emerald-500/200',
  FAILED: 'bg-red-500/200', SKIPPED: 'bg-slate-300', CANCELLED: 'bg-slate-300',
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}

function formatTimeAgo(timestamp: string | undefined): string {
  if (!timestamp) return 'Never';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatNumber(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

// ─── Pipeline List ────────────────────────────────────────────────────────────

const PipelineList: React.FC<{ pipelines: Pipeline[]; isLoading: boolean; onSelect: (p: Pipeline) => void }> = ({ pipelines, isLoading, onSelect }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | 'ALL'>('ALL');

  const filtered = pipelines.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input type="text" placeholder="Search pipelines..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as PipelineStatus | 'ALL')}
          className="px-3 py-2.5 text-xs font-bold bg-surface border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(pipeline => {
          const statusConf = BUILD_STATUS_CONFIG[pipeline.lastRunStatus || 'PENDING'];
          return (
            <div key={pipeline.id} className="bg-surface rounded-xl border border-border-theme p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => onSelect(pipeline)}>
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl border ${statusConf.color}`}>{statusConf.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-text-primary truncate">{pipeline.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${statusConf.color}`}>{statusConf.label}</span>
                  </div>
                  <p className="text-xs text-text-muted truncate">{pipeline.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-text-muted">
                    <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> {pipeline.branch}</span>
                    <span>{pipeline.repository.split('/').pop()}</span>
                    <span>{pipeline.owner}</span>
                    <span>{formatTimeAgo(pipeline.lastRunAt)}</span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-6 shrink-0">
                  <div className="text-right"><p className="text-sm font-bold text-text-primary">{formatNumber(pipeline.totalRuns)}</p><p className="text-[10px] text-text-muted font-bold uppercase">Runs</p></div>
                  <div className="text-right"><p className={`text-sm font-bold ${pipeline.successRate > 90 ? 'text-emerald-400' : pipeline.successRate > 75 ? 'text-amber-400' : 'text-red-400'}`}>{pipeline.successRate}%</p><p className="text-[10px] text-text-muted font-bold uppercase">Success</p></div>
                  <div className="text-right"><p className="text-sm font-bold text-text-primary">{formatDuration(pipeline.avgDurationMs)}</p><p className="text-[10px] text-text-muted font-bold uppercase">Avg Time</p></div>
                </div>
              </div>

              {/* Stage Pipeline Visual */}
              <div className="flex items-center gap-1 mt-3">
                {pipeline.stages.map((stage, si) => (
                  <React.Fragment key={stage.id}>
                    <div className={`h-1.5 flex-1 rounded-full ${STAGE_STATUS_COLORS[stage.status]}`} />
                    {si < pipeline.stages.length - 1 && <div className="w-1 h-1 rounded-full bg-slate-300" />}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-text-muted">{pipeline.stages[0]?.name}</span>
                <span className="text-[9px] text-text-muted">{pipeline.stages[pipeline.stages.length - 1]?.name}</span>
              </div>

              <div className="flex items-center gap-1.5 mt-2">
                {pipeline.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-surface text-text-muted rounded text-[9px] font-bold border border-border-theme">{tag}</span>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Build List ───────────────────────────────────────────────────────────────

const BuildList: React.FC<{ builds: Build[]; isLoading: boolean; onSelect: (b: Build) => void }> = ({ builds, isLoading, onSelect }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BuildStatus | 'ALL'>('ALL');

  const filtered = builds.filter(b => {
    if (search && !b.pipelineName.toLowerCase().includes(search.toLowerCase()) && !b.commitMessage.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    return true;
  });

  if (isLoading) return <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input type="text" placeholder="Search builds..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as BuildStatus | 'ALL')}
          className="px-3 py-2.5 text-xs font-bold bg-surface border border-border-theme rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="ALL">All Status</option>
          {Object.keys(BUILD_STATUS_CONFIG).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.slice(0, 30).map(build => {
          const stConf = BUILD_STATUS_CONFIG[build.status];
          return (
            <div key={build.id} className="bg-surface rounded-xl border border-border-theme p-4 hover:shadow-md transition-all cursor-pointer" onClick={() => onSelect(build)}>
              <div className="flex items-center gap-3">
                <div className={`${stConf.color} p-1.5 rounded-lg border`}>{stConf.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-text-primary">#{build.number}</span>
                    <span className="text-xs text-text-muted truncate">{build.pipelineName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${stConf.color}`}>{stConf.label}</span>
                  </div>
                  <p className="text-xs text-text-muted truncate">{build.commitMessage}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted">
                    <span className="font-mono">{build.commitSha}</span>
                    <span>{build.branch}</span>
                    <span>{build.commitAuthor}</span>
                    <span>{build.trigger}</span>
                    {build.durationMs && <span>{formatDuration(build.durationMs)}</span>}
                    <span>{formatTimeAgo(build.startedAt)}</span>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4 shrink-0">
                  {build.testsTotal > 0 && (
                    <div className="text-right">
                      <p className={`text-xs font-bold ${build.testsFailed > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{build.testsPassed}/{build.testsTotal}</p>
                      <p className="text-[10px] text-text-muted">Tests</p>
                    </div>
                  )}
                  {build.coverage !== undefined && (
                    <div className="text-right">
                      <p className="text-xs font-bold text-text-primary">{build.coverage}%</p>
                      <p className="text-[10px] text-text-muted">Coverage</p>
                    </div>
                  )}
                  {build.deployedTo && (
                    <span className="px-2 py-0.5 bg-emerald-500/200/20 text-emerald-400 rounded text-[10px] font-bold border border-emerald-500/30">
                      → {build.deployedTo}
                    </span>
                  )}
                </div>
              </div>

              {/* Stage Pipeline */}
              <div className="flex items-center gap-0.5 mt-3">
                {build.stages.map((stage, si) => (
                  <div key={stage.stageId} className={`h-1 flex-1 rounded-full ${STAGE_STATUS_COLORS[stage.status]}`} title={`${stage.stageName}: ${stage.status}`} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Deployment List ──────────────────────────────────────────────────────────

const DeploymentList: React.FC<{ deployments: Deployment[]; isLoading: boolean }> = ({ deployments, isLoading }) => {
  if (isLoading) return <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-3">
      {deployments.map(dep => {
        const stConf = DEPLOY_STATUS_CONFIG[dep.status];
        const envConf = ENV_CONFIG[dep.environment];
        return (
          <div key={dep.id} className="bg-surface rounded-xl border border-border-theme p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${envConf.color} flex items-center justify-center text-white text-lg shadow-md`}>{envConf.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="text-sm font-bold text-text-primary">{dep.pipelineName}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${stConf.color}`}>{stConf.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${envConf.color} text-white`}>{dep.environment}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                  <span className="font-mono">{dep.version}</span>
                  <span className="font-mono">{dep.commitSha}</span>
                  <span>{dep.commitMessage}</span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-text-muted">
                  <span>By: {dep.deployedBy}</span>
                  <span>{formatTimeAgo(dep.deployedAt)}</span>
                  {dep.durationMs && <span>{formatDuration(dep.durationMs)}</span>}
                  {dep.healthCheckStatus && (
                    <span className={`flex items-center gap-1 ${dep.healthCheckStatus === 'HEALTHY' ? 'text-emerald-500' : dep.healthCheckStatus === 'DEGRADED' ? 'text-amber-500' : 'text-red-500'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dep.healthCheckStatus === 'HEALTHY' ? 'bg-emerald-500/200' : dep.healthCheckStatus === 'DEGRADED' ? 'bg-amber-500/200' : 'bg-red-500/200'}`} />
                      {dep.healthCheckStatus}
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2 shrink-0">
                {dep.rollbackAvailable && (
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold border border-amber-500/30 hover:bg-amber-500/200/20 transition-colors">
                    <RotateCcw className="h-3 w-3" /> Rollback
                  </button>
                )}
              </div>
            </div>

            {/* Deployment Metrics Comparison */}
            {dep.status === 'SUCCEEDED' && (
              <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-border-theme">
                <div className="text-center"><span className="text-[9px] font-bold text-text-muted uppercase">Error Rate</span><p className="text-xs font-bold text-text-primary">{dep.metrics.errorRateBefore}% → {dep.metrics.errorRateAfter}%</p></div>
                <div className="text-center"><span className="text-[9px] font-bold text-text-muted uppercase">P50 Latency</span><p className="text-xs font-bold text-text-primary">{dep.metrics.latencyP50Before}ms → {dep.metrics.latencyP50After}ms</p></div>
                <div className="text-center"><span className="text-[9px] font-bold text-text-muted uppercase">CPU</span><p className="text-xs font-bold text-text-primary">{dep.metrics.cpuUsageBefore}% → {dep.metrics.cpuUsageAfter}%</p></div>
                <div className="text-center"><span className="text-[9px] font-bold text-text-muted uppercase">Memory</span><p className="text-xs font-bold text-text-primary">{dep.metrics.memoryUsageBefore}% → {dep.metrics.memoryUsageAfter}%</p></div>
              </div>
            )}

            {/* Approvals */}
            {dep.approvals.length > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] font-bold text-text-muted">APPROVALS:</span>
                {dep.approvals.map(a => (
                  <span key={a.id} className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.status === 'APPROVED' ? 'bg-emerald-500/200/20 text-emerald-400' : a.status === 'PENDING' ? 'bg-amber-500/200/20 text-amber-400' : 'bg-red-500/200/20 text-red-400'}`}>
                    {a.approver}: {a.status}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Environment Health ───────────────────────────────────────────────────────

const EnvironmentHealth: React.FC<{ metrics: DevopsMetrics | null; isLoading: boolean }> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">Environment Health</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.environmentHealth.map(env => {
          const conf = ENV_CONFIG[env.environment];
          return (
            <div key={env.environment} className="bg-surface rounded-xl border border-border-theme p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl ${conf.color} flex items-center justify-center text-white text-xl shadow-lg`}>{conf.icon}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-text-primary">{env.environment}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`w-2 h-2 rounded-full ${env.status === 'HEALTHY' ? 'bg-emerald-500/200' : env.status === 'DEGRADED' ? 'bg-amber-500/200 animate-pulse' : 'bg-red-500/200 animate-pulse'}`} />
                    <span className={`text-xs font-bold ${env.status === 'HEALTHY' ? 'text-emerald-400' : env.status === 'DEGRADED' ? 'text-amber-400' : 'text-red-400'}`}>{env.status}</span>
                  </div>
                </div>
                <span className="text-2xl font-black text-text-primary">{env.uptime}%</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface rounded-lg p-3 text-center"><span className="text-[9px] font-bold text-text-muted uppercase">Version</span><p className="text-xs font-mono font-bold text-text-primary mt-0.5">{env.version}</p></div>
                <div className="bg-surface rounded-lg p-3 text-center"><span className="text-[9px] font-bold text-text-muted uppercase">Uptime</span><p className={`text-xs font-bold mt-0.5 ${env.uptime > 99.9 ? 'text-emerald-400' : env.uptime > 99 ? 'text-amber-400' : 'text-red-400'}`}>{env.uptime}%</p></div>
                <div className="bg-surface rounded-lg p-3 text-center"><span className="text-[9px] font-bold text-text-muted uppercase">Last Deploy</span><p className="text-xs font-bold text-text-primary mt-0.5">{formatTimeAgo(env.lastDeploy)}</p></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Analytics Dashboard ──────────────────────────────────────────────────────

const AnalyticsDashboard: React.FC<{ metrics: DevopsMetrics | null; isLoading: boolean }> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) return <div className="space-y-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl border border-border-theme animate-pulse" />)}</div>;

  return (
    <div className="space-y-6">
      {/* DORA Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Deploy Frequency', value: `${metrics.deployFrequency}/day`, color: 'bg-indigo-500/200' },
          { label: 'Lead Time', value: `${metrics.leadTimeHours}h`, color: 'bg-emerald-500/200' },
          { label: 'MTTR', value: `${metrics.mttrMinutes}m`, color: 'bg-amber-500/200' },
          { label: 'Change Failure', value: `${metrics.changeFailureRate}%`, color: 'bg-red-500/200' },
          { label: 'Rollback Rate', value: `${metrics.rollbackRate}%`, color: 'bg-purple-500/200' },
        ].map(m => (
          <div key={m.label} className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden">
            <div className={`absolute left-0 top-0 w-1 h-full ${m.color} rounded-l-xl`} />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{m.label}</span>
            <p className="text-2xl font-black text-text-primary mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Build Time Distribution & Failure Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Build Time Distribution</h4>
          <div className="space-y-2.5">
            {metrics.buildTimeDistribution.map(d => (
              <div key={d.range} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-text-secondary w-14">{d.range}</span>
                <div className="flex-1 h-3 bg-surface-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500/200 rounded-full transition-all duration-700" style={{ width: `${Math.max(d.percentage, 2)}%` }} />
                </div>
                <span className="text-xs font-bold text-text-primary w-12 text-right">{formatNumber(d.count)}</span>
                <span className="text-[10px] font-bold text-text-muted w-10 text-right">{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
          <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Failure Reasons</h4>
          <div className="space-y-2.5">
            {metrics.failureReasons.map(d => (
              <div key={d.reason} className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-text-secondary w-28 truncate">{d.reason}</span>
                <div className="flex-1 h-3 bg-surface-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full transition-all duration-700" style={{ width: `${Math.max(d.percentage, 2)}%` }} />
                </div>
                <span className="text-xs font-bold text-text-primary w-12 text-right">{d.count}</span>
                <span className="text-[10px] font-bold text-text-muted w-10 text-right">{d.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 14-Day Trend */}
      <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">14-Day Build Trend</h4>
        <div className="flex items-end gap-1 h-24">
          {metrics.pipelineTrend.map((d, i) => {
            const maxVal = Math.max(...metrics.pipelineTrend.map(t => t.builds), 1);
            const totalHeight = (d.builds / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-px" title={`${d.date}: ${d.builds} builds, ${d.succeeded} succeeded, ${d.failed} failed`}>
                <div className="w-full flex flex-col rounded-t-sm overflow-hidden" style={{ height: `${Math.max(totalHeight, 4)}%`, minHeight: '4px' }}>
                  <div className="bg-emerald-400" style={{ height: `${(d.succeeded / (d.builds || 1)) * 100}%` }} />
                  <div className="bg-red-400" style={{ height: `${(d.failed / (d.builds || 1)) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-text-muted">
          <span>{metrics.pipelineTrend[0]?.date}</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-400" /> Succeeded</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-400" /> Failed</span>
          </span>
          <span>{metrics.pipelineTrend[metrics.pipelineTrend.length - 1]?.date}</span>
        </div>
      </div>

      {/* Top Pipelines */}
      <div className="bg-surface rounded-xl border border-border-theme p-6 shadow-sm">
        <h4 className="text-xs font-black text-text-muted uppercase tracking-widest mb-4">Top Pipelines by Activity</h4>
        <div className="space-y-3">
          {metrics.topPipelines.map((p, i) => (
            <div key={p.pipelineId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors">
              <span className="text-xs font-black text-text-muted w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-text-primary">{p.name}</p>
                <p className="text-[10px] text-text-muted">{p.runs} runs · {formatDuration(p.avgDurationMs)} avg</p>
              </div>
              <div className="w-20 h-2 bg-surface-secondary rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/200 rounded-full" style={{ width: `${p.successRate}%` }} />
              </div>
              <span className={`text-xs font-bold ${p.successRate > 90 ? 'text-emerald-400' : 'text-amber-400'}`}>{p.successRate}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Build Detail Modal ───────────────────────────────────────────────────────

const BuildDetailModal: React.FC<{ build: Build | null; isOpen: boolean; onClose: () => void }> = ({ build, isOpen, onClose }) => {
  if (!isOpen || !build) return null;
  const stConf = BUILD_STATUS_CONFIG[build.status];

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start p-4 pt-16 bg-primary-blue/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface rounded-3xl shadow-2xl max-w-3xl w-full border border-border-theme overflow-hidden mb-16">
        <div className="px-6 py-5 border-b border-border-theme flex items-center justify-between bg-surface/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${stConf.color}`}>{stConf.icon}</div>
            <div>
              <h3 className="text-lg font-bold text-text-primary">Build #{build.number}</h3>
              <p className="text-xs text-text-muted">{build.pipelineName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-border-theme text-text-muted"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-surface rounded-xl p-3 border border-border-theme"><span className="text-[10px] font-bold text-text-muted uppercase">Status</span><p className={`text-sm font-bold mt-0.5 ${stConf.color.includes('emerald') ? 'text-emerald-400' : stConf.color.includes('red') ? 'text-red-400' : 'text-text-primary'}`}>{stConf.label}</p></div>
            <div className="bg-surface rounded-xl p-3 border border-border-theme"><span className="text-[10px] font-bold text-text-muted uppercase">Duration</span><p className="text-sm font-bold text-text-primary mt-0.5">{build.durationMs ? formatDuration(build.durationMs) : 'Running...'}</p></div>
            <div className="bg-surface rounded-xl p-3 border border-border-theme"><span className="text-[10px] font-bold text-text-muted uppercase">Branch</span><p className="text-sm font-mono font-bold text-text-primary mt-0.5">{build.branch}</p></div>
            <div className="bg-surface rounded-xl p-3 border border-border-theme"><span className="text-[10px] font-bold text-text-muted uppercase">Trigger</span><p className="text-sm font-bold text-text-primary mt-0.5">{build.trigger}</p></div>
          </div>

          <div className="bg-primary-blue rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><span className="text-xs font-mono text-emerald-400">{build.commitSha}</span></div>
            <p className="text-sm text-white font-medium">{build.commitMessage}</p>
            <p className="text-xs text-text-muted mt-1">by {build.commitAuthor} · {formatTimeAgo(build.startedAt)}</p>
          </div>

          {/* Stage Results */}
          <div>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Pipeline Stages</span>
            <div className="space-y-2">
              {build.stages.map((stage, i) => {
                const sColors: Record<string, string> = { SUCCESS: 'bg-emerald-500/20 border-emerald-500/30', FAILED: 'bg-red-500/20 border-red-500/30', CANCELLED: 'bg-surface border-border-theme', PENDING: 'bg-surface border-border-theme' };
                return (
                  <div key={stage.stageId} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${sColors[stage.status] || 'bg-surface border-border-theme'}`}>
                    <div className={`w-2 h-2 rounded-full ${STAGE_STATUS_COLORS[stage.status]}`} />
                    <span className="text-xs font-bold text-text-primary flex-1">{stage.stageName}</span>
                    <span className={`text-[10px] font-black uppercase ${stage.status === 'SUCCESS' ? 'text-emerald-400' : stage.status === 'FAILED' ? 'text-red-400' : 'text-text-muted'}`}>{stage.status}</span>
                    {stage.durationMs && <span className="text-[10px] text-text-muted">{formatDuration(stage.durationMs)}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Results */}
          {build.testsTotal > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/20 rounded-xl p-3 border border-emerald-100 text-center"><span className="text-[9px] font-bold text-emerald-500 uppercase">Passed</span><p className="text-lg font-black text-emerald-400">{build.testsPassed}</p></div>
              <div className="bg-red-500/20 rounded-xl p-3 border border-red-100 text-center"><span className="text-[9px] font-bold text-red-500 uppercase">Failed</span><p className="text-lg font-black text-red-400">{build.testsFailed}</p></div>
              <div className="bg-surface rounded-xl p-3 border border-border-theme text-center"><span className="text-[9px] font-bold text-text-muted uppercase">Coverage</span><p className="text-lg font-black text-text-primary">{build.coverage ?? 'N/A'}%</p></div>
            </div>
          )}

          {/* Security Issues */}
          {build.securityIssues.length > 0 && (
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Security Issues ({build.securityIssues.length})</span>
              <div className="space-y-2">
                {build.securityIssues.map(issue => (
                  <div key={issue.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${issue.severity === 'HIGH' ? 'bg-red-500/20 border-red-500/30' : issue.severity === 'MEDIUM' ? 'bg-amber-500/20 border-amber-500/30' : 'bg-blue-500/20 border-blue-500/30'}`}>
                    <Shield className={`h-4 w-4 ${issue.severity === 'HIGH' ? 'text-red-500' : issue.severity === 'MEDIUM' ? 'text-amber-500' : 'text-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-text-primary">{issue.category}</p>
                      <p className="text-[10px] text-text-muted">{issue.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${issue.severity === 'HIGH' ? 'bg-red-500/200/20 text-red-400' : issue.severity === 'MEDIUM' ? 'bg-amber-500/200/20 text-amber-400' : 'bg-blue-500/200/20 text-blue-400'}`}>{issue.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artifacts */}
          {build.artifacts.length > 0 && (
            <div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-2 block">Artifacts</span>
              {build.artifacts.map(art => (
                <div key={art.id} className="flex items-center gap-3 px-3 py-2.5 bg-surface rounded-lg border border-border-theme">
                  <Package className="h-4 w-4 text-text-muted" />
                  <span className="text-xs font-bold text-text-primary flex-1">{art.name}</span>
                  <span className="text-[10px] text-text-muted">{(art.sizeBytes / 1000000).toFixed(1)} MB</span>
                  <a href={art.downloadUrl} className="text-xs font-bold text-indigo-400 hover:text-indigo-400 flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Download</a>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border-theme bg-surface/50 flex items-center justify-end">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-white bg-primary-blue hover:bg-indigo-700 rounded-xl transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const DevopsPipelineHub: React.FC = () => {
  const [activeView, setActiveView] = useState<PageView>('pipelines');
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [metrics, setMetrics] = useState<DevopsMetrics | null>(null);

  const [isLoadingPipelines, setIsLoadingPipelines] = useState(true);
  const [isLoadingBuilds, setIsLoadingBuilds] = useState(true);
  const [isLoadingDeployments, setIsLoadingDeployments] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);

  const loadData = useCallback(async () => {
    setIsLoadingPipelines(true);
    setIsLoadingMetrics(true);
    const [p, m] = await Promise.all([DevopsPipelineService.getPipelines(), DevopsPipelineService.getMetrics()]);
    setPipelines(p);
    setMetrics(m);
    setIsLoadingPipelines(false);
    setIsLoadingMetrics(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (activeView === 'builds' && builds.length === 0) {
      setIsLoadingBuilds(true);
      DevopsPipelineService.getBuilds().then(d => { setBuilds(d); setIsLoadingBuilds(false); });
    }
    if (activeView === 'deployments' && deployments.length === 0) {
      setIsLoadingDeployments(true);
      DevopsPipelineService.getDeployments().then(d => { setDeployments(d); setIsLoadingDeployments(false); });
    }
  }, [activeView]);

  const activePipelines = pipelines.filter(p => p.status === 'ACTIVE').length;
  const recentBuilds = builds.filter(b => b.status === 'RUNNING').length;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 font-sans">
      <div className="max-w-[1500px] mx-auto space-y-6">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-surface p-6 rounded-3xl border border-border-theme shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-surface-secondary text-text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-border-theme">
                <Rocket className="h-4 w-4" /> DevOps Platform
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Pipeline Manager</h1>
            <p className="text-sm text-text-muted mt-2 max-w-xl">
              CI/CD pipeline visualization, build tracking, deployment management, and DORA metrics analytics.
            </p>
          </div>
          <button onClick={loadData} className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-theme rounded-xl text-sm font-bold text-text-secondary hover:bg-surface transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden"><div className="absolute left-0 top-0 w-1 h-full bg-indigo-500/200 rounded-l-xl" /><span className="text-[10px] font-bold text-text-muted uppercase">Pipelines</span><p className="text-2xl font-black text-text-primary mt-1">{pipelines.length}</p><span className="text-xs text-text-muted">{activePipelines} active</span></div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden"><div className="absolute left-0 top-0 w-1 h-full bg-emerald-500/200 rounded-l-xl" /><span className="text-[10px] font-bold text-text-muted uppercase">Builds (24h)</span><p className="text-2xl font-black text-text-primary mt-1">{metrics?.buildsLast24h ?? '...'}</p><span className="text-xs text-text-muted">{recentBuilds} running</span></div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden"><div className="absolute left-0 top-0 w-1 h-full bg-blue-500/200 rounded-l-xl" /><span className="text-[10px] font-bold text-text-muted uppercase">Success Rate</span><p className="text-2xl font-black text-text-primary mt-1">{metrics?.successRate ?? '...'}%</p><span className="text-xs text-text-muted">build pipeline</span></div>
          <div className="bg-surface rounded-xl border border-border-theme p-4 shadow-sm relative overflow-hidden"><div className="absolute left-0 top-0 w-1 h-full bg-amber-500/200 rounded-l-xl" /><span className="text-[10px] font-bold text-text-muted uppercase">Deployments</span><p className="text-2xl font-black text-text-primary mt-1">{metrics?.deploymentsLast24h ?? '...'}</p><span className="text-xs text-text-muted">{metrics?.deploymentSuccessRate ?? '...'}% success</span></div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-surface p-1.5 rounded-xl border border-border-theme shadow-sm overflow-x-auto">
          {VIEW_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeView === tab.id ? 'bg-primary-blue text-white shadow-md' : 'text-text-muted hover:text-text-primary hover:bg-surface'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeView === 'pipelines' && <PipelineList pipelines={pipelines} isLoading={isLoadingPipelines} onSelect={() => {}} />}
        {activeView === 'builds' && <BuildList builds={builds} isLoading={isLoadingBuilds} onSelect={setSelectedBuild} />}
        {activeView === 'deployments' && <DeploymentList deployments={deployments} isLoading={isLoadingDeployments} />}
        {activeView === 'environments' && <EnvironmentHealth metrics={metrics} isLoading={isLoadingMetrics} />}
        {activeView === 'analytics' && <AnalyticsDashboard metrics={metrics} isLoading={isLoadingMetrics} />}
      </div>

      {/* Build Detail Modal */}
      <BuildDetailModal build={selectedBuild} isOpen={selectedBuild !== null} onClose={() => setSelectedBuild(null)} />
    </div>
  );
};

export default DevopsPipelineHub;

// ─── Audit Log Metrics Cards ──────────────────────────────────────────────────
// Displays summary KPI cards with trend indicators and a mini bar chart for
// severity breakdown and category distribution.

import React from 'react';
import {
  Activity, AlertTriangle, Users, ShieldAlert, TrendingUp, TrendingDown,
  BarChart3, PieChart, Globe2, Clock,
} from 'lucide-react';
import { AuditMetrics, AuditSeverity, AuditCategory } from '../../types/auditLog';

interface AuditLogMetricsProps {
  metrics: AuditMetrics | null;
  isLoading: boolean;
}

const SEVERITY_COLORS: Record<AuditSeverity, string> = {
  INFO: 'bg-emerald-500/200',
  WARNING: 'bg-amber-500/200',
  CRITICAL: 'bg-red-500/200',
  EMERGENCY: 'bg-rose-600',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  AUTHENTICATION: <Activity className="h-3.5 w-3.5" />,
  SECURITY: <ShieldAlert className="h-3.5 w-3.5" />,
  USER_MANAGEMENT: <Users className="h-3.5 w-3.5" />,
  BILLING: <PieChart className="h-3.5 w-3.5" />,
  API_ACCESS: <BarChart3 className="h-3.5 w-3.5" />,
  DATA_MODIFICATION: <Activity className="h-3.5 w-3.5" />,
};

const KpiCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  accent: string;
  isLoading: boolean;
}> = ({ label, value, icon, trend, trendLabel, accent, isLoading }) => (
  <div className="bg-surface rounded-2xl border border-border-theme p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className={`absolute left-0 top-0 w-1.5 h-full ${accent} rounded-l-2xl`} />
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{label}</p>
        {isLoading ? (
          <div className="h-9 w-24 bg-surface-secondary rounded-lg animate-pulse" />
        ) : (
          <p className="text-3xl font-black text-text-primary tracking-tight">{value}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            <span>{trend >= 0 ? '+' : ''}{trend}%</span>
            {trendLabel && <span className="text-text-muted font-medium">{trendLabel}</span>}
          </div>
        )}
      </div>
      <div className={`p-2.5 rounded-xl ${accent.replace('bg-', 'bg-').replace('500', '50')} text-text-primary`}>
        {icon}
      </div>
    </div>
  </div>
);

const MiniBarChart: React.FC<{
  data: Array<{ label: string; value: number; color?: string }>;
  maxValue: number;
}> = ({ data, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-sm ${d.color || 'bg-indigo-500/200'} transition-all duration-500`}
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%`, minHeight: '4px' }}
          />
        </div>
      ))}
    </div>
  );
};

export const AuditLogMetrics: React.FC<AuditLogMetricsProps> = ({ metrics, isLoading }) => {
  if (isLoading || !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-2xl border border-border-theme p-5 shadow-sm animate-pulse">
            <div className="h-3 w-20 bg-surface-secondary rounded mb-3" />
            <div className="h-8 w-28 bg-surface-secondary rounded mb-2" />
            <div className="h-3 w-16 bg-surface-secondary rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Events"
          value={metrics.totalEvents.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
          trend={metrics.eventsTrend}
          trendLabel="vs yesterday"
          accent="bg-indigo-500/200"
          isLoading={isLoading}
        />
        <KpiCard
          label="Critical Events"
          value={metrics.criticalEvents}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="bg-red-500/200"
          isLoading={isLoading}
        />
        <KpiCard
          label="Unique Actors"
          value={metrics.uniqueActors}
          icon={<Users className="h-5 w-5" />}
          accent="bg-emerald-500/200"
          isLoading={isLoading}
        />
        <KpiCard
          label="Avg Risk Score"
          value={`${metrics.riskScoreAvg}/100`}
          icon={<ShieldAlert className="h-5 w-5" />}
          accent="bg-amber-500/200"
          isLoading={isLoading}
        />
      </div>

      {/* Secondary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Events (24h)"
          value={metrics.eventsLast24h.toLocaleString()}
          icon={<Clock className="h-5 w-5" />}
          accent="bg-cyan-500/200"
          isLoading={isLoading}
        />
        <KpiCard
          label="Failed Logins"
          value={metrics.failedLogins}
          icon={<ShieldAlert className="h-5 w-5" />}
          accent="bg-rose-500"
          isLoading={isLoading}
        />

        {/* Severity Breakdown Mini Card */}
        <div className="bg-surface rounded-2xl border border-border-theme p-5 shadow-sm col-span-1 sm:col-span-2 lg:col-span-2">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Severity Distribution</p>
          <div className="space-y-2.5">
            {metrics.severityBreakdown.map(s => (
              <div key={s.severity} className="flex items-center gap-3">
                <span className="text-xs font-bold text-text-secondary w-20">{s.severity}</span>
                <div className="flex-1 h-3 bg-surface-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${SEVERITY_COLORS[s.severity]} transition-all duration-700`}
                    style={{ width: `${Math.max(s.percentage, 2)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-text-primary w-16 text-right">{s.count} ({s.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Activity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-border-theme p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Hourly Activity (24h)</p>
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
              <Globe2 className="h-3.5 w-3.5" /> UTC Time
            </div>
          </div>
          <MiniBarChart
            data={metrics.hourlyDistribution.map(h => ({
              label: `${h.hour}`,
              value: h.count,
              color: h.count > 15 ? 'bg-red-400' : h.count > 8 ? 'bg-amber-400' : 'bg-indigo-400',
            }))}
            maxValue={Math.max(...metrics.hourlyDistribution.map(h => h.count))}
          />
          <div className="flex justify-between mt-2 text-[10px] font-bold text-text-muted">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-surface rounded-2xl border border-border-theme p-6 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Top Categories</p>
          <div className="space-y-3">
            {metrics.topCategories.slice(0, 5).map((cat, i) => (
              <div key={cat.category} className="flex items-center gap-3 group">
                <span className="text-xs font-black text-text-muted w-5">{i + 1}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1 rounded bg-surface-secondary text-text-muted">
                    {CATEGORY_ICONS[cat.category] || <Activity className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-xs font-bold text-text-primary truncate">{cat.category.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-surface-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500/200 rounded-full" style={{ width: `${cat.percentage}%` }} />
                  </div>
                  <span className="text-xs font-bold text-text-muted w-12 text-right">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Actors & Regions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl border border-border-theme p-6 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Most Active Actors</p>
          <div className="space-y-3">
            {metrics.topActors.map((actor, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {actor.actorName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-text-primary truncate">{actor.actorName}</p>
                  <p className="text-xs text-text-muted truncate">{actor.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-text-primary">{actor.eventCount}</p>
                  <p className={`text-xs font-bold ${actor.riskScore > 50 ? 'text-red-500' : actor.riskScore > 25 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    Risk: {actor.riskScore}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-border-theme p-6 shadow-sm">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Events by Region</p>
          <div className="space-y-3">
            {metrics.regionBreakdown.map((region, i) => (
              <div key={region.region} className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-surface-secondary text-text-secondary">
                  <Globe2 className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-text-primary">{region.region}</span>
                    <span className="text-xs font-bold text-text-muted">{region.count} events ({region.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all duration-700" style={{ width: `${region.percentage}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogMetrics;

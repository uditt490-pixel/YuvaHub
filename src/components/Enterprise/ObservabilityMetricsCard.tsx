// ═══════════════════════════════════════════════════════════════════
// Observability Metrics Card Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import {
  Activity, Server, AlertTriangle, CheckCircle2, Clock,
  TrendingUp, TrendingDown, Zap, Shield, BarChart3,
  RefreshCw, ArrowUpRight, ArrowDownRight, CircleDot
} from 'lucide-react';
import { OverallHealthScore, MonitoredService } from '../../types/observability';

interface MetricsCardProps {
  healthScore: OverallHealthScore | null;
  services: MonitoredService[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const ObservabilityMetricsCard: React.FC<MetricsCardProps> = ({
  healthScore,
  services,
  isLoading,
  onRefresh
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (healthScore) {
      const target = healthScore.score;
      const duration = 1000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setAnimatedScore(target);
          clearInterval(timer);
        } else {
          setAnimatedScore(Math.round(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [healthScore]);

  if (isLoading || !healthScore) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
            <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  const scoreColor = healthScore.score >= 90 ? 'text-emerald-600' : healthScore.score >= 70 ? 'text-amber-600' : 'text-red-600';
  const scoreBg = healthScore.score >= 90 ? 'from-emerald-50 to-emerald-100/50' : healthScore.score >= 70 ? 'from-amber-50 to-amber-100/50' : 'from-red-50 to-red-100/50';
  const scoreRing = healthScore.score >= 90 ? '#10b981' : healthScore.score >= 70 ? '#f59e0b' : '#ef4444';

  const avgResponseTrend = healthScore.averageResponseTime < 150 ? 'down' : 'up';

  const metrics = [
    {
      label: 'Health Score',
      value: `${animatedScore}%`,
      subtext: `${healthScore.totalServices} services monitored`,
      icon: <Activity className="h-5 w-5" />,
      color: 'text-indigo-600',
      bgClass: `bg-gradient-to-br ${scoreBg}`,
      custom: (
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle
                cx="32" cy="32" r="28" fill="none"
                stroke={scoreRing}
                strokeWidth="4"
                strokeDasharray={`${(animatedScore / 100) * 175.93} 175.93`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center text-lg font-extrabold ${scoreColor}`}>
              {animatedScore}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Health Score</div>
            <div className={`text-xs font-medium ${scoreColor}`}>
              {healthScore.score >= 90 ? 'All Systems Go' : healthScore.score >= 70 ? 'Minor Issues' : 'Action Required'}
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Operational',
      value: healthScore.operationalCount,
      subtext: `of ${healthScore.totalServices} services`,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: 'text-emerald-600',
      bgClass: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50'
    },
    {
      label: 'Degraded',
      value: healthScore.degradedCount,
      subtext: 'performance impacted',
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'text-amber-600',
      bgClass: 'bg-gradient-to-br from-amber-50 to-amber-100/50'
    },
    {
      label: 'Outage',
      value: healthScore.outageCount,
      subtext: healthScore.outageCount === 0 ? 'no active outages' : 'services down',
      icon: <Zap className="h-5 w-5" />,
      color: 'text-red-600',
      bgClass: 'bg-gradient-to-br from-red-50 to-red-100/50'
    },
    {
      label: 'Avg Response',
      value: `${healthScore.averageResponseTime}ms`,
      subtext: (
        <span className={`inline-flex items-center gap-0.5 ${avgResponseTrend === 'down' ? 'text-emerald-600' : 'text-red-600'}`}>
          {avgResponseTrend === 'down'
            ? <ArrowDownRight className="h-3 w-3" />
            : <ArrowUpRight className="h-3 w-3" />}
          {avgResponseTrend === 'down' ? 'Good' : 'High'}
        </span>
      ),
      icon: <Clock className="h-5 w-5" />,
      color: 'text-blue-600',
      bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100/50'
    },
    {
      label: 'Avg Uptime',
      value: `${healthScore.averageUptime}%`,
      subtext: '30-day average',
      icon: <Shield className="h-5 w-5" />,
      color: 'text-indigo-600',
      bgClass: 'bg-gradient-to-br from-indigo-50 to-indigo-100/50'
    },
    {
      label: 'Open Incidents',
      value: healthScore.openIncidents,
      subtext: `${healthScore.criticalIncidents} critical`,
      icon: <Server className="h-5 w-5" />,
      color: healthScore.openIncidents > 0 ? 'text-orange-600' : 'text-emerald-600',
      bgClass: 'bg-gradient-to-br from-orange-50 to-orange-100/50'
    },
    {
      label: 'Maintenance',
      value: healthScore.maintenanceCount,
      subtext: 'scheduled',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-violet-600',
      bgClass: 'bg-gradient-to-br from-violet-50 to-violet-100/50'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">System Overview</h2>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={`${metric.bgClass} rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all duration-300 group`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {metric.custom || (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-500">{metric.label}</span>
                  <span className={`p-1.5 rounded-lg bg-white/70 ${metric.color} group-hover:scale-110 transition-transform`}>
                    {metric.icon}
                  </span>
                </div>
                <div className={`text-2xl font-extrabold ${metric.color} tracking-tight`}>
                  {metric.value}
                </div>
                <div className="text-xs text-slate-500 mt-1">{metric.subtext}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ObservabilityMetricsCard;

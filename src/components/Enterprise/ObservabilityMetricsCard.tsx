import React from 'react';
import { ServiceMetric, SystemHealthScore } from '../../types/observability';
import { Activity, Server, Clock, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

interface Props {
  healthScore: SystemHealthScore;
  metrics: ServiceMetric[];
}

export const ObservabilityMetricsCard: React.FC<Props> = ({ healthScore, metrics }) => {
  const avgUptime = (metrics.reduce((acc, m) => acc + m.uptime24h, 0) / (metrics.length || 1)).toFixed(2);
  const avgLatency = Math.round(metrics.reduce((acc, m) => acc + m.latencyMs, 0) / (metrics.length || 1));
  const avgErrorRate = (metrics.reduce((acc, m) => acc + m.errorRate, 0) / (metrics.length || 1)).toFixed(2);

  // SVG Circular progress ring calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore.overallScore / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Animated Circular Health Ring Card */}
      <div className="p-6 bg-primary-blue border border-border-theme rounded-3xl flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity className="h-32 w-32 text-indigo-500" />
        </div>

        <div className="relative flex items-center justify-center my-2">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-text-primary"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out ${
                healthScore.overallScore >= 90 ? 'text-emerald-500' :
                healthScore.overallScore >= 70 ? 'text-amber-500' : 'text-rose-500'
              }`}
              fill="transparent"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white tracking-tight">{healthScore.overallScore}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Health Index</span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-200 mt-2">Overall Topology Score</h3>
        <p className="text-xs text-text-muted mt-1">
          {healthScore.operationalServices} of {healthScore.totalServices} nodes operational
        </p>
      </div>

      {/* 3 Metrics Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-primary-blue/60 border border-border-theme rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-2xl bg-emerald-500/200/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-500/200/10 text-emerald-400 border border-emerald-500/20">
              Target 99.9%
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-bold uppercase text-text-muted tracking-wider">Avg 24h Uptime</div>
            <div className="text-2xl font-black text-white mt-1">{avgUptime}%</div>
          </div>
          <div className="mt-3 text-xs text-text-muted border-t border-border-theme/80 pt-2 flex justify-between">
            <span>SLA Floor</span>
            <span className="font-semibold text-slate-200">99.90%</span>
          </div>
        </div>

        <div className="p-5 bg-primary-blue/60 border border-border-theme rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-2.5 rounded-2xl bg-indigo-500/200/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-indigo-500/200/10 text-indigo-400 border border-indigo-500/20">
              P95 Window
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-bold uppercase text-text-muted tracking-wider">Mean Latency</div>
            <div className="text-2xl font-black text-white mt-1">{avgLatency} ms</div>
          </div>
          <div className="mt-3 text-xs text-text-muted border-t border-border-theme/80 pt-2 flex justify-between">
            <span>Edge Target</span>
            <span className="font-semibold text-slate-200">&lt; 50 ms</span>
          </div>
        </div>

        <div className="p-5 bg-primary-blue/60 border border-border-theme rounded-3xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className={`p-2.5 rounded-2xl border ${
              Number(avgErrorRate) > 1 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/200/10 text-amber-400 border-amber-500/20'
            }`}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-surface-secondary text-slate-300 border border-border-theme">
              Real-time
            </span>
          </div>
          <div className="mt-4">
            <div className="text-xs font-bold uppercase text-text-muted tracking-wider">Error Rate</div>
            <div className="text-2xl font-black text-white mt-1">{avgErrorRate}%</div>
          </div>
          <div className="mt-3 text-xs text-text-muted border-t border-border-theme/80 pt-2 flex justify-between">
            <span>Burn Ceiling</span>
            <span className="font-semibold text-slate-200">0.05%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

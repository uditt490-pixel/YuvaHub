import React from 'react';
import { ZeroTrustAnalytics } from '../../types/zeroTrustSecurity';
import { ShieldCheck, ShieldAlert, Lock, Zap, Server, Activity, Globe } from 'lucide-react';

interface ZeroTrustMetricsCardProps {
  analytics: ZeroTrustAnalytics;
}

export const ZeroTrustMetricsCard: React.FC<ZeroTrustMetricsCardProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* 4 Core KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gateway Volume (24h)
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {(analytics.totalRequestsToday / 1000).toFixed(1)}k
            </span>
            <span className="text-xs font-semibold text-slate-500">Requests</span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> 100% Ingress Inspected
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Blocked Threat Invasions
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {analytics.blockedAttacks}
            </span>
            <span className="text-xs font-semibold text-slate-500">Neutralized</span>
          </div>
          <div className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Zero Lateral Breaches
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Quarantined IPs
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {analytics.activeQuarantines}
            </span>
            <span className="text-xs font-semibold text-slate-500">Nodes Isolated</span>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-1">
            Avg Risk Score: {analytics.averageRiskScore}/100
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              SOC-2 / ISO Compliance
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {analytics.soc2ComplianceScore}%
            </span>
            <span className="text-xs font-semibold text-slate-500">Audit Score</span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
            Zero-Trust Continuous Verification
          </div>
        </div>
      </div>

      {/* Deep Dives: Threat Breakdown & Protocol Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Threat Severity Vector Breakdown
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.threatDistribution.map((t) => (
              <div key={t.severity} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">{t.severity.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400">{t.count} Events ({t.percentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={
                      t.severity === 'CRITICAL_BREACH'
                        ? 'bg-rose-600 h-full rounded-full'
                        : t.severity === 'HIGH'
                        ? 'bg-orange-500 h-full rounded-full'
                        : t.severity === 'MEDIUM'
                        ? 'bg-amber-500 h-full rounded-full'
                        : 'bg-emerald-500 h-full rounded-full'
                    }
                    style={{ width: `${t.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Protocol Ingress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Zero-Trust Gate Protocol Ingress
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.protocolVelocity.map((p) => (
              <div key={p.protocol} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">{p.protocol.replace(/_/g, ' ')}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{(p.requestCount / 1000).toFixed(1)}k req (Block: {p.blockRate}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full" style={{ width: `${Math.min(100, p.requestCount / 1000)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

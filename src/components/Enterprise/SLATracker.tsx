// ═══════════════════════════════════════════════════════════════════
// SLA Tracker Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX, TrendingUp,
  TrendingDown, Clock, AlertTriangle, CheckCircle2, Target,
  Gauge, ArrowRight, Info, ChevronDown, ChevronRight,
  Activity, Zap, BarChart3
} from 'lucide-react';
import { SLATarget, ServiceStatus } from '../../types/observability';

interface SLATrackerProps {
  slaTargets: SLATarget[];
  isLoading: boolean;
  onServiceClick?: (serviceId: string) => void;
}

const STATUS_CONFIG = {
  meeting: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: <ShieldCheck className="h-4 w-4" />, label: 'Meeting SLA', color: '#10b981' },
  at_risk: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: <ShieldAlert className="h-4 w-4" />, label: 'At Risk', color: '#f59e0b' },
  breached: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: <ShieldX className="h-4 w-4" />, label: 'Breached', color: '#ef4444' }
};

function BudgetBar({ remaining, total, color }: { remaining: number; total: number; color: string }) {
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const barColor = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
        <span>Error Budget</span>
        <span className="font-mono font-semibold" style={{ color: barColor }}>{remaining.toFixed(4)}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
        <span>0%</span>
        <span>of {total.toFixed(3)}% budget</span>
      </div>
    </div>
  );
}

function BurnRateIndicator({ rate }: { rate: number }) {
  const severity = rate > 5 ? 'critical' : rate > 2 ? 'warning' : 'healthy';
  const colors = {
    critical: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
    healthy: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors[severity].bg} ${colors[severity].text}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${colors[severity].dot}`} />
      {rate.toFixed(1)}x burn rate
    </div>
  );
}

export const SLATracker: React.FC<SLATrackerProps> = ({
  slaTargets,
  isLoading,
  onServiceClick
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-xl mb-3" />
        ))}
      </div>
    );
  }

  const meetingCount = slaTargets.filter(s => s.status === 'meeting').length;
  const atRiskCount = slaTargets.filter(s => s.status === 'at_risk').length;
  const breachedCount = slaTargets.filter(s => s.status === 'breached').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50">
              <Target className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">SLA Compliance</h3>
              <p className="text-xs text-slate-500">
                {meetingCount} meeting · {atRiskCount} at risk · {breachedCount} breached
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'cards' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-emerald-600">{meetingCount}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Meeting
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-amber-600">{atRiskCount}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <AlertTriangle className="h-3 w-3" /> At Risk
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-red-600">{breachedCount}</div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <ShieldX className="h-3 w-3" /> Breached
            </div>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="p-6 space-y-4">
          {slaTargets.map(sla => {
            const config = STATUS_CONFIG[sla.status];
            const isExpanded = expandedId === sla.id;
            const uptimePct = ((sla.currentUptime / sla.targetUptime) * 100).toFixed(1);
            const responsePct = sla.currentResponseTimeMs <= sla.targetResponseTimeMs
              ? '100'
              : ((sla.targetResponseTimeMs / sla.currentResponseTimeMs) * 100).toFixed(0);

            return (
              <div
                key={sla.id}
                className={`rounded-xl border transition-all duration-300 ${
                  isExpanded ? `${config.bg} ${config.border}` : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Card Header */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : sla.id)}
                >
                  {/* Status Icon */}
                  <div className={`p-2.5 rounded-xl ${config.bg} ${config.text}`}>
                    {config.icon}
                  </div>

                  {/* SLA Name & Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{sla.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Target: {sla.targetUptime}% uptime · ≤{sla.targetResponseTimeMs}ms response
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="text-center">
                      <div className={`text-lg font-extrabold ${sla.currentUptime >= sla.targetUptime ? 'text-emerald-600' : 'text-red-600'}`}>
                        {sla.currentUptime}%
                      </div>
                      <div className="text-[10px] text-slate-400">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-extrabold ${sla.currentResponseTimeMs <= sla.targetResponseTimeMs ? 'text-emerald-600' : 'text-red-600'}`}>
                        {sla.currentResponseTimeMs}ms
                      </div>
                      <div className="text-[10px] text-slate-400">P99 Response</div>
                    </div>
                  </div>

                  {/* Burn Rate */}
                  {sla.burnRate && <BurnRateIndicator rate={sla.burnRate} />}

                  {/* Expand */}
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-200/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {/* Error Budget */}
                      <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Gauge className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm font-semibold text-slate-700">Error Budget</span>
                        </div>
                        <BudgetBar
                          remaining={sla.errorBudgetRemaining}
                          total={sla.errorBudgetTotal}
                          color={config.color}
                        />
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <div className="text-center p-2 bg-slate-50 rounded-lg">
                            <div className="text-xs text-slate-400">Remaining</div>
                            <div className="text-sm font-bold text-slate-700">{sla.errorBudgetRemaining.toFixed(4)}%</div>
                          </div>
                          <div className="text-center p-2 bg-slate-50 rounded-lg">
                            <div className="text-xs text-slate-400">Total</div>
                            <div className="text-sm font-bold text-slate-700">{sla.errorBudgetTotal.toFixed(3)}%</div>
                          </div>
                        </div>
                      </div>

                      {/* Current vs Target */}
                      <div className="bg-white rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 className="h-4 w-4 text-indigo-500" />
                          <span className="text-sm font-semibold text-slate-700">Current vs Target</span>
                        </div>
                        <div className="space-y-3">
                          {/* Uptime */}
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500">Uptime</span>
                              <span className={`font-semibold ${sla.currentUptime >= sla.targetUptime ? 'text-emerald-600' : 'text-red-600'}`}>
                                {sla.currentUptime}% / {sla.targetUptime}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min((sla.currentUptime / sla.targetUptime) * 100, 100)}%`,
                                  backgroundColor: sla.currentUptime >= sla.targetUptime ? '#10b981' : '#ef4444'
                                }}
                              />
                            </div>
                          </div>
                          {/* Response Time */}
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500">Response Time</span>
                              <span className={`font-semibold ${sla.currentResponseTimeMs <= sla.targetResponseTimeMs ? 'text-emerald-600' : 'text-red-600'}`}>
                                {sla.currentResponseTimeMs}ms / {sla.targetResponseTimeMs}ms
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min((sla.targetResponseTimeMs / Math.max(sla.currentResponseTimeMs, 1)) * 100, 100)}%`,
                                  backgroundColor: sla.currentResponseTimeMs <= sla.targetResponseTimeMs ? '#10b981' : '#ef4444'
                                }}
                              />
                            </div>
                          </div>
                          {/* Error Rate */}
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500">Error Rate</span>
                              <span className={`font-semibold ${sla.currentErrorRate <= sla.targetErrorRate ? 'text-emerald-600' : 'text-red-600'}`}>
                                {sla.currentErrorRate}% / ≤{sla.targetErrorRate}%
                              </span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min((sla.currentErrorRate / Math.max(sla.targetErrorRate, 0.1)) * 100, 100)}%`,
                                  backgroundColor: sla.currentErrorRate <= sla.targetErrorRate ? '#10b981' : '#ef4444'
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Period Info */}
                    <div className="flex items-center justify-between mt-4 px-3 py-2 bg-slate-50 rounded-lg text-xs text-slate-500">
                      <span>
                        <Clock className="h-3 w-3 inline mr-1" />
                        Period: {sla.periodDays} days
                      </span>
                      <span>
                        {new Date(sla.periodStart).toLocaleDateString()} — {new Date(sla.periodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">SLA Target</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Uptime</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">P99 Response</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Error Rate</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Error Budget</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Burn Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {slaTargets.map(sla => {
                const config = STATUS_CONFIG[sla.status];
                return (
                  <tr key={sla.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{sla.name}</div>
                      <div className="text-xs text-slate-400">Target: {sla.targetUptime}%</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
                        {config.icon} {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${sla.currentUptime >= sla.targetUptime ? 'text-emerald-600' : 'text-red-600'}`}>
                        {sla.currentUptime}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${sla.currentResponseTimeMs <= sla.targetResponseTimeMs ? 'text-emerald-600' : 'text-red-600'}`}>
                        {sla.currentResponseTimeMs}ms
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${sla.currentErrorRate <= sla.targetErrorRate ? 'text-emerald-600' : 'text-red-600'}`}>
                        {sla.currentErrorRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${sla.errorBudgetRemaining > sla.errorBudgetTotal * 0.3 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {sla.errorBudgetRemaining.toFixed(3)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {sla.burnRate && <BurnRateIndicator rate={sla.burnRate} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SLATracker;

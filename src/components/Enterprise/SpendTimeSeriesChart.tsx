// ═══════════════════════════════════════════════════════════════════
// Spend Time Series — Cloud Spend Chart Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SpendTimeSeries, CostBudget, CloudProvider } from '../../types/costOptimization';

interface Props { traffic: SpendTimeSeries[]; budgets: CostBudget[]; isLoading: boolean; }

const PROVIDER_COLORS: Record<CloudProvider, string> = { aws: '#FF9900', gcp: '#4285F4', azure: '#0078D4', alibaba: '#FF6A00', self_hosted: '#6B7280' };
const PROVIDER_LABELS: Record<CloudProvider, string> = { aws: 'AWS', gcp: 'GCP', azure: 'Azure', alibaba: 'Alibaba', self_hosted: 'Self-Hosted' };

export const SpendTimeSeriesChart: React.FC<Props> = ({ traffic, budgets, isLoading }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (isLoading) return <div className="bg-surface rounded-2xl border border-border-theme p-6 animate-pulse"><div className="h-6 bg-border-theme rounded w-48 mb-4" /><div className="h-48 bg-surface-secondary rounded-xl" /></div>;

  const maxVal = Math.max(...traffic.map(t => t.total), 1);
  const chartW = 800, chartH = 200, padX = 40, padY = 20;
  const barW = (chartW - padX * 2) / traffic.length - 1;

  const totalSpend = traffic.reduce((a, t) => a + t.total, 0);
  const avgDaily = totalSpend / traffic.length;

  return (
    <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
      <div className="px-6 py-4 border-b border-border-theme">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20"><BarChart3 className="h-5 w-5 text-amber-400" /></div>
            <div><h3 className="text-lg font-bold text-text-primary">Spend Trend</h3><p className="text-xs text-text-muted">30-day daily breakdown by provider</p></div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-bold text-text-primary">₹{totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="text-xs text-text-muted">total</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4">
          {(['aws', 'gcp', 'azure'] as CloudProvider[]).map(p => (
            <span key={p} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: PROVIDER_COLORS[p] }} />{PROVIDER_LABELS[p]}
            </span>
          ))}
          <span className="text-xs text-text-muted ml-auto">Avg: ₹{avgDaily.toFixed(0)}/day</span>
        </div>
        {/* Chart */}
        <div className="relative">
          <svg viewBox={`0 0 ${chartW} ${chartH + padY}`} className="w-full h-48">
            {traffic.map((t, i) => {
              const x = padX + i * (barW + 1);
              const hAws = (t.aws / maxVal) * (chartH - padY);
              const hGcp = (t.gcp / maxVal) * (chartH - padY);
              const hAzure = (t.azure / maxVal) * (chartH - padY);
              const yBase = chartH;
              return (
                <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
                  <rect x={x} y={yBase - hAzure} width={barW} height={hAzure} fill={PROVIDER_COLORS.azure} opacity={hoveredIdx === i ? 1 : 0.7} rx="1" />
                  <rect x={x} y={yBase - hAzure - hGcp} width={barW} height={hGcp} fill={PROVIDER_COLORS.gcp} opacity={hoveredIdx === i ? 1 : 0.7} rx="1" />
                  <rect x={x} y={yBase - hAzure - hGcp - hAws} width={barW} height={hAws} fill={PROVIDER_COLORS.aws} opacity={hoveredIdx === i ? 1 : 0.7} rx="1" />
                </g>
              );
            })}
          </svg>
          {hoveredIdx !== null && (
            <div className="absolute top-2 right-2 bg-surface-secondary text-white text-xs rounded-xl px-4 py-3 shadow-xl z-10">
              <div className="font-bold mb-1">{traffic[hoveredIdx].date}</div>
              <div className="text-amber-300">AWS: ₹{traffic[hoveredIdx].aws.toFixed(0)}</div>
              <div className="text-blue-300">GCP: ₹{traffic[hoveredIdx].gcp.toFixed(0)}</div>
              <div className="text-cyan-300">Azure: ₹{traffic[hoveredIdx].azure.toFixed(0)}</div>
              <div className="border-t border-slate-600 mt-1 pt-1 font-bold">Total: ₹{traffic[hoveredIdx].total.toFixed(0)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpendTimeSeriesChart;

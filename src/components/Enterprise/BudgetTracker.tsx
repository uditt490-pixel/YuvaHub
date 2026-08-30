// ═══════════════════════════════════════════════════════════════════
// Budget Tracker — Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Target, AlertTriangle, TrendingUp, ChevronDown, Clock, DollarSign, CheckCircle2 } from 'lucide-react';
import { CostBudget } from '../../types/costOptimization';

interface Props { budgets: CostBudget[]; isLoading: boolean; }

function formatCost(n: number) { return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n.toFixed(0)}`; }

export const BudgetTracker: React.FC<Props> = ({ budgets, isLoading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) return <div className="bg-surface rounded-2xl border border-border-theme p-6 animate-pulse"><div className="h-6 bg-border-theme rounded w-48 mb-4" />{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-surface-secondary rounded-xl mb-3" />)}</div>;

  const overBudget = budgets.filter(b => b.isOverBudget).length;
  const atRisk = budgets.filter(b => !b.isOverBudget && b.currentUsagePercent > 70).length;

  return (
    <div className="bg-surface rounded-2xl border border-border-theme overflow-hidden">
      <div className="px-6 py-4 border-b border-border-theme">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20"><Target className="h-5 w-5 text-indigo-400" /></div>
          <div><h3 className="text-lg font-bold text-text-primary">Budget Tracker</h3><p className="text-xs text-text-muted">{budgets.length} budgets · {overBudget} over · {atRisk} at risk</p></div>
        </div>
      </div>
      <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto">
        {budgets.map(b => {
          const isExpanded = expandedId === b.id;
          const pct = Math.min(b.currentUsagePercent, 120);
          const barColor = b.isOverBudget ? '#ef4444' : b.currentUsagePercent > 80 ? '#f59e0b' : b.currentUsagePercent > 60 ? '#3b82f6' : '#10b981';
          const forecastPct = (b.forecastedAmount / b.limitAmount) * 100;
          return (
            <div key={b.id} className={`px-6 py-4 transition-all cursor-pointer ${b.isOverBudget ? 'bg-red-500/20/50' : 'hover:bg-surface'}`} onClick={() => setExpandedId(isExpanded ? null : b.id)}>
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-text-primary">{b.name}</h4>
                    {b.isOverBudget && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/200/20 text-red-400">OVER BUDGET</span>}
                    <span className="text-xs text-text-muted capitalize">{b.category === 'all' ? b.provider : b.category}</span>
                  </div>
                  <div className="w-full h-3 bg-surface-secondary rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
                    <div className="absolute right-1 top-0 h-full flex items-center">
                      <span className="text-[9px] font-bold text-text-secondary">{b.currentUsagePercent}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-xs text-text-muted">
                    <span>{formatCost(b.spentAmount)} / {formatCost(b.limitAmount)}</span>
                    <span>Forecast: {formatCost(b.forecastedAmount)}</span>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-text-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
              {isExpanded && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Spent</div><div className="text-sm font-bold text-text-primary">{formatCost(b.spentAmount)}</div></div>
                  <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Limit</div><div className="text-sm font-bold text-text-primary">{formatCost(b.limitAmount)}</div></div>
                  <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Remaining</div><div className={`text-sm font-bold ${b.isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>{formatCost(Math.max(0, b.limitAmount - b.spentAmount))}</div></div>
                  <div className="bg-surface rounded-xl p-3 border border-border-theme"><div className="text-[10px] text-text-muted">Alert At</div><div className="text-sm font-bold text-amber-400">{b.alertThresholdPercent}%</div></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetTracker;

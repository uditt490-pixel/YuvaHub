import React from 'react';
import { GrantAnalytics } from '../../types/researchGrant';
import { Award, DollarSign, BookOpen, ShieldCheck, TrendingUp, Sparkles, Building2 } from 'lucide-react';

interface ResearchGrantMetricsCardProps {
  analytics: GrantAnalytics;
}

export const ResearchGrantMetricsCard: React.FC<ResearchGrantMetricsCardProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* 4 Core Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Total Disbursed Capital
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 dark:bg-emerald-950/50 text-emerald-400 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary dark:text-white">
              ₹{(analytics.totalDisbursedCapitalLakhs / 100).toFixed(2)} Cr
            </span>
            <span className="text-xs font-semibold text-text-muted">/ ₹{(analytics.totalRequestedCapitalLakhs / 100).toFixed(2)} Cr Req</span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Milestone Automated Releases
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Funded Lab Proposals
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/20 dark:bg-blue-950/50 text-blue-400 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-blue-400 dark:text-blue-400">
              {analytics.fundedProposalsCount}
            </span>
            <span className="text-xs font-semibold text-text-muted">/ {analytics.activeProposals} Active</span>
          </div>
          <div className="mt-2 text-xs font-medium text-blue-400 dark:text-blue-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Peer Reviewed Scientific Rigor
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Average Scientific Score
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/20 dark:bg-purple-950/50 text-purple-400 dark:text-purple-400 border border-purple-100 dark:border-purple-900">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary dark:text-white">
              {analytics.averageScientificScore}
            </span>
            <span className="text-xs font-semibold text-text-muted">/ 100</span>
          </div>
          <div className="mt-2 text-xs font-medium text-text-muted flex items-center gap-1">
            Indexed across SERB & DST criteria
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Audit & Compliance
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/20 dark:bg-amber-950/50 text-amber-400 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 dark:text-emerald-400">
              {analytics.auditComplianceRate}%
            </span>
            <span className="text-xs font-semibold text-text-muted">Certified</span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">
            IRB Ethical Protocol Adherence
          </div>
        </div>
      </div>

      {/* Deep Dives: Research Category Breakdown & Institutional Awards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution */}
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-text-primary dark:text-white">
                Research Domain Capital Allocation
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.categoryDistribution.map((item) => (
              <div key={item.category} className="p-3 rounded-xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-primary dark:text-slate-200">{item.category.replace(/_/g, ' ')}</span>
                  <span className="text-emerald-400 dark:text-emerald-400 font-bold">₹{(item.capitalLakhs / 100).toFixed(1)} Cr ({item.proposalCount} Labs)</span>
                </div>
                <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, item.capitalLakhs / 10)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institution Allocations */}
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-text-primary dark:text-white">
                Campus Research Capital Distribution
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.institutionAllocations.map((inst) => (
              <div key={inst.college} className="p-3 rounded-xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-primary dark:text-slate-200">{inst.college}</span>
                  <span className="text-indigo-400 dark:text-indigo-400 font-bold">₹{(inst.awardedCapitalLakhs / 100).toFixed(1)} Cr ({inst.projectCount} Grants)</span>
                </div>
                <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500/200 h-full rounded-full" style={{ width: `${Math.min(100, inst.awardedCapitalLakhs / 10)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

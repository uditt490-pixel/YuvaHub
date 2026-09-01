import React from 'react';
import { PipelineAnalyticsSummary } from '../../types/talentPipeline';
import { Users, Zap, Award, Clock, TrendingUp, Building, Sparkles, CheckCircle2 } from 'lucide-react';

interface TalentAnalyticsCardProps {
  analytics: PipelineAnalyticsSummary;
}

export const TalentAnalyticsCard: React.FC<TalentAnalyticsCardProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Active Pipeline
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/20 dark:bg-blue-950/50 text-blue-400 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary dark:text-white">
              {analytics.activeInPipeline}
            </span>
            <span className="text-xs font-semibold text-text-muted dark:text-text-muted">
              / {analytics.totalCandidates} Total
            </span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-400 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24% vs last placement drive
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Fast-Track Matches
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/20 dark:bg-amber-950/50 text-amber-400 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 dark:text-amber-400">
              {analytics.fastTrackCount}
            </span>
            <span className="text-xs font-semibold text-text-muted dark:text-text-muted">
              Candidates
            </span>
          </div>
          <div className="mt-2 text-xs font-medium text-amber-400 dark:text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Top 99th percentile AI match
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Avg Days To Hire
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/20 dark:bg-purple-950/50 text-purple-400 dark:text-purple-400 border border-purple-100 dark:border-purple-900">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary dark:text-white">
              {analytics.averageDaysToHire}
            </span>
            <span className="text-xs font-semibold text-text-muted dark:text-text-muted">Days</span>
          </div>
          <div className="mt-2 text-xs font-medium text-purple-400 dark:text-purple-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 3.2x faster than traditional TPO
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Offer Acceptance Rate
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 dark:bg-emerald-950/50 text-emerald-400 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 dark:text-emerald-400">
              {analytics.offerAcceptanceRate}%
            </span>
            <span className="text-xs font-semibold text-text-muted dark:text-text-muted">
              Conversion
            </span>
          </div>
          <div className="mt-2 text-xs font-medium text-text-muted dark:text-text-muted flex items-center gap-1">
            Composite AI Fit Index: {analytics.averageCompositeScore}/100
          </div>
        </div>
      </div>

      {/* Deep Dive Breakdown: Campus Performance & Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campus Placement Telemetry */}
        <div className="lg:col-span-2 bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400 dark:text-blue-400" />
              <h3 className="text-base font-bold text-text-primary dark:text-white">
                Campus Cohort Telemetry & Conversion
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 dark:bg-blue-950 text-blue-400 dark:text-blue-400 border border-blue-500/30 dark:border-blue-800">
              Real-Time Sync
            </span>
          </div>

          <div className="space-y-3.5">
            {analytics.campusBreakdown.map((campus) => (
              <div
                key={campus.campus}
                className="p-3 rounded-xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme"
              >
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="font-semibold text-text-primary dark:text-white">
                    {campus.campus}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-text-muted dark:text-text-muted">
                      {campus.studentCount} Candidates
                    </span>
                    <span className="font-bold text-blue-400 dark:text-blue-400">
                      ATS: {campus.averageAtsScore}%
                    </span>
                    <span className="font-bold text-emerald-400 dark:text-emerald-400">
                      Conv: {campus.conversionRate}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${campus.conversionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Demanded Competencies */}
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-text-primary dark:text-white">
                In-Demand Tech Matrix
              </h3>
            </div>
            <p className="text-xs text-text-muted dark:text-text-muted mb-4">
              Automated skill benchmarking mapped against Tier-1 product engineering requisitions.
            </p>

            <div className="space-y-4">
              {analytics.topSkillsInDemand.map((item) => (
                <div key={item.skill} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-text-primary dark:text-slate-300">
                    <span>{item.skill}</span>
                    <span className="text-blue-400 dark:text-blue-400">
                      Avg Score: {item.averageScore}%
                    </span>
                  </div>
                  <div className="w-full bg-surface-secondary dark:bg-surface-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${item.averageScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-theme dark:border-border-theme text-xs text-text-muted dark:text-text-muted flex items-center justify-between">
            <span>Audit Protocol</span>
            <span className="font-mono text-[11px] font-bold text-text-primary dark:text-slate-300">
              ISO-27001 / SOC-2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

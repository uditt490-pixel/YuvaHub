import React from 'react';
import { HackathonAnalyticsSummary } from '../../types/hackathonEvaluation';
import { Trophy, Code2, ShieldAlert, Award, TrendingUp, Sparkles, Building } from 'lucide-react';

interface HackathonMetricsCardProps {
  analytics: HackathonAnalyticsSummary;
}

export const HackathonMetricsCard: React.FC<HackathonMetricsCardProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* 4 Core Metric Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Evaluated Submissions
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/20 dark:bg-blue-950/50 text-blue-400 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary dark:text-white">
              {analytics.evaluatedSubmissions}
            </span>
            <span className="text-xs font-semibold text-text-muted">/ {analytics.totalSubmissions} Total</span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Fast-Track Rubric Scoring
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Top Finalists (90%+)
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/20 dark:bg-amber-950/50 text-amber-400 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 dark:text-amber-400">
              {analytics.shortlistedFinalistsCount}
            </span>
            <span className="text-xs font-semibold text-text-muted">Teams</span>
          </div>
          <div className="mt-2 text-xs font-medium text-amber-400 dark:text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Grand Prize Contenders
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Plagiarism Flags
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {analytics.flaggedPlagiarismCount}
            </span>
            <span className="text-xs font-semibold text-text-muted">Quarantined</span>
          </div>
          <div className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-1">
            Zero Tolerance Code Verification
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Average Rubric Score
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/20 dark:bg-purple-950/50 text-purple-400 dark:text-purple-400 border border-purple-100 dark:border-purple-900">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary dark:text-white">
              {analytics.averageScore}
            </span>
            <span className="text-xs font-semibold text-text-muted">/ 100</span>
          </div>
          <div className="mt-2 text-xs font-medium text-text-muted flex items-center gap-1">
            Normalized across 4 criteria
          </div>
        </div>
      </div>

      {/* Deep Dives: Track Performance & College Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Track breakdown */}
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-text-primary dark:text-white">
                Hackathon Track Performance
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.trackBreakdown.map((t) => (
              <div key={t.track} className="p-3 rounded-xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-primary dark:text-slate-200">{t.track.replace(/_/g, ' ')}</span>
                  <span className="text-blue-400 dark:text-blue-400 font-bold">{t.averageScore}% Avg ({t.projectCount} Projects)</span>
                </div>
                <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full" style={{ width: `${t.averageScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Rankings */}
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-text-primary dark:text-white">
                Campus Innovation Leaderboard
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.collegeRankings.map((c) => (
              <div key={c.college} className="p-3 rounded-xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-primary dark:text-slate-200">{c.college}</span>
                  <span className="text-emerald-400 dark:text-emerald-400 font-bold">Top Score: {c.topScore}% ({c.totalProjects} Submissions)</span>
                </div>
                <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500/200 h-full rounded-full" style={{ width: `${c.topScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

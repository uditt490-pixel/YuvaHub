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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Evaluated Submissions
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics.evaluatedSubmissions}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ {analytics.totalSubmissions} Total</span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Fast-Track Rubric Scoring
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Top Finalists (90%+)
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {analytics.shortlistedFinalistsCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">Teams</span>
          </div>
          <div className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Grand Prize Contenders
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
            <span className="text-xs font-semibold text-slate-500">Quarantined</span>
          </div>
          <div className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-1">
            Zero Tolerance Code Verification
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Average Rubric Score
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {analytics.averageScore}
            </span>
            <span className="text-xs font-semibold text-slate-500">/ 100</span>
          </div>
          <div className="mt-2 text-xs font-medium text-slate-500 flex items-center gap-1">
            Normalized across 4 criteria
          </div>
        </div>
      </div>

      {/* Deep Dives: Track Performance & College Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Track breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hackathon Track Performance
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.trackBreakdown.map((t) => (
              <div key={t.track} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">{t.track.replace(/_/g, ' ')}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{t.averageScore}% Avg ({t.projectCount} Projects)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full" style={{ width: `${t.averageScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Rankings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Campus Innovation Leaderboard
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.collegeRankings.map((c) => (
              <div key={c.college} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">{c.college}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Top Score: {c.topScore}% ({c.totalProjects} Submissions)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${c.topScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

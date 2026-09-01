import React from 'react';
import { CareerTelemetryAnalytics } from '../../types/careerTelemetry';
import { Activity, ShieldCheck, Flame, BookOpen, GraduationCap, TrendingUp, Sparkles, AlertOctagon } from 'lucide-react';

interface CareerTelemetryCardProps {
  analytics: CareerTelemetryAnalytics;
}

export const CareerTelemetryCard: React.FC<CareerTelemetryCardProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* 4 Core KPI Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Active Monitored Students
            </span>
            <div className="p-2.5 rounded-xl bg-blue-500/20 dark:bg-blue-950/50 text-blue-400 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary dark:text-white">
              {analytics.totalMonitoredStudents}
            </span>
            <span className="text-xs font-semibold text-text-muted">Live Cohorts</span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 100% Real-Time Synchronized
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Optimal Readiness (90%+)
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/20 dark:bg-emerald-950/50 text-emerald-400 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-400 dark:text-emerald-400">
              {analytics.highEmployabilityCount}
            </span>
            <span className="text-xs font-semibold text-text-muted">Students</span>
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-400 dark:text-emerald-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Day-1 Placement Qualified
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              At-Risk / Intervention
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {analytics.atRiskCount}
            </span>
            <span className="text-xs font-semibold text-text-muted">Need Mentorship</span>
          </div>
          <div className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300 flex items-center gap-1">
            Auto-Intervention Protocols Ready
          </div>
        </div>

        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
              Avg Weekly Study Load
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/20 dark:bg-indigo-950/50 text-indigo-400 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-text-primary dark:text-white">
              {analytics.averageWeeklyStudyHours} hrs
            </span>
            <span className="text-xs font-semibold text-text-muted">/ week</span>
          </div>
          <div className="mt-2 text-xs font-medium text-text-muted flex items-center gap-1">
            Passing Rate: {analytics.mockInterviewPassingRate}%
          </div>
        </div>
      </div>

      {/* Deep Dives: Domain Readiness & Campus Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution */}
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-text-primary dark:text-white">
                Domain Employability Breakdown
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 dark:bg-blue-950 text-blue-400 dark:text-blue-400">
              AI Monitored
            </span>
          </div>

          <div className="space-y-3">
            {analytics.domainDistribution.map((item) => (
              <div key={item.domain} className="p-3 rounded-xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-primary dark:text-slate-200">{item.domain.replace(/_/g, ' ')}</span>
                  <span className="text-blue-400 dark:text-blue-400">{item.averageScore}% Employability Index</span>
                </div>
                <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full" style={{ width: `${item.averageScore}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institution Velocity */}
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-text-primary dark:text-white">
                Campus Learning Velocity Index
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.institutionVelocity.map((inst) => (
              <div key={inst.institution} className="p-3 rounded-xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-text-primary dark:text-slate-200">{inst.institution}</span>
                  <span className="text-emerald-400 dark:text-emerald-400 font-bold">{inst.averageIndex}% Score ({inst.studentCount} Students)</span>
                </div>
                <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500/200 h-full rounded-full" style={{ width: `${inst.averageIndex}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

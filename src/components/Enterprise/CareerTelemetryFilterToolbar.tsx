import React from 'react';
import { CareerTelemetryFilter, CareerDomain, TelemetryRiskStatus } from '../../types/careerTelemetry';
import { Search, Download, RotateCcw, ArrowUpDown, Sparkles } from 'lucide-react';

interface CareerTelemetryFilterToolbarProps {
  filters: CareerTelemetryFilter;
  onChange: (filters: CareerTelemetryFilter) => void;
  onReset: () => void;
  onExportCsv: () => void;
  totalMatches: number;
}

export const CareerTelemetryFilterToolbar: React.FC<CareerTelemetryFilterToolbarProps> = ({
  filters,
  onChange,
  onReset,
  onExportCsv,
  totalMatches
}) => {
  return (
    <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-sm space-y-4">
      {/* Top Search & Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by student name, ID, institution, or domain..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme text-xs text-text-primary dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl bg-surface-secondary dark:bg-surface-secondary hover:bg-border-theme dark:hover:bg-slate-700 text-text-primary dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={onReset}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary dark:hover:text-slate-300 hover:bg-surface-secondary dark:hover:bg-surface-secondary transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-border-theme dark:border-border-theme text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Career Domain
          </label>
          <select
            value={filters.domain}
            onChange={(e) => onChange({ ...filters, domain: e.target.value as any })}
            className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
          >
            <option value="ALL">All Domains</option>
            <option value="DISTRIBUTED_SYSTEMS">Distributed Systems</option>
            <option value="AI_MLOPS">AI & MLOps</option>
            <option value="FULLSTACK_CLOUD">Fullstack Cloud</option>
            <option value="CYBERSECURITY_INFRA">Cybersecurity</option>
            <option value="DATA_ENGINEERING">Data Engineering</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Risk & Readiness Status
          </label>
          <select
            value={filters.riskStatus}
            onChange={(e) => onChange({ ...filters, riskStatus: e.target.value as any })}
            className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPTIMAL">Optimal (90%+)</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
            <option value="CRITICAL_INTERVENTION">Critical Intervention</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Institution
          </label>
          <select
            value={filters.institution}
            onChange={(e) => onChange({ ...filters, institution: e.target.value })}
            className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
          >
            <option value="">All Campuses</option>
            <option value="IIT Bombay">IIT Bombay</option>
            <option value="BITS Pilani">BITS Pilani</option>
            <option value="IIT Delhi">IIT Delhi</option>
            <option value="IIIT Hyderabad">IIIT Hyderabad</option>
            <option value="DTU">DTU</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Min Employability ({filters.minEmployabilityIndex || 0}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.minEmployabilityIndex}
            onChange={(e) => onChange({ ...filters, minEmployabilityIndex: Number(e.target.value) })}
            className="w-full accent-blue-600 mt-1 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Sort By
          </label>
          <div className="flex items-center gap-1">
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
            >
              <option value="employabilityIndex">Employability Index</option>
              <option value="weeklyHours">Weekly Hours</option>
              <option value="streak">Streak Days</option>
              <option value="atsScore">ATS Score</option>
            </select>
            <button
              onClick={() =>
                onChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
              }
              className="p-2 rounded-lg bg-surface-secondary dark:bg-surface-secondary text-text-secondary dark:text-slate-300 hover:bg-border-theme transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted dark:text-text-muted">
        <span>
          Tracking <strong className="text-text-primary dark:text-white">{totalMatches}</strong> active student profiles
        </span>
        <span className="flex items-center gap-1 text-[11px] text-blue-400 dark:text-blue-400 font-semibold">
          <Sparkles className="w-3 h-3" /> Live Campus Stream Active
        </span>
      </div>
    </div>
  );
};

import React from 'react';
import { HackathonFilterOptions, HackathonTrack, EvaluationStatus } from '../../types/hackathonEvaluation';
import { Search, Download, RotateCcw, ArrowUpDown, Trophy } from 'lucide-react';

interface HackathonFilterToolbarProps {
  filters: HackathonFilterOptions;
  onChange: (filters: HackathonFilterOptions) => void;
  onReset: () => void;
  onExportCsv: () => void;
  totalMatches: number;
}

export const HackathonFilterToolbar: React.FC<HackathonFilterToolbarProps> = ({
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
            placeholder="Search by project title, team, code, stack, or college..."
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
            Innovation Track
          </label>
          <select
            value={filters.track}
            onChange={(e) => onChange({ ...filters, track: e.target.value as any })}
            className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
          >
            <option value="ALL">All Tracks</option>
            <option value="AI_HEALTHCARE">AI Healthcare</option>
            <option value="FINTECH_WEB3">FinTech & Web3</option>
            <option value="CYBERSECURITY_ZERO_TRUST">Cybersecurity</option>
            <option value="EDTECH_STUDENT_TOOLS">EdTech Tools</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Evaluation Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as any })}
            className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="WINNER_SELECTED">Winner Selected</option>
            <option value="EVALUATION_COMPLETED">Evaluated</option>
            <option value="SCORING_IN_PROGRESS">In Progress</option>
            <option value="FLAGGED_PLAGIARISM">Plagiarism Flag</option>
            <option value="UNEVALUATED">Unevaluated</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Institution
          </label>
          <select
            value={filters.college}
            onChange={(e) => onChange({ ...filters, college: e.target.value })}
            className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme font-semibold text-text-primary dark:text-slate-200 text-xs outline-none"
          >
            <option value="">All Campuses</option>
            <option value="IIT Bombay">IIT Bombay</option>
            <option value="BITS Pilani">BITS Pilani</option>
            <option value="IIIT Hyderabad">IIIT Hyderabad</option>
            <option value="DTU">DTU</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
            Min Rubric Score ({filters.minScore || 0}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.minScore}
            onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
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
              <option value="score">Judge Score</option>
              <option value="commits">Commit Count</option>
              <option value="submittedAt">Submission Time</option>
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
          Showing <strong className="text-text-primary dark:text-white">{totalMatches}</strong> hackathon project submissions
        </span>
        <span className="flex items-center gap-1 text-[11px] text-amber-400 dark:text-amber-400 font-semibold">
          <Trophy className="w-3.5 h-3.5" /> Live Jury Stream Synchronized
        </span>
      </div>
    </div>
  );
};

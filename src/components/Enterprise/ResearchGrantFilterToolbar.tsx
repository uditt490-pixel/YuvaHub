import React from 'react';
import { ResearchGrantFilterOptions, GrantCategory, GrantStatus } from '../../types/researchGrant';
import { Search, Download, RotateCcw, ArrowUpDown, BookOpen } from 'lucide-react';

interface ResearchGrantFilterToolbarProps {
  filters: ResearchGrantFilterOptions;
  onChange: (filters: ResearchGrantFilterOptions) => void;
  onReset: () => void;
  onExportCsv: () => void;
  totalMatches: number;
}

export const ResearchGrantFilterToolbar: React.FC<ResearchGrantFilterToolbarProps> = ({
  filters,
  onChange,
  onReset,
  onExportCsv,
  totalMatches
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Top Search & Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by grant code, research title, PI, or college..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={onReset}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Research Domain
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value as any })}
            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-xs outline-none"
          >
            <option value="ALL">All Domains</option>
            <option value="AI_BIOTECH_RESEARCH">AI & Biotech</option>
            <option value="QUANTUM_COMPUTING">Quantum Computing</option>
            <option value="CLEANTECH_ENERGY">CleanTech Energy</option>
            <option value="SEMICONDUCTOR_VLSI">Semiconductor VLSI</option>
            <option value="NEUROSCIENCE_COGNITIVE">Neuroscience</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Grant Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as any })}
            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-xs outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="FUNDS_DISBURSED">Funds Disbursed</option>
            <option value="INSTITUTIONAL_APPROVAL">Institutional Approval</option>
            <option value="PEER_REVIEW">Peer Review</option>
            <option value="DRAFTING">Drafting</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Institution
          </label>
          <select
            value={filters.college}
            onChange={(e) => onChange({ ...filters, college: e.target.value })}
            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-xs outline-none"
          >
            <option value="">All Campuses</option>
            <option value="IIT Bombay">IIT Bombay</option>
            <option value="IIT Delhi">IIT Delhi</option>
            <option value="BITS Pilani">BITS Pilani</option>
            <option value="IIIT Hyderabad">IIIT Hyderabad</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Min Scientific Score ({filters.minScore || 0}%)
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
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Sort By
          </label>
          <div className="flex items-center gap-1">
            <select
              value={filters.sortBy}
              onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 text-xs outline-none"
            >
              <option value="score">Scientific Score</option>
              <option value="grantAmount">Grant Amount</option>
              <option value="submittedAt">Submission Date</option>
            </select>
            <button
              onClick={() =>
                onChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
              }
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing <strong className="text-slate-800 dark:text-white">{totalMatches}</strong> research grant proposals
        </span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
          <BookOpen className="w-3.5 h-3.5" /> DST-SERB National Grant Registry Active
        </span>
      </div>
    </div>
  );
};

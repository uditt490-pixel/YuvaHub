import React from 'react';
import {
  Search,
  Filter,
  AlertTriangle,
  Radio,
  SlidersHorizontal,
  UserPlus,
  RefreshCw,
  LayoutGrid,
  List
} from 'lucide-react';
import { ClinicalDomain, ClinicalAcuityLevel, ClinicalFilterQuery } from '../../types/clinicalTelemetry';

interface ClinicalFilterToolbarProps {
  filters: ClinicalFilterQuery;
  onFilterChange: (filters: Partial<ClinicalFilterQuery>) => void;
  viewMode: 'GRID' | 'TABLE' | 'ESCALATIONS';
  onChangeViewMode: (mode: 'GRID' | 'TABLE' | 'ESCALATIONS') => void;
  onOpenAdmission: () => void;
  onRefresh: () => void;
}

export const ClinicalFilterToolbar: React.FC<ClinicalFilterToolbarProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onChangeViewMode,
  onOpenAdmission,
  onRefresh,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Patient MRN, Name, Bed, Diagnosis, or Attending Physician..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-500 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all"
          />
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
          {/* Alerts Only Toggle */}
          <button
            onClick={() => onFilterChange({ alertsOnly: !filters.alertsOnly })}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
              filters.alertsOnly
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-md shadow-rose-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Active Alerts Only</span>
          </button>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onChangeViewMode('GRID')}
              title="Grid Card View"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChangeViewMode('TABLE')}
              title="High-Density Matrix Table"
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChangeViewMode('ESCALATIONS')}
              title="Emergency Protocol Tracker"
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'ESCALATIONS'
                  ? 'bg-rose-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Escalations
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            title="Manual Telemetry Pull"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Admit Patient Action */}
          <button
            onClick={onOpenAdmission}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Admit Patient</span>
          </button>
        </div>
      </div>
    </div>
  );
};

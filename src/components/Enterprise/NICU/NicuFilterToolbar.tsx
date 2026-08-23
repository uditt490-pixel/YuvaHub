import React from "react";
import {
  Search,
  LayoutGrid,
  Table,
  X,
  Baby,
  Filter,
  Activity
} from "lucide-react";

interface NicuFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedBracket: string;
  onBracketChange: (b: string) => void;
  selectedVentMode: string;
  onVentModeChange: (v: string) => void;
  selectedSpecialStatus: string;
  onSpecialStatusChange: (s: string) => void;
  viewMode: "GRID" | "MATRIX";
  onViewModeChange: (vm: "GRID" | "MATRIX") => void;
  onClearFilters: () => void;
}

export const NicuFilterToolbar: React.FC<NicuFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedBracket,
  onBracketChange,
  selectedVentMode,
  onVentModeChange,
  selectedSpecialStatus,
  onSpecialStatusChange,
  viewMode,
  onViewModeChange,
  onClearFilters
}) => {
  const hasActiveFilters =
    searchQuery ||
    selectedBracket !== "ALL" ||
    selectedVentMode !== "ALL" ||
    selectedSpecialStatus !== "ALL";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative w-full lg:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by neonate name, MRN, bed, or diagnosis..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto text-xs">
        {/* Gestational Bracket */}
        <select
          value={selectedBracket}
          onChange={(e) => onBracketChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500 font-semibold"
        >
          <option value="ALL">All Gestational Brackets</option>
          <option value="EXTREMELY_PRETERM">Extremely Preterm (&lt;28w)</option>
          <option value="VERY_PRETERM">Very Preterm (28–31w)</option>
          <option value="MODERATE_LATE_PRETERM">Moderate to Late Preterm (32–36w)</option>
          <option value="FULL_TERM">Full Term (&ge;37w)</option>
        </select>

        {/* Ventilator Mode */}
        <select
          value={selectedVentMode}
          onChange={(e) => onVentModeChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500 font-semibold"
        >
          <option value="ALL">All Respiratory Support</option>
          <option value="HFOV">HFOV (Oscillatory)</option>
          <option value="HFJV">HFJV (Jet)</option>
          <option value="SIMV_PRVC">SIMV-PRVC (Conventional)</option>
          <option value="NAVA">NAVA (Neurally Adjusted)</option>
          <option value="BUBBLE_CPAP">Bubble CPAP</option>
          <option value="ROOM_AIR">Room Air</option>
        </select>

        {/* Special Status */}
        <select
          value={selectedSpecialStatus}
          onChange={(e) => onSpecialStatusChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-pink-500 font-semibold"
        >
          <option value="ALL">All Clinical Protocols</option>
          <option value="COOLING">Therapeutic Hypothermia (HIE)</option>
          <option value="PHOTOTHERAPY">Phototherapy Active</option>
          <option value="PPHN_ALERT">PPHN (&Delta;SpO₂ &gt; 10%)</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold rounded-xl flex items-center gap-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* View Switcher */}
      <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center gap-1 self-end lg:self-auto">
        <button
          onClick={() => onViewModeChange("GRID")}
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === "GRID"
              ? "bg-pink-500 text-white font-bold shadow-md shadow-pink-500/30"
              : "text-slate-400 hover:text-white"
          }`}
          title="Bed Card Grid View"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          onClick={() => onViewModeChange("MATRIX")}
          className={`p-1.5 rounded-lg transition-all ${
            viewMode === "MATRIX"
              ? "bg-pink-500 text-white font-bold shadow-md shadow-pink-500/30"
              : "text-slate-400 hover:text-white"
          }`}
          title="Central Station Matrix View"
        >
          <Table className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

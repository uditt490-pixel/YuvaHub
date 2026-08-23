import React from "react";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Table,
  Volume2,
  VolumeX,
  X,
  Wind,
  Activity,
  User
} from "lucide-react";

interface PicuFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedAcuity: string;
  onAcuityChange: (a: string) => void;
  selectedVentMode: string;
  onVentModeChange: (v: string) => void;
  selectedAgeBracket: string;
  onAgeBracketChange: (ab: string) => void;
  viewMode: "GRID" | "MATRIX";
  onViewModeChange: (vm: "GRID" | "MATRIX") => void;
  soundAlertsEnabled: boolean;
  onToggleSoundAlerts: () => void;
  onClearFilters: () => void;
}

export const PicuFilterToolbar: React.FC<PicuFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedAcuity,
  onAcuityChange,
  selectedVentMode,
  onVentModeChange,
  selectedAgeBracket,
  onAgeBracketChange,
  viewMode,
  onViewModeChange,
  soundAlertsEnabled,
  onToggleSoundAlerts,
  onClearFilters
}) => {
  const hasActiveFilters =
    searchQuery ||
    selectedAcuity !== "ALL" ||
    selectedVentMode !== "ALL" ||
    selectedAgeBracket !== "ALL";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative w-full lg:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by name, MRN, bed, or diagnosis..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
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
        {/* Acuity Filter */}
        <select
          value={selectedAcuity}
          onChange={(e) => onAcuityChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-semibold"
        >
          <option value="ALL">All Acuity Levels</option>
          <option value="CRITICAL_INSTABILITY">Critical Instability</option>
          <option value="HIGH_ACUITY">High Acuity</option>
          <option value="ELEVATED_RISK">Elevated Risk</option>
          <option value="MONITORING">Monitoring</option>
          <option value="STABLE">Stable</option>
        </select>

        {/* Ventilator Mode Filter */}
        <select
          value={selectedVentMode}
          onChange={(e) => onVentModeChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-semibold"
        >
          <option value="ALL">All Respiratory Modes</option>
          <option value="HFOV">HFOV (High-Frequency)</option>
          <option value="PRVC">PRVC</option>
          <option value="SIMV_PC">SIMV-PC</option>
          <option value="HFNC">HFNC (High Flow)</option>
          <option value="ROOM_AIR">Room Air (Non-vented)</option>
        </select>

        {/* Age Bracket Filter */}
        <select
          value={selectedAgeBracket}
          onChange={(e) => onAgeBracketChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-semibold"
        >
          <option value="ALL">All Age Brackets</option>
          <option value="NEONATE">Neonate (0-28d)</option>
          <option value="INFANT">Infant (1-12m)</option>
          <option value="TODDLER">Toddler (1-3y)</option>
          <option value="SCHOOL_AGE">School Age (6-12y)</option>
          <option value="ADOLESCENT">Adolescent (13-18y)</option>
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

      {/* View Switcher & Sound Control */}
      <div className="flex items-center gap-2 self-end lg:self-auto">
        <button
          onClick={onToggleSoundAlerts}
          className={`p-2 rounded-xl border transition-all ${
            soundAlertsEnabled
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-md shadow-amber-950/20"
              : "bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300"
          }`}
          title={soundAlertsEnabled ? "Telemetry Alarms Sound: ON" : "Telemetry Alarms Sound: MUTED"}
        >
          {soundAlertsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <div className="bg-slate-950 border border-slate-800 p-1 rounded-xl flex items-center gap-1">
          <button
            onClick={() => onViewModeChange("GRID")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "GRID"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("MATRIX")}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === "MATRIX"
                ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            title="Matrix Tabular View"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

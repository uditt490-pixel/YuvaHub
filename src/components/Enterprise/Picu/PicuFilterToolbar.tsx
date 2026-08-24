import React from "react";
import { Search, Filter, AlertCircle, Baby, Wind } from "lucide-react";
import { PediatricAgeGroup, PicuUnitCareLevel, PediatricVentilationMode } from "../../../types/picuTelemetry";

interface PicuFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedAgeGroup: PediatricAgeGroup | "ALL";
  onAgeGroupChange: (ag: PediatricAgeGroup | "ALL") => void;
  selectedCareUnit: PicuUnitCareLevel | "ALL";
  onCareUnitChange: (cu: PicuUnitCareLevel | "ALL") => void;
  selectedVentMode: PediatricVentilationMode | "ALL";
  onVentModeChange: (vm: PediatricVentilationMode | "ALL") => void;
  viewMode: "GRID" | "TABLE";
  onViewModeChange: (m: "GRID" | "TABLE") => void;
  filterCriticalOnly: boolean;
  onToggleCriticalOnly: () => void;
}

export const PicuFilterToolbar: React.FC<PicuFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedAgeGroup,
  onAgeGroupChange,
  selectedCareUnit,
  onCareUnitChange,
  selectedVentMode,
  onVentModeChange,
  viewMode,
  onViewModeChange,
  filterCriticalOnly,
  onToggleCriticalOnly
}) => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300 shadow-md">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search pediatric patient by MRN, name, isolette, or diagnosis..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500 transition shadow-inner"
        />
      </div>

      {/* Filter Selectors */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Age Group Filter */}
        <select
          value={selectedAgeGroup}
          onChange={(e) => onAgeGroupChange(e.target.value as any)}
          aria-label="Filter by Pediatric Age Group"
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 cursor-pointer"
        >
          <option value="ALL">All Pediatric Age Groups</option>
          <option value="EXTREME_PRETERM_UNDER_28W">Extreme Preterm (&lt;28w)</option>
          <option value="VERY_PRETERM_28_32W">Very Preterm (28-32w)</option>
          <option value="FULL_TERM_NEONATE_0_28D">Full-Term Neonate (0-28d)</option>
          <option value="INFANT_1_12M">Infant (1-12m)</option>
          <option value="TODDLER_1_3Y">Toddler (1-3y)</option>
          <option value="YOUNG_CHILD_4_7Y">Young Child (4-7y)</option>
          <option value="CHILD_8_12Y">Child (8-12y)</option>
          <option value="ADOLESCENT_13_18Y">Adolescent (13-18y)</option>
        </select>

        {/* Care Unit Filter */}
        <select
          value={selectedCareUnit}
          onChange={(e) => onCareUnitChange(e.target.value as any)}
          aria-label="Filter by Care Unit"
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 cursor-pointer"
        >
          <option value="ALL">All Care Units</option>
          <option value="NICU_LEVEL_IV_QUATERNARY">NICU Level IV Quaternary</option>
          <option value="NICU_LEVEL_III_HIGH_RISK">NICU Level III High Risk</option>
          <option value="PICU_CARDIAC_CICU">PICU Cardiac (CICU)</option>
          <option value="PICU_MEDICAL_SURGICAL">PICU Medical/Surgical</option>
          <option value="PICU_ECMO_RESUSCITATION">PICU ECMO Resuscitation</option>
        </select>

        {/* Ventilation Mode Filter */}
        <select
          value={selectedVentMode}
          onChange={(e) => onVentModeChange(e.target.value as any)}
          aria-label="Filter by Ventilation Mode"
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 cursor-pointer"
        >
          <option value="ALL">All Vent Modes</option>
          <option value="HFOV_HIGH_FREQUENCY_OSCILLATORY">HFOV Oscillator</option>
          <option value="CONVENTIONAL_PRVC_PRESSURE_REGULATED">Conventional PRVC</option>
          <option value="BUBBLE_CPAP_NON_INVASIVE">Bubble CPAP</option>
          <option value="HIGH_FLOW_NASAL_CANNULA_HFNC">High Flow Cannula (HFNC)</option>
          <option value="SPONTANEOUS_ROOM_AIR">Spontaneous Room Air</option>
        </select>

        {/* Critical Alerts Toggle */}
        <button
          onClick={onToggleCriticalOnly}
          className={"px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition cursor-pointer " + (filterCriticalOnly ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/50" : "bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200")}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Critical PEWS / PALS Only
        </button>

        {/* View Switcher: Grid vs Table */}
        <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
          <button
            onClick={() => onViewModeChange("GRID")}
            className={"px-2.5 py-1 rounded text-xs font-bold transition " + (viewMode === "GRID" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200")}
          >
            Beds Grid
          </button>
          <button
            onClick={() => onViewModeChange("TABLE")}
            className={"px-2.5 py-1 rounded text-xs font-bold transition " + (viewMode === "TABLE" ? "bg-slate-800 text-white shadow" : "text-slate-400 hover:text-slate-200")}
          >
            Matrix Table
          </button>
        </div>
      </div>
    </div>
  );
};

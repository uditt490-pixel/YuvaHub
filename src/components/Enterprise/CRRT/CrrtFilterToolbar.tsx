import React from "react";
import {
  Search,
  LayoutGrid,
  Table,
  X,
  Droplets,
  Filter,
  Gauge
} from "lucide-react";

interface CrrtFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedModality: string;
  onModalityChange: (m: string) => void;
  selectedAnticoagulation: string;
  onAnticoagulationChange: (a: string) => void;
  selectedHealth: string;
  onHealthChange: (h: string) => void;
  viewMode: "GRID" | "MATRIX";
  onViewModeChange: (vm: "GRID" | "MATRIX") => void;
  onClearFilters: () => void;
}

export const CrrtFilterToolbar: React.FC<CrrtFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedModality,
  onModalityChange,
  selectedAnticoagulation,
  onAnticoagulationChange,
  selectedHealth,
  onHealthChange,
  viewMode,
  onViewModeChange,
  onClearFilters
}) => {
  const hasActiveFilters =
    searchQuery ||
    selectedModality !== "ALL" ||
    selectedAnticoagulation !== "ALL" ||
    selectedHealth !== "ALL";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative w-full lg:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by patient, MRN, diagnosis, access..."
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
        {/* Modality Filter */}
        <select
          value={selectedModality}
          onChange={(e) => onModalityChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-semibold"
        >
          <option value="ALL">All Modalities</option>
          <option value="CVVHDF">CVVHDF (Hemodiafiltration)</option>
          <option value="CVVH">CVVH (Convection)</option>
          <option value="CVVHD">CVVHD (Dialysis)</option>
          <option value="SCUF">SCUF (Slow Ultrafiltration)</option>
          <option value="SLED">SLED (Daily Diafiltration)</option>
        </select>

        {/* Anticoagulation Filter */}
        <select
          value={selectedAnticoagulation}
          onChange={(e) => onAnticoagulationChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-semibold"
        >
          <option value="ALL">All Anticoagulation</option>
          <option value="REGIONAL_CITRATE">Regional Citrate (RCA)</option>
          <option value="SYSTEMIC_HEPARIN">Systemic Heparin</option>
          <option value="NO_ANTICOAGULATION">No Anticoagulation</option>
        </select>

        {/* Filter Health Status */}
        <select
          value={selectedHealth}
          onChange={(e) => onHealthChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500 font-semibold"
        >
          <option value="ALL">All Circuit Status</option>
          <option value="OPTIMAL">Optimal Membrane (TMP &lt; 150)</option>
          <option value="MODERATE_FOULING">Moderate Fouling (TMP 150-250)</option>
          <option value="IMMINENT_CLOTTING">Imminent Clotting (TMP &gt; 250)</option>
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
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30"
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
              ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30"
              : "text-slate-400 hover:text-white"
          }`}
          title="Matrix Tabular View"
        >
          <Table className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

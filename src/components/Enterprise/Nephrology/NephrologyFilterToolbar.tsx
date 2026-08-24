import React from "react";
import { Search, Filter, AlertCircle, Droplets, Activity } from "lucide-react";
import { KdigoAkiStage, CrrtModality, AnticoagulationStrategy } from "../../../types/nephrologyTelemetry";

interface NephrologyFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedKdigoStage: KdigoAkiStage | "ALL";
  onKdigoStageChange: (s: KdigoAkiStage | "ALL") => void;
  selectedModality: CrrtModality | "ALL";
  onModalityChange: (m: CrrtModality | "ALL") => void;
  selectedAnticoagulation: AnticoagulationStrategy | "ALL";
  onAnticoagulationChange: (a: AnticoagulationStrategy | "ALL") => void;
  viewMode: "GRID" | "TABLE";
  onViewModeChange: (m: "GRID" | "TABLE") => void;
  filterCriticalOnly: boolean;
  onToggleCriticalOnly: () => void;
}

export const NephrologyFilterToolbar: React.FC<NephrologyFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedKdigoStage,
  onKdigoStageChange,
  selectedModality,
  onModalityChange,
  selectedAnticoagulation,
  onAnticoagulationChange,
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
          placeholder="Search patient by MRN, name, bed, etiology, or nephrologist..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
        />
      </div>

      {/* Filter Selectors & Toggles */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* KDIGO Stage Filter */}
        <select
          value={selectedKdigoStage}
          onChange={(e) => onKdigoStageChange(e.target.value as any)}
          aria-label="Filter by KDIGO Stage"
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="ALL">All KDIGO Stages</option>
          <option value="STAGE_3_FAILURE">Stage 3 Failure</option>
          <option value="STAGE_2_INJURY">Stage 2 Injury</option>
          <option value="STAGE_1_RISK">Stage 1 Risk</option>
          <option value="STAGE_0_NORMAL">Stage 0 Baseline</option>
        </select>

        {/* Modality Filter */}
        <select
          value={selectedModality}
          onChange={(e) => onModalityChange(e.target.value as any)}
          aria-label="Filter by Dialysis Modality"
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="ALL">All Dialytic Modalities</option>
          <option value="CVVHDF_CONTINUOUS_HEMODIAFILTRATION">CVVHDF (Hemodiafiltration)</option>
          <option value="CVVH_CONTINUOUS_HEMOFILTRATION">CVVH (Hemofiltration)</option>
          <option value="SCUF_SLOW_CONTINUOUS_ULTRAFILTRATION">SCUF (Ultrafiltration)</option>
          <option value="SLED_SUSTAINED_LOW_EFFICIENCY">SLED (Low Efficiency)</option>
          <option value="PIRRT_PROLONGED_INTERMITTENT">PIRRT (Prolonged Intermittent)</option>
          <option value="IHD_INTERMITTENT_HEMODIALYSIS">IHD (Intermittent HD)</option>
        </select>

        {/* Anticoagulation Filter */}
        <select
          value={selectedAnticoagulation}
          onChange={(e) => onAnticoagulationChange(e.target.value as any)}
          aria-label="Filter by Anticoagulation Strategy"
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="ALL">All Anticoagulation</option>
          <option value="REGIONAL_CITRATE_RCA">Regional Citrate (RCA)</option>
          <option value="SYSTEMIC_UNFRACTIONATED_HEPARIN">Systemic Heparin</option>
          <option value="ARGATROBAN_HIT">Argatroban (HIT)</option>
          <option value="SALINE_FLUSH_NO_ANTICOAGULATION">Saline Flush / None</option>
        </select>

        {/* Critical Alarms Toggle */}
        <button
          onClick={onToggleCriticalOnly}
          className={"px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition cursor-pointer " + (filterCriticalOnly ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/50" : "bg-slate-950 text-slate-400 border-slate-700 hover:text-slate-200")}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Critical Alerts Only
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

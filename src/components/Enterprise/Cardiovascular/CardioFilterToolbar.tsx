import React from "react";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Table,
  Filter,
  AlertTriangle,
  RotateCcw,
  Zap,
  Flame
} from "lucide-react";

interface CardioFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedScaiStage: string;
  onScaiStageChange: (s: string) => void;
  selectedMcsDevice: string;
  onMcsDeviceChange: (d: string) => void;
  selectedSpecialStatus: string;
  onSpecialStatusChange: (status: string) => void;
  viewMode: "GRID" | "MATRIX";
  onViewModeChange: (mode: "GRID" | "MATRIX") => void;
  totalFilteredCount: number;
  totalCount: number;
}

export const CardioFilterToolbar: React.FC<CardioFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedScaiStage,
  onScaiStageChange,
  selectedMcsDevice,
  onMcsDeviceChange,
  selectedSpecialStatus,
  onSpecialStatusChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
  totalCount
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      {/* Left: Search Input */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by patient name, MRN, bed (CTICU-01), diagnosis, or cardiologist..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      {/* Middle: Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* SCAI Shock Stage */}
        <select
          value={selectedScaiStage}
          onChange={(e) => onScaiStageChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="ALL">All SCAI Stages</option>
          <option value="STAGE_A_AT_RISK">Stage A (At Risk)</option>
          <option value="STAGE_B_BEGINNING">Stage B (Beginning)</option>
          <option value="STAGE_C_CLASSIC">Stage C (Classic Shock)</option>
          <option value="STAGE_D_DETERIORATING">Stage D (Deteriorating)</option>
          <option value="STAGE_E_EXTREMIS">Stage E (Extremis)</option>
        </select>

        {/* MCS Device Filter */}
        <select
          value={selectedMcsDevice}
          onChange={(e) => onMcsDeviceChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="ALL">All MCS Modalities</option>
          <option value="ECPELLA">ECPELLA (VA-ECMO + Impella)</option>
          <option value="VA_ECMO">VA-ECMO</option>
          <option value="VV_ECMO">VV-ECMO</option>
          <option value="IMPELLA">Impella (CP / 5.5 / RP)</option>
          <option value="IABP">IABP Counterpulsation</option>
          <option value="HEARTMATE_3_LVAD">HeartMate 3 LVAD</option>
          <option value="NONE_PHARMACOLOGIC">Pharmacologic Only</option>
        </select>

        {/* Clinical Priority Status */}
        <select
          value={selectedSpecialStatus}
          onChange={(e) => onSpecialStatusChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-mono"
        >
          <option value="ALL">All Clinical Statuses</option>
          <option value="ACTIVE_ALERTS">Active Safety Alarms</option>
          <option value="CRITICAL_CPO">Low CPO (&lt;0.60 W)</option>
          <option value="HIGH_TMP">High TMP (&gt;50 mmHg)</option>
          <option value="HARLEQUIN">Harlequin (Δ &gt; 10%)</option>
          <option value="LOW_PAPI">RV Failure (PAPi &lt; 0.9)</option>
        </select>
      </div>

      {/* Right: View Mode & Counter */}
      <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
        <span className="text-xs text-slate-400 font-mono">
          Showing: <strong className="text-white">{totalFilteredCount}</strong> / {totalCount} Pts
        </span>

        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
          <button
            onClick={() => onViewModeChange("GRID")}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "GRID"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Bed Cards Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("MATRIX")}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "MATRIX"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
            title="Central Station Matrix Table View"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

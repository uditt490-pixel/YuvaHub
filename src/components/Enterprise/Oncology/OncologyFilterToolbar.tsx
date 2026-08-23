import React from "react";
import {
  Search,
  LayoutGrid,
  Table,
  X,
  Dna,
  Filter,
  Activity
} from "lucide-react";

interface OncologyFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSite: string;
  onSiteChange: (s: string) => void;
  selectedBiomarker: string;
  onBiomarkerChange: (b: string) => void;
  selectedMrd: string;
  onMrdChange: (m: string) => void;
  viewMode: "GRID" | "MATRIX";
  onViewModeChange: (vm: "GRID" | "MATRIX") => void;
  onClearFilters: () => void;
}

export const OncologyFilterToolbar: React.FC<OncologyFilterToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSite,
  onSiteChange,
  selectedBiomarker,
  onBiomarkerChange,
  selectedMrd,
  onMrdChange,
  viewMode,
  onViewModeChange,
  onClearFilters
}) => {
  const hasActiveFilters =
    searchQuery ||
    selectedSite !== "ALL" ||
    selectedBiomarker !== "ALL" ||
    selectedMrd !== "ALL";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative w-full lg:w-80">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Search by patient, MRN, gene (e.g. EGFR, KRAS), or trial..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
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
        {/* Site Filter */}
        <select
          value={selectedSite}
          onChange={(e) => onSiteChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500 font-semibold"
        >
          <option value="ALL">All Tumor Sites</option>
          <option value="NON_SMALL_CELL_LUNG">Non-Small Cell Lung</option>
          <option value="BREAST">Breast Carcinoma</option>
          <option value="COLORECTAL">Colorectal</option>
          <option value="MELANOMA">Melanoma</option>
          <option value="PANCREATIC_DUCTAL">Pancreatic Ductal</option>
          <option value="OVARIAN_HIGH_GRADE">High-Grade Ovarian</option>
        </select>

        {/* Biomarker Filter */}
        <select
          value={selectedBiomarker}
          onChange={(e) => onBiomarkerChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500 font-semibold"
        >
          <option value="ALL">All Actionable Biomarkers</option>
          <option value="EGFR">EGFR (L858R / Exon 19 del / C797S)</option>
          <option value="KRAS">KRAS (G12C / G12D)</option>
          <option value="BRAF">BRAF (V600E)</option>
          <option value="BRCA">BRCA1 / BRCA2 (HRD+)</option>
          <option value="TMB_HIGH">TMB-High (&ge; 10 mut/Mb)</option>
          <option value="MSI_HIGH">MSI-High / dMMR</option>
        </select>

        {/* MRD Status */}
        <select
          value={selectedMrd}
          onChange={(e) => onMrdChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500 font-semibold"
        >
          <option value="ALL">All ctDNA Status</option>
          <option value="MRD_POSITIVE">MRD Positive (ctDNA Detected)</option>
          <option value="MRD_NEGATIVE">MRD Negative (Clearance)</option>
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
              ? "bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30"
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
              ? "bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30"
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

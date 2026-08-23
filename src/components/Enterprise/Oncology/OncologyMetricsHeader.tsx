import React from "react";
import {
  Dna,
  Sparkles,
  Activity,
  ShieldAlert,
  Flame,
  Radio,
  Plus,
  Pill,
  Users,
  TestTube2
} from "lucide-react";
import { OncologyWardMetrics } from "../../../types/oncologyGenomics";

interface OncologyMetricsHeaderProps {
  metrics: OncologyWardMetrics;
  isLiveStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenIntakeModal: () => void;
  onOpenPgxModal: () => void;
  selectedSite: string;
  onSelectSite: (site: string) => void;
}

export const OncologyMetricsHeader: React.FC<OncologyMetricsHeaderProps> = ({
  metrics,
  isLiveStreaming,
  onToggleStreaming,
  onOpenIntakeModal,
  onOpenPgxModal,
  selectedSite,
  onSelectSite
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/20 text-white">
            <Dna className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                Precision Oncology & Genomic Biomarker Hub
              </h1>
              <span className="bg-violet-500/10 text-violet-400 border border-violet-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                NCCN / ESMO Tier I-IV
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              Next-Generation Somatic Sequencing, ctDNA Liquid Biopsy Kinetics & Pharmacogenomics Decision Station
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onToggleStreaming}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
              isLiveStreaming
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-emerald-900/20"
                : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            }`}
          >
            <Radio className={`w-4 h-4 ${isLiveStreaming ? "text-emerald-400 animate-spin" : ""}`} />
            {isLiveStreaming ? "ctDNA KINETICS STREAMING (1.2s)" : "STREAM PAUSED"}
          </button>

          <button
            onClick={onOpenPgxModal}
            className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-950/30"
          >
            <Pill className="w-4 h-4 text-amber-400" />
            DPYD / UGT1A1 PGx Calculator
          </button>

          <button
            onClick={onOpenIntakeModal}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Molecular Intake
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Cohort */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Cohort Census</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.totalPatients}</span>
            <span className="text-xs text-slate-500 font-bold">Patients</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Active NGS Profiles</p>
        </div>

        {/* Actionable Biomarkers */}
        <div className="bg-slate-950/60 border border-emerald-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Targeted Eligible</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-300">{metrics.actionableTargetedEligibleCount}</span>
            <span className="text-xs text-emerald-500/70 font-bold">Tier I/II</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 font-medium">FDA / NCCN Targetable</p>
        </div>

        {/* TMB-High Count */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold uppercase tracking-wider">TMB-High (&ge;10)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300">{metrics.tmbHighCount}</span>
            <span className="text-xs text-cyan-500/70 font-bold">Patients</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Immune Checkpoint IO</p>
        </div>

        {/* MRD Positive ctDNA */}
        <div className="bg-slate-950/60 border border-rose-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">MRD+ ctDNA</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{metrics.mrdPositiveCtDnaCount}</span>
            <span className="text-xs text-rose-500/70 font-bold">Active Clones</span>
          </div>
          <p className="text-[11px] text-rose-400/80 font-medium">Molecular Residual Disease</p>
        </div>

        {/* PGx Dose Adjusted */}
        <div className="bg-slate-950/60 border border-amber-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">PGx Dose Alert</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">{metrics.pharmacogenomicDoseReducedCount}</span>
            <span className="text-xs text-amber-500/70 font-bold">DPYD / UGT1A1</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Toxicity Risk Aversion</p>
        </div>

        {/* Clinical Trials Matched */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Trial Arms</span>
            <TestTube2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-300">{metrics.clinicalTrialMatchedCount}</span>
            <span className="text-xs text-indigo-400/70 font-bold">Matched</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Phase I-III & Basket</p>
        </div>
      </div>

      {/* Tumor Primary Site Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
        {[
          { id: "ALL", label: "All Tumor Primary Sites" },
          { id: "NON_SMALL_CELL_LUNG", label: "Thoracic / NSCLC (EGFR/ALK/KRAS)" },
          { id: "BREAST", label: "Breast & GYN (BRCA1/2 / HRD)" },
          { id: "COLORECTAL", label: "Gastrointestinal / CRC (KRAS G12C/MSI)" },
          { id: "MELANOMA", label: "Melanoma (BRAF V600E / IO)" },
          { id: "PANCREATIC_DUCTAL", label: "Pancreatic Ductal Adenocarcinoma" },
          { id: "OVARIAN_HIGH_GRADE", label: "High-Grade Serous Ovarian" }
        ].map((site) => (
          <button
            key={site.id}
            onClick={() => onSelectSite(site.id)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedSite === site.id
                ? "bg-violet-500 text-white font-black shadow-md shadow-violet-500/20"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {site.label}
          </button>
        ))}
      </div>
    </div>
  );
};

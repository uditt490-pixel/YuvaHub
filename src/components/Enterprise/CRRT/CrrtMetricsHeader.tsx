import React from "react";
import {
  Droplets,
  Activity,
  ShieldAlert,
  Flame,
  Radio,
  Plus,
  Zap,
  Filter,
  Calculator,
  RefreshCw
} from "lucide-react";
import { CrrtWardMetrics } from "../../../types/crrtTelemetry";

interface CrrtMetricsHeaderProps {
  metrics: CrrtWardMetrics;
  isLiveStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenPrescriptionModal: () => void;
  onOpenDoseModal: () => void;
  selectedModality: string;
  onSelectModality: (modality: string) => void;
}

export const CrrtMetricsHeader: React.FC<CrrtMetricsHeaderProps> = ({
  metrics,
  isLiveStreaming,
  onToggleStreaming,
  onOpenPrescriptionModal,
  onOpenDoseModal,
  selectedModality,
  onSelectModality
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 text-white">
            <Droplets className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                Critical Care Nephrology & CRRT Command Station
              </h1>
              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                KDIGO AKI / ADQI
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              Real-Time Circuit Hydraulics (TMP, $\Delta P$), Regional Citrate Anticoagulation & Effluent Kinetics
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
            {isLiveStreaming ? "HYDRAULICS STREAMING (1.2s)" : "STREAM PAUSED"}
          </button>

          <button
            onClick={onOpenDoseModal}
            className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-indigo-950/30"
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            KDIGO Dose & FF Optimizer
          </button>

          <button
            onClick={onOpenPrescriptionModal}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New CRRT Prescription
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Active CRRT */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Circuits</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.totalCrrtActive}</span>
            <span className="text-xs text-slate-500 font-bold">Beds</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{metrics.cvvhdfCount} CVVHDF | {metrics.cvvhCount} CVVH</p>
        </div>

        {/* Mean Delivered Dose */}
        <div className="bg-slate-950/60 border border-emerald-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Delivered Dose</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-300">{metrics.meanDeliveredDoseMlKgHr}</span>
            <span className="text-xs text-emerald-500/70 font-bold">mL/kg/h</span>
          </div>
          <p className="text-[11px] text-emerald-400/80 font-medium">KDIGO Target: 20–25</p>
        </div>

        {/* Filter Clotting Risk Alert */}
        <div className="bg-slate-950/60 border border-rose-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">TMP Clotting Alert</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{metrics.filterClottingRiskCount}</span>
            <span className="text-xs text-rose-500/70 font-bold">Filters</span>
          </div>
          <p className="text-[11px] text-rose-400/80 font-medium">TMP &gt; 250 mmHg</p>
        </div>

        {/* Citrate Toxicity Lock */}
        <div className="bg-slate-950/60 border border-amber-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Citrate Lock Risk</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">{metrics.citrateToxicityWarningCount}</span>
            <span className="text-xs text-amber-500/70 font-bold">Ratio &gt; 2.5</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Total Ca / iCa Toxicity</p>
        </div>

        {/* Severe Fluid Overload (>10%) */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Fluid Overload &gt;10%</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-300">{metrics.severeFluidOverloadCount}</span>
            <span className="text-xs text-blue-400/70 font-bold">Patients</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Net UF Priority</p>
        </div>

        {/* Hyperkalemia Count */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold uppercase tracking-wider">K+ &gt; 6.0 mmol/L</span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-300">{metrics.hyperkalemiaCount}</span>
            <span className="text-xs text-purple-400/70 font-bold">Patients</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Emergency Clearance</p>
        </div>
      </div>

      {/* Modality Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
        {[
          { id: "ALL", label: "All Modalities" },
          { id: "CVVHDF", label: "CVVHDF (Hemodiafiltration)" },
          { id: "CVVH", label: "CVVH (Pure Convection)" },
          { id: "CVVHD", label: "CVVHD (Pure Diffusion)" },
          { id: "SCUF", label: "SCUF (Slow Ultrafiltration)" },
          { id: "SLED", label: "SLED (Sustained Low-Efficiency)" }
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => onSelectModality(m.id)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedModality === m.id
                ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};

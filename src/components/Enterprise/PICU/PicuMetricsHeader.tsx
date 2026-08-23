import React from "react";
import {
  Activity,
  HeartPulse,
  Wind,
  Droplets,
  AlertTriangle,
  Radio,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Pill
} from "lucide-react";
import { PicuWardOverviewMetrics } from "../../../types/picuTelemetry";

interface PicuMetricsHeaderProps {
  metrics: PicuWardOverviewMetrics;
  isLiveStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenAdmissionModal: () => void;
  onOpenDrugDosingModal: () => void;
  selectedPod: string;
  onSelectPod: (pod: string) => void;
}

export const PicuMetricsHeader: React.FC<PicuMetricsHeaderProps> = ({
  metrics,
  isLiveStreaming,
  onToggleStreaming,
  onOpenAdmissionModal,
  onOpenDrugDosingModal,
  selectedPod,
  onSelectPod
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 text-white">
              <HeartPulse className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                  PICU Critical Care & Ventilator Telemetry
                </h1>
                <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Level 1 Quaternary
                </span>
              </div>
              <p className="text-slate-400 text-sm font-medium">
                PALS 2024 / PALICC-2 High-Acuity Pediatric Monitoring & Respiratory Telemetry Command Station
              </p>
            </div>
          </div>
        </div>

        {/* Global Control Buttons */}
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
            {isLiveStreaming ? "LIVE TELEMETRY ACTIVE (1s)" : "STREAM PAUSED"}
          </button>

          <button
            onClick={onOpenDrugDosingModal}
            className="px-4 py-2.5 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-violet-950/30"
          >
            <Pill className="w-4 h-4 text-violet-400" />
            PALS Resuscitation Calculator
          </button>

          <button
            onClick={onOpenAdmissionModal}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
            Admit Pediatric Patient
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Census */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Ward Census</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.occupiedBeds}</span>
            <span className="text-xs text-slate-500 font-bold">/ {metrics.totalBeds} Beds</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.occupancyRatePercent}%` }}
            />
          </div>
        </div>

        {/* Critical Instability */}
        <div className="bg-slate-950/60 border border-rose-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Critical / Code</span>
            <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{metrics.criticalPatientsCount}</span>
            <span className="text-xs text-rose-500/70 font-bold">Patients</span>
          </div>
          <p className="text-[11px] text-rose-400/80 font-medium">Acuity Red / PALS Protocols</p>
        </div>

        {/* Active Mechanical Ventilation */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Ventilated</span>
            <Wind className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.activeVentilatorsCount}</span>
            <span className="text-xs text-sky-400/70 font-bold">({metrics.hfovActiveCount} HFOV)</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">PALICC-2 Protections</p>
        </div>

        {/* High Vasoactive Support */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">High VIS (&gt;15)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{metrics.highVisScoreCount}</span>
            <span className="text-xs text-amber-500/70 font-bold">Patients</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Dual/Triple Inotropes</p>
        </div>

        {/* Fluid Overload > 10% */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Fluid Overload</span>
            <Droplets className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-300">{metrics.fluidOverloadHighCount}</span>
            <span className="text-xs text-indigo-400/70 font-bold">&gt;10% FO</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">KDIGO / CRRT Evaluation</p>
        </div>

        {/* Average PEWS Score */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-violet-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Mean PEWS</span>
            <Activity className="w-4 h-4 text-violet-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-violet-300">{metrics.averagePewsScore}</span>
            <span className="text-xs text-slate-500 font-bold">/ 9 Scale</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Unit Early Deterioration</p>
        </div>
      </div>

      {/* PICU Pod Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
        {[
          { id: "ALL", label: "All Pods (Unit View)" },
          { id: "HIGH_FREQUENCY_VENT_POD", label: "High-Frequency Vent Pod (HFOV)" },
          { id: "CARDIAC_PICU", label: "Cardiac PICU (Post-Op Congenital)" },
          { id: "GENERAL_PICU", label: "General Medical / Sepsis Pod" },
          { id: "NEURO_PICU", label: "Neuro PICU (TBI / ICP Telemetry)" },
          { id: "ISOLATION_PICU", label: "Isolation / Status Asthmaticus" }
        ].map((pod) => (
          <button
            key={pod.id}
            onClick={() => onSelectPod(pod.id)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedPod === pod.id
                ? "bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {pod.label}
          </button>
        ))}
      </div>
    </div>
  );
};

import React from "react";
import {
  Baby,
  Activity,
  ShieldAlert,
  Flame,
  Radio,
  Plus,
  Zap,
  Calculator,
  Thermometer,
  Sun
} from "lucide-react";
import { NicuWardMetrics } from "../../../types/nicuTelemetry";

interface NicuMetricsHeaderProps {
  metrics: NicuWardMetrics;
  isLiveStreaming: boolean;
  onToggleStreaming: () => void;
  onOpenAdmissionModal: () => void;
  onOpenGirModal: () => void;
  selectedBracket: string;
  onSelectBracket: (bracket: string) => void;
}

export const NicuMetricsHeader: React.FC<NicuMetricsHeaderProps> = ({
  metrics,
  isLiveStreaming,
  onToggleStreaming,
  onOpenAdmissionModal,
  onOpenGirModal,
  selectedBracket,
  onSelectBracket
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg shadow-pink-500/20 text-white">
            <Baby className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                NICU Telemetry & High-Frequency Ventilation Station
              </h1>
              <span className="bg-pink-500/10 text-pink-400 border border-pink-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                AAP / NRP 8th Edition
              </span>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              ELBW Micro-preemie Resuscitation, HFOV / iNO Mechanics, Pre/Post-Ductal SpO₂ & NIRS Perfusion Console
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
            {isLiveStreaming ? "NEONATAL STREAMING (1.2s)" : "STREAM PAUSED"}
          </button>

          <button
            onClick={onOpenGirModal}
            className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-950/30"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            GIR & Neonatal Fluid Calculator
          </button>

          <button
            onClick={onOpenAdmissionModal}
            className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-pink-500/20"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            New Neonate Admission
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total NICU Census */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">NICU Census</span>
            <Baby className="w-4 h-4 text-pink-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.totalNicuCensus}</span>
            <span className="text-xs text-slate-500 font-bold">Neonates</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{metrics.elbwVlbwCount} ELBW/VLBW (&lt;1.5kg)</p>
        </div>

        {/* HFOV Active */}
        <div className="bg-slate-950/60 border border-cyan-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-semibold uppercase tracking-wider">HFOV / HFJV</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300">{metrics.hfovActiveCount}</span>
            <span className="text-xs text-cyan-500/70 font-bold">Active</span>
          </div>
          <p className="text-[11px] text-cyan-400/80 font-medium">Oscillators Running</p>
        </div>

        {/* PPHN Pre/Post Ductal Gradient */}
        <div className="bg-slate-950/60 border border-rose-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">&Delta;SpO₂ &gt;10% PPHN</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">{metrics.prePostDuctalGradientCount}</span>
            <span className="text-xs text-rose-500/70 font-bold">Alarms</span>
          </div>
          <p className="text-[11px] text-rose-400/80 font-medium">R&rarr;L Shunting Risk</p>
        </div>

        {/* Therapeutic Hypothermia HIE */}
        <div className="bg-slate-950/60 border border-blue-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider">HIE Cooling (33.5°C)</span>
            <Thermometer className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-300">{metrics.therapeuticHypothermiaCount}</span>
            <span className="text-xs text-blue-400/70 font-bold">Active</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">72h Neuroprotection</p>
        </div>

        {/* Phototherapy Active */}
        <div className="bg-slate-950/60 border border-amber-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Phototherapy</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">{metrics.phototherapyActiveCount}</span>
            <span className="text-xs text-amber-500/70 font-bold">Beds</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Bhutani Nomogram</p>
        </div>

        {/* Mean SNAPPE-II */}
        <div className="bg-slate-950/60 border border-purple-900/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Mean SNAPPE-II</span>
            <ShieldAlert className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-300">{metrics.meanSnappeScore}</span>
            <span className="text-xs text-purple-400/70 font-bold">Points</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Acuity Index</p>
        </div>
      </div>

      {/* Gestational Bracket Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-thin">
        {[
          { id: "ALL", label: "All Gestational Brackets" },
          { id: "EXTREMELY_PRETERM", label: "Extremely Preterm (<28w / ELBW)" },
          { id: "VERY_PRETERM", label: "Very Preterm (28–31w / VLBW)" },
          { id: "MODERATE_LATE_PRETERM", label: "Moderate to Late Preterm (32–36w)" },
          { id: "FULL_TERM", label: "Full Term (≥37w / HIE / MAS)" }
        ].map((bracket) => (
          <button
            key={bracket.id}
            onClick={() => onSelectBracket(bracket.id)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              selectedBracket === bracket.id
                ? "bg-pink-500 text-white font-black shadow-md shadow-pink-500/20"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {bracket.label}
          </button>
        ))}
      </div>
    </div>
  );
};

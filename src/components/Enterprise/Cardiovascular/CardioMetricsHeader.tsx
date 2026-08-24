import React from "react";
import {
  Heart,
  Activity,
  Zap,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Sliders,
  TrendingDown,
  Droplets,
  Layers,
  ThermometerSnowflake,
  RotateCcw
} from "lucide-react";
import { CardioWardMetrics } from "../../../types/cardiovascularTelemetry";

interface CardioMetricsHeaderProps {
  metrics: CardioWardMetrics | null;
  isLiveStreaming: boolean;
  onToggleLiveStreaming: () => void;
  onOpenAdmission: () => void;
  onOpenCalculator: () => void;
}

export const CardioMetricsHeader: React.FC<CardioMetricsHeaderProps> = ({
  metrics,
  isLiveStreaming,
  onToggleLiveStreaming,
  onOpenAdmission,
  onOpenCalculator
}) => {
  if (!metrics) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden mb-6">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Title, Command Badge & Quick Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center shadow-lg shadow-rose-600/30 ring-1 ring-rose-400/40">
            <Heart className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Cardiovascular Hemodynamics & MCS/ECMO Command Station
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                CTICU / CCU Level 1
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-0.5">
              Continuous Invasives, VA/VV-ECMO Circuit Telemetry, SCAI Shock Stages & Transmembrane Gradient Surveillance
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={onToggleLiveStreaming}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md ${
              isLiveStreaming
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                : "bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isLiveStreaming ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            />
            {isLiveStreaming ? "Live Telemetry Active" : "Telemetry Paused"}
          </button>

          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition-all shadow-md"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            Hemodynamic Calculator
          </button>

          <button
            onClick={onOpenAdmission}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-600/30"
          >
            <Activity className="w-4 h-4" />
            Admit Patient to CTICU
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
        {/* Census */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>UNIT CENSUS</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{metrics.totalOccupiedBeds}</span>
            <span className="text-xs text-slate-500">/ {metrics.totalAvailableBeds} Beds</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all"
              style={{ width: `${(metrics.totalOccupiedBeds / metrics.totalAvailableBeds) * 100}%` }}
            />
          </div>
        </div>

        {/* VA / VV ECMO */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>ACTIVE ECMO</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400">
              {metrics.activeVaEcmoCount + metrics.activeVvEcmoCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (VA: {metrics.activeVaEcmoCount} | VV: {metrics.activeVvEcmoCount})
            </span>
          </div>
          <div className="text-[11px] text-rose-300/80 mt-2 font-mono flex items-center gap-1">
            <Droplets className="w-3 h-3 text-rose-400" /> Extracorporeal Flow
          </div>
        </div>

        {/* ECPELLA / Impella */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>IMPELLA / ECPELLA</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">
              {metrics.activeImpellaCount + metrics.activeEcpellaCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({metrics.activeEcpellaCount} Unloaded)
            </span>
          </div>
          <div className="text-[11px] text-amber-300/80 mt-2 font-mono flex items-center gap-1">
            <Activity className="w-3 h-3 text-amber-400" /> Microaxial Support
          </div>
        </div>

        {/* CPO < 0.60 W (Hypoperfusion) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>CRITICAL CPO (&lt;0.6W)</span>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${metrics.criticalCpoCount > 0 ? "text-red-400 animate-pulse" : "text-slate-300"}`}>
              {metrics.criticalCpoCount}
            </span>
            <span className="text-xs text-slate-500">Pts at risk</span>
          </div>
          <div className="text-[11px] text-red-400/80 mt-2 font-mono">
            Cardiac Power Output
          </div>
        </div>

        {/* Oxygenator TMP > 50 mmHg */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>HIGH TMP (&gt;50 mmHg)</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${metrics.highTransmembranePressureCount > 0 ? "text-amber-400" : "text-slate-300"}`}>
              {metrics.highTransmembranePressureCount}
            </span>
            <span className="text-xs text-slate-500">Membrane Clotting</span>
          </div>
          <div className="text-[11px] text-amber-300/80 mt-2 font-mono">
            Transmembrane ΔP
          </div>
        </div>

        {/* Harlequin Syndrome Alert Count */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>HARLEQUIN ALERTS</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${metrics.harlequinSyndromeAlertCount > 0 ? "text-rose-400 animate-pulse" : "text-slate-300"}`}>
              {metrics.harlequinSyndromeAlertCount}
            </span>
            <span className="text-xs text-slate-500">Δ SpO2 &gt; 10%</span>
          </div>
          <div className="text-[11px] text-rose-300/80 mt-2 font-mono">
            Differential Hypoxemia
          </div>
        </div>
      </div>

      {/* SCAI Shock Classification Distribution Banner */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-semibold uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>SCAI Shock Stratification:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono">
            Stage A (At Risk): <strong className="text-white">{metrics.scaiStageDistribution.stageA}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono">
            Stage B (Beginning): <strong className="text-white">{metrics.scaiStageDistribution.stageB}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
            Stage C (Classic): <strong className="text-white">{metrics.scaiStageDistribution.stageC}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono">
            Stage D (Deteriorating): <strong className="text-white">{metrics.scaiStageDistribution.stageD}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-red-600/20 border border-red-500/50 text-red-300 font-mono">
            Stage E (Extremis): <strong className="text-white">{metrics.scaiStageDistribution.stageE}</strong>
          </span>
        </div>
        <div className="text-slate-400 font-mono">
          Avg CI: <span className="text-cyan-300 font-bold">{metrics.averageCardiacIndex} L/min/m²</span> | Avg Lactate: <span className="text-amber-300 font-bold">{metrics.averageLactate} mmol/L</span>
        </div>
      </div>
    </div>
  );
};

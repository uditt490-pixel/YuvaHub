import React from "react";
import { 
  Activity, 
  Droplets, 
  Flame, 
  AlertTriangle, 
  PlusCircle, 
  Calculator, 
  BellRing, 
  Layers, 
  Sliders, 
  TrendingDown, 
  ShieldAlert,
  Zap
} from "lucide-react";
import { NephrologyCensusOverview } from "../../../types/nephrologyTelemetry";

interface NephrologyMetricsHeaderProps {
  overview: NephrologyCensusOverview;
  onOpenAdmission: () => void;
  onOpenCalculator: () => void;
  onOpenCitrateModal: () => void;
  onOpenAlertConsole: () => void;
  totalAlertsCount: number;
}

export const NephrologyMetricsHeader: React.FC<NephrologyMetricsHeaderProps> = ({
  overview,
  onOpenAdmission,
  onOpenCalculator,
  onOpenCitrateModal,
  onOpenAlertConsole,
  totalAlertsCount
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-30 shadow-2xl backdrop-blur-md bg-opacity-95">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Unit Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider uppercase text-white font-mono flex items-center gap-2">
                Nephrology, KDIGO AKI & CRRT Command Station
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-cyan-950 text-cyan-400 border border-cyan-700">
                CRRT / IHD
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous Renal Replacement (CVVHDF/SCUF/SLED) • KDIGO AKI 1-3 • Citrate RCA • Dialyzer Kinetics & Acid-Base
            </p>
          </div>
        </div>

        {/* Action Controls & Solver Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAdmission}
            className="px-3.5 py-2 text-xs font-black uppercase tracking-wider bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-950/60 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Admit Patient
          </button>

          <button
            onClick={onOpenCalculator}
            className="px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Calculator className="w-4 h-4" />
            KDIGO & Kt/V Solver
          </button>

          <button
            onClick={onOpenCitrateModal}
            className="px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            Citrate RCA Titrator
          </button>

          <button
            onClick={onOpenAlertConsole}
            className={"px-3 py-2 text-xs font-black uppercase rounded-xl transition flex items-center gap-1.5 cursor-pointer relative active:scale-95 " + (totalAlertsCount > 0 ? "bg-rose-600 text-white shadow-lg shadow-rose-950/60" : "bg-slate-900 text-slate-400 border border-slate-800")}
          >
            <BellRing className={"w-4 h-4 " + (totalAlertsCount > 0 ? "animate-bounce" : "")} />
            Alarms
            {totalAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-white text-rose-700 text-[10px] font-black rounded-full ml-1">
                {totalAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Census Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mt-4 text-xs font-mono">
        {/* Total Census */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Census</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-white">{overview.totalRenalCensus}</span>
            <span className="text-[10px] text-cyan-400 font-sans font-bold">Active Beds</span>
          </div>
        </div>

        {/* KDIGO Stage 3 Failure */}
        <div className="bg-slate-900/90 border border-rose-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">KDIGO Stage 3</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-rose-400">{overview.kdigoStage3Count}</span>
            <span className="text-[10px] text-rose-300 font-sans font-bold">Failure</span>
          </div>
        </div>

        {/* Active CRRT Circuits */}
        <div className="bg-slate-900/90 border border-cyan-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Active CRRT</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-cyan-300">{overview.activeCrrtCircuitsCount}</span>
            <span className="text-[10px] text-cyan-400 font-sans font-bold">CVVH/CVVHDF</span>
          </div>
        </div>

        {/* Active IHD Sessions */}
        <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intermittent HD</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-slate-200">{overview.activeIhdSessionsCount}</span>
            <span className="text-[10px] text-slate-400 font-sans font-bold">IHD / SLED</span>
          </div>
        </div>

        {/* Hyperkalemia Alarms */}
        <div className="bg-slate-900/90 border border-amber-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Hyperkalemia</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-amber-400">{overview.criticalHyperkalemiaCount}</span>
            <span className="text-[10px] text-amber-300 font-sans font-bold">&gt; 6.0 mEq/L</span>
          </div>
        </div>

        {/* TMP Clotting Alarms */}
        <div className="bg-slate-900/90 border border-red-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">TMP &gt; 250 mmHg</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-red-400">{overview.filterClottingTmpAlarmsCount}</span>
            <span className="text-[10px] text-red-300 font-sans font-bold">Clot Risk</span>
          </div>
        </div>

        {/* Cumulative Fluid Removed */}
        <div className="bg-slate-900/90 border border-emerald-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">24h Net Decongestion</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-emerald-400">{overview.cumulativeFluidRemovedLiters} L</span>
            <span className="text-[10px] text-emerald-300 font-sans font-bold">Ultrafiltrate</span>
          </div>
        </div>
      </div>
    </header>
  );
};

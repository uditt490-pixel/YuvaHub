import React from "react";
import { 
  Activity, 
  Baby, 
  Flame, 
  AlertTriangle, 
  PlusCircle, 
  Calculator, 
  BellRing, 
  Sliders, 
  Wind, 
  ShieldAlert,
  Zap,
  Sparkles
} from "lucide-react";
import { PicuCensusOverview } from "../../../types/picuTelemetry";

interface PicuMetricsHeaderProps {
  overview: PicuCensusOverview;
  onOpenAdmission: () => void;
  onOpenCalculator: () => void;
  onOpenIncubatorModal: () => void;
  onOpenAlertConsole: () => void;
  totalAlertsCount: number;
}

export const PicuMetricsHeader: React.FC<PicuMetricsHeaderProps> = ({
  overview,
  onOpenAdmission,
  onOpenCalculator,
  onOpenIncubatorModal,
  onOpenAlertConsole,
  totalAlertsCount
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-30 shadow-2xl backdrop-blur-md bg-opacity-95">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Unit Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center shadow-lg shadow-pink-950/50">
            <Baby className="w-6 h-6 text-pink-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider uppercase text-white font-mono flex items-center gap-2">
                PICU & Neonatal Critical Care Command Station
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-pink-950 text-pink-300 border border-pink-700">
                PALS / NICU
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pediatric Early Warning (PEWS) • PALS Broselow Resus Dosing • HFOV & PARDS OI • Ductal SpO2 Gradient • Isolette Micro-Environment
            </p>
          </div>
        </div>

        {/* Action Controls & Solver Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAdmission}
            className="px-3.5 py-2 text-xs font-black uppercase tracking-wider bg-pink-600 hover:bg-pink-500 text-white rounded-xl shadow-lg shadow-pink-950/60 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Admit Child/Neonate
          </button>

          <button
            onClick={onOpenCalculator}
            className="px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-pink-300 border border-pink-500/40 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Calculator className="w-4 h-4" />
            PALS & PEWS Solver
          </button>

          <button
            onClick={onOpenIncubatorModal}
            className="px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-xl transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            Isolette Micro-Climate
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
            <span className="text-xl font-black text-white">{overview.totalCensus}</span>
            <span className="text-[10px] text-pink-400 font-sans font-bold">Beds & Isolettes</span>
          </div>
        </div>

        {/* Micro-Preemie (<28w) */}
        <div className="bg-slate-900/90 border border-pink-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">Micro-Preemies</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-pink-300">{overview.microPreemieCount}</span>
            <span className="text-[10px] text-pink-400 font-sans font-bold">&lt; 28 Weeks</span>
          </div>
        </div>

        {/* Critical PEWS (>= 6) */}
        <div className="bg-slate-900/90 border border-rose-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Critical PEWS &gt;= 6</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-rose-400">{overview.criticalPewsCount}</span>
            <span className="text-[10px] text-rose-300 font-sans font-bold">STAT Team</span>
          </div>
        </div>

        {/* Severe PARDS (OI >= 16) */}
        <div className="bg-slate-900/90 border border-red-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Severe PARDS (OI)</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-red-400">{overview.severePardsOiCount}</span>
            <span className="text-[10px] text-red-300 font-sans font-bold">OI &gt;= 16</span>
          </div>
        </div>

        {/* Active HFOV Ventilation */}
        <div className="bg-slate-900/90 border border-cyan-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">HFOV Oscillator</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-cyan-300">{overview.activeHfovVentCount}</span>
            <span className="text-[10px] text-cyan-400 font-sans font-bold">Active Vents</span>
          </div>
        </div>

        {/* Ductal Gradient (PPHN iNO) */}
        <div className="bg-slate-900/90 border border-amber-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">PPHN Ductal Delta</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-amber-400">{overview.activeNitricOxideCount}</span>
            <span className="text-[10px] text-amber-300 font-sans font-bold">Delta &gt;= 5%</span>
          </div>
        </div>

        {/* Phototherapy Active */}
        <div className="bg-slate-900/90 border border-violet-900/60 p-2.5 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Phototherapy</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-black text-violet-300">{overview.phototherapyActiveCount}</span>
            <span className="text-[10px] text-violet-300 font-sans font-bold">Bili-Bed Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Flame, 
  Timer, 
  AlertTriangle, 
  Droplet, 
  Radio, 
  Bed, 
  Layers, 
  HeartCrack,
  RefreshCw
} from 'lucide-react';
import { TraumaCensusOverview } from '../../../types/traumaTelemetry';

interface TraumaMetricsHeaderProps {
  overview: TraumaCensusOverview;
  onOpenIntake: () => void;
  onOpenCalculator: () => void;
  onOpenTegModal: () => void;
  onOpenAlertConsole: () => void;
  totalAlertsCount: number;
}

export const TraumaMetricsHeader: React.FC<TraumaMetricsHeaderProps> = ({
  overview,
  onOpenIntake,
  onOpenCalculator,
  onOpenTegModal,
  onOpenAlertConsole,
  totalAlertsCount
}) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 p-4 shadow-xl text-slate-100">
      {/* Top Banner: Module Title & Clinical State */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 via-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-900/30 border border-rose-500/40">
            <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight text-white font-mono uppercase">
                Trauma Resuscitation & MTP Command Station
              </h1>
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Level 1 Trauma Center Active
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-cyan-300 border border-cyan-800/50">
                ATLS & TEG/ROTEM Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              High-Density Resuscitation Matrix • Massive Transfusion Protocol (1:1:1) • REBOA Occlusion Tracking • Lethal Triad Surveillance
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenIntake}
            className="px-3.5 py-2 text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-all shadow-md shadow-rose-950/50 flex items-center gap-2 cursor-pointer border border-rose-400/40 active:scale-95"
          >
            <Flame className="w-4 h-4 text-amber-300" />
            + Direct Trauma Bay Intake
          </button>

          <button
            onClick={onOpenCalculator}
            className="px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-cyan-300 rounded-lg transition border border-cyan-500/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            Trauma Scores Solver
          </button>

          <button
            onClick={onOpenTegModal}
            className="px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-lg transition border border-amber-500/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            TEG / ROTEM Visualizer
          </button>

          <button
            onClick={onOpenAlertConsole}
            className="relative px-3 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-rose-300 rounded-lg transition border border-rose-500/40 flex items-center gap-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Alarm Console
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 text-[9px] font-black rounded-full bg-rose-600 text-white animate-bounce shadow-md">
                {totalAlertsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Active Trauma Bays */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Trauma Census</span>
            <Bed className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">{overview.totalBaysActive} <span className="text-xs text-slate-500 font-normal">/ 8 Bays</span></span>
            <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">100% Monitored</span>
          </div>
        </div>

        {/* Level 1 Stat Alpha Activations */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-rose-900/50 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-300 text-[11px] font-bold uppercase tracking-wider">
            <span>STAT Alpha (L1)</span>
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400 font-mono">{overview.level1AlphaActive}</span>
            <span className="text-[10px] font-semibold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-700/50">Emergency Op</span>
          </div>
        </div>

        {/* MTP Coolers in Transit */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-amber-900/50 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-300 text-[11px] font-bold uppercase tracking-wider">
            <span>Active MTP Transfusions</span>
            <Droplet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400 font-mono">{overview.activeMtpCoolersInTransit}</span>
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700/50">1:1:1 Ratio</span>
          </div>
        </div>

        {/* REBOA Occlusions */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-violet-900/50 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between text-violet-300 text-[11px] font-bold uppercase tracking-wider">
            <span>Active REBOA</span>
            <Timer className="w-4 h-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-violet-400 font-mono">{overview.activeReboaDeployments}</span>
            <span className="text-[10px] font-semibold text-violet-400 bg-violet-950/80 px-1.5 py-0.5 rounded border border-violet-700/50">Timer Active</span>
          </div>
        </div>

        {/* Lethal Triad Risk Count */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-red-900/60 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-300 text-[11px] font-bold uppercase tracking-wider">
            <span>Lethal Triad Alert</span>
            <HeartCrack className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-red-400 font-mono">{overview.lethalTriadHighRiskCount}</span>
            <span className="text-[10px] font-semibold text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-700/50">High Risk >=2</span>
          </div>
        </div>

        {/* Blood Bank Reserves */}
        <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Universal Blood Bank</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm font-black text-emerald-400 font-mono">
              {overview.bloodBankUniversalUnitsO_Neg} <span className="text-[10px] text-slate-400">O-Neg</span> | {overview.bloodBankUniversalUnitsAB_Ffp} <span className="text-[10px] text-slate-400">AB-FFP</span>
            </span>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};

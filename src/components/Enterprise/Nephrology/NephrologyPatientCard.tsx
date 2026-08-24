import React from "react";
import { 
  Activity, 
  Droplets, 
  AlertTriangle, 
  Zap, 
  Clock, 
  Sliders, 
  ArrowUpRight, 
  ShieldAlert,
  Flame,
  CheckCircle2
} from "lucide-react";
import { NephrologyPatient } from "../../../types/nephrologyTelemetry";

interface NephrologyPatientCardProps {
  patient: NephrologyPatient;
  onInspect: (p: NephrologyPatient) => void;
  onOpenEscalation: (p: NephrologyPatient) => void;
}

export const NephrologyPatientCard: React.FC<NephrologyPatientCardProps> = ({
  patient,
  onInspect,
  onOpenEscalation
}) => {
  const getKdigoBadge = (stage: string) => {
    switch (stage) {
      case "STAGE_3_FAILURE":
        return "bg-rose-600 text-white border-rose-400/50 animate-pulse";
      case "STAGE_2_INJURY":
        return "bg-amber-600 text-amber-50 border-amber-400/50";
      case "STAGE_1_RISK":
        return "bg-yellow-600 text-yellow-50 border-yellow-400/50";
      default:
        return "bg-emerald-700 text-emerald-100 border-emerald-600";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "EMERGENT_STAT_DIALYSIS":
        return "bg-rose-950/80 text-rose-300 border-rose-700";
      case "HIGH_CRITICAL_AKI":
        return "bg-amber-950/80 text-amber-300 border-amber-700";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const tmp = patient.circuit.transmembranePressureTmpMmHg;
  const isTmpElevated = tmp >= 250;
  const k = patient.electrolytes.serumPotassiumMeqL;
  const isHyperkalemic = k >= 6.0;

  return (
    <div className="bg-slate-900/95 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-xl overflow-hidden flex flex-col justify-between text-slate-100 group">
      {/* Card Top Banner: Bed & KDIGO Staging */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-black font-mono text-sm text-cyan-400 tracking-wide">
            {patient.renalWardBed}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={"px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border " + getKdigoBadge(patient.kdigoStage)}>
            {patient.kdigoStage.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Patient Demographics & Etiology */}
      <div className="p-3.5 space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition truncate">
              {patient.name}
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              {patient.age}y {patient.gender[0]} • {patient.mrn}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={patient.primaryEtiology}>
            🧪 {patient.primaryEtiology}
          </p>
        </div>

        {/* Modality & Anticoagulation Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
            {patient.currentModality.split("_")[0]}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
            {patient.anticoagulation.replace(/_/g, " ")}
          </span>
          <span className={"px-2 py-0.5 text-[10px] font-bold rounded border " + getPriorityBadge(patient.triagePriority)}>
            {patient.triagePriority.replace(/_/g, " ")}
          </span>
        </div>

        {/* Key Renal Biomarkers Matrix */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center font-mono">
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">Creatinine</div>
            <div className="text-sm font-black text-rose-400">
              {patient.electrolytes.serumCreatinineMgDl}
            </div>
            <div className="text-[8px] text-slate-500">x{patient.electrolytes.creatinineDeltaMultiplier} base</div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">K+ (mEq/L)</div>
            <div className={"text-sm font-black " + (isHyperkalemic ? "text-rose-400 animate-pulse" : "text-amber-300")}>
              {patient.electrolytes.serumPotassiumMeqL}
            </div>
            <div className="text-[8px] text-slate-500">BUN {patient.electrolytes.bloodUreaNitrogenMgDl}</div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">UO (mL/kg/h)</div>
            <div className={"text-sm font-black " + (patient.urine.urineOutputNormalizedMlKgHr < 0.3 ? "text-rose-400" : "text-emerald-400")}>
              {patient.urine.urineOutputNormalizedMlKgHr}
            </div>
            <div className="text-[8px] text-slate-500">24h: {patient.urine.urineOutputLast24HoursMl}mL</div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">Blood pH</div>
            <div className={"text-sm font-black " + (patient.electrolytes.bloodPh < 7.30 ? "text-rose-400" : "text-cyan-300")}>
              {patient.electrolytes.bloodPh}
            </div>
            <div className="text-[8px] text-slate-500">AG {patient.electrolytes.albuminCorrectedAnionGap}</div>
          </div>
        </div>

        {/* CRRT Circuit Hemodynamics & Pressures */}
        <div className="space-y-1.5 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">TMP Transmembrane P:</span>
            <span className={"font-bold " + (isTmpElevated ? "text-rose-400 font-black animate-pulse" : "text-cyan-300")}>
              {tmp} mmHg {isTmpElevated ? "(CLOT ALARM)" : ""}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-1">
            <span className="text-slate-400">Blood Flow Qb / Effluent:</span>
            <span className="text-slate-200 font-bold">
              {patient.circuit.bloodFlowRateQbMlMin} mL/min • {patient.circuit.effluentDoseMlKgHr} mL/kg/h
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-1">
            <span className="text-slate-400">Net UF / 24h Fluid Balance:</span>
            <span className="text-emerald-400 font-bold">
              {patient.circuit.ultrafiltrationRateNetMlHr} mL/h • {patient.fluidBalance.netCumulativeBalance24HoursMl} mL ({patient.fluidBalance.totalFluidOverloadPercentage}%)
            </span>
          </div>

          {/* Citrate RCA Status */}
          {patient.anticoagulation === "REGIONAL_CITRATE_RCA" && (
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1 text-amber-300">
              <span>Citrate Post-iCa / Ratio:</span>
              <span className="font-bold">
                {patient.citrate.postFilterIonizedCalciumMmolL} mmol/L • Total/iCa {patient.citrate.totalToIonizedCalciumRatio}
              </span>
            </div>
          )}
        </div>

        {/* Active Alarms Badge */}
        {patient.activeAlerts.length > 0 && !patient.activeAlerts[0].acknowledged && (
          <div className="p-2 rounded-lg bg-rose-950/70 border border-rose-700/80 flex items-center justify-between text-xs text-rose-200">
            <div className="flex items-center gap-2 truncate">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
              <span className="font-bold truncate">{patient.activeAlerts[0].title}</span>
            </div>
            <span className="text-[10px] uppercase font-black text-rose-300">STAT</span>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={() => onInspect(patient)}
          className="flex-1 py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg transition border border-cyan-500/30 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          Full Workstation
        </button>

        <button
          onClick={() => onOpenEscalation(patient)}
          className="py-2 px-3 text-xs font-black uppercase bg-rose-700 hover:bg-rose-600 text-white rounded-lg transition border border-rose-500/50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/60 active:scale-98"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          STAT Dialysis
        </button>
      </div>
    </div>
  );
};

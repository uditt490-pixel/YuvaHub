import React from "react";
import { 
  Activity, 
  Baby, 
  Wind, 
  Zap, 
  Flame, 
  Heart, 
  Sliders, 
  AlertTriangle,
  Sun
} from "lucide-react";
import { PicuPatient } from "../../../types/picuTelemetry";

interface PicuPatientCardProps {
  patient: PicuPatient;
  onInspect: (p: PicuPatient) => void;
  onOpenEscalation: (p: PicuPatient) => void;
}

export const PicuPatientCard: React.FC<PicuPatientCardProps> = ({
  patient,
  onInspect,
  onOpenEscalation
}) => {
  const getBroselowBadge = (color: string) => {
    switch (color) {
      case "PINK_PREEMIE_UNDER_3KG":
      case "PINK_6_7KG":
        return "bg-pink-700 text-white border-pink-400";
      case "RED_8_9KG":
        return "bg-red-700 text-white border-red-400";
      case "PURPLE_10_11KG":
        return "bg-purple-700 text-white border-purple-400";
      case "YELLOW_12_14KG":
        return "bg-yellow-600 text-black border-yellow-300";
      case "WHITE_15_18KG":
        return "bg-slate-200 text-slate-900 border-slate-400";
      case "BLUE_19_23KG":
        return "bg-blue-700 text-white border-blue-400";
      case "ORANGE_24_29KG":
        return "bg-orange-600 text-white border-orange-400";
      case "GREEN_30_36KG":
        return "bg-emerald-700 text-white border-emerald-400";
      default:
        return "bg-slate-700 text-white border-slate-500";
    }
  };

  const getPewsBadge = (score: number) => {
    if (score >= 7) return "bg-rose-600 text-white border-rose-400 animate-pulse font-black";
    if (score >= 5) return "bg-amber-600 text-white border-amber-400 font-bold";
    if (score >= 3) return "bg-yellow-600 text-slate-900 border-yellow-400";
    return "bg-emerald-700 text-emerald-100 border-emerald-500";
  };

  const isDuctalDeltaElevated = patient.vitals.prePostDuctalSpO2Delta >= 5;
  const isPewsHigh = patient.pews.totalPewsScore >= 5;

  return (
    <div className="bg-slate-900/95 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-xl overflow-hidden flex flex-col justify-between text-slate-100 group">
      {/* Card Header: Bed & Broselow Color Tape */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-ping" />
          <span className="font-black font-mono text-sm text-pink-300 tracking-wide">
            {patient.bedIsoletteNumber}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={"px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border " + getBroselowBadge(patient.palsDosing.broselowColor)}>
            {patient.palsDosing.broselowColor.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {/* Patient Demographics & Diagnosis */}
      <div className="p-3.5 space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-white group-hover:text-pink-300 transition truncate">
              {patient.name}
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              {patient.currentWeightKg < 2 ? (patient.currentWeightKg * 1000) + "g" : patient.currentWeightKg + "kg"} • {patient.gestationalAgeWeeks < 37 ? patient.gestationalAgeWeeks + "w GA" : (patient.chronologicalAgeDays > 365 ? Math.floor(patient.chronologicalAgeDays / 365) + "y" : Math.floor(patient.chronologicalAgeDays / 30) + "m")}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={patient.primaryDiagnosis}>
            🍼 {patient.primaryDiagnosis}
          </p>
        </div>

        {/* Care Unit & Vent Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-pink-950 text-pink-300 border border-pink-700">
            {patient.careUnit.replace(/_/g, " ")}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-cyan-300 border border-slate-700">
            {patient.ventilationMode.split("_")[0]}
          </span>
          <span className={"px-2 py-0.5 text-[10px] font-bold rounded border " + getPewsBadge(patient.pews.totalPewsScore)}>
            PEWS {patient.pews.totalPewsScore}/13
          </span>
        </div>

        {/* Real-time Pediatric Vitals Matrix */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center font-mono">
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">HR (bpm)</div>
            <div className={"text-sm font-black " + (patient.vitals.heartRate > 180 || patient.vitals.heartRate < 80 ? "text-rose-400" : "text-slate-200")}>
              {patient.vitals.heartRate}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">BP (MAP)</div>
            <div className="text-sm font-black text-slate-200">
              {patient.vitals.systolicBp}/{patient.vitals.diastolicBp} ({patient.vitals.meanArterialPressure})
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">Pre-SpO2</div>
            <div className={"text-sm font-black " + (patient.vitals.spO2PreDuctalRightHandPercent < 90 ? "text-rose-400" : "text-emerald-400")}>
              {patient.vitals.spO2PreDuctalRightHandPercent}%
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">Post-SpO2</div>
            <div className={"text-sm font-black " + (isDuctalDeltaElevated ? "text-amber-300 font-black animate-pulse" : "text-emerald-400")}>
              {patient.vitals.spO2PostDuctalFootPercent}%
            </div>
          </div>
        </div>

        {/* Key PALS & Oxygenation Metrics */}
        <div className="space-y-1.5 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">PALS Epinephrine IV:</span>
            <span className="text-pink-300 font-bold">
              {patient.palsDosing.epinephrineIvIoBolusMg} mg (0.01 mg/kg)
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-1">
            <span className="text-slate-400">Defib / Cardioversion:</span>
            <span className="text-amber-300 font-bold">
              {patient.palsDosing.defibrillationInitialJoules}J Initial • {patient.palsDosing.synchronizedCardioversionInitialJoules}J Synced
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-1">
            <span className="text-slate-400">Oxygenation Index (OI):</span>
            <span className={"font-bold " + (patient.oxygenation.oxygenationIndexOI >= 16 ? "text-rose-400 font-black animate-pulse" : "text-cyan-300")}>
              {patient.oxygenation.oxygenationIndexOI} ({patient.oxygenation.pardsClassification.replace(/_/g, " ")})
            </span>
          </div>

          {/* Pre/Post Ductal Delta */}
          {patient.vitals.prePostDuctalSpO2Delta > 0 && (
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1">
              <span className="text-slate-400">Pre/Post Ductal Delta:</span>
              <span className={"font-bold " + (isDuctalDeltaElevated ? "text-rose-400 font-black animate-pulse" : "text-slate-200")}>
                {patient.vitals.prePostDuctalSpO2Delta}% {isDuctalDeltaElevated ? "(PPHN Warning)" : ""}
              </span>
            </div>
          )}

          {/* Isolette Phototherapy */}
          {patient.incubator.phototherapyActive && (
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1 text-violet-300">
              <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5" /> Bili-Bed Phototherapy:</span>
              <span className="font-bold">TcB {patient.incubator.transcutaneousBilirubinTcBMgDl} mg/dL</span>
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
          className="flex-1 py-2 px-3 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-pink-300 rounded-lg transition border border-pink-500/30 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
        >
          <Activity className="w-3.5 h-3.5 text-pink-400" />
          Full Workstation
        </button>

        <button
          onClick={() => onOpenEscalation(patient)}
          className="py-2 px-3 text-xs font-black uppercase bg-rose-700 hover:bg-rose-600 text-white rounded-lg transition border border-rose-500/50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/60 active:scale-98"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          PALS STAT
        </button>
      </div>
    </div>
  );
};

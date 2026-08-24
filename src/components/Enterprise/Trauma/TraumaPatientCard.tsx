import React from "react";
import { 
  Flame, 
  Activity, 
  Droplet, 
  Timer, 
  HeartCrack, 
  AlertTriangle, 
  Layers, 
  User, 
  Zap, 
  ExternalLink,
  ShieldCheck,
  Radio
} from "lucide-react";
import { TraumaPatient } from "../../../types/traumaTelemetry";

interface TraumaPatientCardProps {
  patient: TraumaPatient;
  onInspect: (p: TraumaPatient) => void;
  onOpenEscalation: (p: TraumaPatient) => void;
}

export const TraumaPatientCard: React.FC<TraumaPatientCardProps> = ({
  patient,
  onInspect,
  onOpenEscalation
}) => {
  const getTriageBadge = (level: string) => {
    switch (level) {
      case "LEVEL_1_STAT_ALPHA":
        return "bg-rose-600 text-white border-rose-400/50 animate-pulse";
      case "LEVEL_2_TRAUMA_BRAVO":
        return "bg-amber-600 text-amber-50 border-amber-400/50";
      case "LEVEL_3_URGENT_CHARLIE":
        return "bg-yellow-600 text-yellow-50 border-yellow-400/50";
      default:
        return "bg-slate-700 text-slate-200 border-slate-600";
    }
  };

  const getShockClassBadge = (sc: string) => {
    switch (sc) {
      case "CLASS_IV_SEVERE_EXSANGUINATING":
        return "bg-rose-950/80 text-rose-300 border-rose-700";
      case "CLASS_III_MODERATE_SHOCK":
        return "bg-red-950/80 text-red-300 border-red-700";
      case "CLASS_II_MILD_SHOCK":
        return "bg-amber-950/80 text-amber-300 border-amber-700";
      default:
        return "bg-emerald-950/80 text-emerald-300 border-emerald-700";
    }
  };

  const si = patient.scores.shockIndex;
  const isCriticalSi = si >= 1.2;
  const rsig = patient.scores.reverseShockIndexTimesGcs;
  const isCriticalRsig = rsig < 10.0;
  const lethalCount = patient.scores.lethalTriadIndex.triadCount;

  return (
    <div className="bg-slate-900/95 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-xl overflow-hidden flex flex-col justify-between text-slate-100 group">
      {/* Card Header: Trauma Bay & Triage */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <span className="font-black font-mono text-sm text-cyan-400 tracking-wide">
            {patient.traumaBayNumber}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={"px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border " + getTriageBadge(patient.triageLevel)}>
            {patient.triageLevel.replace(/_/g, " ")}
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800 rounded">
            {patient.admissionTime}
          </span>
        </div>
      </div>

      {/* Patient Demographics & Mechanism */}
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
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5" title={patient.injuryMechanism}>
            ⚠️ {patient.injuryMechanism}
          </p>
        </div>

        {/* Clinical Phase & Shock Classification Badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={"px-2 py-0.5 text-[10px] font-bold rounded border " + getShockClassBadge(patient.shockClass)}>
            {patient.shockClass.replace(/_/g, " ")}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-cyan-300 border border-slate-700">
            {patient.currentPhase.replace(/_/g, " ")}
          </span>
          {patient.abcScore >= 2 && (
            <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-red-600 text-white border border-red-400 animate-pulse">
              ABC {patient.abcScore}/4 (MTP STAT)
            </span>
          )}
        </div>

        {/* Real-time Hemodynamics Matrix */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-center font-mono">
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">HR (bpm)</div>
            <div className={"text-sm font-black " + (patient.vitals.heartRate > 120 ? "text-rose-400" : "text-slate-200")}>
              {patient.vitals.heartRate}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">BP (mmHg)</div>
            <div className={"text-sm font-black " + (patient.vitals.systolicBp < 90 ? "text-rose-400" : "text-slate-200")}>
              {patient.vitals.systolicBp}/{patient.vitals.diastolicBp}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">MAP</div>
            <div className={"text-sm font-black " + (patient.vitals.meanArterialPressure < 65 ? "text-amber-400" : "text-cyan-300")}>
              {patient.vitals.meanArterialPressure}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase">SpO2 %</div>
            <div className={"text-sm font-black " + (patient.vitals.spO2 < 92 ? "text-rose-400" : "text-emerald-400")}>
              {patient.vitals.spO2}%
            </div>
          </div>
        </div>

        {/* Advanced Clinical Indicators: Shock Index, rSIG, GCS, Lethal Triad */}
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {/* Shock Index */}
          <div className={"p-2 rounded-lg border flex flex-col justify-between " + (isCriticalSi ? "bg-rose-950/60 border-rose-700/80 text-rose-200" : "bg-slate-950/50 border-slate-800 text-slate-300")}>
            <span className="text-[9px] font-bold uppercase text-slate-400">Shock Index</span>
            <div className="flex items-baseline justify-between mt-1 font-mono">
              <span className={"text-sm font-black " + (isCriticalSi ? "text-rose-400" : "text-cyan-300")}>
                {si}
              </span>
              <span className="text-[9px] text-slate-500">&gt;0.9 shock</span>
            </div>
          </div>

          {/* rSIG Score */}
          <div className={"p-2 rounded-lg border flex flex-col justify-between " + (isCriticalRsig ? "bg-red-950/60 border-red-700/80 text-red-200" : "bg-slate-950/50 border-slate-800 text-slate-300")}>
            <span className="text-[9px] font-bold uppercase text-slate-400">rSIG × GCS</span>
            <div className="flex items-baseline justify-between mt-1 font-mono">
              <span className={"text-sm font-black " + (isCriticalRsig ? "text-red-400" : "text-emerald-400")}>
                {rsig}
              </span>
              <span className="text-[9px] text-slate-500">GCS {patient.gcs.totalGcs}</span>
            </div>
          </div>

          {/* Lethal Triad Risk */}
          <div className={"p-2 rounded-lg border flex flex-col justify-between " + (lethalCount >= 2 ? "bg-rose-950/80 border-rose-600 text-rose-100" : "bg-slate-950/50 border-slate-800 text-slate-300")}>
            <span className="text-[9px] font-bold uppercase text-slate-400">Lethal Triad</span>
            <div className="flex items-baseline justify-between mt-1 font-mono">
              <span className={"text-sm font-black " + (lethalCount >= 2 ? "text-rose-400" : "text-slate-300")}>
                {lethalCount}/3
              </span>
              <span className="text-[9px] text-slate-500">{patient.scores.lethalTriadIndex.mortalityRiskPercent}% mort</span>
            </div>
          </div>
        </div>

        {/* Resuscitation Equipment Telemetry: MTP & REBOA Badges */}
        <div className="space-y-1.5 text-[11px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          {/* MTP Units transfused */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Droplet className="w-3.5 h-3.5 text-rose-500" />
              <span>Transfusion 1:1:1:</span>
            </div>
            <span className="font-mono font-bold text-slate-200">
              {patient.bloodLedger.prbcUnitsTransfused} pRBC • {patient.bloodLedger.ffpUnitsTransfused} FFP • {patient.bloodLedger.plateletPheresisUnitsTransfused} Plt
            </span>
          </div>

          {/* REBOA status */}
          {patient.reboa.status !== "NOT_INDICATED" && (
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1">
              <div className="flex items-center gap-1.5 text-violet-400 font-bold">
                <Timer className="w-3.5 h-3.5" />
                <span>REBOA {patient.reboa.zone}:</span>
              </div>
              <span className="font-mono font-bold text-amber-300">
                {patient.reboa.elapsedInflationMinutes.toFixed(0)} min / {patient.reboa.maxRecommendedInflationMinutes} max
              </span>
            </div>
          )}

          {/* eFAST status */}
          <div className="flex items-center justify-between border-t border-slate-800/80 pt-1">
            <span className="text-slate-400">eFAST Ultrasound:</span>
            <span className={"font-bold " + (patient.fastExam.totalPositiveQuadrants > 0 ? "text-rose-400" : "text-emerald-400")}>
              {patient.fastExam.totalPositiveQuadrants > 0 ? (patient.fastExam.totalPositiveQuadrants + " (+) Quadrants") : "Negative (No Free Fluid)"}
            </span>
          </div>
        </div>

        {/* Active Alarm Badge if present */}
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
          Emergent Escalation
        </button>
      </div>
    </div>
  );
};

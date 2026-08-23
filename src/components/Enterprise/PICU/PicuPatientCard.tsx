import React from "react";
import {
  Heart,
  Activity,
  Wind,
  Droplets,
  AlertOctagon,
  ChevronRight,
  ShieldAlert,
  Flame,
  Brain,
  Pill,
  Zap,
  TrendingUp,
  Radio
} from "lucide-react";
import { PicuPatient } from "../../../types/picuTelemetry";

interface PicuPatientCardProps {
  patient: PicuPatient;
  onInspect: (patient: PicuPatient) => void;
  onOpenAlerts: (patient: PicuPatient) => void;
  onOpenEscalation: (patient: PicuPatient) => void;
}

export const PicuPatientCard: React.FC<PicuPatientCardProps> = ({
  patient,
  onInspect,
  onOpenAlerts,
  onOpenEscalation
}) => {
  // Determine Acuity styling
  const getAcuityColor = (acuity: PicuPatient["acuityLevel"]) => {
    switch (acuity) {
      case "CODE_PALS":
        return "bg-rose-500/20 text-rose-300 border-rose-500 animate-pulse";
      case "CRITICAL_INSTABILITY":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      case "HIGH_ACUITY":
        return "bg-amber-500/20 text-amber-300 border-amber-500/50";
      case "ELEVATED_RISK":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      case "MONITORING":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
      case "STABLE":
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
    }
  };

  const getPewsBadge = (pewsRisk: PicuPatient["pews"]["pewsRiskLevel"], score: number) => {
    if (score >= 7) return "bg-red-500 text-white font-black";
    if (score >= 5) return "bg-amber-500 text-slate-950 font-black";
    if (score >= 3) return "bg-yellow-500 text-slate-950 font-bold";
    return "bg-slate-700 text-slate-200 font-bold";
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 shadow-xl transition-all duration-200 hover:shadow-cyan-500/10 space-y-4 flex flex-col justify-between">
      {/* Header: Bed & Demographics */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold rounded-lg">
                {patient.bedNumber}
              </span>
              <span className={`px-2.5 py-0.5 border text-[11px] font-black rounded-md uppercase tracking-wider ${getAcuityColor(patient.acuityLevel)}`}>
                {patient.acuityLevel.replace("_", " ")}
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
              {patient.name}
              <span className="text-xs text-slate-400 font-normal">
                ({patient.gender === "MALE" ? "M" : "F"}, {patient.ageYears > 0 ? `${patient.ageYears}y ` : ""}{patient.ageMonths % 12}m)
              </span>
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 font-semibold">{patient.mrn}</span>
            <div className="text-xs font-bold text-cyan-300">{patient.weightKg} kg <span className="text-[10px] text-slate-400 font-normal">({patient.ageBracket})</span></div>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl px-3 py-2 text-xs">
          <p className="text-slate-300 font-medium line-clamp-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Dx:</span>
            {patient.primaryDiagnosis}
          </p>
        </div>
      </div>

      {/* Primary Vitals Strip */}
      <div className="grid grid-cols-4 gap-2">
        {/* Heart Rate */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">HR</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          </div>
          <div className="text-lg font-black text-white">{patient.vitals.heartRate}</div>
          <div className="text-[10px] text-slate-400 font-mono">bpm</div>
        </div>

        {/* BP / MAP */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">BP (MAP)</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-black text-white leading-tight">
            {patient.vitals.systolicBp}/{patient.vitals.diastolicBp}
          </div>
          <div className="text-[10px] text-cyan-400 font-bold font-mono">
            MAP {patient.vitals.meanArterialPressure}
          </div>
        </div>

        {/* SpO2 */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">SpO₂</span>
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className={`text-lg font-black ${patient.vitals.spO2 < 90 ? "text-rose-400" : "text-emerald-400"}`}>
            {patient.vitals.spO2}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">pleth</div>
        </div>

        {/* Resp Rate / EtCO2 */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">RR / EtCO₂</span>
            <Wind className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-sm font-black text-white leading-tight">
            {patient.vitals.respiratoryRate} <span className="text-[10px] text-slate-400 font-normal">/m</span>
          </div>
          <div className="text-[10px] text-sky-400 font-bold font-mono">
            {patient.vitals.etCO2 ? `EtCO₂ ${patient.vitals.etCO2}` : "EtCO₂ --"}
          </div>
        </div>
      </div>

      {/* Ventilator & Respiratory Metrics */}
      <div className="bg-slate-950/60 border border-sky-900/30 rounded-2xl p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-sky-200">Vent: {patient.ventilator.mode}</span>
          </div>
          {patient.pulmonaryIndices.pardsClassification !== "NONE" && (
            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black rounded-md uppercase">
              {patient.pulmonaryIndices.pardsClassification.replace("_", " ")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">FiO₂ / Paw</span>
            <p className="font-bold text-white mt-0.5">
              {Math.round(patient.ventilator.fiO2 * 100)}% / {patient.ventilator.meanAirwayPressure} <span className="text-[10px] text-slate-400">cmH2O</span>
            </p>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">OI / OSI</span>
            <p className={`font-bold mt-0.5 ${patient.pulmonaryIndices.oxygenationIndex >= 16 ? "text-rose-400" : "text-white"}`}>
              {patient.pulmonaryIndices.oxygenationIndex} / {patient.pulmonaryIndices.oxygenSaturationIndex}
            </p>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Vt / kg</span>
            <p className="font-bold text-white mt-0.5">
              {patient.ventilator.tidalVolumePerKg} <span className="text-[10px] text-slate-400">mL/kg</span>
            </p>
          </div>
        </div>
      </div>

      {/* Hemodynamics, Fluid & Clinical Scores */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {/* VIS Score */}
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            VIS Score
            <Pill className="w-3 h-3 text-violet-400" />
          </span>
          <div className={`text-base font-black ${patient.vasoactiveSupport.vasoactiveInotropicScore >= 15 ? "text-amber-400" : "text-white"}`}>
            {patient.vasoactiveSupport.vasoactiveInotropicScore}
          </div>
          <p className="text-[10px] text-slate-400">
            {patient.vasoactiveSupport.vasoactiveInotropicScore > 0 ? "Active Inotropes" : "No Support"}
          </p>
        </div>

        {/* Fluid Overload & AKI */}
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            % Fluid Overload
            <Droplets className="w-3 h-3 text-indigo-400" />
          </span>
          <div className={`text-base font-black ${patient.fluidRenalStatus.percentFluidOverload >= 10 ? "text-rose-400" : "text-white"}`}>
            {patient.fluidRenalStatus.percentFluidOverload}%
          </div>
          <p className="text-[10px] text-slate-400 truncate">
            KDIGO: {patient.fluidRenalStatus.pediatricKdigoAkiStage}
          </p>
        </div>

        {/* PEWS / PELOD-2 */}
        <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl space-y-1">
          <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            PEWS Score
            <Activity className="w-3 h-3 text-rose-400" />
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-xs ${getPewsBadge(patient.pews.pewsRiskLevel, patient.pews.totalPews)}`}>
              {patient.pews.totalPews}/9
            </span>
          </div>
          <p className="text-[10px] text-slate-400">PELOD-2: {patient.pelod2.totalPelod2}</p>
        </div>
      </div>

      {/* Active Alerts Banner */}
      {patient.activeAlerts.length > 0 ? (
        <button
          onClick={() => onOpenAlerts(patient)}
          className="w-full text-left bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl p-2.5 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span className="text-xs font-bold text-rose-300 line-clamp-1">
              {patient.activeAlerts.length} Clinical Alert{patient.activeAlerts.length > 1 ? "s" : ""}: {patient.activeAlerts[0].title}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
        </button>
      ) : (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-2.5 flex items-center gap-2 text-xs font-medium text-emerald-400">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>No critical physiological threshold violations</span>
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => onInspect(patient)}
          className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20"
        >
          <Activity className="w-3.5 h-3.5" />
          Inspect Telemetry & Loops
        </button>

        <button
          onClick={() => onOpenEscalation(patient)}
          className="px-3 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
          title="PALS Emergency Escalation"
        >
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          PALS
        </button>
      </div>
    </div>
  );
};

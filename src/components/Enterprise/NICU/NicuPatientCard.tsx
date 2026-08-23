import React from "react";
import {
  Baby,
  Activity,
  Flame,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Thermometer,
  Sun,
  Scale,
  Clock,
  Heart,
  Droplets
} from "lucide-react";
import { NicuPatient } from "../../../types/nicuTelemetry";

interface NicuPatientCardProps {
  patient: NicuPatient;
  onInspect: (patient: NicuPatient) => void;
  onOpenAlertModal: (patient: NicuPatient) => void;
  onOpenEmergencyModal: (patient: NicuPatient) => void;
}

export const NicuPatientCard: React.FC<NicuPatientCardProps> = ({
  patient,
  onInspect,
  onOpenAlertModal,
  onOpenEmergencyModal
}) => {
  const isPphn = patient.prePostDuctal.gradientDeltaSpO2 > 10;
  const isHypoglycemic = patient.vitals.glucoseMgDl < 45;
  const isHypotensive = patient.vitals.meanArterialPressureMmHg < patient.gestationalAgeWeeks;
  const isCooling = patient.hypothermia === "COOLING_IN_PROGRESS";

  return (
    <div className={`bg-slate-900 border rounded-3xl p-5 shadow-xl transition-all duration-200 hover:shadow-pink-500/10 space-y-4 flex flex-col justify-between ${
      isPphn || isHypoglycemic || isHypotensive
        ? "border-rose-500/60 ring-1 ring-rose-500/30"
        : "border-slate-800 hover:border-pink-500/50"
    }`}>
      {/* Header: Demographics & Gestational Age Badges */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono text-xs font-black rounded-lg">
                {patient.gestationalAgeWeeks}w GA (PMA {patient.postmenstrualAgeWeeks}w)
              </span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[11px] font-bold rounded-md">
                DOL {patient.dayOfLife}
              </span>
              <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-md">
                {patient.weightCategory}
              </span>
              {isCooling && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold rounded-md flex items-center gap-1 animate-pulse">
                  <Thermometer className="w-3 h-3 text-blue-400" />
                  33.5°C HIE COOLING
                </span>
              )}
              {patient.phototherapyActive && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-md flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-400" />
                  PHOTOTHERAPY
                </span>
              )}
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
              {patient.name}
              <span className="text-xs text-slate-400 font-normal">
                ({patient.sex === "MALE" ? "M" : "F"}, {patient.bedNumber})
              </span>
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 font-semibold">{patient.mrn}</span>
            <div className="text-xs font-bold text-pink-300 flex items-center justify-end gap-1 mt-0.5">
              <Scale className="w-3 h-3" />
              {patient.currentWeightGrams}g (Birth: {patient.birthWeightGrams}g)
            </div>
          </div>
        </div>

        {/* Diagnosis Strip */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl px-3 py-2 text-xs">
          <p className="text-slate-300 font-medium line-clamp-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Dx:</span>
            {patient.admissionDiagnosis}
          </p>
        </div>
      </div>

      {/* Ventilator & Respiratory Telemetry Strip */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Ventilator Support: <strong className="text-white font-mono">{patient.ventilation.mode}</strong>
          </span>
          {patient.ventilation.nitricOxidePpm > 0 && (
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black rounded-md">
              iNO {patient.ventilation.nitricOxidePpm} ppm
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs text-center">
          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block font-bold">mPaw</span>
            <span className="font-mono font-black text-cyan-300">{patient.ventilation.meanAirwayPressureCmH2O}</span>
            <span className="text-[8px] text-slate-500 block">cmH2O</span>
          </div>

          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block font-bold">Amplitude &Delta;P</span>
            <span className="font-mono font-black text-white">{patient.ventilation.amplitudeDeltaPCmH2O}</span>
            <span className="text-[8px] text-slate-500 block">cmH2O</span>
          </div>

          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block font-bold">Frequency</span>
            <span className="font-mono font-black text-white">{patient.ventilation.frequencyHz}</span>
            <span className="text-[8px] text-slate-500 block">Hz</span>
          </div>

          <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
            <span className="text-[9px] text-slate-500 uppercase block font-bold">FiO2</span>
            <span className={`font-mono font-black ${patient.ventilation.fractionInspiredOxygenFiO2 >= 0.6 ? "text-rose-400" : "text-emerald-400"}`}>
              {Math.round(patient.ventilation.fractionInspiredOxygenFiO2 * 100)}%
            </span>
            <span className="text-[8px] text-slate-500 block">O2</span>
          </div>
        </div>
      </div>

      {/* Pre/Post-Ductal SpO2 & NIRS Perfusion Strip */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {/* Pre-Ductal SpO2 */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Pre-Ductal</span>
          <div className="text-base font-black text-emerald-400 font-mono">
            {patient.prePostDuctal.preDuctalRightWristSpO2}%
          </div>
          <span className="text-[9px] text-slate-500 block">Right Arm</span>
        </div>

        {/* Post-Ductal SpO2 */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Post-Ductal</span>
          <div className={`text-base font-black font-mono ${isPphn ? "text-rose-400" : "text-emerald-400"}`}>
            {patient.prePostDuctal.postDuctalFootSpO2}%
          </div>
          <span className="text-[9px] text-slate-500 block">&Delta; {patient.prePostDuctal.gradientDeltaSpO2}%</span>
        </div>

        {/* NIRS Cerebral rSO2 */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">NIRS rSO2</span>
          <div className={`text-base font-black font-mono ${patient.prePostDuctal.cerebralNirsRso2Percent < 55 ? "text-amber-400" : "text-indigo-300"}`}>
            {patient.prePostDuctal.cerebralNirsRso2Percent}%
          </div>
          <span className="text-[9px] text-slate-500 block">Brain Tissue</span>
        </div>

        {/* Heart Rate / MAP */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">HR / MAP</span>
          <div className="text-base font-black text-white font-mono">
            {patient.vitals.heartRateBpm} <span className="text-[10px] font-normal text-slate-400">/{patient.vitals.meanArterialPressureMmHg}</span>
          </div>
          <span className="text-[9px] text-slate-500 block">bpm / mmHg</span>
        </div>
      </div>

      {/* Nutrition, GIR & Glycemia Banner */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Droplets className="w-3.5 h-3.5 text-pink-400 shrink-0" />
          <span className="text-slate-300 text-[11px] font-medium">
            GIR: <strong className="text-pink-300">{patient.nutrition.glucoseInfusionRateMgKgMin} mg/kg/min</strong> | 
            Glucose: <strong className={isHypoglycemic ? "text-rose-400 font-black animate-pulse" : "text-white"}>{patient.vitals.glucoseMgDl} mg/dL</strong>
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-400 font-mono">
          SNAPPE: {patient.snappeScore}
        </span>
      </div>

      {/* Active Alerts Banner if any */}
      {patient.alerts.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
            <span className="font-bold text-rose-300 line-clamp-1 text-[11px]">
              {patient.alerts[0].title}
            </span>
          </div>
          <span className="text-[10px] font-black text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded uppercase">
            {patient.alerts.length} Alert{patient.alerts.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => onInspect(patient)}
          className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-600/20"
        >
          <Baby className="w-3.5 h-3.5" />
          Inspect Telemetry & NIRS
        </button>

        <button
          onClick={() => onOpenAlertModal(patient)}
          className="px-3 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
          title="Clinical Alert Console"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Alerts
        </button>

        <button
          onClick={() => onOpenEmergencyModal(patient)}
          className="px-3 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
          title="NRP Emergency Resuscitation"
        >
          <Zap className="w-3.5 h-3.5" />
          NRP
        </button>
      </div>
    </div>
  );
};

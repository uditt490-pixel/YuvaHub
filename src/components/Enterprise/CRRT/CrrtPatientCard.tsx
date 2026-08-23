import React from "react";
import {
  Droplets,
  Activity,
  Flame,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Gauge,
  Clock,
  ArrowRight,
  TrendingUp
} from "lucide-react";
import { CrrtPatient } from "../../../types/crrtTelemetry";

interface CrrtPatientCardProps {
  patient: CrrtPatient;
  onInspect: (patient: CrrtPatient) => void;
  onOpenClottingModal: (patient: CrrtPatient) => void;
  onOpenEmergencyModal: (patient: CrrtPatient) => void;
}

export const CrrtPatientCard: React.FC<CrrtPatientCardProps> = ({
  patient,
  onInspect,
  onOpenClottingModal,
  onOpenEmergencyModal
}) => {
  const isHighTmp = patient.hydraulics.transmembranePressureMmHg > 250;
  const isCitrateRisk = patient.citrateTelemetry.totalToIonizedCalciumRatio > 2.5;
  const isHyperK = patient.metabolics.potassiumMmolL > 6.0;
  const isFluidOverload = patient.metabolics.percentFluidOverload > 10.0;

  return (
    <div className={`bg-slate-900 border rounded-3xl p-5 shadow-xl transition-all duration-200 hover:shadow-cyan-500/10 space-y-4 flex flex-col justify-between ${
      isHighTmp || isCitrateRisk || isHyperK
        ? "border-rose-500/60 ring-1 ring-rose-500/30"
        : "border-slate-800 hover:border-cyan-500/50"
    }`}>
      {/* Header: Demographics & Modality Badges */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-black rounded-lg">
                {patient.modality}
              </span>
              <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[11px] font-bold rounded-md">
                KDIGO {patient.kdigoStage.replace(/_/g, " ")}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                patient.anticoagulation === "REGIONAL_CITRATE"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : patient.anticoagulation === "SYSTEMIC_HEPARIN"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {patient.anticoagulation.replace(/_/g, " ")}
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
              {patient.name}
              <span className="text-xs text-slate-400 font-normal">
                ({patient.gender === "MALE" ? "M" : "F"}, {patient.ageYears}y, {patient.weightKg}kg)
              </span>
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 font-semibold">{patient.mrn}</span>
            <div className="text-xs font-bold text-cyan-400 flex items-center justify-end gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              Filter: {patient.hydraulics.filterLifeHours.toFixed(1)}h
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

      {/* Hydraulic Pressures & Transmembrane Metrics Strip */}
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3.5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            Transmembrane Pressure (TMP) & Drop
          </span>
          <span className={`text-xs font-black font-mono ${
            patient.hydraulics.healthStatus === "OPTIMAL"
              ? "text-emerald-400"
              : patient.hydraulics.healthStatus === "MODERATE_FOULING"
              ? "text-amber-400"
              : "text-rose-400 animate-pulse"
          }`}>
            {patient.hydraulics.healthStatus.replace(/_/g, " ")}
          </span>
        </div>

        {/* Progress Bar for TMP */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400">TMP: <strong className="text-white">{patient.hydraulics.transmembranePressureMmHg} mmHg</strong></span>
            <span className="text-slate-400">&Delta;P: <strong className="text-white">{patient.hydraulics.filterPressureDropMmHg} mmHg</strong></span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                patient.hydraulics.transmembranePressureMmHg > 250
                  ? "bg-rose-500"
                  : patient.hydraulics.transmembranePressureMmHg > 150
                  ? "bg-amber-400"
                  : "bg-emerald-400"
              }`}
              style={{ width: `${Math.min(100, (patient.hydraulics.transmembranePressureMmHg / 350) * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-800/70 pt-2 text-center">
          <div>
            <span className="text-[9px] text-slate-500 uppercase block font-bold">Access P_acc</span>
            <span className={`font-mono font-bold ${patient.hydraulics.accessPressureMmHg < -200 ? "text-rose-400" : "text-slate-200"}`}>
              {patient.hydraulics.accessPressureMmHg} mmHg
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase block font-bold">Blood Flow Q_b</span>
            <span className="font-mono font-bold text-cyan-300">
              {patient.hydraulics.bloodFlowRateMlMin} mL/min
            </span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 uppercase block font-bold">Filtration Frac</span>
            <span className={`font-mono font-bold ${patient.hydraulics.filtrationFractionPercent > 25 ? "text-amber-400" : "text-slate-200"}`}>
              {patient.hydraulics.filtrationFractionPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Dosing, Citrate & Metabolics Strip */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {/* Delivered Dose */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivered Dose</span>
          <div className={`text-base font-black ${patient.prescription.deliveredDoseMlKgHr >= 20 ? "text-emerald-400" : "text-amber-400"}`}>
            {patient.prescription.deliveredDoseMlKgHr}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">mL/kg/h</span>
        </div>

        {/* Net UF Target */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Net UF Goal</span>
          <div className="text-base font-black text-cyan-400">
            {patient.prescription.netUltrafiltrationMlHr}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">mL/hr</span>
        </div>

        {/* Citrate Ratio */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Tot Ca / iCa</span>
          <div className={`text-base font-black ${isCitrateRisk ? "text-rose-400 animate-pulse" : "text-indigo-300"}`}>
            {patient.citrateTelemetry.totalToIonizedCalciumRatio}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">Ratio (&lt;2.5)</span>
        </div>

        {/* Potassium K+ */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Potassium</span>
          <div className={`text-base font-black ${isHyperK ? "text-rose-400 animate-pulse" : "text-white"}`}>
            {patient.metabolics.potassiumMmolL}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">mmol/L</span>
        </div>
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
          className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
        >
          <Droplets className="w-3.5 h-3.5" />
          Inspect Hydraulics & RCA
        </button>

        <button
          onClick={() => onOpenClottingModal(patient)}
          className="px-3 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
          title="Filter Clotting Console"
        >
          <Flame className="w-3.5 h-3.5" />
          Filter
        </button>

        <button
          onClick={() => onOpenEmergencyModal(patient)}
          className="px-3 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
          title="Emergency Protocol"
        >
          <Zap className="w-3.5 h-3.5" />
          Escalate
        </button>
      </div>
    </div>
  );
};

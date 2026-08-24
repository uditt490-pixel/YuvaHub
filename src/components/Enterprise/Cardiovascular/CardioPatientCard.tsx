import React from "react";
import {
  Heart,
  Activity,
  Zap,
  AlertTriangle,
  Flame,
  ShieldAlert,
  ChevronRight,
  TrendingDown,
  Droplets,
  RotateCcw,
  Gauge,
  Syringe,
  FileText,
  UserCheck
} from "lucide-react";
import { CardioPatient, ScaiShockStage, McsDeviceType } from "../../../types/cardiovascularTelemetry";

interface CardioPatientCardProps {
  patient: CardioPatient;
  onInspect: (patient: CardioPatient) => void;
  onOpenAlerts: (patient: CardioPatient) => void;
  onOpenEmergency: (patient: CardioPatient) => void;
}

export const CardioPatientCard: React.FC<CardioPatientCardProps> = ({
  patient,
  onInspect,
  onOpenAlerts,
  onOpenEmergency
}) => {
  const getScaiBadge = (stage: ScaiShockStage) => {
    switch (stage) {
      case "STAGE_A_AT_RISK":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">SCAI A (At Risk)</span>;
      case "STAGE_B_BEGINNING":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">SCAI B (Beginning)</span>;
      case "STAGE_C_CLASSIC":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">SCAI C (Classic Shock)</span>;
      case "STAGE_D_DETERIORATING":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">SCAI D (Deteriorating)</span>;
      case "STAGE_E_EXTREMIS":
        return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600/30 text-red-300 border border-red-500/60 animate-pulse">SCAI E (Extremis)</span>;
    }
  };

  const getMcsBadge = (device: McsDeviceType) => {
    switch (device) {
      case "ECPELLA":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-rose-500/30 to-amber-500/30 text-amber-200 border border-amber-500/40">ECPELLA (VA-ECMO + Impella)</span>;
      case "VA_ECMO":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">VA-ECMO (Circulatory)</span>;
      case "VV_ECMO":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">VV-ECMO (Respiratory)</span>;
      case "IMPELLA_CP":
      case "IMPELLA_5_5":
      case "IMPELLA_RP":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">{device.replace("_", " ")}</span>;
      case "IABP":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">IABP Counterpulsation</span>;
      case "HEARTMATE_3_LVAD":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/40">HeartMate 3 LVAD</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">Pharmacologic Support</span>;
    }
  };

  const isCpoCritical = patient.hemodynamics.cardiacPowerOutputWatts > 0 && patient.hemodynamics.cardiacPowerOutputWatts < 0.60;
  const isTmpHigh = patient.ecmoTelemetry && patient.ecmoTelemetry.transmembranePressureGradientMmHg >= 50;
  const isHarlequin = patient.ecmoTelemetry && patient.ecmoTelemetry.harlequinDeltaSpO2Percent >= 10;
  const isPapiLow = patient.hemodynamics.pulmonaryArteryPulsatilityIndex > 0 && patient.hemodynamics.pulmonaryArteryPulsatilityIndex < 0.90;
  const isLactateElevated = patient.anticoagulationLabs.lactateMmolL >= 3.0;

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between relative overflow-hidden group">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-cyan-400 text-sm">
              {patient.bedNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{patient.name}</h3>
                <span className="text-xs text-slate-400 font-mono">({patient.age}y {patient.sex === "MALE" ? "M" : "F"})</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {patient.mrn} • Support: <strong className="text-slate-200">{patient.hoursOnSupport}h</strong> (Day {patient.dayInIcu})
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {getScaiBadge(patient.scaiStage)}
            {getMcsBadge(patient.mcsDevice)}
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mt-3">
          <p className="text-xs text-slate-300 font-medium line-clamp-1">
            <strong className="text-slate-400">Dx:</strong> {patient.primaryDiagnosis}
          </p>
        </div>

        {/* Hemodynamic Metric Grid (4-Column Matrix) */}
        <div className="grid grid-cols-4 gap-2 mt-4 bg-slate-950/70 border border-slate-800/60 rounded-xl p-3">
          {/* BP & MAP */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">ART BP (MAP)</span>
            <span className="text-sm font-black text-white font-mono">
              {patient.hemodynamics.systolicBloodPressureMmHg}/{patient.hemodynamics.diastolicBloodPressureMmHg}
            </span>
            <span className="text-[11px] text-cyan-300 font-mono font-bold">
              MAP: {patient.hemodynamics.meanArterialPressureMmHg} mmHg
            </span>
          </div>

          {/* CPO (Cardiac Power Output) */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">CPO (WATTS)</span>
            <span className={`text-sm font-black font-mono ${isCpoCritical ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
              {patient.hemodynamics.cardiacPowerOutputWatts} W
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CPI: {patient.hemodynamics.cardiacPowerIndexWattsM2} W/m²
            </span>
          </div>

          {/* Cardiac Output & Index */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">CO / CI</span>
            <span className="text-sm font-black text-white font-mono">
              {patient.hemodynamics.cardiacOutputLpm} L/min
            </span>
            <span className="text-[11px] text-slate-300 font-mono">
              CI: {patient.hemodynamics.cardiacIndexLpmM2} L/m/m²
            </span>
          </div>

          {/* PAPi / CVP */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">PAPi / CVP</span>
            <span className={`text-sm font-black font-mono ${isPapiLow ? "text-amber-400" : "text-slate-200"}`}>
              {patient.hemodynamics.pulmonaryArteryPulsatilityIndex}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              CVP: {patient.hemodynamics.centralVenousPressureMmHg} | PCWP: {patient.hemodynamics.pulmonaryCapillaryWedgePressureMmHg}
            </span>
          </div>
        </div>

        {/* ECMO / MCS Circuit Details Strip */}
        {patient.mcsDevice !== "NONE_PHARMACOLOGIC" && (
          <div className="mt-3 bg-slate-950/40 border border-slate-800/40 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
            {patient.mcsDevice.includes("ECMO") || patient.mcsDevice === "ECPELLA" ? (
              <>
                <div className="flex items-center gap-1.5 text-rose-300">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400 animate-spin" style={{ animationDuration: "6s" }} />
                  <span>Flow: <strong>{patient.ecmoTelemetry.bloodFlowLpm} L/min</strong> ({patient.ecmoTelemetry.pumpSpeedRpm} RPM)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`${isTmpHigh ? "text-amber-400 font-bold" : "text-slate-400"}`}>
                    TMP ΔP: {patient.ecmoTelemetry.transmembranePressureGradientMmHg} mmHg
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`${isHarlequin ? "text-rose-400 font-bold animate-pulse" : "text-slate-400"}`}>
                    Δ SpO₂: {patient.ecmoTelemetry.harlequinDeltaSpO2Percent}%
                  </span>
                </div>
              </>
            ) : patient.mcsDevice.includes("IMPELLA") ? (
              <>
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Level: <strong>{patient.microaxialTelemetry.impellaPLevel}</strong> (Flow: {patient.microaxialTelemetry.impellaFlowLpm} L/min)</span>
                </div>
                <div className="text-slate-400">
                  Purge: {patient.microaxialTelemetry.purgePressureMmHg} mmHg
                </div>
                <div className="text-slate-400">
                  Motor: {patient.microaxialTelemetry.motorCurrentMilliamps} mA
                </div>
              </>
            ) : patient.mcsDevice === "IABP" ? (
              <>
                <div className="flex items-center gap-1.5 text-blue-300">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ratio: <strong>{patient.microaxialTelemetry.iabpAugmentationRatio}</strong></span>
                </div>
                <div className="text-slate-300">
                  Aug DBP: <strong>{patient.microaxialTelemetry.iabpAugmentedDiastolicMmHg} mmHg</strong>
                </div>
              </>
            ) : (
              <div className="text-slate-400">
                Central Cannulation Continuous Flow
              </div>
            )}
          </div>
        )}

        {/* Labs, VIS & Anticoagulation Bar */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span className="flex items-center gap-1">
            <Syringe className="w-3.5 h-3.5 text-cyan-400" />
            VIS Score: <strong className="text-cyan-300">{patient.vasoactiveSupport.vasoactiveInotropicScore}</strong>
          </span>
          <span>
            Lactate: <strong className={`${isLactateElevated ? "text-amber-400 font-bold" : "text-slate-300"}`}>{patient.anticoagulationLabs.lactateMmolL} mmol/L</strong>
          </span>
          <span>
            ACT: <strong className="text-slate-300">{patient.anticoagulationLabs.activatedClottingTimeSeconds}s</strong> (Anti-Xa: {patient.anticoagulationLabs.antiXaActivityIuMl})
          </span>
        </div>

        {/* Active Alerts Banner */}
        {patient.alerts && patient.alerts.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {patient.alerts.slice(0, 2).map((alt) => (
              <div
                key={alt.id}
                onClick={() => onOpenAlerts(patient)}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  alt.severity === "CRITICAL"
                    ? "bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30"
                    : alt.severity === "WARNING"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/40 hover:bg-blue-500/30"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{alt.title}</span>
                </div>
                <span className="text-[10px] font-mono shrink-0 ml-2">Review &rarr;</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenEmergency(patient)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/40 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            E-CPR / Protocol
          </button>
          <button
            onClick={() => onOpenAlerts(patient)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Alerts ({patient.alerts.length})
          </button>
        </div>

        <button
          onClick={() => onInspect(patient)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20"
        >
          Inspect Telemetry
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

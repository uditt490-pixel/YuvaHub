import React, { useState, useEffect } from "react";
import {
  X,
  Heart,
  Activity,
  Zap,
  RotateCcw,
  Sliders,
  Droplets,
  Syringe,
  FileText,
  Download,
  AlertTriangle,
  Flame,
  ShieldAlert,
  CheckCircle2,
  Share2,
  Layers,
  ThermometerSnowflake,
  TrendingUp,
  Cpu
} from "lucide-react";
import { CardioPatient } from "../../../types/cardiovascularTelemetry";
import { CardiovascularTelemetryService } from "../../../services/CardiovascularTelemetryService";

interface CardioTelemetryInspectorModalProps {
  patient: CardioPatient | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEmergency: (patient: CardioPatient) => void;
}

export const CardioTelemetryInspectorModal: React.FC<CardioTelemetryInspectorModalProps> = ({
  patient,
  isOpen,
  onClose,
  onOpenEmergency
}) => {
  const [activeTab, setActiveTab] = useState<"WAVEFORMS" | "HEMODYNAMICS" | "ECMO_MCS" | "VASOACTIVES" | "ANTICOAG_LABS" | "FHIR_EXPORT">("WAVEFORMS");
  const [copiedFhir, setCopiedFhir] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    // Generate random continuous waveform points
    const pts = Array.from({ length: 60 }, (_, i) => {
      const angle = (i / 10) * Math.PI;
      return Math.sin(angle) * 20 + Math.cos(angle * 2) * 10;
    });
    setWaveformData(pts);
  }, [patient]);

  if (!isOpen || !patient) return null;

  const fhirBundle = CardiovascularTelemetryService.exportToFhirR4Bundle(patient);
  const csvData = CardiovascularTelemetryService.exportToCsv(patient);

  const handleCopyFhir = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  const handleDownloadCsv = () => {
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cardio_telemetry_${patient.mrn}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-7xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 font-mono font-black text-lg">
              {patient.bedNumber}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-white tracking-tight">{patient.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {patient.mrn} • {patient.age}y {patient.sex} • BSA: {patient.bodySurfaceAreaM2} m² ({patient.weightKg} kg / {patient.heightCm} cm)
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                  {patient.scaiStage.replace("STAGE_", "SCAI ")}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Attending: <strong className="text-slate-300">{patient.attendingCardiologist}</strong> | Perfusionist: <strong className="text-slate-300">{patient.primaryPerfusionist}</strong> | Hours on MCS: <strong className="text-cyan-400">{patient.hoursOnSupport}h</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenEmergency(patient)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/30"
            >
              <ShieldAlert className="w-4 h-4" />
              E-CPR Escalation
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab("WAVEFORMS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "WAVEFORMS"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            Live Waveforms & Rhythms
          </button>

          <button
            onClick={() => setActiveTab("HEMODYNAMICS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "HEMODYNAMICS"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            Invasive Hemodynamics (CPO / SVR / PAPi)
          </button>

          <button
            onClick={() => setActiveTab("ECMO_MCS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ECMO_MCS"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            ECMO / Impella Circuit Telemetry
          </button>

          <button
            onClick={() => setActiveTab("VASOACTIVES")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "VASOACTIVES"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Syringe className="w-4 h-4 text-violet-400" />
            Vasoactive Support (VIS Score)
          </button>

          <button
            onClick={() => setActiveTab("ANTICOAG_LABS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "ANTICOAG_LABS"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Droplets className="w-4 h-4 text-emerald-400" />
            Anticoagulation & Lactate
          </button>

          <button
            onClick={() => setActiveTab("FHIR_EXPORT")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "FHIR_EXPORT"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            HL7 FHIR R4 & Export
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: WAVEFORMS */}
          {activeTab === "WAVEFORMS" && (
            <div className="space-y-4">
              {/* Channel 1: ECG Lead II */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
                      ECG LEAD II
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Rhythm: <strong className="text-white">{patient.hemodynamics.rhythmStatus}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="text-emerald-400 font-bold">HR: {patient.hemodynamics.heartRateBpm} BPM</span>
                  </div>
                </div>
                <div className="h-20 w-full bg-slate-950/80 rounded-xl border border-slate-900 flex items-center px-4 overflow-hidden relative">
                  <svg className="w-full h-16 stroke-emerald-400 fill-none stroke-[2]" viewBox="0 0 600 60">
                    <path d="M 0 30 L 50 30 L 60 25 L 70 30 L 80 30 L 85 45 L 90 5 L 95 55 L 100 30 L 120 30 L 140 20 L 160 30 L 250 30 L 260 25 L 270 30 L 280 30 L 285 45 L 290 5 L 295 55 L 300 30 L 320 30 L 340 20 L 360 30 L 450 30 L 460 25 L 470 30 L 480 30 L 485 45 L 490 5 L 495 55 L 500 30 L 520 30 L 540 20 L 560 30 L 600 30" />
                  </svg>
                </div>
              </div>

              {/* Channel 2: Invasive Arterial Line Waveform */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-xs font-bold font-mono">
                      ART LINE (RADIAL/FEMORAL)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Pulse Pressure: <strong className="text-white">{patient.hemodynamics.pulsePressureMmHg} mmHg</strong>
                      {patient.hemodynamics.pulsePressureMmHg < 10 && (
                        <span className="text-red-400 ml-2 font-bold">(Flat PP / Aortic Valve Closed)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="text-rose-400 font-bold">
                      {patient.hemodynamics.systolicBloodPressureMmHg}/{patient.hemodynamics.diastolicBloodPressureMmHg} (MAP: {patient.hemodynamics.meanArterialPressureMmHg})
                    </span>
                  </div>
                </div>
                <div className="h-20 w-full bg-slate-950/80 rounded-xl border border-slate-900 flex items-center px-4 overflow-hidden relative">
                  <svg className="w-full h-16 stroke-rose-400 fill-none stroke-[2.5]" viewBox="0 0 600 60">
                    <path d="M 0 45 Q 20 5 35 15 Q 45 25 55 20 Q 70 35 90 45 L 150 45 Q 170 5 185 15 Q 195 25 205 20 Q 220 35 240 45 L 300 45 Q 320 5 335 15 Q 345 25 355 20 Q 370 35 390 45 L 450 45 Q 470 5 485 15 Q 495 25 505 20 Q 520 35 540 45 L 600 45" />
                  </svg>
                </div>
              </div>

              {/* Channel 3: Swan-Ganz Pulmonary Artery Waveform */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-bold font-mono">
                      PULMONARY ARTERY (SWAN-GANZ)
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      PCWP (Wedge): <strong className="text-white">{patient.hemodynamics.pulmonaryCapillaryWedgePressureMmHg} mmHg</strong> | PAPi: <strong className="text-amber-400">{patient.hemodynamics.pulmonaryArteryPulsatilityIndex}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="text-amber-400 font-bold">
                      PAP: {patient.hemodynamics.pulmonaryArterySystolicMmHg}/{patient.hemodynamics.pulmonaryArteryDiastolicMmHg} (mPAP: {patient.hemodynamics.pulmonaryArteryMeanMmHg})
                    </span>
                  </div>
                </div>
                <div className="h-20 w-full bg-slate-950/80 rounded-xl border border-slate-900 flex items-center px-4 overflow-hidden relative">
                  <svg className="w-full h-16 stroke-amber-400 fill-none stroke-[2]" viewBox="0 0 600 60">
                    <path d="M 0 40 Q 25 15 45 28 Q 55 35 65 30 Q 80 38 100 40 L 150 40 Q 175 15 195 28 Q 205 35 215 30 Q 230 38 250 40 L 300 40 Q 325 15 345 28 Q 355 35 365 30 Q 380 38 400 40 L 450 40 Q 475 15 495 28 Q 505 35 515 30 Q 530 38 550 40 L 600 40" />
                  </svg>
                </div>
              </div>

              {/* Channel 4: ECMO Circuit Centrifugal Flow Waveform */}
              {patient.mcsDevice.includes("ECMO") && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs font-bold font-mono">
                        EXTRACORPOREAL FLOW & P3 DRAINAGE
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        TMP ΔP: <strong className="text-white">{patient.ecmoTelemetry.transmembranePressureGradientMmHg} mmHg</strong> | P3: <strong className="text-cyan-400">{patient.ecmoTelemetry.venousDrainagePressureP3MmHg} mmHg</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-sm">
                      <span className="text-cyan-400 font-bold">
                        {patient.ecmoTelemetry.bloodFlowLpm} L/min ({patient.ecmoTelemetry.pumpSpeedRpm} RPM)
                      </span>
                    </div>
                  </div>
                  <div className="h-20 w-full bg-slate-950/80 rounded-xl border border-slate-900 flex items-center px-4 overflow-hidden relative">
                    <svg className="w-full h-16 stroke-cyan-400 fill-none stroke-[2]" viewBox="0 0 600 60">
                      <path d="M 0 30 Q 50 28 100 32 Q 150 29 200 31 Q 250 28 300 32 Q 350 29 400 31 Q 450 28 500 32 Q 550 29 600 30" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HEMODYNAMICS */}
          {activeTab === "HEMODYNAMICS" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cardiac Work & Power Output */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  Hydraulic Power & Work
                </h3>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">Cardiac Power Output (CPO):</span>
                    <span className="text-sm font-black text-rose-400">{patient.hemodynamics.cardiacPowerOutputWatts} Watts</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">Cardiac Power Index (CPI):</span>
                    <span className="font-bold text-white">{patient.hemodynamics.cardiacPowerIndexWattsM2} W/m²</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">LV Stroke Work Index (LVSWI):</span>
                    <span className="font-bold text-cyan-300">{patient.hemodynamics.leftVentricularStrokeWorkIndex} g·m/m²</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">RV Stroke Work Index (RVSWI):</span>
                    <span className="font-bold text-amber-300">{patient.hemodynamics.rightVentricularStrokeWorkIndex} g·m/m²</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Shock Index (HR/SBP):</span>
                    <span className="font-bold text-white">{patient.hemodynamics.shockIndex} (Mod: {patient.hemodynamics.modifiedShockIndex})</span>
                  </div>
                </div>
              </div>

              {/* Output & Resistance Profile */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Perfusion & Resistances
                </h3>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">Cardiac Output (CO):</span>
                    <span className="text-sm font-black text-white">{patient.hemodynamics.cardiacOutputLpm} L/min</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">Cardiac Index (CI):</span>
                    <span className="font-bold text-cyan-400">{patient.hemodynamics.cardiacIndexLpmM2} L/min/m²</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">Stroke Volume (SV / SVI):</span>
                    <span className="font-bold text-white">{patient.hemodynamics.strokeVolumeMl} mL ({patient.hemodynamics.strokeVolumeIndexMlM2} mL/m²)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">Systemic Vascular Res (SVR):</span>
                    <span className="font-bold text-emerald-300">{patient.hemodynamics.systemicVascularResistanceDynes} dynes·s/cm⁵</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Pulmonary Vascular Res (PVR):</span>
                    <span className="font-bold text-amber-300">{patient.hemodynamics.pulmonaryVascularResistanceWoodUnits} Wood Units</span>
                  </div>
                </div>
              </div>

              {/* Pulmonary & Right Heart Pressures */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Pulmonary & Filling Pressures
                </h3>
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">PAPi (RV Function Index):</span>
                    <span className="text-sm font-black text-amber-400">{patient.hemodynamics.pulmonaryArteryPulsatilityIndex}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">PCWP (Wedge Pressure):</span>
                    <span className="font-bold text-white">{patient.hemodynamics.pulmonaryCapillaryWedgePressureMmHg} mmHg</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">Central Venous Pressure (CVP):</span>
                    <span className="font-bold text-white">{patient.hemodynamics.centralVenousPressureMmHg} mmHg</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-900">
                    <span className="text-slate-400">Transpulmonary Grad (TPG):</span>
                    <span className="font-bold text-slate-300">{patient.hemodynamics.transpulmonaryGradientMmHg} mmHg</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Diastolic Pulm Grad (DPG):</span>
                    <span className="font-bold text-slate-300">{patient.hemodynamics.diastolicPulmonaryGradientMmHg} mmHg</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ECMO & MCS */}
          {activeTab === "ECMO_MCS" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ECMO Circuit Board */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-400" />
                    ECMO Extracorporeal Membrane Telemetry
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-xs font-bold">
                    {patient.cannulation.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">PUMP SPEED</span>
                    <span className="text-lg font-black text-white">{patient.ecmoTelemetry.pumpSpeedRpm} RPM</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">BLOOD FLOW</span>
                    <span className="text-lg font-black text-cyan-400">{patient.ecmoTelemetry.bloodFlowLpm} L/min</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">SWEEP GAS FLOW / FiO2</span>
                    <span className="text-base font-bold text-white">{patient.ecmoTelemetry.sweepGasFlowLpm} L/min @ {patient.ecmoTelemetry.sweepGasFiO2Percent}%</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">TMP ΔP (CLOTTING INDEX)</span>
                    <span className={`text-base font-bold ${patient.ecmoTelemetry.transmembranePressureGradientMmHg >= 50 ? "text-amber-400 font-black" : "text-emerald-400"}`}>
                      {patient.ecmoTelemetry.transmembranePressureGradientMmHg} mmHg
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">P1 PRE / P2 POST PRESSURE</span>
                    <span className="text-sm font-bold text-slate-300">P1: {patient.ecmoTelemetry.preMembranePressureP1MmHg} / P2: {patient.ecmoTelemetry.postMembranePressureP2MmHg} mmHg</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">P3 DRAINAGE PRESSURE</span>
                    <span className="text-sm font-bold text-cyan-300">{patient.ecmoTelemetry.venousDrainagePressureP3MmHg} mmHg</span>
                  </div>
                </div>

                {/* Harlequin Surveillance Strip */}
                <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-3 font-mono text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">Harlequin Surveillance:</span>
                    <span className={`font-black ${patient.ecmoTelemetry.harlequinDeltaSpO2Percent >= 10 ? "text-rose-400" : "text-slate-300"}`}>
                      Delta SpO2: {patient.ecmoTelemetry.harlequinDeltaSpO2Percent}%
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Right Radial (Native Head): <strong>{patient.ecmoTelemetry.rightRadialNativeSpO2Percent}%</strong> | Lower Leg (ECMO): <strong>{patient.ecmoTelemetry.lowerExtremityEcmoSpO2Percent}%</strong>
                  </div>
                </div>
              </div>

              {/* Impella / Microaxial / IABP Console */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Microaxial & Mechanical Unloading
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                    {patient.mcsDevice}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">IMPELLA PERFORMANCE LEVEL</span>
                    <span className="text-lg font-black text-amber-400">{patient.microaxialTelemetry.impellaPLevel}</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">MICROAXIAL FLOW</span>
                    <span className="text-lg font-black text-white">{patient.microaxialTelemetry.impellaFlowLpm} L/min</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">MOTOR CURRENT</span>
                    <span className="text-base font-bold text-slate-300">{patient.microaxialTelemetry.motorCurrentMilliamps} mA</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">PURGE PRESSURE & FLOW</span>
                    <span className="text-sm font-bold text-slate-300">{patient.microaxialTelemetry.purgePressureMmHg} mmHg ({patient.microaxialTelemetry.purgeFlowRateMlHr} mL/hr)</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 font-mono text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Optical Placement Signal:</span>
                    <span className="font-bold text-emerald-400">{patient.microaxialTelemetry.opticalPlacementSignalStatus}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">IABP Augmentation Ratio:</span>
                    <span className="font-bold text-blue-400">{patient.microaxialTelemetry.iabpAugmentationRatio} (Aug DBP: {patient.microaxialTelemetry.iabpAugmentedDiastolicMmHg} mmHg)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VASOACTIVES */}
          {activeTab === "VASOACTIVES" && (
            <div className="space-y-5">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">TOTAL VASOACTIVE-INOTROPIC SCORE (VIS)</span>
                  <div className="text-3xl font-black text-cyan-400 font-mono mt-1">
                    {patient.vasoactiveSupport.vasoactiveInotropicScore}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Formula: Dopamine + Dobutamine + 100*Epi + 100*Norepi + 10*Milrinone + 10,000*Vasopressin
                  </p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
                  Vasopressor Burden: <strong className={patient.vasoactiveSupport.vasoactiveInotropicScore > 30 ? "text-red-400" : "text-emerald-400"}>
                    {patient.vasoactiveSupport.vasoactiveInotropicScore > 30 ? "High Intensity" : "Moderate Support"}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">EPINEPHRINE</span>
                  <span className="text-lg font-black text-white block mt-1">{patient.vasoactiveSupport.epinephrineMcgKgMin}</span>
                  <span className="text-[11px] text-slate-500">mcg/kg/min</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">NOREPINEPHRINE</span>
                  <span className="text-lg font-black text-white block mt-1">{patient.vasoactiveSupport.norepinephrineMcgKgMin}</span>
                  <span className="text-[11px] text-slate-500">mcg/kg/min</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">VASOPRESSIN</span>
                  <span className="text-lg font-black text-white block mt-1">{patient.vasoactiveSupport.vasopressinUnitsMin}</span>
                  <span className="text-[11px] text-slate-500">units/min</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">DOBUTAMINE</span>
                  <span className="text-lg font-black text-white block mt-1">{patient.vasoactiveSupport.dobutamineMcgKgMin}</span>
                  <span className="text-[11px] text-slate-500">mcg/kg/min</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">MILRINONE</span>
                  <span className="text-lg font-black text-white block mt-1">{patient.vasoactiveSupport.milrinoneMcgKgMin}</span>
                  <span className="text-[11px] text-slate-500">mcg/kg/min</span>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono">
                  <span className="text-[10px] text-slate-400 uppercase">DOPAMINE</span>
                  <span className="text-lg font-black text-white block mt-1">{patient.vasoactiveSupport.dopamineMcgKgMin}</span>
                  <span className="text-[11px] text-slate-500">mcg/kg/min</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ANTICOAGULATION & LABS */}
          {activeTab === "ANTICOAG_LABS" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Droplets className="w-4 h-4 text-emerald-400" />
                  Anticoagulation & Hemostasis
                </h3>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Activated Clotting Time (ACT):</span>
                  <span className="font-bold text-white">{patient.anticoagulationLabs.activatedClottingTimeSeconds} seconds (Target: 180-220s)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Anti-Xa Activity:</span>
                  <span className="font-bold text-cyan-300">{patient.anticoagulationLabs.antiXaActivityIuMl} IU/mL (Target: 0.3-0.7)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Heparin Infusion Rate:</span>
                  <span className="font-bold text-white">{patient.anticoagulationLabs.unfractionatedHeparinUnitsHr} units/hr</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Fibrinogen:</span>
                  <span className="font-bold text-white">{patient.anticoagulationLabs.fibrinogenMgDl} mg/dL</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Free Plasma Hemoglobin (fHb):</span>
                  <span className={`font-black ${patient.anticoagulationLabs.freePlasmaHemoglobinMgDl >= 50 ? "text-amber-400" : "text-emerald-400"}`}>
                    {patient.anticoagulationLabs.freePlasmaHemoglobinMgDl} mg/dL
                  </span>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Metabolic & Acid-Base Profile
                </h3>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Serum Lactate:</span>
                  <span className={`font-black ${patient.anticoagulationLabs.lactateMmolL >= 4.0 ? "text-red-400" : "text-amber-400"}`}>
                    {patient.anticoagulationLabs.lactateMmolL} mmol/L
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Arterial pH:</span>
                  <span className="font-bold text-white">{patient.anticoagulationLabs.arterialPh}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Base Excess:</span>
                  <span className="font-bold text-white">{patient.anticoagulationLabs.arterialBaseExcessMeqL} mEq/L</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Serum Creatinine:</span>
                  <span className="font-bold text-white">{patient.anticoagulationLabs.serumCreatinineMgDl} mg/dL</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Platelet Count:</span>
                  <span className="font-bold text-white">{patient.anticoagulationLabs.plateletCountKUl} k/μL</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FHIR EXPORT */}
          {activeTab === "FHIR_EXPORT" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  HL7 FHIR R4 Bundle with LOINC & SNOMED CT Terminology Bindings
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyFhir}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                  >
                    {copiedFhir ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    {copiedFhir ? "Copied FHIR" : "Copy JSON"}
                  </button>
                  <button
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/30"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download CSV
                  </button>
                </div>
              </div>
              <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 max-h-96 overflow-y-auto">
                {JSON.stringify(fhirBundle, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  X,
  Heart,
  Wind,
  Droplets,
  Activity,
  Zap,
  Download,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  HelpCircle,
  Pill,
  TrendingUp,
  Brain,
  Sliders,
  Layers,
  Thermometer,
  Radio
} from "lucide-react";
import { PicuPatient } from "../../../types/picuTelemetry";
import { PicuTelemetryService } from "../../../services/PicuTelemetryService";

interface PicuTelemetryInspectorModalProps {
  patient: PicuPatient;
  isOpen: boolean;
  onClose: () => void;
  onOpenEscalation: (patient: PicuPatient) => void;
}

export const PicuTelemetryInspectorModal: React.FC<PicuTelemetryInspectorModalProps> = ({
  patient,
  isOpen,
  onClose,
  onOpenEscalation
}) => {
  const [activeTab, setActiveTab] = useState<"VENTILATION" | "HEMODYNAMICS" | "FLUID_RENAL" | "ABG_METABOLIC" | "SCORES_FHIR">("VENTILATION");
  const [copiedFhir, setCopiedFhir] = useState(false);

  if (!isOpen) return null;

  const handleDownloadFhir = () => {
    const fhirJson = JSON.stringify(PicuTelemetryService.exportPatientToFhirR4(patient), null, 2);
    const blob = new Blob([fhirJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FHIR_R4_${patient.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csvContent = PicuTelemetryService.exportPatientTelemetryCsv(patient);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PICU_Telemetry_${patient.id}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyFhir = () => {
    const fhirJson = JSON.stringify(PicuTelemetryService.exportPatientToFhirR4(patient), null, 2);
    navigator.clipboard.writeText(fhirJson);
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">{patient.name}</h2>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-xs rounded-md">
                  {patient.mrn}
                </span>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold rounded-md">
                  {patient.bedNumber}
                </span>
                <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black rounded-md uppercase">
                  {patient.acuityLevel.replace("_", " ")}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Age: <span className="text-white font-semibold">{patient.ageYears > 0 ? `${patient.ageYears}y ` : ""}{patient.ageMonths % 12}m ({patient.ageBracket})</span> | 
                Weight: <span className="text-white font-semibold">{patient.weightKg} kg</span> (Adm: {patient.admissionWeightKg} kg) | 
                Attending: <span className="text-white font-semibold">{patient.attendingPhysician}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenEscalation(patient)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-rose-950/40"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              PALS Emergency Action
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-Time Multiparameter Waveform Banner */}
        <div className="bg-black/90 p-4 border-b border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* ECG Waveform Channel */}
          <div className="bg-slate-950 border border-emerald-900/50 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
              <span>ECG LEAD II (HR)</span>
              <span className="font-mono text-base font-black">{patient.vitals.heartRate} bpm</span>
            </div>
            {/* SVG Simulated ECG Waveform */}
            <div className="h-10 w-full overflow-hidden flex items-center">
              <svg className="w-full h-full stroke-emerald-400 fill-none" viewBox="0 0 300 40">
                <path
                  d="M 0 20 L 30 20 L 35 15 L 40 25 L 45 20 L 60 20 L 65 5 L 70 38 L 75 12 L 80 20 L 95 20 L 105 16 L 115 20 L 145 20 L 150 15 L 155 25 L 160 20 L 175 20 L 180 5 L 185 38 L 190 12 L 195 20 L 210 20 L 220 16 L 230 20 L 260 20 L 265 15 L 270 25 L 275 20 L 290 20 L 295 5 L 300 38"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Plethysmograph SpO2 Channel */}
          <div className="bg-slate-950 border border-cyan-900/50 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400">
              <span>PLETH (SpO₂)</span>
              <span className="font-mono text-base font-black">{patient.vitals.spO2}%</span>
            </div>
            <div className="h-10 w-full overflow-hidden flex items-center">
              <svg className="w-full h-full stroke-cyan-400 fill-none" viewBox="0 0 300 40">
                <path
                  d="M 0 35 Q 20 5 40 35 T 80 35 T 120 35 T 160 35 T 200 35 T 240 35 T 280 35 T 320 35"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Airway Pressure Waveform Channel */}
          <div className="bg-slate-950 border border-sky-900/50 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-sky-400">
              <span>Paw (PIP/PEEP)</span>
              <span className="font-mono text-base font-black">{patient.ventilator.peakInspiratoryPressure}/{patient.ventilator.peep} cmH2O</span>
            </div>
            <div className="h-10 w-full overflow-hidden flex items-center">
              <svg className="w-full h-full stroke-sky-400 fill-none" viewBox="0 0 300 40">
                <path
                  d="M 0 30 L 20 30 L 25 10 L 50 12 L 60 30 L 100 30 L 105 10 L 130 12 L 140 30 L 180 30 L 185 10 L 210 12 L 220 30 L 260 30 L 265 10 L 290 12 L 300 30"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          {/* Capnography EtCO2 Channel */}
          <div className="bg-slate-950 border border-amber-900/50 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
              <span>CAPNOGRAPHY (EtCO₂)</span>
              <span className="font-mono text-base font-black">{patient.vitals.etCO2 || "--"} mmHg</span>
            </div>
            <div className="h-10 w-full overflow-hidden flex items-center">
              <svg className="w-full h-full stroke-amber-400 fill-none" viewBox="0 0 300 40">
                <path
                  d="M 0 32 L 20 32 L 22 12 L 55 10 L 60 32 L 100 32 L 102 12 L 135 10 L 140 32 L 180 32 L 182 12 L 215 10 L 220 32 L 260 32 L 262 12 L 295 10 L 300 32"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950 px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          {[
            { id: "VENTILATION", label: "Ventilator Mechanics & PARDS", icon: Wind },
            { id: "HEMODYNAMICS", label: "Hemodynamics & VIS Inotropes", icon: Heart },
            { id: "FLUID_RENAL", label: "Fluids, 4-2-1 & KDIGO AKI", icon: Droplets },
            { id: "ABG_METABOLIC", label: "ABG & Metabolic Diagnostics", icon: Activity },
            { id: "SCORES_FHIR", label: "Scores, PALS & FHIR Export", icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
          {/* TAB 1: VENTILATOR MECHANICS */}
          {activeTab === "VENTILATION" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">Ventilator Mode</span>
                    <span className="px-2 py-1 bg-sky-500/20 text-sky-300 font-bold text-xs rounded-lg">
                      {patient.ventilator.mode}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold">FiO₂:</span>
                      <p className="text-lg font-black text-white">{Math.round(patient.ventilator.fiO2 * 100)}%</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Mean Airway (Paw):</span>
                      <p className="text-lg font-black text-white">{patient.ventilator.meanAirwayPressure} <span className="text-xs text-slate-400">cmH2O</span></p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">PIP / PEEP:</span>
                      <p className="text-base font-black text-white">{patient.ventilator.peakInspiratoryPressure} / {patient.ventilator.peep} <span className="text-xs text-slate-400">cmH2O</span></p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Tidal Volume (Vt/kg):</span>
                      <p className="text-base font-black text-white">{patient.ventilator.tidalVolumePerKg} <span className="text-xs text-slate-400">mL/kg</span></p>
                    </div>
                  </div>
                </div>

                {/* PALICC-2 Pulmonary Diagnostics */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">PALICC-2 Severity</span>
                    <span className="px-2 py-1 bg-rose-500/20 text-rose-300 font-bold text-xs rounded-lg uppercase">
                      {patient.pulmonaryIndices.pardsClassification.replace("_", " ")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold">Oxygenation Index (OI):</span>
                      <p className={`text-lg font-black ${patient.pulmonaryIndices.oxygenationIndex >= 16 ? "text-rose-400" : "text-white"}`}>
                        {patient.pulmonaryIndices.oxygenationIndex}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">OSI (Non-invasive):</span>
                      <p className="text-lg font-black text-white">{patient.pulmonaryIndices.oxygenSaturationIndex}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">P/F Ratio:</span>
                      <p className="text-base font-black text-white">{patient.pulmonaryIndices.paO2FiO2Ratio} <span className="text-xs text-slate-400">mmHg</span></p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">A-a Gradient:</span>
                      <p className="text-base font-black text-white">{patient.pulmonaryIndices.alveolarArterialGradient} <span className="text-xs text-slate-400">mmHg</span></p>
                    </div>
                  </div>
                </div>

                {/* Respiratory Mechanics */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-400">Dynamic Compliance</span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">
                      {patient.ventilator.dynamicCompliance} mL/cmH2O
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold">Rate (Set/Total):</span>
                      <p className="text-base font-black text-white">{patient.ventilator.respiratoryRateSet} / {patient.ventilator.respiratoryRateTotal} <span className="text-xs text-slate-400">bpm</span></p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Minute Vent (Ve):</span>
                      <p className="text-base font-black text-white">{patient.ventilator.minuteVentilation} <span className="text-xs text-slate-400">L/min</span></p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">Inspiratory Time (Ti):</span>
                      <p className="text-base font-black text-white">{patient.ventilator.inspiratoryTime}s (I:E {patient.ventilator.ieRatio})</p>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold">HFOV Frequency:</span>
                      <p className="text-base font-black text-white">{patient.ventilator.hfovFrequencyHz ? `${patient.ventilator.hfovFrequencyHz} Hz` : "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pressure-Volume Loop Graphic Simulation */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    Simulated Pressure-Volume (P-V) Dynamic Hysteresis Loop
                  </h4>
                  <span className="text-xs text-slate-400 font-medium">Compliance Target: &gt; 1.0 mL/cmH2O/kg</span>
                </div>
                <div className="h-44 w-full bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center p-4">
                  <svg className="w-full h-full" viewBox="0 0 500 150">
                    <line x1="40" y1="130" x2="480" y2="130" stroke="#475569" strokeWidth="1" />
                    <line x1="40" y1="10" x2="40" y2="130" stroke="#475569" strokeWidth="1" />
                    <text x="440" y="145" fill="#94a3b8" fontSize="10">Pressure (cmH2O)</text>
                    <text x="10" y="20" fill="#94a3b8" fontSize="10" transform="rotate(-90 20,20)">Volume (mL)</text>
                    
                    {/* Simulated Hysteresis Loop */}
                    <path
                      d="M 60 120 C 140 110, 240 60, 360 30 C 280 20, 160 50, 60 120 Z"
                      fill="rgba(6, 182, 212, 0.15)"
                      stroke="#06b6d4"
                      strokeWidth="2.5"
                    />
                    <circle cx="60" cy="120" r="4" fill="#38bdf8" />
                    <text x="65" y="125" fill="#38bdf8" fontSize="10">PEEP {patient.ventilator.peep}</text>
                    <circle cx="360" cy="30" r="4" fill="#f43f5e" />
                    <text x="365" y="30" fill="#f43f5e" fontSize="10">PIP {patient.ventilator.peakInspiratoryPressure}</text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEMODYNAMICS & VIS */}
          {activeTab === "HEMODYNAMICS" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* VIS Breakdown Card */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">Vasoactive Inotropic Score (VIS)</h4>
                      <p className="text-xs text-slate-400">Quantitative Hemodynamic Support Metric</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black ${patient.vasoactiveSupport.vasoactiveInotropicScore >= 15 ? "text-rose-400" : "text-cyan-400"}`}>
                        {patient.vasoactiveSupport.vasoactiveInotropicScore}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-800 pt-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Epinephrine (100x):</span>
                      <span className="font-mono font-bold text-white">{patient.vasoactiveSupport.epinephrineMcgKgMin} mcg/kg/min</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Norepinephrine (100x):</span>
                      <span className="font-mono font-bold text-white">{patient.vasoactiveSupport.norepinephrineMcgKgMin} mcg/kg/min</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Milrinone (10x):</span>
                      <span className="font-mono font-bold text-white">{patient.vasoactiveSupport.milrinoneMcgKgMin} mcg/kg/min</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Dopamine / Dobutamine:</span>
                      <span className="font-mono font-bold text-white">{patient.vasoactiveSupport.dopamineMcgKgMin + patient.vasoactiveSupport.dobutamineMcgKgMin} mcg/kg/min</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Vasopressin (10,000x):</span>
                      <span className="font-mono font-bold text-white">{patient.vasoactiveSupport.vasopressinUnitsKgMin} Units/kg/min</span>
                    </div>
                  </div>
                </div>

                {/* Perfusion & SIPA Analysis */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-white">Shock Index Pediatric-Adjusted (SIPA)</h4>
                    <p className="text-xs text-slate-400">HR / SBP Ratio Adjusted for Age Bracket ({patient.ageBracket})</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-semibold">Current SIPA:</span>
                      <p className={`text-xl font-black mt-1 ${patient.vasoactiveSupport.sipaElevated ? "text-rose-400" : "text-emerald-400"}`}>
                        {patient.vasoactiveSupport.shockIndexPediatric}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {patient.vasoactiveSupport.sipaElevated ? "Elevated (Compensated Shock Risk)" : "Normal Range"}
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-semibold">Cardiac Index (CI):</span>
                      <p className="text-xl font-black text-white mt-1">
                        {patient.vasoactiveSupport.cardiacIndexLMinM2 || "--"} <span className="text-xs text-slate-400">L/min/m2</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Target: &gt; 2.5 L/min/m2</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-semibold">Capillary Refill:</span>
                      <p className={`text-lg font-black mt-1 ${patient.vitals.capillaryRefillSeconds > 3 ? "text-amber-400" : "text-white"}`}>
                        {patient.vitals.capillaryRefillSeconds} seconds
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 font-semibold">Central Venous Press (CVP):</span>
                      <p className="text-lg font-black text-white mt-1">{patient.vitals.centralVenousPressure || "--"} mmHg</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FLUIDS, 4-2-1 & KDIGO AKI */}
          {activeTab === "FLUID_RENAL" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 4-2-1 Maintenance Rate */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Holliday-Segar 4-2-1 Rate</span>
                  <div className="text-2xl font-black text-cyan-400">
                    {patient.fluidRenalStatus.hollidaySegarMaintenanceRateMlHr} <span className="text-xs text-slate-400">mL/hr</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Maintenance requirement for weight {patient.weightKg} kg
                  </p>
                </div>

                {/* % Fluid Overload */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">% Fluid Overload</span>
                  <div className={`text-2xl font-black ${patient.fluidRenalStatus.percentFluidOverload >= 10 ? "text-rose-400" : "text-emerald-400"}`}>
                    {patient.fluidRenalStatus.percentFluidOverload}%
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Net 24h: {patient.fluidRenalStatus.fluidBalanceNet24h > 0 ? "+" : ""}{patient.fluidRenalStatus.fluidBalanceNet24h} mL
                  </p>
                </div>

                {/* KDIGO AKI Stage */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Pediatric KDIGO AKI</span>
                  <div className="text-xl font-black text-amber-400">
                    {patient.fluidRenalStatus.pediatricKdigoAkiStage}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Urine: {patient.fluidRenalStatus.urineOutputMlKgHr} mL/kg/hr | Cr: {patient.fluidRenalStatus.serumCreatinineMgDl} mg/dL
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ABG & METABOLIC */}
          {activeTab === "ABG_METABOLIC" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">Arterial Blood Gas Analysis (ABG)</h4>
                  <span className="text-xs text-slate-400">Timestamp: {patient.abg.timestamp}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">pH:</span>
                    <p className={`text-xl font-black mt-1 ${patient.abg.ph < 7.30 ? "text-rose-400" : "text-white"}`}>{patient.abg.ph}</p>
                    <span className="text-[10px] text-slate-500">Normal: 7.35 - 7.45</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">PaCO₂:</span>
                    <p className="text-xl font-black text-white mt-1">{patient.abg.paCO2} <span className="text-xs text-slate-400">mmHg</span></p>
                    <span className="text-[10px] text-slate-500">Normal: 35 - 45</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">PaO₂:</span>
                    <p className="text-xl font-black text-white mt-1">{patient.abg.paO2} <span className="text-xs text-slate-400">mmHg</span></p>
                    <span className="text-[10px] text-slate-500">Normal: 80 - 100</span>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Arterial Lactate:</span>
                    <p className={`text-xl font-black mt-1 ${patient.abg.lactate >= 3.0 ? "text-rose-400" : "text-emerald-400"}`}>
                      {patient.abg.lactate} <span className="text-xs text-slate-400">mmol/L</span>
                    </p>
                    <span className="text-[10px] text-slate-500">Target &lt; 2.0</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCORES & FHIR */}
          {activeTab === "SCORES_FHIR" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <h4 className="text-sm font-bold text-white">PEWS Score: {patient.pews.totalPews}/9</h4>
                  <p className="text-xs text-slate-400">Risk Category: <span className="text-amber-400 font-bold">{patient.pews.pewsRiskLevel}</span></p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <h4 className="text-sm font-bold text-white">PELOD-2 Score: {patient.pelod2.totalPelod2}/33</h4>
                  <p className="text-xs text-slate-400">Predicted Mortality: <span className="text-rose-400 font-bold">{patient.pelod2.predictedMortalityPercent}%</span></p>
                </div>
              </div>

              {/* FHIR Export Actions */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">HL7 FHIR R4 Interoperability Export</h4>
                    <p className="text-xs text-slate-400">Export clinical observations, vitals, and telemetry bundle.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopyFhir}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      {copiedFhir ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <FileCode className="w-4 h-4 text-cyan-400" />}
                      {copiedFhir ? "Copied JSON!" : "Copy FHIR JSON"}
                    </button>
                    <button
                      onClick={handleDownloadFhir}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Download FHIR JSON
                    </button>
                    <button
                      onClick={handleDownloadCsv}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-4 h-4 text-indigo-400" />
                      Export CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

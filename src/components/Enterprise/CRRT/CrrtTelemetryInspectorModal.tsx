import React, { useState } from "react";
import {
  X,
  Droplets,
  Activity,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  Flame,
  Zap,
  Download,
  FileCode,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  Pill,
  Layers,
  AlertTriangle
} from "lucide-react";
import { CrrtPatient } from "../../../types/crrtTelemetry";
import { CrrtTelemetryService } from "../../../services/CrrtTelemetryService";

interface CrrtTelemetryInspectorModalProps {
  patient: CrrtPatient;
  isOpen: boolean;
  onClose: () => void;
  onOpenClottingModal: (patient: CrrtPatient) => void;
  onOpenEmergencyModal: (patient: CrrtPatient) => void;
}

export const CrrtTelemetryInspectorModal: React.FC<CrrtTelemetryInspectorModalProps> = ({
  patient,
  isOpen,
  onClose,
  onOpenClottingModal,
  onOpenEmergencyModal
}) => {
  const [activeTab, setActiveTab] = useState<"HYDRAULICS" | "CITRATE_RCA" | "FLUID_CLEARANCE" | "ELECTROLYTES" | "FHIR_EXPORT">("HYDRAULICS");
  const [copiedFhir, setCopiedFhir] = useState(false);

  if (!isOpen) return null;

  const handleDownloadFhir = () => {
    const json = JSON.stringify(CrrtTelemetryService.exportPatientToFhirR4Crrt(patient), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FHIR_CRRT_${patient.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csv = CrrtTelemetryService.exportPatientCrrtCsv(patient);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CRRT_Telemetry_${patient.id}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyFhir = () => {
    const json = JSON.stringify(CrrtTelemetryService.exportPatientToFhirR4Crrt(patient), null, 2);
    navigator.clipboard.writeText(json);
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  const isHighTmp = patient.hydraulics.transmembranePressureMmHg > 250;
  const isCitrateRisk = patient.citrateTelemetry.totalToIonizedCalciumRatio > 2.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <Droplets className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">{patient.name}</h2>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-xs rounded-md">
                  {patient.mrn}
                </span>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black rounded-md">
                  {patient.modality}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-md">
                  KDIGO {patient.kdigoStage.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Access: <span className="text-white font-semibold">{patient.vascularAccessLocation}</span> | 
                Anticoagulation: <span className="text-cyan-300 font-semibold">{patient.anticoagulation.replace(/_/g, " ")}</span> | 
                Filter Age: <span className="text-amber-400 font-semibold">{patient.hydraulics.filterLifeHours.toFixed(1)}h</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenClottingModal(patient)}
              className="px-4 py-2 bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/50 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              Filter Clotting Alert
            </button>
            <button
              onClick={() => onOpenEmergencyModal(patient)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/40"
            >
              <Zap className="w-4 h-4" />
              Emergency Renal Escalation
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Hydraulic KPI Ribbon */}
        <div className="bg-black/90 p-4 border-b border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950 border border-cyan-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Transmembrane Pressure (TMP)</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${isHighTmp ? "text-rose-400" : "text-cyan-400"}`}>
                {patient.hydraulics.transmembranePressureMmHg}
              </span>
              <span className="text-xs text-slate-500">mmHg (&Delta;P: {patient.hydraulics.filterPressureDropMmHg})</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-emerald-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Delivered Effluent Dose</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">
                {patient.prescription.deliveredDoseMlKgHr}
              </span>
              <span className="text-xs text-slate-500">mL/kg/h (Target: 20–25)</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-indigo-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Citrate Lock Index (Total/iCa)</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${isCitrateRisk ? "text-rose-400 animate-pulse" : "text-indigo-300"}`}>
                {patient.citrateTelemetry.totalToIonizedCalciumRatio}
              </span>
              <span className="text-xs text-slate-500">Ratio (&lt; 2.5)</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-purple-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Cumulative Fluid Overload</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${patient.metabolics.percentFluidOverload > 10 ? "text-rose-400" : "text-purple-300"}`}>
                {patient.metabolics.percentFluidOverload}%
              </span>
              <span className="text-xs text-slate-500">({patient.metabolics.cumulativeFluidBalanceLiters.toFixed(1)} L)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950 px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          {[
            { id: "HYDRAULICS", label: "Circuit Pressures & TMP Waveforms", icon: Gauge },
            { id: "CITRATE_RCA", label: "Regional Citrate (RCA) Protocol", icon: Pill },
            { id: "FLUID_CLEARANCE", label: "Net Ultrafiltration & KDIGO Dose", icon: Activity },
            { id: "ELECTROLYTES", label: "Renal Electrolytes & Acid-Base", icon: Layers },
            { id: "FHIR_EXPORT", label: "HL7 FHIR R4 & Audit Logs", icon: FileCode }
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

        {/* Modal Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
          {/* TAB 1: HYDRAULICS */}
          {activeTab === "HYDRAULICS" && (
            <div className="space-y-6">
              {/* 4 Hydraulic Channels */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Access Pressure (P_acc)</span>
                  <div className={`text-2xl font-black ${patient.hydraulics.accessPressureMmHg < -200 ? "text-rose-400" : "text-white"}`}>
                    {patient.hydraulics.accessPressureMmHg} <span className="text-xs text-slate-500">mmHg</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Normal: -50 to -150 mmHg</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Filter Pre-Pressure (P_pre)</span>
                  <div className="text-2xl font-black text-cyan-300">
                    {patient.hydraulics.filterPrePressureMmHg} <span className="text-xs text-slate-500">mmHg</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Normal: +100 to +250 mmHg</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Return Pressure (P_ret)</span>
                  <div className="text-2xl font-black text-emerald-300">
                    {patient.hydraulics.returnPressureMmHg} <span className="text-xs text-slate-500">mmHg</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Normal: +50 to +150 mmHg</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Effluent Pressure (P_eff)</span>
                  <div className="text-2xl font-black text-amber-300">
                    {patient.hydraulics.effluentPressureMmHg} <span className="text-xs text-slate-500">mmHg</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Normal: -50 to +100 mmHg</p>
                </div>
              </div>

              {/* Dynamic TMP Trend Sparkline */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Transmembrane Pressure (TMP) & Drop (&Delta;P) Real-Time Trend
                  </h4>
                  <span className="text-xs text-slate-400">Live 1.2s Resolution</span>
                </div>

                <div className="h-44 w-full bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center p-4">
                  <svg className="w-full h-full" viewBox="0 0 500 150">
                    <line x1="40" y1="130" x2="480" y2="130" stroke="#475569" strokeWidth="1" />
                    <line x1="40" y1="10" x2="40" y2="130" stroke="#475569" strokeWidth="1" />
                    <text x="440" y="145" fill="#94a3b8" fontSize="10">Samples</text>
                    <text x="10" y="20" fill="#94a3b8" fontSize="10" transform="rotate(-90 20,20)">TMP (mmHg)</text>

                    {/* TMP Polyline */}
                    <polyline
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2.5"
                      points={patient.pressureHistory.tmp.map((val, idx) => {
                        const x = 50 + idx * 50;
                        const y = 130 - Math.min(110, (val / 3));
                        return `${x},${y}`;
                      }).join(" ")}
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CITRATE RCA */}
          {activeTab === "CITRATE_RCA" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Post-Filter iCa (Target: 0.25–0.35)</span>
                  <div className="text-2xl font-black text-indigo-400 font-mono">
                    {patient.citrateTelemetry.postFilterIonizedCalciumMmolL} <span className="text-xs text-slate-500">mmol/L</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Directly inhibits blood coagulation cascade within filter fibers.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Systemic iCa (Target: 1.10–1.30)</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {patient.citrateTelemetry.systemicIonizedCalciumMmolL} <span className="text-xs text-slate-500">mmol/L</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Maintains systemic myocardial contractility and vascular tone.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Total Ca / Systemic iCa Ratio</span>
                  <div className={`text-2xl font-black font-mono ${isCitrateRisk ? "text-rose-400 animate-pulse" : "text-cyan-300"}`}>
                    {patient.citrateTelemetry.totalToIonizedCalciumRatio}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Alert if &gt; 2.5: Citrate Accumulation / Citrate Lock
                  </p>
                </div>
              </div>

              {/* Citrate Infusion Rates */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <h4 className="text-sm font-bold text-white">RCA Infusion & Calcium Compensation Rates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400">ACD-A Citrate Infusion Rate:</span>
                    <p className="text-xl font-black text-indigo-300 mt-1">{patient.citrateTelemetry.citrateInfusionRateMmolHr} mmol/hr</p>
                  </div>
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Calcium Chloride 10% Compensation Rate:</span>
                    <p className="text-xl font-black text-emerald-300 mt-1">{patient.citrateTelemetry.calciumChlorideCompensationMlHr} mL/hr</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FLUID CLEARANCE */}
          {activeTab === "FLUID_CLEARANCE" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Net Ultrafiltration Rate (Q_uf)</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {patient.prescription.netUltrafiltrationMlHr} <span className="text-xs text-slate-500">mL/hr</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Hourly patient fluid removal target.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Total Effluent Flow (Q_eff)</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {patient.prescription.totalEffluentFlowMlHr} <span className="text-xs text-slate-500">mL/hr</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Q_rep + Q_d + Q_uf</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Delivered Dose</span>
                  <div className="text-2xl font-black text-white font-mono">
                    {patient.prescription.deliveredDoseMlKgHr} <span className="text-xs text-slate-500">mL/kg/h</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Prescribed: {patient.prescription.prescribedDoseMlKgHr} mL/kg/h</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ELECTROLYTES */}
          {activeTab === "ELECTROLYTES" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Serum Potassium (K+)</span>
                  <div className={`text-2xl font-black ${patient.metabolics.potassiumMmolL > 6.0 ? "text-rose-400 animate-pulse" : "text-white"}`}>
                    {patient.metabolics.potassiumMmolL} <span className="text-xs text-slate-500">mmol/L</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Target: 3.5 - 5.0</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Serum Creatinine</span>
                  <div className="text-2xl font-black text-cyan-300">
                    {patient.metabolics.serumCreatinineMgDl} <span className="text-xs text-slate-500">mg/dL</span>
                  </div>
                  <p className="text-[10px] text-slate-500">BUN: {patient.metabolics.serumUreaNitrogenBUNMgDl} mg/dL</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Bicarbonate (HCO3-)</span>
                  <div className="text-2xl font-black text-indigo-300">
                    {patient.metabolics.bicarbonateMmolL} <span className="text-xs text-slate-500">mmol/L</span>
                  </div>
                  <p className="text-[10px] text-slate-500">pH: {patient.metabolics.arterialPh}</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Serum Sodium (Na+)</span>
                  <div className="text-2xl font-black text-white">
                    {patient.metabolics.sodiumMmolL} <span className="text-xs text-slate-500">mmol/L</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Phos: {patient.metabolics.phosphorusMgDl} mg/dL</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FHIR EXPORT */}
          {activeTab === "FHIR_EXPORT" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">HL7 FHIR R4 DeviceMetric & Observation Export</h4>
                    <p className="text-xs text-slate-400">Interoperable CRRT Telemetry Bundle.</p>
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
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-cyan-950/40"
                    >
                      <Download className="w-4 h-4" />
                      Download FHIR JSON
                    </button>
                    <button
                      onClick={handleDownloadCsv}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
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

import React, { useState } from "react";
import {
  X,
  Activity,
  Droplets,
  Zap,
  Download,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Layers,
  FileText,
  Clock
} from "lucide-react";
import { NephrologyPatient } from "../../../types/nephrologyTelemetry";
import { NephrologyTelemetryService } from "../../../services/NephrologyTelemetryService";

interface NephrologyTelemetryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: NephrologyPatient | null;
  onOpenEscalation: (p: NephrologyPatient) => void;
}

export const NephrologyTelemetryInspectorModal: React.FC<NephrologyTelemetryInspectorModalProps> = ({
  isOpen,
  onClose,
  patient,
  onOpenEscalation
}) => {
  const [activeTab, setActiveTab] = useState<
    "CIRCUIT" | "KDIGO_LABS" | "CITRATE_RCA" | "ACID_BASE" | "CLEARANCE" | "FLUID_BALANCE"
  >("CIRCUIT");

  if (!isOpen || !patient) return null;

  const service = NephrologyTelemetryService.getInstance();

  const handleDownloadFhir = () => {
    const fhir = service.exportFhirBundle(patient.id);
    const blob = new Blob([JSON.stringify(fhir, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FHIR_R4_Nephrology_" + patient.id + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csv = service.exportCsvSummary(patient.id);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Nephrology_Telemetry_Log_" + patient.id + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const isTmpWarning = patient.circuit.transmembranePressureTmpMmHg >= 250;
  const isHyperkalemic = patient.electrolytes.serumPotassiumMeqL >= 6.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[94vh] text-slate-100">
        {/* Workstation Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-700">
                  {patient.renalWardBed}
                </span>
                <h2 className="text-xl font-black text-white font-mono uppercase tracking-wide">
                  {patient.name}
                </h2>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {patient.age}y {patient.gender} • {patient.mrn} • Dry Wt: {patient.dryWeightKg}kg (Cur: {patient.currentWeightKg}kg)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Etiology: {patient.primaryEtiology} • Nephrologist: {patient.attendingNephrologist}
              </p>
            </div>
          </div>

          {/* Rapid Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onOpenEscalation(patient)}
              className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition shadow-md shadow-rose-950/60 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              STAT Escalation
            </button>

            <button
              onClick={handleDownloadFhir}
              className="px-3 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-cyan-300 rounded-lg transition border border-cyan-500/40 flex items-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-4 h-4" />
              FHIR R4 JSON
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-emerald-300 rounded-lg transition border border-emerald-500/40 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Real-Time Waveforms Display Banner (4 Channels) */}
        <div className="bg-black/90 p-3 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          {/* Arterial Access Pressure Line */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-red-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-red-400 font-bold mb-1">
              <span>ACCESS LINE (P_art)</span>
              <span>{patient.circuit.accessPressureArterialMmHg} mmHg</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-red-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 15 Q 10 25 20 15 Q 30 5 40 15 Q 50 25 60 15 Q 70 5 80 15 Q 90 25 100 15 Q 110 5 120 15 Q 130 25 140 15 Q 150 5 160 15" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Venous Return Pressure Line */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1">
              <span>RETURN LINE (P_ven)</span>
              <span>+{patient.circuit.returnPressureVenousMmHg} mmHg</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-cyan-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 18 Q 15 8 30 18 Q 45 28 60 18 Q 75 8 90 18 Q 105 28 120 18 Q 135 8 150 18 Q 155 22 160 18" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Transmembrane Pressure (TMP) */}
          <div className={"bg-slate-950 p-2.5 rounded-lg border relative overflow-hidden " + (isTmpWarning ? "border-rose-600 animate-pulse" : "border-amber-900/60")}>
            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold mb-1">
              <span>TMP MEMBRANE CURVE</span>
              <span>{patient.circuit.transmembranePressureTmpMmHg} mmHg</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-amber-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 20 L 30 18 L 60 16 L 90 14 L 120 10 L 140 8 L 160 6" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Net Ultrafiltration Rate & Trend */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold mb-1">
              <span>NET ULTRAFILTRATION</span>
              <span>{patient.circuit.ultrafiltrationRateNetMlHr} mL/h</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-emerald-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 15 L 20 15 L 40 15 L 60 15 L 80 15 L 100 15 L 120 15 L 140 15 L 160 15" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-4 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("CIRCUIT")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "CIRCUIT" ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            Circuit Telemetry & Pressures
          </button>

          <button
            onClick={() => setActiveTab("KDIGO_LABS")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "KDIGO_LABS" ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            KDIGO AKI Staging & Biomarkers
          </button>

          <button
            onClick={() => setActiveTab("CITRATE_RCA")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "CITRATE_RCA" ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            Citrate RCA Protocol
          </button>

          <button
            onClick={() => setActiveTab("ACID_BASE")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "ACID_BASE" ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            Acid-Base & Anion Gap Panel
          </button>

          <button
            onClick={() => setActiveTab("CLEARANCE")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "CLEARANCE" ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            Solute Kinetics & Dialyzer Kt/V
          </button>

          <button
            onClick={() => setActiveTab("FLUID_BALANCE")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "FLUID_BALANCE" ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            24h Fluid Balance Ledger
          </button>
        </div>

        {/* Tab Content Workstation */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-200">
          {/* TAB 1: CIRCUIT TELEMETRY & PRESSURES */}
          {activeTab === "CIRCUIT" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Blood Flow (Qb)</span>
                  <span className="text-2xl font-black text-cyan-300">{patient.circuit.bloodFlowRateQbMlMin}</span>
                  <span className="text-[10px] text-slate-500 block">mL/min</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Effluent Dose</span>
                  <span className="text-2xl font-black text-emerald-400">{patient.circuit.effluentDoseMlKgHr}</span>
                  <span className="text-[10px] text-slate-500 block">mL/kg/h</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">TMP Pressure</span>
                  <span className={"text-2xl font-black " + (isTmpWarning ? "text-rose-400 animate-pulse" : "text-white")}>{patient.circuit.transmembranePressureTmpMmHg}</span>
                  <span className="text-[10px] text-slate-500 block">mmHg (Limit 250)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Filter Drop (ΔP)</span>
                  <span className="text-2xl font-black text-amber-400">{patient.circuit.filterPressureDropDeltaPMmHg}</span>
                  <span className="text-[10px] text-slate-500 block">mmHg (Limit 180)</span>
                </div>
              </div>

              {/* Circuit Replacement & Dialysate Flows */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-black uppercase text-cyan-400">Flow Distribution & Membrane Characteristics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Dialysate Flow Rate (Qd):</span>
                    <span className="text-base font-bold text-white">{patient.circuit.dialysateFlowRateQdMlHr} mL/h</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Pre/Post Replacement:</span>
                    <span className="text-base font-bold text-white">{patient.circuit.replacementPreFilterFlowMlHr} / {patient.circuit.replacementPostFilterFlowMlHr} mL/h</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Filtration Fraction:</span>
                    <span className="text-base font-bold text-cyan-300">{patient.circuit.filtrationFractionPercent}% (Target &lt; 20%)</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Dialyzer Filter Membrane:</span>
                  <span className="font-bold text-white">{patient.circuit.dialyzerMembraneModel} • Run Time: {patient.circuit.filterRunTimeHours}h</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KDIGO AKI STAGING & BIOMARKERS */}
          {activeTab === "KDIGO_LABS" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Serum Creatinine</span>
                  <span className="text-2xl font-black text-rose-400">{patient.electrolytes.serumCreatinineMgDl}</span>
                  <span className="text-[10px] text-slate-500 block">Baseline: {patient.electrolytes.baselineCreatinineMgDl}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Blood Urea Nitrogen</span>
                  <span className="text-2xl font-black text-white">{patient.electrolytes.bloodUreaNitrogenMgDl}</span>
                  <span className="text-[10px] text-slate-500 block">BUN/Cr: {patient.electrolytes.bunToCreatinineRatio}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Normalized UO</span>
                  <span className={"text-2xl font-black " + (patient.urine.urineOutputNormalizedMlKgHr < 0.3 ? "text-rose-400" : "text-emerald-400")}>{patient.urine.urineOutputNormalizedMlKgHr}</span>
                  <span className="text-[10px] text-slate-500 block">mL/kg/h</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">FENa Excretion</span>
                  <span className="text-2xl font-black text-cyan-300">{patient.urine.fractionalExcretionOfSodiumFENa}%</span>
                  <span className="text-[10px] text-slate-500 block">{patient.urine.fractionalExcretionOfSodiumFENa < 1.0 ? "Prerenal" : "ATN"}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-black uppercase text-cyan-400">Urinary Microscopy & Sediment Analysis</h4>
                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Dominant Sediment Pattern:</span>
                  <span className="font-bold text-amber-300">{patient.urine.urinarySedimentType.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CITRATE RCA PROTOCOL */}
          {activeTab === "CITRATE_RCA" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Post-Filter iCa</span>
                  <span className={"text-2xl font-black " + (patient.citrate.postFilterIonizedCalciumMmolL >= 0.25 && patient.citrate.postFilterIonizedCalciumMmolL <= 0.35 ? "text-emerald-400" : "text-rose-400")}>
                    {patient.citrate.postFilterIonizedCalciumMmolL}
                  </span>
                  <span className="text-[10px] text-slate-500 block">mmol/L (Target 0.25-0.35)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Systemic iCa</span>
                  <span className="text-2xl font-black text-emerald-400">{patient.citrate.systemicIonizedCalciumMmolL}</span>
                  <span className="text-[10px] text-slate-500 block">mmol/L (Target 1.10-1.30)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Total Ca / iCa Ratio</span>
                  <span className={"text-2xl font-black " + (patient.citrate.totalToIonizedCalciumRatio >= 2.5 ? "text-rose-400 animate-pulse" : "text-cyan-300")}>
                    {patient.citrate.totalToIonizedCalciumRatio}
                  </span>
                  <span className="text-[10px] text-slate-500 block">&gt;=2.5 Toxicity Limit</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">CaCl2 Infusion</span>
                  <span className="text-2xl font-black text-amber-300">{patient.citrate.calciumChlorideCompensationRateMlHr}</span>
                  <span className="text-[10px] text-slate-500 block">mL/h (10% CaCl2)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACID-BASE & ANION GAP PANEL */}
          {activeTab === "ACID_BASE" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Arterial pH</span>
                  <span className={"text-2xl font-black " + (patient.electrolytes.bloodPh < 7.30 ? "text-rose-400" : "text-white")}>{patient.electrolytes.bloodPh}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Bicarbonate (HCO3)</span>
                  <span className="text-2xl font-black text-cyan-300">{patient.electrolytes.serumBicarbonateHco3MeqL} mEq/L</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Corrected Anion Gap</span>
                  <span className="text-2xl font-black text-rose-400">{patient.electrolytes.albuminCorrectedAnionGap} mEq/L</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Serum Lactate</span>
                  <span className="text-2xl font-black text-amber-300">{patient.electrolytes.serumLactateMmolL} mmol/L</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SOLUTE KINETICS & DIALYZER Kt/V */}
          {activeTab === "CLEARANCE" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Daugirdas spKt/V</span>
                  <span className="text-2xl font-black text-emerald-400">{patient.clearance.daugirdasSinglePoolKtV}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">URR Ratio</span>
                  <span className="text-2xl font-black text-cyan-300">{patient.clearance.ureaReductionRatioURRPercent}%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">eGFR CKD-EPI</span>
                  <span className="text-2xl font-black text-white">{patient.clearance.estimatedGfrCkdEpi}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Daily Solute Removal</span>
                  <span className="text-2xl font-black text-amber-400">{patient.clearance.soluteRemovalRateGramsPerDay} g/day</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: 24H FLUID BALANCE LEDGER */}
          {activeTab === "FLUID_BALANCE" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">24h Total Intake</span>
                  <span className="text-2xl font-black text-white">{patient.fluidBalance.intakeLast24HoursMl} mL</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">24h Total Output</span>
                  <span className="text-2xl font-black text-white">{patient.fluidBalance.outputLast24HoursMl} mL</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Net 24h Balance</span>
                  <span className="text-2xl font-black text-emerald-400">{patient.fluidBalance.netCumulativeBalance24HoursMl} mL</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Fluid Overload %</span>
                  <span className={"text-2xl font-black " + (patient.fluidBalance.totalFluidOverloadPercentage > 10.0 ? "text-rose-400" : "text-cyan-300")}>{patient.fluidBalance.totalFluidOverloadPercentage}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workstation Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>MedTrack Nephrology & CRRT Continuous Telemetry Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-bold cursor-pointer"
          >
            Close Workstation
          </button>
        </div>
      </div>
    </div>
  );
};

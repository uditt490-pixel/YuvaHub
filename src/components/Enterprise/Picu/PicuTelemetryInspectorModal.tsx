import React, { useState } from "react";
import {
  X,
  Activity,
  Baby,
  Wind,
  Zap,
  Download,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Sun,
  Flame,
  Clock
} from "lucide-react";
import { PicuPatient } from "../../../types/picuTelemetry";
import { PicuTelemetryService } from "../../../services/PicuTelemetryService";

interface PicuTelemetryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PicuPatient | null;
  onOpenEscalation: (p: PicuPatient) => void;
}

export const PicuTelemetryInspectorModal: React.FC<PicuTelemetryInspectorModalProps> = ({
  isOpen,
  onClose,
  patient,
  onOpenEscalation
}) => {
  const [activeTab, setActiveTab] = useState<
    "PALS_RESUS" | "PEWS_SCORE" | "OXYGENATION_OI" | "DUCTAL_PPHN" | "ISOLETTE_CLIMATE" | "GIR_METABOLIC"
  >("PALS_RESUS");

  if (!isOpen || !patient) return null;

  const service = PicuTelemetryService.getInstance();

  const handleDownloadFhir = () => {
    const fhir = service.exportFhirBundle(patient.id);
    const blob = new Blob([JSON.stringify(fhir, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FHIR_R4_PICU_" + patient.id + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csv = service.exportCsvSummary(patient.id);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PICU_Telemetry_Log_" + patient.id + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const isDuctalCritical = patient.vitals.prePostDuctalSpO2Delta >= 5;
  const isPewsCritical = patient.pews.totalPewsScore >= 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[94vh] text-slate-100">
        {/* Workstation Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center shadow-lg">
              <Baby className="w-6 h-6 text-pink-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black bg-pink-950 text-pink-300 px-2 py-0.5 rounded border border-pink-700">
                  {patient.bedIsoletteNumber}
                </span>
                <h2 className="text-xl font-black text-white font-mono uppercase tracking-wide">
                  {patient.name}
                </h2>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {patient.currentWeightKg < 2 ? (patient.currentWeightKg * 1000) + "g" : patient.currentWeightKg + "kg"} • {patient.gender} • {patient.mrn} • GA {patient.gestationalAgeWeeks}w
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Diagnosis: {patient.primaryDiagnosis} • Attending: {patient.attendingPediatrician}
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
              PALS STAT Resus
            </button>

            <button
              onClick={handleDownloadFhir}
              className="px-3 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-pink-300 rounded-lg transition border border-pink-500/40 flex items-center gap-1.5 cursor-pointer"
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
          {/* Channel 1: Pediatric ECG Lead II */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold mb-1">
              <span>ECG LEAD II (HR {patient.vitals.heartRate} bpm)</span>
              <span>1 mV</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-emerald-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 15 L 20 15 L 25 18 L 28 2 L 32 26 L 35 15 L 45 15 L 50 12 L 55 15 L 75 15 L 80 18 L 83 2 L 87 26 L 90 15 L 100 15 L 105 12 L 110 15 L 130 15 L 135 18 L 138 2 L 142 26 L 145 15 L 160 15" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Channel 2: Capnography EtCO2 Waveform */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-amber-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold mb-1">
              <span>EtCO2 CAPNOGRAM ({patient.vitals.endTidalCo2MmHg} mmHg)</span>
              <span>Phase III</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-amber-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 25 L 15 25 L 20 5 L 45 5 L 50 25 L 65 25 L 70 5 L 95 5 L 100 25 L 115 25 L 120 5 L 145 5 L 150 25 L 160 25" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Channel 3: Pre/Post Ductal SpO2 Plethysmograph */}
          <div className={"bg-slate-950 p-2.5 rounded-lg border relative overflow-hidden " + (isDuctalCritical ? "border-rose-600 animate-pulse" : "border-cyan-900/60")}>
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1">
              <span>PRE/POST DUCTAL SpO2</span>
              <span>{patient.vitals.spO2PreDuctalRightHandPercent}% / {patient.vitals.spO2PostDuctalFootPercent}% (Δ{patient.vitals.prePostDuctalSpO2Delta}%)</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-cyan-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 20 Q 15 2 30 20 Q 45 2 60 20 Q 75 2 90 20 Q 105 2 120 20 Q 135 2 150 20 Q 155 25 160 20" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Channel 4: Airway Pressure Waveform */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-pink-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-pink-400 font-bold mb-1">
              <span>AIRWAY PRESSURE (Paw {patient.oxygenation.meanAirwayPressurePawMmHg} cmH2O)</span>
              <span>{patient.ventilationMode.split("_")[0]}</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-pink-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 22 L 15 6 L 35 6 L 45 22 L 60 22 L 75 6 L 95 6 L 105 22 L 120 22 L 135 6 L 155 6 L 160 22" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-4 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("PALS_RESUS")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "PALS_RESUS" ? "border-pink-500 text-pink-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            PALS Resus & Broselow Tape
          </button>

          <button
            onClick={() => setActiveTab("PEWS_SCORE")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "PEWS_SCORE" ? "border-pink-500 text-pink-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            PEWS Deterioration Score
          </button>

          <button
            onClick={() => setActiveTab("OXYGENATION_OI")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "OXYGENATION_OI" ? "border-pink-500 text-pink-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            PALICC Oxygenation Index (OI)
          </button>

          <button
            onClick={() => setActiveTab("DUCTAL_PPHN")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "DUCTAL_PPHN" ? "border-pink-500 text-pink-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            Ductal SpO2 & PPHN iNO
          </button>

          <button
            onClick={() => setActiveTab("ISOLETTE_CLIMATE")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "ISOLETTE_CLIMATE" ? "border-pink-500 text-pink-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            Isolette Micro-Environment
          </button>

          <button
            onClick={() => setActiveTab("GIR_METABOLIC")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "GIR_METABOLIC" ? "border-pink-500 text-pink-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            GIR & Neonatal Metabolic Panel
          </button>
        </div>

        {/* Tab Content Workstation */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-200">
          {/* TAB 1: PALS RESUSCITATION & BROSELOW */}
          {activeTab === "PALS_RESUS" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Epinephrine IV (0.01 mg/kg)</span>
                  <span className="text-2xl font-black text-rose-400">{patient.palsDosing.epinephrineIvIoBolusMg}</span>
                  <span className="text-[10px] text-slate-500 block">mg (0.1 mg/mL concentration)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Defibrillation (2 J/kg)</span>
                  <span className="text-2xl font-black text-amber-300">{patient.palsDosing.defibrillationInitialJoules}</span>
                  <span className="text-[10px] text-slate-500 block">Joules Initial (4 J/kg: {patient.palsDosing.defibrillationSubsequentJoules}J)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Fluid Bolus (20 mL/kg)</span>
                  <span className="text-2xl font-black text-cyan-300">{patient.palsDosing.isotonicSalineBolus20MlKg}</span>
                  <span className="text-[10px] text-slate-500 block">mL Isotonic Saline</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">ETT Tube Cuffed / Depth</span>
                  <span className="text-2xl font-black text-emerald-400">{patient.palsDosing.ettInternalDiameterCuffedMm} mm</span>
                  <span className="text-[10px] text-slate-500 block">Depth: {patient.palsDosing.ettLipInsertionDepthCm} cm at lip</span>
                </div>
              </div>

              {/* Extended PALS Drug Table */}
              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-black uppercase text-pink-400">PALS Second-Line & Anti-Arrhythmic Emergency Dosing</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Amiodarone (5 mg/kg):</span>
                    <span className="text-base font-bold text-white">{patient.palsDosing.amiodaroneBolusMg} mg</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Adenosine SVT (0.1 mg/kg):</span>
                    <span className="text-base font-bold text-white">{patient.palsDosing.adenosineFirstDoseMg} mg (2nd: {patient.palsDosing.adenosineSecondDoseMg} mg)</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">10% Calcium Gluconate:</span>
                    <span className="text-base font-bold text-white">{patient.palsDosing.calciumGluconate10PercentMl} mL (60 mg/kg)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PEWS SCORE */}
          {activeTab === "PEWS_SCORE" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Total PEWS Score</span>
                  <span className={"text-2xl font-black " + (patient.pews.totalPewsScore >= 6 ? "text-rose-400 animate-pulse" : "text-amber-400")}>
                    {patient.pews.totalPewsScore}/13
                  </span>
                  <span className="text-[10px] text-slate-500 block">{patient.pews.pewsRiskCategory.replace(/_/g, " ")}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Behavior Component</span>
                  <span className="text-2xl font-black text-white">{patient.pews.behaviorScore}/3</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Cardiovascular</span>
                  <span className="text-2xl font-black text-white">{patient.pews.cardiovascularScore}/3</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Respiratory</span>
                  <span className="text-2xl font-black text-white">{patient.pews.respiratoryScore}/3</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OXYGENATION OI & PARDS */}
          {activeTab === "OXYGENATION_OI" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Oxygenation Index (OI)</span>
                  <span className={"text-2xl font-black " + (patient.oxygenation.oxygenationIndexOI >= 16 ? "text-rose-400" : "text-cyan-300")}>
                    {patient.oxygenation.oxygenationIndexOI}
                  </span>
                  <span className="text-[10px] text-slate-500 block">{patient.oxygenation.pardsClassification.replace(/_/g, " ")}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Oxygen Saturation Index</span>
                  <span className="text-2xl font-black text-white">{patient.oxygenation.oxygenSaturationIndexOSI}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Mean Paw</span>
                  <span className="text-2xl font-black text-pink-300">{patient.oxygenation.meanAirwayPressurePawMmHg} cmH2O</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">FiO2 Delivered</span>
                  <span className="text-2xl font-black text-white">{Math.round(patient.oxygenation.fractionOfInspiredOxygenFiO2 * 100)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DUCTAL PPHN */}
          {activeTab === "DUCTAL_PPHN" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Pre-Ductal SpO2 (Rt Hand)</span>
                  <span className="text-2xl font-black text-emerald-400">{patient.vitals.spO2PreDuctalRightHandPercent}%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Post-Ductal SpO2 (Foot)</span>
                  <span className="text-2xl font-black text-white">{patient.vitals.spO2PostDuctalFootPercent}%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Ductal Delta Gradient</span>
                  <span className={"text-2xl font-black " + (isDuctalCritical ? "text-rose-400 animate-pulse" : "text-slate-300")}>
                    {patient.vitals.prePostDuctalSpO2Delta}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">&gt;=5% Shunting Alarm</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ISOLETTE CLIMATE */}
          {activeTab === "ISOLETTE_CLIMATE" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Chamber Temperature</span>
                  <span className="text-2xl font-black text-pink-300">{patient.incubator.chamberAirTemperatureCelsius}°C</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Chamber Humidity</span>
                  <span className="text-2xl font-black text-cyan-300">{patient.incubator.chamberHumidityPercentage}%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">TcB Bilirubin</span>
                  <span className="text-2xl font-black text-amber-300">{patient.incubator.transcutaneousBilirubinTcBMgDl} mg/dL</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Ambient Acoustic Level</span>
                  <span className="text-2xl font-black text-emerald-400">{patient.incubator.ambientNoiseLevelDba} dBA</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: GIR & METABOLIC */}
          {activeTab === "GIR_METABOLIC" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Glucose Infusion (GIR)</span>
                  <span className="text-2xl font-black text-emerald-400">{patient.metabolic.glucoseInfusionRateMgKgMin}</span>
                  <span className="text-[10px] text-slate-500 block">mg/kg/min (Ref: 4 - 8)</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Serum Glucose</span>
                  <span className={"text-2xl font-black " + (patient.metabolic.serumGlucoseMgDl < 45 ? "text-rose-400" : "text-white")}>
                    {patient.metabolic.serumGlucoseMgDl} mg/dL
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Blood Gas pH</span>
                  <span className="text-2xl font-black text-pink-300">{patient.metabolic.bloodGasPh}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">Serum Lactate</span>
                  <span className="text-2xl font-black text-amber-300">{patient.metabolic.serumLactateMmolL} mmol/L</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workstation Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>MedTrack PICU / NICU High-Density Telemetry Infrastructure</span>
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

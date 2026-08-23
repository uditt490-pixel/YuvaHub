import React, { useState } from "react";
import {
  X,
  Baby,
  Activity,
  Heart,
  Thermometer,
  Sun,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Download,
  FileCode,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Scale,
  Clock,
  Layers,
  AlertTriangle
} from "lucide-react";
import { NicuPatient } from "../../../types/nicuTelemetry";
import { NicuTelemetryService } from "../../../services/NicuTelemetryService";

interface NicuTelemetryInspectorModalProps {
  patient: NicuPatient;
  isOpen: boolean;
  onClose: () => void;
  onOpenAlertModal: (patient: NicuPatient) => void;
  onOpenEmergencyModal: (patient: NicuPatient) => void;
}

export const NicuTelemetryInspectorModal: React.FC<NicuTelemetryInspectorModalProps> = ({
  patient,
  isOpen,
  onClose,
  onOpenAlertModal,
  onOpenEmergencyModal
}) => {
  const [activeTab, setActiveTab] = useState<"WAVEFORMS" | "PRE_POST_DUCTAL" | "HFOV_VENTILATION" | "NUTRITION_GIR" | "BILIRUBIN_BHUTANI" | "FHIR_EXPORT">("WAVEFORMS");
  const [copiedFhir, setCopiedFhir] = useState(false);

  if (!isOpen) return null;

  const handleDownloadFhir = () => {
    const json = JSON.stringify(NicuTelemetryService.exportPatientToFhirR4Nicu(patient), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FHIR_NICU_${patient.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csv = NicuTelemetryService.exportPatientNicuCsv(patient);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NICU_Telemetry_${patient.id}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyFhir = () => {
    const json = JSON.stringify(NicuTelemetryService.exportPatientToFhirR4Nicu(patient), null, 2);
    navigator.clipboard.writeText(json);
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  const isPphn = patient.prePostDuctal.gradientDeltaSpO2 > 10;
  const isHypoglycemic = patient.vitals.glucoseMgDl < 45;
  const isHypotensive = patient.vitals.meanArterialPressureMmHg < patient.gestationalAgeWeeks;
  const biliEval = NicuTelemetryService.evaluateBhutaniBilirubin(patient.vitals.serumBilirubinMgDl, patient.dayOfLife * 24, patient.gestationalAgeWeeks);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-2xl text-pink-400">
              <Baby className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">{patient.name}</h2>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-xs rounded-md">
                  {patient.mrn}
                </span>
                <span className="px-2.5 py-0.5 bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-black rounded-md">
                  {patient.gestationalAgeWeeks}w GA (PMA {patient.postmenstrualAgeWeeks}w)
                </span>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-md">
                  DOL {patient.dayOfLife}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Bed: <span className="text-white font-semibold">{patient.bedNumber}</span> | 
                Weight: <span className="text-pink-300 font-semibold">{patient.currentWeightGrams}g</span> (Birth: {patient.birthWeightGrams}g) | 
                Vent: <span className="text-cyan-400 font-semibold">{patient.ventilation.mode}</span> | 
                SNAPPE-II: <span className="text-purple-400 font-semibold">{patient.snappeScore}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAlertModal(patient)}
              className="px-4 py-2 bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/50 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Alert Sign-Off
            </button>
            <button
              onClick={() => onOpenEmergencyModal(patient)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-rose-950/40"
            >
              <Zap className="w-4 h-4" />
              NRP Code Pink
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Biomarker Highlights Ribbon */}
        <div className="bg-black/90 p-4 border-b border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-950 border border-pink-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Heart Rate & MAP</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{patient.vitals.heartRateBpm}</span>
              <span className="text-xs text-slate-500">bpm | MAP: <strong className={isHypotensive ? "text-rose-400" : "text-cyan-300"}>{patient.vitals.meanArterialPressureMmHg} mmHg</strong></span>
            </div>
          </div>

          <div className="bg-slate-950 border border-cyan-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Pre/Post Ductal SpO₂ & Delta</span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-emerald-400">{patient.prePostDuctal.preDuctalRightWristSpO2}%</span>
              <span className="text-xs text-slate-400">/ Post: <strong className="text-white">{patient.prePostDuctal.postDuctalFootSpO2}%</strong></span>
              <span className={`text-xs font-black ${isPphn ? "text-rose-400 animate-pulse" : "text-slate-400"}`}>(&Delta; {patient.prePostDuctal.gradientDeltaSpO2}%)</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-indigo-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Cerebral Tissue NIRS rSO₂</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-300 font-mono">
                {patient.prePostDuctal.cerebralNirsRso2Percent}%
              </span>
              <span className="text-xs text-slate-500">FTOE: {patient.prePostDuctal.fractionalTissueOxygenExtraction}</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-amber-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Glucose Infusion Rate (GIR)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-300 font-mono">
                {patient.nutrition.glucoseInfusionRateMgKgMin}
              </span>
              <span className="text-xs text-slate-500">mg/kg/min ({patient.vitals.glucoseMgDl} mg/dL)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950 px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          {[
            { id: "WAVEFORMS", label: "Real-Time Multiparameter Waveforms", icon: Activity },
            { id: "PRE_POST_DUCTAL", label: "Pre/Post-Ductal & NIRS Perfusion", icon: Droplets },
            { id: "HFOV_VENTILATION", label: "HFOV / NAVA Ventilation Mechanics", icon: Layers },
            { id: "NUTRITION_GIR", label: "Nutrition, TPN & GIR Calculator", icon: Scale },
            { id: "BILIRUBIN_BHUTANI", label: "Bhutani Hyperbilirubinemia Nomogram", icon: Sun },
            { id: "FHIR_EXPORT", label: "HL7 FHIR R4 & Audit Logs", icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-pink-400 text-pink-400 bg-pink-500/5"
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
          {/* TAB 1: WAVEFORMS */}
          {activeTab === "WAVEFORMS" && (
            <div className="space-y-6">
              {/* Dynamic Trend Sparkline */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-pink-400" />
                    Neonatal Heart Rate & Pre/Post Ductal SpO₂ Waveforms
                  </h4>
                  <span className="text-xs text-slate-400">Live 1.2s Resolution</span>
                </div>

                <div className="h-44 w-full bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center p-4">
                  <svg className="w-full h-full" viewBox="0 0 500 150">
                    <line x1="40" y1="130" x2="480" y2="130" stroke="#475569" strokeWidth="1" />
                    <line x1="40" y1="10" x2="40" y2="130" stroke="#475569" strokeWidth="1" />
                    <text x="440" y="145" fill="#94a3b8" fontSize="10">Samples</text>
                    <text x="10" y="20" fill="#94a3b8" fontSize="10" transform="rotate(-90 20,20)">SpO2 / HR</text>

                    {/* Pre-Ductal SpO2 Polyline */}
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      points={patient.vitalsHistory.preDuctalSpO2.map((val, idx) => {
                        const x = 50 + idx * 50;
                        const y = 130 - Math.min(110, (val * 1.1));
                        return `${x},${y}`;
                      }).join(" ")}
                    />
                    {/* Post-Ductal SpO2 Polyline */}
                    <polyline
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      points={patient.vitalsHistory.postDuctalSpO2.map((val, idx) => {
                        const x = 50 + idx * 50;
                        const y = 130 - Math.min(110, (val * 1.1));
                        return `${x},${y}`;
                      }).join(" ")}
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRE POST DUCTAL */}
          {activeTab === "PRE_POST_DUCTAL" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Pre-Ductal Right Wrist SpO2</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {patient.prePostDuctal.preDuctalRightWristSpO2}%
                  </div>
                  <p className="text-[11px] text-slate-400">Reflects ascending aorta & coronary/cerebral oxygen delivery.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Post-Ductal Foot SpO2</span>
                  <div className={`text-2xl font-black font-mono ${isPphn ? "text-rose-400" : "text-emerald-400"}`}>
                    {patient.prePostDuctal.postDuctalFootSpO2}%
                  </div>
                  <p className="text-[11px] text-slate-400">Reflects descending aortic oxygenation post-PDA.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">&Delta;SpO2 Gradient (PPHN Marker)</span>
                  <div className={`text-2xl font-black font-mono ${isPphn ? "text-rose-400 animate-pulse" : "text-cyan-300"}`}>
                    {patient.prePostDuctal.gradientDeltaSpO2}%
                  </div>
                  <p className="text-[11px] text-slate-400">Alert if &gt; 10%: Persistent Pulmonary Hypertension.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HFOV VENTILATION */}
          {activeTab === "HFOV_VENTILATION" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Mean Airway Pressure (mPaw)</span>
                  <div className="text-2xl font-black text-cyan-300">{patient.ventilation.meanAirwayPressureCmH2O} cmH2O</div>
                  <p className="text-[10px] text-slate-500">Lung Volume Recruitment</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Amplitude &Delta;P (Power)</span>
                  <div className="text-2xl font-black text-white">{patient.ventilation.amplitudeDeltaPCmH2O} cmH2O</div>
                  <p className="text-[10px] text-slate-500">CO2 Ventilation Drive</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">Oscillation Frequency</span>
                  <div className="text-2xl font-black text-white">{patient.ventilation.frequencyHz} Hz</div>
                  <p className="text-[10px] text-slate-500">{patient.ventilation.frequencyHz * 60} cycles/min</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 uppercase font-bold text-[10px]">DCO2 Index</span>
                  <div className="text-2xl font-black text-indigo-300">{patient.ventilation.dco2GasTransportCoefficient}</div>
                  <p className="text-[10px] text-slate-500">Vt² × Frequency</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NUTRITION & GIR */}
          {activeTab === "NUTRITION_GIR" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Glucose Infusion Rate (GIR)</span>
                  <div className="text-2xl font-black text-amber-300 font-mono">
                    {patient.nutrition.glucoseInfusionRateMgKgMin} <span className="text-xs text-slate-500">mg/kg/min</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Target: 4–8 mg/kg/min for preterm brain protection.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Total Day-of-Life Fluids</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {patient.nutrition.totalFluidsMlKgDay} <span className="text-xs text-slate-500">mL/kg/day</span>
                  </div>
                  <p className="text-[11px] text-slate-400">DOL {patient.dayOfLife} Target: 120–150 mL/kg/day.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Trophic Enteral Feeds (MBM)</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {patient.nutrition.trophicEnteralFeedMlKgDay} <span className="text-xs text-slate-500">mL/kg/day</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Gut priming for NEC risk reduction.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BILIRUBIN BHUTANI */}
          {activeTab === "BILIRUBIN_BHUTANI" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">Bhutani Hour-Specific Hyperbilirubinemia Nomogram</h4>
                    <p className="text-xs text-slate-400">Postnatal Age: {patient.dayOfLife * 24} hours | GA: {patient.gestationalAgeWeeks}w</p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                    biliEval.riskZone === "EXCHANGE_TRANSFUSION"
                      ? "bg-rose-500 text-white animate-pulse"
                      : biliEval.riskZone === "HIGH_PHOTOTHERAPY"
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}>
                    {biliEval.riskZone.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400">Total Serum Bilirubin:</span>
                    <p className="text-2xl font-black text-amber-400 mt-1">{patient.vitals.serumBilirubinMgDl} mg/dL</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Phototherapy Threshold:</span>
                    <p className="text-2xl font-black text-cyan-300 mt-1">{biliEval.thresholdMgDl} mg/dL</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FHIR EXPORT */}
          {activeTab === "FHIR_EXPORT" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">HL7 FHIR R4 NICU Telemetry Export</h4>
                    <p className="text-xs text-slate-400">Interoperable Neonatal High-Frequency Ventilator Bundle.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopyFhir}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      {copiedFhir ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <FileCode className="w-4 h-4 text-pink-400" />}
                      {copiedFhir ? "Copied JSON!" : "Copy FHIR JSON"}
                    </button>
                    <button
                      onClick={handleDownloadFhir}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-pink-950/40"
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

import React, { useState } from "react";
import {
  X,
  Activity,
  Flame,
  Droplet,
  Timer,
  Layers,
  HeartCrack,
  ShieldCheck,
  Zap,
  Download,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  User,
  Radio,
  FileText
} from "lucide-react";
import { TraumaPatient } from "../../../types/traumaTelemetry";
import { TraumaTelemetryService } from "../../../services/TraumaTelemetryService";

interface TraumaTelemetryInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: TraumaPatient | null;
  onOpenEscalation: (p: TraumaPatient) => void;
}

export const TraumaTelemetryInspectorModal: React.FC<TraumaTelemetryInspectorModalProps> = ({
  isOpen,
  onClose,
  patient,
  onOpenEscalation
}) => {
  const [activeTab, setActiveTab] = useState<
    "OVERVIEW" | "ATLS_SURVEY" | "MTP_RESUS" | "EFAST_EXAM" | "TEG_ROTEM" | "ABG_TRIAD"
  >("OVERVIEW");

  if (!isOpen || !patient) return null;

  const service = TraumaTelemetryService.getInstance();

  const handleDownloadFhir = () => {
    const fhir = service.exportFhirBundle(patient.id);
    const blob = new Blob([JSON.stringify(fhir, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FHIR_R4_Trauma_" + patient.id + ".json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csv = service.exportCsvSummary(patient.id);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Trauma_Resuscitation_Log_" + patient.id + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[94vh] text-slate-100">
        {/* Workstation Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center shadow-lg">
              <Activity className="w-6 h-6 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black bg-rose-950 text-rose-400 px-2 py-0.5 rounded border border-rose-700">
                  {patient.traumaBayNumber}
                </span>
                <h2 className="text-xl font-black text-white font-mono uppercase tracking-wide">
                  {patient.name}
                </h2>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {patient.age}y {patient.gender} • {patient.mrn}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mechanism: {patient.injuryMechanism} • Surgeon: {patient.primarySurgeon}
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
          {/* ECG Lead II Waveform */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-emerald-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold mb-1">
              <span>ECG LEAD II</span>
              <span>HR {patient.vitals.heartRate} bpm</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-emerald-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 15 L 20 15 L 25 5 L 30 25 L 35 10 L 40 15 L 60 15 L 80 15 L 85 5 L 90 25 L 95 10 L 100 15 L 120 15 L 140 15 L 145 5 L 150 25 L 155 10 L 160 15" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* Invasive Arterial Line Waveform */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-rose-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-rose-400 font-bold mb-1">
              <span>ART LINE ({patient.vitals.invasiveArterialLineSite || "RADIAL"})</span>
              <span>{patient.vitals.systolicBp}/{patient.vitals.diastolicBp} ({patient.vitals.meanArterialPressure})</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-rose-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 22 Q 10 2 20 12 Q 25 15 30 13 Q 40 22 50 22 Q 60 2 70 12 Q 75 15 80 13 Q 90 22 100 22 Q 110 2 120 12 Q 125 15 130 13 Q 140 22 160 22" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* End-Tidal CO2 Capnography */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-amber-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold mb-1">
              <span>CAPNOGRAPHY (EtCO2)</span>
              <span>{patient.vitals.endTidalCo2} mmHg</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-amber-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 24 L 15 24 L 18 6 L 38 6 L 41 24 L 60 24 L 63 6 L 83 6 L 86 24 L 105 24 L 108 6 L 128 6 L 131 24 L 160 24" strokeWidth="1.5" />
              </svg>
            </div>
          </div>

          {/* SpO2 Plethysmograph */}
          <div className="bg-slate-950 p-2.5 rounded-lg border border-cyan-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold mb-1">
              <span>PLETH (SpO2)</span>
              <span>{patient.vitals.spO2}% (RR {patient.vitals.respiratoryRate})</span>
            </div>
            <div className="h-10 flex items-center">
              <svg className="w-full h-8 stroke-cyan-400 fill-none" viewBox="0 0 160 30">
                <path d="M 0 20 Q 8 2 15 10 Q 20 15 25 12 Q 35 20 45 20 Q 53 2 60 10 Q 65 15 70 12 Q 80 20 90 20 Q 98 2 105 10 Q 110 15 115 12 Q 125 20 160 20" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-4 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("OVERVIEW")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "OVERVIEW" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            Hemodynamics & Scores
          </button>

          <button
            onClick={() => setActiveTab("ATLS_SURVEY")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "ATLS_SURVEY" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            ATLS Primary Survey (ABCDE)
          </button>

          <button
            onClick={() => setActiveTab("MTP_RESUS")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "MTP_RESUS" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            MTP 1:1:1 Transfusion Flow
          </button>

          <button
            onClick={() => setActiveTab("EFAST_EXAM")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "EFAST_EXAM" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            eFAST Ultrasound Matrix
          </button>

          <button
            onClick={() => setActiveTab("TEG_ROTEM")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "TEG_ROTEM" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            TEG / ROTEM Viscoelastic
          </button>

          <button
            onClick={() => setActiveTab("ABG_TRIAD")}
            className={"py-3 px-3.5 border-b-2 transition whitespace-nowrap cursor-pointer " + (activeTab === "ABG_TRIAD" ? "border-rose-500 text-rose-400" : "border-transparent text-slate-400 hover:text-slate-200")}
          >
            ABG & Lethal Triad
          </button>
        </div>

        {/* Tab Content Workstation */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs text-slate-200">
          {/* TAB 1: OVERVIEW & HEMODYNAMICS */}
          {activeTab === "OVERVIEW" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Shock Index</span>
                  <span className="text-2xl font-black text-rose-400">{patient.scores.shockIndex}</span>
                  <span className="text-[10px] text-slate-500 block">Age-Adj SI: {patient.scores.ageAdjustedShockIndex}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">rSIG Score</span>
                  <span className="text-2xl font-black text-emerald-400">{patient.scores.reverseShockIndexTimesGcs}</span>
                  <span className="text-[10px] text-slate-500 block">GCS {patient.gcs.totalGcs}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">ABC Score</span>
                  <span className="text-2xl font-black text-amber-400">{patient.scores.abcScore} / 4</span>
                  <span className="text-[10px] text-slate-500 block">TASH: {patient.scores.tashScore} pts</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Injury Severity</span>
                  <span className="text-2xl font-black text-violet-400">{patient.aisIss.injurySeverityScore_ISS} ISS</span>
                  <span className="text-[10px] text-slate-500 block">RTS: {patient.scores.revisedTraumaScore_RTS}</span>
                </div>
              </div>

              {/* REBOA Telemetry & Vascular Lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-mono text-xs font-bold uppercase text-violet-400 flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    REBOA Aortic Balloon Telemetry
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Status / Zone:</span>
                      <span className="font-bold text-amber-300">{patient.reboa.status} ({patient.reboa.zone})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Inflation Elapsed:</span>
                      <span className="font-bold text-rose-400">{patient.reboa.elapsedInflationMinutes.toFixed(1)} min / {patient.reboa.maxRecommendedInflationMinutes} min max</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Balloon Vol (mL):</span>
                      <span className="font-bold text-slate-200">{patient.reboa.balloonInflationVolumeMl} mL</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Proximal MAP:</span>
                      <span className="font-bold text-cyan-300">{patient.reboa.proximalAorticMapMmHg} mmHg</span>
                    </div>
                  </div>
                </div>

                {/* Vascular Access & Lines */}
                <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-mono text-xs font-bold uppercase text-cyan-400 flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    Resuscitation Vascular Access Matrix
                  </h4>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between bg-slate-900/60 p-1.5 rounded">
                      <span className="text-slate-400">Cordis / Introducer:</span>
                      <span className="font-bold text-slate-200">{patient.vascularAccess.cordisIntroducerSites.join(", ") || "None"}</span>
                    </div>
                    <div className="flex justify-between bg-slate-900/60 p-1.5 rounded">
                      <span className="text-slate-400">Large Bore Peripheral IVs:</span>
                      <span className="font-bold text-slate-200">{patient.vascularAccess.peripheralIvGauges.join(", ") || "None"}</span>
                    </div>
                    <div className="flex justify-between bg-slate-900/60 p-1.5 rounded">
                      <span className="text-slate-400">Intraosseous (IO) Needles:</span>
                      <span className="font-bold text-slate-200">{patient.vascularAccess.intraosseousNeedleSites.join(", ") || "None"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resuscitation Events Timeline */}
              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-mono text-xs font-bold uppercase text-slate-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Chronological Resuscitation Events Log
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {patient.resuscitationEventsTimeline.map((ev, idx) => (
                    <div key={idx} className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-xs flex items-start gap-2">
                      <span className="font-mono text-[10px] text-cyan-400 shrink-0 mt-0.5">{ev.timestamp}</span>
                      <div className="flex-1">
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-slate-800 text-slate-300 mr-1.5 border border-slate-700">
                          {ev.phase}
                        </span>
                        <span className="text-slate-200">{ev.event}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">Logged by: {ev.provider}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATLS PRIMARY SURVEY */}
          {activeTab === "ATLS_SURVEY" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/60 space-y-1">
                  <span className="font-mono text-xs font-black text-cyan-400 block">[A] AIRWAY & C-SPINE</span>
                  <p className="text-xs font-bold text-white">{patient.intubationStatus}</p>
                  <p className="text-[10px] text-slate-400">C-Spine immobilized with cervical collar</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-900/60 space-y-1">
                  <span className="font-mono text-xs font-black text-emerald-400 block">[B] BREATHING</span>
                  <p className="text-xs font-bold text-white">RR {patient.vitals.respiratoryRate} • SpO2 {patient.vitals.spO2}%</p>
                  <p className="text-[10px] text-slate-400">Vent Mode: {patient.ventilatorSettings?.mode || "Spontaneous"}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/60 space-y-1">
                  <span className="font-mono text-xs font-black text-rose-400 block">[C] CIRCULATION</span>
                  <p className="text-xs font-bold text-white">BP {patient.vitals.systolicBp}/{patient.vitals.diastolicBp} • HR {patient.vitals.heartRate}</p>
                  <p className="text-[10px] text-slate-400">Shock Class: {patient.shockClass.replace(/_/g, " ")}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-amber-900/60 space-y-1">
                  <span className="font-mono text-xs font-black text-amber-400 block">[D] DISABILITY (GCS)</span>
                  <p className="text-xs font-bold text-white">GCS {patient.gcs.totalGcs} (E{patient.gcs.eyeResponse} V{patient.gcs.verbalResponse} M{patient.gcs.motorResponse})</p>
                  <p className="text-[10px] text-slate-400">Pupils: {patient.gcs.pupilReactivity.replace(/_/g, " ")}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-violet-900/60 space-y-1">
                  <span className="font-mono text-xs font-black text-violet-400 block">[E] EXPOSURE</span>
                  <p className="text-xs font-bold text-white">Core Temp {patient.vitals.coreTemperatureCelsius}°C</p>
                  <p className="text-[10px] text-slate-400">Warm Baer Hugger deployed</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MTP TRANSFUSION FLOW */}
          {activeTab === "MTP_RESUS" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/60">
                  <span className="text-[10px] text-slate-400 block font-bold">pRBC UNITS</span>
                  <span className="text-2xl font-black text-rose-400">{patient.bloodLedger.prbcUnitsTransfused}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-amber-900/60">
                  <span className="text-[10px] text-slate-400 block font-bold">FFP UNITS</span>
                  <span className="text-2xl font-black text-amber-400">{patient.bloodLedger.ffpUnitsTransfused}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-cyan-900/60">
                  <span className="text-[10px] text-slate-400 block font-bold">PLATELET APHERESIS</span>
                  <span className="text-2xl font-black text-cyan-400">{patient.bloodLedger.plateletPheresisUnitsTransfused}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-violet-900/60">
                  <span className="text-[10px] text-slate-400 block font-bold">CRYOPRECIPITATE POOLS</span>
                  <span className="text-2xl font-black text-violet-400">{patient.bloodLedger.cryoprecipitatePoolsTransfused}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3 font-mono">
                <h4 className="text-xs font-black uppercase text-amber-400">1:1:1 Ratio Adherence & Citrate Toxicity Counter</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">pRBC to FFP Ratio:</span>
                    <span className="text-base font-bold text-white">{patient.bloodLedger.prbcToFfpRatio} : 1.0</span>
                    <span className="text-[10px] text-slate-400 block">(Target: 1.0 - 1.5)</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">IV Calcium Chloride Administered:</span>
                    <span className="text-base font-bold text-emerald-400">{patient.bloodLedger.calciumChlorideGramsAdministered} g</span>
                    <span className="text-[10px] text-slate-400 block">(1g per 4 units pRBC)</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Rapid Infuser Blood Warmer Temp:</span>
                    <span className="text-base font-bold text-cyan-300">{patient.bloodLedger.bloodWarmerTempCelsius}°C</span>
                    <span className="text-[10px] text-slate-400 block">Rate: {patient.bloodLedger.rapidInfuserFlowRateMlMin} mL/min</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: eFAST ULTRASOUND MATRIX */}
          {activeTab === "EFAST_EXAM" && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="font-mono text-xs font-black uppercase text-cyan-400">
                  Extended Focused Assessment with Sonography for Trauma (eFAST)
                </span>
                <span className="font-mono text-xs text-slate-400">
                  Exam by: {patient.fastExam.sonographer} • {patient.fastExam.performedTimestamp}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className={"p-3 rounded-xl border " + (patient.fastExam.pericardialSubxiphoid === "POSITIVE_FREE_FLUID" ? "bg-rose-950/70 border-rose-600 text-rose-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-300")}>
                  <span className="text-[10px] uppercase block text-slate-500">Pericardial / Subxiphoid</span>
                  <span className="text-sm font-black mt-1 block">{patient.fastExam.pericardialSubxiphoid}</span>
                </div>

                <div className={"p-3 rounded-xl border " + (patient.fastExam.rightUpperQuadrantMorisons === "POSITIVE_FREE_FLUID" ? "bg-rose-950/70 border-rose-600 text-rose-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-300")}>
                  <span className="text-[10px] uppercase block text-slate-500">RUQ (Morison Pouch)</span>
                  <span className="text-sm font-black mt-1 block">{patient.fastExam.rightUpperQuadrantMorisons}</span>
                </div>

                <div className={"p-3 rounded-xl border " + (patient.fastExam.leftUpperQuadrantSplenorenal === "POSITIVE_FREE_FLUID" ? "bg-rose-950/70 border-rose-600 text-rose-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-300")}>
                  <span className="text-[10px] uppercase block text-slate-500">LUQ (Splenorenal)</span>
                  <span className="text-sm font-black mt-1 block">{patient.fastExam.leftUpperQuadrantSplenorenal}</span>
                </div>

                <div className={"p-3 rounded-xl border " + (patient.fastExam.pelvicSuprapubic === "POSITIVE_FREE_FLUID" ? "bg-rose-950/70 border-rose-600 text-rose-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-300")}>
                  <span className="text-[10px] uppercase block text-slate-500">Pelvic / Suprapubic</span>
                  <span className="text-sm font-black mt-1 block">{patient.fastExam.pelvicSuprapubic}</span>
                </div>

                <div className={"p-3 rounded-xl border " + (patient.fastExam.rightThoraxHemothorax === "POSITIVE_FREE_FLUID" ? "bg-rose-950/70 border-rose-600 text-rose-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-300")}>
                  <span className="text-[10px] uppercase block text-slate-500">Right Hemothorax</span>
                  <span className="text-sm font-black mt-1 block">{patient.fastExam.rightThoraxHemothorax}</span>
                </div>

                <div className={"p-3 rounded-xl border " + (patient.fastExam.leftThoraxHemothorax === "POSITIVE_FREE_FLUID" ? "bg-rose-950/70 border-rose-600 text-rose-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-300")}>
                  <span className="text-[10px] uppercase block text-slate-500">Left Hemothorax</span>
                  <span className="text-sm font-black mt-1 block">{patient.fastExam.leftThoraxHemothorax}</span>
                </div>

                <div className={"p-3 rounded-xl border " + (patient.fastExam.rightLungPneumothoraxSlide === "ABSENT_PNEUMOTHORAX" ? "bg-rose-950/70 border-rose-600 text-rose-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-300")}>
                  <span className="text-[10px] uppercase block text-slate-500">Right Lung Slide</span>
                  <span className="text-sm font-black mt-1 block">{patient.fastExam.rightLungPneumothoraxSlide}</span>
                </div>

                <div className={"p-3 rounded-xl border " + (patient.fastExam.leftLungPneumothoraxSlide === "ABSENT_PNEUMOTHORAX" ? "bg-rose-950/70 border-rose-600 text-rose-300 font-bold" : "bg-slate-950 border-slate-800 text-slate-300")}>
                  <span className="text-[10px] uppercase block text-slate-500">Left Lung Slide</span>
                  <span className="text-sm font-black mt-1 block">{patient.fastExam.leftLungPneumothoraxSlide}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TEG / ROTEM VISCOELASTIC */}
          {activeTab === "TEG_ROTEM" && (
            <div className="space-y-4 font-mono">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-amber-400">Modality: {patient.tegRotem.modality}</span>
                  <span className="text-[10px] text-slate-400">Sample: {patient.tegRotem.sampleTimestamp}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">R-TIME</span>
                    <span className="text-lg font-black text-white">{patient.tegRotem.reactionTimeMinutes_R} m</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">K-TIME</span>
                    <span className="text-lg font-black text-white">{patient.tegRotem.clotKineticsMinutes_K} m</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">ALPHA ANGLE</span>
                    <span className="text-lg font-black text-white">{patient.tegRotem.alphaAngleDegrees}°</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">MAX AMPLITUDE</span>
                    <span className="text-lg font-black text-white">{patient.tegRotem.maximumAmplitudeMm_MA} mm</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">LY30 %</span>
                    <span className="text-lg font-black text-rose-400">{patient.tegRotem.clotLysisPercentage30Min_LY30}%</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-lg border border-amber-900/60 text-xs">
                  <span className="text-amber-400 font-bold block mb-1">Interpretation:</span>
                  <p className="text-slate-200">{patient.tegRotem.coagulopathyInterpretation}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ABG & LETHAL TRIAD */}
          {activeTab === "ABG_TRIAD" && (
            <div className="space-y-4 font-mono">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">pH (Acid-Base)</span>
                  <span className="text-xl font-black text-rose-400">{patient.abg.ph}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Base Deficit (mEq/L)</span>
                  <span className="text-xl font-black text-rose-400">{patient.abg.baseExcessDeficit}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Lactate (mmol/L)</span>
                  <span className="text-xl font-black text-amber-400">{patient.abg.lactateMmolL}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Ionized Calcium</span>
                  <span className="text-xl font-black text-cyan-300">{patient.abg.ionizedCalciumMmolL} mmol/L</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Hemoglobin</span>
                  <span className="text-xl font-black text-white">{patient.abg.hemoglobinGdl} g/dL</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Platelet Count</span>
                  <span className="text-xl font-black text-white">{patient.abg.plateletCountK} K/uL</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">INR</span>
                  <span className="text-xl font-black text-rose-400">{patient.abg.inr}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Fibrinogen</span>
                  <span className="text-xl font-black text-white">{patient.abg.fibrinogenMgDl} mg/dL</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Workstation Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>MedTrack Resuscitation Workstation • Bedside Continuous Telemetry</span>
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

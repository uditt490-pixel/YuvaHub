import React, { useState } from "react";
import {
  X,
  Dna,
  Sparkles,
  Activity,
  Flame,
  Droplets,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Download,
  FileCode,
  CheckCircle2,
  Users,
  TestTube2,
  TrendingDown,
  TrendingUp,
  Layers,
  Zap,
  BookOpen
} from "lucide-react";
import { OncologyPatient } from "../../../types/oncologyGenomics";
import { OncologyGenomicsService } from "../../../services/OncologyGenomicsService";

interface OncologyGenomicsInspectorModalProps {
  patient: OncologyPatient;
  isOpen: boolean;
  onClose: () => void;
  onOpenMtb: (patient: OncologyPatient) => void;
  onOpenEscalation: (patient: OncologyPatient) => void;
}

export const OncologyGenomicsInspectorModal: React.FC<OncologyGenomicsInspectorModalProps> = ({
  patient,
  isOpen,
  onClose,
  onOpenMtb,
  onOpenEscalation
}) => {
  const [activeTab, setActiveTab] = useState<"SOMATIC_MUTATIONS" | "LIQUID_BIOPSY" | "PHARMACOGENOMICS" | "CLINICAL_TRIALS" | "FHIR_EXPORT">("SOMATIC_MUTATIONS");
  const [copiedFhir, setCopiedFhir] = useState(false);

  if (!isOpen) return null;

  const handleDownloadFhir = () => {
    const json = JSON.stringify(OncologyGenomicsService.exportPatientToFhirR4Genomics(patient), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FHIR_Genomics_${patient.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csv = OncologyGenomicsService.exportPatientGenomicsCsv(patient);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Oncology_Genomics_${patient.id}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyFhir = () => {
    const json = JSON.stringify(OncologyGenomicsService.exportPatientToFhirR4Genomics(patient), null, 2);
    navigator.clipboard.writeText(json);
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/10 border border-violet-500/30 rounded-2xl text-violet-400">
              <Dna className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight">{patient.name}</h2>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-mono text-xs rounded-md">
                  {patient.mrn}
                </span>
                <span className="px-2.5 py-0.5 bg-violet-500/20 text-violet-300 border border-violet-500/40 text-xs font-bold rounded-md">
                  {patient.primarySite.replace(/_/g, " ")}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-md">
                  {patient.clinicalTnmStage}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Histology: <span className="text-white font-semibold">{patient.histologySubtype}</span> | 
                Age: <span className="text-white font-semibold">{patient.ageYears}y</span> | 
                BSA: <span className="text-cyan-400 font-semibold">{patient.bodySurfaceAreaM2} m²</span> | 
                ECOG: <span className="text-white font-semibold">{patient.ecogPerformanceStatus}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenMtb(patient)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-950/30"
            >
              <Users className="w-4 h-4" />
              Molecular Tumor Board
            </button>
            <button
              onClick={() => onOpenEscalation(patient)}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-violet-950/40"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Escalate Therapy
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
          <div className="bg-slate-950 border border-violet-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Tumor Mutation Burden</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-black ${patient.molecularProfile.tumorMutationBurdenMb >= 10 ? "text-cyan-400" : "text-white"}`}>
                {patient.molecularProfile.tumorMutationBurdenMb}
              </span>
              <span className="text-xs text-slate-500">mut/Mb ({patient.molecularProfile.tmbClassification})</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-emerald-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">MSI & HRD Status</span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-emerald-400">{patient.molecularProfile.msiStatus}</span>
              <span className="text-xs text-slate-400">| HRD Score: <strong className="text-white">{patient.molecularProfile.hrdScore}</strong></span>
            </div>
          </div>

          <div className="bg-slate-950 border border-rose-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">ctDNA Molecular Residual Disease</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-xl font-black ${patient.liquidBiopsy.mrdStatus === "MRD_POSITIVE" ? "text-rose-400" : "text-emerald-400"}`}>
                {patient.liquidBiopsy.plasmaCtDnaHgeMl}
              </span>
              <span className="text-xs text-slate-500">hGE/mL ({patient.liquidBiopsy.mrdStatus})</span>
            </div>
          </div>

          <div className="bg-slate-950 border border-amber-900/50 rounded-xl p-3 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Pharmacogenomic Safety</span>
            <div className="text-xs font-bold text-amber-300 truncate">
              DPYD: {patient.pharmacogenomics.dpydStatus}
            </div>
            <div className="text-[10px] text-slate-400">
              UGT1A1: {patient.pharmacogenomics.ugt1a1Status}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-950 px-6 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          {[
            { id: "SOMATIC_MUTATIONS", label: "Somatic NGS Alterations", icon: Dna },
            { id: "LIQUID_BIOPSY", label: "ctDNA Liquid Biopsy Kinetics", icon: Activity },
            { id: "PHARMACOGENOMICS", label: "DPYD / UGT1A1 Pharmacogenomics", icon: Pill },
            { id: "CLINICAL_TRIALS", label: "Matched Clinical Trials & IO", icon: TestTube2 },
            { id: "FHIR_EXPORT", label: "HL7 FHIR R4 & Audit Export", icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-violet-400 text-violet-400 bg-violet-500/5"
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
          {/* TAB 1: SOMATIC MUTATIONS */}
          {activeTab === "SOMATIC_MUTATIONS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <h3 className="text-sm font-bold text-white">Next-Generation Sequencing (NGS) Somatic Alterations</h3>
                <span className="text-slate-400">Average Coverage Depth: 1,500x | Filter: Tier I - IV</span>
              </div>

              <div className="space-y-3">
                {patient.molecularProfile.mutations.map((mut) => (
                  <div
                    key={mut.id}
                    className="bg-slate-950 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-4 space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-white">{mut.geneSymbol}</span>
                          <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 font-mono text-xs font-bold rounded">
                            {mut.hgvsp}
                          </span>
                          <span className="text-xs font-mono text-slate-400">{mut.hgvsc}</span>
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded">
                            Exon {mut.exon}
                          </span>
                        </div>
                        {mut.resistanceMechanism && (
                          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold mt-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Resistance Mechanism: {mut.resistanceMechanism}</span>
                          </div>
                        )}
                      </div>

                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                        mut.tier === "TIER_I_STRONG_CLINICAL_SIGNIFICANCE"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      }`}>
                        {mut.tier.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-slate-500 font-bold text-[10px] uppercase">Variant Allele Frequency:</span>
                        <p className="text-sm font-black text-white mt-0.5">{mut.variantAlleleFrequency}%</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold text-[10px] uppercase">Sequencing Depth:</span>
                        <p className="text-sm font-black text-white mt-0.5">{mut.sequencingDepthX}x</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold text-[10px] uppercase">Alteration Type:</span>
                        <p className="text-sm font-black text-white mt-0.5">{mut.mutationType}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold text-[10px] uppercase">Associated Targeted Therapies:</span>
                        <p className="text-xs font-bold text-cyan-300 mt-0.5">
                          {mut.associatedTherapies.length > 0 ? mut.associatedTherapies.join(", ") : "None Approved"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIQUID BIOPSY CTDNA */}
          {activeTab === "LIQUID_BIOPSY" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Plasma ctDNA Concentration</span>
                  <div className="text-2xl font-black text-rose-400">
                    {patient.liquidBiopsy.plasmaCtDnaHgeMl} <span className="text-xs text-slate-400">hGE/mL</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Limit of detection: &gt; 5 hGE/mL (Ultra-deep duplex sequencing)
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Mean Tracking VAF</span>
                  <div className="text-2xl font-black text-cyan-400">
                    {patient.liquidBiopsy.meanVafPercent}%
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {patient.liquidBiopsy.clonesTrackedCount} Clonal somatic driver loci tracked
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                  <span className="text-xs uppercase font-bold text-slate-400">Longitudinal ctDNA Trend</span>
                  <div className="text-xl font-black text-white flex items-center gap-2">
                    {patient.liquidBiopsy.longitudinalTrend === "RISING" ? (
                      <>
                        <TrendingUp className="w-5 h-5 text-rose-500" />
                        <span className="text-rose-400">RISING (Surge Risk)</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-400">FALLING / CLEARANCE</span>
                      </>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Molecular response ahead of radiographic CT/PET restaging
                  </p>
                </div>
              </div>

              {/* Longitudinal ctDNA Clearance Chart */}
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-rose-400" />
                    Longitudinal ctDNA Kinetic Clearance Curve
                  </h4>
                  <span className="text-xs text-slate-400">Molecular Response Trajectory</span>
                </div>

                <div className="h-44 w-full bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-center p-4">
                  <svg className="w-full h-full" viewBox="0 0 500 150">
                    <line x1="40" y1="130" x2="480" y2="130" stroke="#475569" strokeWidth="1" />
                    <line x1="40" y1="10" x2="40" y2="130" stroke="#475569" strokeWidth="1" />
                    <text x="440" y="145" fill="#94a3b8" fontSize="10">Cycles</text>
                    <text x="10" y="20" fill="#94a3b8" fontSize="10" transform="rotate(-90 20,20)">ctDNA</text>
                    
                    {/* Simulated Trend Polyline */}
                    <polyline
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="2.5"
                      points={patient.liquidBiopsy.ctDnaHistory.map((val, idx) => {
                        const x = 50 + idx * 28;
                        const y = 130 - Math.min(110, (val / 12));
                        return `${x},${y}`;
                      }).join(" ")}
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHARMACOGENOMICS */}
          {activeTab === "PHARMACOGENOMICS" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DPYD Panel */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">DPYD Fluoropyrimidine Toxicity</h4>
                      <p className="text-xs text-slate-400">CPIC Dosing Guidelines for 5-FU, Capecitabine, Tegafur</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-black uppercase ${
                      patient.pharmacogenomics.dpydStatus === "POOR_METABOLIZER"
                        ? "bg-rose-500 text-white animate-pulse"
                        : patient.pharmacogenomics.dpydStatus === "INTERMEDIATE_METABOLIZER"
                        ? "bg-amber-500 text-slate-950 font-bold"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}>
                      {patient.pharmacogenomics.dpydStatus.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Detected Variants:</span>
                      <span className="font-mono font-bold text-white">
                        {patient.pharmacogenomics.dpydVariantsDetected.length > 0 ? patient.pharmacogenomics.dpydVariantsDetected.join(", ") : "None (Wild Type)"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Toxicity Risk Category:</span>
                      <span className={`font-bold ${patient.pharmacogenomics.fluoropyrimidineToxicityRisk === "SEVERE_FATAL_RISK" ? "text-rose-400" : "text-white"}`}>
                        {patient.pharmacogenomics.fluoropyrimidineToxicityRisk}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Mandated Dose Reduction:</span>
                      <span className="font-mono font-black text-amber-400">
                        {patient.pharmacogenomics.fluoropyrimidineDoseAdjustmentPercent === 100 ? "100% (CONTRAINDICATED)" : `${patient.pharmacogenomics.fluoropyrimidineDoseAdjustmentPercent}% Reduction`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* UGT1A1 Panel */}
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-white">UGT1A1 Irinotecan Metabolism</h4>
                      <p className="text-xs text-slate-400">Severe Neutropenia & Diarrhea Toxicity Guardrail</p>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded text-xs font-mono font-bold">
                      {patient.pharmacogenomics.ugt1a1Status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                    <div className="flex justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-400">Irinotecan Toxicity Risk:</span>
                      <span className="font-bold text-white">{patient.pharmacogenomics.irinotecanToxicityRisk}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Recommended Dose Reduction:</span>
                      <span className="font-mono font-black text-amber-400">
                        {patient.pharmacogenomics.irinotecanDoseAdjustmentPercent}% Reduction
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLINICAL TRIALS */}
          {activeTab === "CLINICAL_TRIALS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <h3 className="text-sm font-bold text-white">Matched Biomarker-Directed Clinical Trials (NCCN / ESMO)</h3>
                <span className="text-emerald-400 font-bold">{patient.matchedTrials.length} Matched Protocol Arms</span>
              </div>

              <div className="space-y-3">
                {patient.matchedTrials.map((trial) => (
                  <div
                    key={trial.nctId}
                    className="bg-slate-950 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 space-y-2 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold rounded">
                            {trial.nctId}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded">
                            {trial.phase}
                          </span>
                          <span className="text-xs font-black text-white">{trial.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Matched Biomarker: <strong className="text-cyan-300">{trial.matchedGene}</strong> | Drug: <strong className="text-white">{trial.experimentalDrug}</strong>
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black rounded uppercase">
                        {trial.eligibilityStatus.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                      <span className="text-slate-500 font-bold uppercase text-[10px] block">Genomic Rationale:</span>
                      {trial.matchRationale}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FHIR EXPORT */}
          {activeTab === "FHIR_EXPORT" && (
            <div className="space-y-6">
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">HL7 FHIR R4 Genomics DiagnosticReport Export</h4>
                    <p className="text-xs text-slate-400">Standardized Interoperable Molecular Profiling Bundle.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopyFhir}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                    >
                      {copiedFhir ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <FileCode className="w-4 h-4 text-violet-400" />}
                      {copiedFhir ? "Copied JSON!" : "Copy FHIR JSON"}
                    </button>
                    <button
                      onClick={handleDownloadFhir}
                      className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-violet-950/40"
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

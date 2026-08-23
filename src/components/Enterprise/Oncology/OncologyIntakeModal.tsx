import React, { useState } from "react";
import {
  X,
  UserPlus,
  Dna,
  Sparkles,
  ShieldCheck,
  Activity,
  CheckCircle2
} from "lucide-react";
import { OncologyPatient, TumorPrimarySite, MsiStatus } from "../../../types/oncologyGenomics";
import { OncologyGenomicsService } from "../../../services/OncologyGenomicsService";

interface OncologyIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdmitPatient: (patient: OncologyPatient) => void;
}

export const OncologyIntakeModal: React.FC<OncologyIntakeModalProps> = ({
  isOpen,
  onClose,
  onAdmitPatient
}) => {
  const [name, setName] = useState("");
  const [ageYears, setAgeYears] = useState(58);
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [weightKg, setWeightKg] = useState(70.0);
  const [heightCm, setHeightCm] = useState(170);
  const [primarySite, setPrimarySite] = useState<TumorPrimarySite>("NON_SMALL_CELL_LUNG");
  const [histologySubtype, setHistologySubtype] = useState("Non-Small Cell Lung Carcinoma (Adenocarcinoma)");
  const [clinicalTnmStage, setClinicalTnmStage] = useState("cT2aN1M0 (Stage IIB)");
  const [ecogPerformanceStatus, setEcogPerformanceStatus] = useState<0 | 1 | 2 | 3 | 4>(1);
  const [tmbMutMb, setTmbMutMb] = useState(11.4);
  const [msiStatus, setMsiStatus] = useState<MsiStatus>("MSS");
  const [hrdScore, setHrdScore] = useState(24);
  const [geneSymbol, setGeneSymbol] = useState("EGFR");
  const [hgvsp, setHgvsp] = useState("p.Leu858Arg (L858R)");
  const [vaf, setVaf] = useState(35.2);
  const [dpydStatus, setDpydStatus] = useState<"NORMAL_METABOLIZER" | "INTERMEDIATE_METABOLIZER" | "POOR_METABOLIZER">("NORMAL_METABOLIZER");

  if (!isOpen) return null;

  const bsa = OncologyGenomicsService.calculateBsa(heightCm, weightKg);
  const tmbClass = OncologyGenomicsService.classifyTmb(tmbMutMb);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const patientId = `ONC-PT-${Date.now().toString().slice(-4)}`;
    const mrn = `MRN-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const mutations = [
      {
        id: `MUT-${Date.now()}`,
        geneSymbol,
        hgvsc: "c.2573T>G",
        hgvsp,
        exon: 21,
        variantAlleleFrequency: vaf,
        sequencingDepthX: 1350,
        tier: "TIER_I_STRONG_CLINICAL_SIGNIFICANCE" as const,
        mutationType: "SNV" as const,
        associatedTherapies: ["Osimertinib", "Erlotinib"]
      }
    ];

    const hrdStatus = OncologyGenomicsService.evaluateHrdStatus(hrdScore, mutations);
    const pgx = OncologyGenomicsService.evaluatePharmacogenomics(
      dpydStatus === "POOR_METABOLIZER" ? ["*2A"] : dpydStatus === "INTERMEDIATE_METABOLIZER" ? ["c.2846A>T"] : [],
      "*1/*1 (Normal)"
    );

    const newPatient: OncologyPatient = {
      id: patientId,
      mrn,
      name,
      ageYears,
      gender,
      weightKg,
      heightCm,
      bodySurfaceAreaM2: bsa,
      primarySite,
      histologySubtype,
      clinicalTnmStage,
      ecogPerformanceStatus,
      currentTherapyLine: "FIRST_LINE_TARGETED",
      currentRegimenName: "Targeted TKI / Standard Molecular Evaluation",
      molecularProfile: {
        tumorMutationBurdenMb: tmbMutMb,
        tmbClassification: tmbClass,
        msiStatus,
        hrdScore,
        hrdStatus,
        pdl1TpsScorePercent: 20,
        mutations,
        actionableBiomarkersCount: 1,
        resistanceMutationsCount: 0
      },
      liquidBiopsy: {
        timestamp: new Date().toISOString(),
        plasmaCtDnaHgeMl: 150,
        meanVafPercent: vaf / 4,
        mrdStatus: "MRD_POSITIVE",
        clonesTrackedCount: 1,
        longitudinalTrend: "STABLE",
        ctDnaHistory: Array(15).fill(150)
      },
      pharmacogenomics: pgx,
      matchedTrials: [],
      tumorBoard: {
        meetingId: `MTB-${Date.now().toString().slice(-4)}`,
        scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        leadOncologist: "Dr. Sanjay Gupta, MD",
        leadPathologist: "Dr. Sunita Rao, MD",
        leadGenomicist: "Dr. Amit Shah, PhD",
        status: "SCHEDULED",
        consensusRecommendation: "Evaluate frontline targeted kinase inhibitor vs dual checkpoint IO.",
        tierIActionOrdered: "Actionable driver sequencing confirmed"
      },
      recurrenceRiskScore: 60,
      activeAlertsCount: 0
    };

    newPatient.matchedTrials = OncologyGenomicsService.matchTherapiesAndTrials(newPatient);

    onAdmitPatient(newPatient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/20 border border-violet-500/40 rounded-2xl text-violet-400">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                New Oncology Molecular Intake & NGS Ingestion
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                NCCN-Compliant Somatic Biomarker Registration & Pharmacogenomic Profile Setup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-xs">
          {/* 1. Demographics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 border-b border-slate-800 pb-2">
              1. Demographics & Clinical Staging
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-semibold">Patient Full Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Gender:</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Age (Years):</label>
                <input
                  type="number"
                  min={18}
                  max={100}
                  value={ageYears}
                  onChange={(e) => setAgeYears(parseInt(e.target.value) || 50)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Weight (kg):</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 70)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Height (cm):</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value) || 170)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Primary Site:</label>
                <select
                  value={primarySite}
                  onChange={(e) => setPrimarySite(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="NON_SMALL_CELL_LUNG">Non-Small Cell Lung (NSCLC)</option>
                  <option value="BREAST">Breast Carcinoma</option>
                  <option value="COLORECTAL">Colorectal Carcinoma</option>
                  <option value="MELANOMA">Cutaneous Melanoma</option>
                  <option value="PANCREATIC_DUCTAL">Pancreatic Ductal Adenocarcinoma</option>
                  <option value="OVARIAN_HIGH_GRADE">High-Grade Serous Ovarian</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">TNM Stage:</label>
                <input
                  type="text"
                  value={clinicalTnmStage}
                  onChange={(e) => setClinicalTnmStage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">ECOG Performance:</label>
                <select
                  value={ecogPerformanceStatus}
                  onChange={(e) => setEcogPerformanceStatus(parseInt(e.target.value) as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                >
                  <option value={0}>0 - Fully Active</option>
                  <option value={1}>1 - Restricted Strenuous</option>
                  <option value={2}>2 - Capable Self-Care</option>
                  <option value={3}>3 - Limited Self-Care</option>
                  <option value={4}>4 - Completely Disabled</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. Molecular & Genomic Baseline */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
              2. Molecular & Genomic Biomarker Ingestion
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">TMB (mut/Mb):</label>
                <input
                  type="number"
                  step="0.1"
                  value={tmbMutMb}
                  onChange={(e) => setTmbMutMb(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">MSI Status:</label>
                <select
                  value={msiStatus}
                  onChange={(e) => setMsiStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="MSS">MSS (Stable)</option>
                  <option value="MSI_HIGH">MSI-High (dMMR)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">HRD Score (0-100):</label>
                <input
                  type="number"
                  value={hrdScore}
                  onChange={(e) => setHrdScore(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">DPYD Status:</label>
                <select
                  value={dpydStatus}
                  onChange={(e) => setDpydStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                >
                  <option value="NORMAL_METABOLIZER">Normal (Standard)</option>
                  <option value="INTERMEDIATE_METABOLIZER">Intermediate (50% cut)</option>
                  <option value="POOR_METABOLIZER">Poor (Contraindicated)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-400">Driver Gene Symbol:</label>
                <input
                  type="text"
                  value={geneSymbol}
                  onChange={(e) => setGeneSymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">Protein Change (HGVSp):</label>
                <input
                  type="text"
                  value={hgvsp}
                  onChange={(e) => setHgvsp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400">VAF (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={vaf}
                  onChange={(e) => setVaf(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg shadow-violet-500/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Complete Molecular Intake
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

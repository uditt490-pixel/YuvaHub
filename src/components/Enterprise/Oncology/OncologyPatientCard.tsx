import React from "react";
import {
  Dna,
  Sparkles,
  Flame,
  Activity,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  TestTube2,
  Users,
  Pill,
  Zap,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { OncologyPatient } from "../../../types/oncologyGenomics";

interface OncologyPatientCardProps {
  patient: OncologyPatient;
  onInspect: (patient: OncologyPatient) => void;
  onOpenMtb: (patient: OncologyPatient) => void;
  onOpenEscalation: (patient: OncologyPatient) => void;
}

export const OncologyPatientCard: React.FC<OncologyPatientCardProps> = ({
  patient,
  onInspect,
  onOpenMtb,
  onOpenEscalation
}) => {
  const topMutation = patient.molecularProfile.mutations[0];
  const hasPgxWarning = patient.pharmacogenomics.fluoropyrimidineToxicityRisk !== "LOW" || patient.pharmacogenomics.irinotecanToxicityRisk !== "STANDARD";

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-violet-500/50 rounded-3xl p-5 shadow-xl transition-all duration-200 hover:shadow-violet-500/10 space-y-4 flex flex-col justify-between">
      {/* Header: Demographics, TNM & Staging */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/30 text-violet-400 font-mono text-xs font-bold rounded-lg">
                {patient.primarySite.replace(/_/g, " ")}
              </span>
              <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-[11px] font-bold rounded-md">
                {patient.clinicalTnmStage}
              </span>
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-bold rounded-md">
                ECOG {patient.ecogPerformanceStatus}
              </span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
              {patient.name}
              <span className="text-xs text-slate-400 font-normal">
                ({patient.gender === "MALE" ? "M" : "F"}, {patient.ageYears}y)
              </span>
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-slate-400 font-semibold">{patient.mrn}</span>
            <div className="text-xs font-bold text-violet-300">BSA {patient.bodySurfaceAreaM2} m²</div>
          </div>
        </div>

        {/* Histology Subtype */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl px-3 py-2 text-xs">
          <p className="text-slate-300 font-medium line-clamp-1">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1.5">Histology:</span>
            {patient.histologySubtype}
          </p>
        </div>
      </div>

      {/* Primary Actionable Mutations Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <Dna className="w-3.5 h-3.5 text-violet-400" />
            Top Somatic Genomic Alterations
          </span>
          <span className="text-[10px] font-bold text-emerald-400">
            {patient.molecularProfile.mutations.length} Detected
          </span>
        </div>

        <div className="space-y-1.5">
          {patient.molecularProfile.mutations.slice(0, 2).map((mut) => (
            <div
              key={mut.id}
              className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-white">{mut.geneSymbol}</span>
                  <span className="font-mono text-cyan-300 font-bold text-[11px]">{mut.hgvsp}</span>
                  {mut.resistanceMechanism && (
                    <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold rounded">
                      RESISTANCE
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Exon {mut.exon} | VAF: <span className="font-bold text-white">{mut.variantAlleleFrequency}%</span> ({mut.sequencingDepthX}x depth)
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase whitespace-nowrap ${
                mut.tier === "TIER_I_STRONG_CLINICAL_SIGNIFICANCE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              }`}>
                {mut.tier.split("_")[0]} {mut.tier.split("_")[1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TMB, MSI, HRD & ctDNA Liquid Biopsy Strip */}
      <div className="grid grid-cols-4 gap-2 text-xs">
        {/* TMB */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">TMB</span>
          <div className={`text-base font-black ${patient.molecularProfile.tumorMutationBurdenMb >= 10 ? "text-cyan-400" : "text-white"}`}>
            {patient.molecularProfile.tumorMutationBurdenMb}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">mut/Mb</span>
        </div>

        {/* MSI */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">MSI Status</span>
          <div className={`text-xs font-black truncate mt-1 ${patient.molecularProfile.msiStatus === "MSI_HIGH" ? "text-emerald-400" : "text-slate-300"}`}>
            {patient.molecularProfile.msiStatus}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">IHC/NGS</span>
        </div>

        {/* HRD Score */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">HRD Score</span>
          <div className={`text-base font-black ${patient.molecularProfile.hrdScore >= 42 ? "text-indigo-400" : "text-white"}`}>
            {patient.molecularProfile.hrdScore}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">{patient.molecularProfile.hrdStatus.split("_")[0]}</span>
        </div>

        {/* ctDNA MRD */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">ctDNA MRD</span>
          <div className={`text-base font-black ${patient.liquidBiopsy.mrdStatus === "MRD_POSITIVE" ? "text-rose-400" : "text-emerald-400"}`}>
            {patient.liquidBiopsy.plasmaCtDnaHgeMl}
          </div>
          <span className="text-[9px] text-slate-500 block font-mono">hGE/mL</span>
        </div>
      </div>

      {/* Pharmacogenomics Alert or Current Regimen Banner */}
      {hasPgxWarning ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span className="font-bold text-amber-300 line-clamp-1 text-[11px]">
              PGx Warning: {patient.pharmacogenomics.dpydStatus !== "NORMAL_METABOLIZER" ? `DPYD ${patient.pharmacogenomics.dpydStatus}` : `UGT1A1 ${patient.pharmacogenomics.ugt1a1Status}`}
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded">
            Dose Adjusted
          </span>
        </div>
      ) : (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2 text-xs">
          <Pill className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-300 text-[11px] font-medium line-clamp-1">
            <strong className="text-slate-400">Regimen:</strong> {patient.currentRegimenName}
          </span>
        </div>
      )}

      {/* Action Footer Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => onInspect(patient)}
          className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-violet-600/20"
        >
          <Dna className="w-3.5 h-3.5" />
          Inspect Genomics & ctDNA
        </button>

        <button
          onClick={() => onOpenMtb(patient)}
          className="px-3 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
          title="Molecular Tumor Board"
        >
          <Users className="w-3.5 h-3.5" />
          MTB
        </button>

        <button
          onClick={() => onOpenEscalation(patient)}
          className="px-3 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
          title="Therapy Escalation & Trials"
        >
          <Zap className="w-3.5 h-3.5" />
          Escalate
        </button>
      </div>
    </div>
  );
};

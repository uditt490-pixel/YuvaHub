import React, { useState } from "react";
import {
  X,
  Users,
  CheckCircle2,
  BookOpen,
  Calendar,
  UserCheck,
  ShieldCheck,
  Dna,
  Zap
} from "lucide-react";
import { OncologyPatient } from "../../../types/oncologyGenomics";

interface MolecularTumorBoardModalProps {
  patient: OncologyPatient;
  isOpen: boolean;
  onClose: () => void;
  onSaveConsensus: (patientId: string, recommendation: string, orderedAction: string) => void;
}

export const MolecularTumorBoardModal: React.FC<MolecularTumorBoardModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSaveConsensus
}) => {
  const [recommendation, setRecommendation] = useState(patient.tumorBoard.consensusRecommendation);
  const [orderedAction, setOrderedAction] = useState(patient.tumorBoard.tierIActionOrdered);
  const [leadOncologist, setLeadOncologist] = useState(patient.tumorBoard.leadOncologist);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConsensus(patient.id, recommendation, orderedAction);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Molecular Tumor Board (MTB) Multidisciplinary Console
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Case Review: <span className="text-white font-semibold">{patient.name}</span> ({patient.primarySite.replace(/_/g, " ")}) | Stage: {patient.clinicalTnmStage}
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

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-xs">
          {savedSuccess ? (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-10 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-black text-white">MTB Consensus Recorded & Action Ordered</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Electronic medical record updated with multidisciplinary targeted sequencing decisions.
              </p>
            </div>
          ) : (
            <>
              {/* Review Panel Team */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Lead Medical Oncologist:</span>
                  <p className="text-xs font-bold text-white mt-0.5">{patient.tumorBoard.leadOncologist}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Lead Molecular Pathologist:</span>
                  <p className="text-xs font-bold text-cyan-300 mt-0.5">{patient.tumorBoard.leadPathologist}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Lead Clinical Genomicist:</span>
                  <p className="text-xs font-bold text-violet-300 mt-0.5">{patient.tumorBoard.leadGenomicist}</p>
                </div>
              </div>

              {/* Detected Biomarkers Summary */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold uppercase text-slate-400">Genomic Key Findings:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {patient.molecularProfile.mutations.map((m) => (
                    <span key={m.id} className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white font-mono">
                      <strong>{m.geneSymbol}</strong> {m.hgvsp} (VAF {m.variantAlleleFrequency}%)
                    </span>
                  ))}
                  <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 rounded-lg">
                    TMB: {patient.molecularProfile.tumorMutationBurdenMb} mut/Mb
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg">
                    MSI: {patient.molecularProfile.msiStatus}
                  </span>
                  <span className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-lg">
                    HRD: {patient.molecularProfile.hrdScore}
                  </span>
                </div>
              </div>

              {/* Consensus Recommendation Textarea */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Multidisciplinary Consensus Recommendation:
                </label>
                <textarea
                  rows={4}
                  required
                  value={recommendation}
                  onChange={(e) => setRecommendation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Tier I Action Directive */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Ordered Actionable Prescription / Clinical Trial Enrollment:
                </label>
                <input
                  type="text"
                  required
                  value={orderedAction}
                  onChange={(e) => setOrderedAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Footer */}
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
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black rounded-xl shadow-lg shadow-indigo-950/40 flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Sign Off MTB Decision
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

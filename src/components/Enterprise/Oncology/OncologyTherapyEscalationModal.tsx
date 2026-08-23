import React, { useState } from "react";
import {
  X,
  Zap,
  CheckCircle2,
  Sparkles,
  ShieldAlert,
  TestTube2,
  Pill,
  Users
} from "lucide-react";
import { OncologyPatient, TherapyLineStatus } from "../../../types/oncologyGenomics";

interface OncologyTherapyEscalationModalProps {
  patient: OncologyPatient;
  isOpen: boolean;
  onClose: () => void;
  onEscalateTherapy: (patientId: string, line: TherapyLineStatus, regimen: string, rationale: string) => void;
}

export const OncologyTherapyEscalationModal: React.FC<OncologyTherapyEscalationModalProps> = ({
  patient,
  isOpen,
  onClose,
  onEscalateTherapy
}) => {
  const [selectedLine, setSelectedLine] = useState<TherapyLineStatus>("SECOND_LINE_RESISTANCE_TARGETED");
  const [regimenName, setRegimenName] = useState("BLU-945 + Osimertinib Targeted Combination (Trial NCT-04862780)");
  const [escalationRationale, setEscalationRationale] = useState("Acquired EGFR C797S resistance mutation detected on serial liquid biopsy ctDNA.");
  const [escalatedSuccess, setEscalatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleEscalate = (e: React.FormEvent) => {
    e.preventDefault();
    onEscalateTherapy(patient.id, selectedLine, regimenName, escalationRationale);
    setEscalatedSuccess(true);
    setTimeout(() => {
      setEscalatedSuccess(false);
      onClose();
    }, 1500);
  };

  const THERAPY_OPTIONS: Array<{ id: TherapyLineStatus; title: string; desc: string }> = [
    {
      id: "SECOND_LINE_RESISTANCE_TARGETED",
      title: "2nd-Line Resistance Targeted Therapy",
      desc: "Switch to next-generation kinase inhibitor tailored to acquired on-target resistance clone (e.g. C797S, T790M, G12C)."
    },
    {
      id: "FIRST_LINE_IMMUNOTHERAPY",
      title: "Dual Checkpoint Immunotherapy (Anti-PD-1 + Anti-CTLA-4)",
      desc: "Initiate Nivolumab + Ipilimumab or Pembrolizumab based on TMB-High (>=10 mut/Mb) or MSI-H status."
    },
    {
      id: "PARP_INHIBITOR_MAINTENANCE",
      title: "PARP Inhibitor Maintenance (Synthetic Lethality)",
      desc: "Olaparib / Niraparib maintenance for HRD-positive or BRCA1/2-deficient malignancies."
    },
    {
      id: "CLINICAL_TRIAL_ARM",
      title: "Biomarker-Directed Phase I-III Basket Clinical Trial",
      desc: "Enroll patient in active genomic trial arm for rare/unapproved actionable drivers."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-violet-500/20 border border-violet-500/40 rounded-2xl text-violet-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Biomarker-Directed Therapy Line Escalation
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Target Patient: <span className="text-white font-semibold">{patient.name}</span> ({patient.primarySite.replace(/_/g, " ")}) | Current: {patient.currentRegimenName}
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
        <form onSubmit={handleEscalate} className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-xs">
          {escalatedSuccess ? (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-10 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-pulse" />
              <h3 className="text-xl font-black text-white">Therapy Line Escalation Authorized</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Patient oncology profile updated to new line of therapy. Treatment plan dispatched to clinical pharmacy.
              </p>
            </div>
          ) : (
            <>
              {/* Option Selector Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400 block">
                  Select Escalation Pathway:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {THERAPY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedLine(opt.id)}
                      className={`p-4 rounded-2xl border text-left space-y-1.5 transition-all ${
                        selectedLine === opt.id
                          ? "bg-violet-500/10 border-violet-500 text-white ring-2 ring-violet-500/50"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <h4 className="text-xs font-bold text-white">{opt.title}</h4>
                      <p className="text-[11px] text-slate-400">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Regimen Name */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  New Regimen Specification / Trial Protocol:
                </label>
                <input
                  type="text"
                  required
                  value={regimenName}
                  onChange={(e) => setRegimenName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Clinical Rationale */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Genomic & Molecular Rationale for Escalation:
                </label>
                <textarea
                  rows={3}
                  required
                  value={escalationRationale}
                  onChange={(e) => setEscalationRationale(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-violet-500"
                />
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
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black rounded-xl shadow-lg shadow-violet-950/40 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Authorize Therapy Escalation
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

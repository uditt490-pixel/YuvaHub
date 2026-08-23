import React, { useState } from "react";
import {
  X,
  Pill,
  Calculator,
  ShieldAlert,
  ShieldCheck,
  Scale,
  Activity,
  AlertTriangle
} from "lucide-react";
import { OncologyGenomicsService } from "../../../services/OncologyGenomicsService";

interface PharmacogenomicsCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeightKg?: number;
  initialHeightCm?: number;
}

export const PharmacogenomicsCalculatorModal: React.FC<PharmacogenomicsCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialWeightKg = 70.0,
  initialHeightCm = 170
}) => {
  const [weightKg, setWeightKg] = useState(initialWeightKg);
  const [heightCm, setHeightCm] = useState(initialHeightCm);
  const [gfr, setGfr] = useState(85);
  const [targetAuc, setTargetAuc] = useState(5);
  const [dpydSelection, setDpydSelection] = useState<"NORMAL" | "INTERMEDIATE" | "POOR">("INTERMEDIATE");
  const [ugt1a1Selection, setUgt1a1Selection] = useState<"*1/*1" | "*1/*28" | "*28/*28">("*1/*28");

  if (!isOpen) return null;

  const bsa = OncologyGenomicsService.calculateBsa(heightCm, weightKg);
  // Calvert Formula: Total Dose (mg) = Target AUC * (GFR + 25)
  const carboplatinDoseMg = Math.round(targetAuc * (Math.min(125, gfr) + 25));

  // 5-FU Standard Dose: 400 mg/m2 bolus + 2400 mg/m2 46h infusion
  const standard5fuInfusionMg = Math.round(2400 * bsa);
  const adjusted5fuMg = dpydSelection === "POOR" ? 0 : dpydSelection === "INTERMEDIATE" ? Math.round(standard5fuInfusionMg * 0.5) : standard5fuInfusionMg;

  // Irinotecan Standard Dose: 180 mg/m2 (FOLFIRI)
  const standardIrinotecanMg = Math.round(180 * bsa);
  const adjustedIrinotecanMg = ugt1a1Selection === "*28/*28" ? Math.round(standardIrinotecanMg * 0.7) : ugt1a1Selection === "*1/*28" ? Math.round(standardIrinotecanMg * 0.85) : standardIrinotecanMg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Pharmacogenomics & Chemotherapy Dosing Safety Console
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                CPIC Standards for DPYD, UGT1A1, Mosteller BSA & Calvert Carboplatin AUC
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-xs">
          {/* Patient Parameter Adjusters */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Weight (kg):</label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 50)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Height (cm):</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 160)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">eGFR (mL/min):</label>
              <input
                type="number"
                value={gfr}
                onChange={(e) => setGfr(parseInt(e.target.value) || 60)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Calculated BSA (Mosteller):</label>
              <div className="text-xl font-black text-cyan-400 p-1.5">{bsa} m²</div>
            </div>
          </div>

          {/* DPYD Calculator */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">DPYD Fluoropyrimidine (5-FU / Capecitabine) Adjustment</h3>
              </div>
              <select
                value={dpydSelection}
                onChange={(e) => setDpydSelection(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white"
              >
                <option value="NORMAL">Normal Metabolizer (100% Dose)</option>
                <option value="INTERMEDIATE">Intermediate Metabolizer (*Int - 50% Dose)</option>
                <option value="POOR">Poor Metabolizer (*2A/*13 - CONTRAINDICATED)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400">Standard 46h 5-FU Infusion (2400 mg/m²):</span>
                <p className="text-base font-black text-slate-300 mt-0.5">{standard5fuInfusionMg} mg</p>
              </div>
              <div>
                <span className="text-slate-400">DPYD-Adjusted Safe Dose:</span>
                <p className={`text-xl font-black mt-0.5 ${dpydSelection === "POOR" ? "text-rose-500" : dpydSelection === "INTERMEDIATE" ? "text-amber-400" : "text-emerald-400"}`}>
                  {dpydSelection === "POOR" ? "0 mg (CONTRAINDICATED)" : `${adjusted5fuMg} mg (50% Dose)`}
                </p>
              </div>
            </div>
          </div>

          {/* UGT1A1 Calculator */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">UGT1A1 Irinotecan Metabolism Adjustment</h3>
              </div>
              <select
                value={ugt1a1Selection}
                onChange={(e) => setUgt1a1Selection(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white"
              >
                <option value="*1/*1">*1/*1 (Normal Metabolizer)</option>
                <option value="*1/*28">*1/*28 (Intermediate - 15% Reduction)</option>
                <option value="*28/*28">*28/*28 (Homozygous Poor - 30% Reduction)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400">Standard Irinotecan (180 mg/m²):</span>
                <p className="text-base font-black text-slate-300 mt-0.5">{standardIrinotecanMg} mg</p>
              </div>
              <div>
                <span className="text-slate-400">UGT1A1-Adjusted Safe Dose:</span>
                <p className="text-xl font-black text-indigo-300 mt-0.5">{adjustedIrinotecanMg} mg</p>
              </div>
            </div>
          </div>

          {/* Calvert Carboplatin AUC Calculator */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Calvert Formula Carboplatin Dosing (Target AUC {targetAuc})</h3>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Target AUC:</span>
                <select
                  value={targetAuc}
                  onChange={(e) => setTargetAuc(parseInt(e.target.value) || 5)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value={4}>AUC 4</option>
                  <option value={5}>AUC 5</option>
                  <option value={6}>AUC 6</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Total Carboplatin Dose = AUC × (GFR + 25):</span>
              <span className="text-2xl font-black text-cyan-300 font-mono">{carboplatinDoseMg} mg</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Always independently verify oncology doses against the primary clinical protocol.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};

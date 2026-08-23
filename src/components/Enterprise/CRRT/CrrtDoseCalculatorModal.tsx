import React, { useState } from "react";
import {
  X,
  Calculator,
  Droplets,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Zap
} from "lucide-react";
import { CrrtTelemetryService } from "../../../services/CrrtTelemetryService";

interface CrrtDoseCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrrtDoseCalculatorModal: React.FC<CrrtDoseCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [weightKg, setWeightKg] = useState(75.0);
  const [bloodFlowMlMin, setBloodFlowMlMin] = useState(180);
  const [preDilutionMlHr, setPreDilutionMlHr] = useState(1000);
  const [postDilutionMlHr, setPostDilutionMlHr] = useState(400);
  const [dialysateMlHr, setDialysateMlHr] = useState(800);
  const [netUfMlHr, setNetUfMlHr] = useState(150);
  const [hematocrit, setHematocrit] = useState(0.30);

  if (!isOpen) return null;

  const totalEffluent = preDilutionMlHr + postDilutionMlHr + dialysateMlHr + netUfMlHr;
  const deliveredDose = CrrtTelemetryService.calculateDeliveredEffluentDose(
    preDilutionMlHr + postDilutionMlHr,
    dialysateMlHr,
    netUfMlHr,
    weightKg
  );
  const ff = CrrtTelemetryService.calculateFiltrationFraction(
    postDilutionMlHr,
    netUfMlHr,
    bloodFlowMlMin,
    hematocrit
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl text-indigo-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                KDIGO CRRT Effluent Dose & Filtration Fraction Optimizer
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Standard: 20–25 mL/kg/hr Delivered Dose | Filtration Fraction &lt; 20–25%
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
          {/* Inputs Grid */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Patient Weight (kg):</label>
              <input
                type="number"
                step="0.5"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 50)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Blood Flow Q_b (mL/min):</label>
              <input
                type="number"
                value={bloodFlowMlMin}
                onChange={(e) => setBloodFlowMlMin(parseInt(e.target.value) || 100)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Hematocrit (Hct %):</label>
              <input
                type="number"
                step="0.01"
                value={hematocrit}
                onChange={(e) => setHematocrit(parseFloat(e.target.value) || 0.3)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Pre-Dilution Q_rep (mL/h):</label>
              <input
                type="number"
                value={preDilutionMlHr}
                onChange={(e) => setPreDilutionMlHr(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Post-Dilution Q_rep (mL/h):</label>
              <input
                type="number"
                value={postDilutionMlHr}
                onChange={(e) => setPostDilutionMlHr(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Dialysate Flow Q_d (mL/h):</label>
              <input
                type="number"
                value={dialysateMlHr}
                onChange={(e) => setDialysateMlHr(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400">Calculated Delivered Effluent Dose</span>
              <div className={`text-3xl font-black ${deliveredDose >= 20 && deliveredDose <= 30 ? "text-emerald-400" : "text-amber-400"}`}>
                {deliveredDose} <span className="text-sm font-mono text-slate-400">mL/kg/hr</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {deliveredDose < 20 ? "Underdosed (<20 mL/kg/h). Increase dialysate or replacement flow." : deliveredDose > 30 ? "High-volume hemofiltration (>30 mL/kg/h)." : "Optimal KDIGO therapeutic target."}
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400">Filtration Fraction (FF %)</span>
              <div className={`text-3xl font-black ${ff <= 20 ? "text-cyan-400" : ff <= 25 ? "text-amber-400" : "text-rose-400"}`}>
                {ff}%
              </div>
              <p className="text-[11px] text-slate-400">
                {ff > 25 ? "High clotting risk (>25%). Increase blood flow Q_b or shift to pre-dilution." : "Safe hemofilter hemoconcentration."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Prescription adheres to KDIGO clinical practice guidelines.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
          >
            Close Optimizer
          </button>
        </div>
      </div>
    </div>
  );
};

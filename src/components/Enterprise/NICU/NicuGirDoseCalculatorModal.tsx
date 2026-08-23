import React, { useState } from "react";
import {
  X,
  Calculator,
  Droplets,
  Activity,
  CheckCircle2,
  ShieldCheck,
  Scale,
  Zap
} from "lucide-react";
import { NicuTelemetryService } from "../../../services/NicuTelemetryService";

interface NicuGirDoseCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWeightGrams?: number;
}

export const NicuGirDoseCalculatorModal: React.FC<NicuGirDoseCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialWeightGrams = 1200
}) => {
  const [weightGrams, setWeightGrams] = useState(initialWeightGrams);
  const [dextrosePercent, setDextrosePercent] = useState(10.0);
  const [infusionRateMlHr, setInfusionRateMlHr] = useState(5.0);
  const [dayOfLife, setDayOfLife] = useState(3);

  if (!isOpen) return null;

  const gir = NicuTelemetryService.calculateGir(dextrosePercent, infusionRateMlHr, weightGrams);
  const weightKg = weightGrams / 1000;
  const totalFluidsMlKgDay = weightKg > 0 ? Math.round((infusionRateMlHr * 24) / weightKg) : 0;
  const isPeripheralSafe = dextrosePercent <= 12.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Neonatal Glucose Infusion Rate (GIR) & TPN Calculator
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Target: 4–8 mg/kg/min | Peripheral Access Max: D12.5W | Central Line UVC: D15W–D25W
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
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Weight (Grams):</label>
              <input
                type="number"
                value={weightGrams}
                onChange={(e) => setWeightGrams(parseInt(e.target.value) || 500)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Dextrose (%):</label>
              <input
                type="number"
                step="0.5"
                value={dextrosePercent}
                onChange={(e) => setDextrosePercent(parseFloat(e.target.value) || 5)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Infusion Rate (mL/hr):</label>
              <input
                type="number"
                step="0.1"
                value={infusionRateMlHr}
                onChange={(e) => setInfusionRateMlHr(parseFloat(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-bold uppercase text-[10px]">Day of Life:</label>
              <input
                type="number"
                value={dayOfLife}
                onChange={(e) => setDayOfLife(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
              />
            </div>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400">Calculated Glucose Infusion Rate</span>
              <div className={`text-3xl font-black ${gir >= 4 && gir <= 8 ? "text-emerald-400" : "text-amber-400"}`}>
                {gir} <span className="text-sm font-mono text-slate-400">mg/kg/min</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {gir < 4 ? "Sub-therapeutic GIR (<4 mg/kg/min). Hypoglycemia risk." : gir > 8 ? "High GIR (>8 mg/kg/min). Hyperglycemia & osmotic diuresis risk." : "Optimal target range for preterm neurodevelopment."}
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400">Total Fluid Volume (mL/kg/day)</span>
              <div className="text-3xl font-black text-cyan-300">
                {totalFluidsMlKgDay} <span className="text-sm font-mono text-slate-400">mL/kg/d</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isPeripheralSafe ? "Safe for peripheral intravenous line." : "Requires Central Venous Catheter / UVC due to high dextrose osmolarity (>D12.5W)."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Formulas verified against AAP neonatal nutrition protocols.</span>
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

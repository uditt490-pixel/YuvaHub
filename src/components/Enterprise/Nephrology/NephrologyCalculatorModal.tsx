import React, { useState } from "react";
import { X, Activity, Calculator, RefreshCw, Layers } from "lucide-react";
import { NephrologyTelemetryService } from "../../../services/NephrologyTelemetryService";

interface NephrologyCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NephrologyCalculatorModal: React.FC<NephrologyCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [age, setAge] = useState<number>(62);
  const [isFemale, setIsFemale] = useState<boolean>(false);
  const [weightKg, setWeightKg] = useState<number>(80);
  const [serumCr, setSerumCr] = useState<number>(3.8);
  const [baselineCr, setBaselineCr] = useState<number>(1.0);
  const [uoMlKgHr, setUoMlKgHr] = useState<number>(0.2);
  const [uoHours, setUoHours] = useState<number>(18);

  // Kt/V Dosing
  const [preBun, setPreBun] = useState<number>(90);
  const [postBun, setPostBun] = useState<number>(28);
  const [txHours, setTxHours] = useState<number>(4.0);
  const [ufLiters, setUfLiters] = useState<number>(3.0);

  // Electrolyte Gap
  const [na, setNa] = useState<number>(138);
  const [cl, setCl] = useState<number>(98);
  const [hco3, setHco3] = useState<number>(16);
  const [alb, setAlb] = useState<number>(2.8);

  // FENa
  const [urineNa, setUrineNa] = useState<number>(60);
  const [urineCr, setUrineCr] = useState<number>(45);

  if (!isOpen) return null;

  // Real-time calculations
  const kdigo = NephrologyTelemetryService.calculateKdigoStage(serumCr, baselineCr, uoMlKgHr, uoHours);
  const gfr = NephrologyTelemetryService.calculateCkdEpiGfr(serumCr, age, isFemale);
  const ktv = NephrologyTelemetryService.calculateDaugirdasKtV(preBun, postBun, txHours, ufLiters, weightKg);
  const urr = NephrologyTelemetryService.calculateUreaReductionRatio(preBun, postBun);
  const anionGap = NephrologyTelemetryService.calculateAnionGap(na, cl, hco3, alb);
  const fena = NephrologyTelemetryService.calculateFENa(urineNa, na, urineCr, serumCr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">
                Clinical Nephrology & Dialysis Dosing Solver
              </h2>
              <p className="text-xs text-slate-400">
                KDIGO AKI 1-3 Staging • CKD-EPI eGFR • Daugirdas Single-Pool Kt/V • URR • Albumin-Adjusted Anion Gap • FENa
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Solver Body */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Top Computed Results Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-center">
            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">KDIGO AKI Classification</span>
              <span className="text-base font-black text-rose-400">{kdigo.stage.replace(/_/g, " ")}</span>
              <span className="text-[9px] text-slate-500 block">Cr x{(serumCr / (baselineCr || 1)).toFixed(1)} baseline</span>
            </div>

            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Daugirdas spKt/V</span>
              <span className={"text-xl font-black " + (ktv >= 1.2 ? "text-emerald-400" : "text-amber-400")}>{ktv}</span>
              <span className="text-[9px] text-slate-500 block">URR: {urr}% (Target &gt;65%)</span>
            </div>

            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Corrected Anion Gap</span>
              <span className={"text-xl font-black " + (anionGap.correctedAg > 16 ? "text-rose-400" : "text-cyan-300")}>{anionGap.correctedAg} mEq/L</span>
              <span className="text-[9px] text-slate-500 block">Delta-Delta: {anionGap.deltaDeltaRatio}</span>
            </div>

            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">FENa Excretion</span>
              <span className={"text-xl font-black " + (fena < 1.0 ? "text-cyan-400" : "text-rose-400")}>{fena}%</span>
              <span className="text-[9px] text-slate-500 block">{fena < 1.0 ? "Prerenal Azotemia" : "Intrinsic ATN"}</span>
            </div>
          </div>

          {/* KDIGO AKI Criteria Rationale */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold text-cyan-400 block mb-1">KDIGO Diagnostic Rationale:</span>
            <p className="text-slate-300 font-mono text-[11px]">{kdigo.rationale}</p>
          </div>

          {/* Form Inputs: KDIGO Parameters */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase text-cyan-400 border-b border-slate-800 pb-1">
              KDIGO Parameters & Creatinine Kinetics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Current Creatinine (mg/dL):</label>
                <input
                  type="number"
                  step={0.01}
                  value={serumCr}
                  onChange={(e) => setSerumCr(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-rose-400 font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Baseline Creatinine (mg/dL):</label>
                <input
                  type="number"
                  step={0.01}
                  value={baselineCr}
                  onChange={(e) => setBaselineCr(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Urine Output (mL/kg/hr):</label>
                <input
                  type="number"
                  step={0.01}
                  value={uoMlKgHr}
                  onChange={(e) => setUoMlKgHr(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-amber-300 font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Oliguria Duration (Hours):</label>
                <input
                  type="number"
                  value={uoHours}
                  onChange={(e) => setUoHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Form Inputs: Dialysis Dosing (Kt/V & URR) */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase text-cyan-400 border-b border-slate-800 pb-1">
              Dialysis Dosing & Clearance (Daugirdas spKt/V)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Pre-Dialysis BUN (mg/dL):</label>
                <input
                  type="number"
                  value={preBun}
                  onChange={(e) => setPreBun(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Post-Dialysis BUN (mg/dL):</label>
                <input
                  type="number"
                  value={postBun}
                  onChange={(e) => setPostBun(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-emerald-400 font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Session Duration (Hours):</label>
                <input
                  type="number"
                  step={0.5}
                  value={txHours}
                  onChange={(e) => setTxHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Ultrafiltrate (Liters):</label>
                <input
                  type="number"
                  step={0.1}
                  value={ufLiters}
                  onChange={(e) => setUfLiters(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-cyan-300 font-bold font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>KDIGO 2012 Guidelines & KDOQI Dialysis Adequacy Standards</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-bold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

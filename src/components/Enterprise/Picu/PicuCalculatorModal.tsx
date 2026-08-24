import React, { useState } from "react";
import { X, Activity, Calculator, Baby, Flame, Zap } from "lucide-react";
import { PicuTelemetryService } from "../../../services/PicuTelemetryService";

interface PicuCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PicuCalculatorModal: React.FC<PicuCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [weightKg, setWeightKg] = useState<number>(14.0);
  const [ageYears, setAgeYears] = useState<number>(3.0);

  // PEWS Parameters
  const [behavior, setBehavior] = useState<number>(1);
  const [cardio, setCardio] = useState<number>(1);
  const [resp, setResp] = useState<number>(2);
  const [extraNeb, setExtraNeb] = useState<number>(0);
  const [extraEmesis, setExtraEmesis] = useState<number>(0);

  // Oxygenation Index (PALICC)
  const [paw, setPaw] = useState<number>(14.0);
  const [fio2, setFio2] = useState<number>(0.60);
  const [pao2, setPao2] = useState<number>(62);
  const [spo2, setSpo2] = useState<number>(91);

  // GIR
  const [ivRate, setIvRate] = useState<number>(60);
  const [dextrose, setDextrose] = useState<number>(10.0);

  if (!isOpen) return null;

  const pals = PicuTelemetryService.calculatePalsDosing(weightKg, ageYears);
  const pews = PicuTelemetryService.calculatePews(behavior, cardio, resp, extraNeb, extraEmesis);
  const oi = PicuTelemetryService.calculateOxygenationIndex(paw, fio2, pao2, spo2);
  const gir = PicuTelemetryService.calculateGir(ivRate, dextrose, weightKg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">
                Clinical Pediatric & Neonatal Dosing Solver
              </h2>
              <p className="text-xs text-slate-400">
                PALS Broselow Tape Resuscitation • Pediatric Early Warning (PEWS) • PALICC Oxygenation Index (OI) • GIR
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
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Broselow Tape Band</span>
              <span className="text-sm font-black text-pink-400">{pals.broselowColor.replace(/_/g, " ")}</span>
              <span className="text-[9px] text-slate-500 block">Weight: {weightKg} kg</span>
            </div>

            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">PALS Epinephrine IV</span>
              <span className="text-xl font-black text-rose-400">{pals.epinephrineIvIoBolusMg} mg</span>
              <span className="text-[9px] text-slate-500 block">0.01 mg/kg (0.1 mL/kg)</span>
            </div>

            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">PEWS Risk Category</span>
              <span className={"text-xl font-black " + (pews.totalPewsScore >= 6 ? "text-rose-400" : "text-amber-400")}>
                {pews.totalPewsScore}/13
              </span>
              <span className="text-[9px] text-slate-500 block">{pews.pewsRiskCategory.replace(/_/g, " ")}</span>
            </div>

            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Oxygenation Index (OI)</span>
              <span className={"text-xl font-black " + (oi.oxygenationIndexOI >= 16 ? "text-rose-400" : "text-cyan-300")}>
                {oi.oxygenationIndexOI}
              </span>
              <span className="text-[9px] text-slate-500 block">{oi.pardsClassification.replace(/_/g, " ")}</span>
            </div>
          </div>

          {/* Section 1: Patient Biometrics & PALS Dosing Matrix */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase text-pink-400 border-b border-slate-800 pb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              PALS Emergency Resuscitation Dosing Matrix
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Child Weight (kg):</label>
                <input
                  type="number"
                  step={0.1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-pink-400 font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Age (Years):</label>
                <input
                  type="number"
                  step={0.5}
                  value={ageYears}
                  onChange={(e) => setAgeYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Defib Initial (2 J/kg):</label>
                <span className="text-sm font-bold text-amber-300 font-mono block p-1.5 bg-slate-950 rounded border border-slate-800">
                  {pals.defibrillationInitialJoules} Joules
                </span>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">20 mL/kg Saline Bolus:</label>
                <span className="text-sm font-bold text-cyan-300 font-mono block p-1.5 bg-slate-950 rounded border border-slate-800">
                  {pals.isotonicSalineBolus20MlKg} mL
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Pediatric Early Warning Score (PEWS) */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase text-pink-400 border-b border-slate-800 pb-1">
              Pediatric Early Warning Score (PEWS) Component Breakdown
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Behavior (0-3):</label>
                <select
                  value={behavior}
                  onChange={(e) => setBehavior(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200"
                >
                  <option value={0}>0 - Playing / Appropriate</option>
                  <option value={1}>1 - Sleeping / Irritable</option>
                  <option value={2}>2 - Inconsolable / Lethargic</option>
                  <option value={3}>3 - Reduced Consciousness / Stupor</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Cardiovascular (0-3):</label>
                <select
                  value={cardio}
                  onChange={(e) => setCardio(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200"
                >
                  <option value={0}>0 - Pink / CRT 1-2 sec</option>
                  <option value={1}>1 - Pale / CRT 3 sec</option>
                  <option value={2}>2 - Grey / CRT 4 sec / Tachycardia</option>
                  <option value={3}>3 - Cyanotic / Mottled / CRT &gt;5 sec</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Respiratory (0-3):</label>
                <select
                  value={resp}
                  onChange={(e) => setResp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-200"
                >
                  <option value={0}>0 - Normal / No retractions</option>
                  <option value={1}>1 - Mild retractions / Tachypnea +10</option>
                  <option value={2}>2 - Moderate retractions / Tachypnea +20</option>
                  <option value={3}>3 - Severe retractions / Grunting / Stridor</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AHA PALS Guidelines & PALICC Pediatric ARDS Consensus</span>
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

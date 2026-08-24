import React, { useState } from "react";
import {
  X,
  Sliders,
  Flame,
  Activity,
  Heart,
  RotateCcw,
  Zap,
  Calculator,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { CardiovascularTelemetryService } from "../../../services/CardiovascularTelemetryService";

interface CardioHemodynamicCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardioHemodynamicCalculatorModal: React.FC<CardioHemodynamicCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  // Inputs
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(80);
  const [sbp, setSbp] = useState(94);
  const [dbp, setDbp] = useState(62);
  const [hr, setHr] = useState(105);
  const [co, setCo] = useState(4.2);
  const [cvp, setCvp] = useState(12);
  const [pas, setPas] = useState(36);
  const [pad, setPad] = useState(18);
  const [pcwp, setPcwp] = useState(16);

  // Vasoactives
  const [epi, setEpi] = useState(0.04);
  const [norepi, setNorepi] = useState(0.08);
  const [vaso, setVaso] = useState(0.03);
  const [dobut, setDobut] = useState(2.5);
  const [milr, setMilr] = useState(0.0);
  const [dopa, setDopa] = useState(0.0);

  // ECMO
  const [p1Pre, setP1Pre] = useState(220);
  const [p2Post, setP2Post] = useState(175);
  const [lowerSpO2, setLowerSpO2] = useState(99);
  const [rightRadialSpO2, setRightRadialSpO2] = useState(84);

  if (!isOpen) return null;

  // Real-time Calculations
  const bsa = CardiovascularTelemetryService.calculateBSA(heightCm, weightKg);
  const map = CardiovascularTelemetryService.calculateMAP(sbp, dbp);
  const pp = CardiovascularTelemetryService.calculatePulsePressure(sbp, dbp);
  const ci = CardiovascularTelemetryService.calculateCardiacIndex(co, bsa);
  const sv = CardiovascularTelemetryService.calculateStrokeVolume(co, hr);
  const svi = CardiovascularTelemetryService.calculateSVI(sv, bsa);
  const cpo = CardiovascularTelemetryService.calculateCPO(map, co);
  const cpi = CardiovascularTelemetryService.calculateCPI(cpo, bsa);
  const svr = CardiovascularTelemetryService.calculateSVR(map, cvp, co);
  const svri = Math.round(svr * bsa);
  const mpap = Math.round((pas + 2 * pad) / 3);
  const pvr = CardiovascularTelemetryService.calculatePVR(mpap, pcwp, co);
  const pvri = Number((pvr * bsa).toFixed(2));
  const papi = CardiovascularTelemetryService.calculatePAPi(pas, pad, cvp);
  const lvswi = CardiovascularTelemetryService.calculateLVSWI(svi, map, pcwp);
  const rvswi = CardiovascularTelemetryService.calculateRVSWI(svi, mpap, cvp);
  const tpg = CardiovascularTelemetryService.calculateTranspulmonaryGradient(mpap, pcwp);
  const dpg = CardiovascularTelemetryService.calculateDiastolicPulmonaryGradient(pad, pcwp);
  const si = CardiovascularTelemetryService.calculateShockIndex(hr, sbp);
  const vis = CardiovascularTelemetryService.calculateVIS({
    epinephrineMcgKgMin: epi,
    norepinephrineMcgKgMin: norepi,
    vasopressinUnitsMin: vaso,
    dobutamineMcgKgMin: dobut,
    milrinoneMcgKgMin: milr,
    dopamineMcgKgMin: dopa
  });
  const tmp = CardiovascularTelemetryService.calculateTransmembranePressure(p1Pre, p2Post);
  const harlequinDelta = CardiovascularTelemetryService.calculateHarlequinDelta(lowerSpO2, rightRadialSpO2);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Cardiovascular Hemodynamics & MCS Clinical Calculator
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Real-Time CPO, SVR, PAPi, LVSWI, VIS & Oxygenator TMP Gradient Solver
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calculator Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto max-h-[80vh]">
          {/* Left Column: Interactive Parameters (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Demographics */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <h3 className="font-bold text-white uppercase text-[11px] flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" /> Patient Morphology
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Calculated BSA</label>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-cyan-300 font-bold">
                    {bsa} m²
                  </div>
                </div>
              </div>
            </div>

            {/* Invasives */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <h3 className="font-bold text-white uppercase text-[11px] flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> Invasive Pressures & Flow
              </h3>
              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">SBP</label>
                  <input
                    type="number"
                    value={sbp}
                    onChange={(e) => setSbp(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">DBP</label>
                  <input
                    type="number"
                    value={dbp}
                    onChange={(e) => setDbp(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">HR</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={(e) => setHr(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">CO (L/min)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={co}
                    onChange={(e) => setCo(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">CVP</label>
                  <input
                    type="number"
                    value={cvp}
                    onChange={(e) => setCvp(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">PAS</label>
                  <input
                    type="number"
                    value={pas}
                    onChange={(e) => setPas(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">PAD</label>
                  <input
                    type="number"
                    value={pad}
                    onChange={(e) => setPad(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">PCWP</label>
                  <input
                    type="number"
                    value={pcwp}
                    onChange={(e) => setPcwp(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Vasoactives & Inotropes */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <h3 className="font-bold text-white uppercase text-[11px] flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-violet-400" /> Vasoactives (VIS Score)
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Epi</label>
                  <input
                    type="number"
                    step="0.01"
                    value={epi}
                    onChange={(e) => setEpi(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Norepi</label>
                  <input
                    type="number"
                    step="0.01"
                    value={norepi}
                    onChange={(e) => setNorepi(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Vaso</label>
                  <input
                    type="number"
                    step="0.01"
                    value={vaso}
                    onChange={(e) => setVaso(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Dobut</label>
                  <input
                    type="number"
                    step="0.5"
                    value={dobut}
                    onChange={(e) => setDobut(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Milr</label>
                  <input
                    type="number"
                    step="0.05"
                    value={milr}
                    onChange={(e) => setMilr(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 text-[10px]">Dopa</label>
                  <input
                    type="number"
                    step="1"
                    value={dopa}
                    onChange={(e) => setDopa(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white"
                  />
                </div>
              </div>
            </div>

            {/* ECMO Circuit Indices */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
              <h3 className="font-bold text-white uppercase text-[11px] flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> ECMO TMP & Harlequin Parameters
              </h3>
              <div className="grid grid-cols-4 gap-2.5">
                <div>
                  <label className="text-slate-400 block mb-1">P1 Pre-Mem</label>
                  <input
                    type="number"
                    value={p1Pre}
                    onChange={(e) => setP1Pre(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">P2 Post-Mem</label>
                  <input
                    type="number"
                    value={p2Post}
                    onChange={(e) => setP2Post(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Rt Radial SpO2</label>
                  <input
                    type="number"
                    value={rightRadialSpO2}
                    onChange={(e) => setRightRadialSpO2(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Lower Leg SpO2</label>
                  <input
                    type="number"
                    value={lowerSpO2}
                    onChange={(e) => setLowerSpO2(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-1.5 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Computed Output Console (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Calculated Hemodynamics</span>
                <span className="text-cyan-400 text-[10px]">Real-Time Solved</span>
              </h3>

              {/* Primary Highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">CARDIAC POWER (CPO)</span>
                  <span className={`text-xl font-black ${cpo < 0.6 ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                    {cpo} Watts
                  </span>
                  <span className="text-[10px] text-slate-500 block">Target &gt; 0.60 W</span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">RV PAPi INDEX</span>
                  <span className={`text-xl font-black ${papi < 0.9 ? "text-amber-400" : "text-cyan-300"}`}>
                    {papi}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Normal &gt; 1.0</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">SYSTEMIC VASC RES (SVR)</span>
                  <span className="text-lg font-black text-white">{svr}</span>
                  <span className="text-[10px] text-slate-500 block">dynes·s/cm⁵ (SVRI: {svri})</span>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">PULMONARY VASC (PVR)</span>
                  <span className="text-lg font-black text-white">{pvr} WU</span>
                  <span className="text-[10px] text-slate-500 block">Wood Units (PVRI: {pvri})</span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-2 text-xs pt-2 border-t border-slate-900">
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Mean Arterial Pressure (MAP):</span>
                  <span className="font-bold text-white">{map} mmHg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Cardiac Index (CI):</span>
                  <span className="font-bold text-cyan-300">{ci} L/min/m²</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">LV Stroke Work Index (LVSWI):</span>
                  <span className="font-bold text-white">{lvswi} g·m/m²</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">RV Stroke Work Index (RVSWI):</span>
                  <span className="font-bold text-white">{rvswi} g·m/m²</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Transpulmonary Gradient (TPG):</span>
                  <span className="font-bold text-white">{tpg} mmHg</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Vasoactive-Inotropic Score (VIS):</span>
                  <span className="font-bold text-violet-300">{vis}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">ECMO TMP ΔP (Clotting Gradient):</span>
                  <span className={`font-black ${tmp >= 50 ? "text-amber-400" : "text-emerald-400"}`}>
                    {tmp} mmHg
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Harlequin Differential Δ SpO2:</span>
                  <span className={`font-black ${harlequinDelta >= 10 ? "text-rose-400" : "text-slate-300"}`}>
                    {harlequinDelta}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/30"
          >
            Close Calculator
          </button>
        </div>
      </div>
    </div>
  );
};

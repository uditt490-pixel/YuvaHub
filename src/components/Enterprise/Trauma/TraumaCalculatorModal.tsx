import React, { useState } from "react";
import { X, Activity, Calculator, RefreshCw, AlertCircle, HeartCrack, Layers } from "lucide-react";
import { TraumaTelemetryService } from "../../../services/TraumaTelemetryService";

interface TraumaCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TraumaCalculatorModal: React.FC<TraumaCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [age, setAge] = useState<number>(34);
  const [hr, setHr] = useState<number>(130);
  const [sbp, setSbp] = useState<number>(80);
  const [rr, setRr] = useState<number>(28);
  const [gcs, setGcs] = useState<number>(8);
  const [isPenetrating, setIsPenetrating] = useState<boolean>(true);
  const [isFastPositive, setIsFastPositive] = useState<boolean>(true);
  const [hb, setHb] = useState<number>(7.2);
  const [baseDeficit, setBaseDeficit] = useState<number>(9.0);
  const [tempC, setTempC] = useState<number>(34.4);
  const [ph, setPh] = useState<number>(7.15);
  const [inr, setInr] = useState<number>(1.75);
  const [pltK, setPltK] = useState<number>(85);

  // AIS regions for ISS
  const [aisHead, setAisHead] = useState<number>(2);
  const [aisFace, setAisFace] = useState<number>(1);
  const [aisChest, setAisChest] = useState<number>(3);
  const [aisAbdomen, setAisAbdomen] = useState<number>(5);
  const [aisExtremities, setAisExtremities] = useState<number>(4);
  const [aisExternal, setAisExternal] = useState<number>(0);

  if (!isOpen) return null;

  // Real-time calculations
  const shockIndex = TraumaTelemetryService.calculateShockIndex(hr, sbp);
  const ageSi = TraumaTelemetryService.calculateAgeAdjustedShockIndex(age, hr, sbp);
  const rsig = TraumaTelemetryService.calculateReverseShockIndexGcs(sbp, hr, gcs);
  const abcScore = TraumaTelemetryService.calculateAbcScore(isPenetrating, sbp, hr, isFastPositive);
  const rts = TraumaTelemetryService.calculateRevisedTraumaScore(gcs, sbp, rr);
  const issRes = TraumaTelemetryService.calculateIss({
    headNeck: aisHead,
    face: aisFace,
    chest: aisChest,
    abdomenPelvis: aisAbdomen,
    extremitiesPelvicGirdle: aisExtremities,
    externalBurns: aisExternal
  });
  const tashScore = TraumaTelemetryService.calculateTashScore(
    sbp,
    hb,
    isFastPositive,
    aisExtremities >= 4,
    aisExtremities >= 3,
    hr,
    baseDeficit
  );
  const lethalTriad = TraumaTelemetryService.calculateLethalTriad(tempC, ph, baseDeficit, inr, pltK);

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
                Clinical Trauma Resuscitation Calculator & Scores Solver
              </h2>
              <p className="text-xs text-slate-400">
                Evidence-Based Mathematical Scoring Engines: SI • rSIG • ABC Score • RTS • ISS • TASH • Lethal Triad
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
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Shock Index (SI)</span>
              <span className={"text-xl font-black " + (shockIndex >= 1.2 ? "text-rose-400" : "text-cyan-300")}>{shockIndex}</span>
              <span className="text-[9px] text-slate-500 block">&gt;0.9 shock • &gt;1.2 STAT MTP</span>
            </div>

            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">rSIG Score</span>
              <span className={"text-xl font-black " + (rsig < 10.0 ? "text-rose-400" : "text-emerald-400")}>{rsig}</span>
              <span className="text-[9px] text-slate-500 block">&lt;10 critical instability</span>
            </div>

            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">ABC Score</span>
              <span className={"text-xl font-black " + (abcScore >= 2 ? "text-rose-400" : "text-amber-300")}>{abcScore} / 4</span>
              <span className="text-[9px] text-slate-500 block">&gt;=2 triggers MTP</span>
            </div>

            <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Injury Severity (ISS)</span>
              <span className="text-xl font-black text-violet-400">{issRes.score} / 75</span>
              <span className="text-[9px] text-slate-500 block">{issRes.category.replace(/_/g, " ")}</span>
            </div>
          </div>

          {/* Lethal Triad & TASH Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lethal Triad Status Card */}
            <div className={"p-3.5 rounded-xl border " + (lethalTriad.triadCount >= 2 ? "bg-rose-950/40 border-rose-600" : "bg-slate-950/60 border-slate-800")}>
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs font-black uppercase text-rose-400 flex items-center gap-1.5">
                  <HeartCrack className="w-4 h-4 text-rose-500" />
                  Lethal Triad Index: {lethalTriad.triadCount} / 3 Components
                </h4>
                <span className="text-xs font-mono font-black text-rose-300">
                  {lethalTriad.mortalityRiskPercent}% Predicted Mortality
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-mono text-center">
                <div className={"p-1.5 rounded " + (lethalTriad.hypothermiaPresent ? "bg-rose-900/80 text-white font-bold" : "bg-slate-900 text-slate-500")}>
                  Hypothermia (&lt;35°C): {tempC}°C
                </div>
                <div className={"p-1.5 rounded " + (lethalTriad.acidosisPresent ? "bg-rose-900/80 text-white font-bold" : "bg-slate-900 text-slate-500")}>
                  Acidosis (pH&lt;7.20 / BD&gt;6): pH {ph}
                </div>
                <div className={"p-1.5 rounded " + (lethalTriad.coagulopathyPresent ? "bg-rose-900/80 text-white font-bold" : "bg-slate-900 text-slate-500")}>
                  Coagulopathy (INR&gt;1.5): INR {inr}
                </div>
              </div>
            </div>

            {/* TASH Score Card */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs font-black uppercase text-amber-400">
                  TASH Score: {tashScore} Points
                </h4>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {tashScore >= 16 ? "> 50% MTP Probability" : tashScore >= 9 ? "20-50% MTP Probability" : "< 10% Probability"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Trauma-Associated Severe Hemorrhage: High validation accuracy for massive bleeding in polytrauma.
              </p>
            </div>
          </div>

          {/* Form Inputs: Physiological Parameters */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase text-cyan-400 border-b border-slate-800 pb-1">
              Physiological Variables & Triage Vitals
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Age (Years):</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Heart Rate (bpm):</label>
                <input
                  type="number"
                  value={hr}
                  onChange={(e) => setHr(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-rose-400 font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Systolic BP (mmHg):</label>
                <input
                  type="number"
                  value={sbp}
                  onChange={(e) => setSbp(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-rose-400 font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Respiratory Rate:</label>
                <input
                  type="number"
                  value={rr}
                  onChange={(e) => setRr(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">GCS Score (3-15):</label>
                <input
                  type="number"
                  min={3}
                  max={15}
                  value={gcs}
                  onChange={(e) => setGcs(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-amber-300 font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Hemoglobin (g/dL):</label>
                <input
                  type="number"
                  step={0.1}
                  value={hb}
                  onChange={(e) => setHb(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Base Deficit (mEq/L):</label>
                <input
                  type="number"
                  step={0.1}
                  value={baseDeficit}
                  onChange={(e) => setBaseDeficit(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-rose-400 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block font-bold">Core Temp (°C):</label>
                <input
                  type="number"
                  step={0.1}
                  value={tempC}
                  onChange={(e) => setTempC(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPenetrating}
                  onChange={(e) => setIsPenetrating(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-0"
                />
                <span className="font-bold text-slate-200">Penetrating Mechanism (GSW / Stab)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFastPositive}
                  onChange={(e) => setIsFastPositive(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-0"
                />
                <span className="font-bold text-slate-200">Positive eFAST Exam (Free Fluid)</span>
              </label>
            </div>
          </div>

          {/* Abbreviated Injury Scale (AIS) Matrix for ISS */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase text-cyan-400 border-b border-slate-800 pb-1">
              Abbreviated Injury Scale (AIS 0-6) by Body Region
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono">
              <div>
                <label className="text-[10px] text-slate-400 block">Head / Neck:</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={aisHead}
                  onChange={(e) => setAisHead(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Face:</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={aisFace}
                  onChange={(e) => setAisFace(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Chest / Thorax:</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={aisChest}
                  onChange={(e) => setAisChest(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Abdomen / Pelvis:</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={aisAbdomen}
                  onChange={(e) => setAisAbdomen(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">Extremities / Girdle:</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={aisExtremities}
                  onChange={(e) => setAisExtremities(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block">External / Burns:</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={aisExternal}
                  onChange={(e) => setAisExternal(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-center font-bold text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>ATLS 10th Edition & Cochrane Trauma Guidelines</span>
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

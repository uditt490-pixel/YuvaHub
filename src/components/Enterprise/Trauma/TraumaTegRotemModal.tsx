import React, { useState } from "react";
import { X, Layers, Droplet, Activity, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { TraumaTelemetryService } from "../../../services/TraumaTelemetryService";

interface TraumaTegRotemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TraumaTegRotemModal: React.FC<TraumaTegRotemModalProps> = ({
  isOpen,
  onClose
}) => {
  const [rTime, setRTime] = useState<number>(12.4);
  const [kTime, setKTime] = useState<number>(4.2);
  const [alphaAngle, setAlphaAngle] = useState<number>(46.0);
  const [ma, setMa] = useState<number>(41.5);
  const [ly30, setLy30] = useState<number>(8.2);

  if (!isOpen) return null;

  const evaluation = TraumaTelemetryService.interpretTegRotem(rTime, kTime, alphaAngle, ma, ly30);

  const getInterventionBadge = (interv: string) => {
    switch (interv) {
      case "ADMINISTER_TXA_HYPERFIBRINOLYSIS":
        return { text: "CRITICAL: Administer Tranexamic Acid (TXA 1g IV Bolus)", color: "bg-rose-600 text-white" };
      case "COMBINED_COAGULOPATHY":
        return { text: "COMBINED COAGULOPATHY: FFP + Cryoprecipitate + Platelets STAT", color: "bg-red-600 text-white" };
      case "ADMINISTER_CRYOPRECIPITATE":
        return { text: "HYPOFIBRINOGENEMIA: Administer Cryoprecipitate (2 Pools / 10 Units)", color: "bg-amber-600 text-white" };
      case "ADMINISTER_FFP_PCC":
        return { text: "FACTOR DEFICIT: Administer Fresh Frozen Plasma (FFP 4 Units) or PCC", color: "bg-cyan-600 text-white" };
      case "ADMINISTER_PLATELETS":
        return { text: "THROMBOCYTOPENIA/DYSFUNCTION: Transfuse Apheresis Platelets (1 Unit)", color: "bg-violet-600 text-white" };
      default:
        return { text: "HEMOSTASIS NORMAL: Continue Targeted Monitoring", color: "bg-emerald-600 text-white" };
    }
  };

  const badge = getInterventionBadge(evaluation.intervention);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">
                Viscoelastic Thromboelastography (TEG 6s & ROTEM Delta) Analyzer
              </h2>
              <p className="text-xs text-slate-400">
                Real-Time Whole Blood Hemostasis • Coagulation Factors • Fibrinogen • Platelets • Hyperfibrinolysis (LY30)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Target Action Banner */}
          <div className={"p-3.5 rounded-xl font-bold flex items-center gap-3 shadow-md " + badge.color}>
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <div className="text-xs uppercase font-black tracking-wide">Targeted Clinical Protocol:</div>
              <div className="text-sm font-black">{badge.text}</div>
            </div>
          </div>

          {/* Graphical TEG / ROTEM Visualizer Curve Simulation */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 font-bold uppercase">Simulated TEG Thromboelastogram Trace:</span>
              <span className="text-cyan-400 font-bold">R: {rTime}m • K: {kTime}m • α: {alphaAngle}° • MA: {ma}mm • LY30: {ly30}%</span>
            </div>

            <div className="h-32 bg-slate-900/90 rounded-lg border border-slate-800 relative flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                {/* Center Baseline */}
                <line x1="0" y1="60" x2="500" y2="60" stroke="#334155" strokeWidth="1" strokeDasharray="4" />

                {/* Upper Clot Envelope */}
                <path
                  d={`M 0 60 L ${rTime * 6} 60 Q ${rTime * 6 + kTime * 10} ${60 - ma * 0.7} 250 ${60 - ma * 0.7} Q 380 ${60 - (ma * 0.7 * (1 - ly30 / 100))} 500 ${60 - (ma * 0.7 * (1 - ly30 / 100))}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                />

                {/* Lower Clot Envelope */}
                <path
                  d={`M 0 60 L ${rTime * 6} 60 Q ${rTime * 6 + kTime * 10} ${60 + ma * 0.7} 250 ${60 + ma * 0.7} Q 380 ${60 + (ma * 0.7 * (1 - ly30 / 100))} 500 ${60 + (ma * 0.7 * (1 - ly30 / 100))}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                />

                {/* Shaded Clot Area */}
                <path
                  d={`M 0 60 L ${rTime * 6} 60 Q ${rTime * 6 + kTime * 10} ${60 - ma * 0.7} 250 ${60 - ma * 0.7} Q 380 ${60 - (ma * 0.7 * (1 - ly30 / 100))} 500 ${60 - (ma * 0.7 * (1 - ly30 / 100))} L 500 ${60 + (ma * 0.7 * (1 - ly30 / 100))} Q 380 ${60 + (ma * 0.7 * (1 - ly30 / 100))} 250 ${60 + ma * 0.7} Q ${rTime * 6 + kTime * 10} ${60 + ma * 0.7} ${rTime * 6} 60 Z`}
                  fill="rgba(56, 189, 248, 0.15)"
                />
              </svg>
            </div>
          </div>

          {/* Interactive Parameter Sliders & Diagnostics */}
          <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="font-mono text-xs font-bold uppercase text-amber-400">
              Interactive Parameter Matrix
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* R-Time Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">R-Time (Enzymatic Clotting Factors):</span>
                  <span className={"font-bold " + (rTime > 10.0 ? "text-rose-400" : "text-emerald-400")}>{rTime} min (Ref 5-10m)</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={25}
                  step={0.1}
                  value={rTime}
                  onChange={(e) => setRTime(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* K-Time Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">K-Time (Fibrinogen Kinetics):</span>
                  <span className={"font-bold " + (kTime > 3.0 ? "text-rose-400" : "text-emerald-400")}>{kTime} min (Ref 1-3m)</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.1}
                  value={kTime}
                  onChange={(e) => setKTime(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              {/* Alpha Angle Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Alpha Angle (Fibrin Crosslinking Rate):</span>
                  <span className={"font-bold " + (alphaAngle < 53.0 ? "text-rose-400" : "text-emerald-400")}>{alphaAngle}° (Ref 53-72°)</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={85}
                  step={0.5}
                  value={alphaAngle}
                  onChange={(e) => setAlphaAngle(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              {/* MA Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Maximum Amplitude MA (Platelet Function):</span>
                  <span className={"font-bold " + (ma < 50.0 ? "text-rose-400" : "text-emerald-400")}>{ma} mm (Ref 50-70mm)</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={80}
                  step={0.5}
                  value={ma}
                  onChange={(e) => setMa(Number(e.target.value))}
                  className="w-full accent-violet-400"
                />
              </div>

              {/* LY30 Slider */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">LY30 % (Clot Lysis at 30 min / Fibrinolysis):</span>
                  <span className={"font-bold " + (ly30 > 3.0 ? "text-rose-400 animate-pulse" : "text-emerald-400")}>{ly30}% (Ref 0-3%)</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={0.1}
                  value={ly30}
                  onChange={(e) => setLy30(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
              <span className="text-slate-400 font-bold block mb-1">Diagnostic Interpretation:</span>
              <p className="text-slate-200">{evaluation.interpretation}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>ROTEM / TEG Trauma Guidelines (ESAIC & TCCC Endorsed)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-bold cursor-pointer"
          >
            Close Analyzer
          </button>
        </div>
      </div>
    </div>
  );
};

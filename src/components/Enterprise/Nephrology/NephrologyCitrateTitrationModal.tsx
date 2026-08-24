import React, { useState } from "react";
import { X, Sliders, AlertTriangle, ShieldCheck, CheckCircle2, Activity } from "lucide-react";
import { NephrologyTelemetryService } from "../../../services/NephrologyTelemetryService";

interface NephrologyCitrateTitrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NephrologyCitrateTitrationModal: React.FC<NephrologyCitrateTitrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [bloodFlowQb, setBloodFlowQb] = useState<number>(200);
  const [postFilterIca, setPostFilterIca] = useState<number>(0.32);
  const [systemicIca, setSystemicIca] = useState<number>(1.15);
  const [totalSerumCa, setTotalSerumCa] = useState<number>(2.30);
  const [caclRateMlHr, setCaclRateMlHr] = useState<number>(35);

  if (!isOpen) return null;

  const toxicityEval = NephrologyTelemetryService.evaluateCitrateToxicity(totalSerumCa, systemicIca);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">
                Regional Citrate Anticoagulation (RCA) Protocol Titrator
              </h2>
              <p className="text-xs text-slate-400">
                Post-Filter Ionized Calcium Titration • Systemic Calcium Chloride Infusion • Citrate Accumulation Monitoring
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
          <div className={"p-3.5 rounded-xl font-bold flex items-center gap-3 shadow-md " + (toxicityEval.isToxicitySuspected ? "bg-rose-950/80 border border-rose-600 text-rose-200" : "bg-emerald-950/80 border border-emerald-600 text-emerald-200")}>
            {toxicityEval.isToxicitySuspected ? <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" /> : <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400" />}
            <div>
              <div className="text-xs uppercase font-black tracking-wide">Citrate Accumulation Diagnostic Status:</div>
              <div className="text-xs font-mono mt-0.5">{toxicityEval.recommendation}</div>
            </div>
          </div>

          {/* Interactive Parameters Sliders */}
          <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="font-mono text-xs font-bold uppercase text-amber-400">
              Interactive Citrate RCA Titration Matrix
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
              {/* Post-Filter iCa */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Post-Filter Ionized Ca2+:</span>
                  <span className={"font-bold " + (postFilterIca >= 0.25 && postFilterIca <= 0.35 ? "text-emerald-400" : "text-rose-400")}>
                    {postFilterIca} mmol/L (Target: 0.25 - 0.35)
                  </span>
                </div>
                <input
                  type="range"
                  min={0.15}
                  max={0.60}
                  step={0.01}
                  value={postFilterIca}
                  onChange={(e) => setPostFilterIca(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Systemic iCa */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Systemic Ionized Ca2+:</span>
                  <span className={"font-bold " + (systemicIca >= 1.10 && systemicIca <= 1.30 ? "text-emerald-400" : "text-rose-400")}>
                    {systemicIca} mmol/L (Target: 1.10 - 1.30)
                  </span>
                </div>
                <input
                  type="range"
                  min={0.70}
                  max={1.60}
                  step={0.01}
                  value={systemicIca}
                  onChange={(e) => setSystemicIca(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              {/* Total Serum Calcium */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Serum Calcium:</span>
                  <span className="font-bold text-slate-200">{totalSerumCa} mmol/L (Ref: 2.15 - 2.55)</span>
                </div>
                <input
                  type="range"
                  min={1.50}
                  max={3.50}
                  step={0.05}
                  value={totalSerumCa}
                  onChange={(e) => setTotalSerumCa(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              {/* Total / iCa Ratio */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Ca / Ionized Ca Ratio:</span>
                  <span className={"font-bold " + (toxicityEval.ratio >= 2.5 ? "text-rose-400 animate-pulse font-black" : "text-emerald-400")}>
                    {toxicityEval.ratio} (&gt;= 2.5 Toxicity Alarm)
                  </span>
                </div>
                <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative mt-2">
                  <div
                    className={"h-full transition-all " + (toxicityEval.ratio >= 2.5 ? "bg-rose-500" : "bg-emerald-500")}
                    style={{ width: `${Math.min(100, (toxicityEval.ratio / 3.0) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Regional Citrate Protocols (KDIGO & ADQI Consensus)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-bold cursor-pointer"
          >
            Close Titrator
          </button>
        </div>
      </div>
    </div>
  );
};

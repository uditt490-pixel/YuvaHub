import React, { useState } from "react";
import {
  X,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Droplets,
  ShieldAlert,
  Zap
} from "lucide-react";
import { CrrtPatient } from "../../../types/crrtTelemetry";

interface CrrtFilterClottingAlertModalProps {
  patient: CrrtPatient;
  isOpen: boolean;
  onClose: () => void;
  onResolveAlert: (patientId: string, actionType: string) => void;
}

export const CrrtFilterClottingAlertModal: React.FC<CrrtFilterClottingAlertModalProps> = ({
  patient,
  isOpen,
  onClose,
  onResolveAlert
}) => {
  const [selectedAction, setSelectedAction] = useState("INCREASE_PRE_DILUTION");
  const [salineFlushVolume, setSalineFlushVolume] = useState(100);
  const [resolvedSuccess, setResolvedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    onResolveAlert(patient.id, selectedAction);
    setResolvedSuccess(true);
    setTimeout(() => {
      setResolvedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Filter Clotting & TMP Escalation Console
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Bed: <span className="text-white font-semibold">{patient.name}</span> | Filter Age: {patient.hydraulics.filterLifeHours.toFixed(1)}h | TMP: <span className="text-rose-400 font-bold">{patient.hydraulics.transmembranePressureMmHg} mmHg</span>
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
        <form onSubmit={handleResolve} className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-xs">
          {resolvedSuccess ? (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-white">Circuit Intervention Dispatched</h3>
              <p className="text-xs text-slate-300">
                CRRT machine parameters adjusted. Hydraulic pressures re-calibrated.
              </p>
            </div>
          ) : (
            <>
              {/* Hydraulic Status Panel */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">TMP Pressure</span>
                  <div className="text-xl font-black text-rose-400 mt-0.5">{patient.hydraulics.transmembranePressureMmHg} mmHg</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Pressure Drop &Delta;P</span>
                  <div className="text-xl font-black text-amber-400 mt-0.5">{patient.hydraulics.filterPressureDropMmHg} mmHg</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Filtration Fraction</span>
                  <div className="text-xl font-black text-cyan-300 mt-0.5">{patient.hydraulics.filtrationFractionPercent}%</div>
                </div>
              </div>

              {/* Action Selection */}
              <div className="space-y-3">
                <label className="text-slate-400 font-bold uppercase text-[10px] block">
                  Select Immediate Clinical Intervention:
                </label>
                <div className="space-y-2">
                  {[
                    { id: "INCREASE_PRE_DILUTION", title: "Shift Replacement Fluid to 100% Pre-Dilution", desc: "Decreases hematocrit and blood viscosity within hemofilter fibers." },
                    { id: "SALINE_FLUSH", title: "Perform Sterile 100 mL Normal Saline Flush", desc: "Dislodges early micro-fibrin deposits and assesses lumen patency." },
                    { id: "TITRATE_ANTICOAGULATION", title: "Titrate ACD-A Citrate / Heparin Dose Upwards", desc: "Lowers post-filter ionized calcium target to 0.25 mmol/L." },
                    { id: "ELECTIVE_CIRCUIT_CHANGE", title: "Elective Circuit Replacement (Scheduled Restart)", desc: "Safely return blood to patient before irreversible hemofilter clotting." }
                  ].map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => setSelectedAction(action.id)}
                      className={`w-full p-3.5 rounded-xl border text-left space-y-1 transition-all ${
                        selectedAction === action.id
                          ? "bg-amber-500/10 border-amber-500 text-white ring-1 ring-amber-500/50"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <h4 className="text-xs font-bold text-white">{action.title}</h4>
                      <p className="text-[11px] text-slate-400">{action.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-950/40 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Execute Filter Intervention
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

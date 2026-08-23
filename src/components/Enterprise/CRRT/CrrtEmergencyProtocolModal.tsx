import React, { useState } from "react";
import {
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  ShieldAlert,
  ShieldCheck
} from "lucide-react";
import { CrrtPatient } from "../../../types/crrtTelemetry";

interface CrrtEmergencyProtocolModalProps {
  patient: CrrtPatient;
  isOpen: boolean;
  onClose: () => void;
  onDispatchProtocol: (patientId: string, protocolName: string, orderInstructions: string) => void;
}

export const CrrtEmergencyProtocolModal: React.FC<CrrtEmergencyProtocolModalProps> = ({
  patient,
  isOpen,
  onClose,
  onDispatchProtocol
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState("HYPERKALEMIA_EMERGENCY");
  const [instructions, setInstructions] = useState("Switch to potassium-free replacement fluid; increase effluent dose to 35 mL/kg/h; administer IV calcium gluconate 2g.");
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatchProtocol(patient.id, selectedProtocol, instructions);
    setDispatchedSuccess(true);
    setTimeout(() => {
      setDispatchedSuccess(false);
      onClose();
    }, 1500);
  };

  const EMERGENCY_PROTOCOLS = [
    {
      id: "HYPERKALEMIA_EMERGENCY",
      title: "Refractory Hyperkalemia (K+ > 6.5 mmol/L) Protocol",
      desc: "Zero-potassium dialysate/replacement solution; maximal blood flow Q_b and effluent dose >= 35 mL/kg/h."
    },
    {
      id: "ACIDEMIA_RESCUE",
      title: "Severe Metabolic Acidemia (pH < 7.15, HCO3 < 12) Rescue",
      desc: "Isotonic bicarbonate dialysate bath; high-volume CVVHDF convection."
    },
    {
      id: "PULMONARY_EDEMA_UF",
      title: "Acute Pulmonary Edema / Refractory Fluid Overload",
      desc: "Aggressive Net Ultrafiltration (350 mL/h) with continuous MAP and CVP hemodynamic stability tracking."
    },
    {
      id: "CITRATE_LOCK_ANTIDOTE",
      title: "Citrate Toxicity / Citrate Lock Antidote Protocol",
      desc: "Immediate cessation of ACD-A infusion; 10% Calcium Chloride 10 mL IV push; high dialysate clearance."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Critical Care Nephrology Emergency Protocol Dispatcher
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Bed: <span className="text-white font-semibold">{patient.name}</span> | Modality: {patient.modality} | K+: {patient.metabolics.potassiumMmolL} mmol/L | Overload: {patient.metabolics.percentFluidOverload}%
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
        <form onSubmit={handleDispatch} className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-xs">
          {dispatchedSuccess ? (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-10 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-pulse" />
              <h3 className="text-xl font-black text-white">Emergency Renal Protocol Dispatched</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                ICU nephrology team, hemodialysis nursing staff, and blood bank notified immediately.
              </p>
            </div>
          ) : (
            <>
              {/* Protocol Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400 block">
                  Select Emergency Protocol:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EMERGENCY_PROTOCOLS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProtocol(p.id)}
                      className={`p-4 rounded-2xl border text-left space-y-1.5 transition-all ${
                        selectedProtocol === p.id
                          ? "bg-rose-500/10 border-rose-500 text-white ring-2 ring-rose-500/50"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <h4 className="text-xs font-bold text-white">{p.title}</h4>
                      <p className="text-[11px] text-slate-400">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Directives */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Clinical Directives & Medication Orders:
                </label>
                <textarea
                  rows={3}
                  required
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Submit Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-xl shadow-lg shadow-rose-950/40 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Dispatch Emergency Protocol
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

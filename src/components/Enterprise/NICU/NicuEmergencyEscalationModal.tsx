import React, { useState } from "react";
import {
  X,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Baby,
  Thermometer,
  Flame,
  Droplets,
  Activity
} from "lucide-react";
import { NicuPatient } from "../../../types/nicuTelemetry";

interface NicuEmergencyEscalationModalProps {
  patient: NicuPatient;
  isOpen: boolean;
  onClose: () => void;
  onDispatchEmergency: (patientId: string, protocolName: string, orders: string) => void;
}

export const NicuEmergencyEscalationModal: React.FC<NicuEmergencyEscalationModalProps> = ({
  patient,
  isOpen,
  onClose,
  onDispatchEmergency
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState("CODE_PINK_NRP");
  const [instructions, setInstructions] = useState("Initiate Positive Pressure Ventilation (PPV) with NeoPuff (PIP 20, PEEP 5); call Neonatal Resuscitation Team; prepare emergent UVC access.");
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    onDispatchEmergency(patient.id, selectedProtocol, instructions);
    setDispatchedSuccess(true);
    setTimeout(() => {
      setDispatchedSuccess(false);
      onClose();
    }, 1500);
  };

  const NRP_PROTOCOLS = [
    {
      id: "CODE_PINK_NRP",
      title: "Code Pink Neonatal Resuscitation (NRP 8th Edition)",
      desc: "Emergency resuscitation algorithm for severe bradycardia (<60 bpm), apnea, or cardiorespiratory arrest in the neonate."
    },
    {
      id: "INO_PPHN_ESCALATION",
      title: "Inhaled Nitric Oxide (iNO 20 ppm) & HFOV Escalation",
      desc: "Emergency pulmonary vasodilator therapy for persistent pulmonary hypertension with severe pre/post ductal shunting."
    },
    {
      id: "THERAPEUTIC_HYPOTHERMIA",
      title: "72-Hour Therapeutic Hypothermia (Target: 33.5°C)",
      desc: "Whole-body cooling initiation within 6-hour golden window for moderate-to-severe Hypoxic-Ischemic Encephalopathy (HIE)."
    },
    {
      id: "PROSTAGLANDIN_E1",
      title: "Prostaglandin E1 (Alprostadil 0.05 mcg/kg/min)",
      desc: "Maintenance of ductal patency for suspected duct-dependent congenital cardiac lesions (e.g. Coarctation, HLHS, TGA)."
    },
    {
      id: "SURFACTANT_LISA",
      title: "Emergency Surfactant Replacement (Poractant Alfa 200 mg/kg)",
      desc: "LISA / INSURE protocol for severe RDS with escalating oxygen requirements."
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
                NRP Neonatal Emergency Escalation & Resuscitation Dispatcher
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Neonate: <span className="text-white font-semibold">{patient.name}</span> | Bed: {patient.bedNumber} | Weight: {patient.currentWeightGrams}g | GA: {patient.gestationalAgeWeeks}w
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
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-xl font-black text-white">NRP Emergency Protocol Dispatched</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Neonatal code team, respiratory therapist, and NICU transport team mobilized to bedside.
              </p>
            </div>
          ) : (
            <>
              {/* Protocol Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase text-slate-400 block">
                  Select Neonatal Emergency Protocol:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {NRP_PROTOCOLS.map((p) => (
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
                  Dispatch NRP Protocol
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

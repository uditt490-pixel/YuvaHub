import React, { useState } from "react";
import { X, Zap, Flame, Droplet, Layers, Timer, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { TraumaPatient } from "../../../types/traumaTelemetry";

interface TraumaEmergencyEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: TraumaPatient | null;
  onDispatchProtocol: (
    patientId: string,
    protocolType: "CODE_TRAUMA_ALPHA" | "MTP_ROUND_DISPATCH" | "EMERGENT_OR_STAT" | "REBOA_DEPLOY" | "REBOA_DEFLATE" | "TXA_BOLUS_ORDER" | "TEG_GUIDED_CRYO",
    notes: string
  ) => void;
}

export const TraumaEmergencyEscalationModal: React.FC<TraumaEmergencyEscalationModalProps> = ({
  isOpen,
  onClose,
  patient,
  onDispatchProtocol
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<
    "CODE_TRAUMA_ALPHA" | "MTP_ROUND_DISPATCH" | "EMERGENT_OR_STAT" | "REBOA_DEPLOY" | "REBOA_DEFLATE" | "TXA_BOLUS_ORDER" | "TEG_GUIDED_CRYO"
  >("MTP_ROUND_DISPATCH");
  const [clinicianNotes, setClinicianNotes] = useState("Immediate activation for hemorrhagic shock resuscitation.");
  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen || !patient) return null;

  const handleDispatch = () => {
    onDispatchProtocol(patient.id, selectedProtocol, clinicianNotes);
    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      onClose();
    }, 1200);
  };

  const protocols = [
    {
      id: "MTP_ROUND_DISPATCH" as const,
      title: "Massive Transfusion Protocol (MTP) Cooler STAT Release",
      desc: "Dispatches Cooler with 6 units pRBC, 6 units FFP, 1 apheresis Platelet pack, and 1 Cryo pool under 1:1:1 ratio protocol.",
      icon: Droplet,
      color: "border-rose-500 text-rose-400 bg-rose-950/40"
    },
    {
      id: "CODE_TRAUMA_ALPHA" as const,
      title: "Declare CODE TRAUMA ALPHA (Level 1 Resuscitation)",
      desc: "Pagers trauma attending, surgical chief, anesthesia, blood bank team, respiratory therapy, and OR dispatch.",
      icon: Flame,
      color: "border-red-500 text-red-400 bg-red-950/40"
    },
    {
      id: "EMERGENT_OR_STAT" as const,
      title: "Emergency Damage Control OR Activation",
      desc: "Reserves Dedicated Trauma OR Suite for emergent thoracotomy, laparotomy, or packing within 5 minutes.",
      icon: ShieldAlert,
      color: "border-amber-500 text-amber-400 bg-amber-950/40"
    },
    {
      id: "REBOA_DEPLOY" as const,
      title: "Deploy & Occlude REBOA Aortic Balloon",
      desc: "Activates Zone 1 (Thoracic) or Zone 3 (Infrarenal) balloon occlusion with strict ischemia countdown clock.",
      icon: Timer,
      color: "border-violet-500 text-violet-400 bg-violet-950/40"
    },
    {
      id: "TXA_BOLUS_ORDER" as const,
      title: "CRASH-2 Tranexamic Acid (TXA) Protocol Order",
      desc: "Orders 1g IV TXA bolus over 10 minutes followed by 1g IV continuous infusion over 8 hours (within 3h window).",
      icon: Zap,
      color: "border-cyan-500 text-cyan-400 bg-cyan-950/40"
    },
    {
      id: "TEG_GUIDED_CRYO" as const,
      title: "TEG/ROTEM-Guided Cryoprecipitate Infusion (2 Pools)",
      desc: "STAT infusion of 2 pools (10 units) Cryoprecipitate for acute hypofibrinogenemia (Functional Fibrinogen MA < 15mm).",
      icon: Layers,
      color: "border-emerald-500 text-emerald-400 bg-emerald-950/40"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">
                Emergent Trauma Escalation Protocol
              </h2>
              <p className="text-xs text-slate-400">
                {patient.traumaBayNumber} • {patient.name} ({patient.mrn}) • Shock Index: {patient.scores.shockIndex}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Active Patient Snapshot */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">HR / SBP</span>
              <span className="text-rose-400 font-bold">{patient.vitals.heartRate} / {patient.vitals.systolicBp}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Shock Index</span>
              <span className="text-rose-400 font-bold">{patient.scores.shockIndex}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">ABC Score</span>
              <span className="text-amber-400 font-bold">{patient.scores.abcScore}/4</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Lethal Triad</span>
              <span className="text-red-400 font-bold">{patient.scores.lethalTriadIndex.triadCount}/3</span>
            </div>
          </div>

          {/* Protocol Selection Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Select Resuscitation Protocol to Dispatch:
            </label>
            <div className="space-y-2">
              {protocols.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedProtocol === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProtocol(p.id)}
                    className={"w-full text-left p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer " + (isSelected ? p.color + " ring-2 ring-offset-2 ring-offset-slate-900 ring-rose-500" : "bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300")}
                  >
                    <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs font-black uppercase tracking-wide text-white">{p.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinician Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              Physician Order Rationale / Emergency Notes:
            </label>
            <textarea
              value={clinicianNotes}
              onChange={(e) => setClinicianNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleDispatch}
            disabled={isDispatched}
            className={"px-5 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition shadow-lg flex items-center gap-2 cursor-pointer " + (isDispatched ? "bg-emerald-600 text-white" : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/80 active:scale-95")}
          >
            {isDispatched ? (
              <>
                <CheckCircle2 className="w-4 h-4 animate-spin" />
                Dispatching STAT Order...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                Authorize & Dispatch STAT
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

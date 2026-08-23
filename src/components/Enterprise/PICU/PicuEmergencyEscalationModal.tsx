import React, { useState } from "react";
import {
  X,
  Zap,
  Flame,
  AlertOctagon,
  Users,
  CheckCircle2,
  PhoneCall,
  Clock,
  ShieldAlert,
  Wind,
  Droplets,
  Heart
} from "lucide-react";
import { PicuPatient, EmergencyProtocolType } from "../../../types/picuTelemetry";

interface PicuEmergencyEscalationModalProps {
  patient: PicuPatient;
  isOpen: boolean;
  onClose: () => void;
  onDispatchProtocol: (patientId: string, protocol: EmergencyProtocolType, notes: string) => void;
}

export const PicuEmergencyEscalationModal: React.FC<PicuEmergencyEscalationModalProps> = ({
  patient,
  isOpen,
  onClose,
  onDispatchProtocol
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<EmergencyProtocolType>("PARDS_PRONING_ECMO_ACTIVATION");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  if (!isOpen) return null;

  const PROTOCOLS: Array<{
    id: EmergencyProtocolType;
    title: string;
    description: string;
    targetResponse: string;
    team: string[];
    icon: any;
    color: string;
  }> = [
    {
      id: "PEDIATRIC_CODE_BLUE",
      title: "Pediatric Code Blue (PALS Cardiopulmonary Arrest)",
      description: "Immediate bedside resuscitation team dispatch, defibrillator charge, CPR feedback puck & airway management.",
      targetResponse: "< 2 Minutes",
      team: ["Pediatric Intensivist", "PALS Team Leader", "Respiratory Therapist", "Code Pharmacist", "Charge RN"],
      icon: Flame,
      color: "border-rose-500 bg-rose-500/10 text-rose-300"
    },
    {
      id: "PARDS_PRONING_ECMO_ACTIVATION",
      title: "Severe PARDS Proning & ECMO Cannulation Protocol",
      description: "16-hour prone positioning cycle activation, neuromuscular blockade infusion, and ECMO cannulator circuit priming.",
      targetResponse: "< 15 Minutes",
      team: ["Pediatric ECMO Lead", "Perfusionist", "PICU Fellow", "Respiratory Specialist", "Surgical Cannulator"],
      icon: Wind,
      color: "border-sky-500 bg-sky-500/10 text-sky-300"
    },
    {
      id: "PEDIATRIC_SEPTIC_SHOCK_BUNDLE",
      title: "Pediatric Septic Shock 60-Minute Golden Hour",
      description: "Rapid crystalloid push (20 mL/kg), broad-spectrum IV antimicrobials within 60 mins, early vasoactive inotrope initiation.",
      targetResponse: "< 10 Minutes",
      team: ["Pediatric Intensivist", "Bedside PICU RN", "Vascular Access Specialist", "Microbiology Lab Tech"],
      icon: Zap,
      color: "border-amber-500 bg-amber-500/10 text-amber-300"
    },
    {
      id: "STATUS_ASTHMATICUS_ESCALATION",
      title: "Refractory Status Asthmaticus Protocol",
      description: "Continuous nebulized albuterol (15-20 mg/hr), IV Magnesium Sulfate (50 mg/kg), Terbutaline infusion, Heliox mix.",
      targetResponse: "< 10 Minutes",
      team: ["Respiratory Therapist", "Bedside PICU RN", "Pediatric Pulmonologist"],
      icon: Wind,
      color: "border-yellow-500 bg-yellow-500/10 text-yellow-300"
    },
    {
      id: "CRRT_EMERGENCY_INITIATION",
      title: "Emergency Continuous Renal Replacement (CRRT)",
      description: "Vascular catheter placement, Prismaflex / Continuous Veno-Venous Hemodiafiltration setup for fluid overload > 10-15%.",
      targetResponse: "< 30 Minutes",
      team: ["Pediatric Nephrologist", "Dialysis Specialized RN", "PICU Registrar"],
      icon: Droplets,
      color: "border-indigo-500 bg-indigo-500/10 text-indigo-300"
    },
    {
      id: "PEDIATRIC_DKA_PROTOCOL",
      title: "Pediatric DKA Protocol & Cerebral Edema Guard",
      description: "Two-Bag variable dextrose hydration system, IV regular insulin infusion 0.05-0.1 units/kg/hr, q1h neuro checks.",
      targetResponse: "< 15 Minutes",
      team: ["Pediatric Endocrinologist", "Bedside PICU RN", "Biochemist"],
      icon: Heart,
      color: "border-violet-500 bg-violet-500/10 text-violet-300"
    }
  ];

  const handleDispatch = () => {
    onDispatchProtocol(patient.id, selectedProtocol, clinicalNotes);
    setDispatchedSuccess(true);
    setTimeout(() => {
      setDispatchedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-400">
              <Zap className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                PALS Multidisciplinary Emergency Protocol Dispatch
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Target Patient: <span className="text-white font-semibold">{patient.name}</span> ({patient.bedNumber}, {patient.weightKg} kg)
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900">
          {dispatchedSuccess ? (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-10 text-center space-y-3">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-pulse" />
              <h3 className="text-xl font-black text-white">Emergency Protocol Dispatched to Bedside</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                PICU multidisciplinary teams alerted via hospital paging gateway. Target bedside arrival recorded.
              </p>
            </div>
          ) : (
            <>
              {/* Protocol Selector Grid */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Select High-Acuity Clinical Protocol:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PROTOCOLS.map((proto) => {
                    const Icon = proto.icon;
                    const isSelected = selectedProtocol === proto.id;
                    return (
                      <button
                        key={proto.id}
                        onClick={() => setSelectedProtocol(proto.id)}
                        className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? `${proto.color} ring-2 ring-cyan-400`
                            : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 shrink-0" />
                            <h4 className="text-xs font-bold text-white">{proto.title}</h4>
                          </div>
                          <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold rounded">
                            {proto.targetResponse}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{proto.description}</p>
                        <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1 text-[10px] text-slate-400">
                          <Users className="w-3 h-3" />
                          <span>Team: {proto.team.join(", ")}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Notes & Orders */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Bedside Orders & Specific Clinical Directives:
                </label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Enter specific titration targets, cannulation preferences, arterial line confirmations, or attending physician instructions..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Action Trigger Button */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Protocol activation is logged to the clinical audit trail.</span>
                </div>
                <button
                  onClick={handleDispatch}
                  className="px-6 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-2xl text-xs flex items-center gap-2 transition-all shadow-xl shadow-rose-950/50"
                >
                  <PhoneCall className="w-4 h-4" />
                  Dispatch Emergency Team
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

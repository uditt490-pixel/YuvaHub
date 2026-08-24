import React, { useState } from "react";
import { X, Zap, Activity, Baby, ShieldAlert, CheckCircle2, Flame, Sliders, Wind } from "lucide-react";
import { PicuPatient } from "../../../types/picuTelemetry";

interface PicuEmergencyEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PicuPatient | null;
  onDispatchProtocol: (
    patientId: string,
    protocolType: "PALS_CODE_BLUE_STAT" | "NEONATAL_D10W_BOLUS" | "INHALED_NITRIC_OXIDE_PPHN" | "HFOV_TRANSITION_RESCUE" | "ADENOSINE_SVT_RAPID_PUSH",
    notes: string
  ) => void;
}

export const PicuEmergencyEscalationModal: React.FC<PicuEmergencyEscalationModalProps> = ({
  isOpen,
  onClose,
  patient,
  onDispatchProtocol
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<
    "PALS_CODE_BLUE_STAT" | "NEONATAL_D10W_BOLUS" | "INHALED_NITRIC_OXIDE_PPHN" | "HFOV_TRANSITION_RESCUE" | "ADENOSINE_SVT_RAPID_PUSH"
  >("PALS_CODE_BLUE_STAT");
  const [clinicianNotes, setClinicianNotes] = useState("Immediate initiation of PALS resuscitation team.");
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
      id: "PALS_CODE_BLUE_STAT" as const,
      title: "PALS Code Blue (Cardiac / Respiratory Arrest)",
      desc: "STAT activation of Pediatric Resuscitation Team. Epinephrine (" + patient.palsDosing.epinephrineIvIoBolusMg + " mg IV/IO) + Defibrillator (" + patient.palsDosing.defibrillationInitialJoules + " J).",
      icon: Zap,
      color: "border-rose-500 text-rose-400 bg-rose-950/40"
    },
    {
      id: "INHALED_NITRIC_OXIDE_PPHN" as const,
      title: "STAT Inhaled Nitric Oxide (iNO 20 ppm) for PPHN",
      desc: "Emergency pulmonary selective vasodilation for suprasystemic pulmonary hypertension and severe pre/post ductal shunting.",
      icon: Wind,
      color: "border-cyan-500 text-cyan-400 bg-cyan-950/40"
    },
    {
      id: "ADENOSINE_SVT_RAPID_PUSH" as const,
      title: "STAT Adenosine Rapid IV Push for Pediatric SVT",
      desc: "Administer Adenosine (" + patient.palsDosing.adenosineFirstDoseMg + " mg IV) rapid push at AC fossa followed by 5 mL rapid NS flush.",
      icon: Flame,
      color: "border-amber-500 text-amber-400 bg-amber-950/40"
    },
    {
      id: "HFOV_TRANSITION_RESCUE" as const,
      title: "Emergency HFOV Oscillator Transition for Refractory PARDS",
      desc: "Rescue oscillatory ventilation with continuous lung recruitment for PALICC severe ARDS (OI > 16) or air leak syndromes.",
      icon: Activity,
      color: "border-purple-500 text-purple-400 bg-purple-950/40"
    },
    {
      id: "NEONATAL_D10W_BOLUS" as const,
      title: "STAT D10W Hypoglycemia Fluid Resuscitation Bolus",
      desc: "Administer 10% Dextrose (" + patient.palsDosing.d10WFluidBolusMl + " mL IV/IO over 5 min) followed by continuous GIR titration.",
      icon: Baby,
      color: "border-pink-500 text-pink-400 bg-pink-950/40"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <h2 className="text-base font-black font-mono uppercase text-white">
                Emergent PALS / NICU Escalation Dispatcher
              </h2>
              <p className="text-xs text-slate-400">
                {patient.bedIsoletteNumber} • {patient.name} ({patient.mrn}) • Wt: {patient.currentWeightKg}kg ({patient.palsDosing.broselowColor.replace(/_/g, " ")})
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Patient Quick Weight & Resus Ribbon */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">PALS Epinephrine</span>
              <span className="text-pink-400 font-bold">{patient.palsDosing.epinephrineIvIoBolusMg} mg</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Defib 2 J/kg</span>
              <span className="text-amber-400 font-bold">{patient.palsDosing.defibrillationInitialJoules} J</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">20 mL/kg Bolus</span>
              <span className="text-cyan-300 font-bold">{patient.palsDosing.isotonicSalineBolus20MlKg} mL</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">ETT Size Cuffed</span>
              <span className="text-emerald-400 font-bold">{patient.palsDosing.ettInternalDiameterCuffedMm} mm</span>
            </div>
          </div>

          {/* Protocol Selection Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Select Emergency Pediatric Protocol to Dispatch:
            </label>
            <div className="space-y-2">
              {protocols.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedProtocol === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProtocol(p.id)}
                    className={"w-full text-left p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer " + (isSelected ? p.color + " ring-2 ring-offset-2 ring-offset-slate-900 ring-pink-500" : "bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300")}
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
              Pediatric Attending Physician Rationale / Order Notes:
            </label>
            <textarea
              value={clinicianNotes}
              onChange={(e) => setClinicianNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-pink-500 font-mono"
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
            className={"px-5 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition shadow-lg flex items-center gap-2 cursor-pointer " + (isDispatched ? "bg-emerald-600 text-white" : "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-950/80 active:scale-95")}
          >
            {isDispatched ? (
              <>
                <CheckCircle2 className="w-4 h-4 animate-spin" />
                Dispatching PALS Team...
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

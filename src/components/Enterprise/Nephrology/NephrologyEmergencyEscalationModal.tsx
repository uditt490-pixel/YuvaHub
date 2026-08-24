import React, { useState } from "react";
import { X, Zap, Activity, Droplets, ShieldAlert, CheckCircle2, Flame, Sliders } from "lucide-react";
import { NephrologyPatient } from "../../../types/nephrologyTelemetry";

interface NephrologyEmergencyEscalationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: NephrologyPatient | null;
  onDispatchProtocol: (
    patientId: string,
    protocolType: "STAT_EMERGENCY_HEMODIALYSIS" | "HYPERKALEMIA_COCKTAIL_STAT" | "CITRATE_TITRATION_ADJUST" | "DIALYZER_CIRCUIT_EXCHANGE" | "FLUID_OVERLOAD_DECONGESTION",
    notes: string
  ) => void;
}

export const NephrologyEmergencyEscalationModal: React.FC<NephrologyEmergencyEscalationModalProps> = ({
  isOpen,
  onClose,
  patient,
  onDispatchProtocol
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<
    "STAT_EMERGENCY_HEMODIALYSIS" | "HYPERKALEMIA_COCKTAIL_STAT" | "CITRATE_TITRATION_ADJUST" | "DIALYZER_CIRCUIT_EXCHANGE" | "FLUID_OVERLOAD_DECONGESTION"
  >("STAT_EMERGENCY_HEMODIALYSIS");
  const [clinicianNotes, setClinicianNotes] = useState("Immediate initiation of acute renal replacement therapy.");
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
      id: "STAT_EMERGENCY_HEMODIALYSIS" as const,
      title: "Initiate STAT Emergency Intermittent Hemodialysis (IHD)",
      desc: "Emergency high-efficiency dialytic clearance for refractory hyperkalemia, severe uremic encephalopathy, or pulmonary edema.",
      icon: Zap,
      color: "border-rose-500 text-rose-400 bg-rose-950/40"
    },
    {
      id: "HYPERKALEMIA_COCKTAIL_STAT" as const,
      title: "STAT Hyperkalemia Pharmacological Cocktail",
      desc: "Immediate Calcium Gluconate (2g IV) + Regular Insulin (10U IV) + D50W (50mL) + Albuterol Nebulization (10mg).",
      icon: Flame,
      color: "border-red-500 text-red-400 bg-red-950/40"
    },
    {
      id: "DIALYZER_CIRCUIT_EXCHANGE" as const,
      title: "Emergency CRRT Dialyzer & Blood Line Exchange",
      desc: "STAT blood return and circuit exchange for severe membrane fouling, high TMP (>250 mmHg), or catastrophic filter clotting.",
      icon: ShieldAlert,
      color: "border-amber-500 text-amber-400 bg-amber-950/40"
    },
    {
      id: "CITRATE_TITRATION_ADJUST" as const,
      title: "Regional Citrate (RCA) Anticoagulation Emergency Adjustment",
      desc: "Adjust ACD-A rate and systemic 10% Calcium Chloride infusion to prevent systemic hypocalcemia and citrate accumulation.",
      icon: Sliders,
      color: "border-cyan-500 text-cyan-400 bg-cyan-950/40"
    },
    {
      id: "FLUID_OVERLOAD_DECONGESTION" as const,
      title: "Aggressive Ultrafiltration Decongestion Protocol (SCUF)",
      desc: "Step up net ultrafiltration removal to 250-400 mL/hr with real-time hematocrit and mean arterial pressure biofeedback.",
      icon: Droplets,
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
                Emergent Nephrology Escalation Protocol
              </h2>
              <p className="text-xs text-slate-400">
                {patient.renalWardBed} • {patient.name} ({patient.mrn}) • KDIGO {patient.kdigoStage.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Patient Snapshot Ribbon */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Creatinine</span>
              <span className="text-rose-400 font-bold">{patient.electrolytes.serumCreatinineMgDl} mg/dL</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">Potassium</span>
              <span className="text-amber-400 font-bold">{patient.electrolytes.serumPotassiumMeqL} mEq/L</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">TMP</span>
              <span className="text-cyan-300 font-bold">{patient.circuit.transmembranePressureTmpMmHg} mmHg</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase font-bold block">24h Net Balance</span>
              <span className="text-emerald-400 font-bold">{patient.fluidBalance.netCumulativeBalance24HoursMl} mL</span>
            </div>
          </div>

          {/* Protocol Selection Options */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Select Emergency Nephrology Protocol to Dispatch:
            </label>
            <div className="space-y-2">
              {protocols.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedProtocol === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProtocol(p.id)}
                    className={"w-full text-left p-3 rounded-xl border transition flex items-start gap-3 cursor-pointer " + (isSelected ? p.color + " ring-2 ring-offset-2 ring-offset-slate-900 ring-cyan-500" : "bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300")}
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
              Physician Order Rationale / Dialysis Prescription Notes:
            </label>
            <textarea
              value={clinicianNotes}
              onChange={(e) => setClinicianNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
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
            className={"px-5 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition shadow-lg flex items-center gap-2 cursor-pointer " + (isDispatched ? "bg-emerald-600 text-white" : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/80 active:scale-95")}
          >
            {isDispatched ? (
              <>
                <CheckCircle2 className="w-4 h-4 animate-spin" />
                Dispatching Dialysis Order...
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

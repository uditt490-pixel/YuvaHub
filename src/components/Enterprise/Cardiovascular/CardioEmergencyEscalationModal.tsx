import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Zap,
  RotateCcw,
  Flame,
  Droplets,
  CheckCircle2,
  AlertOctagon,
  Users,
  Radio,
  Clock,
  Heart
} from "lucide-react";
import { CardioPatient } from "../../../types/cardiovascularTelemetry";

interface CardioEmergencyEscalationModalProps {
  patient: CardioPatient | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatch: (patientId: string, protocolName: string, notes: string) => void;
}

export const CardioEmergencyEscalationModal: React.FC<CardioEmergencyEscalationModalProps> = ({
  patient,
  isOpen,
  onClose,
  onDispatch
}) => {
  const [selectedProtocol, setSelectedProtocol] = useState<string>("EMERGENT_CIRCUIT_EXCHANGE");
  const [notes, setNotes] = useState("");
  const [isDispatched, setIsDispatched] = useState(false);

  if (!isOpen || !patient) return null;

  const protocols = [
    {
      id: "EMERGENT_CIRCUIT_EXCHANGE",
      title: "Emergent ECMO Circuit & Oxygenator Exchange",
      icon: RotateCcw,
      severity: "CRITICAL",
      indication: "Oxygenator thrombosis (TMP ΔP > 50 mmHg), sudden loss of gas transfer, or mechanical pump head failure.",
      team: "Perfusionist, Cardiothoracic Surgeon, CTICU Fellow, ECMO Specialist Nurse",
      actions: "Clamp and isolate existing circuit; prime backup console; transfer venous drainage & arterial return lines under sterile technique; resume flows in < 60 seconds."
    },
    {
      id: "ECPELLA_LV_UNLOADING",
      title: "Acute LV Unloading / ECPELLA Protocol",
      icon: Zap,
      severity: "HIGH",
      indication: "Severe LV distension in VA-ECMO, flat pulse pressure < 10 mmHg, wedge PCWP > 20 mmHg, or acute pulmonary edema.",
      team: "Interventional Cardiologist, Cath Lab Team, Echocardiographer",
      actions: "Urgent bedside microaxial Impella insertion (P-8 unloading) or emergent balloon atrial septostomy to decompress left atrium and prevent intracardiac thrombosis."
    },
    {
      id: "HARLEQUIN_VAV_CONVERSION",
      title: "Harlequin Differential Hypoxemia Correction (VAV-ECMO)",
      icon: Heart,
      severity: "CRITICAL",
      indication: "Upper body hypoxemia (Right radial SpO2 < 88%) with retrograde oxygenated lower body flow (Harlequin Delta > 10%).",
      team: "Cardiothoracic Surgeon, ECMO Perfusionist",
      actions: "Y-connect arterial return line to right internal jugular vein or right subclavian artery (VAV configuration) to supply oxygenated blood to brain and coronary arteries."
    },
    {
      id: "ECPR_CODE_STEMI",
      title: "E-CPR Refractory Cardiac Arrest Cannulation",
      icon: Flame,
      severity: "CRITICAL",
      indication: "Witnessed in-hospital cardiac arrest refractory to conventional CPR > 10 minutes or PEA/VF storm.",
      team: "Code Blue Team, Rapid Cannulation Team, Perfusion",
      actions: "Deploy LUCAS mechanical CPR; perform bilateral percutaneous femoral cannulation under TEE/fluoroscopy; initiate VA-ECMO at 4.0 L/min."
    },
    {
      id: "MTP_ANTICOAG_REVERSAL",
      title: "Massive Transfusion & Anticoagulation Reversal",
      icon: Droplets,
      severity: "HIGH",
      indication: "Cannulation site major hemorrhage, retroperitoneal hematoma, or severe consumptive coagulopathy.",
      team: "Blood Bank, Anesthesiology, CTICU Team",
      actions: "Immediately pause Heparin/Bivalirudin; administer Protamine sulfate (1 mg per 100 units heparin); activate 1:1:1 MTP (PRBCs, FFP, Platelets) + Cryoprecipitate / 4-Factor PCC."
    }
  ];

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatched(true);
    setTimeout(() => {
      onDispatch(patient.id, selectedProtocol, notes);
      setIsDispatched(false);
      onClose();
    }, 600);
  };

  const activeProto = protocols.find((p) => p.id === selectedProtocol) || protocols[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-rose-800/80 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-900/60 bg-gradient-to-r from-rose-950/90 to-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/40 animate-pulse">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Cardiovascular Emergency Escalation Dispatcher
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white uppercase tracking-wider">
                  STAT Protocol
                </span>
              </div>
              <p className="text-xs text-rose-300/80 font-mono mt-0.5">
                Bed: {patient.bedNumber} • {patient.name} ({patient.mrn}) • SCAI: {patient.scaiStage}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleExecute} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Immediate Clinical Intervention Protocol:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {protocols.map((proto) => {
                const IconComp = proto.icon;
                const isSelected = selectedProtocol === proto.id;
                return (
                  <div
                    key={proto.id}
                    onClick={() => setSelectedProtocol(proto.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-rose-950/40 border-rose-500 text-white shadow-lg shadow-rose-950/50"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold truncate">{proto.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 line-clamp-1">{proto.indication}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Protocol Details Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                {activeProto.title}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                {activeProto.severity}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-sans">Primary Indication:</span>
              <p className="text-slate-200 font-sans mt-0.5 text-[11px]">{activeProto.indication}</p>
            </div>
            <div>
              <span className="text-slate-400 font-sans">Rapid Response Team:</span>
              <p className="text-cyan-300 mt-0.5 text-[11px]">{activeProto.team}</p>
            </div>
            <div className="bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/40">
              <span className="text-rose-400 font-sans font-bold">Mandated Actions:</span>
              <p className="text-slate-300 font-sans mt-0.5 text-[11px]">{activeProto.actions}</p>
            </div>
          </div>

          {/* Clinician Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              Escalation Notes & Authorization Code
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Attending Dr. Sterling authorized STAT bedside cannulation, blood bank notified"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDispatched}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white transition-all shadow-lg shadow-rose-600/40 uppercase tracking-wider"
            >
              <Radio className="w-4 h-4 animate-ping" />
              {isDispatched ? "Dispatching Alert..." : "Broadcast STAT Protocol"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

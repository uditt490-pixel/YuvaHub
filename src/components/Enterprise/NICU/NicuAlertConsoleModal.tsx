import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  UserCheck,
  ShieldCheck
} from "lucide-react";
import { NicuPatient } from "../../../types/nicuTelemetry";

interface NicuAlertConsoleModalProps {
  patient: NicuPatient;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeAlerts: (patientId: string, clinicianName: string, notes: string) => void;
}

export const NicuAlertConsoleModal: React.FC<NicuAlertConsoleModalProps> = ({
  patient,
  isOpen,
  onClose,
  onAcknowledgeAlerts
}) => {
  const [clinicianName, setClinicianName] = useState("Dr. Ananya Roy, MD (Attending Neonatologist)");
  const [notes, setNotes] = useState("Assessed at bedside. Inhaled nitric oxide verified at 20 ppm; blood glucose corrected with D10W bolus.");
  const [signedSuccess, setSignedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    onAcknowledgeAlerts(patient.id, clinicianName, notes);
    setSignedSuccess(true);
    setTimeout(() => {
      setSignedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                NICU Clinical Safety Alert Review Console
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Neonate: <span className="text-white font-semibold">{patient.name}</span> | Bed: {patient.bedNumber} | GA: {patient.gestationalAgeWeeks}w
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
        <form onSubmit={handleSign} className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-900 text-xs">
          {signedSuccess ? (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-white">Alerts Acknowledged & Signed</h3>
              <p className="text-xs text-slate-300">
                Electronic health record updated with neonatologist assessment and action plan.
              </p>
            </div>
          ) : (
            <>
              {/* Active Alerts List */}
              <div className="space-y-3">
                <span className="text-slate-400 font-bold uppercase text-[10px] block">
                  Active Clinical Safety Alarms ({patient.alerts.length}):
                </span>
                {patient.alerts.length === 0 ? (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center text-slate-400">
                    No active threshold alerts. Neonatal physiological parameters within target limits.
                  </div>
                ) : (
                  patient.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="bg-slate-950 border border-rose-500/40 rounded-2xl p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black rounded uppercase">
                            {alert.severity}
                          </span>
                          <h4 className="text-xs font-bold text-white">{alert.title}</h4>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{alert.timestamp}</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        <strong>Trigger:</strong> <span className="font-mono text-cyan-300">{alert.triggerMeasurement}</span> | Expected: {alert.expectedRange}
                      </div>
                      <p className="text-[11px] text-slate-400">{alert.clinicalMeaning}</p>
                      <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-amber-300 text-[11px]">
                        <strong>Action:</strong> {alert.actionGuidance}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Clinician Signature */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Attending Neonatologist Digital Signature:
                </label>
                <input
                  type="text"
                  required
                  value={clinicianName}
                  onChange={(e) => setClinicianName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Assessment Notes */}
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Clinical Assessment & Bedside Action Plan:
                </label>
                <textarea
                  rows={3}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500"
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
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-950/40 flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  Sign Off & Acknowledge Alarms
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  X,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Clock,
  BookOpen,
  Filter,
  FileCheck,
  UserCheck
} from "lucide-react";
import { PicuPatient, PicuAlert } from "../../../types/picuTelemetry";

interface PicuAlertConsoleModalProps {
  patient: PicuPatient;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledgeAlert: (patientId: string, alertId: string, clinicianName: string) => void;
}

export const PicuAlertConsoleModal: React.FC<PicuAlertConsoleModalProps> = ({
  patient,
  isOpen,
  onClose,
  onAcknowledgeAlert
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [clinicianSignature, setClinicianSignature] = useState("Dr. Arvind Varma, MD (PICU Attending)");

  if (!isOpen) return null;

  const filteredAlerts = selectedCategory === "ALL"
    ? patient.activeAlerts
    : patient.activeAlerts.filter((a) => a.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                PICU Clinical Alert & Safety Sign-Off Console
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Bedside Patient: <span className="text-white font-semibold">{patient.name}</span> ({patient.bedNumber}) | {patient.activeAlerts.length} Active Safety Notifications
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

        {/* Category Filters */}
        <div className="bg-slate-950/60 px-6 py-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-bold">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {["ALL", "VENTILATION", "HEMODYNAMIC", "NEPHROLOGY", "SEPSIS"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-rose-500 text-white font-black shadow-md shadow-rose-500/20"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-900">
          {filteredAlerts.length === 0 ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-base font-bold text-white">All Alerts Acknowledged or Cleared</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No active threshold breaches for selected criteria. Telemetry parameters remain within established clinical guardrails.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-950 border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 space-y-4 transition-all shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        alert.severity === "CRITICAL" ? "bg-rose-500 text-white animate-pulse" : "bg-amber-500 text-slate-950"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded">
                        {alert.category}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">{alert.title}</h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Measurements & Clinical Rationale */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-900/90 p-3.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Trigger Measurement:</span>
                    <p className="text-rose-300 font-mono font-bold mt-0.5">{alert.triggerMeasurement}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Expected Reference Guardrail:</span>
                    <p className="text-emerald-400 font-mono font-bold mt-0.5">{alert.expectedReferenceRange}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Clinical Rationale:</span>
                    <p className="text-slate-300 mt-0.5 font-medium">{alert.clinicalRationale}</p>
                  </div>
                </div>

                {/* Suggested Action & Guideline Reference */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Guideline Reference: {alert.guidelineReference}</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-200">
                    <span className="font-bold uppercase text-[10px] text-amber-400 block mb-1">Recommended Escalation:</span>
                    {alert.suggestedAction}
                  </div>
                </div>

                {/* Acknowledgment Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-4 flex-wrap">
                  <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={clinicianSignature}
                      onChange={(e) => setClinicianSignature(e.target.value)}
                      placeholder="Clinician Digital Signature"
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white w-full focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    onClick={() => onAcknowledgeAlert(patient.id, alert.id, clinicianSignature)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Acknowledge & Sign Off
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  UserCheck,
  FileSignature,
  Activity,
  Heart,
  Flame,
  ArrowRight
} from 'lucide-react';
import { ClinicalPatientRecord, ClinicalAlert } from '../../types/clinicalTelemetry';
import { ClinicalTelemetryService } from '../../services/ClinicalTelemetryService';

interface ClinicalAlertInspectorModalProps {
  patient: ClinicalPatientRecord | null;
  onClose: () => void;
  onAlertAcknowledged: () => void;
  onTriggerEscalation: (patient: ClinicalPatientRecord) => void;
}

export const ClinicalAlertInspectorModal: React.FC<ClinicalAlertInspectorModalProps> = ({
  patient,
  onClose,
  onAlertAcknowledged,
  onTriggerEscalation,
}) => {
  const [clinicianName, setClinicianName] = useState('Dr. Devika Mukherjee, MD');
  const [signingAlertId, setSigningAlertId] = useState<string | null>(null);

  if (!patient) return null;

  const handleAcknowledge = async (alertId: string) => {
    setSigningAlertId(alertId);
    await ClinicalTelemetryService.acknowledgeAlert(patient.id, alertId, clinicianName);
    setSigningAlertId(null);
    onAlertAcknowledged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Clinical Deterioration & Alert Review Console
              </h3>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-slate-200">{patient.fullName}</strong> ({patient.mrn}) • {patient.bedNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clinician Signature Setup Bar */}
        <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Signing Clinician:</span>
            <input
              type="text"
              value={clinicianName}
              onChange={(e) => setClinicianName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-semibold text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              placeholder="Clinician name & credential"
            />
          </div>

          <button
            onClick={() => onTriggerEscalation(patient)}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/40 text-xs font-bold hover:bg-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Escalate to Emergency Protocol</span>
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {patient.alerts.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-200">All Parameters Normal</p>
              <p className="text-xs text-slate-500 mt-1">No active unresolved alarms or threshold breaches.</p>
            </div>
          ) : (
            patient.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  alert.acknowledged
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                    : alert.severity === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-500/40 shadow-md shadow-rose-950/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                          alert.severity === 'CRITICAL'
                            ? 'bg-rose-500 text-slate-950'
                            : alert.severity === 'HIGH'
                            ? 'bg-amber-500 text-slate-950'
                            : alert.severity === 'WARNING'
                            ? 'bg-yellow-500 text-slate-950'
                            : 'bg-cyan-500 text-slate-950'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-sm font-bold text-slate-100">{alert.metric}</span>
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                        {alert.value}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      <span className="text-slate-500 font-medium">Expected Reference Range:</span>{' '}
                      <strong className="text-slate-300 font-mono">{alert.expectedRange}</strong>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-300 flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-cyan-400">Escalation Guidance:</strong> {alert.suggestedEscalation}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {alert.acknowledged ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          Signed & Logged
                        </span>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          By: {alert.acknowledgedBy}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        disabled={signingAlertId === alert.id}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>{signingAlertId === alert.id ? 'Signing...' : 'Acknowledge'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            FDA 21 CFR Part 11 Electronic Records & Clinical Audit Compliance
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

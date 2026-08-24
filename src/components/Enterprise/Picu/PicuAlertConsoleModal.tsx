import React, { useState } from "react";
import { X, AlertTriangle, ShieldCheck, CheckCircle2, User, Clock, BellRing, Filter, Baby } from "lucide-react";
import { PicuPatient, PicuAlert } from "../../../types/picuTelemetry";

interface PicuAlertConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: PicuPatient[];
  onAcknowledgeAlert: (patientId: string, alertId: string, clinicianName: string) => void;
}

export const PicuAlertConsoleModal: React.FC<PicuAlertConsoleModalProps> = ({
  isOpen,
  onClose,
  patients,
  onAcknowledgeAlert
}) => {
  const [clinicianName, setClinicianName] = useState("Dr. Genevieve Sterling, MD, FAAP");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  if (!isOpen) return null;

  const allAlerts: Array<PicuAlert & { patientName: string; bed: string; mrn: string }> = [];
  patients.forEach((p) => {
    p.activeAlerts.forEach((a) => {
      allAlerts.push({
        ...a,
        patientName: p.name,
        bed: p.bedIsoletteNumber,
        mrn: p.mrn
      });
    });
  });

  const filteredAlerts = allAlerts.filter((a) => {
    if (filterCategory === "ALL") return true;
    return a.category === filterCategory;
  });

  const unacknowledgedCount = allAlerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/40 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-pink-400 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-black font-mono uppercase tracking-wide text-white flex items-center gap-2">
                PICU & Neonatal Safety Alert Console
                {unacknowledgedCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-600 text-white">
                    {unacknowledgedCount} Pending
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                PALS Critical Alarms • PEWS Deterioration Warnings • PPHN Ductal Delta • Isolette Temperature Limits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-pink-500"
            >
              <option value="ALL">All Alert Categories</option>
              <option value="PALS_RESUSCITATION_ALERT">PALS Critical Resuscitation</option>
              <option value="HIGH_PEWS_DETERIORATION">High PEWS Deterioration</option>
              <option value="PPHN_DUCTAL_SHUNT">PPHN & Ductal Shunting</option>
              <option value="SEVERE_PARDS_OI">Severe PARDS / High OI</option>
              <option value="INCUBATOR_THERMAL_INSTABILITY">Incubator Thermal Instability</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <User className="w-4 h-4 text-pink-400" />
            <span className="text-slate-400">Pediatric Attending Sign-Off:</span>
            <input
              type="text"
              value={clinicianName}
              onChange={(e) => setClinicianName(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-pink-500 text-xs font-medium"
            />
          </div>
        </div>

        {/* Alarm List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-300">All Pediatric & Neonatal Parameters Within Safe Bounds</p>
              <p className="text-xs text-slate-500 mt-1">No active unacknowledged critical alarms or PALS emergency triggers.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isCritical = alert.severity === "CRITICAL_STAT";
              return (
                <div
                  key={alert.id}
                  className={"p-4 rounded-xl border transition-all " + (alert.acknowledged ? "bg-slate-950/40 border-slate-800 opacity-60" : isCritical ? "bg-rose-950/40 border-rose-600/80 shadow-lg shadow-rose-950/30" : "bg-amber-950/30 border-amber-600/70")}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={"px-2 py-0.5 text-[10px] font-black uppercase rounded " + (isCritical ? "bg-rose-600 text-white" : "bg-amber-600 text-amber-50")}>
                          {alert.severity.replace(/_/g, " ")}
                        </span>
                        <span className="font-mono text-xs font-bold text-pink-300">
                          {alert.bed} • {alert.patientName} ({alert.mrn})
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{alert.title}</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 font-mono">
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">Trigger Measurement:</span>
                          <span className="text-rose-400 font-bold">{alert.triggerMeasurement}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] uppercase font-bold block">Target Safe Range:</span>
                          <span className="text-emerald-400 font-bold">{alert.expectedRange}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300">
                        <strong className="text-slate-400 font-semibold">Clinical Rationale: </strong>
                        {alert.clinicalRationale}
                      </p>

                      <p className="text-xs text-pink-300/90 bg-pink-950/40 p-2 rounded border border-pink-800/40">
                        <strong className="text-pink-400 font-bold">Suggested PALS Escalation: </strong>
                        {alert.suggestedAction}
                      </p>
                    </div>

                    <div className="sm:text-right shrink-0 pt-1">
                      {alert.acknowledged ? (
                        <div className="text-xs text-emerald-400 flex items-center sm:justify-end gap-1 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Acknowledged by {alert.acknowledgedBy}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onAcknowledgeAlert(alert.patientId, alert.id, clinicianName)}
                          className="w-full sm:w-auto px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition shadow-md shadow-rose-950/60 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Acknowledge & Sign
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>AHA / AAP Pediatric Advanced Life Support (PALS) Standards</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-bold cursor-pointer"
          >
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
};

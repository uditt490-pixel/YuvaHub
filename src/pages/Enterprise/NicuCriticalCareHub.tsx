import React, { useState, useEffect } from "react";
import {
  Baby,
  Activity,
  Radio,
  Plus,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  LayoutGrid,
  Table
} from "lucide-react";
import { NicuPatient, NicuWardMetrics } from "../../types/nicuTelemetry";
import { NicuTelemetryService } from "../../services/NicuTelemetryService";
import { NicuMetricsHeader } from "../../components/Enterprise/NICU/NicuMetricsHeader";
import { NicuPatientCard } from "../../components/Enterprise/NICU/NicuPatientCard";
import { NicuFilterToolbar } from "../../components/Enterprise/NICU/NicuFilterToolbar";
import { NicuTelemetryInspectorModal } from "../../components/Enterprise/NICU/NicuTelemetryInspectorModal";
import { NicuAlertConsoleModal } from "../../components/Enterprise/NICU/NicuAlertConsoleModal";
import { NicuEmergencyEscalationModal } from "../../components/Enterprise/NICU/NicuEmergencyEscalationModal";
import { NicuAdmissionModal } from "../../components/Enterprise/NICU/NicuAdmissionModal";
import { NicuGirDoseCalculatorModal } from "../../components/Enterprise/NICU/NicuGirDoseCalculatorModal";

export const NicuCriticalCareHub: React.FC = () => {
  const [patients, setPatients] = useState<NicuPatient[]>([]);
  const [metrics, setMetrics] = useState<NicuWardMetrics | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [viewMode, setViewMode] = useState<"GRID" | "MATRIX">("GRID");

  // Filters
  const [selectedBracket, setSelectedBracket] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVentMode, setSelectedVentMode] = useState("ALL");
  const [selectedSpecialStatus, setSelectedSpecialStatus] = useState("ALL");

  // Modals
  const [inspectingPatient, setInspectingPatient] = useState<NicuPatient | null>(null);
  const [alertPatient, setAlertPatient] = useState<NicuPatient | null>(null);
  const [emergencyPatient, setEmergencyPatient] = useState<NicuPatient | null>(null);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isGirOpen, setIsGirOpen] = useState(false);

  // Init Data
  useEffect(() => {
    const initial = NicuTelemetryService.getMockNicuPatients();
    setPatients(initial);
    setMetrics(NicuTelemetryService.calculateWardMetrics(initial));
  }, []);

  // Live Telemetry Streaming Loop
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setPatients((prev) => {
        const updated = NicuTelemetryService.simulateNicuTelemetryTick(prev);
        setMetrics(NicuTelemetryService.calculateWardMetrics(updated));
        if (inspectingPatient) {
          const fresh = updated.find((p) => p.id === inspectingPatient.id);
          if (fresh) setInspectingPatient(fresh);
        }
        return updated;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLiveStreaming, inspectingPatient]);

  // Handle Alert Acknowledgment
  const handleAcknowledgeAlerts = (patientId: string, clinicianName: string, notes: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          alerts: []
        };
      })
    );
  };

  // Handle Emergency Protocol Dispatch
  const handleDispatchEmergency = (patientId: string, protocolName: string, orders: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          ventilation: {
            ...p.ventilation,
            nitricOxidePpm: protocolName.includes("INO") ? 20 : p.ventilation.nitricOxidePpm
          },
          hypothermia: protocolName.includes("HYPOTHERMIA") ? "COOLING_IN_PROGRESS" : p.hypothermia,
          vitals: {
            ...p.vitals,
            heartRateBpm: protocolName.includes("PINK") ? 140 : p.vitals.heartRateBpm,
            coreTemperatureCelsius: protocolName.includes("HYPOTHERMIA") ? 33.5 : p.vitals.coreTemperatureCelsius
          },
          alerts: p.alerts.filter((a) => !a.title.includes("PPHN") && !a.title.includes("Bradycardia"))
        };
      })
    );
  };

  // Handle New Neonate Admission
  const handleAdmitPatient = (newPatient: NicuPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setMetrics((prev) => (prev ? NicuTelemetryService.calculateWardMetrics([newPatient, ...patients]) : null));
  };

  // Filter Patients
  const filteredPatients = patients.filter((p) => {
    if (selectedBracket !== "ALL" && p.gestationalBracket !== selectedBracket) return false;
    if (selectedVentMode !== "ALL" && p.ventilation.mode !== selectedVentMode) return false;

    if (selectedSpecialStatus !== "ALL") {
      if (selectedSpecialStatus === "COOLING" && p.hypothermia !== "COOLING_IN_PROGRESS") return false;
      if (selectedSpecialStatus === "PHOTOTHERAPY" && !p.phototherapyActive) return false;
      if (selectedSpecialStatus === "PPHN_ALERT" && p.prePostDuctal.gradientDeltaSpO2 <= 10) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchMrn = p.mrn.toLowerCase().includes(q);
      const matchBed = p.bedNumber.toLowerCase().includes(q);
      const matchDx = p.admissionDiagnosis.toLowerCase().includes(q);
      if (!matchName && !matchMrn && !matchBed && !matchDx) return false;
    }

    return true;
  });

  const clearAllFilters = () => {
    setSelectedBracket("ALL");
    setSearchQuery("");
    setSelectedVentMode("ALL");
    setSelectedSpecialStatus("ALL");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 font-sans space-y-6">
      {/* Metrics Header */}
      {metrics && (
        <NicuMetricsHeader
          metrics={metrics}
          isLiveStreaming={isLiveStreaming}
          onToggleStreaming={() => setIsLiveStreaming(!isLiveStreaming)}
          onOpenAdmissionModal={() => setIsAdmissionOpen(true)}
          onOpenGirModal={() => setIsGirOpen(true)}
          selectedBracket={selectedBracket}
          onSelectBracket={setSelectedBracket}
        />
      )}

      {/* Filter Toolbar */}
      <NicuFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBracket={selectedBracket}
        onBracketChange={setSelectedBracket}
        selectedVentMode={selectedVentMode}
        onVentModeChange={setSelectedVentMode}
        selectedSpecialStatus={selectedSpecialStatus}
        onSpecialStatusChange={setSelectedSpecialStatus}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onClearFilters={clearAllFilters}
      />

      {/* Patient Views */}
      {filteredPatients.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-xl">
          <Baby className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Neonates Match Current Filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria or select &quot;All Gestational Brackets&quot; to view all beds in the unit.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-pink-600 text-white font-bold text-xs rounded-xl shadow-md shadow-pink-600/30"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <NicuPatientCard
              key={patient.id}
              patient={patient}
              onInspect={(p) => setInspectingPatient(p)}
              onOpenAlertModal={(p) => setAlertPatient(p)}
              onOpenEmergencyModal={(p) => setEmergencyPatient(p)}
            />
          ))}
        </div>
      ) : (
        /* High-Density Central Station Matrix Tabular View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4">Neonate & Bed</th>
                  <th className="py-4 px-3">GA / PMA</th>
                  <th className="py-4 px-3">Weight (g)</th>
                  <th className="py-4 px-3">Ventilator</th>
                  <th className="py-4 px-3">Pre/Post SpO₂</th>
                  <th className="py-4 px-3">&Delta;SpO₂ (PPHN)</th>
                  <th className="py-4 px-3">NIRS rSO₂</th>
                  <th className="py-4 px-3">HR / MAP</th>
                  <th className="py-4 px-3">GIR (mg/kg/min)</th>
                  <th className="py-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPatients.map((p) => {
                  const isPphn = p.prePostDuctal.gradientDeltaSpO2 > 10;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({p.sex === "MALE" ? "M" : "F"})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{p.bedNumber} ({p.mrn})</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-pink-300 font-bold">{p.gestationalAgeWeeks}w GA</span>
                        <div className="text-[10px] text-slate-400">PMA {p.postmenstrualAgeWeeks}w (DOL {p.dayOfLife})</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-white">
                        {p.currentWeightGrams}g
                        <div className="text-[10px] text-slate-500">Birth: {p.birthWeightGrams}g</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-cyan-300 font-mono">{p.ventilation.mode}</span>
                        {p.ventilation.mode === "HFOV" && (
                          <div className="text-[10px] text-slate-400">mPaw {p.ventilation.meanAirwayPressureCmH2O} | &Delta;P {p.ventilation.amplitudeDeltaPCmH2O}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className="font-bold text-emerald-400">{p.prePostDuctal.preDuctalRightWristSpO2}%</span>
                        <span className="text-slate-500"> / {p.prePostDuctal.postDuctalFootSpO2}%</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          isPphn ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse" : "text-slate-300"
                        }`}>
                          &Delta; {p.prePostDuctal.gradientDeltaSpO2}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className="font-bold text-indigo-300">{p.prePostDuctal.cerebralNirsRso2Percent}%</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className="text-white font-bold">{p.vitals.heartRateBpm}</span>
                        <span className="text-slate-400"> / {p.vitals.meanArterialPressureMmHg}</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                        {p.nutrition.glucoseInfusionRateMgKgMin}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectingPatient(p)}
                            className="px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg text-[11px]"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => setAlertPatient(p)}
                            className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold rounded-lg text-[11px]"
                          >
                            Alerts
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {inspectingPatient && (
        <NicuTelemetryInspectorModal
          patient={inspectingPatient}
          isOpen={!!inspectingPatient}
          onClose={() => setInspectingPatient(null)}
          onOpenAlertModal={(p) => {
            setInspectingPatient(null);
            setAlertPatient(p);
          }}
          onOpenEmergencyModal={(p) => {
            setInspectingPatient(null);
            setEmergencyPatient(p);
          }}
        />
      )}

      {alertPatient && (
        <NicuAlertConsoleModal
          patient={alertPatient}
          isOpen={!!alertPatient}
          onClose={() => setAlertPatient(null)}
          onAcknowledgeAlerts={handleAcknowledgeAlerts}
        />
      )}

      {emergencyPatient && (
        <NicuEmergencyEscalationModal
          patient={emergencyPatient}
          isOpen={!!emergencyPatient}
          onClose={() => setEmergencyPatient(null)}
          onDispatchEmergency={handleDispatchEmergency}
        />
      )}

      {isAdmissionOpen && (
        <NicuAdmissionModal
          isOpen={isAdmissionOpen}
          onClose={() => setIsAdmissionOpen(false)}
          onAdmit={handleAdmitPatient}
        />
      )}

      {isGirOpen && (
        <NicuGirDoseCalculatorModal
          isOpen={isGirOpen}
          onClose={() => setIsGirOpen(false)}
        />
      )}
    </div>
  );
};

export default NicuCriticalCareHub;

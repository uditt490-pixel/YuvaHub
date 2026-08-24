import React, { useState, useEffect } from "react";
import {
  Heart,
  Activity,
  Radio,
  Plus,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  LayoutGrid,
  Table,
  RotateCcw,
  Droplets,
  ShieldAlert,
  Sliders,
  ChevronRight
} from "lucide-react";
import { CardioPatient, CardioWardMetrics } from "../../types/cardiovascularTelemetry";
import { CardiovascularTelemetryService } from "../../services/CardiovascularTelemetryService";
import { CardioMetricsHeader } from "../../components/Enterprise/Cardiovascular/CardioMetricsHeader";
import { CardioPatientCard } from "../../components/Enterprise/Cardiovascular/CardioPatientCard";
import { CardioFilterToolbar } from "../../components/Enterprise/Cardiovascular/CardioFilterToolbar";
import { CardioTelemetryInspectorModal } from "../../components/Enterprise/Cardiovascular/CardioTelemetryInspectorModal";
import { CardioAlertConsoleModal } from "../../components/Enterprise/Cardiovascular/CardioAlertConsoleModal";
import { CardioEmergencyEscalationModal } from "../../components/Enterprise/Cardiovascular/CardioEmergencyEscalationModal";
import { CardioAdmissionModal } from "../../components/Enterprise/Cardiovascular/CardioAdmissionModal";
import { CardioHemodynamicCalculatorModal } from "../../components/Enterprise/Cardiovascular/CardioHemodynamicCalculatorModal";

export const CardiovascularCriticalCareHub: React.FC = () => {
  const [patients, setPatients] = useState<CardioPatient[]>([]);
  const [metrics, setMetrics] = useState<CardioWardMetrics | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [viewMode, setViewMode] = useState<"GRID" | "MATRIX">("GRID");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScaiStage, setSelectedScaiStage] = useState("ALL");
  const [selectedMcsDevice, setSelectedMcsDevice] = useState("ALL");
  const [selectedSpecialStatus, setSelectedSpecialStatus] = useState("ALL");

  // Modals
  const [inspectingPatient, setInspectingPatient] = useState<CardioPatient | null>(null);
  const [alertPatient, setAlertPatient] = useState<CardioPatient | null>(null);
  const [emergencyPatient, setEmergencyPatient] = useState<CardioPatient | null>(null);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Initialize mock data
  useEffect(() => {
    const initial = CardiovascularTelemetryService.getMockCardioPatients();
    setPatients(initial);
    setMetrics(CardiovascularTelemetryService.calculateWardMetrics(initial));
  }, []);

  // Live Telemetry Streaming Loop (1200ms)
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setPatients((prev) => {
        const updated = CardiovascularTelemetryService.simulateCardioTelemetryTick(prev);
        setMetrics(CardiovascularTelemetryService.calculateWardMetrics(updated));
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
  const handleAcknowledgeAlerts = (patientId: string, clinicianName: string, rationale: string) => {
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
  const handleDispatchEmergency = (patientId: string, protocolName: string, notes: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          alerts: [
            {
              id: `alt-stat-${Date.now()}`,
              severity: "CRITICAL",
              title: `STAT Protocol Broadcast: ${protocolName}`,
              triggerMeasurement: `Dispatched: ${new Date().toLocaleTimeString()}`,
              expectedRange: "Immediate Intervention",
              clinicalMeaning: `Active emergency protocol: ${notes}`,
              actionGuidance: "Follow specialized ECMO/Cardiac critical care team actions.",
              timestamp: new Date().toISOString()
            },
            ...p.alerts
          ]
        };
      })
    );
  };

  // Handle New Patient Admission
  const handleAdmitPatient = (newPatient: CardioPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setMetrics((prev) =>
      prev ? CardiovascularTelemetryService.calculateWardMetrics([newPatient, ...patients]) : null
    );
  };

  // Filter Pipeline
  const filteredPatients = patients.filter((p) => {
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchMrn = p.mrn.toLowerCase().includes(q);
      const matchBed = p.bedNumber.toLowerCase().includes(q);
      const matchDx = p.primaryDiagnosis.toLowerCase().includes(q);
      const matchAttending = p.attendingCardiologist.toLowerCase().includes(q);
      if (!matchName && !matchMrn && !matchBed && !matchDx && !matchAttending) return false;
    }

    // SCAI Stage Filter
    if (selectedScaiStage !== "ALL" && p.scaiStage !== selectedScaiStage) {
      return false;
    }

    // MCS Device Filter
    if (selectedMcsDevice !== "ALL") {
      if (selectedMcsDevice === "IMPELLA" && !p.mcsDevice.includes("IMPELLA")) return false;
      if (selectedMcsDevice !== "IMPELLA" && p.mcsDevice !== selectedMcsDevice) return false;
    }

    // Clinical Special Status Filter
    if (selectedSpecialStatus === "ACTIVE_ALERTS" && p.alerts.length === 0) return false;
    if (selectedSpecialStatus === "CRITICAL_CPO" && p.hemodynamics.cardiacPowerOutputWatts >= 0.60) return false;
    if (selectedSpecialStatus === "HIGH_TMP" && (!p.ecmoTelemetry || p.ecmoTelemetry.transmembranePressureGradientMmHg < 50)) return false;
    if (selectedSpecialStatus === "HARLEQUIN" && (!p.ecmoTelemetry || p.ecmoTelemetry.harlequinDeltaSpO2Percent < 10)) return false;
    if (selectedSpecialStatus === "LOW_PAPI" && p.hemodynamics.pulmonaryArteryPulsatilityIndex >= 0.90) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Live Surveillance Ticker */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs font-mono overflow-hidden shadow-inner">
          <div className="flex items-center gap-2 text-rose-400 font-bold shrink-0">
            <Radio className="w-4 h-4 animate-pulse text-rose-500" />
            <span>CTICU LIVE TELEMETRY STREAM:</span>
          </div>
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap px-4 text-slate-400">
            <span>Active Beds: <strong className="text-white">{patients.length}</strong></span>
            <span>VA-ECMO: <strong className="text-rose-400">{metrics?.activeVaEcmoCount || 0}</strong></span>
            <span>VV-ECMO: <strong className="text-cyan-400">{metrics?.activeVvEcmoCount || 0}</strong></span>
            <span>ECPELLA: <strong className="text-amber-400">{metrics?.activeEcpellaCount || 0}</strong></span>
            <span>Low CPO (&lt;0.6W): <strong className="text-red-400">{metrics?.criticalCpoCount || 0}</strong></span>
            <span>Oxygenator Clotting TMP: <strong className="text-amber-400">{metrics?.highTransmembranePressureCount || 0}</strong></span>
            <span>Harlequin Syndrome: <strong className="text-rose-400">{metrics?.harlequinSyndromeAlertCount || 0}</strong></span>
          </div>
          <div className="text-slate-500 shrink-0 hidden sm:block">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Header & KPI Summary */}
        <CardioMetricsHeader
          metrics={metrics}
          isLiveStreaming={isLiveStreaming}
          onToggleLiveStreaming={() => setIsLiveStreaming(!isLiveStreaming)}
          onOpenAdmission={() => setIsAdmissionOpen(true)}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
        />

        {/* Multi-Dimensional Filter Toolbar */}
        <CardioFilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedScaiStage={selectedScaiStage}
          onScaiStageChange={setSelectedScaiStage}
          selectedMcsDevice={selectedMcsDevice}
          onMcsDeviceChange={setSelectedMcsDevice}
          selectedSpecialStatus={selectedSpecialStatus}
          onSpecialStatusChange={setSelectedSpecialStatus}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFilteredCount={filteredPatients.length}
          totalCount={patients.length}
        />

        {/* View Mode 1: Bedside Cards Grid View */}
        {viewMode === "GRID" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-5">
            {filteredPatients.map((patient) => (
              <CardioPatientCard
                key={patient.id}
                patient={patient}
                onInspect={(p) => setInspectingPatient(p)}
                onOpenAlerts={(p) => setAlertPatient(p)}
                onOpenEmergency={(p) => setEmergencyPatient(p)}
              />
            ))}
          </div>
        )}

        {/* View Mode 2: Central Station Matrix Table View */}
        {viewMode === "MATRIX" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Bed / MRN</th>
                    <th className="px-4 py-3">Patient</th>
                    <th className="px-4 py-3">SCAI / MCS</th>
                    <th className="px-4 py-3">BP (MAP)</th>
                    <th className="px-4 py-3">CPO (Watts)</th>
                    <th className="px-4 py-3">CO / CI</th>
                    <th className="px-4 py-3">PAPi / CVP</th>
                    <th className="px-4 py-3">ECMO Flow / TMP</th>
                    <th className="px-4 py-3">Δ SpO₂ (Harlequin)</th>
                    <th className="px-4 py-3">VIS / Lactate</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredPatients.map((p) => {
                    const isCpoLow = p.hemodynamics.cardiacPowerOutputWatts < 0.60;
                    const isTmpHigh = p.ecmoTelemetry && p.ecmoTelemetry.transmembranePressureGradientMmHg >= 50;
                    const isHarlequin = p.ecmoTelemetry && p.ecmoTelemetry.harlequinDeltaSpO2Percent >= 10;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-cyan-400">{p.bedNumber}</div>
                          <div className="text-[10px] text-slate-500">{p.mrn}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-white font-sans">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.age}y {p.sex} • Day {p.dayInIcu}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-rose-300">{p.scaiStage.replace("STAGE_", "SCAI ")}</div>
                          <div className="text-[10px] text-slate-400">{p.mcsDevice}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{p.hemodynamics.systolicBloodPressureMmHg}/{p.hemodynamics.diastolicBloodPressureMmHg}</div>
                          <div className="text-[10px] text-cyan-300 font-bold">MAP: {p.hemodynamics.meanArterialPressureMmHg}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`font-black ${isCpoLow ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
                            {p.hemodynamics.cardiacPowerOutputWatts} W
                          </div>
                          <div className="text-[10px] text-slate-400">CPI: {p.hemodynamics.cardiacPowerIndexWattsM2}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div>{p.hemodynamics.cardiacOutputLpm} L/min</div>
                          <div className="text-[10px] text-slate-400">CI: {p.hemodynamics.cardiacIndexLpmM2}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={p.hemodynamics.pulmonaryArteryPulsatilityIndex < 0.9 ? "text-amber-400 font-bold" : ""}>
                            PAPi: {p.hemodynamics.pulmonaryArteryPulsatilityIndex}
                          </div>
                          <div className="text-[10px] text-slate-400">CVP: {p.hemodynamics.centralVenousPressureMmHg}</div>
                        </td>
                        <td className="px-4 py-3">
                          {p.mcsDevice.includes("ECMO") || p.mcsDevice === "ECPELLA" ? (
                            <>
                              <div className="text-cyan-300">{p.ecmoTelemetry.bloodFlowLpm} L/min</div>
                              <div className={`text-[10px] ${isTmpHigh ? "text-amber-400 font-bold" : "text-slate-400"}`}>
                                TMP: {p.ecmoTelemetry.transmembranePressureGradientMmHg} mmHg
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {p.mcsDevice === "VA_ECMO" ? (
                            <span className={`font-bold ${isHarlequin ? "text-rose-400 animate-pulse" : "text-slate-300"}`}>
                              Δ {p.ecmoTelemetry.harlequinDeltaSpO2Percent}%
                            </span>
                          ) : (
                            <span className="text-slate-500">0%</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div>VIS: <strong className="text-cyan-300">{p.vasoactiveSupport.vasoactiveInotropicScore}</strong></div>
                          <div className="text-[10px] text-slate-400">Lac: {p.anticoagulationLabs.lactateMmolL} mmol/L</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setAlertPatient(p)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                            >
                              Alerts ({p.alerts.length})
                            </button>
                            <button
                              onClick={() => setInspectingPatient(p)}
                              className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold"
                            >
                              Inspect
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

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Heart className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Matching Patients in CTICU</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No patients match the selected SCAI shock stage, MCS device modality, or search filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedScaiStage("ALL");
                setSelectedMcsDevice("ALL");
                setSelectedSpecialStatus("ALL");
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-all"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Modals Orchestration */}
        <CardioTelemetryInspectorModal
          patient={inspectingPatient}
          isOpen={!!inspectingPatient}
          onClose={() => setInspectingPatient(null)}
          onOpenEmergency={(p) => {
            setInspectingPatient(null);
            setEmergencyPatient(p);
          }}
        />

        <CardioAlertConsoleModal
          patient={alertPatient}
          isOpen={!!alertPatient}
          onClose={() => setAlertPatient(null)}
          onAcknowledge={handleAcknowledgeAlerts}
        />

        <CardioEmergencyEscalationModal
          patient={emergencyPatient}
          isOpen={!!emergencyPatient}
          onClose={() => setEmergencyPatient(null)}
          onDispatch={handleDispatchEmergency}
        />

        <CardioAdmissionModal
          isOpen={isAdmissionOpen}
          onClose={() => setIsAdmissionOpen(false)}
          onAdmit={handleAdmitPatient}
        />

        <CardioHemodynamicCalculatorModal
          isOpen={isCalculatorOpen}
          onClose={() => setIsCalculatorOpen(false)}
        />
      </div>
    </div>
  );
};
export default CardiovascularCriticalCareHub;

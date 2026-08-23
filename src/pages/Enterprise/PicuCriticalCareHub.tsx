import React, { useState, useEffect } from "react";
import {
  HeartPulse,
  Activity,
  Wind,
  Droplets,
  AlertTriangle,
  Radio,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Flame,
  Pill,
  Search,
  CheckCircle2,
  AlertOctagon,
  Zap,
  Layers,
  ChevronRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Table,
  LayoutGrid
} from "lucide-react";
import { PicuPatient, PicuWardOverviewMetrics, EmergencyProtocolType } from "../../types/picuTelemetry";
import { PicuTelemetryService } from "../../services/PicuTelemetryService";
import { PicuMetricsHeader } from "../../components/Enterprise/PICU/PicuMetricsHeader";
import { PicuPatientCard } from "../../components/Enterprise/PICU/PicuPatientCard";
import { PicuFilterToolbar } from "../../components/Enterprise/PICU/PicuFilterToolbar";
import { PicuTelemetryInspectorModal } from "../../components/Enterprise/PICU/PicuTelemetryInspectorModal";
import { PicuAlertConsoleModal } from "../../components/Enterprise/PICU/PicuAlertConsoleModal";
import { PicuEmergencyEscalationModal } from "../../components/Enterprise/PICU/PicuEmergencyEscalationModal";
import { PicuAdmissionModal } from "../../components/Enterprise/PICU/PicuAdmissionModal";
import { PicuDrugDosingModal } from "../../components/Enterprise/PICU/PicuDrugDosingModal";

export const PicuCriticalCareHub: React.FC = () => {
  const [patients, setPatients] = useState<PicuPatient[]>([]);
  const [metrics, setMetrics] = useState<PicuWardOverviewMetrics | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState(true);
  const [viewMode, setViewMode] = useState<"GRID" | "MATRIX">("GRID");

  // Filter States
  const [selectedPod, setSelectedPod] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAcuity, setSelectedAcuity] = useState("ALL");
  const [selectedVentMode, setSelectedVentMode] = useState("ALL");
  const [selectedAgeBracket, setSelectedAgeBracket] = useState("ALL");

  // Modal States
  const [inspectingPatient, setInspectingPatient] = useState<PicuPatient | null>(null);
  const [alertPatient, setAlertPatient] = useState<PicuPatient | null>(null);
  const [escalatingPatient, setEscalatingPatient] = useState<PicuPatient | null>(null);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isDrugDosingOpen, setIsDrugDosingOpen] = useState(false);

  // Initialize Data
  useEffect(() => {
    const initialPatients = PicuTelemetryService.getMockPicuPatients();
    setPatients(initialPatients);
    setMetrics(PicuTelemetryService.calculateWardOverview(initialPatients));
  }, []);

  // Live Telemetry Streaming Loop
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setPatients((prevPatients) => {
        const updated = PicuTelemetryService.simulateTelemetryTick(prevPatients);
        setMetrics(PicuTelemetryService.calculateWardOverview(updated));
        // Keep inspecting patient updated in sync
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
  const handleAcknowledgeAlert = (patientId: string, alertId: string, clinicianName: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const updatedAlerts = p.activeAlerts.map((a) =>
          a.id === alertId
            ? { ...a, acknowledged: true, acknowledgedBy: clinicianName, acknowledgedAt: new Date().toISOString() }
            : a
        );
        return { ...p, activeAlerts: updatedAlerts.filter((a) => !a.acknowledged) };
      })
    );
  };

  // Handle Emergency Escalation
  const handleDispatchProtocol = (patientId: string, protocol: EmergencyProtocolType, notes: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const newRecord = {
          id: `PROTO-${Date.now().toString().slice(-4)}`,
          patientId,
          protocol,
          initiatedAt: new Date().toISOString(),
          initiatedBy: "Attending Pediatric Intensivist",
          status: "BEDSIDE_ACTIVE" as const,
          targetResponseMinutes: protocol === "PEDIATRIC_CODE_BLUE" ? 2 : 15,
          assignedTeamMembers: ["Bedside PALS Team", "Respiratory Specialist", "Charge RN"],
          clinicalNotes: notes || "Immediate protocol activation dispatched via Central Command."
        };
        return {
          ...p,
          acuityLevel: "CODE_PALS",
          emergencyProtocols: [newRecord, ...p.emergencyProtocols]
        };
      })
    );
  };

  // Handle New Admission
  const handleAdmitPatient = (newPatient: PicuPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setMetrics((prev) => (prev ? PicuTelemetryService.calculateWardOverview([newPatient, ...patients]) : null));
  };

  // Filter Patients
  const filteredPatients = patients.filter((patient) => {
    // Pod Filter
    if (selectedPod !== "ALL" && patient.wardPod !== selectedPod) return false;
    // Acuity Filter
    if (selectedAcuity !== "ALL" && patient.acuityLevel !== selectedAcuity) return false;
    // Vent Mode Filter
    if (selectedVentMode !== "ALL" && patient.ventilator.mode !== selectedVentMode) return false;
    // Age Bracket Filter
    if (selectedAgeBracket !== "ALL" && patient.ageBracket !== selectedAgeBracket) return false;
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = patient.name.toLowerCase().includes(q);
      const matchMrn = patient.mrn.toLowerCase().includes(q);
      const matchBed = patient.bedNumber.toLowerCase().includes(q);
      const matchDx = patient.primaryDiagnosis.toLowerCase().includes(q);
      if (!matchName && !matchMrn && !matchBed && !matchDx) return false;
    }
    return true;
  });

  const clearAllFilters = () => {
    setSelectedPod("ALL");
    setSearchQuery("");
    setSelectedAcuity("ALL");
    setSelectedVentMode("ALL");
    setSelectedAgeBracket("ALL");
  };

  // Active Emergency Protocols Ticker
  const activeEmergencies = patients.flatMap((p) =>
    p.emergencyProtocols
      .filter((pr) => pr.status === "ACTIVE" || pr.status === "BEDSIDE_ACTIVE")
      .map((pr) => ({ ...pr, patientName: p.name, bedNumber: p.bedNumber }))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 font-sans space-y-6">
      {/* Active Emergency Protocol Ticker Banner */}
      {activeEmergencies.length > 0 && (
        <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xl shadow-rose-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 rounded-xl text-slate-950 animate-bounce">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-rose-400 tracking-wider">
                Active Bedside Emergency Protocols ({activeEmergencies.length}):
              </span>
              <div className="flex items-center gap-4 text-xs font-bold text-white mt-0.5 flex-wrap">
                {activeEmergencies.map((em) => (
                  <span key={em.id} className="flex items-center gap-1.5">
                    <span className="text-amber-300">{em.patientName}</span> ({em.bedNumber}):{" "}
                    <span className="text-rose-300 uppercase">{em.protocol.replace(/_/g, " ")}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ward Metrics & Control Header */}
      {metrics && (
        <PicuMetricsHeader
          metrics={metrics}
          isLiveStreaming={isLiveStreaming}
          onToggleStreaming={() => setIsLiveStreaming(!isLiveStreaming)}
          onOpenAdmissionModal={() => setIsAdmissionOpen(true)}
          onOpenDrugDosingModal={() => setIsDrugDosingOpen(true)}
          selectedPod={selectedPod}
          onSelectPod={setSelectedPod}
        />
      )}

      {/* Filter & View Toolbar */}
      <PicuFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAcuity={selectedAcuity}
        onAcuityChange={setSelectedAcuity}
        selectedVentMode={selectedVentMode}
        onVentModeChange={setSelectedVentMode}
        selectedAgeBracket={selectedAgeBracket}
        onAgeBracketChange={setSelectedAgeBracket}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        soundAlertsEnabled={soundAlertsEnabled}
        onToggleSoundAlerts={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
        onClearFilters={clearAllFilters}
      />

      {/* Patient Telemetry Station Views */}
      {filteredPatients.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-xl">
          <Activity className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Pediatric Patients Match Current Filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria or select &quot;All Pods&quot; to view all admitted patients in the unit.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <PicuPatientCard
              key={patient.id}
              patient={patient}
              onInspect={(p) => setInspectingPatient(p)}
              onOpenAlerts={(p) => setAlertPatient(p)}
              onOpenEscalation={(p) => setEscalatingPatient(p)}
            />
          ))}
        </div>
      ) : (
        /* High-Density Central Station Matrix Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4">Bed & Patient</th>
                  <th className="py-4 px-3">Age / Wt</th>
                  <th className="py-4 px-3">Acuity</th>
                  <th className="py-4 px-3">HR (bpm)</th>
                  <th className="py-4 px-3">BP (MAP)</th>
                  <th className="py-4 px-3">SpO₂</th>
                  <th className="py-4 px-3">Ventilator</th>
                  <th className="py-4 px-3">OI / OSI</th>
                  <th className="py-4 px-3">VIS Score</th>
                  <th className="py-4 px-3">PEWS</th>
                  <th className="py-4 px-3">Fluid %FO</th>
                  <th className="py-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span className="font-mono text-cyan-400">{p.bedNumber.split("-")[0]}</span>
                        <span>{p.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{p.mrn}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-slate-300 font-bold">{p.ageYears > 0 ? `${p.ageYears}y` : `${p.ageMonths}m`}</span>
                      <div className="text-[10px] text-slate-400">{p.weightKg} kg</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        p.acuityLevel === "CRITICAL_INSTABILITY" || p.acuityLevel === "CODE_PALS"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : p.acuityLevel === "HIGH_ACUITY"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {p.acuityLevel.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-white">{p.vitals.heartRate}</td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className="text-white">{p.vitals.systolicBp}/{p.vitals.diastolicBp}</span>
                      <span className="text-[10px] text-cyan-400 font-bold ml-1">({p.vitals.meanArterialPressure})</span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold">
                      <span className={p.vitals.spO2 < 90 ? "text-rose-400" : "text-emerald-400"}>{p.vitals.spO2}%</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-sky-300">{p.ventilator.mode}</span>
                      <div className="text-[10px] text-slate-400">FiO₂ {Math.round(p.ventilator.fiO2 * 100)}%</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className={p.pulmonaryIndices.oxygenationIndex >= 16 ? "text-rose-400 font-bold" : "text-white"}>
                        {p.pulmonaryIndices.oxygenationIndex}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className={p.vasoactiveSupport.vasoactiveInotropicScore >= 15 ? "text-amber-400 font-bold" : "text-white"}>
                        {p.vasoactiveSupport.vasoactiveInotropicScore}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        p.pews.totalPews >= 5 ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-300"
                      }`}>
                        {p.pews.totalPews}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className={p.fluidRenalStatus.percentFluidOverload >= 10 ? "text-rose-400 font-bold" : "text-white"}>
                        {p.fluidRenalStatus.percentFluidOverload}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectingPatient(p)}
                          className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-[11px]"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => setEscalatingPatient(p)}
                          className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold rounded-lg text-[11px]"
                        >
                          PALS
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {inspectingPatient && (
        <PicuTelemetryInspectorModal
          patient={inspectingPatient}
          isOpen={!!inspectingPatient}
          onClose={() => setInspectingPatient(null)}
          onOpenEscalation={(p) => {
            setInspectingPatient(null);
            setEscalatingPatient(p);
          }}
        />
      )}

      {alertPatient && (
        <PicuAlertConsoleModal
          patient={alertPatient}
          isOpen={!!alertPatient}
          onClose={() => setAlertPatient(null)}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />
      )}

      {escalatingPatient && (
        <PicuEmergencyEscalationModal
          patient={escalatingPatient}
          isOpen={!!escalatingPatient}
          onClose={() => setEscalatingPatient(null)}
          onDispatchProtocol={handleDispatchProtocol}
        />
      )}

      {isAdmissionOpen && (
        <PicuAdmissionModal
          isOpen={isAdmissionOpen}
          onClose={() => setIsAdmissionOpen(false)}
          onAdmitPatient={handleAdmitPatient}
        />
      )}

      {isDrugDosingOpen && (
        <PicuDrugDosingModal
          isOpen={isDrugDosingOpen}
          onClose={() => setIsDrugDosingOpen(false)}
        />
      )}
    </div>
  );
};

export default PicuCriticalCareHub;

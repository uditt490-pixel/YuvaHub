import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Activity, 
  Flame, 
  Droplet, 
  Timer, 
  HeartCrack, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Radio,
  FileCode,
  Download,
  Zap
} from "lucide-react";
import { TraumaPatient, TraumaTriageLevel, HemorrhagicShockClass, ResuscitationPhase } from "../../types/traumaTelemetry";
import { TraumaTelemetryService } from "../../services/TraumaTelemetryService";
import { TraumaMetricsHeader } from "../../components/Enterprise/Trauma/TraumaMetricsHeader";
import { TraumaFilterToolbar } from "../../components/Enterprise/Trauma/TraumaFilterToolbar";
import { TraumaPatientCard } from "../../components/Enterprise/Trauma/TraumaPatientCard";
import { TraumaTelemetryInspectorModal } from "../../components/Enterprise/Trauma/TraumaTelemetryInspectorModal";
import { TraumaAlertConsoleModal } from "../../components/Enterprise/Trauma/TraumaAlertConsoleModal";
import { TraumaEmergencyEscalationModal } from "../../components/Enterprise/Trauma/TraumaEmergencyEscalationModal";
import { TraumaIntakeModal } from "../../components/Enterprise/Trauma/TraumaIntakeModal";
import { TraumaCalculatorModal } from "../../components/Enterprise/Trauma/TraumaCalculatorModal";
import { TraumaTegRotemModal } from "../../components/Enterprise/Trauma/TraumaTegRotemModal";

export const EmergencyTraumaResuscitationHub: React.FC = () => {
  const service = TraumaTelemetryService.getInstance();
  const [patients, setPatients] = useState<TraumaPatient[]>([]);
  const [overview, setOverview] = useState(service.getCensusOverview());

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTriageLevel, setSelectedTriageLevel] = useState<TraumaTriageLevel | "ALL">("ALL");
  const [selectedShockClass, setSelectedShockClass] = useState<HemorrhagicShockClass | "ALL">("ALL");
  const [selectedPhase, setSelectedPhase] = useState<ResuscitationPhase | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  // Modals State
  const [selectedPatientForInspect, setSelectedPatientForInspect] = useState<TraumaPatient | null>(null);
  const [selectedPatientForEscalation, setSelectedPatientForEscalation] = useState<TraumaPatient | null>(null);
  const [isAlertConsoleOpen, setIsAlertConsoleOpen] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isTegModalOpen, setIsTegModalOpen] = useState(false);

  // Subscribe to real-time telemetry stream
  useEffect(() => {
    const unsubscribe = service.subscribe((livePatients) => {
      setPatients(livePatients);
      setOverview(service.getCensusOverview());
      // Refresh inspected patient if modal is active
      if (selectedPatientForInspect) {
        const found = livePatients.find((p) => p.id === selectedPatientForInspect.id);
        if (found) setSelectedPatientForInspect(found);
      }
    });
    return () => unsubscribe();
  }, [selectedPatientForInspect]);

  // Handlers
  const handleAcknowledgeAlert = (patientId: string, alertId: string, clinicianName: string) => {
    service.acknowledgeAlert(patientId, alertId, clinicianName);
  };

  const handleDispatchProtocol = (
    patientId: string,
    protocolType: "CODE_TRAUMA_ALPHA" | "MTP_ROUND_DISPATCH" | "EMERGENT_OR_STAT" | "REBOA_DEPLOY" | "REBOA_DEFLATE" | "TXA_BOLUS_ORDER" | "TEG_GUIDED_CRYO",
    notes: string
  ) => {
    service.dispatchEmergencyProtocol(patientId, protocolType, notes);
  };

  const handleAdmitPatient = (newPatient: TraumaPatient) => {
    service.updatePatient(newPatient);
  };

  // Filtered Patients List
  const filteredPatients = patients.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.traumaBayNumber.toLowerCase().includes(q) ||
        p.injuryMechanism.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedTriageLevel !== "ALL" && p.triageLevel !== selectedTriageLevel) {
      return false;
    }

    if (selectedShockClass !== "ALL" && p.shockClass !== selectedShockClass) {
      return false;
    }

    if (selectedPhase !== "ALL" && p.currentPhase !== selectedPhase) {
      return false;
    }

    if (filterCriticalOnly) {
      const isCritical = p.scores.shockIndex >= 1.2 || p.scores.lethalTriadIndex.triadCount >= 2 || p.scores.reverseShockIndexTimesGcs < 10.0;
      if (!isCritical) return false;
    }

    return true;
  });

  const totalAlertsCount = patients.reduce(
    (sum, p) => sum + p.activeAlerts.filter((a) => !a.acknowledged).length,
    0
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Census Header */}
      <TraumaMetricsHeader
        overview={overview}
        onOpenIntake={() => setIsIntakeOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenTegModal={() => setIsTegModalOpen(true)}
        onOpenAlertConsole={() => setIsAlertConsoleOpen(true)}
        totalAlertsCount={totalAlertsCount}
      />

      {/* Filter & Search Toolbar */}
      <TraumaFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTriageLevel={selectedTriageLevel}
        onTriageChange={setSelectedTriageLevel}
        selectedShockClass={selectedShockClass}
        onShockClassChange={setSelectedShockClass}
        selectedPhase={selectedPhase}
        onPhaseChange={setSelectedPhase}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterCriticalOnly={filterCriticalOnly}
        onToggleCriticalOnly={() => setFilterCriticalOnly(!filterCriticalOnly)}
      />

      {/* Live Resuscitation Stream Ticker */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-bold uppercase tracking-wide">Live Arterial & Telemetry Stream (1200ms Ticks)</span>
        </div>
        <div className="text-slate-400 hidden sm:block">
          Active Level 1 Trauma Center • ATLS Damage Control Protocol • MTP 1:1:1
        </div>
      </div>

      {/* Main Workspace Container */}
      <main className="p-4 flex-1 overflow-y-auto">
        {viewMode === "GRID" ? (
          /* Grid View of Trauma Bays */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPatients.map((patient) => (
              <TraumaPatientCard
                key={patient.id}
                patient={patient}
                onInspect={(p) => setSelectedPatientForInspect(p)}
                onOpenEscalation={(p) => setSelectedPatientForEscalation(p)}
              />
            ))}
          </div>
        ) : (
          /* Matrix Central Station Table View */
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Bay / MRN</th>
                    <th className="p-3">Patient & Mechanism</th>
                    <th className="p-3">Triage / Phase</th>
                    <th className="p-3 text-center">HR / BP (MAP)</th>
                    <th className="p-3 text-center">Shock Index</th>
                    <th className="p-3 text-center">rSIG × GCS</th>
                    <th className="p-3 text-center">ABC Score</th>
                    <th className="p-3 text-center">MTP (1:1:1)</th>
                    <th className="p-3 text-center">Lethal Triad</th>
                    <th className="p-3 text-center">REBOA</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredPatients.map((p) => {
                    const si = p.scores.shockIndex;
                    const rsig = p.scores.reverseShockIndexTimesGcs;
                    const isCrit = si >= 1.2 || p.scores.lethalTriadIndex.triadCount >= 2;
                    return (
                      <tr key={p.id} className={"hover:bg-slate-800/60 transition " + (isCrit ? "bg-rose-950/20" : "")}>
                        <td className="p-3 font-bold text-cyan-400">
                          {p.traumaBayNumber}
                          <span className="block text-[10px] text-slate-500">{p.mrn}</span>
                        </td>
                        <td className="p-3 font-sans">
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.injuryMechanism}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-rose-950 text-rose-400 border border-rose-800 block w-max">
                            {p.triageLevel.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{p.currentPhase.replace(/_/g, " ")}</span>
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.vitals.heartRate > 120 ? "text-rose-400" : "text-white"}>{p.vitals.heartRate}</span> / {p.vitals.systolicBp} ({p.vitals.meanArterialPressure})
                        </td>
                        <td className="p-3 text-center">
                          <span className={"font-bold px-1.5 py-0.5 rounded " + (si >= 1.2 ? "bg-rose-600 text-white font-black" : "text-cyan-300")}>
                            {si}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={"font-bold " + (rsig < 10.0 ? "text-red-400" : "text-emerald-400")}>
                            {rsig}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-amber-400">
                          {p.scores.abcScore}/4
                        </td>
                        <td className="p-3 text-center">
                          {p.bloodLedger.prbcUnitsTransfused} : {p.bloodLedger.ffpUnitsTransfused} : {p.bloodLedger.plateletPheresisUnitsTransfused}
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.scores.lethalTriadIndex.triadCount >= 2 ? "text-rose-400 font-black" : "text-slate-400"}>
                            {p.scores.lethalTriadIndex.triadCount}/3
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {p.reboa.status !== "NOT_INDICATED" ? (
                            <span className="text-violet-400 font-bold">{p.reboa.zone} ({p.reboa.elapsedInflationMinutes.toFixed(0)}m)</span>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 font-sans">
                            <button
                              onClick={() => setSelectedPatientForInspect(p)}
                              className="px-2.5 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-cyan-500/40 cursor-pointer"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => setSelectedPatientForEscalation(p)}
                              className="px-2.5 py-1 text-xs font-black uppercase bg-rose-700 hover:bg-rose-600 text-white rounded cursor-pointer"
                            >
                              STAT
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
      </main>

      {/* Modals Container */}
      <TraumaTelemetryInspectorModal
        isOpen={!!selectedPatientForInspect}
        onClose={() => setSelectedPatientForInspect(null)}
        patient={selectedPatientForInspect}
        onOpenEscalation={(p) => {
          setSelectedPatientForInspect(null);
          setSelectedPatientForEscalation(p);
        }}
      />

      <TraumaEmergencyEscalationModal
        isOpen={!!selectedPatientForEscalation}
        onClose={() => setSelectedPatientForEscalation(null)}
        patient={selectedPatientForEscalation}
        onDispatchProtocol={handleDispatchProtocol}
      />

      <TraumaAlertConsoleModal
        isOpen={isAlertConsoleOpen}
        onClose={() => setIsAlertConsoleOpen(false)}
        patients={patients}
        onAcknowledgeAlert={handleAcknowledgeAlert}
      />

      <TraumaIntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onAdmitPatient={handleAdmitPatient}
      />

      <TraumaCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <TraumaTegRotemModal
        isOpen={isTegModalOpen}
        onClose={() => setIsTegModalOpen(false)}
      />
    </div>
  );
};

export default EmergencyTraumaResuscitationHub;

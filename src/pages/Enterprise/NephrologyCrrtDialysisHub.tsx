import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Droplets, 
  Flame, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Sliders,
  ShieldAlert,
  Download,
  FileCode
} from "lucide-react";
import { NephrologyPatient, KdigoAkiStage, CrrtModality, AnticoagulationStrategy } from "../../types/nephrologyTelemetry";
import { NephrologyTelemetryService } from "../../services/NephrologyTelemetryService";
import { NephrologyMetricsHeader } from "../../components/Enterprise/Nephrology/NephrologyMetricsHeader";
import { NephrologyFilterToolbar } from "../../components/Enterprise/Nephrology/NephrologyFilterToolbar";
import { NephrologyPatientCard } from "../../components/Enterprise/Nephrology/NephrologyPatientCard";
import { NephrologyTelemetryInspectorModal } from "../../components/Enterprise/Nephrology/NephrologyTelemetryInspectorModal";
import { NephrologyAlertConsoleModal } from "../../components/Enterprise/Nephrology/NephrologyAlertConsoleModal";
import { NephrologyEmergencyEscalationModal } from "../../components/Enterprise/Nephrology/NephrologyEmergencyEscalationModal";
import { NephrologyAdmissionModal } from "../../components/Enterprise/Nephrology/NephrologyAdmissionModal";
import { NephrologyCalculatorModal } from "../../components/Enterprise/Nephrology/NephrologyCalculatorModal";
import { NephrologyCitrateTitrationModal } from "../../components/Enterprise/Nephrology/NephrologyCitrateTitrationModal";

export const NephrologyCrrtDialysisHub: React.FC = () => {
  const service = NephrologyTelemetryService.getInstance();
  const [patients, setPatients] = useState<NephrologyPatient[]>([]);
  const [overview, setOverview] = useState(service.getCensusOverview());

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKdigoStage, setSelectedKdigoStage] = useState<KdigoAkiStage | "ALL">("ALL");
  const [selectedModality, setSelectedModality] = useState<CrrtModality | "ALL">("ALL");
  const [selectedAnticoagulation, setSelectedAnticoagulation] = useState<AnticoagulationStrategy | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  // Modals
  const [selectedPatientForInspect, setSelectedPatientForInspect] = useState<NephrologyPatient | null>(null);
  const [selectedPatientForEscalation, setSelectedPatientForEscalation] = useState<NephrologyPatient | null>(null);
  const [isAlertConsoleOpen, setIsAlertConsoleOpen] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCitrateModalOpen, setIsCitrateModalOpen] = useState(false);

  // Real-time telemetry subscription
  useEffect(() => {
    const unsubscribe = service.subscribe((livePatients) => {
      setPatients(livePatients);
      setOverview(service.getCensusOverview());
      if (selectedPatientForInspect) {
        const found = livePatients.find((p) => p.id === selectedPatientForInspect.id);
        if (found) setSelectedPatientForInspect(found);
      }
    });
    return () => unsubscribe();
  }, [selectedPatientForInspect]);

  const handleAcknowledgeAlert = (patientId: string, alertId: string, clinicianName: string) => {
    service.acknowledgeAlert(patientId, alertId, clinicianName);
  };

  const handleDispatchProtocol = (
    patientId: string,
    protocolType: "STAT_EMERGENCY_HEMODIALYSIS" | "HYPERKALEMIA_COCKTAIL_STAT" | "CITRATE_TITRATION_ADJUST" | "DIALYZER_CIRCUIT_EXCHANGE" | "FLUID_OVERLOAD_DECONGESTION",
    notes: string
  ) => {
    service.dispatchEmergencyProtocol(patientId, protocolType, notes);
  };

  const handleAdmitPatient = (newPatient: NephrologyPatient) => {
    service.updatePatient(newPatient);
  };

  const filteredPatients = patients.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.renalWardBed.toLowerCase().includes(q) ||
        p.primaryEtiology.toLowerCase().includes(q) ||
        p.attendingNephrologist.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedKdigoStage !== "ALL" && p.kdigoStage !== selectedKdigoStage) {
      return false;
    }

    if (selectedModality !== "ALL" && p.currentModality !== selectedModality) {
      return false;
    }

    if (selectedAnticoagulation !== "ALL" && p.anticoagulation !== selectedAnticoagulation) {
      return false;
    }

    if (filterCriticalOnly) {
      const isCrit =
        p.electrolytes.serumPotassiumMeqL >= 6.0 ||
        p.circuit.transmembranePressureTmpMmHg >= 250 ||
        p.citrate.totalToIonizedCalciumRatio >= 2.5 ||
        p.kdigoStage === "STAGE_3_FAILURE";
      if (!isCrit) return false;
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
      <NephrologyMetricsHeader
        overview={overview}
        onOpenAdmission={() => setIsAdmissionOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenCitrateModal={() => setIsCitrateModalOpen(true)}
        onOpenAlertConsole={() => setIsAlertConsoleOpen(true)}
        totalAlertsCount={totalAlertsCount}
      />

      {/* Filter & Search Toolbar */}
      <NephrologyFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedKdigoStage={selectedKdigoStage}
        onKdigoStageChange={setSelectedKdigoStage}
        selectedModality={selectedModality}
        onModalityChange={setSelectedModality}
        selectedAnticoagulation={selectedAnticoagulation}
        onAnticoagulationChange={setSelectedAnticoagulation}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterCriticalOnly={filterCriticalOnly}
        onToggleCriticalOnly={() => setFilterCriticalOnly(!filterCriticalOnly)}
      />

      {/* Live Continuous Dialysis Ticker */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-bold uppercase tracking-wide">Live CRRT & Dialyzer Circuit Telemetry (1400ms Ticks)</span>
        </div>
        <div className="text-slate-400 hidden sm:block">
          KDIGO AKI Stage 1-3 • Regional Citrate Anticoagulation • Daugirdas Kt/V • Acid-Base Stewart Balance
        </div>
      </div>

      {/* Main Workspace */}
      <main className="p-4 flex-1 overflow-y-auto">
        {viewMode === "GRID" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPatients.map((patient) => (
              <NephrologyPatientCard
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
                    <th className="p-3">Bed / MRN</th>
                    <th className="p-3">Patient & Etiology</th>
                    <th className="p-3">KDIGO / Modality</th>
                    <th className="p-3 text-center">Creatinine (mg/dL)</th>
                    <th className="p-3 text-center">K+ (mEq/L)</th>
                    <th className="p-3 text-center">UO (mL/kg/h)</th>
                    <th className="p-3 text-center">Blood pH</th>
                    <th className="p-3 text-center">TMP (mmHg)</th>
                    <th className="p-3 text-center">Qb / Effluent</th>
                    <th className="p-3 text-center">Citrate Ratio</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredPatients.map((p) => {
                    const isCrit =
                      p.electrolytes.serumPotassiumMeqL >= 6.0 ||
                      p.circuit.transmembranePressureTmpMmHg >= 250 ||
                      p.citrate.totalToIonizedCalciumRatio >= 2.5;
                    return (
                      <tr key={p.id} className={"hover:bg-slate-800/60 transition " + (isCrit ? "bg-rose-950/20" : "")}>
                        <td className="p-3 font-bold text-cyan-400">
                          {p.renalWardBed}
                          <span className="block text-[10px] text-slate-500">{p.mrn}</span>
                        </td>
                        <td className="p-3 font-sans">
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.primaryEtiology}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-rose-950 text-rose-400 border border-rose-800 block w-max">
                            {p.kdigoStage.replace(/_/g, " ")}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{p.currentModality.split("_")[0]}</span>
                        </td>
                        <td className="p-3 text-center font-bold text-rose-400">
                          {p.electrolytes.serumCreatinineMgDl}
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.electrolytes.serumPotassiumMeqL >= 6.0 ? "text-rose-400 animate-pulse font-black" : "text-amber-300"}>
                            {p.electrolytes.serumPotassiumMeqL}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.urine.urineOutputNormalizedMlKgHr < 0.3 ? "text-rose-400" : "text-emerald-400"}>
                            {p.urine.urineOutputNormalizedMlKgHr}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.electrolytes.bloodPh < 7.30 ? "text-rose-400" : "text-cyan-300"}>
                            {p.electrolytes.bloodPh}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.circuit.transmembranePressureTmpMmHg >= 250 ? "text-rose-400 font-black animate-pulse" : "text-white"}>
                            {p.circuit.transmembranePressureTmpMmHg}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {p.circuit.bloodFlowRateQbMlMin} / {p.circuit.effluentDoseMlKgHr}
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.citrate.totalToIonizedCalciumRatio >= 2.5 ? "text-rose-400 font-black" : "text-slate-300"}>
                            {p.citrate.totalToIonizedCalciumRatio}
                          </span>
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
      <NephrologyTelemetryInspectorModal
        isOpen={!!selectedPatientForInspect}
        onClose={() => setSelectedPatientForInspect(null)}
        patient={selectedPatientForInspect}
        onOpenEscalation={(p) => {
          setSelectedPatientForInspect(null);
          setSelectedPatientForEscalation(p);
        }}
      />

      <NephrologyEmergencyEscalationModal
        isOpen={!!selectedPatientForEscalation}
        onClose={() => setSelectedPatientForEscalation(null)}
        patient={selectedPatientForEscalation}
        onDispatchProtocol={handleDispatchProtocol}
      />

      <NephrologyAlertConsoleModal
        isOpen={isAlertConsoleOpen}
        onClose={() => setIsAlertConsoleOpen(false)}
        patients={patients}
        onAcknowledgeAlert={handleAcknowledgeAlert}
      />

      <NephrologyAdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        onAdmitPatient={handleAdmitPatient}
      />

      <NephrologyCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <NephrologyCitrateTitrationModal
        isOpen={isCitrateModalOpen}
        onClose={() => setIsCitrateModalOpen(false)}
      />
    </div>
  );
};

export default NephrologyCrrtDialysisHub;

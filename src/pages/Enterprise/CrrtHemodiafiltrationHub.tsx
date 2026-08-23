import React, { useState, useEffect } from "react";
import {
  Droplets,
  Activity,
  Gauge,
  Radio,
  Plus,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Flame,
  LayoutGrid,
  Table
} from "lucide-react";
import { CrrtPatient, CrrtWardMetrics } from "../../types/crrtTelemetry";
import { CrrtTelemetryService } from "../../services/CrrtTelemetryService";
import { CrrtMetricsHeader } from "../../components/Enterprise/CRRT/CrrtMetricsHeader";
import { CrrtPatientCard } from "../../components/Enterprise/CRRT/CrrtPatientCard";
import { CrrtFilterToolbar } from "../../components/Enterprise/CRRT/CrrtFilterToolbar";
import { CrrtTelemetryInspectorModal } from "../../components/Enterprise/CRRT/CrrtTelemetryInspectorModal";
import { CrrtFilterClottingAlertModal } from "../../components/Enterprise/CRRT/CrrtFilterClottingAlertModal";
import { CrrtEmergencyProtocolModal } from "../../components/Enterprise/CRRT/CrrtEmergencyProtocolModal";
import { CrrtPrescriptionModal } from "../../components/Enterprise/CRRT/CrrtPrescriptionModal";
import { CrrtDoseCalculatorModal } from "../../components/Enterprise/CRRT/CrrtDoseCalculatorModal";

export const CrrtHemodiafiltrationHub: React.FC = () => {
  const [patients, setPatients] = useState<CrrtPatient[]>([]);
  const [metrics, setMetrics] = useState<CrrtWardMetrics | null>(null);
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [viewMode, setViewMode] = useState<"GRID" | "MATRIX">("GRID");

  // Filters
  const [selectedModality, setSelectedModality] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnticoagulation, setSelectedAnticoagulation] = useState("ALL");
  const [selectedHealth, setSelectedHealth] = useState("ALL");

  // Modals
  const [inspectingPatient, setInspectingPatient] = useState<CrrtPatient | null>(null);
  const [clottingPatient, setClottingPatient] = useState<CrrtPatient | null>(null);
  const [emergencyPatient, setEmergencyPatient] = useState<CrrtPatient | null>(null);
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [isDoseOpen, setIsDoseOpen] = useState(false);

  // Init Data
  useEffect(() => {
    const initial = CrrtTelemetryService.getMockCrrtPatients();
    setPatients(initial);
    setMetrics(CrrtTelemetryService.calculateWardMetrics(initial));
  }, []);

  // Live Hydraulics Streaming Loop
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setPatients((prev) => {
        const updated = CrrtTelemetryService.simulateCrrtTelemetryTick(prev);
        setMetrics(CrrtTelemetryService.calculateWardMetrics(updated));
        if (inspectingPatient) {
          const fresh = updated.find((p) => p.id === inspectingPatient.id);
          if (fresh) setInspectingPatient(fresh);
        }
        return updated;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isLiveStreaming, inspectingPatient]);

  // Handle Filter Alert Resolution
  const handleResolveAlert = (patientId: string, actionType: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          hydraulics: {
            ...p.hydraulics,
            transmembranePressureMmHg: Math.max(110, p.hydraulics.transmembranePressureMmHg - 50),
            filterPressureDropMmHg: Math.max(75, p.hydraulics.filterPressureDropMmHg - 40),
            healthStatus: "OPTIMAL"
          },
          alerts: p.alerts.filter((a) => !a.title.includes("Transmembrane"))
        };
      })
    );
  };

  // Handle Emergency Protocol Dispatch
  const handleDispatchProtocol = (patientId: string, protocolName: string, orderInstructions: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          prescription: {
            ...p.prescription,
            deliveredDoseMlKgHr: 35.0,
            netUltrafiltrationMlHr: protocolName.includes("PULMONARY") ? 350 : p.prescription.netUltrafiltrationMlHr
          },
          metabolics: {
            ...p.metabolics,
            potassiumMmolL: protocolName.includes("HYPERKALEMIA") ? 4.8 : p.metabolics.potassiumMmolL
          },
          alerts: p.alerts.filter((a) => !a.title.includes("Hyperkalemia"))
        };
      })
    );
  };

  // Handle New Prescription Intake
  const handlePrescribePatient = (newPatient: CrrtPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setMetrics((prev) => (prev ? CrrtTelemetryService.calculateWardMetrics([newPatient, ...patients]) : null));
  };

  // Filter Patients
  const filteredPatients = patients.filter((p) => {
    if (selectedModality !== "ALL" && p.modality !== selectedModality) return false;
    if (selectedAnticoagulation !== "ALL" && p.anticoagulation !== selectedAnticoagulation) return false;
    if (selectedHealth !== "ALL" && p.hydraulics.healthStatus !== selectedHealth) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchMrn = p.mrn.toLowerCase().includes(q);
      const matchDx = p.admissionDiagnosis.toLowerCase().includes(q);
      const matchAccess = p.vascularAccessLocation.toLowerCase().includes(q);
      if (!matchName && !matchMrn && !matchDx && !matchAccess) return false;
    }

    return true;
  });

  const clearAllFilters = () => {
    setSelectedModality("ALL");
    setSearchQuery("");
    setSelectedAnticoagulation("ALL");
    setSelectedHealth("ALL");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-8 font-sans space-y-6">
      {/* Metrics Header */}
      {metrics && (
        <CrrtMetricsHeader
          metrics={metrics}
          isLiveStreaming={isLiveStreaming}
          onToggleStreaming={() => setIsLiveStreaming(!isLiveStreaming)}
          onOpenPrescriptionModal={() => setIsPrescriptionOpen(true)}
          onOpenDoseModal={() => setIsDoseOpen(true)}
          selectedModality={selectedModality}
          onSelectModality={setSelectedModality}
        />
      )}

      {/* Filter Toolbar */}
      <CrrtFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedModality={selectedModality}
        onModalityChange={setSelectedModality}
        selectedAnticoagulation={selectedAnticoagulation}
        onAnticoagulationChange={setSelectedAnticoagulation}
        selectedHealth={selectedHealth}
        onHealthChange={setSelectedHealth}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onClearFilters={clearAllFilters}
      />

      {/* Patient Views */}
      {filteredPatients.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4 shadow-xl">
          <Droplets className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No CRRT Circuits Match Current Filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search query or select &quot;All Modalities&quot; to view all active circuits in the nephrology unit.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-cyan-600/30"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <CrrtPatientCard
              key={patient.id}
              patient={patient}
              onInspect={(p) => setInspectingPatient(p)}
              onOpenClottingModal={(p) => setClottingPatient(p)}
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
                  <th className="py-4 px-4">Patient & MRN</th>
                  <th className="py-4 px-3">Modality & Stage</th>
                  <th className="py-4 px-3">Blood Flow Q_b</th>
                  <th className="py-4 px-3">TMP & &Delta;P</th>
                  <th className="py-4 px-3">Health Status</th>
                  <th className="py-4 px-3">Delivered Dose</th>
                  <th className="py-4 px-3">Net UF Goal</th>
                  <th className="py-4 px-3">Citrate Ratio</th>
                  <th className="py-4 px-3">Potassium K+</th>
                  <th className="py-4 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPatients.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({p.gender === "MALE" ? "M" : "F"}, {p.ageYears}y)</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{p.mrn}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-cyan-300 font-bold">{p.modality}</span>
                        <div className="text-[10px] text-slate-400">KDIGO {p.kdigoStage.replace(/_/g, " ")}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-white">
                        {p.hydraulics.bloodFlowRateMlMin} mL/min
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className={`font-bold ${p.hydraulics.transmembranePressureMmHg > 250 ? "text-rose-400" : "text-cyan-300"}`}>
                          {p.hydraulics.transmembranePressureMmHg} mmHg
                        </span>
                        <div className="text-[10px] text-slate-500">&Delta;P: {p.hydraulics.filterPressureDropMmHg} mmHg</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          p.hydraulics.healthStatus === "OPTIMAL"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : p.hydraulics.healthStatus === "MODERATE_FOULING"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                        }`}>
                          {p.hydraulics.healthStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">
                        {p.prescription.deliveredDoseMlKgHr} mL/kg/h
                      </td>
                      <td className="py-3.5 px-3 font-mono text-white">
                        {p.prescription.netUltrafiltrationMlHr} mL/h
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className={p.citrateTelemetry.totalToIonizedCalciumRatio > 2.5 ? "text-rose-400 font-bold" : "text-slate-300"}>
                          {p.citrateTelemetry.totalToIonizedCalciumRatio}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        <span className={p.metabolics.potassiumMmolL > 6.0 ? "text-rose-400 font-black animate-pulse" : "text-white"}>
                          {p.metabolics.potassiumMmolL} mmol/L
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectingPatient(p)}
                            className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-[11px]"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => setClottingPatient(p)}
                            className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold rounded-lg text-[11px]"
                          >
                            Filter
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
        <CrrtTelemetryInspectorModal
          patient={inspectingPatient}
          isOpen={!!inspectingPatient}
          onClose={() => setInspectingPatient(null)}
          onOpenClottingModal={(p) => {
            setInspectingPatient(null);
            setClottingPatient(p);
          }}
          onOpenEmergencyModal={(p) => {
            setInspectingPatient(null);
            setEmergencyPatient(p);
          }}
        />
      )}

      {clottingPatient && (
        <CrrtFilterClottingAlertModal
          patient={clottingPatient}
          isOpen={!!clottingPatient}
          onClose={() => setClottingPatient(null)}
          onResolveAlert={handleResolveAlert}
        />
      )}

      {emergencyPatient && (
        <CrrtEmergencyProtocolModal
          patient={emergencyPatient}
          isOpen={!!emergencyPatient}
          onClose={() => setEmergencyPatient(null)}
          onDispatchProtocol={handleDispatchProtocol}
        />
      )}

      {isPrescriptionOpen && (
        <CrrtPrescriptionModal
          isOpen={isPrescriptionOpen}
          onClose={() => setIsPrescriptionOpen(false)}
          onPrescribe={handlePrescribePatient}
        />
      )}

      {isDoseOpen && (
        <CrrtDoseCalculatorModal
          isOpen={isDoseOpen}
          onClose={() => setIsDoseOpen(false)}
        />
      )}
    </div>
  );
};

export default CrrtHemodiafiltrationHub;

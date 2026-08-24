import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Baby, 
  Flame, 
  Wind, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Sliders,
  ShieldAlert,
  Download,
  FileCode,
  Heart
} from "lucide-react";
import { 
  PicuPatient, 
  PediatricAgeGroup, 
  PicuUnitCareLevel, 
  PediatricVentilationMode 
} from "../../types/picuTelemetry";
import { PicuTelemetryService } from "../../services/PicuTelemetryService";
import { PicuMetricsHeader } from "../../components/Enterprise/Picu/PicuMetricsHeader";
import { PicuFilterToolbar } from "../../components/Enterprise/Picu/PicuFilterToolbar";
import { PicuPatientCard } from "../../components/Enterprise/Picu/PicuPatientCard";
import { PicuTelemetryInspectorModal } from "../../components/Enterprise/Picu/PicuTelemetryInspectorModal";
import { PicuAlertConsoleModal } from "../../components/Enterprise/Picu/PicuAlertConsoleModal";
import { PicuEmergencyEscalationModal } from "../../components/Enterprise/Picu/PicuEmergencyEscalationModal";
import { PicuAdmissionModal } from "../../components/Enterprise/Picu/PicuAdmissionModal";
import { PicuCalculatorModal } from "../../components/Enterprise/Picu/PicuCalculatorModal";
import { PicuIncubatorModal } from "../../components/Enterprise/Picu/PicuIncubatorModal";

export const PicuNeonatalCriticalCareHub: React.FC = () => {
  const service = PicuTelemetryService.getInstance();
  const [patients, setPatients] = useState<PicuPatient[]>([]);
  const [overview, setOverview] = useState(service.getCensusOverview());

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<PediatricAgeGroup | "ALL">("ALL");
  const [selectedCareUnit, setSelectedCareUnit] = useState<PicuUnitCareLevel | "ALL">("ALL");
  const [selectedVentMode, setSelectedVentMode] = useState<PediatricVentilationMode | "ALL">("ALL");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  // Modals
  const [selectedPatientForInspect, setSelectedPatientForInspect] = useState<PicuPatient | null>(null);
  const [selectedPatientForEscalation, setSelectedPatientForEscalation] = useState<PicuPatient | null>(null);
  const [isAlertConsoleOpen, setIsAlertConsoleOpen] = useState(false);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isIncubatorModalOpen, setIsIncubatorModalOpen] = useState(false);

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
    protocolType: "PALS_CODE_BLUE_STAT" | "NEONATAL_D10W_BOLUS" | "INHALED_NITRIC_OXIDE_PPHN" | "HFOV_TRANSITION_RESCUE" | "ADENOSINE_SVT_RAPID_PUSH",
    notes: string
  ) => {
    service.dispatchEmergencyProtocol(patientId, protocolType, notes);
  };

  const handleAdmitPatient = (newPatient: PicuPatient) => {
    service.updatePatient(newPatient);
  };

  const filteredPatients = patients.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.bedIsoletteNumber.toLowerCase().includes(q) ||
        p.primaryDiagnosis.toLowerCase().includes(q) ||
        p.attendingPediatrician.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedAgeGroup !== "ALL" && p.ageGroup !== selectedAgeGroup) {
      return false;
    }

    if (selectedCareUnit !== "ALL" && p.careUnit !== selectedCareUnit) {
      return false;
    }

    if (selectedVentMode !== "ALL" && p.ventilationMode !== selectedVentMode) {
      return false;
    }

    if (filterCriticalOnly) {
      const isCrit =
        p.pews.totalPewsScore >= 6 ||
        p.oxygenation.oxygenationIndexOI >= 16 ||
        p.vitals.prePostDuctalSpO2Delta >= 5;
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
      <PicuMetricsHeader
        overview={overview}
        onOpenAdmission={() => setIsAdmissionOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenIncubatorModal={() => setIsIncubatorModalOpen(true)}
        onOpenAlertConsole={() => setIsAlertConsoleOpen(true)}
        totalAlertsCount={totalAlertsCount}
      />

      {/* Filter & Search Toolbar */}
      <PicuFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedAgeGroup={selectedAgeGroup}
        onAgeGroupChange={setSelectedAgeGroup}
        selectedCareUnit={selectedCareUnit}
        onCareUnitChange={setSelectedCareUnit}
        selectedVentMode={selectedVentMode}
        onVentModeChange={setSelectedVentMode}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterCriticalOnly={filterCriticalOnly}
        onToggleCriticalOnly={() => setFilterCriticalOnly(!filterCriticalOnly)}
      />

      {/* Live Continuous Pediatric Ticker */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
          <span className="text-pink-400 font-bold uppercase tracking-wide">Live PICU & Isolette Telemetry Feed (1300ms Ticks)</span>
        </div>
        <div className="text-slate-400 hidden sm:block">
          PALS Resuscitation Dosing • PEWS Scoring • PALICC PARDS OI • Ductal Delta Gradient • Servo Thermal Regulation
        </div>
      </div>

      {/* Main Workspace */}
      <main className="p-4 flex-1 overflow-y-auto">
        {viewMode === "GRID" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPatients.map((patient) => (
              <PicuPatientCard
                key={patient.id}
                patient={patient}
                onInspect={(p) => setSelectedPatientForInspect(p)}
                onOpenEscalation={(p) => setSelectedPatientForEscalation(p)}
              />
            ))}
          </div>
        ) : (
          /* Matrix Table View */
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Isolette / Bed</th>
                    <th className="p-3">Patient & Diagnosis</th>
                    <th className="p-3">Broselow / Wt</th>
                    <th className="p-3 text-center">HR (bpm)</th>
                    <th className="p-3 text-center">BP (MAP)</th>
                    <th className="p-3 text-center">Pre/Post SpO2</th>
                    <th className="p-3 text-center">Ductal Δ</th>
                    <th className="p-3 text-center">PEWS</th>
                    <th className="p-3 text-center">OI Index</th>
                    <th className="p-3 text-center">Epi IV Dose</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredPatients.map((p) => {
                    const isCrit =
                      p.pews.totalPewsScore >= 6 ||
                      p.oxygenation.oxygenationIndexOI >= 16 ||
                      p.vitals.prePostDuctalSpO2Delta >= 5;
                    return (
                      <tr key={p.id} className={"hover:bg-slate-800/60 transition " + (isCrit ? "bg-rose-950/20" : "")}>
                        <td className="p-3 font-bold text-pink-300">
                          {p.bedIsoletteNumber}
                          <span className="block text-[10px] text-slate-500">{p.mrn}</span>
                        </td>
                        <td className="p-3 font-sans">
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{p.primaryDiagnosis}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-slate-800 text-pink-300 border border-slate-700 block w-max">
                            {p.palsDosing.broselowColor.split("_")[0]}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{p.currentWeightKg < 2 ? (p.currentWeightKg * 1000) + "g" : p.currentWeightKg + "kg"}</span>
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.vitals.heartRate > 180 || p.vitals.heartRate < 80 ? "text-rose-400 animate-pulse font-black" : "text-slate-200"}>
                            {p.vitals.heartRate}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold">
                          {p.vitals.systolicBp}/{p.vitals.diastolicBp} ({p.vitals.meanArterialPressure})
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className="text-emerald-400">{p.vitals.spO2PreDuctalRightHandPercent}%</span> / <span>{p.vitals.spO2PostDuctalFootPercent}%</span>
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.vitals.prePostDuctalSpO2Delta >= 5 ? "text-rose-400 animate-pulse font-black" : "text-slate-300"}>
                            {p.vitals.prePostDuctalSpO2Delta}%
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.pews.totalPewsScore >= 6 ? "text-rose-400 font-black animate-pulse" : "text-amber-300"}>
                            {p.pews.totalPewsScore}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold">
                          <span className={p.oxygenation.oxygenationIndexOI >= 16 ? "text-rose-400 font-black animate-pulse" : "text-cyan-300"}>
                            {p.oxygenation.oxygenationIndexOI}
                          </span>
                        </td>
                        <td className="p-3 text-center font-bold text-pink-300">
                          {p.palsDosing.epinephrineIvIoBolusMg} mg
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 font-sans">
                            <button
                              onClick={() => setSelectedPatientForInspect(p)}
                              className="px-2.5 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-pink-300 rounded border border-pink-500/40 cursor-pointer"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => setSelectedPatientForEscalation(p)}
                              className="px-2.5 py-1 text-xs font-black uppercase bg-rose-700 hover:bg-rose-600 text-white rounded cursor-pointer"
                            >
                              PALS
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
      <PicuTelemetryInspectorModal
        isOpen={!!selectedPatientForInspect}
        onClose={() => setSelectedPatientForInspect(null)}
        patient={selectedPatientForInspect}
        onOpenEscalation={(p) => {
          setSelectedPatientForInspect(null);
          setSelectedPatientForEscalation(p);
        }}
      />

      <PicuEmergencyEscalationModal
        isOpen={!!selectedPatientForEscalation}
        onClose={() => setSelectedPatientForEscalation(null)}
        patient={selectedPatientForEscalation}
        onDispatchProtocol={handleDispatchProtocol}
      />

      <PicuAlertConsoleModal
        isOpen={isAlertConsoleOpen}
        onClose={() => setIsAlertConsoleOpen(false)}
        patients={patients}
        onAcknowledgeAlert={handleAcknowledgeAlert}
      />

      <PicuAdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        onAdmitPatient={handleAdmitPatient}
      />

      <PicuCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <PicuIncubatorModal
        isOpen={isIncubatorModalOpen}
        onClose={() => setIsIncubatorModalOpen(false)}
      />
    </div>
  );
};

export default PicuNeonatalCriticalCareHub;

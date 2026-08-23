import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  Heart,
  Wind,
  Droplet,
  Brain,
  ShieldAlert,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock,
  Radio,
  FileSpreadsheet,
  Stethoscope,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  User,
  Plus,
  Flame,
  Cpu
} from 'lucide-react';
import {
  ClinicalPatientRecord,
  ClinicalFilterQuery,
  TelemetrySummaryMetrics,
  ClinicalDomain,
  ClinicalAcuityLevel,
  EmergencyProtocolEscalation
} from '../../types/clinicalTelemetry';
import { ClinicalTelemetryService } from '../../services/ClinicalTelemetryService';
import { ClinicalTelemetryMetricsCard } from '../../components/Enterprise/ClinicalTelemetryMetricsCard';
import { ClinicalFilterToolbar } from '../../components/Enterprise/ClinicalFilterToolbar';
import { TelemetryInspectorModal } from '../../components/Enterprise/TelemetryInspectorModal';
import { ClinicalAlertInspectorModal } from '../../components/Enterprise/ClinicalAlertInspectorModal';
import { EmergencyEscalationModal } from '../../components/Enterprise/EmergencyEscalationModal';
import { PatientAdmissionModal } from '../../components/Enterprise/PatientAdmissionModal';

export const BioAiClinicalTelemetryHub: React.FC = () => {
  const [patients, setPatients] = useState<ClinicalPatientRecord[]>([]);
  const [metrics, setMetrics] = useState<TelemetrySummaryMetrics>({
    totalMonitored: 0,
    criticalCount: 0,
    warningCount: 0,
    stableCount: 0,
    sepsisRiskCount: 0,
    activeEscalationsCount: 0,
    avgAiRiskScore: 0,
    telemetryUptimePercent: 99.98,
  });

  const [filters, setFilters] = useState<ClinicalFilterQuery>({
    domain: 'ALL',
    acuityLevel: 'ALL',
    search: '',
    alertsOnly: false,
  });

  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE' | 'ESCALATIONS'>('GRID');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [lastStreamTime, setLastStreamTime] = useState<string>(new Date().toLocaleTimeString());

  // Modals state
  const [selectedPatientForInspect, setSelectedPatientForInspect] = useState<ClinicalPatientRecord | null>(null);
  const [selectedPatientForAlerts, setSelectedPatientForAlerts] = useState<ClinicalPatientRecord | null>(null);
  const [selectedPatientForEscalation, setSelectedPatientForEscalation] = useState<ClinicalPatientRecord | null>(null);
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);

  // Fetch / Sync Data
  const loadData = useCallback(async () => {
    const pts = await ClinicalTelemetryService.getPatients(filters);
    const m = await ClinicalTelemetryService.getSummaryMetrics();
    setPatients(pts);
    setMetrics(m);
    setLastStreamTime(new Date().toLocaleTimeString());

    // Update opened inspector patient reference if active
    if (selectedPatientForInspect) {
      const updated = await ClinicalTelemetryService.getPatientById(selectedPatientForInspect.id);
      if (updated) setSelectedPatientForInspect(updated);
    }
  }, [filters, selectedPatientForInspect]);

  useEffect(() => {
    loadData();
  }, [filters]);

  // Real-time telemetry stochastic stream interval (every 3000ms)
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(async () => {
      await ClinicalTelemetryService.tickTelemetryStream();
      loadData();
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming, loadData]);

  const handleFilterUpdate = (newFilter: Partial<ClinicalFilterQuery>) => {
    setFilters((prev) => ({ ...prev, ...newFilter }));
  };

  const getAcuityColor = (acuity: ClinicalAcuityLevel) => {
    switch (acuity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'WARNING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'MONITOR':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 lg:p-8 space-y-6 font-sans">
      {/* Top Telemetry KPI & Domain Navigation */}
      <ClinicalTelemetryMetricsCard
        metrics={metrics}
        activeDomain={filters.domain || 'ALL'}
        onSelectDomain={(dom) => handleFilterUpdate({ domain: dom })}
        activeAcuity={filters.acuityLevel || 'ALL'}
        onSelectAcuity={(acu) => handleFilterUpdate({ acuityLevel: acu })}
        isLiveStreaming={isLiveStreaming}
        onToggleStreaming={() => setIsLiveStreaming(!isLiveStreaming)}
      />

      {/* Filter and View Modes Bar */}
      <ClinicalFilterToolbar
        filters={filters}
        onFilterChange={handleFilterUpdate}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenAdmission={() => setIsAdmissionOpen(true)}
        onRefresh={loadData}
      />

      {/* VIEW 1: CARD GRID VIEW */}
      {viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No Patient Telemetry Streams Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No active bedside telemetry nodes match your current search queries or domain filter parameters.
              </p>
            </div>
          ) : (
            patients.map((patient) => {
              const isCrit = patient.acuityLevel === 'CRITICAL';
              return (
                <div
                  key={patient.id}
                  className={`relative rounded-2xl border transition-all duration-200 overflow-hidden bg-slate-900/90 hover:border-slate-700 shadow-xl flex flex-col justify-between ${
                    isCrit ? 'border-rose-500/50 ring-1 ring-rose-500/30' : 'border-slate-800'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">{patient.fullName}</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800">
                          {patient.mrn}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{patient.age}y • {patient.sex}</span>
                        <span>•</span>
                        <strong className="text-slate-200">{patient.bedNumber}</strong>
                        <span>•</span>
                        <span>{patient.ward.split('(')[0]}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-lg border ${getAcuityColor(patient.acuityLevel)}`}>
                      {patient.acuityLevel}
                    </span>
                  </div>

                  {/* Primary Diagnosis */}
                  <div className="px-4 py-2 bg-slate-950/30 border-b border-slate-800 text-[11px] text-slate-300 truncate">
                    <span className="text-slate-500 font-medium">Dx:</span> {patient.primaryDiagnosis}
                  </div>

                  {/* Multiparameter Live Vitals Strip */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {/* Heart Rate */}
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 block">HR</span>
                        <div className="text-lg font-black font-mono text-rose-400">
                          {patient.vitals.heartRateBpm}
                        </div>
                        <span className="text-[9px] text-slate-500">bpm</span>
                      </div>

                      {/* BP & MAP */}
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 block">BP / MAP</span>
                        <div className="text-sm font-black font-mono text-cyan-300 mt-0.5">
                          {patient.vitals.systolicBpMmHg}/{patient.vitals.diastolicBpMmHg}
                        </div>
                        <span className="text-[9px] text-cyan-400 font-mono">MAP {patient.calculations.meanArterialPressure}</span>
                      </div>

                      {/* SpO2 */}
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800/80">
                        <span className="text-[10px] font-bold text-slate-400 block">SpO2</span>
                        <div className={`text-lg font-black font-mono ${patient.vitals.spO2Percent < 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {patient.vitals.spO2Percent}%
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono">FiO2 {patient.vitals.fiO2Percent}%</span>
                      </div>
                    </div>

                    {/* Secondary Vitals Grid */}
                    <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                      <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">RR</span>
                        <span className="font-mono font-bold text-amber-300 text-xs">{patient.vitals.respiratoryRateMin}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">Temp</span>
                        <span className="font-mono font-bold text-orange-300 text-xs">{patient.vitals.temperatureCelsius}°C</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">Lactate</span>
                        <span className={`font-mono font-bold text-xs ${patient.vitals.lactateMmolL >= 4.0 ? 'text-rose-400' : 'text-slate-200'}`}>
                          {patient.vitals.lactateMmolL}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block">AI Risk</span>
                        <span className="font-mono font-bold text-violet-400 text-xs">
                          {(patient.biomarkers.aiDeteriorationRiskScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Active Alerts Banner */}
                    {patient.alerts.length > 0 && (
                      <div
                        onClick={() => setSelectedPatientForAlerts(patient)}
                        className="p-2 rounded-xl bg-rose-950/30 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between cursor-pointer hover:bg-rose-950/40 transition-all"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-bounce" />
                          <span className="font-bold truncate">{patient.alerts[0].metric}: {patient.alerts[0].value}</span>
                        </div>
                        <span className="text-[10px] font-bold underline shrink-0">Review ({patient.alerts.length})</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedPatientForEscalation(patient)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      <span>Escalate</span>
                    </button>

                    <button
                      onClick={() => setSelectedPatientForInspect(patient)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-cyan-500/10"
                    >
                      <span>Deep Inspector</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: HIGH-DENSITY MATRIX TABLE */}
      {viewMode === 'TABLE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider font-mono">
                <tr>
                  <th className="p-3.5">Patient / MRN</th>
                  <th className="p-3.5">Ward & Bed</th>
                  <th className="p-3.5">Acuity</th>
                  <th className="p-3.5">HR (bpm)</th>
                  <th className="p-3.5">BP / MAP</th>
                  <th className="p-3.5">SpO2</th>
                  <th className="p-3.5">RR</th>
                  <th className="p-3.5">Lactate</th>
                  <th className="p-3.5">qSOFA</th>
                  <th className="p-3.5">NEWS2</th>
                  <th className="p-3.5">Bio-AI Risk</th>
                  <th className="p-3.5">Alerts</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {patients.map((pt) => (
                  <tr key={pt.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{pt.fullName}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">{pt.mrn}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{pt.bedNumber}</div>
                      <div className="text-[10px] text-slate-400">{pt.ward.split('(')[0]}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${getAcuityColor(pt.acuityLevel)}`}>
                        {pt.acuityLevel}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-rose-400">{pt.vitals.heartRateBpm}</td>
                    <td className="p-3.5 font-mono font-bold text-cyan-300">
                      {pt.vitals.systolicBpMmHg}/{pt.vitals.diastolicBpMmHg}{' '}
                      <span className="text-slate-400 text-[10px]">({pt.calculations.meanArterialPressure})</span>
                    </td>
                    <td className={`p-3.5 font-mono font-bold ${pt.vitals.spO2Percent < 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {pt.vitals.spO2Percent}%
                    </td>
                    <td className="p-3.5 font-mono text-amber-300 font-bold">{pt.vitals.respiratoryRateMin}</td>
                    <td className={`p-3.5 font-mono font-bold ${pt.vitals.lactateMmolL >= 4.0 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {pt.vitals.lactateMmolL}
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pt.calculations.qSofaHighRisk ? 'bg-rose-500/20 text-rose-400' : 'text-slate-300'}`}>
                        {pt.calculations.qSofaScore}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${pt.calculations.news2RiskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'text-slate-300'}`}>
                        {pt.calculations.news2Score}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-violet-400 font-bold">
                      {(pt.biomarkers.aiDeteriorationRiskScore * 100).toFixed(0)}%
                    </td>
                    <td className="p-3.5">
                      {pt.alerts.length > 0 ? (
                        <button
                          onClick={() => setSelectedPatientForAlerts(pt)}
                          className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold cursor-pointer hover:bg-rose-500/30"
                        >
                          {pt.alerts.length} Active
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Normal</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => setSelectedPatientForInspect(pt)}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: ACTIVE ESCALATIONS TRACKER */}
      {viewMode === 'ESCALATIONS' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              Active Emergency Protocol Resuscitation Queue
            </h3>
            <span className="text-xs text-slate-400">
              Live Medical Alert Broadcast Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.flatMap((p) => p.activeEscalations.map((esc) => ({ ...esc, patientName: p.fullName, patientBed: p.bedNumber, patientMrn: p.mrn }))).length === 0 ? (
              <div className="col-span-full p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-300">No Active Emergency Escalations</h3>
                <p className="text-xs text-slate-500 mt-1">All monitored patients are operating within supervised clinical limits.</p>
              </div>
            ) : (
              patients.flatMap((p) => p.activeEscalations.map((esc) => ({ ...esc, patientName: p.fullName, patientBed: p.bedNumber, patientMrn: p.mrn }))).map((esc) => (
                <div key={esc.id} className="p-4 rounded-2xl bg-slate-900 border border-rose-500/40 space-y-3 shadow-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-[10px] font-black rounded bg-rose-500 text-slate-950 uppercase">
                        {esc.protocolType}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{esc.patientName} ({esc.patientMrn})</h4>
                      <div className="text-xs text-slate-400">{esc.patientBed}</div>
                    </div>
                    <span className="px-2 py-1 text-xs font-mono font-bold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {esc.teamPagingStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <strong className="text-rose-400">Clinical Rationale:</strong> {esc.clinicalRationale}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-800 pt-2">
                    <span>Authorized by: {esc.triggeredBy}</span>
                    <span>{new Date(esc.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Interactive Inspector Modals */}
      {selectedPatientForInspect && (
        <TelemetryInspectorModal
          patient={selectedPatientForInspect}
          onClose={() => setSelectedPatientForInspect(null)}
          onTriggerEscalation={(p) => setSelectedPatientForEscalation(p)}
          onOpenAlerts={(p) => setSelectedPatientForAlerts(p)}
        />
      )}

      {selectedPatientForAlerts && (
        <ClinicalAlertInspectorModal
          patient={selectedPatientForAlerts}
          onClose={() => setSelectedPatientForAlerts(null)}
          onAlertAcknowledged={loadData}
          onTriggerEscalation={(p) => setSelectedPatientForEscalation(p)}
        />
      )}

      {selectedPatientForEscalation && (
        <EmergencyEscalationModal
          patient={selectedPatientForEscalation}
          onClose={() => setSelectedPatientForEscalation(null)}
          onEscalationSuccess={loadData}
        />
      )}

      <PatientAdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
        onPatientAdmitted={loadData}
      />
    </div>
  );
};

export default BioAiClinicalTelemetryHub;

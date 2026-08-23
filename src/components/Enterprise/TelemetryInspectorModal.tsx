import React, { useState } from 'react';
import {
  X,
  Activity,
  Heart,
  Wind,
  Thermometer,
  Droplet,
  Brain,
  ShieldAlert,
  Zap,
  Download,
  AlertTriangle,
  Clock,
  User,
  CheckCircle2,
  FileSpreadsheet,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ClinicalPatientRecord, EmergencyProtocolType } from '../../types/clinicalTelemetry';
import { ClinicalTelemetryService } from '../../services/ClinicalTelemetryService';

interface TelemetryInspectorModalProps {
  patient: ClinicalPatientRecord | null;
  onClose: () => void;
  onTriggerEscalation: (patient: ClinicalPatientRecord) => void;
  onOpenAlerts: (patient: ClinicalPatientRecord) => void;
}

export const TelemetryInspectorModal: React.FC<TelemetryInspectorModalProps> = ({
  patient,
  onClose,
  onTriggerEscalation,
  onOpenAlerts,
}) => {
  const [activeTab, setActiveTab] = useState<'VITALS' | 'TRENDS' | 'BIOMARKERS' | 'CALCULATIONS' | 'PROTOCOLS'>('VITALS');

  if (!patient) return null;

  const handleExportCSV = () => {
    const csvContent = ClinicalTelemetryService.generateFHIRDiagnosticCSV(patient);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FHIR_Telemetry_${patient.mrn}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAcuityBadge = () => {
    switch (patient.acuityLevel) {
      case 'CRITICAL':
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">CRITICAL TIER</span>;
      case 'HIGH':
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">HIGH RISK</span>;
      case 'WARNING':
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">MODERATE WARNING</span>;
      case 'MONITOR':
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">OBSERVATION</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">HEMODYNAMICALLY STABLE</span>;
    }
  };

  // Sparkline SVG helper
  const renderSparkline = (data: number[], strokeColor: string, minVal: number, maxVal: number) => {
    if (data.length < 2) return null;
    const width = 200;
    const height = 40;
    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const normalizedY = (val - minVal) / (maxVal - minVal || 1);
        const y = height - Math.max(2, Math.min(height - 2, normalizedY * height));
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-full h-10 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white tracking-tight">{patient.fullName}</h3>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {patient.mrn}
                </span>
                {getAcuityBadge()}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-0.5">
                <span>{patient.age} yrs • {patient.sex}</span>
                <span>•</span>
                <span>{patient.ward} • <strong className="text-slate-200">{patient.bedNumber}</strong></span>
                <span>•</span>
                <span>Attending: <strong className="text-slate-300">{patient.attendingPhysician}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>FHIR CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Diagnosis Bar */}
        <div className="px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Primary Diagnosis:</span>
            <span className="font-semibold text-slate-200">{patient.primaryDiagnosis}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Telemetry Last Synced: <strong className="text-slate-200 font-mono">{new Date(patient.lastUpdated).toLocaleTimeString()}</strong></span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-800 bg-slate-900 flex items-center gap-2 pt-2">
          {[
            { id: 'VITALS', label: 'Continuous Telemetry Vitals' },
            { id: 'TRENDS', label: 'Waveform Trend History' },
            { id: 'BIOMARKERS', label: 'Bio-AI & Genomics Labs' },
            { id: 'CALCULATIONS', label: 'Clinical Scores & Algorithms' },
            { id: 'PROTOCOLS', label: `Emergency Actions (${patient.alerts.length} Alerts)` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: CONTINUOUS VITALS */}
          {activeTab === 'VITALS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Heart Rate */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      Heart Rate (ECG)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">60-100 bpm</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black font-mono text-rose-400">
                      {patient.vitals.heartRateBpm}
                    </span>
                    <span className="text-xs text-slate-400">bpm</span>
                  </div>
                </div>

                {/* Blood Pressure & MAP */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      Arterial BP / MAP
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">MAP &gt; 65</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black font-mono text-cyan-300">
                      {patient.vitals.systolicBpMmHg}/{patient.vitals.diastolicBpMmHg}
                    </span>
                    <span className="text-xs text-slate-400">
                      (MAP <strong className="text-cyan-400 font-mono">{patient.calculations.meanArterialPressure}</strong>)
                    </span>
                  </div>
                </div>

                {/* SpO2 */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-emerald-400" />
                      Pulse Oximetry SpO2
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">95-100%</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-black font-mono ${patient.vitals.spO2Percent < 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {patient.vitals.spO2Percent}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">FiO2 {patient.vitals.fiO2Percent}%</span>
                  </div>
                </div>

                {/* Respiratory Rate */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-amber-400" />
                      Respiratory Rate
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">12-20 /min</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black font-mono text-amber-300">
                      {patient.vitals.respiratoryRateMin}
                    </span>
                    <span className="text-xs text-slate-400">/min</span>
                  </div>
                </div>

                {/* Core Temperature */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                      Core Temperature
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">36.5-37.5 °C</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black font-mono text-orange-300">
                      {patient.vitals.temperatureCelsius}
                    </span>
                    <span className="text-xs text-slate-400">°C</span>
                  </div>
                </div>

                {/* Arterial Lactate */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 text-red-400" />
                      Serum Lactate
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">&lt; 2.0 mmol/L</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-black font-mono ${patient.vitals.lactateMmolL >= 4.0 ? 'text-rose-400' : 'text-slate-100'}`}>
                      {patient.vitals.lactateMmolL}
                    </span>
                    <span className="text-xs text-slate-400">mmol/L</span>
                  </div>
                </div>

                {/* Cardiac Output & Index */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-violet-400" />
                      Cardiac Output (CO/CI)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">CI &gt; 2.2</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black font-mono text-violet-300">
                      {patient.vitals.cardiacOutputLMin}
                    </span>
                    <span className="text-xs text-slate-400">L/min (CI {patient.vitals.cardiacIndexLMinM2})</span>
                  </div>
                </div>

                {/* Urine Output & Creatinine */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                      Urine Output / Cr
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">&gt; 0.5 mL/kg/h</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl font-black font-mono ${patient.vitals.urineOutputMlKgHr < 0.5 ? 'text-rose-400' : 'text-blue-300'}`}>
                      {patient.vitals.urineOutputMlKgHr}
                    </span>
                    <span className="text-xs text-slate-400">mL/kg/h (Cr {patient.vitals.creatinineMgDl})</span>
                  </div>
                </div>
              </div>

              {/* Ventilator & Neurological Sub-Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">End-Tidal CO2 (EtCO2):</span>
                  <div className="text-lg font-black font-mono text-slate-100 mt-0.5">{patient.vitals.etCO2MmHg} mmHg</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">Ventilator PEEP / FiO2:</span>
                  <div className="text-lg font-black font-mono text-slate-100 mt-0.5">{patient.vitals.peepCmH2O} cmH2O • {patient.vitals.fiO2Percent}% FiO2</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-slate-400 font-bold">Glasgow Coma Scale (GCS):</span>
                  <div className="text-lg font-black font-mono text-slate-100 mt-0.5">{patient.vitals.gcsScore} / 15</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WAVEFORM TREND HISTORY */}
          {activeTab === 'TRENDS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Heart Rate Sparkline */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-500" />
                      Heart Rate Waveform Trend
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      {patient.vitals.heartRateBpm} bpm
                    </span>
                  </div>
                  {renderSparkline(patient.trendHistory.map(t => t.heartRate), '#f43f5e', 40, 160)}
                </div>

                {/* MAP Sparkline */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-cyan-400" />
                      Mean Arterial Pressure Trend
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {patient.calculations.meanArterialPressure} mmHg
                    </span>
                  </div>
                  {renderSparkline(patient.trendHistory.map(t => t.map), '#22d3ee', 40, 120)}
                </div>

                {/* SpO2 Sparkline */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Wind className="w-4 h-4 text-emerald-400" />
                      Oxygen Saturation (SpO2) Trend
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {patient.vitals.spO2Percent}%
                    </span>
                  </div>
                  {renderSparkline(patient.trendHistory.map(t => t.spO2), '#34d399', 80, 100)}
                </div>

                {/* Bio-AI Deterioration Risk Sparkline */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-violet-400" />
                      Predictive Deterioration Risk Velocity
                    </span>
                    <span className="text-xs font-mono font-bold text-violet-400">
                      {(patient.biomarkers.aiDeteriorationRiskScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  {renderSparkline(patient.trendHistory.map(t => t.aiRiskScore * 100), '#a78bfa', 0, 100)}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BIOMARKERS & GENOMICS */}
          {activeTab === 'BIOMARKERS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">High-Sensitivity Troponin-I</span>
                  <div className="text-xl font-black font-mono text-rose-400 mt-1">
                    {patient.biomarkers.troponinINgMl} ng/mL
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Reference &lt; 0.04 ng/mL</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Procalcitonin (PCT)</span>
                  <div className="text-xl font-black font-mono text-orange-400 mt-1">
                    {patient.biomarkers.procalcitoninNgMl} ng/mL
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Severe Sepsis &gt; 2.0 ng/mL</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">C-Reactive Protein (CRP)</span>
                  <div className="text-xl font-black font-mono text-yellow-400 mt-1">
                    {patient.biomarkers.crpMgL} mg/L
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Reference &lt; 10 mg/L</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Brain Natriuretic Peptide (BNP)</span>
                  <div className="text-xl font-black font-mono text-violet-400 mt-1">
                    {patient.biomarkers.bnpPgMl} pg/mL
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Heart Failure &gt; 400 pg/mL</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Tumor Mutation Burden (TMB)</span>
                  <div className="text-xl font-black font-mono text-cyan-400 mt-1">
                    {patient.biomarkers.genomicMutationBurdenMutsMb} muts/Mb
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">High TMB &ge; 10 muts/Mb</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold">Predictive Shock Horizon</span>
                  <div className="text-xl font-black font-mono text-amber-400 mt-1">
                    {patient.biomarkers.predictiveShockHorizonMinutes} mins
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Bio-AI Autoregressive Window</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CLINICAL SCORES & CALCULATIONS */}
          {activeTab === 'CALCULATIONS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* qSOFA Score Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">quick SOFA (qSOFA) Score</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-black font-mono ${patient.calculations.qSofaHighRisk ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      Score: {patient.calculations.qSofaScore} / 3
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Criteria: RR &ge; 22/min, SBP &le; 100 mmHg, GCS &lt; 15. Score &ge; 2 indicates high mortality risk from sepsis.
                  </p>
                </div>

                {/* NEWS2 Score Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">National Early Warning Score 2 (NEWS2)</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-black font-mono ${patient.calculations.news2RiskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400'}`}>
                      Score: {patient.calculations.news2Score} ({patient.calculations.news2RiskLevel} Risk)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Standardized UK Royal College scoring evaluating acute clinical deterioration.
                  </p>
                </div>

                {/* KDIGO AKI Classification */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">KDIGO Acute Kidney Injury (AKI)</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-black font-mono ${patient.calculations.kdigoAkiStage >= 2 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-blue-500/20 text-blue-400'}`}>
                      Stage {patient.calculations.kdigoAkiStage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {patient.calculations.kdigoInterpretation}
                  </p>
                </div>

                {/* Hemodynamics & Shock Index */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-200">Shock Index & Cardiac Power Output</span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      SI: {patient.calculations.shockIndex} | CPO: {patient.calculations.cardiacPowerOutput} W
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Shock Index = HR / SBP. Values &ge; 0.9 indicate occult hypoperfusion and shock.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROTOCOLS & ALERTS */}
          {activeTab === 'PROTOCOLS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Active Clinical Alerts & Emergency Escalations</h4>
                <button
                  onClick={() => onTriggerEscalation(patient)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Dispatch Emergency Protocol</span>
                </button>
              </div>

              {patient.alerts.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-200">No Active Clinical Alerts</p>
                  <p className="text-xs text-slate-500 mt-1">Multiparameter vitals are currently within stable reference parameters.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {patient.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded ${
                            alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs font-bold text-slate-200">{alert.metric}</span>
                          <span className="text-xs font-mono text-cyan-300 font-semibold">{alert.value}</span>
                        </div>
                        <p className="text-xs text-slate-400">{alert.description}</p>
                        <p className="text-xs text-cyan-400/90 font-medium">Suggested Action: {alert.suggestedEscalation}</p>
                      </div>

                      {alert.acknowledged ? (
                        <span className="text-[11px] text-emerald-400 font-semibold whitespace-nowrap flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Acknowledged
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenAlerts(patient)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                        >
                          Review & Sign
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Bedside Node: <strong className="text-slate-200">{patient.id}</strong> (Encrypted AES-256 GCM Stream)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

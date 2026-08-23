import React from 'react';
import {
  Activity,
  AlertTriangle,
  Heart,
  ShieldAlert,
  Zap,
  Radio,
  CheckCircle2,
  Cpu,
  Flame,
  Stethoscope,
  Layers
} from 'lucide-react';
import { TelemetrySummaryMetrics, ClinicalDomain, ClinicalAcuityLevel } from '../../types/clinicalTelemetry';

interface ClinicalTelemetryMetricsCardProps {
  metrics: TelemetrySummaryMetrics;
  activeDomain: ClinicalDomain | 'ALL';
  onSelectDomain: (domain: ClinicalDomain | 'ALL') => void;
  activeAcuity: ClinicalAcuityLevel | 'ALL';
  onSelectAcuity: (acuity: ClinicalAcuityLevel | 'ALL') => void;
  isLiveStreaming: boolean;
  onToggleStreaming: () => void;
}

export const ClinicalTelemetryMetricsCard: React.FC<ClinicalTelemetryMetricsCardProps> = ({
  metrics,
  activeDomain,
  onSelectDomain,
  activeAcuity,
  onSelectAcuity,
  isLiveStreaming,
  onToggleStreaming,
}) => {
  const domainTabs: { id: ClinicalDomain | 'ALL'; label: string; icon: any }[] = [
    { id: 'ALL', label: 'All Wards & Units', icon: Layers },
    { id: 'ICU_TELEMETRY', label: 'MICU / SICU', icon: Activity },
    { id: 'CARDIOVASCULAR', label: 'Coronary CCU', icon: Heart },
    { id: 'NEPHROLOGY_CRRT', label: 'Nephrology CRRT', icon: Stethoscope },
    { id: 'PRECISION_ONCOLOGY', label: 'Precision Oncology', icon: Cpu },
    { id: 'EMERGENCY_MEDICINE', label: 'Trauma Emergency', icon: Flame },
    { id: 'BIO_AI_DIAGNOSTICS', label: 'Bio-AI Predictive', icon: Zap },
  ];

  return (
    <div className="space-y-4">
      {/* Top Banner / System Status */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900 text-slate-100 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 shadow-inner">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-950"></span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                MedTrack Bio-AI Clinical Telemetry Command Station
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                FHIR R4 • HL7 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Continuous Real-Time Multiparameter Waveforms, Deterioration Biomarkers & Autonomous Emergency Triage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
            <span className="text-slate-300 font-mono text-[11px]">
              {isLiveStreaming ? 'LIVE TELEMETRY STREAM (3000ms)' : 'STREAM PAUSED'}
            </span>
          </div>

          <button
            onClick={onToggleStreaming}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer ${
              isLiveStreaming
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {isLiveStreaming ? 'Pause Stream' : 'Resume Stream'}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Monitored */}
        <div
          onClick={() => onSelectAcuity('ALL')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-slate-900/90 text-white ${
            activeAcuity === 'ALL'
              ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-lg shadow-cyan-500/10'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Monitored Beds</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black tracking-tight text-white font-mono">
            {metrics.totalMonitored}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-cyan-400 font-bold">100%</span> active telemetry
          </div>
        </div>

        {/* Critical Acuity */}
        <div
          onClick={() => onSelectAcuity('CRITICAL')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-slate-900/90 text-white ${
            activeAcuity === 'CRITICAL'
              ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-lg shadow-rose-500/10'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Critical Tier</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 animate-bounce" />
          </div>
          <div className="text-2xl font-black tracking-tight text-rose-400 font-mono">
            {metrics.criticalCount}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-1 flex items-center gap-1">
            <span>Immediate ICU Resuscitation</span>
          </div>
        </div>

        {/* High / Warning Acuity */}
        <div
          onClick={() => onSelectAcuity('HIGH')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-slate-900/90 text-white ${
            activeAcuity === 'HIGH'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>High Risk / Deteriorating</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black tracking-tight text-amber-400 font-mono">
            {metrics.warningCount}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1 flex items-center gap-1">
            <span>Requires Close Vigilance</span>
          </div>
        </div>

        {/* Sepsis & qSOFA Risk */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-white">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Sepsis Risk Flag</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black tracking-tight text-orange-400 font-mono">
            {metrics.sepsisRiskCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>qSOFA &ge; 2 or Index &gt; 60</span>
          </div>
        </div>

        {/* Active Emergency Protocols */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-white">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Emergency Protocols</span>
            <Zap className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black tracking-tight text-violet-400 font-mono">
            {metrics.activeEscalationsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Code Blue / RRT / Sepsis</span>
          </div>
        </div>

        {/* Telemetry Reliability & AI Score */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 text-white">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
            <span>Bio-AI Risk Mean</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black tracking-tight text-cyan-300 font-mono">
            {(metrics.avgAiRiskScore * 100).toFixed(0)}%
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>{metrics.telemetryUptimePercent}% Uptime</span>
          </div>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {domainTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeDomain === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectDomain(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 font-black'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-cyan-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

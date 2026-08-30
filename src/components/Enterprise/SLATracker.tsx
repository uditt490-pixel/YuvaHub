import React from 'react';
import { SLAMetrics } from '../../types/observability';
import { ShieldCheck, Flame, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
  sla: SLAMetrics;
}

export const SLATracker: React.FC<Props> = ({ sla }) => {
  const isHealthy = sla.currentUptime >= sla.targetUptime;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* SLA Target & Error Budget Progress */}
      <div className="p-6 bg-primary-blue border border-border-theme rounded-3xl space-y-6">
        <div className="flex justify-between items-center border-b border-border-theme pb-4">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              SLA Floor & Commitment
            </h3>
            <p className="text-xs text-text-muted mt-1">Enterprise contractual SLA compliance levels.</p>
          </div>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
            isHealthy ? 'bg-emerald-500/200/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {isHealthy ? 'SLA Compliant' : 'SLA Breach'}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold uppercase text-text-muted tracking-wider">Current Month-to-Date Uptime</span>
            <span className="text-2xl font-black text-white">{sla.currentUptime}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-border-theme p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isHealthy ? 'bg-emerald-500/200' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (sla.currentUptime / sla.targetUptime) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-text-muted pt-2 border-t border-border-theme/80">
            <span>Contractual Target Floor: <strong className="text-white">{sla.targetUptime}%</strong></span>
            <span>Tolerance Margin: <strong className="text-white">0.10%</strong></span>
          </div>
        </div>
      </div>

      {/* Burn Rate & Remaining Budget */}
      <div className="p-6 bg-primary-blue border border-border-theme rounded-3xl space-y-6">
        <div className="flex justify-between items-center border-b border-border-theme pb-4">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Flame className="h-5 w-5 text-amber-400" />
              Error Budget & Burn Rate
            </h3>
            <p className="text-xs text-text-muted mt-1">Allowed error budget consumption tracking.</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/200/10 text-indigo-400 border border-indigo-500/20">
            30-Day Budget Cycle
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-border-theme/80 space-y-1">
            <div className="text-[11px] font-bold uppercase text-text-muted">Remaining Error Budget</div>
            <div className="text-2xl font-black text-emerald-400">{sla.errorBudgetRemaining}%</div>
            <p className="text-[10px] text-text-muted">43 mins downtime remaining</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-border-theme/80 space-y-1">
            <div className="text-[11px] font-bold uppercase text-text-muted">Current Burn Rate</div>
            <div className="text-2xl font-black text-amber-400">{sla.burnRate}x</div>
            <p className="text-[10px] text-text-muted">Normal range: &lt; 1.0x</p>
          </div>
        </div>
      </div>
    </div>
  );
};

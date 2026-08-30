import React from 'react';
import { Incident } from '../../types/observability';
import { AlertCircle, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  incidents: Incident[];
}

export const UptimeIncidentTimeline: React.FC<Props> = ({ incidents }) => {
  const getSeverityBadge = (severity: Incident['severity']) => {
    const base = "px-2.5 py-0.5 text-xs font-black rounded-lg uppercase tracking-wider ";
    switch (severity) {
      case 'P0':
        return base + "bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse";
      case 'P1':
        return base + "bg-rose-500/10 text-rose-400 border border-rose-500/30";
      case 'P2':
        return base + "bg-amber-500/200/10 text-amber-400 border border-amber-500/30";
      case 'P3':
        return base + "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30";
      case 'P4':
        return base + "bg-blue-500/200/10 text-blue-400 border border-blue-500/30";
    }
  };

  const getStatusBadge = (status: Incident['status']) => {
    switch (status) {
      case 'investigating':
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      case 'identified':
        return "bg-amber-500/200/10 text-amber-400 border-amber-500/30";
      case 'monitoring':
        return "bg-indigo-500/200/10 text-indigo-400 border-indigo-500/30";
      case 'resolved':
        return "bg-emerald-500/200/10 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div className="p-6 bg-primary-blue border border-border-theme rounded-3xl space-y-6">
      <div className="flex justify-between items-center border-b border-border-theme pb-4">
        <div>
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
            Incident Lifecycle Timeline
          </h3>
          <p className="text-xs text-text-muted mt-1">Real-time incident response tracking and resolution history.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/200/10 text-amber-400 border border-amber-500/20">
          {incidents.length} Active Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-secondary">
        {incidents.map((inc) => (
          <div key={inc.id} className="relative flex items-start gap-4">
            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-slate-900" />
            
            <div className="flex-1 p-5 rounded-2xl bg-slate-950/60 border border-border-theme space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={getSeverityBadge(inc.severity)}>{inc.severity}</span>
                  <h4 className="font-bold text-sm text-slate-200">{inc.title}</h4>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(inc.status)}`}>
                  {inc.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-text-muted pt-2 border-t border-border-theme/60">
                <span className="flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 text-text-muted" />
                  Target: <code className="text-indigo-300 font-mono">{inc.serviceId}</code>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-text-muted" />
                  Reported: {new Date(inc.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

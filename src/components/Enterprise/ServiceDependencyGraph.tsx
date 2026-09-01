import React, { useState } from 'react';
import { ServiceMetric } from '../../types/observability';
import { Layers, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

interface Props {
  services: ServiceMetric[];
}

export const ServiceDependencyGraph: React.FC<Props> = ({ services }) => {
  const [selectedService, setSelectedService] = useState<ServiceMetric | null>(services[0] || null);

  const getStatusIcon = (status: ServiceMetric['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'outage':
        return <XCircle className="h-4 w-4 text-rose-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Dependency Graph Topology Matrix */}
      <div className="lg:col-span-2 p-6 bg-primary-blue border border-border-theme rounded-3xl space-y-6">
        <div className="flex justify-between items-center border-b border-border-theme pb-4">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              Service Dependency Topology
            </h3>
            <p className="text-xs text-text-muted mt-1">Interactive node map detailing downstream dependencies.</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/200/10 text-indigo-400 border border-indigo-500/20">
            {services.length} Microservices Mapped
          </span>
        </div>

        <div className="space-y-3">
          {services.map((svc) => (
            <div
              key={svc.id}
              onClick={() => setSelectedService(svc)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                selectedService?.id === svc.id
                  ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md'
                  : 'bg-slate-950/50 border-border-theme/80 hover:border-border-theme'
              }`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(svc.status)}
                <div>
                  <div className="font-bold text-sm text-slate-200">{svc.name}</div>
                  <code className="text-xs text-text-muted">{svc.id}</code>
                </div>
              </div>

              {/* Dependencies Badges */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-text-muted font-semibold">Depends on:</span>
                {svc.dependencies.length > 0 ? (
                  svc.dependencies.map((depId) => (
                    <span
                      key={depId}
                      className="px-2 py-0.5 rounded-lg bg-surface-secondary text-indigo-300 font-mono text-[11px] border border-border-theme flex items-center gap-1"
                    >
                      <ArrowRight className="h-3 w-3 text-text-muted" />
                      {depId}
                    </span>
                  ))
                ) : (
                  <span className="text-text-secondary italic">None (Root Node)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      <div className="p-6 bg-primary-blue border border-border-theme rounded-3xl space-y-6 flex flex-col justify-between">
        {selectedService ? (
          <div className="space-y-6">
            <div className="border-b border-border-theme pb-4 flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-white">{selectedService.name}</h4>
                <code className="text-xs text-indigo-400 font-mono">{selectedService.id}</code>
              </div>
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                selectedService.status === 'operational' ? 'bg-emerald-500/200/10 text-emerald-400 border border-emerald-500/20' :
                selectedService.status === 'degraded' ? 'bg-amber-500/200/10 text-amber-400 border border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {selectedService.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-border-theme/80 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">24-Hour Uptime:</span>
                  <span className="font-bold text-white">{selectedService.uptime24h}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Average Latency:</span>
                  <span className="font-bold text-white">{selectedService.latencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted font-medium">Error Rate:</span>
                  <span className="font-bold text-white">{selectedService.errorRate}%</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Downstream Edge Dependents</div>
                <div className="space-y-1.5">
                  {services.filter(s => s.dependencies.includes(selectedService.id)).length > 0 ? (
                    services.filter(s => s.dependencies.includes(selectedService.id)).map(dep => (
                      <div key={dep.id} className="p-2.5 rounded-xl bg-slate-950 border border-border-theme/60 text-xs font-medium text-slate-300 flex justify-between items-center">
                        <span>{dep.name}</span>
                        <code className="text-[10px] text-indigo-400">{dep.id}</code>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-muted italic">No downstream services depend on this node.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-text-muted my-auto">
            <Info className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Select a microservice node to inspect telemetry details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

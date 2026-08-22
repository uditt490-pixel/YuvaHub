import React from 'react';
import { ModelVersion, InferenceTelemetry } from '../../types/mlops';
import { Activity, Clock, Cpu, AlertTriangle, Zap, Server } from 'lucide-react';

interface ModelInferenceMetricsProps {
    telemetry: InferenceTelemetry[];
    modelVersion: ModelVersion;
}

export const ModelInferenceMetrics: React.FC<ModelInferenceMetricsProps> = ({ telemetry, modelVersion }) => {
    if (telemetry.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-10 flex flex-col items-center text-center text-slate-400 h-[400px] justify-center">
                <Activity className="h-10 w-10 mb-3 opacity-50" />
                <h4 className="font-bold text-slate-600 border-b border-slate-100 pb-2 mb-2">No Live Telemetry</h4>
                <p className="text-sm">Model {modelVersion.version} is not currently routing traffic or logging API inferences.</p>
            </div>
        );
    }

    const latest = telemetry[0];
    const maxTokens = Math.max(...telemetry.map(t => t.tokensPerSecond));

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" /> Production Telemetry Logs
                </h3>
                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[10px] font-black uppercase tracking-wider">
                    <Server className="h-3 w-3" /> Live Inference Stream
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100 border-b border-slate-200">
                <div className="bg-white p-5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Zap className="h-3 w-3 text-emerald-500" /> Tokens / Sec</div>
                    <div className="text-2xl font-black text-slate-800">{latest.tokensPerSecond.toFixed(0)}</div>
                </div>
                <div className="bg-white p-5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Clock className="h-3 w-3 text-indigo-500" /> P99 Latency</div>
                    <div className="text-2xl font-black text-slate-800">{latest.p99LatencyMs.toFixed(1)}<span className="text-xs text-slate-400 font-medium ml-1">ms</span></div>
                </div>
                <div className="bg-white p-5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Cpu className="h-3 w-3 text-blue-500" /> GPU Util</div>
                    <div className="text-2xl font-black text-slate-800">{latest.gpuUtilizationPercentage.toFixed(1)}<span className="text-xs text-slate-400 font-medium ml-1">%</span></div>
                </div>
                <div className="bg-white p-5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3 text-red-500" /> Error Rate</div>
                    <div className="text-2xl font-black text-slate-800">{latest.errorRatePercentage.toFixed(2)}<span className="text-xs text-slate-400 font-medium ml-1">%</span></div>
                </div>
            </div>

            <div className="p-6 bg-slate-900 h-64 flex items-end gap-1 relative overflow-hidden select-none" style={{ backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.4) 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: '#020617' }}>
                <div className="absolute top-4 left-4 text-[10px] font-black uppercase text-slate-600 tracking-wider">Throughput Historical (Tk/s)</div>

                {telemetry.slice(0).reverse().map((t, idx) => {
                    const height = Math.max(5, (t.tokensPerSecond / maxTokens) * 100);
                    return (
                        <div key={t.timestamp + idx} className="flex-1 relative group h-full flex items-end justify-center">
                            <div
                                className="w-full max-w-[24px] bg-indigo-500 hover:bg-indigo-400 rounded-t-sm transition-all relative z-10"
                                style={{ height: `${height}%` }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 z-50 whitespace-nowrap pointer-events-none transform -translate-y-2 group-hover:-translate-y-0 transition-all font-mono">
                                {t.tokensPerSecond.toFixed(0)} Tk/s<br />
                                Lat: {t.p99LatencyMs.toFixed(0)}ms
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { ModelVersion, MlOpsOverviewMetrics } from '../../types/mlops';
import { MLRegistryService } from '../../services/MLRegistryService';
import { ModelInferenceMetrics } from '../../components/Enterprise/ModelInferenceMetrics';
import { DeploymentManifestEditor } from '../../components/Enterprise/DeploymentManifestEditor';
import { BrainCircuit, Radio, Layers, HardDrive, Link as LinkIcon, AlertCircle } from 'lucide-react';

export const MlOpsDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<MlOpsOverviewMetrics | null>(null);
    const [registry, setRegistry] = useState<ModelVersion[]>([]);
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchML = async () => {
            setIsLoading(true);
            const [m, models] = await Promise.all([
                MLRegistryService.getOverviewMetrics(),
                MLRegistryService.getModelRegistry()
            ]);
            setMetrics(m);
            setRegistry(models);
            setSelectedModelId(models[0]?.id || null);
            setIsLoading(false);
        };
        fetchML();
    }, []);

    const handleSaveManifest = async () => {
        if (!selectedModelId) return;
        setIsSaving(true);
        await MLRegistryService.updateDeploymentManifest(selectedModelId, {});
        setIsSaving(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DEPLOYED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'STAGING': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'TRAINING': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'ARCHIVED': return 'bg-slate-100 text-slate-500 border-slate-300';
            default: return 'bg-red-50 text-red-700 border-red-200';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const selectedModel = registry.find(m => m.id === selectedModelId) || null;

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans">
            <div className="max-w-[1700px] mx-auto p-4 lg:p-8 space-y-8">

                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest border border-indigo-100">
                            <BrainCircuit className="h-4 w-4" /> MLOps Pipeline
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">Model Registry Hub</h1>
                        <p className="text-slate-500 text-sm max-w-2xl">
                            Manage large scale inference endpoints, track hyperparameter manifests, and orchestrate zero-downtime model rollouts.
                        </p>
                    </div>

                    {metrics && (
                        <div className="flex flex-wrap gap-4 relative z-10 w-full lg:w-auto">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1 min-w-[140px]">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Layers className="h-3 w-3 " /> Deployed</p>
                                <p className="text-2xl font-black text-slate-900">{metrics.totalDeployedModels}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-1 min-w-[140px]">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5"><HardDrive className="h-3 w-3 " /> GPU Hours (Mo)</p>
                                <p className="text-2xl font-black text-slate-900">{metrics.totalGpuHoursCurrentMonth.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex-1 min-w-[140px] text-white">
                                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1 flex items-center gap-1.5"><Radio className="h-3 w-3 text-indigo-400" /> Inferences Today</p>
                                <p className="text-2xl font-black">{metrics.totalInferenceRequestsToday.toLocaleString()}</p>
                            </div>
                        </div>
                    )}
                </header>

                {isLoading ? (
                    <div className="flex justify-center p-32">
                        <div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Sidebar: Registry Index */}
                        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[800px] overflow-hidden">
                            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                <Layers className="h-5 w-5 text-indigo-600" />
                                <h3 className="font-bold text-slate-800">Registry Graph</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {registry.map(model => {
                                    const isSelected = selectedModelId === model.id;
                                    return (
                                        <div
                                            key={model.id}
                                            onClick={() => setSelectedModelId(model.id)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-indigo-400 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1 pr-2">
                                                    <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{model.name}</h4>
                                                    <code className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono mt-1 inline-block">{model.version}</code>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0 ${getStatusColor(model.status)}`}>
                                                    {model.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 mt-3 pt-3 border-t border-slate-100/80">
                                                <span>{model.framework}</span>
                                                <span>•</span>
                                                <span>{formatFileSize(model.fileSizeBytes)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Pane: Selected Model Deep Dive */}
                        <div className="lg:col-span-8 flex flex-col h-[800px] gap-6">
                            {selectedModel ? (
                                <>
                                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedModel.name}</h2>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                                <span className="text-xs font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{selectedModel.framework}</span>
                                                <span>Maintained by {selectedModel.authorEmail}</span>
                                            </div>
                                        </div>
                                        {selectedModel.activeEndpointUrl ? (
                                            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-3">
                                                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                                                    <LinkIcon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Active Inference Endpoint</div>
                                                    <code className="text-xs font-bold text-emerald-900 font-mono">{selectedModel.activeEndpointUrl}</code>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-3 opacity-75">
                                                <AlertCircle className="h-5 w-5 text-slate-400" />
                                                <span className="text-xs font-bold text-slate-500 uppercase">Offline / No Target Endpoint</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0">
                                        <div className="flex flex-col gap-6">
                                            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-around">
                                                <div className="text-center">
                                                    <div className="text-xl font-black text-slate-800">{selectedModel.metrics.trainingLoss.toFixed(4)}</div>
                                                    <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Val Loss</div>
                                                </div>
                                                <div className="w-px bg-slate-100" />
                                                <div className="text-center">
                                                    <div className="text-xl font-black text-slate-800">{(selectedModel.metrics.validationAccuracy * 100).toFixed(1)}%</div>
                                                    <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Accuracy</div>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-h-0">
                                                <DeploymentManifestEditor config={selectedModel.deploymentConfig} onSave={handleSaveManifest} />
                                            </div>
                                        </div>

                                        <div className="flex flex-col min-h-0">
                                            <ModelInferenceMetrics modelVersion={selectedModel} telemetry={selectedModel.telemetryLogs || []} />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-slate-400 p-12">
                                    <BrainCircuit className="h-16 w-16 mb-4 opacity-50" />
                                    <p className="font-medium">No Model Artifact Selected</p>
                                </div>
                            )}
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default MlOpsDashboard;

import React from 'react';
import { DeploymentConfig } from '../../types/mlops';
import { Settings, Save, HardDrive, Terminal } from 'lucide-react';

interface DeploymentManifestEditorProps {
    config: DeploymentConfig | undefined;
    onSave: () => void;
}

export const DeploymentManifestEditor: React.FC<DeploymentManifestEditorProps> = ({ config, onSave }) => {
    if (!config) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-10 flex flex-col items-center justify-center text-slate-400 h-full">
                <Settings className="h-10 w-10 mb-3 opacity-50" />
                <h4 className="font-bold text-slate-600">No Manifest Selected</h4>
                <p className="text-sm">Select a Model Version with an active configuration.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-indigo-600" /> Manifest Tuning
                </h3>
                <button
                    onClick={onSave}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-xs font-bold rounded-lg shadow-sm"
                >
                    <Save className="h-3 w-3" /> Save Conf
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <HardDrive className="h-4 w-4 text-emerald-600" /> Infrastructure Targeting
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Instance Type</label>
                                <input type="text" readOnly value={config.instanceType} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">GPUs Allocated</label>
                                <input type="number" readOnly value={config.gpuCount} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">vCPU Cores</label>
                                <input type="number" readOnly value={config.cpuCores} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 outline-none" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Memory (GB)</label>
                                <input type="number" readOnly value={config.memoryGb} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                            <Settings className="h-4 w-4 text-amber-500" /> Runtime Hyperparameters
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quantization</label>
                                <select value={config.quantization} readOnly className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none appearance-none">
                                    <option value="FP32">FP32 (Base)</option>
                                    <option value="FP16">FP16 (Half)</option>
                                    <option value="INT8">INT8 (Quantized)</option>
                                    <option value="INT4">INT4 (Ultra-Quantized)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Max Batch Size</label>
                                <input type="number" defaultValue={config.maxBatchSize} className="w-full bg-white border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition-all" />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Environment Variables</label>
                            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-inner">
                                {Object.keys(config.environmentVariables).length === 0 ? (
                                    <span className="text-xs text-slate-500 font-mono italic">No ENV overridden.</span>
                                ) : (
                                    <div className="space-y-1 font-mono text-xs">
                                        {Object.entries(config.environmentVariables).map(([k, v]) => (
                                            <div key={k} className="flex">
                                                <span className="text-indigo-400 w-1/3 truncate font-bold">{k}</span>
                                                <span className="text-slate-400 mx-2">=</span>
                                                <span className="text-emerald-400 break-all">"{v}"</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

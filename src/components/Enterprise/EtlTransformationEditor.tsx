import React from 'react';
import { TransformationStep } from '../../types/dataMesh';
import { Code, GitCommit, Check, Save } from 'lucide-react';

interface EtlTransformationEditorProps {
    steps: TransformationStep[];
    nodeName: string | undefined;
}

export const EtlTransformationEditor: React.FC<EtlTransformationEditorProps> = ({ steps, nodeName }) => {
    if (steps.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-8 flex flex-col items-center justify-center text-center text-slate-400 h-full">
                <Code className="h-10 w-10 mb-3 opacity-50" />
                <h4 className="font-bold text-slate-600 mb-1">No Transformations</h4>
                <p className="text-sm">Select a Transform or Join node to configure its pipeline operation script.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800 text-sm">ETL Transformations</h3>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-2">Node: {nodeName}</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 transition-colors text-white text-xs font-bold rounded-lg shadow-sm">
                    <Save className="h-3 w-3" /> Commit Code
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
                <div className="space-y-6">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="relative">
                            {idx < steps.length - 1 && (
                                <div className="absolute top-12 left-5 w-0.5 h-10 bg-slate-200" />
                            )}

                            <div className="flex gap-4">
                                <div className={`mt-2 shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-white shadow-sm z-10 ${step.enabled ? 'bg-indigo-500' : 'bg-slate-300'
                                    }`}>
                                    {idx + 1}
                                </div>

                                <div className={`flex-1 rounded-xl border ${step.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-70'}`}>
                                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide">
                                                {step.operationType}
                                            </span>
                                            <span className="text-sm font-bold text-slate-700">{step.description}</span>
                                        </div>
                                    </div>

                                    {step.sqlQuery && (
                                        <div className="p-0 border-t border-slate-100 bg-[#1e1e1e] rounded-b-xl overflow-x-auto text-sm">
                                            <pre className="p-4 m-0 font-mono text-emerald-400">
                                                {step.sqlQuery}
                                            </pre>
                                        </div>
                                    )}
                                    {!step.sqlQuery && (
                                        <div className="p-4">
                                            <code className="text-xs text-slate-500 font-mono">import pipeline_module_{step.id.split('_')[1]} / parameters embedded</code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

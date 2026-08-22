import React from 'react';
import { AccessPolicy } from '../../types/networkSecurity';
import { Shield, ToggleLeft, ShieldOff, AlertOctagon } from 'lucide-react';

interface AccessPolicyControllerProps {
    policies: AccessPolicy[];
    onToggle: (id: string, current: boolean) => void;
}

export const AccessPolicyController: React.FC<AccessPolicyControllerProps> = ({ policies, onToggle }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-600" /> Active Security Policies
                </h3>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded shadow-sm border border-indigo-100">
                    WAF Rules Engine
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {policies.map(policy => (
                    <div
                        key={policy.id}
                        className={`rounded-xl border p-5 transition-colors ${policy.isEnabled ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-50 border-slate-200 opacity-75'}`}
                    >
                        <div className="flex justify-between items-start gap-4 mb-3">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`font-bold ${policy.isEnabled ? 'text-slate-800' : 'text-slate-500'}`}>{policy.name}</h4>
                                    <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                                        Priority: {policy.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 leading-relaxed">{policy.description}</p>
                            </div>

                            <button
                                onClick={() => onToggle(policy.id, policy.isEnabled)}
                                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${policy.isEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all shadow-sm ${policy.isEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100/80 flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1 mr-1">Applies To:</span>
                            {policy.targetTags.map(tag => (
                                <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded-md border border-slate-200 uppercase">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="mt-4 bg-slate-800 rounded-lg p-3 overflow-x-auto shadow-inner border border-slate-900 border-t-0 border-l-0">
                            <code className="text-emerald-400 text-xs font-mono whitespace-nowrap block">
                                {policy.rules.map((r, i) => (
                                    <span key={i}>
                                        {r.ruleType}({JSON.stringify(r.parameters).replace(/[{""}]/g, '')}){i < policy.rules.length - 1 ? ' && ' : ''}
                                    </span>
                                ))}
                            </code>
                        </div>
                    </div>
                ))}

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                    <AlertOctagon className="h-8 w-8 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-800 font-medium text-justify">
                        <strong className="block mb-0.5">Warning: Edge Gateway Adjustments</strong>
                        Toggling core policies can immediately disrupt incoming tenant traffic configurations or expose edges to volumetric DDoS variants. Ensure proper secondary validation before modifications.
                    </p>
                </div>
            </div>
        </div>
    );
};

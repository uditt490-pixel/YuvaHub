import React from 'react';
import { TargetingRule, RuleOperator } from '../../types/featureFlags';
import { Target, Trash2, Plus } from 'lucide-react';

interface AudienceTargetingRulesProps {
    rules: TargetingRule[];
}

export const AudienceTargetingRules: React.FC<AudienceTargetingRulesProps> = ({ rules }) => {
    const getOperatorLabel = (op: RuleOperator) => {
        switch (op) {
            case 'EQUALS': return 'IS EXACTLY';
            case 'CONTAINS': return 'CONTAINS';
            case 'IN': return 'IS ANY OF';
            case 'NOT_IN': return 'IS NOT ANY OF';
            case 'STARTS_WITH': return 'STARTS WITH';
            default: return op;
        }
    };

    return (
        <div className="w-full bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border-theme flex items-center justify-between bg-surface/50">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <Target className="h-5 w-5 text-emerald-400" /> Audience Selection
                </h3>
                <button className="flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-800 transition-colors">
                    <Plus className="h-4 w-4" /> Add Rule
                </button>
            </div>

            <div className="p-6">
                {rules.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-sm font-semibold text-text-muted">No specific targeting rules applied.</p>
                        <p className="text-xs text-text-muted mt-1">This feature will apply to all users inside the % rollout group.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rules.map((rule, idx) => (
                            <div key={rule.id} className="relative group">
                                {idx > 0 && (
                                    <div className="absolute -top-4 left-6 h-4 w-px bg-border-theme">
                                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-1 text-[10px] font-black tracking-widest text-text-muted uppercase">AND</span>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-surface rounded-xl border border-border-theme transition-colors group-hover:border-border-theme">
                                    <div className="flex-1 flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-text-secondary">IF </span>
                                        <span className="px-2.5 py-1 bg-surface border border-border-theme rounded-lg text-sm font-bold text-text-primary shadow-sm">
                                            {rule.attribute}
                                        </span>
                                        <span className="text-xs font-black uppercase text-indigo-400 mx-1">
                                            {getOperatorLabel(rule.operator)}
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {rule.values.map(v => (
                                                <span key={v} className="px-2.5 py-1 bg-surface border border-border-theme rounded-lg text-sm font-medium text-text-primary shadow-sm">
                                                    {v}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="self-end sm:self-auto p-2 text-text-muted hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

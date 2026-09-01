import React from 'react';
import { ExperimentMetrics as IExperimentMetrics } from '../../types/featureFlags';
import { Beaker, TrendingUp, Users, Activity } from 'lucide-react';

interface ExperimentMetricsProps {
    metrics: IExperimentMetrics | null;
    isLoading: boolean;
}

export const ExperimentMetrics: React.FC<ExperimentMetricsProps> = ({ metrics, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full bg-surface rounded-2xl border border-border-theme p-6 shadow-sm h-64 animate-pulse">
                <div className="w-48 h-6 bg-border-theme rounded mb-6" />
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="h-4 w-32 bg-surface-secondary rounded" />
                        <div className="h-12 w-24 bg-border-theme rounded-lg" />
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 w-32 bg-surface-secondary rounded" />
                        <div className="h-12 w-24 bg-border-theme rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!metrics) {
        return (
            <div className="w-full bg-surface rounded-2xl border border-border-theme p-8 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-surface text-text-muted rounded-full flex items-center justify-center mb-3">
                    <Beaker className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-text-primary">No active experiments</h4>
                <p className="text-sm text-text-muted max-w-sm mt-1">This flag does not currently have multivariate metrics recording enabled.</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden flex flex-col relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/200 opacity-[0.03] blur-3xl rounded-bl-full pointer-events-none" />

            <div className="px-6 py-5 border-b border-border-theme flex items-center justify-between">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <Beaker className="h-5 w-5 text-indigo-400" /> A/B Testing Results
                </h3>
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <Activity className="h-3 w-3" /> {metrics.confidenceInterval}% Statistical Sig.
                </span>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {metrics.variants.map((v, i) => (
                    <div key={v.variantName} className={`relative p-5 rounded-2xl border-2 transition-all ${v.isWinning ? 'border-indigo-600 bg-indigo-500/20/20 shadow-md' : 'border-border-theme bg-surface/50'}`}>
                        {v.isWinning && (
                            <div className="absolute -top-3 -right-3 h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transform rotate-12 scale-110">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        )}

                        <div className="font-bold text-text-primary mb-1">{v.variantName} <span className="text-sm font-medium text-text-muted font-normal">({v.allocationPercentage}% alloc)</span></div>

                        <div className="mt-4 flex items-end gap-2">
                            <span className={`text-4xl font-black tracking-tight ${v.isWinning ? 'text-indigo-400' : 'text-text-primary'}`}>
                                {v.conversionRate}%
                            </span>
                            <span className="text-sm font-semibold text-text-muted mb-1">conversion</span>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border-theme/50 flex items-center gap-2 text-xs font-medium text-text-muted">
                            <Users className="h-4 w-4" /> {v.sampleSize.toLocaleString()} users evaluated
                        </div>
                    </div>
                ))}
            </div>

            <div className="px-6 py-3 bg-surface text-xs text-text-muted font-medium border-t border-border-theme flex justify-between">
                <span>Experiment runtime: {metrics.durationDays} days</span>
                <span>Total traffic: {metrics.totalParticipants.toLocaleString()} users</span>
            </div>
        </div>
    );
};

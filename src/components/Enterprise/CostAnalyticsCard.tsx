import React from 'react';
import { CostMetric } from '../../types/billing';
import { Server, Database, Network, Headphones, Key, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface CostAnalyticsCardProps {
    metrics: CostMetric[];
    isLoading: boolean;
}

export const CostAnalyticsCard: React.FC<CostAnalyticsCardProps> = ({ metrics, isLoading }) => {
    if (isLoading) {
        return (
            <div className="w-full bg-surface rounded-2xl border border-border-theme p-6 shadow-sm overflow-hidden animate-pulse">
                <div className="h-6 w-48 bg-border-theme rounded mb-6"></div>
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex justify-between">
                                <div className="w-32 h-4 bg-border-theme rounded"></div>
                                <div className="w-16 h-4 bg-border-theme rounded"></div>
                            </div>
                            <div className="w-full h-2 bg-surface-secondary rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const getCategoryIcon = (cat: CostMetric['category']) => {
        switch (cat) {
            case 'Compute': return <Server className="h-4 w-4 text-indigo-500" />;
            case 'Storage': return <Database className="h-4 w-4 text-emerald-500" />;
            case 'Network': return <Network className="h-4 w-4 text-amber-500" />;
            case 'Support': return <Headphones className="h-4 w-4 text-pink-500" />;
            case 'Licensing': return <Key className="h-4 w-4 text-blue-500" />;
        }
    };

    const getCategoryColor = (cat: CostMetric['category']) => {
        switch (cat) {
            case 'Compute': return 'bg-indigo-500/200';
            case 'Storage': return 'bg-emerald-500/200';
            case 'Network': return 'bg-amber-500/200';
            case 'Support': return 'bg-pink-500';
            case 'Licensing': return 'bg-blue-500/200';
        }
    };

    return (
        <div className="w-full bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-border-theme flex items-center justify-between bg-surface/50">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-400" /> Current Month Cost Metrics
                </h3>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-widest px-2 py-1 bg-surface border border-border-theme rounded-md shadow-sm">
                    Realtime
                </span>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
                {metrics.map(metric => {
                    const usedPercent = Math.min((metric.consumedAmount / metric.allocatedAmount) * 100, 100);
                    const isOverOverage = metric.projectedOverage > 0;

                    return (
                        <div key={metric.category} className="group relative">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 font-medium text-text-primary text-sm">
                                    {getCategoryIcon(metric.category)}
                                    {metric.category}
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                    <span className="font-bold text-text-primary">
                                        ${metric.consumedAmount.toLocaleString()}
                                    </span>
                                    <span className="text-text-muted">/ ${metric.allocatedAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="relative w-full h-2.5 bg-surface-secondary rounded-full overflow-hidden">
                                <div
                                    className={`h-full absolute left-0 top-0 rounded-full transition-all duration-1000 ease-out ${isOverOverage ? 'bg-red-500/200' : getCategoryColor(metric.category)}`}
                                    style={{ width: `${usedPercent}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center mt-2.5 text-xs">
                                <div className={`flex items-center gap-1 font-semibold ${metric.percentageChangeMoM > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {metric.percentageChangeMoM > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {Math.abs(metric.percentageChangeMoM)}% from last month
                                </div>

                                {isOverOverage && (
                                    <div className="font-bold text-red-400 bg-red-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                                        Projecting ${metric.projectedOverage.toLocaleString()} overage
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

import React from 'react';
import { AnalyticsMetric } from '../../types/enterpriseAnalytics';
import {
    TrendingUp, TrendingDown, Minus,
    Users, DollarSign, Activity, FileKey2
} from 'lucide-react';

interface AnalyticsCardProps {
    metric: AnalyticsMetric;
    isLoading: boolean;
    delayIndex?: number;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ metric, isLoading, delayIndex = 0 }) => {

    if (isLoading) {
        return (
            <div
                className="w-full h-36 rounded-2xl bg-white/40 backdrop-blur-md border border-slate-100 p-6 flex flex-col justify-between animate-pulse"
                style={{ animationDelay: `${delayIndex * 100}ms` }}
            >
                <div className="flex justify-between items-start">
                    <div className="w-32 h-4 bg-slate-200/50 rounded"></div>
                    <div className="w-8 h-8 rounded-full bg-slate-200/50"></div>
                </div>
                <div className="w-24 h-8 bg-slate-200/50 rounded mt-4"></div>
            </div>
        );
    }

    const getMetricIcon = (category: AnalyticsMetric['category']) => {
        switch (category) {
            case 'engagement': return <Users className="h-5 w-5 text-indigo-500" />;
            case 'revenue': return <DollarSign className="h-5 w-5 text-emerald-500" />;
            case 'system': return <Activity className="h-5 w-5 text-blue-500" />;
            case 'retention': return <FileKey2 className="h-5 w-5 text-purple-500" />;
            default: return <Activity className="h-5 w-5 text-slate-500" />;
        }
    };

    const getTrendIcon = (trend: AnalyticsMetric['trend']) => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
        return <Minus className="h-4 w-4" />;
    };

    const formatValue = (value: number, category: AnalyticsMetric['category']) => {
        if (category === 'revenue') {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
        }
        if (category === 'system' || category === 'retention') {
            return `${value} %`;
        }
        return new Intl.NumberFormat('en-US').format(value);
    };

    const isPositiveTrend =
        (metric.trend === 'up' && metric.category !== 'system' /* assuming high is bad for errors, but good for uptime */)
        ||
        (metric.trend === 'down' && metric.label.toLowerCase().includes('threats'));

    const trendColorClass = metric.trend === 'neutral'
        ? 'text-slate-500 bg-slate-100'
        : isPositiveTrend
            ? 'text-emerald-700 bg-emerald-50'
            : 'text-red-700 bg-red-50';

    return (
        <div className="group relative w-full rounded-2xl bg-white/60 hover:bg-white/90 backdrop-blur-xl border border-white hover:border-indigo-100 p-6 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 ease-out overflow-hidden hover:-translate-y-1">
            {/* Dynamic Background Gradient */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-100/40 to-blue-50/10 blur-2xl group-hover:scale-150 transition-transform duration-700 ease-in-out z-0"></div>

            <div className="relative z-10 flex justify-between items-start">
                <h3 className="text-sm font-medium text-slate-500 group-hover:text-slate-600 transition-colors">
                    {metric.label}
                </h3>
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-50 group-hover:scale-110 transition-transform duration-300 ease-out">
                    {getMetricIcon(metric.category)}
                </div>
            </div>

            <div className="relative z-10 mt-4 flex items-end justify-between">
                <div className="flex flex-col">
                    <span className="text-3xl font-bold tracking-tight text-slate-800">
                        {formatValue(metric.value, metric.category)}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                        vs {formatValue(metric.previousValue, metric.category)} last period
                    </span>
                </div>

                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${trendColorClass}`}>
                    {getTrendIcon(metric.trend)}
                    {metric.percentageChange}%
                </div>
            </div>
        </div>
    );
};

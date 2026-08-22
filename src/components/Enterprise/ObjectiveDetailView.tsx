import React from 'react';
import { Objective, KeyResult } from '../../types/okr';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Crosshair } from 'lucide-react';

interface ObjectiveDetailViewProps {
    objective: Objective | null;
    onUpdateKr: (krId: string, newValue: number) => void;
}

export const ObjectiveDetailView: React.FC<ObjectiveDetailViewProps> = ({ objective, onUpdateKr }) => {
    if (!objective) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center h-[600px] text-slate-400">
                <Target className="h-16 w-16 mb-4 opacity-50" />
                <h4 className="font-bold text-slate-600">No Objective Selected</h4>
                <p className="text-sm mt-1 max-w-sm text-center">Select an objective from the Strategic Alignment Tree to view its Key Results and modify progress tracking.</p>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ON_TRACK': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
            case 'AT_RISK': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'OFF_TRACK': return 'text-red-600 bg-red-50 border-red-200';
            case 'COMPLETED': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
            default: return 'text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ON_TRACK': return <TrendingUp className="h-4 w-4" />;
            case 'AT_RISK': return <AlertTriangle className="h-4 w-4" />;
            case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
            default: return <Target className="h-4 w-4" />;
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 ${getStatusColor(objective.status)}`}>
                                {getStatusIcon(objective.status)}
                                {objective.status.replace('_', ' ')}
                            </span>
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-slate-200 bg-white text-slate-500">
                                {objective.alignment}
                            </span>
                            {objective.departmentName && (
                                <span className="px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider text-slate-500">
                                    DEPT: {objective.departmentName}
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-extrabold text-slate-900 leading-tight">{objective.title}</h2>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-3xl font-black text-indigo-600">{objective.progressPercentage.toFixed(1)}%</div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Progress</div>
                    </div>
                </div>

                <p className="text-sm text-slate-600 mt-4 leading-relaxed max-w-2xl">{objective.description}</p>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500">Tags:</div>
                    {objective.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">
                            {tag}
                        </span>
                    ))}
                    <div className="ml-auto text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded border border-slate-200">
                        Owner: {objective.ownerName}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Crosshair className="h-5 w-5 text-indigo-600" /> Key Results ({objective.keyResults.length})
                </h3>

                <div className="space-y-4">
                    {objective.keyResults.map(kr => {
                        const isIncrease = kr.targetValue > kr.initialValue;
                        let percentDone = 0;
                        if (isIncrease) {
                            percentDone = Math.max(0, Math.min(100, ((kr.currentValue - kr.initialValue) / (kr.targetValue - kr.initialValue)) * 100));
                        } else {
                            percentDone = Math.max(0, Math.min(100, ((kr.initialValue - kr.currentValue) / (kr.initialValue - kr.targetValue)) * 100));
                        }

                        return (
                            <div key={kr.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm transition-all hover:border-slate-300 group">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-slate-800 text-sm">{kr.title}</h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase border border-slate-100 bg-slate-50 px-2 py-0.5 rounded">
                                        Wt: {kr.weight * 100}%
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 mb-2">
                                    <span className="text-xs font-semibold text-slate-400">Start: {kr.initialValue}</span>
                                    <div className="flex-1 px-4 text-center">
                                        <span className="text-lg font-black text-indigo-600">{kr.currentValue}</span>
                                        <span className="text-xs text-slate-500 font-medium ml-1">/ {kr.targetValue} {kr.unit}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400">Target: {kr.targetValue}</span>
                                </div>

                                <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                                    <div
                                        className="absolute left-0 top-0 h-full bg-indigo-500 transition-all duration-700 ease-out"
                                        style={{ width: `${percentDone}%` }}
                                    />
                                </div>

                                <div className="pt-3 border-t border-slate-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="text-xs text-slate-500">Updated {new Date(kr.lastUpdated).toLocaleDateString()} by {kr.ownerName}</div>
                                    <input
                                        type="range"
                                        className="w-1/3 accent-indigo-600 cursor-pointer"
                                        min={isIncrease ? kr.initialValue : kr.targetValue}
                                        max={isIncrease ? kr.targetValue : kr.initialValue}
                                        value={kr.currentValue}
                                        onChange={(e) => onUpdateKr(kr.id, Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

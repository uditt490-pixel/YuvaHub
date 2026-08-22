import React, { useState, useEffect } from 'react';
import { AlignmentMetrics, Objective } from '../../types/okr';
import { OkrService } from '../../services/OkrService';
import { StrategicAlignmentTree } from '../../components/Enterprise/StrategicAlignmentTree';
import { ObjectiveDetailView } from '../../components/Enterprise/ObjectiveDetailView';
import { Target, Flag, Calendar, Eye, PieChart, Focus } from 'lucide-react';

export const OkrDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<AlignmentMetrics | null>(null);
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [selectedObjId, setSelectedObjId] = useState<string | null>(null);
    const [quarter, setQuarter] = useState('Q3');
    const [year, setYear] = useState(2026);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [m, o] = await Promise.all([
                OkrService.getMetrics(),
                OkrService.getObjectives(quarter, year)
            ]);
            setMetrics(m);
            setObjectives(o);
            setIsLoading(false);
        };
        fetchData();
    }, [quarter, year]);

    const handleUpdateKr = async (krId: string, newValue: number) => {
        await OkrService.updateKeyResult(krId, newValue);
        // Optimistic local update
        setObjectives(prev => prev.map(obj => {
            const updatedKrs = obj.keyResults.map(kr => kr.id === krId ? { ...kr, currentValue: newValue } : kr);
            // Dummy rough recalculation of progress
            let newProg = obj.progressPercentage;
            if (updatedKrs !== obj.keyResults) {
                newProg = Math.max(0, Math.min(100, newProg + (Math.random() > 0.5 ? 1 : -0.5))); // Over-simplified local mock
            }
            return { ...obj, keyResults: updatedKrs, progressPercentage: newProg };
        }));
    };

    const selectedObjective = objectives.find(o => o.id === selectedObjId) || null;

    return (
        <div className="min-h-screen bg-slate-50 p-4 xl:p-10 font-sans">
            <div className="max-w-[1600px] mx-auto space-y-8">

                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest border border-indigo-100">
                            <Focus className="h-4 w-4" /> Strategy & Goals
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">OKR Alignment Hub</h1>
                        <p className="text-slate-500 text-sm max-w-2xl">
                            Track Objectives and Key Results, monitor organizational alignment, and drive transparent company-wide performance execution.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 w-full lg:w-auto overflow-x-auto justify-start">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <select className="font-bold text-slate-700 bg-transparent outline-none cursor-pointer" value={quarter} onChange={e => setQuarter(e.target.value)}>
                                {['Q1', 'Q2', 'Q3', 'Q4'].map(q => <option key={q} value={q}>{q}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-200 shrink-0">
                            <select className="font-bold text-slate-700 bg-transparent outline-none cursor-pointer" value={year} onChange={e => setYear(Number(e.target.value))}>
                                {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </header>

                {metrics && !isLoading && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Target className="h-5 w-5" /></div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Goals</span>
                            </div>
                            <p className="text-4xl font-black text-slate-900">{metrics.totalCompanyObjectives}</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 top-0 h-full w-12 bg-emerald-500 opacity-10" />
                            <div className="flex items-center gap-3 mb-4 relative z-10">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><PieChart className="h-5 w-5" /></div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Progress</span>
                            </div>
                            <div className="flex items-end gap-2 relative z-10">
                                <p className="text-4xl font-black text-slate-900">{metrics.overallCompanyProgress}%</p>
                                <p className="text-sm font-bold text-emerald-500 mb-1">+4.2%</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Flag className="h-5 w-5" /></div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">At-Risk</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-slate-900">{metrics.objectivesAtRisk}</p>
                                <p className="text-sm font-semibold text-slate-400 mb-1">needs attention</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-lg border border-indigo-800 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-white/10 text-indigo-200 rounded-xl"><Eye className="h-5 w-5" /></div>
                                <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Org Alignment Score</span>
                            </div>
                            <p className="text-4xl font-black">{metrics.alignmentScore}/100</p>
                        </div>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center p-24">
                        <div className="animate-spin h-10 w-10 border-4 border-slate-200 border-t-indigo-600 rounded-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <StrategicAlignmentTree
                            objectives={objectives}
                            selectedId={selectedObjId}
                            onSelect={setSelectedObjId}
                        />

                        <ObjectiveDetailView
                            objective={selectedObjective}
                            onUpdateKr={handleUpdateKr}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

export default OkrDashboard;

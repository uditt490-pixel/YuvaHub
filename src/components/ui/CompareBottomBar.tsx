import React from 'react';
import { useCompare } from '../../context/CompareContext';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const CompareBottomBar: React.FC = () => {
    const { compareQueue, removeFromCompare, clearCompare } = useCompare();
    const { setActiveTab } = useAppContext();

    if (compareQueue.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] bg-surface dark:bg-slate-900 border-t border-border-theme dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] transform transition-transform duration-300">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 text-primary-blue dark:text-blue-400 font-bold whitespace-nowrap">
                        <Scale size={20} />
                        <span>Compare ({compareQueue.length}/4)</span>
                    </div>
                    
                    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar flex-1">
                        {compareQueue.map((opp, idx) => (
                            <div key={opp.id || idx} className="flex items-center gap-2 bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-lg py-1.5 px-3 whitespace-nowrap text-xs font-semibold max-w-[200px]">
                                <span className="truncate text-text-primary dark:text-slate-200" title={opp.title}>
                                    {opp.title}
                                </span>
                                <button
                                    onClick={() => removeFromCompare(opp.id)}
                                    className="text-text-muted hover:text-red-500 transition-colors ml-1"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={clearCompare}
                        className="text-xs font-bold text-text-muted hover:text-text-primary dark:hover:text-slate-200 transition-colors hidden md:block"
                    >
                        Clear All
                    </button>
                    
                    <button
                        onClick={() => setActiveTab('comparison_studio')}
                        disabled={compareQueue.length < 2}
                        className={`flex items-center gap-1.5 px-5 py-2 text-sm font-bold rounded-xl transition-all ${
                            compareQueue.length >= 2
                            ? 'bg-primary-blue text-white shadow-md hover:bg-[#96552a] hover:shadow-lg'
                            : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        Compare Now
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

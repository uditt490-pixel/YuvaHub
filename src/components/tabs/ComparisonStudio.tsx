import React, { useState, useEffect } from 'react';
import { useCompare } from '../../context/CompareContext';
import { useAppContext } from '../../context/AppContext';
import { Scale, MapPin, Clock, Coins, Sparkles, ArrowRight, ExternalLink, Shield, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { getAuth } from 'firebase/auth';

export default function ComparisonStudio() {
    const { compareQueue, removeFromCompare } = useCompare();
    const { profile, user, setActiveTab } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [comparisonData, setComparisonData] = useState<{
        opportunities: any[];
        summary: any;
    } | null>(null);

    useEffect(() => {
        if (compareQueue.length < 2) return;
        
        const fetchComparison = async () => {
            setLoading(true);
            setError(null);
            try {
                const auth = getAuth();
                const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
                
                const response = await fetch('/api/v1/opportunities/compare', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        opportunityIds: compareQueue.map(o => o.id),
                        profile
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch comparison data');
                }

                const data = await response.json();
                if (data.success && data.data) {
                    setComparisonData(data.data);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (err: any) {
                console.error("Comparison error:", err);
                setError(err.message || "An error occurred while comparing opportunities.");
            } finally {
                setLoading(false);
            }
        };

        fetchComparison();
    }, [compareQueue, profile]);

    if (compareQueue.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
                <div className="w-16 h-16 bg-background dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Scale className="w-8 h-8 text-primary-blue dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-text-primary dark:text-slate-100 mb-2">Not enough items to compare</h2>
                <p className="text-text-muted dark:text-slate-400 max-w-md mb-6">
                    Add at least 2 opportunities to the comparison studio to see side-by-side analysis and AI recommendations.
                </p>
                <button
                    onClick={() => setActiveTab('opportunities')}
                    className="px-6 py-2.5 bg-primary-blue hover:bg-[#96552a] text-white font-bold rounded-xl transition-all"
                >
                    Browse Opportunities
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary dark:text-slate-100 flex items-center gap-3">
                        <Scale className="text-primary-blue dark:text-blue-400" />
                        Comparison Studio
                    </h1>
                    <p className="text-sm text-text-muted dark:text-slate-400 mt-1">
                        Side-by-side analysis of your selected opportunities
                    </p>
                </div>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary-blue animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 rounded-full bg-primary-blue animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 rounded-full bg-primary-blue animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <p className="text-sm font-medium text-text-muted">AI is analyzing your options...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold">Error</h4>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {!loading && !error && comparisonData && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Column: AI Summary */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-br from-[#fcf9f2] to-white dark:from-slate-800 dark:to-slate-900 p-5 rounded-2xl border border-border-theme dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-primary-blue dark:text-blue-400" />
                                <h3 className="font-bold text-text-primary dark:text-slate-100">AI Recommendation</h3>
                            </div>
                            
                            <p className="text-sm text-text-secondary dark:text-slate-300 leading-relaxed mb-6 font-medium bg-surface-secondary/50 dark:bg-slate-800/50 p-4 rounded-xl italic">
                                "{comparisonData.summary.reasoning}"
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Key Pros</h4>
                                    <ul className="space-y-2">
                                        {comparisonData.summary.pros.map((pro: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-text-primary dark:text-slate-300">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>{pro}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                
                                <div>
                                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Considerations</h4>
                                    <ul className="space-y-2">
                                        {comparisonData.summary.cons.map((con: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-text-primary dark:text-slate-300">
                                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                                <span>{con}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Differentiators</h4>
                                    <ul className="space-y-2">
                                        {comparisonData.summary.differentiators.map((diff: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-text-primary dark:text-slate-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-blue mt-2 shrink-0" />
                                                <span>{diff}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Columns: Comparison Grid */}
                    <div className="lg:col-span-3 overflow-x-auto hide-scrollbar">
                        <div className="flex gap-4 min-w-max pb-4">
                            {comparisonData.opportunities.map((opp) => (
                                <div 
                                    key={opp.id} 
                                    className={`w-[300px] shrink-0 bg-surface dark:bg-slate-900 rounded-2xl border transition-all flex flex-col ${
                                        comparisonData.summary.recommendedWinnerId === opp.id
                                        ? 'border-primary-blue dark:border-blue-500 shadow-md ring-2 ring-[#b56b37]/20 dark:ring-blue-500/20'
                                        : 'border-border-theme dark:border-slate-800'
                                    }`}
                                >
                                    {comparisonData.summary.recommendedWinnerId === opp.id && (
                                        <div className="bg-primary-blue dark:bg-blue-600 text-white text-xs font-bold text-center py-1.5 rounded-t-xl tracking-wide uppercase">
                                            Recommended Match
                                        </div>
                                    )}
                                    
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="font-bold text-text-primary dark:text-slate-100 text-lg mb-1 leading-snug">{opp.title}</h3>
                                            <p className="text-sm font-semibold text-text-muted dark:text-slate-400">{opp.organization || opp.source_name}</p>
                                        </div>

                                        <div className="space-y-4 flex-1">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-background dark:bg-slate-800 p-2.5 rounded-lg border border-border-theme dark:border-slate-700">
                                                    <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">Stipend/Salary</span>
                                                    <div className="flex items-center gap-1.5 text-sm font-bold text-[#63703d]">
                                                        <Coins className="w-3.5 h-3.5" />
                                                        <span className="truncate">{opp.stipend || 'Unpaid'}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-background dark:bg-slate-800 p-2.5 rounded-lg border border-border-theme dark:border-slate-700">
                                                    <span className="text-[10px] uppercase font-bold text-text-muted block mb-1">Match Score</span>
                                                    <div className="flex items-center gap-1.5 text-sm font-bold text-primary-blue">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span>{opp.matchScore || 'N/A'}%</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                                                    <div className="text-sm text-text-primary dark:text-slate-300">
                                                        <span className="block text-[10px] font-bold text-text-muted uppercase mb-0.5">Location</span>
                                                        {opp.location || 'Remote'}
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <Clock className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                                                    <div className="text-sm text-text-primary dark:text-slate-300">
                                                        <span className="block text-[10px] font-bold text-text-muted uppercase mb-0.5">Deadline</span>
                                                        {opp.deadline || 'Rolling Admissions'}
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3">
                                                    <Shield className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                                                    <div className="text-sm text-text-primary dark:text-slate-300">
                                                        <span className="block text-[10px] font-bold text-text-muted uppercase mb-0.5">Category</span>
                                                        {opp.category || opp.opportunity_type || 'Opportunity'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-border-theme dark:border-slate-800 flex flex-col gap-2">
                                            <a
                                                href={opp.apply_link || opp.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-blue hover:bg-[#96552a] text-white text-sm font-bold rounded-xl transition-colors"
                                            >
                                                Apply Now
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => removeFromCompare(opp.id)}
                                                className="w-full py-2 text-xs font-bold text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                            >
                                                Dismiss from comparison
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

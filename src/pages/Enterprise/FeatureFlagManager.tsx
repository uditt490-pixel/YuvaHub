import React, { useState, useEffect } from 'react';
import { FeatureFlag, Environment, ExperimentMetrics as IExpMetrics } from '../../types/featureFlags';
import { FeatureFlagService } from '../../services/FeatureFlagService';
import { ExperimentMetrics } from '../../components/Enterprise/ExperimentMetrics';
import { AudienceTargetingRules } from '../../components/Enterprise/AudienceTargetingRules';
import { ToggleLeft, Server, Activity, Plus, Search, Tag } from 'lucide-react';

export const FeatureFlagManager: React.FC = () => {
    const [activeEnv, setActiveEnv] = useState<Environment>('PRODUCTION');
    const [flags, setFlags] = useState<FeatureFlag[]>([]);
    const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
    const [expMetrics, setExpMetrics] = useState<IExpMetrics | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMetricsLoading, setIsMetricsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeEnv]);

    const fetchData = async () => {
        setIsLoading(true);
        const data = await FeatureFlagService.getFeatureFlags(activeEnv);
        setFlags(data);
        setSelectedFlagId(data[0]?.id || null);
        setIsLoading(false);
    };

    useEffect(() => {
        if (selectedFlagId) {
            const loadMetrics = async () => {
                setIsMetricsLoading(true);
                const metrics = await FeatureFlagService.getExperimentMetrics(selectedFlagId);
                setExpMetrics(metrics);
                setIsMetricsLoading(false);
            };
            loadMetrics();
        }
    }, [selectedFlagId]);

    const handleToggle = async (flagId: string, currentStatus: boolean) => {
        // Optimistic UI Update
        setFlags(prev => prev.map(f => {
            if (f.id === flagId) {
                return {
                    ...f,
                    environments: {
                        ...f.environments,
                        [activeEnv]: {
                            ...f.environments[activeEnv],
                            isEnabled: !currentStatus
                        }
                    }
                };
            }
            return f;
        }));
        await FeatureFlagService.toggleEnvironmentStatus(flagId, activeEnv, !currentStatus);
    };

    const handleRolloutChange = async (flagId: string, newPercentage: number) => {
        // Optimistic UI Update
        setFlags(prev => prev.map(f => {
            if (f.id === flagId) {
                return {
                    ...f,
                    environments: {
                        ...f.environments,
                        [activeEnv]: {
                            ...f.environments[activeEnv],
                            rolloutPercentage: newPercentage
                        }
                    }
                };
            }
            return f;
        }));
        await FeatureFlagService.updateRolloutTarget(flagId, activeEnv, newPercentage);
    };

    const selectedFlagData = flags.find(f => f.id === selectedFlagId);
    const currentEnvData = selectedFlagData?.environments[activeEnv];
    const filteredFlags = flags.filter(f => f.key.toLowerCase().includes(searchQuery.toLowerCase()) || f.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-background p-4 lg:p-8 font-sans">
            <div className="max-w-[1500px] mx-auto space-y-8">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-surface p-6 rounded-3xl border border-border-theme shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-surface-secondary text-text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-border-theme">
                                <ToggleLeft className="h-4 w-4" /> Release Toggles
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">Feature Flag Management</h1>
                    </div>

                    <div className="flex items-center bg-surface-secondary p-1.5 rounded-xl border border-border-theme shadow-inner w-full sm:w-auto">
                        {['PRODUCTION', 'STAGING', 'DEVELOPMENT'].map(env => (
                            <button
                                key={env}
                                onClick={() => setActiveEnv(env as Environment)}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeEnv === env ? 'bg-surface text-text-primary shadow-sm shadow-slate-200' : 'text-text-muted hover:text-text-primary'}`}
                            >
                                <Server className="h-4 w-4" /> {env === 'PRODUCTION' ? 'Prod' : env === 'STAGING' ? 'Staging' : 'Dev'}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Flag List Sidebar */}
                    <div className="lg:col-span-4 bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden flex flex-col h-[800px]">
                        <div className="p-4 border-b border-border-theme bg-surface/50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search flag key..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 border border-border-theme rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-surface"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {isLoading ? (
                                <div className="flex justify-center p-10"><div className="animate-spin h-6 w-6 border-2 border-border-theme border-t-indigo-600 rounded-full" /></div>
                            ) : filteredFlags.length === 0 ? (
                                <div className="text-center p-6 text-text-muted text-sm font-medium">No flags correspond to your search criteria.</div>
                            ) : (
                                filteredFlags.map(flag => {
                                    const isEnabled = flag.environments[activeEnv].isEnabled;
                                    const isSelected = flag.id === selectedFlagId;

                                    return (
                                        <div
                                            key={flag.id}
                                            onClick={() => setSelectedFlagId(flag.id)}
                                            className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected ? 'border-indigo-500 bg-indigo-500/20/30 shadow-sm' : 'border-border-theme hover:border-border-theme bg-surface'}`}
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="max-w-[70%]">
                                                    <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-text-primary'}`}>{flag.name}</h4>
                                                    <code className="text-[10px] bg-surface-secondary text-text-muted px-1.5 py-0.5 rounded mt-1 inline-block truncate max-w-full font-mono">{flag.key}</code>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggle(flag.id, isEnabled); }}
                                                    className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${isEnabled ? 'bg-emerald-500/200 hover:bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                                                >
                                                    <span className={`absolute top-1 bg-surface w-4 h-4 rounded-full transition-all shadow-sm ${isEnabled ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="p-4 border-t border-border-theme bg-surface">
                            <button className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                <Plus className="h-4 w-4" /> Create Flag
                            </button>
                        </div>
                    </div>

                    {/* Detail Viewpane */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {!selectedFlagData || !currentEnvData ? (
                            <div className="flex-1 bg-surface rounded-2xl border border-border-theme border-dashed flex flex-col items-center justify-center text-text-muted p-12">
                                <ToggleLeft className="h-16 w-16 mb-4 opacity-50" />
                                <p className="font-medium">Select a feature flag from the index to view configurations</p>
                            </div>
                        ) : (
                            <>
                                <div className="bg-surface rounded-2xl border border-border-theme p-8 shadow-sm relative overflow-hidden">
                                    <div className={`absolute left-0 top-0 w-1.5 h-full ${currentEnvData.isEnabled ? 'bg-emerald-500/200' : 'bg-slate-300'}`} />

                                    <div className="flex flex-col xl:flex-row justify-between gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <h2 className="text-2xl font-black text-text-primary">{selectedFlagData.name}</h2>
                                                <div className="flex items-center gap-3 mt-2 text-sm text-text-muted font-medium">
                                                    <span className="flex items-center gap-1"><Tag className="h-4 w-4" /> {selectedFlagData.type} FLAG</span>
                                                    <span>•</span>
                                                    <code className="text-xs bg-surface-secondary px-2 py-0.5 rounded font-mono">{selectedFlagData.key}</code>
                                                </div>
                                            </div>
                                            <p className="text-text-secondary max-w-xl">{selectedFlagData.description}</p>
                                            <div className="flex gap-2">
                                                {selectedFlagData.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-xs font-bold uppercase border border-indigo-100">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="w-full xl:w-72 space-y-6">
                                            <div className="bg-surface rounded-xl p-5 border border-border-theme">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-xs font-bold text-text-primary uppercase tracking-widest">Traffic Rollout</label>
                                                    <span className="text-indigo-400 font-black">{currentEnvData.rolloutPercentage}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0" max="100" step="5"
                                                    className="w-full h-2 bg-border-theme rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                    value={currentEnvData.rolloutPercentage}
                                                    disabled={!currentEnvData.isEnabled}
                                                    onChange={(e) => handleRolloutChange(selectedFlagData.id, parseInt(e.target.value))}
                                                />
                                                <div className="flex justify-between text-[10px] font-bold text-text-muted mt-1 uppercase">
                                                    <span>0%</span>
                                                    <span>50%</span>
                                                    <span>100%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <AudienceTargetingRules rules={currentEnvData.targetingRules} />

                                    {selectedFlagData.type === 'EXPERIMENT' ? (
                                        <ExperimentMetrics metrics={expMetrics} isLoading={isMetricsLoading} />
                                    ) : (
                                        <div className="w-full bg-surface/50 rounded-2xl border border-border-theme p-8 shadow-sm flex flex-col items-center justify-center text-center h-[300px]">
                                            <Activity className="h-10 w-10 text-slate-300 mb-4" />
                                            <h4 className="font-bold text-text-primary">Metrics Disengaged</h4>
                                            <p className="text-sm text-text-muted max-w-sm mt-1">This flag is not configured for A/B testing or multidimensional metrics evaluation.</p>
                                            <button className="mt-4 text-sm font-bold text-indigo-400 hover:text-indigo-400">Upgrade to Experiment</button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FeatureFlagManager;

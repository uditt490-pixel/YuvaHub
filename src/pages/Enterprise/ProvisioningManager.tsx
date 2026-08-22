import React, { useState, useEffect } from 'react';
import { ProvisioningMetrics, CloudResourceDef, ResourceTemplate } from '../../types/provisioning';
import { ProvisioningService } from '../../services/ProvisioningService';
import { CloudArchitectureGraph } from '../../components/Enterprise/CloudArchitectureGraph';
import { ResourceCatalog } from '../../components/Enterprise/ResourceCatalog';
import { Cloud, Zap, ShieldAlert, Cpu } from 'lucide-react';

export const ProvisioningManager: React.FC = () => {
    const [metrics, setMetrics] = useState<ProvisioningMetrics | null>(null);
    const [resources, setResources] = useState<CloudResourceDef[]>([]);
    const [templates, setTemplates] = useState<ResourceTemplate[]>([]);

    const loadData = async () => {
        const [m, r, t] = await Promise.all([
            ProvisioningService.getMetrics(),
            ProvisioningService.getActiveResources(),
            ProvisioningService.getTemplates()
        ]);
        setMetrics(m);
        setResources(r);
        setTemplates(t);
    };

    useEffect(() => { loadData(); }, []);

    return (
        <div className="min-h-screen bg-slate-100 p-4 lg:p-8 font-sans">
            <div className="max-w-[1400px] mx-auto space-y-8">

                <header className="flex justify-between items-end bg-gradient-to-br from-slate-900 to-indigo-900 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 blur-3xl rounded-full pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

                    <div className="relative z-10 space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-bold uppercase tracking-widest border border-white/20 backdrop-blur-sm">
                            <Cloud className="h-4 w-4" /> Cloud Operations
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Resource Provisioning</h1>
                        <p className="text-indigo-200 text-sm max-w-xl">Scale, monitor, and provision globally distributed architectural resources directly from the command center.</p>
                    </div>
                </header>

                {metrics && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2"><Cpu className="h-4 w-4 text-indigo-500" /> Active Nodes</p>
                            <p className="text-4xl font-black text-slate-900">{metrics.totalActiveResources}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2"><Zap className="h-4 w-4 text-amber-500" /> Deployments</p>
                            <p className="text-4xl font-black text-slate-900">{metrics.activeDeployments}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-2"><ShieldAlert className="h-4 w-4 text-emerald-500" /> System Health</p>
                            <p className="text-4xl font-black text-slate-900">{metrics.overallSystemHealth}%</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 bg-gradient-to-br from-indigo-50 to-white">
                            <p className="text-xs font-bold text-indigo-900/60 uppercase flex items-center gap-2 mb-2">Projected MRR</p>
                            <p className="text-4xl font-black text-indigo-900">${metrics.totalMonthlyProjectedCost.toLocaleString()}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <CloudArchitectureGraph resources={resources} />
                    </div>

                    <div className="lg:col-span-1 h-[600px]">
                        <ResourceCatalog templates={templates} onDeployed={loadData} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProvisioningManager;

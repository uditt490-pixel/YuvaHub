import React, { useState, useEffect } from 'react';
import { SecurityMetrics, NetworkNode, SecurityEvent, AccessPolicy } from '../../types/networkSecurity';
import { NetworkSecurityService } from '../../services/NetworkSecurityService';
import { ThreatVectorMap } from '../../components/Enterprise/ThreatVectorMap';
import { AccessPolicyController } from '../../components/Enterprise/AccessPolicyController';
import { ShieldAlert, Server, Activity, Lock, AlertTriangle, ArrowUpCircle } from 'lucide-react';

export const NetworkSentinelDashboard: React.FC = () => {
    const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
    const [nodes, setNodes] = useState<NetworkNode[]>([]);
    const [events, setEvents] = useState<SecurityEvent[]>([]);
    const [policies, setPolicies] = useState<AccessPolicy[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [m, n, e, p] = await Promise.all([
                NetworkSecurityService.getMetrics(),
                NetworkSecurityService.getNodes(),
                NetworkSecurityService.getRecentEvents(),
                NetworkSecurityService.getPolicies()
            ]);
            setMetrics(m);
            setNodes(n);
            setEvents(e);
            setPolicies(p);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleTogglePolicy = async (id: string, current: boolean) => {
        setPolicies(prev => prev.map(p => p.id === id ? { ...p, isEnabled: !current } : p));
        await NetworkSecurityService.togglePolicy(id, !current);
    };

    const getNodeStatusColor = (status: string) => {
        switch (status) {
            case 'ONLINE': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
            case 'UNDER_ATTACK': return 'text-red-500 bg-red-50 border-red-200 animate-pulse';
            case 'ISOLATED': return 'text-amber-500 bg-amber-50 border-amber-200';
            default: return 'text-slate-500 bg-slate-50 border-slate-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <div className="max-w-[1700px] mx-auto p-4 lg:p-8 space-y-8">

                <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-full bg-indigo-500 opacity-5 pointer-events-none transform skew-x-12" />
                    <div className="absolute right-12 top-0 w-32 h-full bg-blue-500 opacity-5 pointer-events-none transform skew-x-12" />

                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-800 text-indigo-400 text-xs font-black uppercase tracking-widest border border-slate-700 shadow-inner">
                            <Lock className="h-4 w-4" /> Zero-Trust Security
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Network Sentinel</h1>
                        <p className="text-slate-400 text-sm max-w-2xl">
                            Real-time volumetric intrusion detection, WAF traffic routing, and DDoS mitigation logic enforcing Zero-Trust perimeters.
                        </p>
                    </div>

                    {metrics && (
                        <div className="flex flex-wrap gap-4 relative z-10">
                            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 min-w-[150px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ShieldAlert className="h-3 w-3 text-emerald-400" /> Auto Mitigation</p>
                                <p className="text-2xl font-black text-white">{metrics.autoMitigationRate}%</p>
                            </div>
                            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 min-w-[150px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><AlertTriangle className="h-3 w-3 text-red-400" /> Threats Processed</p>
                                <p className="text-2xl font-black text-white">{metrics.activeThreatsProcessed.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 min-w-[150px]">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ArrowUpCircle className="h-3 w-3 text-blue-400" /> Data Dropped</p>
                                <p className="text-2xl font-black text-white">{metrics.totalBandwidthBlockedTb} <span className="text-sm font-medium text-slate-400">TB</span></p>
                            </div>
                        </div>
                    )}
                </header>

                {isLoading ? (
                    <div className="flex justify-center p-32">
                        <div className="animate-spin h-12 w-12 border-4 border-slate-300 border-t-indigo-600 rounded-full shadow-lg" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left Column: Network State */}
                        <div className="lg:col-span-4 space-y-8 flex flex-col">

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
                                    <Server className="h-5 w-5 text-indigo-600" />
                                    <h3 className="font-bold text-slate-800">Critical Network Nodes</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    {nodes.map(node => (
                                        <div key={node.id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-300 transition-colors shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-sm text-slate-800">{node.name}</h4>
                                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${getNodeStatusColor(node.status)}`}>
                                                    {node.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{node.ipAddress}</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{node.type}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Traffic</div>
                                                    <div className="text-sm font-black text-slate-700">{node.throughputMbps} Mbps</div>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Conns</div>
                                                    <div className="text-sm font-black text-slate-700">{node.connections.toLocaleString()}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Middle Column / Right Column Space */}
                        <div className="lg:col-span-8 space-y-8 flex flex-col">
                            <ThreatVectorMap events={events} />

                            <AccessPolicyController policies={policies} onToggle={handleTogglePolicy} />
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default NetworkSentinelDashboard;

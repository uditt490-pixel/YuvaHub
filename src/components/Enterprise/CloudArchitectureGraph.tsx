import React from 'react';
import { CloudResourceDef } from '../../types/provisioning';
import { Server, Database, HardDrive, Zap, Network, Activity, Info } from 'lucide-react';

interface CloudArchitectureGraphProps {
    resources: CloudResourceDef[];
}

export const CloudArchitectureGraph: React.FC<CloudArchitectureGraphProps> = ({ resources }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'COMPUTE': return <Server className="h-6 w-6 text-indigo-500" />;
            case 'DATABASE': return <Database className="h-6 w-6 text-emerald-500" />;
            case 'STORAGE': return <HardDrive className="h-6 w-6 text-amber-500" />;
            case 'CACHE': return <Zap className="h-6 w-6 text-pink-500" />;
            default: return <Network className="h-6 w-6 text-slate-500" />;
        }
    };

    const getColor = (health: string) => {
        switch (health) {
            case 'HEALTHY': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
            case 'DEGRADED': return 'bg-amber-50 border-amber-200 text-amber-700';
            case 'PROVISIONING': return 'bg-blue-50 border-blue-200 text-blue-700';
            default: return 'bg-slate-50 border-slate-200 text-slate-700';
        }
    };

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden h-[400px]">
            <div className="absolute inset-0 bg-[#f8fafc] opacity-50 diagram-grid-pattern" style={{ backgroundImage: 'radial-gradient(#e2e8f0 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
            <div className="relative z-10 flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600" /> Topology Map
                </h3>
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm">
                    <Info className="h-3 w-3" /> Live Graph
                </span>
            </div>

            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
                {resources.map((res) => (
                    <div key={res.id} className={`p-4 rounded-2xl border-2 shadow-sm transition-transform hover:-translate-y-1 bg-white`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-slate-50 rounded-xl shadow-inner border border-slate-100">
                                {getIcon(res.type)}
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shadow-sm border ${getColor(res.health)}`}>
                                {res.health}
                            </span>
                        </div>

                        <h4 className="font-bold text-slate-800 text-sm truncate" title={res.name}>{res.name}</h4>
                        <div className="flex justify-between items-center mt-3 text-xs font-semibold text-slate-500">
                            <span className="bg-slate-100 px-2 py-0.5 rounded">{res.region}</span>
                            <span className={res.uptimePercentage < 99 ? 'text-amber-500' : 'text-emerald-500'}>
                                {res.uptimePercentage}% UP
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

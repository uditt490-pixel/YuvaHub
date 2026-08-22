import React from 'react';
import { SecurityEvent } from '../../types/networkSecurity';
import { Map, ShieldAlert, XCircle, AlertTriangle, CheckCircle, Crosshair } from 'lucide-react';

interface ThreatVectorMapProps {
    events: SecurityEvent[];
}

export const ThreatVectorMap: React.FC<ThreatVectorMapProps> = ({ events }) => {
    const getSeverityColor = (sev: string) => {
        switch (sev) {
            case 'CRITICAL': return 'bg-red-500 shadow-red-500/50';
            case 'HIGH': return 'bg-amber-500 shadow-amber-500/50';
            case 'MEDIUM': return 'bg-blue-500 shadow-blue-500/50';
            default: return 'bg-slate-400 shadow-slate-400/50';
        }
    };

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'BLOCKED': return <XCircle className="h-3 w-3 text-red-500" />;
            case 'FLAGGED': return <AlertTriangle className="h-3 w-3 text-amber-500" />;
            case 'ALLOWED': return <CheckCircle className="h-3 w-3 text-emerald-500" />;
            default: return <Crosshair className="h-3 w-3 text-slate-500" />;
        }
    };

    return (
        <div className="bg-slate-900 rounded-2xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-[500px]">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <Map className="h-5 w-5 text-indigo-400" /> Live Threat Geography
                </h3>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        LIVE RADAR
                    </span>
                </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-[#0f172a]">
                {/* Abstract Map Background Simulation */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at center, #334155 1px, transparent 1px)',
                    backgroundSize: '24px 24px' // Simple dots pattern for radar vibe
                }} />

                {/* Pulsing Radar Ring */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-slate-700 rounded-full opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-indigo-900/50 rounded-full opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-blue-900/50 rounded-full opacity-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-slate-800/50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-slate-800/50" />

                {/* Plotted Events Overlaid as Nodes */}
                {events.map((evt, idx) => {
                    // Fake random positioning for the visualization to look like a world radar map
                    const topPercent = Math.max(10, Math.min(90, 50 + (Math.sin(idx * 43) * 40)));
                    const leftPercent = Math.max(10, Math.min(90, 50 + (Math.cos(idx * 79) * 40)));

                    return (
                        <div
                            key={evt.id}
                            className="absolute group transition-transform hover:scale-110 hover:z-50 cursor-crosshair"
                            style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                        >
                            <div className="relative">
                                <div className={`w-3 h-3 rounded-full shadow-lg ${getSeverityColor(evt.severity)}`} />
                                <div className={`absolute -inset-2 rounded-full animate-ping opacity-30 ${getSeverityColor(evt.severity)}`} />

                                {/* Tooltip Hover popup */}
                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 rounded-xl border border-slate-700 shadow-2xl p-3 pointer-events-none">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            {evt.sourceGeo.countryCode} • {evt.sourceGeo.lat.toFixed(2)}, {evt.sourceGeo.long.toFixed(2)}
                                        </span>
                                        <span className="bg-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold text-white border border-slate-600">
                                            {evt.protocol}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-white text-sm mb-1 truncate">{evt.threatType}</h4>
                                    <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                                        <span>IP: {evt.sourceIP}</span>
                                        <span className="flex items-center gap-1">
                                            {getActionIcon(evt.actionTaken)} {evt.actionTaken}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

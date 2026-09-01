import React, { useState } from 'react';
import { DataNode, PipelineEdge } from '../../types/dataMesh';
import { Network, Database, Hexagon, Filter, ArrowRight, Save, Activity } from 'lucide-react';

interface PipelineFlowGraphProps {
    nodes: DataNode[];
    edges: PipelineEdge[];
    selectedNodeId: string | null;
    onSelectNode: (id: string | null) => void;
}

export const PipelineFlowGraph: React.FC<PipelineFlowGraphProps> = ({ nodes, edges, selectedNodeId, onSelectNode }) => {
    // A simplistic visual layer to mimic a network graph / DAG
    // By ordering ingest -> transform -> destinations mapped in columns
    const ingests = nodes.filter(n => n.type === 'INGEST');
    const transforms = nodes.filter(n => n.type === 'TRANSFORM' || n.type === 'JOIN');
    const destinations = nodes.filter(n => n.type === 'DESTINATION');

    const getNodeIcon = (type: string) => {
        switch (type) {
            case 'INGEST': return <Database className="h-5 w-5 text-blue-500" />;
            case 'TRANSFORM':
            case 'JOIN': return <Filter className="h-5 w-5 text-amber-500" />;
            case 'DESTINATION': return <Save className="h-5 w-5 text-emerald-500" />;
            default: return <Hexagon className="h-5 w-5 text-text-muted" />;
        }
    };

    const PipelineNodeUI = ({ node }: { node: DataNode }) => {
        const isSelected = selectedNodeId === node.id;
        return (
            <div
                onClick={() => onSelectNode(node.id)}
                className={`w-64 p-4 rounded-xl border-2 transition-all cursor-pointer relative z-10 shadow-sm ${isSelected ? 'bg-indigo-500/20 border-indigo-400 shadow-indigo-100/50 scale-105' :
                        node.status === 'ERROR' ? 'bg-red-500/20 border-red-500/30 hover:border-red-300' :
                            node.status === 'PAUSED' ? 'bg-surface border-border-theme hover:border-border-theme opacity-75' :
                                'bg-surface border-border-theme hover:border-border-theme hover:shadow-md'
                    }`}
            >
                <div className="flex justify-between items-start mb-2">
                    <div className="bg-surface p-2 rounded-lg shadow-sm border border-border-theme inline-block mb-1">
                        {getNodeIcon(node.type)}
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${node.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' :
                            node.status === 'PAUSED' ? 'text-text-muted bg-surface-secondary border-border-theme' :
                                'text-red-400 bg-red-500/20 border-red-500/30'
                        }`}>
                        {node.status}
                    </span>
                </div>
                <h4 className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-text-primary'}`}>{node.name}</h4>
                <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider mb-3">{node.provider}</div>

                {node.bytesProcessedMb !== undefined && (
                    <div className="pt-3 border-t border-border-theme/50 flex justify-between items-center text-xs text-text-muted font-medium whitespace-nowrap">
                        <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {(node.bytesProcessedMb / 1024).toFixed(1)} GB</span>
                        <span>{node.recordsPerMinute?.toLocaleString()} rp/m</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden flex flex-col h-[600px] relative">
            <div className="px-6 py-4 border-b border-border-theme bg-surface/50 flex justify-between items-center relative z-20">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <Network className="h-5 w-5 text-indigo-400" /> Pipeline Topology DAG
                </h3>
                {selectedNodeId && (
                    <button onClick={() => onSelectNode(null)} className="text-xs font-bold text-text-muted hover:text-text-primary bg-surface px-3 py-1.5 rounded-lg border border-border-theme shadow-sm">
                        Clear Selection
                    </button>
                )}
            </div>

            <div className="flex-1 bg-background overflow-auto relative p-8 diagram-background">
                <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                <div className="flex gap-24 h-full items-center relative z-10">

                    <div className="flex flex-col gap-10 shrink-0">
                        {ingests.map(n => <PipelineNodeUI key={n.id} node={n} />)}
                    </div>

                    <div className="flex flex-col justify-center gap-16 shrink-0 h-full">
                        <ArrowRight className="h-10 w-10 text-slate-300 mx-auto -ml-12 absolute left-[272px] top-1/2 -translate-y-1/2 opacity-20" />
                        {transforms.map(n => <PipelineNodeUI key={n.id} node={n} />)}
                    </div>

                    <div className="flex flex-col gap-10 shrink-0 h-full justify-center">
                        <ArrowRight className="h-10 w-10 text-slate-300 mx-auto -ml-12 absolute left-[624px] top-1/2 -translate-y-1/2 opacity-20" />
                        {destinations.map(n => <PipelineNodeUI key={n.id} node={n} />)}
                    </div>

                </div>
            </div>
        </div>
    );
};

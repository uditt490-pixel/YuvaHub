import React, { useState, useEffect } from 'react';
import { DataMeshOverview, DataNode, PipelineEdge, TransformationStep, JobRunTelemetry } from '../../types/dataMesh';
import { DataMeshService } from '../../services/DataMeshService';
import { PipelineFlowGraph } from '../../components/Enterprise/PipelineFlowGraph';
import { EtlTransformationEditor } from '../../components/Enterprise/EtlTransformationEditor';
import { DatabaseZap, ArrowUpRight, Activity, AlertCircle, Clock } from 'lucide-react';

export const DataPipelineBuilder: React.FC = () => {
    const [metrics, setMetrics] = useState<DataMeshOverview | null>(null);
    const [nodes, setNodes] = useState<DataNode[]>([]);
    const [edges, setEdges] = useState<PipelineEdge[]>([]);
    const [jobs, setJobs] = useState<JobRunTelemetry[]>([]);

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [transformSteps, setTransformSteps] = useState<TransformationStep[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMesh = async () => {
            setIsLoading(true);
            const [m, topology, j] = await Promise.all([
                DataMeshService.getOverviewMetrics(),
                DataMeshService.getPipelineTopology(),
                DataMeshService.getTelemetryJobs()
            ]);
            setMetrics(m);
            setNodes(topology.nodes);
            setEdges(topology.edges);
            setJobs(j);
            setIsLoading(false);
        };
        fetchMesh();
    }, []);

    useEffect(() => {
        const loadSteps = async () => {
            if (!selectedNodeId) {
                setTransformSteps([]);
                return;
            }
            const steps = await DataMeshService.getTransformations(selectedNodeId);
            setTransformSteps(steps);
        };
        loadSteps();
    }, [selectedNodeId]);

    const selectedNodeName = nodes.find(n => n.id === selectedNodeId)?.name;

    return (
        <div className="min-h-screen bg-surface font-sans text-text-primary">
            <div className="max-w-[1700px] mx-auto p-4 lg:p-8 space-y-8">

                <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-surface p-8 rounded-3xl border border-border-theme shadow-sm relative overflow-hidden">
                    <div className="absolute -right-24 -top-24 w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-secondary text-text-primary text-xs font-black uppercase tracking-widest border border-border-theme">
                            <DatabaseZap className="h-4 w-4" /> Operations Engine
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight">Data Pipeline Mesh</h1>
                        <p className="text-text-muted text-sm max-w-2xl">
                            Create, trace, and execute complex Directed Acyclic Graphs mapping distributed stream processing jobs and data warehousing ETL pipelines.
                        </p>
                    </div>

                    {metrics && (
                        <div className="flex flex-wrap gap-4 relative z-10 w-full lg:w-auto">
                            <div className="bg-surface p-4 rounded-xl border border-border-theme flex-1 min-w-[130px]">
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1.5">Nodes Active</p>
                                <p className="text-2xl font-black text-text-primary">{metrics.activePipelines}</p>
                            </div>
                            <div className="bg-emerald-500/20 p-4 rounded-xl border border-emerald-100 flex-1 min-w-[130px]">
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><ArrowUpRight className="h-3 w-3" /> TB Transferred</p>
                                <p className="text-2xl font-black text-emerald-900">{(metrics.totalGbProcessedToday / 1024).toFixed(1)}</p>
                            </div>
                            <div className="bg-red-500/20 p-4 rounded-xl border border-red-100 flex-1 min-w-[130px]">
                                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1.5"><AlertCircle className="h-3 w-3 " /> Failed Jobs (24H)</p>
                                <p className="text-2xl font-black text-red-900">{metrics.failedJobsLast24h}</p>
                            </div>
                        </div>
                    )}
                </header>

                {isLoading ? (
                    <div className="flex justify-center p-32">
                        <div className="animate-spin h-10 w-10 border-4 border-border-theme border-t-indigo-600 rounded-full" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

                        <div className="xl:col-span-8 flex flex-col gap-6">
                            <PipelineFlowGraph
                                nodes={nodes}
                                edges={edges}
                                selectedNodeId={selectedNodeId}
                                onSelectNode={setSelectedNodeId}
                            />

                            <div className="bg-surface rounded-2xl border border-border-theme shadow-sm overflow-hidden h-[300px] flex flex-col">
                                <div className="px-5 py-4 border-b border-border-theme bg-surface flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-emerald-400" />
                                    <h3 className="font-bold text-text-primary text-sm">Streaming Telemetry Log</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-surface text-text-muted text-[10px] uppercase font-bold tracking-wider">
                                            <tr>
                                                <th className="px-5 py-3">Job ID</th>
                                                <th className="px-5 py-3">Pipeline Node</th>
                                                <th className="px-5 py-3">Start Time</th>
                                                <th className="px-5 py-3">Status</th>
                                                <th className="px-5 py-3 text-right">Records (MB)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {jobs.map(job => (
                                                <tr key={job.jobId} className="hover:bg-surface transition-colors">
                                                    <td className="px-5 py-3 font-mono text-xs text-indigo-400 font-bold">{job.jobId}</td>
                                                    <td className="px-5 py-3 font-medium text-text-primary">{nodes.find(n => n.id === job.pipelineId)?.name || job.pipelineId}</td>
                                                    <td className="px-5 py-3 text-text-muted text-xs font-mono">{new Date(job.startTime).toLocaleTimeString()}</td>
                                                    <td className="px-5 py-3">
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${job.state === 'SUCCESS' ? 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' :
                                                                job.state === 'RUNNING' ? 'text-blue-400 bg-blue-500/20 border-blue-500/30' :
                                                                    'text-red-400 bg-red-500/20 border-red-500/30'
                                                            }`}>{job.state}</span>
                                                    </td>
                                                    <td className="px-5 py-3 text-right font-medium text-text-primary">
                                                        {job.recordsProcessed.toLocaleString()} <span className="text-text-muted font-normal">({job.totalSizeMb}MB)</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="xl:col-span-4 h-[600px] xl:h-auto">
                            <EtlTransformationEditor steps={transformSteps} nodeName={selectedNodeName} />
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default DataPipelineBuilder;

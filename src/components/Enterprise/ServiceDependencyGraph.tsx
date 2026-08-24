// ═══════════════════════════════════════════════════════════════════
// Service Dependency Graph Component
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useMemo } from 'react';
import {
  Database, Server, HardDrive, Radio, Globe, Link2,
  AlertTriangle, CheckCircle2, ChevronDown, ChevronRight,
  ArrowRight, Zap, Clock, Activity, Search, Filter,
  Layers, GitBranch
} from 'lucide-react';
import { DependencyNode, DependencyEdge, ServiceStatus } from '../../types/observability';

interface DependencyGraphProps {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  isLoading: boolean;
  onNodeClick?: (nodeId: string) => void;
}

const STATUS_COLORS: Record<ServiceStatus, { bg: string; border: string; text: string; dot: string }> = {
  operational: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  degraded: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  partial_outage: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
  major_outage: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  maintenance: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' }
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  service: <Server className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  cache: <HardDrive className="h-4 w-4" />,
  queue: <Radio className="h-4 w-4" />,
  external: <Globe className="h-4 w-4" />
};

const TYPE_LABELS: Record<string, string> = {
  service: 'Service',
  database: 'Database',
  cache: 'Cache',
  queue: 'Queue',
  external: 'External'
};

export const ServiceDependencyGraph: React.FC<DependencyGraphProps> = ({
  nodes,
  edges,
  isLoading,
  onNodeClick
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    'service': true,
    'database': true,
    'cache': true,
    'queue': true,
    'external': true
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const groupedNodes = useMemo(() => {
    const groups: Record<string, DependencyNode[]> = {
      service: [], database: [], cache: [], queue: [], external: []
    };
    nodes.forEach(node => {
      if (groups[node.type]) {
        if (!searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          groups[node.type].push(node);
        }
      }
    });
    return groups;
  }, [nodes, searchQuery]);

  const nodeEdgeMap = useMemo(() => {
    const map: Record<string, { incoming: DependencyEdge[]; outgoing: DependencyEdge[] }> = {};
    nodes.forEach(n => { map[n.id] = { incoming: [], outgoing: [] }; });
    edges.forEach(e => {
      if (map[e.source]) map[e.source].outgoing.push(e);
      if (map[e.target]) map[e.target].incoming.push(e);
    });
    return map;
  }, [nodes, edges]);

  const selectedNodeData = useMemo(() => {
    if (!selectedNode) return null;
    const node = nodes.find(n => n.id === selectedNode);
    const connections = nodeEdgeMap[selectedNode];
    if (!node || !connections) return null;
    const upstream = connections.incoming.map(e => ({
      ...e,
      node: nodes.find(n => n.id === e.source)
    }));
    const downstream = connections.outgoing.map(e => ({
      ...e,
      node: nodes.find(n => n.id === e.target)
    }));
    return { node, upstream, downstream };
  }, [selectedNode, nodes, nodeEdgeMap]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-48 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const totalHealthy = nodes.filter(n => n.status === 'operational').length;
  const totalIssues = nodes.filter(n => n.status !== 'operational').length;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50">
            <GitBranch className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Service Dependencies</h3>
            <p className="text-xs text-slate-500">
              {nodes.length} nodes · {edges.length} connections · {totalHealthy} healthy · {totalIssues} issues
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-56"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Graph Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Grouped Nodes */}
          <div className="lg:col-span-2 space-y-4">
            {Object.entries(groupedNodes).map(([type, groupNodes]) => (
              <div key={type} className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleGroup(type)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">{TYPE_ICONS[type]}</span>
                    <span className="text-sm font-semibold text-slate-700">{TYPE_LABELS[type]}s</span>
                    <span className="text-xs font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      {groupNodes.length}
                    </span>
                  </div>
                  {expandedGroups[type]
                    ? <ChevronDown className="h-4 w-4 text-slate-400" />
                    : <ChevronRight className="h-4 w-4 text-slate-400" />
                  }
                </button>

                {expandedGroups[type] && (
                  <div className="p-3 space-y-2">
                    {groupNodes.map(node => {
                      const colors = STATUS_COLORS[node.status];
                      const isSelected = selectedNode === node.id;
                      const conn = nodeEdgeMap[node.id];
                      const edgeCount = (conn?.incoming.length || 0) + (conn?.outgoing.length || 0);

                      return (
                        <div
                          key={node.id}
                          onClick={() => setSelectedNode(isSelected ? null : node.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border
                            ${isSelected
                              ? `${colors.bg} ${colors.border} shadow-sm`
                              : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                            }`}
                        >
                          {/* Status Dot */}
                          <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} flex-shrink-0`}>
                            {node.status !== 'operational' && (
                              <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} animate-ping opacity-75`} />
                            )}
                          </div>

                          {/* Icon */}
                          <div className={`p-1.5 rounded-lg ${colors.bg} ${colors.text} flex-shrink-0`}>
                            {TYPE_ICONS[node.type]}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-slate-800 truncate">{node.name}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`text-xs font-medium capitalize ${colors.text}`}>
                                {node.status.replace(/_/g, ' ')}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-xs text-slate-400">{edgeCount} connections</span>
                            </div>
                          </div>

                          {/* Latency */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-mono font-semibold text-slate-700">{node.latencyMs}ms</div>
                            <div className="text-xs text-slate-400">latency</div>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className={`h-4 w-4 text-slate-300 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                        </div>
                      );
                    })}
                    {groupNodes.length === 0 && (
                      <div className="text-center py-4 text-sm text-slate-400">No services match your search</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: Detail Panel */}
          <div className="lg:col-span-1">
            {selectedNodeData ? (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`p-2 rounded-xl ${STATUS_COLORS[selectedNodeData.node.status].bg} ${STATUS_COLORS[selectedNodeData.node.status].text}`}>
                    {TYPE_ICONS[selectedNodeData.node.type]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{selectedNodeData.node.name}</h4>
                    <span className={`text-xs font-medium capitalize ${STATUS_COLORS[selectedNodeData.node.status].text}`}>
                      {selectedNodeData.node.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <div className="text-xs text-slate-500">Latency</div>
                    <div className="text-lg font-bold text-slate-800">{selectedNodeData.node.latencyMs}ms</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <div className="text-xs text-slate-500">Type</div>
                    <div className="text-lg font-bold text-slate-800 capitalize">{selectedNodeData.node.type}</div>
                  </div>
                </div>

                {/* Upstream Dependencies */}
                {selectedNodeData.upstream.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      <ArrowRight className="h-3 w-3 inline mr-1 rotate-180" />
                      Upstream ({selectedNodeData.upstream.length})
                    </h5>
                    <div className="space-y-1.5">
                      {selectedNodeData.upstream.map((edge, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm">
                          <span className="text-slate-700 font-medium truncate">{edge.node?.name || edge.source}</span>
                          <span className="text-xs text-slate-400 font-mono">{edge.latencyMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Downstream Dependencies */}
                {selectedNodeData.downstream.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      <ArrowRight className="h-3 w-3 inline mr-1" />
                      Downstream ({selectedNodeData.downstream.length})
                    </h5>
                    <div className="space-y-1.5">
                      {selectedNodeData.downstream.map((edge, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm">
                          <span className="text-slate-700 font-medium truncate">{edge.node?.name || edge.target}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono ${edge.errorRate > 1 ? 'text-red-500' : 'text-slate-400'}`}>
                              {edge.errorRate}% err
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{edge.callsPerSecond}/s</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close button */}
                <button
                  onClick={() => setSelectedNode(null)}
                  className="w-full mt-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Close Details
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-8 text-center">
                <Layers className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-500">Select a Node</h4>
                <p className="text-xs text-slate-400 mt-1">Click any service to view its dependencies and connections</p>
              </div>
            )}
          </div>
        </div>

        {/* Edge Summary Bar */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span className="font-medium">Connection Summary</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                {edges.filter(e => e.errorRate > 1).length} high-error links
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                {edges.filter(e => e.latencyMs > 100).length} slow connections
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
                {edges.filter(e => e.callsPerSecond > 500).length} high-traffic paths
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDependencyGraph;

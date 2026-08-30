import React, { useCallback, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection
} from 'reactflow';
import 'reactflow/dist/style.css';
import { RoadmapNode } from './RoadmapNode';

// Register custom node type
const nodeTypes = {
    roadmapNode: RoadmapNode,
};

interface RoadmapBuilderProps {
    initialNodes: any[];
    roadmapId: string;
}

/**
 * RoadmapBuilder renders the interactive React Flow canvas for the career roadmap.
 */
export const RoadmapBuilder: React.FC<RoadmapBuilderProps> = ({ initialNodes, roadmapId }) => {
    // Transform flat nodes into React Flow format with positions
    const flowNodes = initialNodes.map((node, index) => ({
        id: node.id,
        type: 'roadmapNode',
        position: { x: 250, y: index * 200 },
        data: {
            ...node,
            onStatusChange: async (newStatus: 'in-progress' | 'completed') => {
                // API call to update status would go here
                console.log(`Updating node ${node.id} to ${newStatus}`);
                // Optimistic update
                setNodes((nds) =>
                    nds.map((n) =>
                        n.id === node.id ? { ...n, data: { ...n.data, status: newStatus } } : n
                    )
                );
            }
        },
    }));

    // Create edges between sequential nodes
    const initialEdges = initialNodes.slice(0, -1).map((node, index) => ({
        id: `e${node.id}-${initialNodes[index + 1].id}`,
        source: node.id,
        target: initialNodes[index + 1].id,
        animated: true,
        style: { stroke: '#3B82F6' },
    }));

    const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    return (
        <div className="h-[600px] w-full bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="dark:bg-gray-900"
            >
                <Background color="#aaa" gap={16} />
                <Controls className="dark:text-white dark:bg-gray-800 dark:border-gray-700" />
            </ReactFlow>
        </div>
    );
};

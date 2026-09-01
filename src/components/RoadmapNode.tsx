import React from 'react';
import { Handle, Position } from 'reactflow';
import { CheckCircle, Circle, Lock } from 'lucide-react';

interface RoadmapNodeProps {
    data: {
        title: string;
        description: string;
        status: 'locked' | 'in-progress' | 'completed';
        onStatusChange: (newStatus: 'in-progress' | 'completed') => void;
    };
}

/**
 * Custom React Flow node representing a skill in the career roadmap.
 * Supports visual states for locked, in-progress, and completed.
 */
export const RoadmapNode: React.FC<RoadmapNodeProps> = ({ data }) => {
    const { title, description, status, onStatusChange } = data;

    const getStatusStyles = () => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200';
            case 'in-progress':
                return 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200 ring-2 ring-blue-300 dark:ring-blue-700';
            case 'locked':
            default:
                return 'bg-gray-100 dark:bg-gray-800 border-gray-400 text-gray-500 dark:text-gray-400 opacity-70';
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5" />;
            case 'in-progress': return <Circle className="w-5 h-5 animate-pulse" />;
            case 'locked': return <Lock className="w-5 h-5" />;
        }
    };

    return (
        <div className={`p-4 rounded-lg border-2 shadow-sm min-w-[200px] transition-all duration-300 ${getStatusStyles()}`}>
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />

            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">{title}</h3>
                {getIcon()}
            </div>

            <p className="text-xs mb-3 line-clamp-3">{description}</p>

            {status !== 'locked' && (
                <div className="flex gap-2">
                    {status === 'in-progress' && (
                        <button
                            onClick={() => onStatusChange('completed')}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2 rounded transition-colors"
                        >
                            Mark Complete
                        </button>
                    )}
                    {status === 'completed' && (
                        <button
                            onClick={() => onStatusChange('in-progress')}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-xs py-1 px-2 rounded transition-colors"
                        >
                            Revisit
                        </button>
                    )}
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
        </div>
    );
};

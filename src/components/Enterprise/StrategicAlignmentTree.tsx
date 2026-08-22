import React from 'react';
import { Objective } from '../../types/okr';
import { GitCommit, GitPullRequest, GitMerge, Home, Building, Users, User, ArrowRight } from 'lucide-react';

interface StrategicAlignmentTreeProps {
    objectives: Objective[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export const StrategicAlignmentTree: React.FC<StrategicAlignmentTreeProps> = ({ objectives, selectedId, onSelect }) => {
    // Build a map for easy parent/child lookup
    const nodeMap = new Map<string, Objective>();
    const childrenMap = new Map<string, Objective[]>();
    const roots: Objective[] = [];

    objectives.forEach(obj => {
        nodeMap.set(obj.id, obj);
        if (obj.parentObjectiveId) {
            if (!childrenMap.has(obj.parentObjectiveId)) {
                childrenMap.set(obj.parentObjectiveId, []);
            }
            childrenMap.get(obj.parentObjectiveId)!.push(obj);
        } else {
            roots.push(obj);
        }
    });

    const getAlignmentIcon = (alignment: Objective['alignment']) => {
        switch (alignment) {
            case 'COMPANY': return <Home className="h-4 w-4" />;
            case 'DEPARTMENT': return <Building className="h-4 w-4" />;
            case 'TEAM': return <Users className="h-4 w-4" />;
            case 'INDIVIDUAL': return <User className="h-4 w-4" />;
        }
    };

    const renderNode = (node: Objective, depth: number = 0) => {
        const children = childrenMap.get(node.id) || [];
        const isSelected = selectedId === node.id;

        return (
            <div key={node.id} className="relative">
                <div className="flex">
                    {/* Tree indentation guides */}
                    {Array.from({ length: depth }).map((_, i) => (
                        <div key={i} className="w-8 border-l-2 border-slate-200/50 relative shrink-0">
                            {i === depth - 1 && (
                                <div className="absolute top-8 left-0 w-8 border-b-2 border-slate-200/50" />
                            )}
                        </div>
                    ))}

                    {/* Node Card */}
                    <div
                        onClick={() => onSelect(node.id)}
                        className={`flex-1 my-2 rounded-xl p-4 border transition-all cursor-pointer relative z-10 
              ${isSelected
                                ? 'bg-indigo-50/50 border-indigo-400 shadow-sm shadow-indigo-100 scale-[1.01]'
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className={`p-1.5 rounded-lg border ${node.alignment === 'COMPANY' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                                            node.alignment === 'DEPARTMENT' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                'bg-amber-100 text-amber-700 border-amber-200'
                                        }`}>
                                        {getAlignmentIcon(node.alignment)}
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                                        {node.alignment} {node.departmentName && `• ${node.departmentName}`}
                                    </span>
                                </div>
                                <h4 className={`font-bold text-sm ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{node.title}</h4>
                            </div>

                            <div className="text-right shrink-0">
                                <div className={`text-lg font-black tracking-tight ${node.progressPercentage >= 80 ? 'text-emerald-600' :
                                        node.progressPercentage >= 40 ? 'text-amber-600' :
                                            'text-red-500'
                                    }`}>
                                    {node.progressPercentage.toFixed(0)}%
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Progress</div>
                            </div>
                        </div>

                        <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                            <div
                                className={`absolute left-0 top-0 h-full rounded-full transition-all ${node.progressPercentage >= 80 ? 'bg-emerald-500' :
                                        node.progressPercentage >= 40 ? 'bg-amber-500' :
                                            'bg-red-500'
                                    }`}
                                style={{ width: `${Math.min(100, node.progressPercentage)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {children.length > 0 && (
                    <div className="relative">
                        {children.map(child => renderNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-[600px] flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <GitMerge className="h-5 w-5 text-indigo-600" /> Strategic Alignment Tree
                </h3>
                <button className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                    Collapse All
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f8fafc]">
                {roots.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <GitPullRequest className="h-10 w-10 mb-3 opacity-50" />
                        <p className="font-medium text-sm">No Active Objectives Built</p>
                    </div>
                ) : (
                    roots.map(root => renderNode(root, 0))
                )}
            </div>
        </div>
    );
};

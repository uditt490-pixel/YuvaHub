import React from 'react';
import { Bookmark, ThumbsUp, ExternalLink, Clock, User } from 'lucide-react';
import { DevResource } from '../../services/resourceLibraryEngine';

interface ResourceCardProps {
    resource: DevResource;
    onToggleUpvote: (id: string) => void;
    onToggleBookmark: (id: string) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onToggleUpvote, onToggleBookmark }) => {
    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase">
                        {resource.category.replace('_', ' ')}
                    </span>
                    <button
                        type="button"
                        onClick={() => onToggleBookmark(resource.id)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                            resource.isBookmarked
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                        }`}
                        title="Save to Vault"
                    >
                        <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                </div>

                <h3 className="text-base font-bold text-slate-100 leading-snug">{resource.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{resource.description}</p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {resource.readTimeMins} min read
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                        <img src={resource.curatorAvatar} alt={resource.curatorName} className="w-3.5 h-3.5 rounded-full" />
                        Curated by {resource.curatorName}
                    </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                    {resource.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
                            #{t}
                        </span>
                    ))}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => onToggleUpvote(resource.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        resource.hasUpvoted
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{resource.upvotes}</span>
                </button>

                <a
                    href={resource.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                    <span>Read Resource</span>
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                </a>
            </div>
        </div>
    );
};

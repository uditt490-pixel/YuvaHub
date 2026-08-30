import React from 'react';
import { MessageSquare, ThumbsUp, CheckCircle2, Clock } from 'lucide-react';
import { ForumThread } from '../../services/discussionForumEngine';

interface ThreadCardProps {
    thread: ForumThread;
    onToggleUpvote: (id: string) => void;
    onOpenThread: (thread: ForumThread) => void;
}

export const ForumThreadCard: React.FC<ThreadCardProps> = ({ thread, onToggleUpvote, onOpenThread }) => {
    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase">
                        {thread.category}
                    </span>

                    {thread.isSolved ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Solved Answer
                        </span>
                    ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                            Open Discussion
                        </span>
                    )}
                </div>

                <h3
                    onClick={() => onOpenThread(thread)}
                    className="text-base font-bold text-slate-100 leading-snug cursor-pointer hover:text-indigo-400 transition-colors"
                >
                    {thread.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{thread.bodySummary}</p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <img src={thread.authorAvatar} alt={thread.authorName} className="w-4 h-4 rounded-full" />
                    <span className="font-semibold text-slate-300">{thread.authorName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-slate-500">
                        <Clock className="w-3 h-3" /> {thread.createdAt}
                    </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                    {thread.tags.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
                            #{t}
                        </span>
                    ))}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                <button
                    type="button"
                    onClick={() => onToggleUpvote(thread.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                        thread.hasUpvoted
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{thread.upvotes}</span>
                </button>

                <button
                    type="button"
                    onClick={() => onOpenThread(thread)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-1.5"
                >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{thread.answersCount} Answers</span>
                </button>
            </div>
        </div>
    );
};

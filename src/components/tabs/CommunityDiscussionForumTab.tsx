import React, { useState } from 'react';
import { MessageSquare, Search, PlusCircle, CheckCircle2, Filter } from 'lucide-react';
import { MOCK_FORUM_THREADS, ForumThread } from '../../services/discussionForumEngine';
import { ForumThreadCard } from './ForumThreadCard';
import { ForumReplyThread } from './ForumReplyThread';

export const CommunityDiscussionForumTab: React.FC = () => {
    const [threads, setThreads] = useState<ForumThread[]>(MOCK_FORUM_THREADS);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showOnlySolved, setShowOnlySolved] = useState<boolean>(false);
    const [activeThread, setActiveThread] = useState<ForumThread | null>(null);

    const handleToggleUpvote = (id: string) => {
        setThreads(prev => prev.map(t => {
            if (t.id === id) {
                const nextUpvoted = !t.hasUpvoted;
                return {
                    ...t,
                    hasUpvoted: nextUpvoted,
                    upvotes: nextUpvoted ? t.upvotes + 1 : t.upvotes - 1
                };
            }
            return t;
        }));
    };

    const handleOpenThread = (thread: ForumThread) => {
        setActiveThread(thread);
    };

    const filteredThreads = threads.filter(t => {
        if (showOnlySolved && !t.isSolved) return false;
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (
                t.title.toLowerCase().includes(query) ||
                t.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        return true;
    });

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
            {/* Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                            <MessageSquare className="w-4 h-4" /> YuvaHub Developer Q&A Board
                        </div>
                        <h1 className="text-2xl font-black text-slate-100 mt-1">Community Technical Discussions</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => alert("Opening ask question modal...")}
                        className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Ask Technical Question
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                        <button
                            onClick={() => { setCategoryFilter('all'); setShowOnlySolved(false); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                categoryFilter === 'all' && !showOnlySolved ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            All ({threads.length})
                        </button>
                        <button
                            onClick={() => { setCategoryFilter('frontend'); setShowOnlySolved(false); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                categoryFilter === 'frontend' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Frontend
                        </button>
                        <button
                            onClick={() => { setCategoryFilter('backend'); setShowOnlySolved(false); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                categoryFilter === 'backend' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Backend
                        </button>
                        <button
                            onClick={() => { setCategoryFilter('devops'); setShowOnlySolved(false); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                categoryFilter === 'devops' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            DevOps
                        </button>
                        <button
                            onClick={() => setShowOnlySolved(true)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                showOnlySolved ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:text-emerald-300'
                            }`}
                        >
                            <CheckCircle2 className="w-3 h-3" /> Solved
                        </button>
                    </div>

                    <div className="relative w-64">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter questions by tag..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Threads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredThreads.map((t) => (
                    <ForumThreadCard
                        key={t.id}
                        thread={t}
                        onToggleUpvote={handleToggleUpvote}
                        onOpenThread={handleOpenThread}
                    />
                ))}
            </div>

            {/* Thread View Modal/Overlay */}
            {activeThread && (
                <ForumReplyThread 
                    thread={activeThread} 
                    onClose={() => setActiveThread(null)} 
                />
            )}
        </div>
    );
};

export default CommunityDiscussionForumTab;

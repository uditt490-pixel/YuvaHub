import React, { useState } from 'react';
import { BookOpen, Search, Bookmark, PlusCircle } from 'lucide-react';
import { MOCK_DEV_RESOURCES, DevResource } from '../../services/resourceLibraryEngine';
import { ResourceCard } from './ResourceCard';

export const CommunityResourceLibraryTab: React.FC = () => {
    const [resources, setResources] = useState<DevResource[]>(MOCK_DEV_RESOURCES);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showOnlyBookmarks, setShowOnlyBookmarks] = useState<boolean>(false);

    const handleToggleUpvote = (id: string) => {
        setResources(prev => prev.map(res => {
            if (res.id === id) {
                const nextUpvoted = !res.hasUpvoted;
                return {
                    ...res,
                    hasUpvoted: nextUpvoted,
                    upvotes: nextUpvoted ? res.upvotes + 1 : res.upvotes - 1
                };
            }
            return res;
        }));
    };

    const handleToggleBookmark = (id: string) => {
        setResources(prev => prev.map(res => {
            if (res.id === id) {
                return { ...res, isBookmarked: !res.isBookmarked };
            }
            return res;
        }));
    };

    const filteredResources = resources.filter(res => {
        if (showOnlyBookmarks && !res.isBookmarked) return false;
        if (categoryFilter !== 'all' && res.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (
                res.title.toLowerCase().includes(query) ||
                res.tags.some(t => t.toLowerCase().includes(query))
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
                            <BookOpen className="w-4 h-4" /> YuvaHub Curated Knowledge Library
                        </div>
                        <h1 className="text-2xl font-black text-slate-100 mt-1">Developer Resource & Bookmark Vault</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => alert("Opening submit resource modal...")}
                        className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Submit Resource Link
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                        <button
                            onClick={() => { setCategoryFilter('all'); setShowOnlyBookmarks(false); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                categoryFilter === 'all' && !showOnlyBookmarks ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            All ({resources.length})
                        </button>
                        <button
                            onClick={() => { setCategoryFilter('system_design'); setShowOnlyBookmarks(false); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                categoryFilter === 'system_design' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            System Design
                        </button>
                        <button
                            onClick={() => { setCategoryFilter('cheat_sheets'); setShowOnlyBookmarks(false); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                categoryFilter === 'cheat_sheets' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Cheat Sheets
                        </button>
                        <button
                            onClick={() => { setShowOnlyBookmarks(true); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                showOnlyBookmarks ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-amber-300'
                            }`}
                        >
                            <Bookmark className="w-3 h-3 fill-current" /> Vault Bookmarks
                        </button>
                    </div>

                    <div className="relative w-64">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search cheat sheets & tools..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((res) => (
                    <ResourceCard
                        key={res.id}
                        resource={res}
                        onToggleUpvote={handleToggleUpvote}
                        onToggleBookmark={handleToggleBookmark}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommunityResourceLibraryTab;

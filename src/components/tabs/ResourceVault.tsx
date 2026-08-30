import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Bookmark, PlusCircle, ArrowUp, ArrowDown, ExternalLink, Filter, Loader2, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { fetchResources, fetchSavedResources, submitResource, voteResource, saveResource, flagResource } from '../../services/apiClient';

export default function ResourceVault() {
  const { user } = useAppContext();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'all' | 'saved'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    url: '',
    description: '',
    resourceType: 'article',
    difficulty: 'beginner',
    skills: ''
  });

  const loadResources = async () => {
    setLoading(true);
    try {
      const params = {
        type: categoryFilter,
        difficulty: difficultyFilter
      };
      const data = viewMode === 'saved' 
        ? await fetchSavedResources(params)
        : await fetchResources(params);
      
      setResources(Array.isArray(data) ? data : (data.items || data.data || []));
    } catch (err) {
      console.error("Failed to load resources", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, [categoryFilter, difficultyFilter, viewMode]);

  const handleVote = async (id: string, direction: 'up' | 'down') => {
    if (!user) return;
    try {
      // Optimistic update
      setResources(prev => prev.map(res => {
        if (res.id === id) {
          const userVote = res.voterIds?.[user.uid];
          let newUp = res.upvotes;
          let newDown = res.downvotes;
          let newVoterIds = { ...res.voterIds };
          
          if (userVote === direction) {
            if (direction === 'up') newUp--;
            else newDown--;
            delete newVoterIds[user.uid];
          } else {
            if (userVote === 'up') newUp--;
            if (userVote === 'down') newDown--;
            if (direction === 'up') newUp++;
            else newDown++;
            newVoterIds[user.uid] = direction;
          }
          
          return { ...res, upvotes: newUp, downvotes: newDown, voterIds: newVoterIds };
        }
        return res;
      }));
      
      await voteResource(id, direction);
    } catch (err) {
      console.error("Vote failed", err);
      loadResources(); // revert on failure
    }
  };

  const handleSave = async (id: string) => {
    if (!user) return;
    try {
      // Optimistic update
      setResources(prev => {
        const next = prev.map(res => {
          if (res.id === id) {
            const isSaved = res.savedBy?.includes(user.uid);
            const savedBy = isSaved 
              ? res.savedBy.filter((u: string) => u !== user.uid)
              : [...(res.savedBy || []), user.uid];
            return { ...res, savedBy };
          }
          return res;
        });
        if (viewMode === 'saved') {
          return next.filter(res => res.savedBy?.includes(user.uid));
        }
        return next;
      });
      await saveResource(id);
    } catch (err) {
      console.error("Save failed", err);
      loadResources();
    }
  };

  const handleFlag = async (id: string) => {
    try {
      await flagResource(id);
      alert('Resource flagged for admin review.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitLoading(true);
    try {
      const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      await submitResource({
        ...form,
        skills: skillsArray.length > 0 ? skillsArray : ['general']
      });
      setIsModalOpen(false);
      setForm({
        title: '',
        url: '',
        description: '',
        resourceType: 'article',
        difficulty: 'beginner',
        skills: ''
      });
      loadResources();
    } catch (err: any) {
      alert(err.message || "Failed to submit resource");
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredResources = resources.filter(res => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      res.title?.toLowerCase().includes(query) ||
      res.description?.toLowerCase().includes(query) ||
      res.skills?.some((s: string) => s.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-primary-blue dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" /> Community Resource Vault
            </div>
            <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Discover & Share Learning Resources</h1>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1">
              Curated by the community, for the community. Upvote the best tutorials, repos, and cheat sheets.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Submit Resource
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'all' ? 'bg-primary-blue text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All Resources
            </button>
            <button
              onClick={() => setViewMode('saved')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'saved' ? 'bg-primary-blue text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${viewMode === 'saved' ? 'fill-current' : ''}`} /> My Saved
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-medium outline-none focus:ring-2 focus:ring-[#b56b37]/30"
            >
              <option value="all">All Types</option>
              <option value="article">Articles</option>
              <option value="video">Videos</option>
              <option value="course">Courses</option>
              <option value="repo">GitHub Repos</option>
              <option value="cheatsheet">Cheat Sheets</option>
              <option value="tool">Tools</option>
            </select>
            
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-200 font-medium outline-none focus:ring-2 focus:ring-[#b56b37]/30"
            >
              <option value="all">Any Difficulty</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all_levels">All Levels</option>
            </select>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-48 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-[#b56b37]/30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-20 bg-surface dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No resources found</h3>
          <p className="text-xs text-slate-500 mt-2">Try adjusting your filters or be the first to submit a resource!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => {
            const isUpvoted = res.voterIds?.[user?.uid || ''] === 'up';
            const isDownvoted = res.voterIds?.[user?.uid || ''] === 'down';
            const isSaved = res.savedBy?.includes(user?.uid || '');
            
            return (
              <div key={res.id} className="bg-surface dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-primary-blue transition-all flex flex-col h-full shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase rounded-md mb-2">
                      {res.resourceType}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight mb-1">
                      {res.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleSave(res.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSaved 
                        ? 'text-primary-blue bg-primary-blue/10' 
                        : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>
                </div>
                
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                  {res.description}
                </p>
                
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {res.skills?.map((skill: string) => (
                    <span key={skill} className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md">
                      {skill}
                    </span>
                  ))}
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    res.difficulty === 'beginner' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                    res.difficulty === 'intermediate' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                    res.difficulty === 'advanced' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {res.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => handleVote(res.id, 'up')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isUpvoted ? 'bg-primary-blue text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-slate-700 dark:text-slate-300">
                      {res.upvotes - res.downvotes}
                    </span>
                    <button
                      onClick={() => handleVote(res.id, 'down')}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isDownvoted ? 'bg-red-500 text-white' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleFlag(res.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Report">
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-slate-900 dark:bg-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-slate-500 font-medium text-center">
                  Shared by {res.submitterName}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Submit a Resource</h2>
              <p className="text-xs text-slate-500 mb-6">Share a high-quality link with the YuvaHub community.</p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Title</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#b56b37]/30" placeholder="e.g. System Design Primer" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">URL</label>
                  <input required type="url" value={form.url} onChange={e => setForm({...form, url: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#b56b37]/30" placeholder="https://..." />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Description</label>
                  <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#b56b37]/30 resize-none" placeholder="What will students learn from this?" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Type</label>
                    <select value={form.resourceType} onChange={e => setForm({...form, resourceType: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#b56b37]/30">
                      <option value="article">Article</option>
                      <option value="video">Video</option>
                      <option value="course">Course</option>
                      <option value="repo">GitHub Repo</option>
                      <option value="cheatsheet">Cheat Sheet</option>
                      <option value="tool">Tool</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Difficulty</label>
                    <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#b56b37]/30">
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="all_levels">All Levels</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Skills (comma separated)</label>
                  <input required value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#b56b37]/30" placeholder="React, Node.js, System Design" />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitLoading} className="px-6 py-2 text-xs font-bold text-white bg-primary-blue hover:bg-[#96552a] rounded-xl transition-colors flex items-center gap-2">
                    {submitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Resource'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

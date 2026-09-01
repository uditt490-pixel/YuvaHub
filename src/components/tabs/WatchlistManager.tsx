import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, CheckCircle2, X, AlertCircle, Bell, Tag, MapPin, Eye } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { auth } from '../../lib/firebase';

interface WatchlistRule {
  id: string;
  name: string;
  filters: {
    keywords: string[];
    categories: string[];
    location: string;
  };
  notifyVia: 'email' | 'push' | 'both';
  frequency: 'immediate' | 'daily' | 'weekly';
}

export default function WatchlistManager() {
  const { user } = useAppContext();
  const [watchlists, setWatchlists] = useState<WatchlistRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [notifyVia, setNotifyVia] = useState<'email' | 'push' | 'both'>('push');
  const [frequency, setFrequency] = useState<'immediate' | 'daily' | 'weekly'>('immediate');

  const [previewMatches, setPreviewMatches] = useState<any[]>([]);
  const [isPreviewing, setIsPreviewing] = useState<string | null>(null);

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const getAuthHeaders = async () => {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchWatchlists = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch('/api/v1/watchlists', { headers });
      const data = await res.json();
      if (data.success && data.items) {
        setWatchlists(data.items);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Failed to load watchlists.' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      setNotification({ type: 'error', message: 'Please provide a name for your watchlist.' });
      return;
    }

    const keywords = keywordsInput.split(',').map(k => k.trim()).filter(Boolean);
    const categories = categoriesInput.split(',').map(c => c.trim()).filter(Boolean);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/v1/watchlists', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: ruleName,
          filters: {
            keywords,
            categories,
            location: locationInput.trim()
          },
          notifyVia,
          frequency
        })
      });
      const data = await res.json();

      if (data.success) {
        setNotification({ type: 'success', message: 'Watchlist created successfully!' });
        setIsCreating(false);
        setRuleName('');
        setKeywordsInput('');
        setCategoriesInput('');
        setLocationInput('');
        fetchWatchlists();
      } else {
        throw new Error(data.error || 'Failed to create watchlist');
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to create watchlist.' });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/v1/watchlists/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: 'success', message: 'Watchlist deleted.' });
        fetchWatchlists();
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Failed to delete watchlist.' });
    }
  };

  const handlePreviewMatches = async (id: string) => {
    try {
      setIsPreviewing(id);
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/v1/watchlists/${id}/matches`, { headers });
      const data = await res.json();
      if (data.success) {
        setPreviewMatches(data.items || []);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Failed to fetch match preview.' });
      setIsPreviewing(null);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      {/* Header - Brand Theme */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <Target className="w-3.5 h-3.5 text-indigo-400" /> Watchlist Rules Engine
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Proactive <span className="text-primary-blue italic">Alerts</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Define custom watchlists and receive real-time notifications when new opportunities match your exact criteria.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-primary-blue hover:bg-blue-600 text-white text-sm font-bold rounded-2xl transition-all shadow-lg hover:shadow-primary-blue/20"
            >
              {isCreating ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isCreating ? 'Cancel' : 'Create New Watchlist'}
            </button>
          </div>
        </div>
      </div>

      {notification.message && (
        <div className={`flex items-center justify-between p-3.5 rounded-xl text-xs font-bold animate-fade-in ${
          notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isCreating && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
          <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">New Watchlist Rule</h2>
          <form onSubmit={handleCreateRule} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-text-secondary dark:text-slate-300 mb-1">Rule Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Remote AI Internships"
                value={ruleName}
                onChange={e => setRuleName(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary dark:text-slate-300 mb-1">Keywords (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Machine Learning, NLP, Intern"
                value={keywordsInput}
                onChange={e => setKeywordsInput(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary dark:text-slate-300 mb-1">Categories (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Internship, Hackathon"
                value={categoriesInput}
                onChange={e => setCategoriesInput(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary dark:text-slate-300 mb-1">Location Match</label>
              <input
                type="text"
                placeholder="e.g. Remote, Bangalore"
                value={locationInput}
                onChange={e => setLocationInput(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              />
            </div>
            <div className="flex gap-4 pt-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-text-secondary dark:text-slate-300 mb-1">Notification Method</label>
                <select value={notifyVia} onChange={e => setNotifyVia(e.target.value as any)} className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs outline-none">
                  <option value="push">Push Notification</option>
                  <option value="email">Email</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-text-secondary dark:text-slate-300 mb-1">Frequency</label>
                <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs outline-none">
                  <option value="immediate">Immediate</option>
                  <option value="daily">Daily Digest</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" className="px-6 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors">
                Save Watchlist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Watchlists List */}
      {!isCreating && (
        <div className="space-y-4">
          <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white px-2">Your Active Watchlists</h2>
          {loading ? (
            <p className="text-xs text-text-muted p-4">Loading watchlists...</p>
          ) : watchlists.length === 0 ? (
            <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xs">
              <div className="w-16 h-16 bg-surface-secondary text-primary-blue flex items-center justify-center rounded-full mx-auto border border-border-theme">
                <Bell className="w-8 h-8 text-primary-blue" />
              </div>
              <h3 className="text-lg font-serif font-bold text-text-primary dark:text-white">No Watchlists Yet</h3>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">Create a watchlist to get notified about relevant opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {watchlists.map(rule => (
                <div key={rule.id} className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-primary-blue transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif font-bold text-base text-text-primary dark:text-white">{rule.name}</h3>
                      <p className="text-[11px] text-text-muted font-medium mt-1 uppercase tracking-wide">
                        {rule.frequency} • {rule.notifyVia}
                      </p>
                    </div>
                    <button onClick={() => handleDeleteRule(rule.id)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-xs text-text-secondary dark:text-slate-300">
                    {rule.filters.keywords?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Tag className="w-3.5 h-3.5 mt-0.5 text-primary-blue" />
                        <span className="flex-1">{rule.filters.keywords.join(', ')}</span>
                      </div>
                    )}
                    {rule.filters.categories?.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Target className="w-3.5 h-3.5 mt-0.5 text-primary-blue" />
                        <span className="flex-1">{rule.filters.categories.join(', ')}</span>
                      </div>
                    )}
                    {rule.filters.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-primary-blue" />
                        <span className="flex-1">{rule.filters.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-3 border-t border-border-theme dark:border-slate-800">
                    <button 
                      onClick={() => handlePreviewMatches(rule.id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-background dark:bg-slate-800 text-primary-blue font-bold text-xs rounded-xl hover:bg-surface-secondary transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Matches
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Match Preview Modal */}
      {isPreviewing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-border-theme dark:border-slate-800">
            <div className="px-6 py-4 border-b border-border-theme dark:border-slate-800 flex items-center justify-between bg-background dark:bg-slate-800/50">
              <h2 className="font-serif font-bold text-lg text-text-primary dark:text-white">Watchlist Matches</h2>
              <button onClick={() => { setIsPreviewing(null); setPreviewMatches([]); }} className="p-1 rounded-full text-text-muted hover:bg-[#e8ded1] dark:hover:bg-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-slate-900">
              {previewMatches.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm text-text-muted font-medium">No opportunities match this watchlist right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {previewMatches.map((opp: any) => (
                    <div key={opp.id} className="bg-surface dark:bg-slate-800 border border-border-theme dark:border-slate-700 p-4 rounded-xl shadow-xs">
                      <h3 className="font-bold text-sm text-text-primary dark:text-white mb-1 line-clamp-1">{opp.title}</h3>
                      <p className="text-xs text-text-muted mb-3">{opp.source_name || opp.source}</p>
                      <div className="flex gap-2">
                        {opp.category && <span className="px-2 py-0.5 bg-surface-secondary text-text-secondary text-[10px] font-bold rounded-md">{opp.category}</span>}
                        {opp.location && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md">{opp.location}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

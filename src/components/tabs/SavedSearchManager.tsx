import React, { useState, useEffect } from 'react';
import { Target, Plus, Trash2, CheckCircle2, X, AlertCircle, Bell, Tag, MapPin, Eye, Search, PauseCircle, PlayCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { fetchSavedSearches, createSavedSearch, updateSavedSearch, deleteSavedSearch, previewSavedSearch } from '../../services/apiClient';

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    query?: string;
    types?: string[];
    tags?: string[];
    location?: string;
    remoteOnly?: boolean;
    deadlineAfter?: string;
  };
  notificationPreference: 'in_app' | 'email' | 'both' | 'none';
  isActive: boolean;
  lastMatchedAt?: string;
}

export default function SavedSearchManager() {
  const { user } = useAppContext();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const [typesInput, setTypesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [notificationPreference, setNotificationPreference] = useState<'in_app' | 'email' | 'both' | 'none'>('in_app');

  const [previewMatches, setPreviewMatches] = useState<any[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = async () => {
    try {
      setLoading(true);
      const res = await fetchSavedSearches();
      if (res && res.items) {
        setSearches(res.items);
      } else if (res && res.data) {
        setSearches(res.data);
      } else {
        setSearches([]);
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: 'Failed to load saved searches.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setIsPreviewing(true);
    try {
      const filters = {
        query: query.trim(),
        types: typesInput.split(',').map(t => t.trim()).filter(Boolean),
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        location: locationInput.trim(),
        remoteOnly
      };
      const res = await previewSavedSearch(filters);
      if (res.success && res.data && res.data.matches) {
        setPreviewMatches(res.data.matches);
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to preview.' });
    }
  };

  const handleCreateSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNotification({ type: 'error', message: 'Please provide a name.' });
      return;
    }

    const filters = {
      query: query.trim(),
      types: typesInput.split(',').map(t => t.trim()).filter(Boolean),
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      location: locationInput.trim(),
      remoteOnly
    };

    try {
      const res = await createSavedSearch({
        name,
        filters,
        notificationPreference,
      });

      if (res.success) {
        setNotification({ type: 'success', message: 'Saved search created!' });
        setIsCreating(false);
        resetForm();
        loadSearches();
      } else {
        setNotification({ type: 'error', message: res.message || 'Failed to create saved search.' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'An error occurred.' });
    }
  };

  const resetForm = () => {
    setName('');
    setQuery('');
    setTypesInput('');
    setTagsInput('');
    setLocationInput('');
    setRemoteOnly(false);
    setNotificationPreference('in_app');
    setPreviewMatches([]);
    setIsPreviewing(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this search?')) return;
    try {
      await deleteSavedSearch(id);
      setNotification({ type: 'success', message: 'Deleted successfully.' });
      loadSearches();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to delete.' });
    }
  };

  const handleToggleActive = async (search: SavedSearch) => {
    try {
      await updateSavedSearch(search.id, {
        name: search.name,
        filters: search.filters,
        notificationPreference: search.notificationPreference,
        isActive: !search.isActive
      });
      loadSearches();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to update.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-600" />
            Saved Searches
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Never miss an opportunity. Get notified when new matching roles are posted.
          </p>
        </div>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            disabled={searches.length >= 10}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            New Search
          </button>
        )}
      </div>

      {/* Notifications */}
      {notification.message && (
        <div className={`p-4 rounded-xl flex items-center justify-between ${notification.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <p className="font-medium">{notification.message}</p>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Form */}
      {isCreating && (
        <div className="bg-surface dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New Search</h3>
            <button onClick={() => { setIsCreating(false); resetForm(); }} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Remote Frontend Jobs"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Query / Keywords</label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. React, Developer"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opportunity Types (comma separated)</label>
                <input
                  type="text"
                  value={typesInput}
                  onChange={(e) => setTypesInput(e.target.value)}
                  placeholder="e.g. full-time, hackathon"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g. London, Remote"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. UI/UX, Python"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remoteOnly"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="remoteOnly" className="text-sm text-gray-700 dark:text-gray-300">Remote Only</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notification Preference</label>
              <select
                value={notificationPreference}
                onChange={(e) => setNotificationPreference(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <option value="in_app">In-App Notification Only</option>
                <option value="email">Email Only</option>
                <option value="both">Both In-App & Email</option>
                <option value="none">Do not notify (Dashboard only)</option>
              </select>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
              >
                <Eye className="w-4 h-4" />
                Live Preview
              </button>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); resetForm(); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Search
                </button>
              </div>
            </div>
          </form>

          {/* Preview Results */}
          {isPreviewing && (
            <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Live Preview (Top {previewMatches.length})</h4>
              {previewMatches.length > 0 ? (
                <div className="space-y-3">
                  {previewMatches.map(match => (
                    <div key={match.id} className="p-3 bg-surface dark:bg-[#1E293B] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-sm">
                      <div className="font-medium text-blue-600 dark:text-blue-400">{match.title}</div>
                      <div className="text-gray-600 dark:text-gray-400 mt-1">{match.company || match.sourceName} • {match.location || 'Online'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No matches found with current filters.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* List */}
      {!isCreating && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <p className="text-gray-500 col-span-2">Loading...</p>
          ) : searches.length > 0 ? (
            searches.map(search => (
              <div key={search.id} className={`bg-surface dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm ${!search.isActive ? 'opacity-70' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {search.name}
                      {!search.isActive && <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 px-2 py-1 rounded-full">Paused</span>}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Last matched: {search.lastMatchedAt ? new Date(search.lastMatchedAt).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(search)}
                      className={`p-2 rounded-lg ${search.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}
                      title={search.isActive ? "Pause Search" : "Resume Search"}
                    >
                      {search.isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(search.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Search"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  {search.filters.query && (
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5" /> <span>{search.filters.query}</span>
                    </div>
                  )}
                  {search.filters.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> <span>{search.filters.location}</span>
                    </div>
                  )}
                  {search.filters.tags && search.filters.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5" /> <span>{search.filters.tags.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 bg-surface dark:bg-[#1E293B] border border-gray-200 dark:border-gray-800 rounded-xl border-dashed">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Saved Searches Yet</h3>
              <p className="text-gray-500 mb-6">Create a search to get notified about new opportunities.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Bookmark as BookmarkIcon, FolderPlus, Folder, Trash2, Tag, 
  Plus, Check, X, MoveRight, Layers, Sparkles, Filter
} from 'lucide-react';
import { fetchOpportunityById } from '../../services/apiClient';
import { AsyncState } from '../ui/states';
import { useAppContext } from '../../context/AppContext';

interface BookmarkFolder {
  folderId: string;
  name: string;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | string;
  opportunityIds: string[];
}

export default function Bookmarks() {
  const { user, profile, viewOpportunity: onViewDetails } = useAppContext();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Folder & Tag Management State
  const [folders, setFolders] = useState<BookmarkFolder[]>([
    { folderId: 'f_1', name: 'GSoC 2026', color: 'blue', opportunityIds: [] },
    { folderId: 'f_2', name: 'Backend Internships', color: 'emerald', opportunityIds: [] },
    { folderId: 'f_3', name: 'US Scholarships', color: 'purple', opportunityIds: [] }
  ]);
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [itemFolderMap, setItemFolderMap] = useState<Record<string, string>>({});

  // Folder Modal State
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('blue');
  const [creatingFolder, setCreatingFolder] = useState(false);

  // Move Modal State
  const [organizingItemId, setOrganizingItemId] = useState<string | null>(null);

  // Filter Tag State
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchFolders = async () => {
    try {
      const res = await fetch(`/api/v1/user/bookmark-folders?uid=${user?.uid || 'user_default'}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setFolders(data);
          // Build itemFolderMap
          const map: Record<string, string> = {};
          data.forEach((f: BookmarkFolder) => {
            (f.opportunityIds || []).forEach(opId => {
              map[opId] = f.folderId;
            });
          });
          setItemFolderMap(map);
        }
      }
    } catch (err) {
      console.error('Error fetching bookmark folders:', err);
    }
  };

  const loadBookmarks = async (isRetry = false) => {
    if (!profile?.bookmarks?.length) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    isRetry ? setRetrying(true) : setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        profile.bookmarks.map((id) => fetchOpportunityById(id)),
      );
      setItems(results.filter(Boolean));
    } catch {
      setError('Unable to load your bookmarks. Please try again.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    void loadBookmarks();
    void fetchFolders();
  }, [profile?.bookmarks, user]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || creatingFolder) return;

    setCreatingFolder(true);
    const folderData = {
      folderId: 'f_' + Date.now(),
      name: newFolderName.trim(),
      color: newFolderColor,
      opportunityIds: [],
      uid: user?.uid || 'user_default'
    };

    setFolders(prev => [...prev, folderData]);
    setNewFolderName('');
    setShowFolderModal(false);

    try {
      await fetch('/api/v1/user/bookmark-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderData)
      });
    } catch (err) {
      console.error('Error creating folder:', err);
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolders(prev => prev.filter(f => f.folderId !== folderId));
    if (activeFolderId === folderId) setActiveFolderId('all');

    try {
      await fetch(`/api/v1/user/bookmark-folders/${folderId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Error deleting folder:', err);
    }
  };

  const handleAssignFolder = async (opportunityId: string, folderId: string | null) => {
    setItemFolderMap(prev => {
      const copy = { ...prev };
      if (folderId) copy[opportunityId] = folderId;
      else delete copy[opportunityId];
      return copy;
    });

    setFolders(prev =>
      prev.map(f => {
        const hasOp = f.opportunityIds.includes(opportunityId);
        if (f.folderId === folderId && !hasOp) {
          return { ...f, opportunityIds: [...f.opportunityIds, opportunityId] };
        }
        if (f.folderId !== folderId && hasOp) {
          return { ...f, opportunityIds: f.opportunityIds.filter(id => id !== opportunityId) };
        }
        return f;
      })
    );

    setOrganizingItemId(null);

    try {
      await fetch('/api/v1/user/bookmarks/organize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId,
          folderId,
          uid: user?.uid || 'user_default'
        })
      });
    } catch (err) {
      console.error('Error organizing bookmark:', err);
    }
  };

  // Collect all unique tags
  const allTags = Array.from(
    new Set(items.flatMap(item => item.tags || []))
  ).slice(0, 10);

  // Filter items by active folder and tag
  const filteredItems = items.filter(item => {
    const itemId = String(item.id || item._id);
    const matchesFolder =
      activeFolderId === 'all'
        ? true
        : itemFolderMap[itemId] === activeFolderId;

    const matchesTag =
      !selectedTag || (item.tags && item.tags.includes(selectedTag));

    return matchesFolder && matchesTag;
  });

  const getColorBadge = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'amber': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'rose': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 md:px-0 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <BookmarkIcon className="w-6 h-6 text-blue-600 fill-blue-600" />
            Your Saved Bookmarks
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Organize opportunity listings into custom folders and tag lists.
          </p>
        </div>

        <button
          onClick={() => setShowFolderModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all shrink-0"
        >
          <FolderPlus className="w-4 h-4" /> New Folder
        </button>
      </div>

      {/* Folders & Tag Navigation Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        {/* Folders Row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFolderId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeFolderId === 'all'
                ? 'bg-gray-900 text-white border-gray-900 shadow-2xs'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> All Saved ({items.length})
          </button>

          {folders.map(folder => {
            const isActive = activeFolderId === folder.folderId;
            const count = items.filter(i => itemFolderMap[String(i.id || i._id)] === folder.folderId).length;

            return (
              <div
                key={folder.folderId}
                onClick={() => setActiveFolderId(folder.folderId)}
                className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isActive
                    ? `${getColorBadge(folder.color)} font-extrabold shadow-2xs ring-2 ring-blue-500/20`
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                {folder.name} ({count})
                <button
                  onClick={(e) => handleDeleteFolder(folder.folderId, e)}
                  className="text-gray-400 hover:text-red-600 p-0.5 rounded transition-colors"
                  title="Delete Folder"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Tags Row */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-gray-400" /> Filter Tag:
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-200 flex items-center gap-1"
              >
                Clear Filter <X className="w-3 h-3" />
              </button>
            )}
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bookmarks Items Grid */}
      <AsyncState
        loading={loading}
        error={error}
        empty={filteredItems.length === 0}
        onRetry={() => void loadBookmarks(true)}
        retrying={retrying}
        skeletonCount={items.length || 4}
        emptyTitle="No saved bookmarks match this view"
        emptyDescription="Select another folder/tag or save more opportunities from the feed."
        emptyAction={<BookmarkIcon className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item, i) => {
            const itemId = String(item.id || item._id);
            const currentFolderId = itemFolderMap[itemId];
            const currentFolder = folders.find(f => f.folderId === currentFolderId);

            return (
              <div
                key={itemId || i}
                className="clean-card p-6 flex flex-col justify-between relative group hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-[3px] transition-all duration-200 overflow-hidden min-w-0 bg-white rounded-2xl border border-gray-200/80"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                    {item.type || 'Opportunity'}
                  </span>

                  {currentFolder ? (
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getColorBadge(currentFolder.color)}`}>
                      📁 {currentFolder.name}
                    </span>
                  ) : (
                    <button
                      onClick={() => setOrganizingItemId(itemId)}
                      className="text-[11px] font-bold text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1 transition-colors"
                    >
                      <FolderPlus className="w-3 h-3" /> Move to Folder
                    </button>
                  )}
                </div>

                <a
                  href={`/opportunity/${itemId}/${(item.title || "opportunity").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onViewDetails(itemId, item.title);
                  }}
                  className="hover:text-blue-600 transition-colors block cursor-pointer"
                >
                  <h4 className="font-bold text-gray-900 mb-1 leading-tight text-base sm:text-lg line-clamp-2 break-words">
                    {item.title || "Untitled opportunity"}
                  </h4>
                </a>
                <p className="text-xs text-gray-500 mb-2 font-medium">{item.organization || item.org || "Company not specified"}</p>
                <p className="text-xs text-gray-700 line-clamp-2 mb-4 leading-relaxed">{item.description || "No description available."}</p>

                {/* Card Footer */}
                <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-4 mt-auto">
                  <div className="flex flex-wrap gap-1.5 min-w-0">
                    {item.tags?.slice(0, 3).map((t: string) => (
                      <span key={t} className="text-[10px] bg-gray-100 px-2 py-0.5 text-gray-600 rounded font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setOrganizingItemId(itemId)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Change Folder"
                    >
                      <Folder className="w-4 h-4" />
                    </button>

                    {(item.apply_link || item.applyLink) && (
                      <a
                        href={item.apply_link || item.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 text-xs rounded-xl transition-all shadow-2xs"
                      >
                        Apply Now
                      </a>
                    )}
                  </div>
                </div>

                {/* Organize / Move Modal Dropdown overlay on card */}
                {organizingItemId === itemId && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-xs p-5 z-20 flex flex-col justify-between rounded-2xl animate-fade-in border border-blue-200">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                          <FolderPlus className="w-4 h-4 text-blue-600" /> Select Destination Folder
                        </h4>
                        <button
                          onClick={() => setOrganizingItemId(null)}
                          className="text-gray-400 hover:text-gray-700 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        <button
                          onClick={() => handleAssignFolder(itemId, null)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                            !currentFolderId ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' : 'hover:bg-gray-50 border-gray-100'
                          }`}
                        >
                          <span>Unassigned (All Saved)</span>
                          {!currentFolderId && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>

                        {folders.map(f => {
                          const isSelected = currentFolderId === f.folderId;
                          return (
                            <button
                              key={f.folderId}
                              onClick={() => handleAssignFolder(itemId, f.folderId)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                                isSelected ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' : 'hover:bg-gray-50 border-gray-100'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <Folder className="w-3.5 h-3.5 text-blue-600" /> {f.name}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => setOrganizingItemId(null)}
                      className="w-full text-center py-1.5 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-200"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AsyncState>

      {/* Modal: Create Folder */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-600" /> Create Custom Folder
              </h3>
              <button onClick={() => setShowFolderModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. GSoC 2026, ML Fellowships"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Color Badge</label>
                <div className="flex gap-2">
                  {['blue', 'emerald', 'purple', 'amber', 'rose'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewFolderColor(c)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                        newFolderColor === c ? 'border-gray-900 scale-110 shadow-sm' : 'border-transparent'
                      } ${getColorBadge(c)}`}
                    >
                      {newFolderColor === c && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingFolder}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {creatingFolder ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
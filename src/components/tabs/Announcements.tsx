import React, { useState, useEffect } from 'react';
import { Megaphone, AlertCircle, AlertTriangle, Info, Pin, Calendar, Plus, X, Eye, Edit, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../../context/AppContext';
import { fetchAnnouncements, createAnnouncement, deleteAnnouncement } from '../../services/apiClient';

export default function Announcements() {
  const { user } = useAppContext();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('update');
  const [priority, setPriority] = useState('normal');
  const [expiresAt, setExpiresAt] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  // Admin Check
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
  const isAdmin = Boolean(user?.role === 'admin' || user?.isAdmin || (user?.email && adminEmails.includes(user.email.toLowerCase())) || import.meta.env.DEV);

  const loadAnnouncements = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const res = await fetchAnnouncements(pageNum, 10, categoryFilter === 'all' ? undefined : categoryFilter);
      if (res?.items) {
        if (append) {
          setAnnouncements(prev => [...prev, ...res.items]);
        } else {
          setAnnouncements(res.items);
        }
        setHasMore(res.items.length === 10);
      }
    } catch (error) {
      console.error("Failed to load announcements", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadAnnouncements(1, false);
  }, [categoryFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      const payload: any = {
        title,
        body,
        category,
        priority,
        isPinned,
        targetAudience: ['all']
      };

      if (expiresAt) {
        payload.expiresAt = new Date(expiresAt).getTime();
      }

      await createAnnouncement(payload);
      setIsModalOpen(false);
      resetForm();
      loadAnnouncements(1, false);
    } catch (err) {
      console.error("Failed to create announcement", err);
      alert("Failed to create announcement");
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setCategory('update');
    setPriority('normal');
    setExpiresAt('');
    setIsPinned(false);
  };

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'normal': return <Megaphone className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-primary-blue" />
            Announcements
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Platform updates, news, and critical alerts</p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#603620] hover:bg-[#4a2a18] text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['all', 'update', 'feature', 'maintenance', 'event'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${
              categoryFilter === cat 
                ? 'bg-primary-blue text-white shadow-md' 
                : 'bg-surface dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {announcements.map((announcement) => (
          <div key={announcement.id} className={`bg-surface dark:bg-gray-800 rounded-2xl shadow-sm border ${announcement.isPinned ? 'border-primary-blue/30 shadow-[#b56b37]/10' : 'border-gray-100 dark:border-gray-700'} p-6 transition-all`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {getPriorityIcon(announcement.priority)}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{announcement.title}</h2>
                {announcement.isPinned && (
                  <span className="flex items-center gap-1 text-xs font-bold bg-surface-secondary text-primary-blue px-2 py-0.5 rounded-md border border-primary-blue/20">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>
              
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDelete(announcement.id)} className="p-1.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 dark:prose-invert">
              <ReactMarkdown>{announcement.body}</ReactMarkdown>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5 capitalize">
                <span className={`w-2 h-2 rounded-full ${
                  announcement.category === 'update' ? 'bg-blue-500' :
                  announcement.category === 'feature' ? 'bg-emerald-500' :
                  announcement.category === 'maintenance' ? 'bg-amber-500' : 'bg-purple-500'
                }`}></span>
                {announcement.category}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(announcement.publishedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {announcement.viewCount} views
              </span>
              <span className="text-gray-400 dark:text-gray-600 px-2">•</span>
              <span>By {announcement.author}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          </div>
        )}

        {!loading && announcements.length === 0 && (
          <div className="text-center py-12 bg-surface dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No announcements</h3>
            <p className="text-gray-500 mt-1">Check back later for updates</p>
          </div>
        )}

        {hasMore && !loading && announcements.length > 0 && (
          <button 
            onClick={() => {
              setPage(p => p + 1);
              loadAnnouncements(page + 1, true);
            }}
            className="w-full py-3 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            Load More
          </button>
        )}
      </div>

      {/* Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary-blue" />
                Create Announcement
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 overflow-y-auto flex-1 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#b56b37] focus:border-transparent transition-all"
                  placeholder="Enter a descriptive title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex justify-between">
                  <span>Body (Markdown) <span className="text-red-500">*</span></span>
                  <span className="text-xs text-gray-500 font-normal">Supports rich formatting</span>
                </label>
                <textarea 
                  required
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#b56b37] focus:border-transparent transition-all font-mono resize-y"
                  placeholder="# Big Update&#10;&#10;Here are the details..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#b56b37] transition-all"
                  >
                    <option value="update">Update</option>
                    <option value="feature">Feature</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#b56b37] transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5 flex gap-2">
                    Expires At <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input 
                    type="datetime-local" 
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#b56b37] transition-all"
                  />
                </div>
                
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer group pt-6">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                      />
                      <div className={`w-11 h-6 rounded-full transition-colors ${isPinned ? 'bg-primary-blue' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                      <div className={`absolute top-1 left-1 bg-surface w-4 h-4 rounded-full transition-transform ${isPinned ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                      Pin to top
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-4 pt-5 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-primary-blue hover:bg-[#a05a2b] rounded-xl transition-colors shadow-md flex items-center gap-2"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

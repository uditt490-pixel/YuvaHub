import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderGit2,
  Globe,
  ExternalLink,
  ThumbsUp,
  Sparkles,
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Star,
  Award,
  Share2,
  Check,
  X,
  FileCode,
  Users,
  Copy,
  Tag,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  RefreshCw,
  GitPullRequest,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { fetchProjects, submitProjectToVault, toggleProjectUpvoteApi, ProjectVaultResponse } from '../../services/projectService';
import { Project } from '../../models/projectSchema';

export default function ProjectShowcaseVault() {
  const { user, profile } = useAppContext();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isBeginnerFriendly, setIsBeginnerFriendly] = useState(false);
  const [isOpenSource, setIsOpenSource] = useState(false);
  const [isRemoteCollaboration, setIsRemoteCollaboration] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortBy, setSortBy] = useState('Recently Added');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Data & Request States
  const [vaultData, setVaultData] = useState<ProjectVaultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [upvotedSet, setUpvotedSet] = useState<Set<string>>(new Set());

  // Submit Modal Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: 'React, TypeScript, Node.js',
    difficulty: 'Intermediate',
    category: 'Full Stack Web',
    repoUrl: '',
    demoUrl: '',
    maintainerName: '',
    maintainerHandle: '',
    goodFirstIssues: true,
    isBeginnerFriendly: false,
    isOpenSource: true,
    isRemoteCollaboration: true,
    tags: 'Open Source, Web'
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch projects from backend
  const loadProjects = async (pageToFetch = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchProjects({
        q: searchTerm.trim() || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        tech: selectedTech !== 'all' ? selectedTech : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        isBeginnerFriendly: isBeginnerFriendly || undefined,
        isOpenSource: isOpenSource || undefined,
        isRemoteCollaboration: isRemoteCollaboration || undefined,
        isFeatured: isFeatured || undefined,
        sortBy,
        page: pageToFetch,
        limit: ITEMS_PER_PAGE
      });
      setVaultData(response);
      setCurrentPage(pageToFetch);
    } catch (err: any) {
      console.error("[ProjectVault] Load failed:", err);
      setError("Unable to load Project Vault listings. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProjects(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    selectedCategory,
    selectedTech,
    selectedDifficulty,
    selectedStatus,
    isBeginnerFriendly,
    isOpenSource,
    isRemoteCollaboration,
    isFeatured,
    sortBy
  ]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      loadProjects(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleUpvote = async (projId: string) => {
    if (upvotedSet.has(projId)) return;
    try {
      setUpvotedSet(prev => new Set(prev).add(projId));
      const res = await toggleProjectUpvoteApi(projId);
      setVaultData(prev => {
        if (!prev) return prev;
        const updated = prev.results.map(p => {
          if (p.id === projId || (p as any)._id === projId) {
            return { ...p, upvotes: res.upvotes, stars: res.stars };
          }
          return p;
        });
        return { ...prev, results: updated, items: updated };
      });
      showNotification('success', 'Project upvoted! Thank you for supporting open source.');
    } catch (err) {
      setUpvotedSet(prev => {
        const next = new Set(prev);
        next.delete(projId);
        return next;
      });
      showNotification('error', 'Could not upvote project.');
    }
  };

  const handleCopyRepo = (repoUrl: string, id: string) => {
    navigator.clipboard.writeText(repoUrl);
    setCopiedId(id);
    showNotification('success', 'Repository URL copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareProject = (project: Project) => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: `Check out ${project.title} on YuvaHub Project Vault!`,
        url: project.repoUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(project.repoUrl);
      showNotification('success', 'Project link copied to clipboard!');
    }
  };

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTech('all');
    setSelectedDifficulty('all');
    setSelectedStatus('all');
    setIsBeginnerFriendly(false);
    setIsOpenSource(false);
    setIsRemoteCollaboration(false);
    setIsFeatured(false);
    setSortBy('Recently Added');
  };

  const handleSubmitNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.repoUrl.trim() || !formData.description.trim()) {
      showNotification('error', 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await submitProjectToVault({
        ...formData,
        maintainerName: formData.maintainerName || profile?.name || user?.displayName || 'Student Maintainer',
        maintainerHandle: formData.maintainerHandle || user?.email?.split('@')[0] || 'student'
      });
      showNotification('success', 'Project submitted successfully to YuvaHub Project Vault!');
      setIsSubmitModalOpen(false);
      setFormData({
        title: '',
        description: '',
        techStack: 'React, TypeScript, Node.js',
        difficulty: 'Intermediate',
        category: 'Full Stack Web',
        repoUrl: '',
        demoUrl: '',
        maintainerName: '',
        maintainerHandle: '',
        goodFirstIssues: true,
        isBeginnerFriendly: false,
        isOpenSource: true,
        isRemoteCollaboration: true,
        tags: 'Open Source, Web'
      });
      loadProjects(1);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to submit project. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const projects = vaultData?.results || [];
  const totalItems = vaultData?.pagination?.totalItems ?? vaultData?.meta?.total_found ?? projects.length;
  const totalPages = vaultData?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

  const categories = [
    { label: 'All Categories', val: 'all' },
    { label: 'AI & Machine Learning', val: 'AI & Machine Learning' },
    { label: 'Full Stack Web', val: 'Full Stack Web' },
    { label: 'Mobile Apps', val: 'Mobile Apps' },
    { label: 'Cloud & DevOps', val: 'Cloud & DevOps' },
    { label: 'Web3 & Blockchain', val: 'Web3 & Blockchain' },
    { label: 'Cybersecurity', val: 'Cybersecurity' },
    { label: 'IoT & Hardware', val: 'IoT & Hardware' }
  ];

  const popularTech = ['all', 'React', 'TypeScript', 'Python', 'Node.js', 'Next.js', 'Go', 'Solidity', 'Docker', 'Flutter'];

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Beginner Friendly</span>;
      case 'Advanced':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">Advanced</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Intermediate</span>;
    }
  };

  const renderFilterSidebar = () => (
    <div className="space-y-6 text-xs text-text-primary dark:text-text-primary">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider mb-2.5">Category</h3>
        <div className="space-y-1.5">
          {categories.map(cat => (
            <button
              key={cat.val}
              onClick={() => setSelectedCategory(cat.val)}
              className={`w-full text-left px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === cat.val
                  ? 'bg-[#231f20] text-text-primary shadow-xs font-semibold'
                  : 'text-text-secondary dark:text-text-primary hover:bg-surface-secondary dark:hover:bg-surface-secondary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <h3 className="font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider mb-2.5">Technology</h3>
        <div className="flex flex-wrap gap-1.5">
          {popularTech.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTech(t)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                selectedTech === t
                  ? 'bg-primary-blue text-text-primary border-primary-blue'
                  : 'bg-surface dark:bg-surface-secondary border-border-theme dark:border-border-theme text-text-secondary dark:text-text-primary hover:border-primary-blue'
              }`}
            >
              {t === 'all' ? 'All Tech' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <h3 className="font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider mb-2.5">Difficulty</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {['all', 'Beginner', 'Intermediate', 'Advanced'].map(d => (
            <button
              key={d}
              onClick={() => setSelectedDifficulty(d)}
              className={`py-1.5 px-2 text-center rounded-lg border text-xs font-semibold transition-all ${
                selectedDifficulty === d
                  ? 'bg-[#231f20] text-text-primary border-[#231f20]'
                  : 'bg-surface dark:bg-surface-secondary border-border-theme dark:border-border-theme text-text-secondary dark:text-text-primary hover:bg-surface-secondary dark:hover:bg-slate-700'
              }`}
            >
              {d === 'all' ? 'All Levels' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Status & Highlights */}
      <div>
        <h3 className="font-bold text-text-secondary dark:text-text-muted uppercase tracking-wider mb-2.5">Badges & Attributes</h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isBeginnerFriendly}
              onChange={e => setIsBeginnerFriendly(e.target.checked)}
              className="w-4 h-4 rounded border-border-theme text-[#63703d] focus:ring-[#63703d]"
            />
            <span className="font-medium text-text-primary dark:text-text-primary group-hover:text-[#63703d] transition-colors">
              Beginner Friendly
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isOpenSource}
              onChange={e => setIsOpenSource(e.target.checked)}
              className="w-4 h-4 rounded border-border-theme text-primary-blue focus:ring-[#b56b37]"
            />
            <span className="font-medium text-text-primary dark:text-text-primary group-hover:text-primary-blue transition-colors">
              Open Source Only
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isRemoteCollaboration}
              onChange={e => setIsRemoteCollaboration(e.target.checked)}
              className="w-4 h-4 rounded border-border-theme text-primary-blue focus:ring-[#b56b37]"
            />
            <span className="font-medium text-text-primary dark:text-text-primary group-hover:text-primary-blue transition-colors">
              Remote Collaboration
            </span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={e => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-border-theme text-primary-blue focus:ring-[#b56b37]"
            />
            <span className="font-medium text-text-primary dark:text-text-primary group-hover:text-primary-blue transition-colors">
              Featured Projects Only
            </span>
          </label>
        </div>
      </div>

      <button
        onClick={handleResetFilters}
        className="w-full py-2 px-3 border border-border-theme dark:border-border-theme hover:bg-surface-secondary dark:hover:bg-surface-secondary rounded-lg text-text-secondary dark:text-text-primary font-semibold transition-colors"
      >
        Reset All Filters
      </button>
    </div>
  );

  return (
    <div className="font-sans h-full">
      {/* Toast Notification */}
      {notification.message && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-3 duration-200 ${
          notification.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            : 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
        }`}>
          {notification.type === 'error' ? <AlertTriangle className="w-4 h-4 text-rose-500" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
          {notification.message}
        </div>
      )}

      {/* Hero Banner */}
      <div className="m-4 sm:m-8 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" /> Open Source Showcase
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                Community Projects
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Project <span className="text-primary-blue italic">Vault</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Explore real open-source student repositories, find good first issues, collaborate with peers, and showcase your capstone projects to global recruiters.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-base text-primary-blue">
                {(vaultData as any)?.total || 0}
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Vault Projects</div>
                <div className="text-xs font-extrabold text-white">Showcase your capstone</div>
                <div className="text-[11px] text-emerald-400 font-semibold">Collaborate on open-source</div>
              </div>
            </div>
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-6 py-4 bg-primary-blue hover:bg-blue-600 text-white text-sm font-bold rounded-2xl transition-all shadow-lg hover:shadow-primary-blue/20"
            >
              <Plus className="w-5 h-5" />
              Submit Project
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full px-4 sm:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-surface dark:bg-surface border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-xs sticky top-24">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-theme dark:border-border-theme">
                <span className="font-bold text-xs text-text-primary dark:text-text-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary-blue" />
                  Filters & Categories
                </span>
              </div>
              {renderFilterSidebar()}
            </div>
          </aside>

          {/* Right Column: Search, Sort & Listings */}
          <main className="flex-1 space-y-6">
            {/* Search & Top Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface dark:bg-surface p-3 rounded-2xl border border-border-theme dark:border-border-theme shadow-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search projects by name, technology, tags, maintainer..."
                  className="w-full pl-10 pr-9 py-2 bg-background dark:bg-surface-secondary/80 border border-border-theme dark:border-border-theme rounded-xl text-xs sm:text-sm text-text-primary dark:text-text-primary placeholder-[#8c7569] focus:outline-none focus:ring-2 focus:ring-[#b56b37]"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-theme dark:border-border-theme bg-background dark:bg-surface-secondary text-xs font-bold text-text-secondary dark:text-text-primary"
                >
                  <Filter className="w-3.5 h-3.5 text-primary-blue" />
                  Filters
                </button>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="px-3.5 py-2 bg-background dark:bg-surface-secondary border border-border-theme dark:border-border-theme rounded-xl text-xs font-semibold text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#b56b37]"
                >
                  <option value="Recently Added">Recently Added</option>
                  <option value="Most Popular">Most Popular</option>
                  <option value="Most Starred">Most Starred</option>
                  <option value="Recently Updated">Recently Updated</option>
                  <option value="Beginner Friendly">Beginner Friendly</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-xs sm:text-sm font-semibold text-rose-800 dark:text-rose-200">{error}</p>
                <button
                  onClick={() => loadProjects(currentPage)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-text-primary rounded-xl text-xs font-bold inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-surface dark:bg-surface border border-border-theme dark:border-border-theme animate-pulse space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-5 bg-slate-200 dark:bg-surface-secondary rounded w-2/3" />
                      <div className="h-4 bg-slate-200 dark:bg-surface-secondary rounded w-16" />
                    </div>
                    <div className="h-12 bg-slate-200 dark:bg-surface-secondary rounded w-full" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-slate-200 dark:bg-surface-secondary rounded w-14" />
                      <div className="h-5 bg-slate-200 dark:bg-surface-secondary rounded w-16" />
                      <div className="h-5 bg-slate-200 dark:bg-surface-secondary rounded w-12" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && projects.length === 0 && (
              <div className="p-12 text-center bg-surface dark:bg-surface border border-border-theme dark:border-border-theme rounded-3xl space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-surface-secondary dark:bg-surface-secondary flex items-center justify-center mx-auto text-primary-blue">
                  <FolderGit2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-text-primary">
                  No projects available yet
                </h3>
                <p className="text-xs sm:text-sm text-text-muted dark:text-text-muted max-w-md mx-auto">
                  No matching projects found with the current search and filter criteria. Check back later or contribute your own project to the vault!
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 border border-border-theme dark:border-border-theme rounded-xl text-xs font-bold text-text-secondary dark:text-text-primary hover:bg-surface-secondary"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="px-5 py-2 bg-[#231f20] hover:bg-primary-blue text-text-primary rounded-xl text-xs font-bold transition-all"
                  >
                    Submit Project
                  </button>
                </div>
              </div>
            )}

            {/* Real Project Cards Grid */}
            {!loading && !error && projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map(proj => {
                  const projId = proj.id || (proj as any)._id;
                  const isUpvoted = upvotedSet.has(projId);

                  return (
                    <div
                      key={projId}
                      className="group bg-surface dark:bg-surface border border-border-theme dark:border-border-theme rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-primary-blue/50 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3.5">
                        {/* Header: Title & Badges */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-semibold text-text-muted dark:text-text-muted uppercase tracking-wider">
                                {proj.category}
                              </span>
                              {getDifficultyBadge(proj.difficulty)}
                              {proj.isFeatured && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-surface-secondary text-primary-blue border border-border-theme">
                                  Featured
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-text-primary dark:text-text-primary group-hover:text-primary-blue transition-colors leading-snug">
                              {proj.title}
                            </h3>
                          </div>

                          <button
                            onClick={() => handleUpvote(projId)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border shrink-0 ${
                              isUpvoted
                                ? 'bg-amber-500 text-text-primary border-amber-500 shadow-xs'
                                : 'bg-background dark:bg-surface-secondary text-text-secondary dark:text-text-primary border-border-theme dark:border-border-theme hover:border-amber-400'
                            }`}
                            title="Upvote Project"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{proj.upvotes || 0}</span>
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-text-secondary dark:text-text-primary line-clamp-3 leading-relaxed">
                          {proj.description}
                        </p>

                        {/* Tech Stack Badges */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.techStack?.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-surface-secondary dark:bg-surface-secondary text-text-secondary dark:text-text-primary rounded-md text-[11px] font-medium border border-border-theme dark:border-border-theme"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Good First Issues indicator */}
                        {proj.goodFirstIssues && (
                          <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <GitPullRequest className="w-3.5 h-3.5" />
                            <span>{proj.openIssuesCount || 'Open'} issues • Good First Issue friendly</span>
                          </div>
                        )}
                      </div>

                      {/* Footer: Maintainer & Action Links */}
                      <div className="pt-4 mt-4 border-t border-border-theme dark:border-border-theme flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <img
                            src={proj.maintainer?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(proj.maintainer?.name || 'Maintainer')}&background=231f20&color=fff`}
                            alt={proj.maintainer?.name}
                            className="w-6 h-6 rounded-full object-cover border border-border-theme"
                          />
                          <span className="font-semibold text-text-primary dark:text-text-primary truncate max-w-[110px]">
                            {proj.maintainer?.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopyRepo(proj.repoUrl, projId)}
                            className="p-1.5 rounded-lg border border-border-theme dark:border-border-theme hover:bg-surface-secondary dark:hover:bg-surface-secondary text-text-muted transition-colors"
                            title="Copy Repository URL"
                          >
                            {copiedId === projId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleShareProject(proj)}
                            className="p-1.5 rounded-lg border border-border-theme dark:border-border-theme hover:bg-surface-secondary dark:hover:bg-surface-secondary text-text-muted transition-colors"
                            title="Share Project"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {proj.demoUrl && (
                            <a
                              href={proj.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-border-theme dark:border-border-theme hover:bg-surface-secondary dark:hover:bg-surface-secondary text-text-secondary dark:text-text-primary transition-colors"
                              title="Live Demo"
                            >
                              <Globe className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <a
                            href={proj.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#231f20] hover:bg-primary-blue text-text-primary rounded-lg font-bold text-xs transition-colors"
                          >
                            <FolderGit2 className="w-3.5 h-3.5" />
                            <span>Code</span>
                            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && projects.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-theme dark:border-border-theme text-xs">
                <span className="text-text-muted">
                  Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong>{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</strong> of <strong>{totalItems}</strong> projects (Page {currentPage} of {totalPages})
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-border-theme dark:border-border-theme bg-surface dark:bg-surface disabled:opacity-40 hover:bg-surface-secondary transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-text-primary dark:text-text-primary" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-colors ${
                        currentPage === p
                          ? 'bg-[#231f20] text-text-primary'
                          : 'bg-surface border border-border-theme text-text-secondary hover:bg-surface-secondary'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-border-theme dark:border-border-theme bg-surface dark:bg-surface disabled:opacity-40 hover:bg-surface-secondary transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-text-primary dark:text-text-primary" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden bg-[#231f20]/40 backdrop-blur-xs">
          <div className="w-full max-w-xs h-full bg-surface dark:bg-surface border-l border-border-theme dark:border-border-theme p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border-theme pb-3">
                <h3 className="font-bold text-sm text-text-primary dark:text-slate-100">Filter Projects</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>
              {renderFilterSidebar()}
            </div>

            <div className="flex gap-2 pt-4 border-t border-border-theme">
              <button
                onClick={() => { handleResetFilters(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-2 rounded-lg border border-border-theme text-xs font-bold text-text-secondary"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 rounded-lg bg-primary-blue text-xs font-bold text-text-primary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Project Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#231f20]/50 backdrop-blur-xs">
          <div className="bg-surface dark:bg-surface border border-border-theme dark:border-border-theme rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border-theme dark:border-border-theme pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-text-primary dark:text-text-primary">Submit Open Source Project</h3>
                <p className="text-xs text-text-muted">Showcase your project on YuvaHub Global Vault</p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewProject} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-text-secondary dark:text-text-primary">Project Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Distributed DAG Task Scheduler"
                  className="w-full px-3.5 py-2.5 bg-background dark:bg-surface-secondary border border-border-theme dark:border-border-theme rounded-xl text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#b56b37]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary dark:text-text-primary">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe your project, architecture, features, and key contributions..."
                  className="w-full px-3.5 py-2.5 bg-background dark:bg-surface-secondary border border-border-theme dark:border-border-theme rounded-xl text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#b56b37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary dark:text-text-primary">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-background dark:bg-surface-secondary border border-border-theme dark:border-border-theme rounded-xl text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#b56b37]"
                  >
                    {categories.filter(c => c.val !== 'all').map(c => (
                      <option key={c.val} value={c.val}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary dark:text-text-primary">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData(f => ({ ...f, difficulty: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-background dark:bg-surface-secondary border border-border-theme dark:border-border-theme rounded-xl text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#b56b37]"
                  >
                    <option value="Beginner">Beginner Friendly</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text-secondary dark:text-text-primary">Tech Stack (comma-separated) *</label>
                <input
                  type="text"
                  required
                  value={formData.techStack}
                  onChange={e => setFormData(f => ({ ...f, techStack: e.target.value }))}
                  placeholder="e.g. React, TypeScript, Python, Docker"
                  className="w-full px-3.5 py-2.5 bg-background dark:bg-surface-secondary border border-border-theme dark:border-border-theme rounded-xl text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#b56b37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-text-secondary dark:text-text-primary">GitHub Repository URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.repoUrl}
                    onChange={e => setFormData(f => ({ ...f, repoUrl: e.target.value }))}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2.5 bg-background dark:bg-surface-secondary border border-border-theme dark:border-border-theme rounded-xl text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#b56b37]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-text-secondary dark:text-text-primary">Live Demo URL (optional)</label>
                  <input
                    type="url"
                    value={formData.demoUrl}
                    onChange={e => setFormData(f => ({ ...f, demoUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-background dark:bg-surface-secondary border border-border-theme dark:border-border-theme rounded-xl text-text-primary dark:text-text-primary focus:outline-none focus:ring-2 focus:ring-[#b56b37]"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border-theme dark:border-border-theme">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.goodFirstIssues}
                    onChange={e => setFormData(f => ({ ...f, goodFirstIssues: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary-blue"
                  />
                  <span className="font-medium text-text-primary dark:text-text-primary">Has "Good First Issues" for new contributors</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isBeginnerFriendly}
                    onChange={e => setFormData(f => ({ ...f, isBeginnerFriendly: e.target.checked }))}
                    className="w-4 h-4 rounded text-primary-blue"
                  />
                  <span className="font-medium text-text-primary dark:text-text-primary">Beginner Friendly project</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-theme dark:border-border-theme">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-2.5 border border-border-theme dark:border-border-theme rounded-xl font-bold text-text-secondary dark:text-text-primary hover:bg-surface-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#231f20] hover:bg-primary-blue text-text-primary rounded-xl font-bold transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

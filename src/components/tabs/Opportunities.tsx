import React, { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, X, Sparkles, Shield, Trophy, Briefcase, GraduationCap, Code2, Globe, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown, Coins, MapPin, Check } from 'lucide-react';
import { searchOpportunities } from '../../services/apiClient';
import { AsyncState } from '../ui/states';
import { useAppContext } from '../../context/AppContext';
import { OpportunityCard } from '../OpportunityCard';

export default function Opportunities() {
  const {
    viewOpportunity: onViewDetails,
    appSearchQuery: searchQuery,
    setAppSearchQuery: setSearchQuery,
    toggleBookmark,
    isBookmarked,
  } = useAppContext();

  const [searchData, setSearchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Category Pill selection
  const [activeCategoryPill, setActiveCategoryPill] = useState<string>('All');

  // Advanced Filter States
  const [filters, setFilters] = useState({
    types: { 'Jobs': false, 'Internships': false, 'Hackathons': false, 'Scholarships': false, 'Fellowships': false },
    locationTypes: { 'Remote': false, 'Onsite': false, 'Hybrid': false },
    stipend: 'All', // 'All' | 'Paid' | 'Unpaid'
    minSalary: 0,
    deadlineType: 'All', // 'All' | 'Soon' | 'Active' | 'Custom'
    startDate: '',
    endDate: '',
    isFree: false,
    verifiedOnly: false
  });

  const [sortBy, setSortBy] = useState('Most relevant');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const fetchData = async (q: string, targetPage = 1, isRetry = false) => {
    isRetry ? setRetrying(true) : setLoading(true);
    setError(null);
    try {
      const activeTypesFromCheckboxes = Object.keys(filters.types).filter(k => (filters.types as any)[k]);
      let combinedTypes = [...activeTypesFromCheckboxes];
      
      if (activeCategoryPill !== 'All' && !combinedTypes.includes(activeCategoryPill)) {
        combinedTypes.push(activeCategoryPill);
      }

      const activeLocs = Object.keys(filters.locationTypes).filter(k => (filters.locationTypes as any)[k]);

      const filterPayload: any = {};
      if (combinedTypes.length > 0) filterPayload.types = combinedTypes;
      if (activeLocs.length > 0) filterPayload.locationTypes = activeLocs;
      if (filters.stipend !== 'All') filterPayload.stipend = filters.stipend;
      if (filters.minSalary > 0) filterPayload.minSalary = filters.minSalary;
      if (filters.isFree) filterPayload.isFree = true;
      if (filters.verifiedOnly) filterPayload.verifiedOnly = true;
      if (filters.deadlineType !== 'All') {
        filterPayload.deadlineType = filters.deadlineType;
        if (filters.deadlineType === 'Custom') {
          filterPayload.startDate = filters.startDate;
          filterPayload.endDate = filters.endDate;
        }
      }

      const results = await searchOpportunities(
        q || "",
        filterPayload,
        targetPage,
        ITEMS_PER_PAGE,
        sortBy
      );
      setSearchData(results);
      setCurrentPage(targetPage);
    } catch (err) {
      console.error("[Opportunities] Failed to load:", err);
      setError('Unable to load opportunities. Please try again.');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(searchQuery, 1);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery, filters, sortBy, activeCategoryPill]);

  const clearFilters = () => {
    setActiveCategoryPill('All');
    setFilters({
      types: { 'Jobs': false, 'Internships': false, 'Hackathons': false, 'Scholarships': false, 'Fellowships': false },
      locationTypes: { 'Remote': false, 'Onsite': false, 'Hybrid': false },
      stipend: 'All',
      minSalary: 0,
      deadlineType: 'All',
      startDate: '',
      endDate: '',
      isFree: false,
      verifiedOnly: false
    });
    setSortBy('Most relevant');
    setSearchQuery('');
  };

  const handleToggleBookmark = async (id: string) => {
    await toggleBookmark(id);
  };

  const filteredResults = searchData?.results ?? [];
  const totalItems = searchData?.pagination?.totalItems ?? searchData?.meta?.total_found ?? filteredResults.length;
  const totalPages = searchData?.pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const paginatedResults = filteredResults;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      fetchData(searchQuery, newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const categoryPills = [
    { label: 'All', val: 'All' },
    { label: 'Internships', val: 'Internships' },
    { label: 'Hackathons', val: 'Hackathons' },
    { label: 'Jobs', val: 'Jobs' },
    { label: 'Scholarships', val: 'Scholarships' },
    { label: 'Fellowships', val: 'Fellowships' },
  ];

  // Calculate active filter count for badge
  const activeFiltersCount = 
    (activeCategoryPill !== 'All' ? 1 : 0) +
    Object.values(filters.types).filter(Boolean).length +
    Object.values(filters.locationTypes).filter(Boolean).length +
    (filters.stipend !== 'All' ? 1 : 0) +
    (filters.isFree ? 1 : 0) +
    (filters.verifiedOnly ? 1 : 0) +
    (filters.deadlineType !== 'All' ? 1 : 0);

  const renderFilterControls = () => (
    <div className="space-y-6 text-xs text-text-primary dark:text-slate-200">
      {/* Opportunity Type */}
      <div>
        <h3 className="font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider mb-2.5">Category</h3>
        <div className="space-y-2">
          {Object.keys(filters.types).map(k => (
            <label key={k} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.types as any)[k]}
                onChange={(e) => setFilters(f => ({ ...f, types: { ...f.types, [k]: e.target.checked } }))}
                className="w-4 h-4 rounded border-border-theme text-primary-blue focus:ring-[#b56b37]"
              />
              <span className="font-medium text-text-primary dark:text-slate-300 group-hover:text-primary-blue transition-colors">{k}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Type */}
      <div>
        <h3 className="font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider mb-2.5">Workplace</h3>
        <div className="space-y-2">
          {Object.keys(filters.locationTypes).map(k => (
            <label key={k} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={(filters.locationTypes as any)[k]}
                onChange={(e) => setFilters(f => ({ ...f, locationTypes: { ...f.locationTypes, [k]: e.target.checked } }))}
                className="w-4 h-4 rounded border-border-theme text-primary-blue focus:ring-[#b56b37]"
              />
              <span className="font-medium text-text-primary dark:text-slate-300 group-hover:text-primary-blue transition-colors">{k}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Trust & Application Fee */}
      <div>
        <h3 className="font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider mb-2.5">Trust & Requirements</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.isFree}
              onChange={(e) => setFilters(f => ({ ...f, isFree: e.target.checked }))}
              className="w-4 h-4 rounded border-border-theme text-[#63703d] focus:ring-[#63703d]"
            />
            <span className="font-semibold text-[#63703d]">Free to Apply Only</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters(f => ({ ...f, verifiedOnly: e.target.checked }))}
              className="w-4 h-4 rounded border-border-theme text-primary-blue focus:ring-[#b56b37]"
            />
            <span className="font-semibold text-primary-blue">Verified Audit Only</span>
          </label>
        </div>
      </div>

      {/* Stipend */}
      <div>
        <h3 className="font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider mb-2.5">Stipend</h3>
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-1 p-1 bg-surface-secondary dark:bg-slate-800 rounded-lg border border-border-theme dark:border-slate-700">
            {['All', 'Paid', 'Unpaid'].map(opt => (
              <button
                key={opt}
                onClick={() => setFilters(f => ({ ...f, stipend: opt }))}
                className={`py-1 text-xs font-semibold rounded transition-all ${filters.stipend === opt ? 'bg-surface dark:bg-slate-700 text-text-primary dark:text-white shadow-xs' : 'text-text-secondary dark:text-slate-400'}`}
              >
                {opt}
              </button>
            ))}
          </div>

          {filters.stipend === 'Paid' && (
            <div className="pt-1 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-muted">Min Stipend</span>
                <span className="font-bold text-[#63703d]">₹{filters.minSalary.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="2000"
                value={filters.minSalary}
                onChange={(e) => setFilters(f => ({ ...f, minSalary: parseInt(e.target.value, 10) }))}
                className="w-full h-1 bg-[#e8ded1] dark:bg-slate-700 rounded appearance-none cursor-pointer accent-[#b56b37]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Deadline */}
      <div>
        <h3 className="font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider mb-2.5">Deadline</h3>
        <div className="space-y-2">
          {[
            { label: 'Anytime', val: 'All' },
            { label: 'Expiring soon (< 48h)', val: 'Soon' },
            { label: 'Active / Open', val: 'Active' },
            { label: 'Custom Date Range', val: 'Custom' }
          ].map(opt => (
            <label key={opt.val} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="deadlineType"
                checked={filters.deadlineType === opt.val}
                onChange={() => setFilters(f => ({ ...f, deadlineType: opt.val }))}
                className="w-4 h-4 border-border-theme text-primary-blue focus:ring-[#b56b37]"
              />
              <span className="font-medium text-text-primary dark:text-slate-300 group-hover:text-primary-blue transition-colors">{opt.label}</span>
            </label>
          ))}

          {filters.deadlineType === 'Custom' && (
            <div className="space-y-2 pt-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                className="w-full text-xs p-2 bg-surface dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-lg text-text-primary dark:text-slate-200"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                className="w-full text-xs p-2 bg-surface dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-lg text-text-primary dark:text-slate-200"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto font-sans pb-16 px-2 sm:px-4 space-y-6">

      {/* Clean Professional Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border-theme dark:border-slate-800 pb-6 pt-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text-primary dark:text-white tracking-tight">
            Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary dark:text-slate-400 font-medium">
            Discover verified hackathons, internships, scholarships, and jobs tailored for students.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Refresh Button */}
          <button
            onClick={() => fetchData(searchQuery)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 text-xs font-semibold text-text-secondary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-blue' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 text-xs font-semibold text-text-primary dark:text-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-primary-blue" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-text-primary dark:text-slate-200 outline-none cursor-pointer"
            >
              <option value="Most relevant" className="bg-surface text-text-primary">Most Relevant</option>
              <option value="Newest" className="bg-surface text-text-primary">Newest First</option>
              <option value="Deadline" className="bg-surface text-text-primary">Expiring Soonest</option>
              <option value="Recently updated" className="bg-surface text-text-primary">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search & Category Navigation */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search by title, skills, organization, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-xl pl-11 pr-24 py-3 text-sm text-text-primary dark:text-white placeholder-[#8c7569] outline-none focus:border-primary-blue focus:ring-1 focus:ring-[#b56b37] transition-all shadow-2xs"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted hover:text-text-primary"
            >
              Clear
            </button>
          ) : null}
        </div>

        {/* Minimal Category Segmented Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categoryPills.map((pill) => {
            const isActive = activeCategoryPill === pill.val;
            return (
              <button
                key={pill.val}
                onClick={() => setActiveCategoryPill(pill.val)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#231f20] dark:bg-surface text-white dark:text-text-primary font-bold'
                    : 'bg-surface dark:bg-slate-900 text-text-secondary dark:text-slate-400 border border-border-theme dark:border-slate-800 hover:bg-surface-secondary dark:hover:bg-slate-800'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Active Filter Chips Row */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-text-muted font-medium">Active filters:</span>
            {activeCategoryPill !== 'All' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-surface-secondary border border-border-theme text-text-secondary font-medium">
                {activeCategoryPill}
                <X className="w-3 h-3 cursor-pointer hover:text-primary-blue" onClick={() => setActiveCategoryPill('All')} />
              </span>
            )}
            {filters.isFree && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#63703d]/10 border border-[#63703d]/20 text-[#63703d] font-medium">
                Free to Apply
                <X className="w-3 h-3 cursor-pointer hover:text-text-primary" onClick={() => setFilters(f => ({ ...f, isFree: false }))} />
              </span>
            )}
            {filters.verifiedOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary-blue/10 border border-primary-blue/20 text-primary-blue font-medium">
                Verified Only
                <X className="w-3 h-3 cursor-pointer hover:text-text-primary" onClick={() => setFilters(f => ({ ...f, verifiedOnly: false }))} />
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-primary-blue hover:underline font-bold text-xs ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="flex items-start gap-6">

        {/* Minimal Left Filter Sidebar (Desktop) */}
        <aside className="w-56 shrink-0 hidden md:block bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-xl p-4 shadow-2xs sticky top-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-theme dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary dark:text-slate-200">Filters</span>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="text-[11px] font-semibold text-primary-blue hover:underline">
                Reset
              </button>
            )}
          </div>
          {renderFilterControls()}
        </aside>

        {/* Opportunity List & Grid */}
        <main className="flex-1 min-w-0 space-y-4">
          <div className="flex justify-between items-center text-xs text-text-muted dark:text-slate-400 font-medium">
            <span>Showing <strong className="text-text-primary dark:text-slate-200">{totalItems}</strong> opportunities</span>
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1 font-bold text-primary-blue"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters ({activeFiltersCount})</span>
            </button>
          </div>

          <AsyncState
            loading={loading}
            error={error}
            empty={filteredResults.length === 0}
            onRetry={() => void fetchData(searchQuery, currentPage, true)}
            retrying={retrying}
            skeletonCount={4}
            emptyTitle="No opportunities found"
            emptyDescription="Try clearing your filters or searching for a different term."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedResults.map((opp: any, i: number) => (
                <OpportunityCard
                  key={opp.id || i}
                  opportunity={opp}
                  onViewDetails={onViewDetails}
                  onToggleBookmark={handleToggleBookmark}
                  isBookmarked={isBookmarked(opp.id)}
                />
              ))}
            </div>
          </AsyncState>

          {/* Clean Pagination */}
          {!loading && filteredResults.length > 0 && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-theme dark:border-slate-800 text-xs">
              <span className="text-text-muted">
                Showing <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> - <strong>{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</strong> of <strong>{totalItems}</strong> opportunities (Page {currentPage} of {totalPages})
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-border-theme dark:border-slate-800 bg-surface dark:bg-slate-900 disabled:opacity-40 hover:bg-surface-secondary transition-colors"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4 text-text-primary dark:text-slate-300" />
                </button>

                {(() => {
                  const getPages = () => {
                    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
                    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
                    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                  };
                  return getPages().map((p, idx) => {
                    if (p === '...') {
                      return <span key={`ellipsis-${idx}`} className="px-1 text-text-muted">...</span>;
                    }
                    const pageNum = Number(p);
                    return (
                      <button
                        key={`page-${pageNum}`}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-[#231f20] text-white'
                            : 'bg-surface border border-border-theme text-text-secondary hover:bg-surface-secondary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  });
                })()}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border-theme dark:border-slate-800 bg-surface dark:bg-slate-900 disabled:opacity-40 hover:bg-surface-secondary transition-colors"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4 text-text-primary dark:text-slate-300" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Drawer Filter */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden bg-[#231f20]/40 backdrop-blur-xs">
          <div className="w-full max-w-xs h-full bg-surface dark:bg-slate-900 border-l border-border-theme dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border-theme pb-3">
                <h3 className="font-bold text-sm text-text-primary dark:text-slate-100">Filter Opportunities</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              </div>
              {renderFilterControls()}
            </div>

            <div className="flex gap-2 pt-4 border-t border-border-theme">
              <button
                onClick={() => { clearFilters(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-2 rounded-lg border border-border-theme text-xs font-bold text-text-secondary"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2 rounded-lg bg-primary-blue text-xs font-bold text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, ChevronRight, Clock, Star, Share2, Copy, RefreshCw, X } from 'lucide-react';
import { UserProfile } from '../../types';
import { searchOpportunities, trackInteraction } from '../../services/apiClient';
import { AsyncState } from '../ui/states';
import { useAppContext } from '../../context/AppContext';
import { OpportunityCard } from '../OpportunityCard';

export default function Opportunities() {
  const {
    user,
    profile,
    viewOpportunity: onViewDetails,
    appSearchQuery: searchQuery,
    setAppSearchQuery: setSearchQuery,
    // Bookmark actions from centralized context — no local Firestore logic needed
    toggleBookmark,
    isBookmarked,
  } = useAppContext();

  const qVal = searchQuery;
  const setQVal = setSearchQuery;

  const [searchData, setSearchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced Filter States
  const [filters, setFilters] = useState({
    types: { 'Jobs': false, 'Internships': true, 'Hackathons': true, 'Scholarships': false, 'Fellowships': false },
    locationTypes: { 'Remote': false, 'Onsite': false, 'Hybrid': false },
    stipend: 'All', // 'All' | 'Paid' | 'Unpaid'
    minSalary: 0,
    deadlineType: 'All', // 'All' | 'Soon' | 'Active' | 'Custom'
    startDate: '',
    endDate: ''
  });

  const [sortBy, setSortBy] = useState('Most relevant');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const fetchData = async (q: string, isRetry = false) => {
    isRetry ? setRetrying(true) : setLoading(true);
    setError(null);
    try {
      const activeTypes = Object.keys(filters.types).filter(k => (filters.types as any)[k]);
      const activeLocs = Object.keys(filters.locationTypes).filter(k => (filters.locationTypes as any)[k]);

      const filterPayload: any = {};
      if (activeTypes.length > 0) filterPayload.types = activeTypes;
      if (activeLocs.length > 0) filterPayload.locationTypes = activeLocs;
      if (filters.stipend !== 'All') filterPayload.stipend = filters.stipend;
      if (filters.minSalary > 0) filterPayload.minSalary = filters.minSalary;
      if (filters.deadlineType !== 'All') {
        filterPayload.deadlineType = filters.deadlineType;
        if (filters.deadlineType === 'Custom') {
          filterPayload.startDate = filters.startDate;
          filterPayload.endDate = filters.endDate;
        }
      }

      const results = await searchOpportunities(q || "", filterPayload, undefined);
      setSearchData(results);
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
      fetchData(qVal);
    }, 350);

    return () => clearTimeout(handler);
  }, [qVal, filters]);

  const clearFilters = () => {
    setFilters({
      types: { 'Jobs': false, 'Internships': false, 'Hackathons': false, 'Scholarships': false, 'Fellowships': false },
      locationTypes: { 'Remote': false, 'Onsite': false, 'Hybrid': false },
      stipend: 'All',
      minSalary: 0,
      deadlineType: 'All',
      startDate: '',
      endDate: ''
    });
    setSortBy('Most relevant');
  };

  const handleToggleBookmark = async (id: string) => {
    // Delegates to the centralized toggleBookmark action in AppContext.
    // Firestore update, optimistic state, and profile sync all happen there.
    await toggleBookmark(id);
  };

  const filteredResults = React.useMemo(() => {
    if (!searchData || !searchData.results) return [];
    let results = searchData.results;

    // Client-side sorting
    results = [...results].sort((a: any, b: any) => {
      if (sortBy === 'Newest') {
        return new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime();
      }
      if (sortBy === 'Recently updated') {
        return new Date(b.updatedAt || b.updated_at || 0).getTime() - new Date(a.updatedAt || a.updated_at || 0).getTime();
      }
      if (sortBy === 'Deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0; // Most relevant
    });

    return results;
  }, [searchData, sortBy]);

  const getThumbStyle = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('hackathon')) return 'bg-gradient-to-br from-[#0F172A] to-[#1E3A8A] text-white';
    if (t.includes('quiz')) return 'bg-[#F8F9FF] border-b border-[#E2E8F0]';
    if (t.includes('course') || t.includes('coding')) return 'bg-[#F0FDF4] border-b border-[#E2E8F0]';
    return 'bg-[#FFF7ED] border-b border-[#E2E8F0]';
  };

  const getBadgeStyle = (type: string) => {
    const t = type.toUpperCase();
    if (t.includes('HACKATHON')) return 'bg-blue-100 text-blue-700';
    if (t.includes('LIVE')) return 'bg-green-100 text-green-700';
    if (t.includes('QUIZ')) return 'bg-purple-100 text-purple-700';
    if (t.includes('CODING')) return 'bg-green-100 text-green-700';
    return 'bg-orange-100 text-orange-700';
  };

  const renderFilterControls = () => (
    <div className="space-y-8">
      {/* Type */}
      <div>
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">Opportunity Type</h3>
        <div className="space-y-2.5">
          {Object.keys(filters.types).map(k => (
            <label key={k} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={(filters.types as any)[k]} onChange={(e) => setFilters(f => ({ ...f, types: { ...f.types, [k]: e.target.checked } }))} className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]" />
              <span className="text-[13px] text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{k}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Type */}
      <div>
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">Location Type</h3>
        <div className="space-y-2.5">
          {Object.keys(filters.locationTypes).map(k => (
            <label key={k} className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" checked={(filters.locationTypes as any)[k]} onChange={(e) => setFilters(f => ({ ...f, locationTypes: { ...f.locationTypes, [k]: e.target.checked } }))} className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]" />
              <span className="text-[13px] text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{k}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stipend / Salary */}
      <div>
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">Stipend / Salary</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            {['All', 'Paid', 'Unpaid'].map(opt => (
              <button
                key={opt}
                onClick={() => setFilters(f => ({ ...f, stipend: opt }))}
                className={`flex-1 py-1.5 text-[12px] font-semibold border rounded-lg transition-colors ${filters.stipend === opt ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                {opt}
              </button>
            ))}
          </div>
          {filters.stipend === 'Paid' && (
            <div className="pt-2 animate-fade-in">
              <div className="flex justify-between items-center text-[11px] text-gray-500 mb-2">
                <span>Min Stipend</span>
                <span className="font-bold text-[#0F172A]">₹{filters.minSalary.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="2000"
                value={filters.minSalary}
                onChange={(e) => setFilters(f => ({ ...f, minSalary: parseInt(e.target.value, 10) }))}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          )}
        </div>
      </div>

      {/* Deadline */}
      <div>
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">Deadline</h3>
        <div className="space-y-3">
          {[
            { label: 'Anytime', val: 'All' },
            { label: 'Expiring soon (< 48h)', val: 'Soon' },
            { label: 'Active / Open', val: 'Active' },
            { label: 'Custom Date Range', val: 'Custom' }
          ].map(opt => (
            <label key={opt.val} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="deadlineType"
                checked={filters.deadlineType === opt.val}
                onChange={() => setFilters(f => ({ ...f, deadlineType: opt.val }))}
                className="w-4 h-4 border-gray-300 text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="text-[13px] text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{opt.label}</span>
            </label>
          ))}
          {filters.deadlineType === 'Custom' && (
            <div className="space-y-2 pt-2 animate-fade-in">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                className="w-full text-[12px] p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 bg-white"
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                className="w-full text-[12px] p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-gray-700 bg-white"
                placeholder="End date"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto flex items-start gap-8 font-sans pb-12">

      {/* Left Sidebar - Filters */}
      <aside className="w-[220px] shrink-0 hidden md:block">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-gray-700" />
          <h2 className="text-[15px] font-[700] text-gray-900">Filters</h2>
        </div>

        {/* Filter Controls */}
        {renderFilterControls()}

        <button onClick={clearFilters} className="mt-10 w-full py-2.5 border-[1.5px] border-[#E2E8F0] text-[#2563EB] text-[13px] font-bold rounded-[8px] hover:bg-[#EFF6FF] transition-colors cursor-pointer">
          Clear Filters
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div className="hidden md:block">
            <h1 className="text-[24px] font-[800] tracking-tight text-gray-900 mb-1">Opportunities Explorer</h1>
            <p className="text-[14px] text-[#64748B]">Browse and filter the complete live database.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex items-center justify-center gap-2 bg-white border border-[#E2E8F0] px-4 py-2 rounded-[8px] text-[13px] font-[600] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm flex-1"
            >
              <Filter className="w-4 h-4 text-gray-500" />
              <span>Filters</span>
            </button>
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-[8px] text-[13px] text-[#0F172A] outline-none focus:ring-2 focus:ring-[#2563EB] flex-1 md:flex-none"
            >
              <option value="Most relevant">Most relevant</option>
              <option value="Newest">Newest</option>
              <option value="Deadline">Deadline</option>
              <option value="Recently updated">Recently updated</option>
            </select>

            <button
              onClick={() => fetchData(qVal)}
              disabled={loading}
              className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-4 py-2 rounded-[8px] text-[13px] font-[600] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Search Header for Mobile */}
        <div className="md:hidden relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search standard competitions..."
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] px-10 py-3 text-[14px]"
            value={qVal}
            onChange={e => setQVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchData(qVal)}
          />
        </div>

        <AsyncState
          loading={loading}
          error={error}
          empty={filteredResults.length === 0}
          onRetry={() => void fetchData(qVal, true)}
          retrying={retrying}
          skeletonCount={searchData?.results?.length || 4}
          emptyTitle="No opportunities found"
          emptyDescription="Try changing your search or filters, then search again."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            {filteredResults.map((opp: any, i: number) => (
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

        {/* Pagination */}
        {!loading && filteredResults?.length > 0 && (
          <div className="flex items-center justify-center gap-[6px] mt-10">
            <button className="w-[36px] h-[36px] rounded-[8px] bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">‹</button>
            <button className="w-[36px] h-[36px] rounded-[8px] bg-[#2563EB] text-white font-medium flex items-center justify-center">1</button>
            <button className="w-[36px] h-[36px] rounded-[8px] bg-white border border-[#E2E8F0] flex items-center justify-center text-gray-700 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">2</button>
            <button className="w-[36px] h-[36px] rounded-[8px] bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">...</button>
            <button className="w-[36px] h-[36px] rounded-[8px] bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors">›</button>
          </div>
        )}
      </main>

      {/* Mobile slide-out filter drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xs h-full bg-white shadow-2xl flex flex-col relative p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-700" />
                <h2 className="text-[16px] font-[700] text-gray-900">Filters</h2>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              {renderFilterControls()}
            </div>

            <div className="border-t pt-4 mt-6 flex gap-3">
              <button
                onClick={() => { clearFilters(); setIsMobileFilterOpen(false); }}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-[13px] font-bold text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-blue-600 rounded-xl text-[13px] font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer shadow-md shadow-blue-500/10"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
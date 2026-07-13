import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, ChevronRight, Clock, Star, Share2, Copy, RefreshCw } from 'lucide-react';
import { UserProfile } from '../../types';
import { searchOpportunities, trackInteraction } from '../../services/apiClient';
import { AsyncState } from '../ui/states';

export default function Opportunities({ 
  user, 
  profile, 
  onViewDetails,
  searchQuery,
  setSearchQuery
}: { 
  user: any, 
  profile: UserProfile | null, 
  onViewDetails?: (id: string, title?: string) => void,
  searchQuery?: string,
  setSearchQuery?: React.Dispatch<React.SetStateAction<string>>
}) {
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  
  const qVal = searchQuery !== undefined ? searchQuery : localSearchQuery;
  const setQVal = setSearchQuery !== undefined ? setSearchQuery : setLocalSearchQuery;

  const [searchData, setSearchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: { 'Live': true, 'Upcoming': false, 'Closed': false, 'Closing Soon': false },
    type: { 'Hackathons': true, 'Quizzes': true, 'Internships': false, 'Jobs': false, 'Scholarships': false, 'Mentorships': false },
    eligibility: { 'College Students': true, 'Professionals': false, 'High School': false },
    location: { 'Remote': false, 'On-site': false },
    cost: { 'Free': false, 'Paid': false }
  });
  
  const [sortBy, setSortBy] = useState('Most relevant');

  const fetchData = async (q: string, isRetry = false) => {
    isRetry ? setRetrying(true) : setLoading(true);
    setError(null);
    try {
      const typeStr = filters.type.Internships ? 'Internship' : (filters.type.Hackathons ? 'Hackathon' : 'All');
      const results = await searchOpportunities(q || "Student opportunities", typeStr, 1, {});
      setSearchData(results);
    } catch {
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
      status: { 'Live': false, 'Upcoming': false, 'Closed': false, 'Closing Soon': false },
      type: { 'Hackathons': false, 'Quizzes': false, 'Internships': false, 'Jobs': false, 'Scholarships': false, 'Mentorships': false },
      eligibility: { 'College Students': false, 'Professionals': false, 'High School': false },
      location: { 'Remote': false, 'On-site': false },
      cost: { 'Free': false, 'Paid': false }
    });
    setSortBy('Most relevant');
  };

  const filteredResults = React.useMemo(() => {
    if (!searchData || !searchData.results) return [];
    const query = qVal.trim().toLowerCase();
    
    let results = searchData.results;

    if (query) {
      results = results.filter((opp: any) => {
        const titleMatch = (opp.title || "").toLowerCase().includes(query);
        const categoryMatch = (opp.category || "").toLowerCase().includes(query);
        const descMatch = (opp.description || "").toLowerCase().includes(query);
        return titleMatch || categoryMatch || descMatch;
      });
    }

    // Apply Location Filter
    if (filters.location['Remote'] || filters.location['On-site']) {
      results = results.filter((opp: any) => {
        const isRemote = (opp.location || '').toLowerCase().includes('remote');
        if (filters.location['Remote'] && isRemote) return true;
        if (filters.location['On-site'] && !isRemote) return true;
        return false;
      });
    }

    // Apply Cost Filter
    if (filters.cost['Free'] || filters.cost['Paid']) {
      results = results.filter((opp: any) => {
        const isFree = !opp.price || (opp.price || '').toLowerCase() === 'free' || opp.price === 0;
        if (filters.cost['Free'] && isFree) return true;
        if (filters.cost['Paid'] && !isFree) return true;
        return false;
      });
    }
    
    // Sort Results
    results = [...results].sort((a: any, b: any) => {
      if (sortBy === 'Newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'Recently updated') {
        return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
      }
      if (sortBy === 'Deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return 0; // Most relevant (default DB sorting)
    });

    return results;
  }, [searchData, qVal, filters, sortBy]);

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

  return (
    <div className="max-w-[1200px] mx-auto flex items-start gap-8 font-sans pb-12">
      
      {/* Left Sidebar - Filters */}
      <aside className="w-[220px] shrink-0 hidden md:block">
         <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-[15px] font-[700] text-gray-900">Filters</h2>
         </div>

         {/* Filter Groups */}
         <div className="space-y-8">
            {/* Status */}
            <div>
               <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">Status</h3>
               <div className="space-y-2.5">
                  {Object.keys(filters.status).map(k => (
                     <label key={k} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={(filters.status as any)[k]} onChange={(e) => setFilters(f => ({...f, status: {...f.status, [k]: e.target.checked}}))} className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]" />
                        <span className="text-[13px] text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{k}</span>
                     </label>
                  ))}
               </div>
            </div>

            {/* Type */}
            <div>
               <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">Opportunity Type</h3>
               <div className="space-y-2.5">
                  {Object.keys(filters.type).map(k => (
                     <label key={k} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={(filters.type as any)[k]} onChange={(e) => setFilters(f => ({...f, type: {...f.type, [k]: e.target.checked}}))} className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]" />
                        <span className="text-[13px] text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{k}</span>
                     </label>
                  ))}
               </div>
            </div>

            {/* Eligibility */}
            <div>
               <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">Eligibility</h3>
               <div className="space-y-2.5">
                  {Object.keys(filters.eligibility).map(k => (
                     <label key={k} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={(filters.eligibility as any)[k]} onChange={(e) => setFilters(f => ({...f, eligibility: {...f.eligibility, [k]: e.target.checked}}))} className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]" />
                        <span className="text-[13px] text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{k}</span>
                     </label>
                  ))}
               </div>
            </div>

            {/* Location */}
            <div>
               <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">Location</h3>
               <div className="space-y-2.5">
                  {Object.keys(filters.location).map(k => (
                     <label key={k} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={(filters.location as any)[k]} onChange={(e) => setFilters(f => ({...f, location: {...f.location, [k]: e.target.checked}}))} className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]" />
                        <span className="text-[13px] text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{k}</span>
                     </label>
                  ))}
               </div>
            </div>

            {/* Cost */}
            <div>
               <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">Cost</h3>
               <div className="space-y-2.5">
                  {Object.keys(filters.cost).map(k => (
                     <label key={k} className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={(filters.cost as any)[k]} onChange={(e) => setFilters(f => ({...f, cost: {...f.cost, [k]: e.target.checked}}))} className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]" />
                        <span className="text-[13px] text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{k}</span>
                     </label>
                  ))}
               </div>
            </div>
         </div>

         <button onClick={clearFilters} className="mt-10 w-full py-2.5 border-[1.5px] border-[#E2E8F0] text-[#2563EB] text-[13px] font-bold rounded-[8px] hover:bg-[#EFF6FF] transition-colors">
            Clear Filters
         </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
         
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
           <div className="hidden md:block">
             <h2 className="text-[24px] font-[800] tracking-tight text-gray-900 mb-1">Opportunities Explorer</h2>
             <p className="text-[14px] text-[#64748B]">Browse and filter the complete live database.</p>
           </div>
           <button 
             onClick={() => void fetchData(qVal, true)}
             disabled={loading}
             className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-4 py-2 rounded-[8px] text-[13px] font-[600] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm disabled:opacity-50"
           >
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
             Refresh
           </button>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
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
           skeletonCount={6}
           emptyTitle="No opportunities found"
           emptyDescription="Try changing your search or filters, then search again."
         >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
               {filteredResults.map((opp: any, i: number) => {
                  const cleanSlug = (opp.title || "opportunity").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                  
                  return (
                     <div key={i} className="bg-white border border-[#E2E8F0] rounded-[12px] flex flex-col hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-[3px] transition-all duration-200 overflow-hidden cursor-pointer" onClick={() => onViewDetails && onViewDetails(opp.id, opp.title)}>
                        {/* Thumb */}
                        <div className={`h-[130px] p-4 relative flex items-center justify-center ${getThumbStyle(opp.type)}`}>
                           <div className="absolute top-3 left-3 flex items-center gap-[6px]">
                              {opp.type && <span className={`px-[9px] py-[3px] rounded-[100px] text-[10px] uppercase font-[700] ${getBadgeStyle(opp.type)}`}>{opp.type}</span>}
                              {opp.verified !== false && <span className="px-[9px] py-[3px] rounded-[100px] text-[10px] uppercase font-[700] bg-green-100 text-green-700">LIVE</span>}
                           </div>
                           {(opp.type || '').toLowerCase().includes('hackathon') && <span className="opacity-80 font-black tracking-widest text-lg">HACKATHON</span>}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-1">
                           <div className="flex items-center gap-2 mb-2">
                              <div className="w-[22px] h-[22px] rounded-[5px] bg-[#EFF6FF] flex items-center justify-center font-bold text-[10px] text-[#2563EB]">
                                 {opp.org ? opp.org.substring(0,2).toUpperCase() : 'CO'}
                              </div>
                              <span className="text-[12px] font-[500] text-[#64748B] truncate">{opp.org || opp.organization || 'Company'}</span>
                           </div>
                           
                           <h3 className="text-[14px] font-[600] text-gray-900 mb-4 line-clamp-2 leading-snug">{opp.title}</h3>

                           <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                 <div className="text-[10px] uppercase tracking-[0.08em] text-[#64748B] mb-0.5">Registered</div>
                                 <div className="text-[14px] font-[600] text-gray-900">{(opp.id || '').substring(0,2).replace(/[^0-9]/g, '') + '50+'}</div>
                              </div>
                              <div>
                                 <div className="text-[10px] uppercase tracking-[0.08em] text-[#64748B] mb-0.5">Ends In</div>
                                 <div className="text-[14px] font-[600] text-gray-900">{(opp.deadline || '5 days').substring(0, 8)}</div>
                              </div>
                           </div>

                           <div className="mt-auto pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                              <div className="text-[12px] text-[#64748B] flex items-center gap-1">
                                 👥 <span>1-4 Members</span>
                              </div>
                              <div className="text-[13px] font-[600] text-[#2563EB]">
                                 Register Now →
                              </div>
                           </div>
                        </div>
                     </div>
                  )
               })}
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

    </div>
  );
}

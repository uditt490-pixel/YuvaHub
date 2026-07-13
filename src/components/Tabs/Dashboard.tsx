import React, { useState, useEffect } from 'react';
import { Target, Search, Compass, ShieldCheck, Loader2, ArrowRight, RefreshCw, Sparkles, Share2, FileText } from 'lucide-react';
import { io } from 'socket.io-client';
import { UserProfile } from '../../types';
import { fetchSmartFeed, fetchExploreFeed, trackInteraction, runScoutProtocolBackend, generateApplyAssistBackend, fetchLatestFeed } from '../../services/apiClient';
import { ErrorState } from '../ui/states';
import ShareModal from '../ui/ShareModal';
import ApplyAssistModal from '../ui/ApplyAssistModal';

interface DashboardProps {
  user: any;
  profile: UserProfile | null;
  onViewDetails?: (id: string, title?: string) => void;
}

export default function Dashboard({ user, profile, onViewDetails }: DashboardProps) {
  const [showScoutModal, setShowScoutModal] = useState(false);
  const [scoutStep, setScoutStep] = useState(1);
  const [scoutData, setScoutData] = useState({ year: '', field: '', tech: '', goal: '' });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [shareOpp, setShareOpp] = useState<{title: string, link: string} | null>(null);
  const [discoveryMode, setDiscoveryMode] = useState<'smart' | 'explore' | 'daily'>('smart');

  const [isAssistModalOpen, setIsAssistModalOpen] = useState(false);
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistContent, setAssistContent] = useState<string | null>(null);
  const [assistingOpp, setAssistingOpp] = useState<any>(null);

  const [hasNewUpdates, setHasNewUpdates] = useState(false);
  const [newLiveItems, setNewLiveItems] = useState<any[]>([]);

  useEffect(() => {
    if (user && profile) {
      loadInitialFeed(false, discoveryMode);
      
      // Initialize Real-Time WebSocket Connection
      const socket = io(); // Connects to same host/port

      socket.on("connected", () => {
        console.log("Connected to Real-Time Feed Pipeline");
      });

      socket.on("NEW_OPPORTUNITY", (opp: any) => {
        setNewLiveItems(prev => [opp, ...prev]);
        setHasNewUpdates(true);
      });
      
      // Also refresh on window focus
      const handleFocus = () => loadInitialFeed(false, discoveryMode);
      window.addEventListener('focus', handleFocus);
      
      return () => {
        socket.disconnect();
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user, profile, discoveryMode]);

  const loadInitialFeed = async (force = false, mode = discoveryMode) => {
    // Only show full loading spinner for first load or force refresh
    const isFirstLoad = feedItems.length === 0;
    if (isFirstLoad || force) setLoading(true);
    
    try {
      setFeedError(null);
      const fetchFn = mode === 'smart' 
        ? () => fetchSmartFeed(profile, 1) 
        : mode === 'daily'
        ? () => fetchLatestFeed()
        : () => fetchExploreFeed(1);
      const results = await fetchFn();
      
      setFeedItems(results.items || []);
      setCurrentPage(1);
      setHasNextPage(!!results.next_page);
      setLastUpdated(Date.now());
    } catch {
      setFeedError('Unable to load your dashboard feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage || discoveryMode === 'daily') return;
    setLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const results = discoveryMode === 'smart' 
        ? await fetchSmartFeed(profile, nextPage) 
        : await fetchExploreFeed(nextPage);
      
      if (results.items?.length > 0) {
        setFeedItems(prev => [...prev, ...results.items]);
        setCurrentPage(nextPage);
        setHasNextPage(!!results.next_page);
      } else {
        setHasNextPage(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const profileStrength = () => {
    if (!profile) return 0;
    const fields = [profile.year, profile.field, profile.college, profile.skills?.length];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / 4) * 100);
  };

  const handleScoutSubmit = async (finalData: any) => {
    setLoading(true);
    setShowScoutModal(false);
    
    try {
      const results = await runScoutProtocolBackend(finalData, profile);
      setFeedItems(results.results ? results.results : (Array.isArray(results) ? results : []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setScoutStep(1); // reset for next time
    }
  };

  const handleApplyAssist = async (opp: any) => {
    setAssistingOpp(opp);
    setAssistContent(null);
    setIsAssistModalOpen(true);
    setAssistLoading(true);
    
    try {
      const result = await generateApplyAssistBackend({
        title: opp.title,
        organization: opp.org || opp.organization
      }, profile);
      const content = typeof result === 'string' ? result : result.content;
      setAssistContent(content || "Unable to generate draft.");
    } catch (e) {
      console.error(e);
      setAssistContent("Failed to generate application assistant draft. Please try again.");
    } finally {
      setAssistLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-12 font-sans px-4 md:px-0">
      <header className="pt-2 flex justify-between items-start">
        <div>
          <h2 className="text-[28px] font-[800] tracking-tight text-gray-900 mb-2">
            Dashboard
          </h2>
          <p className="text-[15px] text-[#64748B]">Here is your personalized intelligence briefing.</p>
        </div>
        <button 
          onClick={() => loadInitialFeed(true)}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-[#E2E8F0] px-4 py-2 rounded-[8px] text-[13px] font-[600] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[20px]">
        <MetricCard title="Matched Opportunities" value={feedItems.length > 0 ? feedItems.length : "0"} icon={Target} />
        <MetricCard title="Applications Tracked" value="0" icon={Compass} />
        <MetricCard title="Mentor Sessions" value="0" icon={Search} />
        <MetricCard title="Profile Strength" value={`${profileStrength()}%`} icon={ShieldCheck} highlight />
      </div>

      {/* Scout Protocol Banner */}
      <div className="bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-[#BFDBFE] rounded-[20px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_4px_24px_rgba(37,99,235,0.06)]">
        <div>
          <div className="inline-block px-3 py-1 bg-[#2563EB] text-white text-[11px] font-[800] uppercase tracking-wide rounded-full mb-4">
            New Feature
          </div>
          <h3 className="text-[24px] font-[800] text-gray-900 mb-3">Scout Protocol</h3>
          <p className="text-[15px] text-[#475569] max-w-xl leading-relaxed">Find your best matches in seconds. Our AI will calibrate your feed based on your specific requirements and background, updating in real-time.</p>
          <div className="flex flex-wrap items-center gap-3 mt-6 text-[13px] font-[600] text-[#1D4ED8]">
            <span className="flex items-center gap-[6px]"><span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[11px] font-bold shadow-sm">1</span> Year</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#93C5FD]" />
            <span className="flex items-center gap-[6px]"><span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[11px] font-bold shadow-sm">2</span> Field</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#93C5FD]" />
            <span className="flex items-center gap-[6px]"><span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[11px] font-bold shadow-sm">3</span> Tech</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#93C5FD]" />
            <span className="flex items-center gap-[6px]"><span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[11px] font-bold shadow-sm">4</span> Goal</span>
          </div>
        </div>
        <button onClick={() => setShowScoutModal(true)} className="bg-[#2563EB] hover:bg-blue-700 text-white font-[700] px-8 py-3.5 rounded-[12px] whitespace-nowrap shadow-[0_4px_16px_rgba(37,99,235,0.25)] transition-all transform hover:-translate-y-1">
          Run Protocol Now
        </button>
      </div>

      {/* Feed Preview */}
      <div className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[20px] font-[800] text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" /> {discoveryMode === 'daily' ? "Daily Summary" : "Personalized Feed"}
            </h3>
            {lastUpdated && !loading && (
              <p className="text-[12px] font-[500] text-[#64748B] mt-1.5 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Last checked: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-[#E2E8F0] relative overflow-hidden">
            <div 
              className={`absolute inset-y-1 w-[110px] rounded-full bg-[#F1F5F9] transition-all duration-300 ease-out`}
              style={{ 
                 left: discoveryMode === 'smart'     ? '4px' : 
                       discoveryMode === 'explore'   ? '122px' : 
                                                       '240px' 
              }}
            />
            <button
              onClick={() => setDiscoveryMode('smart')}
              className={`relative w-[110px] z-10 flex items-center justify-center py-2 px-1 rounded-full text-[11px] font-[700] uppercase tracking-wide transition-colors ${discoveryMode === 'smart' ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            >
              Smart Match
            </button>
            <button
              onClick={() => setDiscoveryMode('explore')}
              className={`relative w-[110px] z-10 flex items-center justify-center py-2 px-1 rounded-full text-[11px] font-[700] uppercase tracking-wide transition-colors ${discoveryMode === 'explore' ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            >
              Explore
            </button>
            <button
              onClick={() => setDiscoveryMode('daily')}
              className={`relative w-[110px] z-10 flex items-center justify-center py-2 px-1 rounded-full text-[11px] font-[700] uppercase tracking-wide transition-colors ${discoveryMode === 'daily' ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            >
              Daily
            </button>
            
            <button 
              onClick={() => loadInitialFeed(true)}
              disabled={loading}
              className="ml-2 mr-1 w-8 h-8 z-10 rounded-full bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#2563EB] disabled:opacity-50 hover:bg-[#F8FAFC]"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {feedError && feedItems.length === 0 ? (
          <ErrorState description={feedError} onRetry={() => void loadInitialFeed(true)} retrying={loading} />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[16px] border border-[#E2E8F0]">
            <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#64748B] font-[500] text-[14px]">Discovering more opportunities for you 🚀</p>
          </div>
        ) : (feedItems.length > 0 || newLiveItems.length > 0) ? (
          <div className="space-y-8 relative">

            {/* Fallback Banner */}
            {feedItems.some(i => i.isFallback) && discoveryMode !== 'daily' && (
              <div className="bg-[#FFFBEB] border border-[#FEF3C7] px-5 py-4 rounded-[12px] flex items-center gap-3">
                <Sparkles className="w-5 h-5 shrink-0 text-[#D97706]" />
                <p className="text-[14px] text-[#92400E] font-[500]">Showing curated opportunities while we refresh new matches ✨</p>
              </div>
            )}

            {discoveryMode === 'daily' && (
              <div className="bg-[#EFF6FF] border border-[#BFDBFE] px-5 py-4 rounded-[12px] flex items-center gap-3">
                <Sparkles className="w-5 h-5 shrink-0 text-[#2563EB]" />
                <p className="text-[14px] text-[#1E3A8A] font-[500]">Here are the latest fresh opportunities discovered within the past 24 hours.</p>
              </div>
            )}

            {/* Live Update Pill */}
            {hasNewUpdates && (
              <div className="sticky top-4 z-40 flex justify-center w-full">
                <button
                  onClick={() => {
                    setFeedItems(prev => [...newLiveItems, ...prev]);
                    setNewLiveItems([]);
                    setHasNewUpdates(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white shadow-lg rounded-full px-6 py-2.5 text-[13px] font-[700] flex items-center gap-2 transition-transform hover:scale-105"
                >
                  ↑ {newLiveItems.length} New Update{newLiveItems.length !== 1 && 's'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
               {feedItems.map((item, i) => {
                 const tType = (item.type || '').toLowerCase();
                 let badgeClass = "bg-[#EFF6FF] text-[#2563EB]";
                 if (tType.includes("hackathon")) badgeClass = "bg-[#F3E8FF] text-[#7E22CE]";
                 if (tType.includes("job")) badgeClass = "bg-[#ECFDF5] text-[#059669]";
                 if (tType.includes("scholarship")) badgeClass = "bg-[#FFF7ED] text-[#C2410C]";

                 return (
                    <div key={i} className="bg-white border border-[#E2E8F0] p-6 rounded-[16px] flex flex-col relative hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-[2px] transition-all duration-300">
                       <button 
                         onClick={() => {
                           setShareOpp({ title: item.title, link: item.applyLink || item.apply_link || window.location.href });
                           trackInteraction(item.id, 'save');
                         }}
                         className="absolute top-6 right-6 text-[#94A3B8] hover:text-[#2563EB] transition-colors"
                       >
                         <Share2 className="w-[18px] h-[18px]" />
                       </button>

                       <div className="flex gap-[16px] mb-5">
                          <div className="w-[48px] h-[48px] rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center font-[700] text-[18px] text-[#475569] shrink-0">
                             {item.org ? item.org.substring(0,1).toUpperCase() : (item.organization ? item.organization.substring(0,1).toUpperCase() : 'C')}
                          </div>
                          <div className="pr-10">
                            <div className="flex items-center gap-[8px] mb-1.5 flex-wrap">
                               <span className={`px-[8px] py-[3px] rounded-[6px] text-[10px] font-[800] uppercase tracking-wide ${badgeClass}`}>
                                 {item.type || 'Opportunity'}
                               </span>
                               {item.isLive && <span className="text-[10px] uppercase font-[800] text-white bg-[#EF4444] px-[8px] py-[3px] rounded-[6px] animate-pulse">Live</span>}
                               {(item.matchScore || item.match_score || item.smartMatch || item.smart_match) && <span className="text-[10px] font-[800] uppercase tracking-wide text-[#059669] bg-[#ECFDF5] px-[8px] py-[3px] rounded-[6px]">⚡ {item.matchScore || item.match_score ? (item.matchScore || item.match_score) + '% Match' : 'Smart Match'}</span>}
                            </div>
                            <a 
                              href={`/opportunity/${item.id}/${(item.title || "opportunity").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
                              onClick={(e) => {
                                e.preventDefault();
                                trackInteraction(item.id, 'view');
                                if (onViewDetails) onViewDetails(item.id, item.title);
                              }}
                              className="block group"
                            >
                              <h4 className="font-[700] text-[16px] md:text-[18px] leading-[1.3] text-[#0F172A] group-hover:text-[#2563EB] transition-colors mb-1.5">{item.title}</h4>
                            </a>
                            <p className="text-[14px] text-[#64748B] font-[500]">{item.organization || item.org}</p>
                          </div>
                       </div>

                       <p className="text-[14px] text-[#475569] line-clamp-2 leading-relaxed mb-4">{item.description}</p>
                       
                       {(item.matchReason || item.match_reason) && (
                          <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-[8px] mb-5 flex items-start gap-2">
                             <Sparkles className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                             <p className="text-[13px] text-[#475569]">{item.matchReason || item.match_reason}</p>
                          </div>
                       )}

                       <div className="mt-auto pt-5 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-4">
                          <div className="flex flex-wrap gap-[6px]">
                            {item.tags?.slice(0,2).map((t: string) => (
                              <span key={t} className="text-[11px] font-[600] text-[#64748B] bg-[#F1F5F9] px-[10px] py-[4px] rounded-[100px]">{t}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-[10px]">
                            <button 
                              onClick={() => handleApplyAssist(item)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] rounded-[8px] text-[13px] font-[600] transition-colors"
                            >
                              <FileText className="w-[14px] h-[14px]" /> <span>Assist</span>
                            </button>
                            {(item.apply_link || item.applyLink) ? (
                              <a 
                                href={item.apply_link || item.applyLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={() => trackInteraction(item.id, 'apply')}
                                className="bg-[#2563EB] text-white px-4 py-2 rounded-[8px] text-[13px] font-[700] hover:bg-blue-700 transition-colors shadow-sm"
                              >
                                Apply Now
                              </a>
                            ) : (
                              <div className="bg-[#FFF7ED] border border-[#FFEDD5] text-[#C2410C] px-3 py-2 rounded-[8px] text-[12px] font-[600]">
                                {item.deadline || item.daysLeft + ' Days Left'}
                              </div>
                            )}
                          </div>
                       </div>
                    </div>
                 )
               })}
            </div>
            
            {discoveryMode !== 'daily' && (
              <div className="flex justify-center pt-8">
                <button 
                  onClick={handleLoadMore}
                  disabled={loadingMore || !hasNextPage}
                  className="bg-white border-[1.5px] border-[#E2E8F0] text-[#0F172A] px-8 py-3 rounded-[12px] text-[14px] font-[700] flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <><div className="w-4 h-4 border-2 border-[#0F172A] border-t-transparent rounded-full animate-spin"></div> Loading...</>
                  ) : !hasNextPage ? (
                    <>You're all caught up!</>
                  ) : (
                    <>Load More Results</>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] py-20 px-6 text-center shadow-sm">
            <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E2E8F0]">
               <Target className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <h3 className="text-[18px] font-[700] text-gray-900 mb-2">No matches exactly fit this yet.</h3>
            <p className="text-[14px] text-[#64748B] max-w-md mx-auto mb-6">Run the Scout Protocol to force our system to aggressively match your profile against our entire database.</p>
            <button onClick={() => setShowScoutModal(true)} className="bg-[#0F172A] text-white px-6 py-2.5 rounded-[8px] text-[14px] font-[700] hover:bg-gray-800 transition-colors">
               Launch Scout Protocol
            </button>
          </div>
        )}
      </div>

      {/* Newsletter Signup */}
      <div className="mt-12 bg-white border border-[#E2E8F0] rounded-[16px] p-8 text-center shadow-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2563EB] to-[#4F46E5]"></div>
        <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#DBEAFE]">
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2563EB]"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path><polyline points="15,9 18,9 18,11"></polyline><path d="M5.5 19C7.4 19 9 17.4 9 15.5S7.4 12 5.5 12"></path><polyline points="2 5 12 12 22 5"></polyline></svg>
        </div>
        <h3 className="text-[22px] font-[800] text-gray-900 mb-2">Stay Updated</h3>
        <p className="text-[15px] text-[#64748B] max-w-md mx-auto mb-6">Get the latest opportunities right in your inbox.</p>
        <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }} className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
           <input type="email" placeholder="Email address" required className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[8px] px-4 py-3 text-[15px] text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all placeholder:text-[#94A3B8]" />
           <button type="submit" className="bg-[#0F172A] text-white px-8 py-3 rounded-[8px] text-[15px] font-[700] hover:bg-gray-800 transition-colors whitespace-nowrap">Join</button>
        </form>
      </div>

      <ShareModal 
        isOpen={!!shareOpp} 
        onClose={() => setShareOpp(null)} 
        opportunity={shareOpp} 
      />

      <ApplyAssistModal
        isOpen={isAssistModalOpen}
        onClose={() => setIsAssistModalOpen(false)}
        content={assistContent}
        isLoading={assistLoading}
        opportunityTitle={assistingOpp?.title || "Opportunity"}
      />

      {/* Scout Modal */}
      {showScoutModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="px-8 py-6 border-b border-[#E2E8F0] flex justify-between items-center bg-white">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-[10px] bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                 </div>
                 <div>
                   <h3 className="text-[18px] font-[800] text-gray-900">Scout Protocol</h3>
                   <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-1.5 w-16 bg-[#F1F5F9] rounded-full overflow-hidden">
                         <div className="h-full bg-[#2563EB] rounded-full transition-all duration-500" style={{ width: `${(scoutStep / 4) * 100}%` }}></div>
                      </div>
                      <p className="text-[11px] text-[#64748B] font-[700] uppercase tracking-wider">Step {scoutStep} of 4</p>
                   </div>
                 </div>
               </div>
               <button onClick={() => setShowScoutModal(false)} className="w-[36px] h-[36px] rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
            </div>
            
            <div className="p-8">
              {scoutStep === 1 && (
                <ScoutStep title="What year are you in?" 
                  options={['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Postgrad']}
                  selected={scoutData.year}
                  onSelect={(v: string) => { setScoutData({...scoutData, year: v}); setScoutStep(2); }}
                />
              )}
              {scoutStep === 2 && (
                <ScoutStep title="What is your field of study?" 
                  options={['Engineering', 'Science', 'Commerce', 'Arts', 'Law', 'Medicine', 'Design', 'Other']}
                  selected={scoutData.field}
                  onSelect={(v: string) => { setScoutData({...scoutData, field: v}); setScoutStep(3); }}
                  showBack={() => setScoutStep(1)}
                />
              )}
              {scoutStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                     <h4 className="text-[20px] font-[800] text-gray-900 mb-2">Technology Focus?</h4>
                     <p className="text-[14px] text-[#64748B] mb-6">Enter your primary technical interests separated by commas.</p>
                     <input type="text" placeholder="e.g. AI/ML, Web Dev, Finance..." 
                       className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[12px] px-4 py-3.5 text-[15px] text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-all"
                       value={scoutData.tech}
                       onChange={e => setScoutData({...scoutData, tech: e.target.value})}
                       onKeyDown={e => { if (e.key === 'Enter') setScoutStep(4) }}
                     />
                  </div>
                  <div className="pt-6 flex justify-between items-center">
                    <button onClick={() => setScoutStep(2)} className="text-[14px] font-[600] text-[#64748B] hover:text-[#0F172A] transition-colors">← Back</button>
                    <button onClick={() => setScoutStep(4)} className="bg-[#0F172A] text-white px-6 py-2.5 rounded-[8px] text-[14px] font-[700] hover:bg-gray-800 transition-colors">Next Step →</button>
                  </div>
                </div>
              )}
              {scoutStep === 4 && (
                <ScoutStep title="What is your immediate goal?" 
                  options={['Internship', 'Hackathon', 'Scholarship', 'Mentorship', 'Job', 'Fellowship']}
                  selected={scoutData.goal}
                  onSelect={(v: string) => { 
                    const finalData = {...scoutData, goal: v};
                    setScoutData(finalData); 
                    handleScoutSubmit(finalData); 
                  }}
                  showBack={() => setScoutStep(3)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, highlight = false }: any) {
  return (
    <div className={`bg-white border rounded-[16px] p-6 shadow-sm hover:shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all ${highlight ? 'border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-white' : 'border-[#E2E8F0]'}`}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-[13px] font-[600] text-[#64748B] uppercase tracking-[0.05em] pr-4">{title}</p>
        <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${highlight ? 'bg-[#DBEAFE] text-[#2563EB]' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}>
           <Icon className="w-4 h-4" />
        </div>
      </div>
      <h3 className={`text-[32px] font-[800] tracking-tight ${highlight ? 'text-[#1D4ED8]' : 'text-gray-900'}`}>{value}</h3>
    </div>
  );
}

function ScoutStep({ title, options, selected, onSelect, showBack }: any) {
  return (
    <div className="space-y-6 animate-fade-in">
      <h4 className="text-[20px] font-[800] text-gray-900 mb-6">{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-[12px]">
        {options.map((opt: string) => (
          <button 
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-4 py-4 text-[14px] font-[600] rounded-[12px] border-[1.5px] transition-all text-center ${selected === opt ? 'bg-[#EFF6FF] text-[#2563EB] border-[#2563EB] shadow-[0_0_0_2px_rgba(37,99,235,0.1)]' : 'bg-white text-[#475569] border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'}`}
          >
            {opt}
          </button>
        ))}
      </div>
      {showBack && (
        <div className="pt-6 flex justify-start">
          <button onClick={showBack} className="text-[14px] font-[600] text-[#64748B] hover:text-[#0F172A] transition-colors">← Back</button>
        </div>
      )}
    </div>
  );
}

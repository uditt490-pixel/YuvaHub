import React, { useState, useEffect } from 'react';
import { Target, Search, Compass, ShieldCheck, Loader2, ArrowRight, RefreshCw, Sparkles, Share2, FileText, Zap, Bookmark, Briefcase, GraduationCap, Users, Brain } from 'lucide-react';
import { UserProfile } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { fetchSmartFeed, fetchExploreFeed, trackInteraction, runScoutProtocolBackend, generateApplyAssistBackend, fetchLatestFeed } from '../../services/apiClient';
import { ErrorState } from '../ui/states';
import ShareModal from '../ui/ShareModal';
import ApplyAssistModal from '../ui/ApplyAssistModal';
import { useAppContext } from '../../context/AppContext';

export default function Dashboard() {
  const { user, profile, viewOpportunity: onViewDetails, setActiveTab } = useAppContext();
  const { socket } = useSocket();
  const [showScoutModal, setShowScoutModal] = useState(false);
  const [scoutStep, setScoutStep] = useState(1);
  const [scoutData, setScoutData] = useState({ year: '', field: '', tech: '', goal: '' });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
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
      
      if (socket) {
        socket.on("connected", () => {
          console.log("Connected to Real-Time Feed Pipeline");
        });

        socket.on("NEW_OPPORTUNITY", (opp: any) => {
          setNewLiveItems(prev => [opp, ...prev]);
          setHasNewUpdates(true);
        });
      }
      
      const handleFocus = () => loadInitialFeed(false, discoveryMode);
      window.addEventListener('focus', handleFocus);
      
      return () => {
        if (socket) {
          socket.off("connected");
          socket.off("NEW_OPPORTUNITY");
        }
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user, profile, discoveryMode, socket]);

  const loadInitialFeed = async (force = false, mode = discoveryMode) => {
    const isFirstLoad = feedItems.length === 0;
    if (isFirstLoad || force) setLoading(true);
    
    try {
      setFeedError(null);
      const fetchFn = mode === 'smart' 
        ? () => fetchSmartFeed(profile) 
        : mode === 'daily'
        ? () => fetchLatestFeed()
        : () => fetchExploreFeed();
      const results = await fetchFn();
      
      setFeedItems(results.items || []);
      setNextCursor(results.next_cursor || null);
      setHasNextPage(!!results.next_cursor);
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
      const results = discoveryMode === 'smart' 
        ? await fetchSmartFeed(profile, nextCursor || undefined) 
        : await fetchExploreFeed(nextCursor || undefined);
      
      if (results.items?.length > 0) {
        setFeedItems(prev => [...prev, ...results.items]);
        setNextCursor(results.next_cursor || null);
        setHasNextPage(!!results.next_cursor);
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
      setScoutStep(1);
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

  const userName = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-12 font-sans px-4 md:px-0">
      
      {/* Personalized Senior Header */}
      <header className="pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-theme pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-surface-secondary text-primary-blue border border-border-theme">
              {profile?.field || 'Tech & Engineering'} Candidate
            </span>
            {profile?.college && (
              <span className="text-xs text-text-muted font-medium">• {profile.college}</span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-text-primary">
            Welcome back, <span className="text-primary-blue italic">{userName}</span>
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Here is your live AI opportunity briefing & career pipeline updates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('opportunity_match')}
            className="flex items-center gap-2 bg-primary-blue hover:bg-[#603620] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#f3e4bd]" />
            AI Match Studio
          </button>

          <button 
            onClick={() => loadInitialFeed(true)}
            disabled={loading}
            className="flex items-center gap-2 bg-surface border border-border-theme px-3.5 py-2.5 rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Matched Opportunities" value={feedItems.length > 0 ? feedItems.length : "0"} icon={Target} subtitle="Live opportunities" />
        <MetricCard title="Profile Match Index" value={`${profileStrength()}%`} icon={ShieldCheck} subtitle="Completeness score" highlight />
        <MetricCard title="Saved Bookmarks" value={profile?.bookmarks?.length || "0"} icon={Bookmark} subtitle="In your vault" />
        <MetricCard title="AI Career Intelligence" value="Active" icon={Zap} subtitle="Real-time matcher" />
      </div>

      {/* Quick Launchpad Cards for Senior Student Devs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          onClick={() => setActiveTab('resume_ats')}
          className="p-3.5 bg-surface border border-border-theme rounded-xl text-left hover:border-primary-blue hover:bg-surface-secondary/50 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-secondary text-primary-blue flex items-center justify-center mb-2 group-hover:bg-primary-blue group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <p className="text-xs font-extrabold text-text-primary">Resume ATS</p>
          <p className="text-[10px] text-text-muted">Score & optimize</p>
        </button>

        <button 
          onClick={() => setActiveTab('interview_prep')}
          className="p-3.5 bg-surface border border-border-theme rounded-xl text-left hover:border-primary-blue hover:bg-surface-secondary/50 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-secondary text-primary-blue flex items-center justify-center mb-2 group-hover:bg-primary-blue group-hover:text-white transition-colors">
            <Brain className="w-4 h-4" />
          </div>
          <p className="text-xs font-extrabold text-text-primary">AI Interview Prep</p>
          <p className="text-[10px] text-text-muted">Mock questions</p>
        </button>

        <button 
          onClick={() => setActiveTab('teams')}
          className="p-3.5 bg-surface border border-border-theme rounded-xl text-left hover:border-primary-blue hover:bg-surface-secondary/50 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-secondary text-primary-blue flex items-center justify-center mb-2 group-hover:bg-primary-blue group-hover:text-white transition-colors">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xs font-extrabold text-text-primary">Team Matcher</p>
          <p className="text-[10px] text-text-muted">Find hackathon teammates</p>
        </button>

        <button 
          onClick={() => setActiveTab('opensource_bounties')}
          className="p-3.5 bg-surface border border-border-theme rounded-xl text-left hover:border-primary-blue hover:bg-surface-secondary/50 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-surface-secondary text-primary-blue flex items-center justify-center mb-2 group-hover:bg-primary-blue group-hover:text-white transition-colors">
            <Briefcase className="w-4 h-4" />
          </div>
          <p className="text-xs font-extrabold text-text-primary">Open Source Bounties</p>
          <p className="text-[10px] text-text-muted">Paid bounties & PRs</p>
        </button>
      </div>

      {/* Scout Protocol Banner */}
      <div className="bg-gradient-to-r from-surface-secondary via-surface to-surface-secondary border border-border-theme rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="inline-block px-3 py-1 bg-[#603620] text-[#f3e4bd] text-[10px] font-black uppercase tracking-wider rounded-full mb-3">
            AI Scout Protocol
          </div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-text-primary mb-2">High-Precision Match Scout</h2>
          <p className="text-xs md:text-sm text-text-secondary max-w-xl leading-relaxed">
            Target high-converting hackathons, stipends, and research grants calibrated specifically to your year and tech stack.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs font-bold text-primary-blue">
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-surface border border-border-theme flex items-center justify-center text-[10px] font-extrabold">1</span> Year</span>
            <ArrowRight className="w-3 h-3 text-text-muted" />
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-surface border border-border-theme flex items-center justify-center text-[10px] font-extrabold">2</span> Field</span>
            <ArrowRight className="w-3 h-3 text-text-muted" />
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-surface border border-border-theme flex items-center justify-center text-[10px] font-extrabold">3</span> Tech</span>
            <ArrowRight className="w-3 h-3 text-text-muted" />
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-surface border border-border-theme flex items-center justify-center text-[10px] font-extrabold">4</span> Goal</span>
          </div>
        </div>
        <button 
          onClick={() => setShowScoutModal(true)} 
          className="bg-primary-blue hover:bg-[#603620] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl whitespace-nowrap shadow-md transition-all cursor-pointer"
        >
          Run Protocol Now
        </button>
      </div>

      {/* Feed Discovery Section */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-serif font-bold text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-blue" /> {discoveryMode === 'daily' ? "Daily Summary" : "Personalized Feed"}
            </h2>
            {lastUpdated && !loading && (
              <p className="text-xs text-text-muted font-medium mt-1 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" /> Updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border-theme shadow-xs">
            <button
              onClick={() => setDiscoveryMode('smart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                discoveryMode === 'smart' ? 'bg-primary-blue text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Smart Match
            </button>
            <button
              onClick={() => setDiscoveryMode('explore')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                discoveryMode === 'explore' ? 'bg-primary-blue text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setDiscoveryMode('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                discoveryMode === 'daily' ? 'bg-primary-blue text-white shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Daily
            </button>
          </div>
        </div>
        
        {feedError && feedItems.length === 0 ? (
          <ErrorState description={feedError} onRetry={() => void loadInitialFeed(true)} retrying={loading} />
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-border-theme">
            <div className="w-10 h-10 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-text-secondary font-bold text-sm">Discovering relevant opportunities for you 🚀</p>
          </div>
        ) : (feedItems.length > 0 || newLiveItems.length > 0) ? (
          <div className="space-y-6 relative">

            {/* Fallback Banner */}
            {feedItems.some(i => i.isFallback) && discoveryMode !== 'daily' && (
              <div className="bg-surface-secondary border border-border-theme px-5 py-3.5 rounded-xl flex items-center gap-3">
                <Sparkles className="w-4 h-4 shrink-0 text-primary-blue" />
                <p className="text-xs text-text-secondary font-semibold">Showing curated opportunities while we refresh new matches ✨</p>
              </div>
            )}

            {discoveryMode === 'daily' && (
              <div className="bg-surface-secondary border border-border-theme px-5 py-3.5 rounded-xl flex items-center gap-3">
                <Sparkles className="w-4 h-4 shrink-0 text-primary-blue" />
                <p className="text-xs text-text-secondary font-semibold">Here are fresh student opportunities discovered within the past 24 hours.</p>
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
                  className="bg-primary-blue hover:bg-[#603620] text-white shadow-lg rounded-full px-6 py-2.5 text-xs font-bold flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
                >
                  ↑ {newLiveItems.length} New Update{newLiveItems.length !== 1 && 's'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
               {feedItems.map((item, i) => {
                 const tType = (item.type || '').toLowerCase();
                 let badgeClass = "bg-surface-secondary text-primary-blue border border-border-theme";
                 if (tType.includes("hackathon")) badgeClass = "bg-purple-50 text-purple-700 border border-purple-200";
                 if (tType.includes("job")) badgeClass = "bg-emerald-50 text-emerald-700 border border-emerald-200";
                 if (tType.includes("scholarship")) badgeClass = "bg-amber-50 text-amber-700 border border-amber-200";

                 return (
                    <div key={i} className="bg-surface border border-border-theme p-6 rounded-2xl flex flex-col relative hover:shadow-md transition-all duration-300">
                       <button 
                         onClick={() => {
                           setShareOpp({ title: item.title, link: item.applyLink || item.apply_link || window.location.href });
                           trackInteraction(item.id, 'save');
                         }}
                         className="absolute top-6 right-6 text-text-muted hover:text-primary-blue transition-colors cursor-pointer"
                       >
                         <Share2 className="w-4 h-4" />
                       </button>

                       <div className="flex gap-4 mb-4">
                          <div className="w-11 h-11 rounded-xl bg-[#603620] border border-border-theme flex items-center justify-center font-bold text-base text-[#f3e4bd] shrink-0 shadow-xs">
                             {item.org ? item.org.substring(0,1).toUpperCase() : (item.organization ? item.organization.substring(0,1).toUpperCase() : 'C')}
                          </div>
                          <div className="pr-8">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                               <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${badgeClass}`}>
                                 {item.type || 'Opportunity'}
                               </span>
                               {item.isLive && <span className="text-[9px] uppercase font-black text-white bg-red-600 px-2 py-0.5 rounded-md animate-pulse">Live</span>}
                               {(item.matchScore || item.match_score || item.smartMatch || item.smart_match) && (
                                 <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                   ⚡ {item.matchScore || item.match_score ? (item.matchScore || item.match_score) + '% Match' : 'Smart Match'}
                                 </span>
                               )}
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
                              <h4 className="font-serif font-bold text-base md:text-lg leading-tight text-text-primary group-hover:text-primary-blue transition-colors mb-1">{item.title}</h4>
                            </a>
                            <p className="text-xs text-text-secondary font-semibold">{item.organization || item.org}</p>
                          </div>
                       </div>

                       <p className="text-xs text-text-muted line-clamp-2 leading-relaxed mb-4">{item.description}</p>
                       
                       {(item.matchReason || item.match_reason) && (
                          <div className="bg-background border border-border-theme p-3 rounded-xl mb-4 flex items-start gap-2">
                             <Sparkles className="w-3.5 h-3.5 text-primary-blue shrink-0 mt-0.5" />
                             <p className="text-xs text-text-secondary">{item.matchReason || item.match_reason}</p>
                          </div>
                       )}

                       <div className="mt-auto pt-4 border-t border-border-theme flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-1.5">
                            {item.tags?.slice(0,2).map((t: string) => (
                              <span key={t} className="text-[10px] font-bold text-text-secondary bg-surface-secondary border border-border-theme px-2.5 py-1 rounded-full">{t}</span>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                             <button 
                               onClick={() => handleApplyAssist(item)}
                               className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border-theme text-text-secondary hover:bg-surface-secondary rounded-lg text-xs font-bold transition-colors cursor-pointer"
                             >
                               <FileText className="w-3.5 h-3.5" /> <span>Assist</span>
                             </button>
                             {(item.apply_link || item.applyLink) ? (
                               <a 
                                 href={item.apply_link || item.applyLink} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 onClick={() => trackInteraction(item.id, 'apply')}
                                 className="bg-primary-blue text-white px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider hover:bg-[#603620] transition-colors shadow-xs"
                               >
                                 Apply Now
                               </a>
                             ) : (
                               <div className="bg-surface-secondary border border-border-theme text-text-secondary px-3 py-1.5 rounded-lg text-xs font-bold">
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
              <div className="flex justify-center pt-6">
                <button 
                  onClick={handleLoadMore}
                  disabled={loadingMore || !hasNextPage}
                  className="bg-surface border border-border-theme text-text-primary px-6 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 hover:bg-surface-secondary transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {loadingMore ? (
                    <><div className="w-3.5 h-3.5 border-2 border-[#231f20] border-t-transparent rounded-full animate-spin"></div> Loading...</>
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
          <div className="bg-surface border border-border-theme rounded-2xl py-16 px-6 text-center shadow-xs">
            <div className="w-14 h-14 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-3 border border-border-theme">
               <Target className="w-7 h-7 text-primary-blue" />
            </div>
            <h3 className="text-lg font-serif font-bold text-text-primary mb-1">No matches found for your filter.</h3>
            <p className="text-xs text-text-muted max-w-md mx-auto mb-5">Run the Scout Protocol to force our system to aggressively match your profile against live opportunities.</p>
            <button onClick={() => setShowScoutModal(true)} className="bg-primary-blue hover:bg-[#603620] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer shadow-sm">
               Launch Scout Protocol
            </button>
          </div>
        )}
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
        <div className="fixed inset-0 bg-[#231f20]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in border border-border-theme">
            <div className="px-6 py-5 border-b border-border-theme flex justify-between items-center bg-background">
               <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-[#603620] text-[#f3e4bd] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                 </div>
                 <div>
                   <h3 className="text-base font-serif font-bold text-text-primary">AI Scout Protocol</h3>
                   <div className="flex items-center gap-2 mt-0.5">
                      <div className="h-1.5 w-16 bg-[#e8ded1] rounded-full overflow-hidden">
                         <div className="h-full bg-primary-blue rounded-full transition-all duration-500" style={{ width: `${(scoutStep / 4) * 100}%` }}></div>
                      </div>
                      <p className="text-[10px] text-text-secondary font-extrabold uppercase tracking-wider">Step {scoutStep} of 4</p>
                   </div>
                 </div>
               </div>
               <button onClick={() => setShowScoutModal(false)} className="w-8 h-8 rounded-full bg-surface border border-border-theme flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
               </button>
            </div>
            
            <div className="p-6">
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
                <div className="space-y-4 animate-fade-in">
                  <div>
                     <h4 className="text-lg font-serif font-bold text-text-primary mb-1">Technology Focus?</h4>
                     <p className="text-xs text-text-muted mb-4">Enter your primary technical interests separated by commas.</p>
                     <input type="text" placeholder="e.g. AI/ML, Web Dev, Finance..." 
                       className="w-full bg-background border border-border-theme rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-[#b56b37]/20 focus:border-primary-blue transition-all"
                       value={scoutData.tech}
                       onChange={e => setScoutData({...scoutData, tech: e.target.value})}
                       onKeyDown={e => { if (e.key === 'Enter') setScoutStep(4) }}
                     />
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                    <button onClick={() => setScoutStep(2)} className="text-xs font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">← Back</button>
                    <button onClick={() => setScoutStep(4)} className="bg-primary-blue text-white px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider hover:bg-[#603620] transition-colors cursor-pointer shadow-xs">Next Step →</button>
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

function MetricCard({ title, value, icon: Icon, subtitle, highlight = false }: any) {
  return (
    <div className={`border rounded-2xl p-5 shadow-xs transition-all ${highlight ? 'border-border-theme bg-gradient-to-br from-surface-secondary to-surface' : 'border-border-theme bg-surface'}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary">{title}</p>
          {subtitle && <p className="text-[10px] text-text-muted">{subtitle}</p>}
        </div>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${highlight ? 'bg-[#603620] text-[#f3e4bd]' : 'bg-surface-secondary text-primary-blue'}`}>
           <Icon className="w-4 h-4" />
        </div>
      </div>
      <h3 className={`text-2xl md:text-3xl font-serif font-bold tracking-tight mt-1 ${highlight ? 'text-primary-blue' : 'text-text-primary'}`}>{value}</h3>
    </div>
  );
}

function ScoutStep({ title, options, selected, onSelect, showBack }: any) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h4 className="text-lg font-serif font-bold text-text-primary mb-4">{title}</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {options.map((opt: string) => (
          <button 
            key={opt}
            onClick={() => onSelect(opt)}
            className={`px-3.5 py-3 text-xs font-bold rounded-xl border transition-all text-center cursor-pointer ${
              selected === opt 
                ? 'bg-surface-secondary text-primary-blue border-primary-blue font-extrabold shadow-xs' 
                : 'bg-surface text-text-secondary border-border-theme hover:border-primary-blue hover:bg-surface-secondary/50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {showBack && (
        <div className="pt-4 flex justify-start">
          <button onClick={showBack} className="text-xs font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer">← Back</button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, FileText, ChevronRight, Clock, ExternalLink, Zap, CheckCircle, Award, Bookmark, Shield, Sparkles, Building2, Coins, ArrowRight, Share2 } from 'lucide-react';
import { SEO } from '../SEO';
import { fetchOpportunityById, trackInteraction, predictEligibility, generateApplyAssistBackend, generateFlashcardsBackend, fetchSimilarOpportunities } from '../../services/apiClient';
import { CURATED_FALLBACKS } from '../../services/staticFallbacks';
import ShareModal from '../ui/ShareModal';
import ApplyAssistModal from '../ui/ApplyAssistModal';
import FlashcardModal from '../ui/FlashcardModal';
import { OpportunityCard } from '../OpportunityCard';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import ShareCalendarActions from '../ui/ShareCalendarActions';
import { ErrorState, LoadingState } from '../ui/states';
import OpportunityNotePanel from '../ui/OpportunityNotePanel';
import { useAppContext } from '../../context/AppContext';

export default function OpportunityDetail() {
  const { selectedOppId, clearSelectedOpportunity: onBack, profile, setProfile, viewOpportunity } = useAppContext();
  const id = selectedOppId || '';
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedOpps, setRelatedOpps] = useState<any[]>([]);
  const [shareOpp, setShareOpp] = useState<{title: string, link: string} | null>(null);

  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [eligibility, setEligibility] = useState<any>(null);
  const [eligibilityError, setEligibilityError] = useState<string | null>(null);

  const handleEligibilityCheck = async () => {
    if (!opp) return;
    const oppId = opp.id || opp._id;

    try {
      setEligibilityLoading(true);
      setEligibilityError(null);

      const result = await predictEligibility(
        oppId,
        profile,
        opp
      );

      setEligibility(result.prediction);
    } catch (error: any) {
      setEligibilityError(
        error.message || "Unable to calculate eligibility."
      );
    } finally {
      setEligibilityLoading(false);
    }
  };
  
  const isBookmarked = profile?.bookmarks?.includes(id);

  const toggleBookmark = async () => {
    if (!profile?.uid) return;
    try {
      const userRef = doc(db, 'users', profile.uid);
      if (isBookmarked) {
        await updateDoc(userRef, { bookmarks: arrayRemove(id) });
        if (setProfile) setProfile({ ...profile, bookmarks: profile.bookmarks.filter((b: string) => b !== id) });
      } else {
        await updateDoc(userRef, { bookmarks: arrayUnion(id) });
        if (setProfile) setProfile({ ...profile, bookmarks: [...(profile.bookmarks || []), id] });
      }
      trackInteraction(id, isBookmarked ? 'view' : 'save');
    } catch (e) {
      console.error(e);
    }
  };
  
  // Apply Assist State
  const [isAssistModalOpen, setIsAssistModalOpen] = useState(false);
  const [assistLoading, setAssistLoading] = useState(false);
  const [assistContent, setAssistContent] = useState<string | null>(null);

  // Flashcards State
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<any[]>([]);

  const handlePrepareMe = async () => {
    if (!opp) return;
    setIsFlashcardModalOpen(true);
    setFlashcardLoading(true);
    
    try {
      const jdText = opp.description || opp.title;
      const result = await generateFlashcardsBackend(jdText);
      setFlashcards(result);
    } catch (e) {
      console.error(e);
      // Fallback empty array handled in modal
      setFlashcards([]);
    } finally {
      setFlashcardLoading(false);
    }
  };

  // Helper to slugify opportunity title for SEO paths
  const slugify = (text: string): string => {
    return (text || "")
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  // Helper to resolve real official application URL (never dummy yuvahub.xyz)
  const getRealApplyUrl = (oppItem: any): string => {
    if (!oppItem) return "https://google.com";
    const rawUrl = oppItem.apply_link || oppItem.applyLink || oppItem.link || oppItem.url;
    if (rawUrl && typeof rawUrl === 'string' && !rawUrl.includes("yuvahub.xyz") && rawUrl.startsWith("http")) {
      return rawUrl;
    }
    
    // Static curated match check
    const staticMatch = CURATED_FALLBACKS.find(fb => 
      fb.id === oppItem.id || 
      (oppItem.title && oppItem.title.toLowerCase().includes(fb.title.toLowerCase().substring(0, 10)))
    );
    if (staticMatch && staticMatch.apply_link && !staticMatch.apply_link.includes("yuvahub.xyz")) {
      return staticMatch.apply_link;
    }

    const lowerTitle = (oppItem.title || "").toLowerCase();
    const lowerOrg = (oppItem.organization || oppItem.org || oppItem.source_name || "").toLowerCase();

    if (lowerTitle.includes("summer of code") || lowerTitle.includes("gsoc")) return "https://summerofcode.withgoogle.com";
    if (lowerTitle.includes("imagine cup")) return "https://imaginecup.microsoft.com";
    if (lowerTitle.includes("seed fund") || lowerTitle.includes("nsf")) return "https://seedfund.nsf.gov";
    if (lowerTitle.includes("mlh") || lowerTitle.includes("major league hacking")) return "https://mlh.io";
    if (lowerTitle.includes("reliance")) return "https://www.scholarships.reliancefoundation.org";
    if (lowerOrg.includes("google")) return "https://careers.google.com/students";
    if (lowerOrg.includes("microsoft")) return "https://careers.microsoft.com/students";

    // Direct Google search fallback for official application portal
    return `https://www.google.com/search?q=${encodeURIComponent((oppItem.title || "") + " " + (oppItem.organization || oppItem.org || "") + " official application portal")}`;
  };

  const loadOpp = async () => {
    setLoading(true);
    setError(null);

    try {
      const item = await fetchOpportunityById(id);
      if (item) {
        setOpp(item);
        trackInteraction(id, 'view');
        
        // Fetch related opportunities
        try {
          const results = await fetchSimilarOpportunities(item.id || item._id);
          if (results && results.items) {
            setRelatedOpps(results.items);
          }
        } catch (relatedErr) {
          console.warn("Could not load related opportunities", relatedErr);
        }
      } else {
        setOpp(null);
        setError('This opportunity is unavailable.');
      }
    } catch {
      setError('Unable to load this opportunity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOpp();
  }, [id]);

  const handleApplyAssist = async () => {
    if (!opp) return;
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

  if (loading) {
    return <LoadingState title="Loading opportunity" description="Fetching latest opportunity details." />;
  }

  if (error || !opp) {
    return (
      <div className="max-w-2xl mx-auto py-16 space-y-4">
        <ErrorState
          title="Opportunity unavailable"
          description={error || 'The requested opportunity could not be found.'}
          onRetry={() => void loadOpp()}
        />
        <div className="text-center">
          <button onClick={onBack} className="inline-flex items-center gap-2 px-5 py-2.5 border border-border-theme rounded-xl text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 text-primary-blue" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const cleanSlug = slugify(opp.title);
  const detailUrl = `${window.location.protocol}//${window.location.host}/opportunity/${opp.id}/${cleanSlug}`;
  const displayOrg = opp.org || opp.organization || opp.source_name || "Verified Partner";
  const realApplyUrl = getRealApplyUrl(opp);

  // Schema properties for browser SEO syncing
  const clientSchema = opp.category?.toLowerCase().includes('job') || opp.category?.toLowerCase().includes('internship') ? {
    "@type": "JobPosting",
    "title": opp.title,
    "description": opp.description,
    "employmentType": opp.category?.toLowerCase().includes('intern') ? "INTERN" : "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": displayOrg,
      "sameAs": realApplyUrl
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": opp.location || "Remote/Online",
        "addressCountry": "Global"
      }
    }
  } : {
    "@type": "Event",
    "name": opp.title,
    "description": opp.description,
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
    "location": {
      "@type": "VirtualLocation",
      "url": detailUrl
    },
    "organizer": {
      "@type": "Organization",
      "name": displayOrg
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 font-sans pb-16 px-2 sm:px-4">
      
      {/* Search Crawler Sync Component */}
      <SEO 
        title={`${opp.title} | ${displayOrg} | YuvaHub`}
        description={opp.description?.substring(0, 160) + "..."}
        url={detailUrl}
        structuredSchemaType={opp.category?.toLowerCase().includes('job') ? 'JobPosting' : 'Event'}
        schemaData={clientSchema}
      />

      {/* Navigation Header Bar - YuvaHub Brand Theme */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface dark:bg-slate-900 p-4 rounded-2xl border border-border-theme dark:border-slate-800 shadow-2xs">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 text-xs font-bold text-text-secondary dark:text-slate-300 hover:text-primary-blue transition-colors py-1.5 px-3 rounded-xl hover:bg-surface-secondary dark:hover:bg-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-primary-blue" /> Back to opportunities
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleBookmark}
            className={`inline-flex items-center gap-1.5 text-xs font-bold py-1.5 px-3 rounded-xl transition-all border ${
              isBookmarked 
                ? 'text-white bg-primary-blue border-primary-blue shadow-sm' 
                : 'text-text-secondary dark:text-slate-300 hover:text-primary-blue hover:bg-surface-secondary dark:hover:bg-slate-800 border-border-theme dark:border-slate-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} /> 
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <ShareCalendarActions
            title={opp.title}
            url={detailUrl}
            description={opp.description || 'View this opportunity on YuvaHub.'}
            location={opp.location || 'Remote / Online'}
            deadline={opp.deadline}
            onOpenFallback={() => setShareOpp({ title: opp.title, link: detailUrl })}
          />
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Primary Details Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-border-theme dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Header Metadata */}
            <header className="space-y-3 pb-6 border-b border-border-theme dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-[#603620] text-[#f3e4bd] text-xs font-extrabold rounded-lg uppercase tracking-wider">
                  {opp.category || opp.type || "Opportunity"}
                </span>

                {opp.verified !== false && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30 text-xs font-bold rounded-lg">
                    <Shield className="w-3.5 h-3.5 text-[#63703d] fill-[#63703d]/20" /> Verified Audit
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-serif font-bold text-text-primary dark:text-white leading-tight">
                {opp.title}
              </h1>

              <div className="flex items-center gap-2 pt-1">
                <Building2 className="w-4 h-4 text-primary-blue" />
                <span className="text-base font-bold text-text-secondary dark:text-slate-300">{displayOrg}</span>
              </div>
            </header>

            {/* Overview Body */}
            <article className="space-y-3">
              <h2 className="text-base font-serif font-bold text-text-primary dark:text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-blue" /> Executive Overview
              </h2>
              <p className="text-sm text-text-primary/90 dark:text-slate-300 leading-relaxed whitespace-pre-line text-justify font-medium">
                {opp.description || "Refer to the original portal post for detailed eligibility parameters and submission rules."}
              </p>
            </article>

            {/* Private Note Panel */}
            {isBookmarked && (
              <div className="pt-4 border-t border-border-theme dark:border-slate-800">
                <OpportunityNotePanel opportunityId={opp.id || opp._id} />
              </div>
            )}

            {/* Tagged Keywords */}
            {opp.tags && opp.tags.length > 0 && (
              <div className="space-y-2.5 pt-4 border-t border-border-theme dark:border-slate-800">
                <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">Tagged Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {opp.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-surface-secondary dark:bg-slate-800 border border-border-theme dark:border-slate-700 text-text-secondary dark:text-slate-300 text-xs font-semibold rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Apply Assistant Banner - YuvaHub Warm Gradient Theme */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#603620] via-[#482817] to-[#231f20] p-6 md:p-8 rounded-3xl text-white shadow-lg space-y-4 border border-border-theme">
            <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 pointer-events-none">
              <Zap className="w-48 h-48 text-[#f3e4bd]" />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f3e4bd]/20 text-[#f3e4bd] text-xs font-bold">
                <Zap className="w-3.5 h-3.5 text-[#f3e4bd]" /> AI-Powered Apply Assist
              </div>
              <h2 className="text-xl font-serif font-bold text-[#f3e4bd]">
                Stand Out With AI Application Assistance
              </h2>
              <p className="text-xs text-[#e8ded1] leading-relaxed max-w-xl">
                Let YuvaHub AI analyze your profile metadata ({profile?.name || "Student"}) and draft an optimized cover letter, application response, or submission checklist in seconds!
              </p>
              <div className="pt-2">
                <button 
                  onClick={handleApplyAssist}
                  className="px-5 py-2.5 bg-primary-blue hover:bg-[#96552a] text-white rounded-xl text-xs font-bold transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Initialize Assistant Draft
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-sm space-y-6 lg:sticky lg:top-6">
            <h3 className="text-sm font-bold text-text-primary dark:text-slate-100 uppercase tracking-wider border-b border-border-theme dark:border-slate-800 pb-3">
              Opportunity Details
            </h3>
            
            <div className="space-y-4 text-xs">
              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-surface-secondary dark:bg-slate-800 rounded-xl text-primary-blue">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Location / Venue</p>
                  <p className="font-bold text-text-primary dark:text-slate-200 mt-0.5">{opp.location || "Remote / Online"}</p>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-primary-blue/10 rounded-xl text-primary-blue">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Application Deadline</p>
                  <p className="font-bold text-primary-blue mt-0.5">{opp.deadline || "Active Listing"}</p>
                </div>
              </div>

              {/* Compensation / Stipend */}
              {opp.stipend && (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-[#63703d]/10 rounded-xl text-[#63703d]">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Stipend / Grant</p>
                    <p className="font-bold text-[#63703d] mt-0.5">{opp.stipend}</p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Eligibility Predictor Widget */}
            <div className="rounded-2xl border border-border-theme dark:border-slate-800 bg-background dark:bg-slate-800/50 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-text-primary dark:text-slate-100">AI Match Predictor</h4>
                  <p className="text-[11px] text-text-secondary dark:text-slate-400 font-medium">Evaluate match against your profile.</p>
                </div>

                <button
                  onClick={handleEligibilityCheck}
                  disabled={eligibilityLoading}
                  className="px-3 py-1.5 bg-[#63703d] hover:bg-[#4f5b2f] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {eligibilityLoading ? "Analyzing..." : "Check Match"}
                </button>
              </div>

              {eligibilityError && (
                <p className="text-xs text-red-600 font-medium">{eligibilityError}</p>
              )}

              {eligibility && (
                <div className="pt-2 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-primary">Success Score</span>
                    <span className="text-base text-[#63703d]">{eligibility.successScore}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#e8ded1] overflow-hidden">
                    <div className="h-full bg-[#63703d] transition-all" style={{ width: `${eligibility.successScore}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* PREPARE ME (AI) BUTTON */}
            <div className="pt-4 border-t border-border-theme dark:border-slate-800 space-y-2.5">
              <button 
                onClick={handlePrepareMe}
                className="w-full py-3.5 bg-surface-secondary dark:bg-slate-800 hover:bg-[#e8ded1] dark:hover:bg-slate-700 text-text-secondary dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all border border-border-theme dark:border-slate-700 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-primary-blue" />
                <span>Prepare Me (AI)</span>
              </button>
            </div>

            {/* DIRECT OFFICIAL APPLICATION BUTTON - ALWAYS REDIRECTS TO REAL PORTAL */}
            <div className="pt-4 border-t border-border-theme dark:border-slate-800 space-y-2.5">
              <a 
                href={realApplyUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => trackInteraction(opp.id, 'apply')}
                className="w-full py-3.5 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-[#b56b37]/20 uppercase tracking-wider cursor-pointer"
              >
                <span>Apply Directly</span>
                <ChevronRight className="w-4 h-4" />
              </a>
              <p className="text-[10px] text-text-muted text-center font-medium leading-normal">
                Opens certified official source portal directly in a new browser tab.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Opportunities Section */}
      {relatedOpps.length > 0 && (
        <section className="pt-8 border-t border-border-theme dark:border-slate-800">
          <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white mb-6">
            You might also like...
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {relatedOpps.map((item) => (
              <OpportunityCard 
                key={item.id} 
                opportunity={item} 
                onViewDetails={(id, title) => {
                  viewOpportunity(id, title);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Shared Modals */}
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
        opportunityTitle={opp.title}
      />

      <FlashcardModal
        isOpen={isFlashcardModalOpen}
        onClose={() => setIsFlashcardModalOpen(false)}
        isLoading={flashcardLoading}
        flashcards={flashcards}
        opportunityTitle={opp.title}
      />
    </div>
  );
}

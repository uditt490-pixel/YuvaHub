import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Share2, FileText, ChevronRight, Clock, ExternalLink, Zap, CheckCircle, Award, Bookmark } from 'lucide-react';
import { SEO } from '../SEO';
import { fetchOpportunityById, trackInteraction, generateApplyAssistBackend } from '../../services/apiClient';
import ShareModal from '../ui/ShareModal';
import ApplyAssistModal from '../ui/ApplyAssistModal';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ErrorState, LoadingState } from '../ui/states';

interface OpportunityDetailProps {
  id: string;
  onBack: () => void;
  profile: any;
  setProfile?: (p: any) => void;
}

export default function OpportunityDetail({ id, onBack, profile, setProfile }: OpportunityDetailProps) {
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpp, setShareOpp] = useState<{title: string, link: string} | null>(null);
  
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

  const loadOpp = async () => {
    setLoading(true);
    setError(null);

    try {
      const item = await fetchOpportunityById(id);
      if (item) {
        setOpp(item);
        trackInteraction(id, 'view');
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
    return <LoadingState title="Loading opportunity" description="Fetching the latest opportunity details." />;
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
          <button onClick={onBack} className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const cleanSlug = slugify(opp.title);
  const detailUrl = `${window.location.protocol}//${window.location.host}/opportunity/${opp.id}/${cleanSlug}`;
  const displayOrg = opp.org || opp.organization || "Curated Partner";

  // Schema properties for browser SEO syncing
  const clientSchema = opp.category?.toLowerCase().includes('job') || opp.category?.toLowerCase().includes('internship') ? {
    "@type": "JobPosting",
    "title": opp.title,
    "description": opp.description,
    "employmentType": opp.category?.toLowerCase().includes('intern') ? "INTERN" : "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": displayOrg,
      "sameAs": "https://yuvahub.xyz"
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
    <div className="max-w-5xl mx-auto space-y-6 px-4 md:px-0">
      
      {/* Search Crawler Sync Component */}
      <SEO 
        title={`${opp.title} | ${displayOrg} | YuvaHub`}
        description={opp.description?.substring(0, 160) + "..."}
        url={detailUrl}
        structuredSchemaType={opp.category?.toLowerCase().includes('job') ? 'JobPosting' : 'Event'}
        schemaData={clientSchema}
      />

      {/* Back Header Utility */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <button 
          onClick={onBack} 
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors py-1.5 px-3 rounded-md hover:bg-blue-50/50 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4.5 h-4.5" /> Back to opportunities
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleBookmark}
            className={`inline-flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-md transition-colors border ${isBookmarked ? 'text-white bg-blue-600 border-blue-600 hover:bg-blue-700' : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50 border-gray-200'}`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} /> {isBookmarked ? 'Saved' : 'Save'}
          </button>
          <button 
            onClick={() => setShareOpp({ title: opp.title, link: detailUrl })}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 py-1.5 px-3 rounded-md transition-colors border border-gray-200"
          >
            <Share2 className="w-4 h-4" /> Share URL
          </button>
        </div>
      </div>

      {/* Beautiful Bento / Grid Landing Style Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Left Detailed Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            
            {/* Semantic Title Pairings */}
            <header className="space-y-3 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-100/60 text-blue-700 text-xs font-bold rounded-md uppercase tracking-wider">
                  {opp.category || opp.type || "Live Opportunity"}
                </span>
                {opp.verified !== false && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-md">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3.5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                {opp.title}
              </h1>
              <p className="text-lg md:text-xl font-bold text-gray-600 hover:text-blue-600 transition-colors">
                {displayOrg}
              </p>
            </header>

            {/* Detailed Body description */}
            <article className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" /> Executive Overview
              </h2>
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                {opp.description || "Refer to original post for comprehensive details."}
              </p>
            </article>

            {/* Tags and fields */}
            {opp.tags && opp.tags.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tagged Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {opp.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 hover:bg-blue-50 border border-gray-200 text-gray-600 hover:text-blue-700 text-xs font-semibold rounded-md transition-all">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Apply Assistant Panel */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 rounded-2xl text-white shadow-md space-y-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4">
              <Zap className="w-48 h-48" />
            </div>
            <div className="relative">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 animate-pulse text-yellow-300" /> AI-Powered Apply Assist
              </h2>
              <p className="text-sm text-blue-100 mt-1 max-w-xl">
                Ready to stand out? Let our AI analyze your profile metadata ({profile?.name || "Student"}) and generate an optimized application letter, email, or checklist draft in under 15 seconds!
              </p>
              <div className="pt-4">
                <button 
                  onClick={handleApplyAssist}
                  className="px-5 py-2.5 bg-white text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-50 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> Initialize Assistant Draft
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Sticky Widget Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 lg:sticky lg:top-6">
            <h3 className="text-md font-bold text-gray-900 border-b border-gray-100 pb-3">Opportunity Details</h3>
            
            <div className="space-y-4">
              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Location / Venue</p>
                  <p className="text-sm font-bold text-gray-800">{opp.location || "Remote / Online Support"}</p>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Application Deadline</p>
                  <p className="text-sm font-bold text-red-600">{opp.deadline || "Rolling Applications"}</p>
                </div>
              </div>

              {/* Source verification */}
              {opp.source && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Original Source</p>
                    <p className="text-sm font-bold text-gray-700 truncate max-w-xs">{opp.source}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Immediate Action Buttons */}
            {opp.apply_link || opp.applyLink ? (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <a 
                  href={opp.apply_link || opp.applyLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={() => trackInteraction(opp.id, 'apply')}
                  className="w-full clean-btn flex items-center justify-center gap-2 py-3 shadow-md font-bold transition-all text-sm uppercase tracking-wide cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" /> Apply Directly <ChevronRight className="w-4 h-4 ml-0.5" />
                </a>
                <p className="text-[10px] text-gray-400 text-center font-medium">
                  By clicking, you will visit the certified original source portal in a new browser tab.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 text-yellow-800 border border-yellow-100 rounded-lg text-xs leading-relaxed">
                Applying is currently managed on the original host's server. Check back inside 24 hours.
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}

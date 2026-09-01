import React, { useEffect, useState } from 'react';
import { User, MapPin, Briefcase, GraduationCap, Github, Linkedin, Globe, Award, Target, ExternalLink, Loader2, Sparkles, ThumbsUp } from 'lucide-react';
import { SEO } from '../components/SEO';
import LoadingScreen from '../components/ui/LoadingScreen';
import { useAppContext } from '../context/AppContext';
import TestimonialWall from '../components/ui/TestimonialWall';

interface PublicProfileData {
  uid: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  college?: string;
  year?: string;
  field?: string;
  city?: string;
  state?: string;
  country?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  badges?: string[];
  points?: number;
}

export default function PublicPortfolio() {
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endorsements, setEndorsements] = useState<Record<string, number>>({});
  const [endorsing, setEndorsing] = useState<string | null>(null);
  const { user } = useAppContext();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const pathSegments = window.location.pathname.split('/');
        const uid = pathSegments[pathSegments.length - 1];
        
        if (!uid) {
          setError("Profile ID is missing.");
          return;
        }

        const res = await fetch(`/api/v1/public/profile/${uid}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Profile is private or does not exist.");
          } else {
            setError("Failed to load profile.");
          }
          return;
        }
        
        const data = await res.json();
        setProfile(data.data);
        
        // Fetch endorsements
        const endRes = await fetch(`/api/v1/endorsements?uid=${uid}`);
        if (endRes.ok) {
          const endData = await endRes.json();
          const endMap: Record<string, number> = {};
          endData.data?.received?.forEach((e: any) => {
            endMap[e.skill] = e.count;
          });
          setEndorsements(endMap);
        }
      } catch (err: any) {
        console.error("Failed to fetch public profile:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEndorse = async (skill: string) => {
    if (!user) {
      alert("Please login to endorse skills.");
      return;
    }
    
    setEndorsing(skill);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/v1/endorsements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUid: profile?.uid,
          skill
        })
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to endorse skill.");
      } else {
        setEndorsements(prev => ({
          ...prev,
          [skill]: (prev[skill] || 0) + 1
        }));
        // Trigger toast/animation for karma
        const ev = new CustomEvent("karmaAnimation", {
            detail: { amount: 5, reason: `Endorsed ${skill}` }
        });
        window.dispatchEvent(ev);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while endorsing.");
    } finally {
      setEndorsing(null);
    }
  };

  if (loading) {
    return <LoadingScreen fullScreen={true} />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-surface dark:bg-gray-800 rounded-3xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Unavailable</h2>
          <p className="text-gray-500 dark:text-gray-400">{error || "This profile is not accessible."}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-6 px-6 py-2.5 bg-primary-blue text-white rounded-xl font-bold hover:bg-[#603620] transition-colors cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const hasLocation = profile.city || profile.state || profile.country;
  const locationString = [profile.city, profile.state, profile.country].filter(Boolean).join(", ");
  const hasEducation = profile.college || profile.year || profile.field;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf9f2] to-white dark:from-gray-900 dark:to-gray-950 font-sans text-gray-900 dark:text-gray-100 selection:bg-primary-blue selection:text-white">
      <SEO 
        title={`${profile.name} | YuvaHub Portfolio`} 
        description={profile.bio || `Check out ${profile.name}'s YuvaHub portfolio.`}
        noindex={false}
      />
      
      {/* Navbar Minimal */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-surface/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-border-theme dark:border-gray-800 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 rounded-full bg-[#603620] flex items-center justify-center shadow-md">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#f3e4bd]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <span className="font-bold font-serif text-[17px] tracking-tight text-text-primary dark:text-white">
            Yuva<span className="text-primary-blue dark:text-blue-400 italic">Hub</span>
          </span>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="text-xs font-bold px-4 py-2 bg-surface-secondary dark:bg-gray-800 text-primary-blue dark:text-gray-300 rounded-full hover:bg-[#e8ded1] dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          Join YuvaHub
        </button>
      </nav>

      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-surface dark:bg-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm border border-border-theme dark:border-gray-700 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#f6efe2] to-transparent dark:from-gray-700/50 rounded-bl-full opacity-50 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 relative z-10">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-lg border-4 border-white dark:border-gray-700"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-[#b56b37] to-[#603620] flex items-center justify-center text-4xl font-bold text-white shadow-lg border-4 border-white dark:border-gray-700">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-text-primary dark:text-white mb-2">
                {profile.name}
              </h1>
              
              {profile.bio && (
                <p className="text-text-secondary dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-4 max-w-2xl">
                  {profile.bio}
                </p>
              )}
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5 text-sm text-text-muted dark:text-gray-400 font-medium mb-5">
                {hasLocation && (
                  <div className="flex items-center gap-1.5 bg-background dark:bg-gray-900 px-3 py-1.5 rounded-full border border-border-theme dark:border-gray-700">
                    <MapPin className="w-4 h-4 text-primary-blue" />
                    <span>{locationString}</span>
                  </div>
                )}
                {profile.points !== undefined && (
                  <div className="flex items-center gap-1.5 bg-background dark:bg-gray-900 px-3 py-1.5 rounded-full border border-border-theme dark:border-gray-700">
                    <Sparkles className="w-4 h-4 text-primary-blue" />
                    <span>{profile.points} Karma</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center justify-center sm:justify-start gap-3">
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-background dark:bg-gray-700 text-text-primary dark:text-white rounded-xl hover:bg-[#e8ded1] dark:hover:bg-gray-600 transition-colors tooltip cursor-pointer" aria-label="GitHub">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-background dark:bg-gray-700 text-[#0077b5] rounded-xl hover:bg-[#e8ded1] dark:hover:bg-gray-600 transition-colors tooltip cursor-pointer" aria-label="LinkedIn">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {profile.portfolioUrl && (
                  <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-background dark:bg-gray-700 text-primary-blue rounded-xl hover:bg-[#e8ded1] dark:hover:bg-gray-600 transition-colors tooltip cursor-pointer" aria-label="Portfolio">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          
          {/* Main Content (2/3 width on md) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-surface dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-border-theme dark:border-gray-700">
                <div className="flex items-center gap-3 mb-5">
                  <Target className="w-5 h-5 text-primary-blue" />
                  <h3 className="text-xl font-serif font-bold text-text-primary dark:text-white">Technical Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <div 
                      key={idx} 
                      className="group flex items-center bg-surface-secondary dark:bg-gray-700 rounded-full border border-transparent hover:border-primary-blue transition-all overflow-hidden"
                    >
                      <span className="px-3.5 py-1.5 text-text-secondary dark:text-gray-300 text-xs font-bold tracking-wide border-r border-border-theme dark:border-gray-600">
                        {skill}
                        {endorsements[skill] > 0 && (
                          <span className="ml-1.5 bg-primary-blue text-white px-1.5 py-0.5 rounded-full text-[10px]">
                            {endorsements[skill]}
                          </span>
                        )}
                      </span>
                      {user && user.uid !== profile.uid && (
                        <button 
                          onClick={() => handleEndorse(skill)}
                          disabled={endorsing === skill}
                          className="px-3 py-1.5 bg-surface-secondary dark:bg-gray-700 hover:bg-[#e8ded1] dark:hover:bg-gray-600 text-primary-blue text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          title="Endorse this skill"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="hidden group-hover:inline">Endorse</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note about private info */}
            <div className="bg-background dark:bg-gray-800/50 rounded-2xl p-5 border border-border-theme dark:border-gray-700 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-secondary dark:bg-gray-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-primary-blue" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary dark:text-white mb-1">Authenticated YuvaHub Member</h4>
                <p className="text-xs text-text-muted dark:text-gray-400">
                  This is a verified YuvaHub profile. Certain sensitive information (like email address, private projects, and internal network stats) is hidden to protect user privacy.
                </p>
              </div>
            </div>

          </div>

          {/* Sidebar (1/3 width on md) */}
          <div className="space-y-6">
            
            {/* Education */}
            {hasEducation && (
              <div className="bg-surface dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-border-theme dark:border-gray-700">
                <div className="flex items-center gap-3 mb-5">
                  <GraduationCap className="w-5 h-5 text-primary-blue" />
                  <h3 className="text-lg font-serif font-bold text-text-primary dark:text-white">Education</h3>
                </div>
                <div className="space-y-4">
                  {profile.college && (
                    <div>
                      <p className="text-xs text-text-muted dark:text-gray-500 font-bold uppercase tracking-wider mb-1">University / College</p>
                      <p className="text-sm font-semibold text-text-primary dark:text-white">{profile.college}</p>
                    </div>
                  )}
                  {profile.field && (
                    <div>
                      <p className="text-xs text-text-muted dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Major / Field</p>
                      <p className="text-sm font-semibold text-text-primary dark:text-white">{profile.field}</p>
                    </div>
                  )}
                  {profile.year && (
                    <div>
                      <p className="text-xs text-text-muted dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Graduation Year</p>
                      <p className="text-sm font-semibold text-text-primary dark:text-white">{profile.year}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Badges / Achievements */}
            {profile.badges && profile.badges.length > 0 && (
              <div className="bg-surface dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-border-theme dark:border-gray-700">
                <div className="flex items-center gap-3 mb-5">
                  <Award className="w-5 h-5 text-primary-blue" />
                  <h3 className="text-lg font-serif font-bold text-text-primary dark:text-white">Badges</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {profile.badges.map((badge, idx) => (
                    <div 
                      key={idx} 
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 flex items-center justify-center text-xl shadow-sm tooltip"
                      title={badge}
                    >
                      🏆
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Testimonial Wall */}
        <TestimonialWall targetUid={profile.uid} />

      </main>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Globe, PlusCircle, Users, User, Menu, X, Github, Linkedin, Instagram, Twitter, Bell, MessageSquare, Settings, Activity, Bookmark, Sparkles, BrainCircuit } from 'lucide-react';
import { auth, signInWithGoogle, logout, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { UserProfile } from './types';
import { fetchSystemStats } from './services/apiClient';

// Tab/View Components
import Dashboard from './components/Tabs/Dashboard';
import Opportunities from './components/Tabs/Opportunities';
import SubmitOpportunity from './components/Tabs/SubmitOpportunity';
import Mentorship from './components/Tabs/Mentorship';
import Profile from './components/Tabs/Profile';
import Community from './components/Tabs/Community';
import Bookmarks from './components/Tabs/Bookmarks';
import SettingsTab from './components/Tabs/Settings';
import AdminDashboard from './components/Admin/AdminDashboard';
import NotificationDropdown from './components/ui/NotificationDropdown';
import { OfflineBanner } from './components/ui/states';
import OpportunityDetail from './components/Tabs/OpportunityDetail';
import AIAssistant from './components/Tabs/AIAssistant';

import SplashAuth from './components/SplashAuth';
import OnboardingFlow from './components/OnboardingFlow';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendReady, setBackendReady] = useState(false);
  const [offlineBannerDismissed, setOfflineBannerDismissed] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleTimeString());
  const [appSearchQuery, setAppSearchQuery] = useState('');

  // Dynamic Routing state based on the HTML5 History API (perfect crawlability)
  const [selectedOppId, setSelectedOppId] = useState<string | null>(() => {
    const oppMatch = window.location.pathname.match(/^\/opportunity\/([^/]+)/);
    return oppMatch ? oppMatch[1] : null;
  });

  // WebMCP Integration
  useEffect(() => {
    let abortController: AbortController | null = null;
    if (typeof navigator !== 'undefined' && 'modelContext' in navigator) {
      const mc = (navigator as any).modelContext;
      const toolDef = {
        name: "search_opportunities",
        description: "Search for opportunities on YuvaHub",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" }
          }
        },
        execute: async (args: any) => {
          setActiveTab('opportunities');
          if (args && args.query) {
            setAppSearchQuery(args.query);
          }
          return "Search executed. View updated in UI.";
        }
      };

      if (typeof mc.provideContext === 'function') {
        mc.provideContext({ tools: [toolDef] });
      }

      if (typeof mc.registerTool === 'function') {
        abortController = new AbortController();
        mc.registerTool(toolDef, { signal: abortController.signal });
      }
    }
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, []);

  // Track popstate changes (back and forward buttons on browsers)
  useEffect(() => {
    const handleLocationChange = () => {
      const oppMatch = window.location.pathname.match(/^\/opportunity\/([^/]+)/);
      if (oppMatch) {
         setSelectedOppId(oppMatch[1]);
      } else {
         setSelectedOppId(null);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const viewOpportunity = (id: string, title?: string) => {
    const cleanTitle = title 
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
      : "view";
    window.history.pushState(null, '', `/opportunity/${id}/${cleanTitle}`);
    setSelectedOppId(id);
  };

  const clearSelectedOpportunity = () => {
    window.history.pushState(null, '', '/');
    setSelectedOppId(null);
  };

  useEffect(() => {
    const verifyFeedEndpoint = async () => {
      console.log("=== STARTING /api/v1/opportunities INTEGRITY VERIFICATION ===");
      try {
        const response = await fetch("/api/v1/opportunities");
        console.log(`[Verify Feed] Status: ${response.status} (${response.statusText})`);
        console.log(`[Verify Feed] Headers:`, [...response.headers.entries()]);
        
        const text = await response.text();
        console.log(`[Verify Feed] Raw Response Snippet:`, text.slice(0, 1000));
        
        try {
          const parsed = JSON.parse(text);
          console.log(`[Verify Feed] Parsed JSON Successfully! Total items:`, parsed.items?.length || 0);
          console.log(`[Verify Feed] Response Body Object:`, parsed);
        } catch (jsonErr) {
          console.warn(`[Verify Feed] Response is not valid JSON string:`, jsonErr);
        }
      } catch (err) {
        console.error(`[Verify Feed] Network/Operational Error during fetch execution:`, err);
      }
      console.log("=== END OF /api/v1/opportunities INTEGRITY VERIFICATION ===");
    };

    verifyFeedEndpoint();

    const checkBackend = async () => {
      const stats = await fetchSystemStats();
      if (stats) {
        setBackendReady(true);
        setLastSyncedTime(new Date().toLocaleTimeString());
      } else {
        setBackendReady(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (backendReady) {
      setOfflineBannerDismissed(false);
    }
  }, [backendReady]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile({
              uid: currentUser.uid,
              name: currentUser.displayName || '',
              email: currentUser.email || ''
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile({
            uid: currentUser.uid,
            name: currentUser.displayName || '',
            email: currentUser.email || ''
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'opportunities', label: 'Opportunities', icon: Globe },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    { id: 'ai_assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'submit', label: 'Submit Opportunity', icon: PlusCircle },
    { id: 'mentorship', label: 'Mentorship', icon: Users },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    ...(user?.email === 'uditt490@gmail.com' ? [{ id: 'admin', label: 'Admin', icon: Activity }] : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} profile={profile} onViewDetails={viewOpportunity} />;
      case 'opportunities': return (
        <Opportunities 
          user={user} 
          profile={profile} 
          onViewDetails={viewOpportunity} 
          searchQuery={appSearchQuery}
          setSearchQuery={setAppSearchQuery}
        />
      );
      case 'bookmarks': return <Bookmarks user={user} profile={profile} onViewDetails={viewOpportunity} />;
      case 'ai_assistant': return <AIAssistant user={user} profile={profile} />;
      case 'submit': return <SubmitOpportunity user={user} />;
      case 'mentorship': return <Mentorship user={user} />;
      case 'community': return <Community user={user} profile={profile} />;
      case 'profile': return <Profile user={user} profile={profile} setProfile={setProfile} />;
      case 'settings': return <SettingsTab user={user} profile={profile} />;
      case 'admin': return <AdminDashboard />;
      default: return <Dashboard user={user} profile={profile} onViewDetails={viewOpportunity} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6">
        <div className="flex items-center gap-3 animate-pulse">
           <div className="w-12 h-12 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/20">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
           </div>
           <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
             Yuva<span className="text-[#2563EB]">Hub</span>
           </h1>
        </div>
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <SplashAuth />;
  }

  if (profile && profile.onboarded === false && user.email !== "uditt490@gmail.com") {
      // Allow admin email to bypass or onboard
  }

  // Ensure they are onboarded or we show the onboarding flow
  if (user && profile && !profile.onboarded) {
    return <OnboardingFlow user={user} profile={profile} onComplete={(updated) => setProfile(updated)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* Sidebar Desktop - Fixed 220px */}
      <aside className="hidden lg:flex w-55 border-r border-[#E2E8F0] flex-col bg-white z-10 shrink-0 relative">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            YuvaHub
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id && !selectedOppId;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  clearSelectedOpportunity();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg ${isActive ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'}`}
                style={{ borderLeftWidth: isActive ? '4px' : '0px', paddingLeft: isActive ? '12px' : '16px' }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          {user ? (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-gray-500 font-medium truncate px-2">{user.email}</span>
              <button onClick={logout} className="clean-btn-outline w-full py-2 text-sm">Logout</button>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="clean-btn w-full py-3 text-sm flex items-center justify-center gap-2">
               Sign in with Google
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-gray-200 bg-white z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            YuvaHub
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationDropdown profile={profile} />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 hover:text-gray-900">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-40 p-4 border-b border-gray-200 overflow-y-auto">
          <nav className="space-y-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && !selectedOppId;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    clearSelectedOpportunity();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-medium transition-all rounded-lg ${isActive ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
            <div className="pt-6 mt-6 border-t border-gray-100">
              {user ? (
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="clean-btn-outline w-full py-3 text-sm">Logout</button>
              ) : (
                <button onClick={() => { signInWithGoogle(); setIsMobileMenuOpen(false); }} className="clean-btn w-full py-3 text-sm">Sign in with Google</button>
              )
              }
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col pt-16 lg:pt-0 h-screen overflow-hidden relative">
        
        {/* Topbar */}
        <div className="hidden lg:flex h-[60px] border-b border-[#E2E8F0] bg-white items-center justify-between px-6 shrink-0">
           <div className="flex-1 max-w-[500px] ml-8 mr-8">
              {activeTab === 'opportunities' ? (
                 <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                       {/* SVG Icon using Lucide is imported as Search? Wait, I don't want to break imports, I'll use simple search icon. */}
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <input type="text" placeholder="Search standard competitions..." className="w-full bg-[#F8FAFC] border border-gray-200 outline-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={appSearchQuery} onChange={(e) => setAppSearchQuery(e.target.value)} />
                 </div>
              ) : (
                 <p className="text-sm text-[#64748B] font-medium">
                   {selectedOppId 
                     ? "Detail Overview" 
                     : (user ? `Welcome back, ${profile?.name || user.displayName || 'Student'}` : 'Welcome to YuvaHub')
                   }
                 </p>
              )}
           </div>
           <div className="flex items-center gap-5">
              <NotificationDropdown profile={profile} />
              <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U')}
              </div>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto no-scrollbar pb-24" id="app-content">
          {selectedOppId ? (
            <OpportunityDetail 
              id={selectedOppId} 
              onBack={clearSelectedOpportunity} 
              profile={profile} 
              setProfile={setProfile}
            />
          ) : (
            renderContent()
          )}
        </div>
        
        {/* Live Feed Strip Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 text-gray-400 text-xs py-2 px-6 flex items-center justify-center gap-2 border-t border-gray-800 z-20">
          <span className={`${backendReady ? 'text-green-400' : 'text-red-400'} animate-pulse`}>●</span> 
          <span className="font-medium">{backendReady ? 'Live' : 'Offline'}</span>
          <span className="hidden sm:inline">· Last synced: {lastSyncedTime}</span>
          <span>· Opportunities indexed & verified</span>
          <span className="hidden md:inline">· YuvaHub © 2026</span>
        </div>
      </main>

    </div>
  );
}

export default App;

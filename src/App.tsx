import React, { useEffect } from 'react';
import { LayoutDashboard, Globe, PlusCircle, Users, User, Menu, X, Activity, Bookmark, Sparkles, MessageSquare, Settings, Sun, Moon } from 'lucide-react';
import { signInWithGoogle, logout } from './lib/firebase';
import { UserProfile } from './types';
import { useAppContext } from './context/AppContext';
import { scrollContentToTop } from './lib/smoothScroll';
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
import OpportunityDetail from './components/Tabs/OpportunityDetail';
import AIAssistant from './components/Tabs/AIAssistant';
import BackToTopButton from './components/ui/BackToTopButton';import OnboardingFlow from './components/OnboardingFlow';
import SplashAuth from './components/SplashAuth';
import Security from './components/Tabs/Security';
import Legal from './components/Tabs/Legal';
import Support from './components/Tabs/Support';
import HelpCenter from './components/Tabs/HelpCenter';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Guidelines from './pages/Guidelines';
import About from './pages/About';
import AboutTab from './components/Tabs/About';
import HelpCenterPage from './pages/HelpCenter';
import GettingStartedDetail from './pages/GettingStartedDetail';
import { SEO } from './components/SEO';

const PUBLIC_TABS = ['opportunities', 'about', 'privacy', 'terms', 'cookies', 'guidelines', 'security', 'support', 'legal'];

const getSeoPropsForTab = (tab: string) => {
  switch (tab) {
    case 'dashboard':
      return {
        title: "YuvaHub | Find Student Hackathons, Scholarships & Mentorships",
        description: "Discovery platform for Indian students. Find hackathons, scholarships, and mentorship opportunities to boost your career. Real-time updates and AI matching."
      };
    case 'opportunities':
      return {
        title: "Explore Opportunities | Internships, Jobs & Hackathons | YuvaHub",
        description: "Discover and apply to the latest internships, entry-level jobs, hackathons, and scholarships for Indian students. Real-time updates and AI matching."
      };
    case 'about':
      return {
        title: "About Us | Empowering Student Careers | YuvaHub",
        description: "Learn about YuvaHub's mission to connect Indian students with life-changing hackathons, scholarships, internships, and mentors."
      };
    case 'privacy':
      return {
        title: "Privacy Policy | YuvaHub",
        description: "Read the YuvaHub Privacy Policy to understand how we protect, handle, and secure your personal information."
      };
    case 'terms':
      return {
        title: "Terms of Service | YuvaHub",
        description: "Review the Terms of Service and guidelines for using the YuvaHub platform."
      };
    case 'cookies':
      return {
        title: "Cookie Policy | YuvaHub",
        description: "Learn how YuvaHub uses cookies and tracking technologies to optimize your experience."
      };
    case 'guidelines':
      return {
        title: "Community Guidelines | YuvaHub",
        description: "Review the YuvaHub Community Guidelines to help build a safe, respectful, and professional student network."
      };
    case 'security':
      return {
        title: "Security Center | YuvaHub",
        description: "Learn about YuvaHub's security practices, data encryption, and account protection measures."
      };
    case 'support':
      return {
        title: "Support & Feedback | YuvaHub",
        description: "Need help? Contact the YuvaHub support team or submit feedback to help us improve the platform."
      };
    case 'legal':
      return {
        title: "Legal Index | YuvaHub",
        description: "Access YuvaHub's legal index containing all terms, privacy policies, cookie policies, and community guidelines."
      };
    // Private tabs
    case 'bookmarks':
      return { title: "My Bookmarks | YuvaHub", description: "View your bookmarked student opportunities on YuvaHub." };
    case 'submit':
      return { title: "Submit Opportunity | YuvaHub", description: "Share a student opportunity, hackathon, internship, or scholarship with the YuvaHub community." };
    case 'mentorship':
      return { title: "AI Mentorship | YuvaHub", description: "Receive AI-driven career guidance and mentorship plans on YuvaHub." };
    case 'community':
      return { title: "Community Forum | YuvaHub", description: "Participate in discussions and share resources with other ambitious students on YuvaHub." };
    case 'profile':
      return { title: "My Profile | YuvaHub", description: "Manage your student profile, skills, education, and resumes on YuvaHub." };
    case 'settings':
      return { title: "Settings | YuvaHub", description: "Adjust your account configurations and platform settings on YuvaHub." };
    case 'admin':
      return { title: "Admin Dashboard | YuvaHub", description: "YuvaHub administrative operations control panel." };
    case 'ai_assistant':
      return { title: "AI Assistant | YuvaHub", description: "Interact with our intelligent career assistant for optimization and guidance." };
    default:
      return {
        title: "YuvaHub | Find Student Hackathons, Scholarships & Mentorships",
        description: "Discovery platform for Indian students. Find hackathons, scholarships, and mentorship opportunities to boost your career. Real-time updates and AI matching."
      };
  }
};

function App() {
  const {
    activeTab,
    setActiveTab,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    user,
    profile,
    setProfile,
    loading,
    backendReady,
    lastSyncedTime,
    appSearchQuery,
    setAppSearchQuery,
    selectedOppId,
    clearSelectedOpportunity,
    theme,
    toggleTheme,
    gettingStartedStep,
    setGettingStartedStep
  } = useAppContext();

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
  }, [setActiveTab, setAppSearchQuery]);

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
      case 'dashboard': return <Dashboard />;
      case 'opportunities': return <Opportunities />;
      case 'bookmarks': return <Bookmarks />;
      case 'ai_assistant': return <AIAssistant />;
      case 'submit': return <SubmitOpportunity />;
      case 'mentorship': return <Mentorship />;
      case 'community': return <Community />;
      case 'profile': return <Profile />;
      case 'settings': return <SettingsTab />;
      case 'admin': return <AdminDashboard />;
      case 'security': return <Security />;
      case 'privacy': return <Privacy />;
      case 'terms': return <Terms />;
      case 'cookies': return <Cookies />;
      case 'guidelines': return <Guidelines />;
      case 'legal': return <Legal />;
      case 'support': return <Support />;
      case 'about': return <AboutTab />;
      case 'help': return gettingStartedStep ? <GettingStartedDetail stepId={gettingStartedStep as any} /> : <HelpCenterPage />;
      default: return <Dashboard />;
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

  const isPublicRoute = selectedOppId || PUBLIC_TABS.includes(activeTab);

  if (!user && isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans">
        {/* Public Header */}
        <header className="sticky top-0 z-50 h-[60px] bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { clearSelectedOpportunity(); setActiveTab('dashboard'); }}>
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <span className="font-bold text-[17px] tracking-tight text-gray-900 dark:text-white">YuvaHub</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-[14px] font-medium text-gray-600 dark:text-gray-300">
            <button onClick={() => { clearSelectedOpportunity(); setActiveTab('opportunities'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">Opportunities</button>
            <button onClick={() => { clearSelectedOpportunity(); setActiveTab('about'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">About Us</button>
            <button onClick={() => { clearSelectedOpportunity(); setActiveTab('legal'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">Legal Index</button>
            <button onClick={() => { clearSelectedOpportunity(); setActiveTab('support'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">Support</button>
          </nav>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={signInWithGoogle} className="px-5 py-2 text-[14px] font-medium bg-blue-600 text-white rounded-[8px] hover:bg-blue-700 transition-colors cursor-pointer">
              Login
            </button>
          </div>
        </header>

        {/* Centralized SEO component for public pages */}
        {selectedOppId ? null : (
          <SEO 
            title={getSeoPropsForTab(activeTab).title}
            description={getSeoPropsForTab(activeTab).description}
            noindex={false}
          />
        )}

        {/* Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-20">
          <div className="mb-6">
            <button 
              onClick={() => { clearSelectedOpportunity(); setActiveTab('dashboard'); }} 
              className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              ← Back to Home
            </button>
          </div>
          {selectedOppId ? (
            <OpportunityDetail />
          ) : (
            renderContent()
          )}
        </main>

        {/* Public Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-250 dark:border-gray-700 py-8 px-6 lg:px-12 mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[13px] text-gray-500 dark:text-gray-400">&copy; 2026 YuvaHub Inc. All rights reserved.</span>
            <div className="flex flex-wrap gap-6 text-[13px] text-gray-500 dark:text-gray-400">
              <button onClick={() => { clearSelectedOpportunity(); setActiveTab('about'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">About Us</button>
              <button onClick={() => { clearSelectedOpportunity(); setActiveTab('privacy'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">Privacy Policy</button>
              <button onClick={() => { clearSelectedOpportunity(); setActiveTab('terms'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">Terms of Service</button>
              <button onClick={() => { clearSelectedOpportunity(); setActiveTab('cookies'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">Cookie Policy</button>
              <button onClick={() => { clearSelectedOpportunity(); setActiveTab('guidelines'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">Guidelines</button>
              <button onClick={() => { clearSelectedOpportunity(); setActiveTab('security'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">Security</button>
              <button onClick={() => { clearSelectedOpportunity(); setActiveTab('support'); }} className="hover:text-blue-600 dark:hover:text-blue-400 bg-transparent border-none cursor-pointer">Support</button>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (!user) {
    return <SplashAuth />;
  }

  // Ensure they are onboarded or we show the onboarding flow
  if (user && profile && !profile.onboarded) {
    return <OnboardingFlow user={user} profile={profile} onComplete={(updated) => setProfile(updated)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden dark:bg-gray-900 dark:text-gray-100">
      {/* Centralized SEO component for logged-in views */}
      {selectedOppId ? null : (
        <SEO 
          title={getSeoPropsForTab(activeTab).title}
          description={getSeoPropsForTab(activeTab).description}
          noindex={!PUBLIC_TABS.includes(activeTab)}
        />
      )}
      
      {/* Sidebar Desktop - Fixed 220px */}
      <aside className="hidden lg:flex w-55 border-r border-[#E2E8F0] dark:border-gray-700 flex-col bg-white dark:bg-gray-800 z-10 shrink-0 relative">
        <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
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
                  // Clear getting-started step when navigating away from help
                  if (tab.id !== 'help') setGettingStartedStep(null);
                  clearSelectedOpportunity();
                  scrollContentToTop();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-lg ${isActive ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border-l-4 border-transparent'}`}
                style={{ borderLeftWidth: isActive ? '4px' : '0px', paddingLeft: isActive ? '12px' : '16px' }}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            )
          })}
        </nav>
        <div className="px-4 pt-4">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-400" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          {user ? (
            <div className="flex flex-col gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate px-2">{user.email}</span>
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
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            YuvaHub
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationDropdown profile={profile} />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white dark:bg-gray-900 z-40 p-4 border-b border-gray-200 dark:border-gray-700 overflow-y-auto">
          <nav className="space-y-2">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && !selectedOppId;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    // Clear getting-started step when navigating away from help
                    if (tab.id !== 'help') setGettingStartedStep(null);
                    clearSelectedOpportunity();
                    setIsMobileMenuOpen(false);
                    scrollContentToTop();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-medium transition-all rounded-lg ${isActive ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent'}`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              )
            })}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-4 text-sm font-medium rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
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
        <div className="hidden lg:flex h-[60px] border-b border-[#E2E8F0] dark:border-gray-700 bg-white dark:bg-gray-800 items-center justify-between px-6 shrink-0">
           <div className="flex-1 max-w-[500px] ml-8 mr-8">
              {activeTab === 'opportunities' ? (
                 <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <input type="text" placeholder="Search standard competitions..." className="w-full bg-[#F8FAFC] dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={appSearchQuery} onChange={(e) => setAppSearchQuery(e.target.value)} />
                 </div>
              ) : (
                 <p className="text-sm text-[#64748B] dark:text-gray-400 font-medium">
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

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto no-scrollbar pb-24" id="app-content">
          {selectedOppId ? (
            <OpportunityDetail />
          ) : (
            renderContent()
          )}
        </div>

        <BackToTopButton />

        {/* Live Feed Strip Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 text-gray-400 text-xs py-2 px-6 flex items-center justify-center gap-2 border-t border-gray-800 z-20">
          <span className={`${backendReady ? 'text-green-400' : 'text-red-400'} animate-pulse`}>●</span> 
          <span className="font-medium">{backendReady ? 'Live' : 'Offline'}</span>
          <span className="hidden sm:inline">· Last synced: {lastSyncedTime}</span>
          <span>· Opportunities indexed & verified</span>
          <span className="hidden md:inline">· YuvaHub © 2026 · <button onClick={() => setActiveTab('about')} className="hover:underline hover:text-white cursor-pointer font-medium bg-transparent border-none p-0 text-xs text-gray-400">About</button> · <button onClick={() => setActiveTab('privacy')} className="hover:underline hover:text-white cursor-pointer font-medium bg-transparent border-none p-0 text-xs text-gray-450 font-medium font-semibold">Privacy Policy</button> · <button onClick={() => setActiveTab('terms')} className="hover:underline hover:text-white cursor-pointer font-medium bg-transparent border-none p-0 text-xs text-gray-450 font-medium font-semibold">Terms of Service</button> · <button onClick={() => setActiveTab('cookies')} className="hover:underline hover:text-white cursor-pointer font-medium bg-transparent border-none p-0 text-xs text-gray-450 font-medium">Cookie Policy</button> · <button onClick={() => setActiveTab('guidelines')} className="hover:underline hover:text-white cursor-pointer font-medium bg-transparent border-none p-0 text-xs text-gray-450 font-medium">Guidelines</button> · <button onClick={() => setActiveTab('legal')} className="hover:underline hover:text-white cursor-pointer font-medium bg-transparent border-none p-0 text-xs text-gray-400">Legal Index</button> · <button onClick={() => setActiveTab('security')} className="hover:underline hover:text-white cursor-pointer font-medium bg-transparent border-none p-0 text-xs text-gray-400">Security Center</button> · <button onClick={() => setActiveTab('help')} className="hover:underline hover:text-white cursor-pointer font-medium bg-transparent border-none p-0 text-xs text-gray-400">Help Center</button></span>
        </div>
      </main>

    </div>
  );
}

export default App;
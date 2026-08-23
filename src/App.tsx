import React, { useState, useEffect, lazy, Suspense } from 'react';
import {
  LayoutDashboard, Globe, PlusCircle, Users, User, Menu, X, Bookmark, Sparkles, MessageSquare, Settings, Sun, Moon, Mic, Trophy,
  Brain, TrendingUp, FileText, Video, FolderGit2, GraduationCap, Coins, Code2, Building2, Award, Cpu, Terminal, ShieldCheck, ShieldAlert, Briefcase, Clock, BookOpen, Target, Calendar, Activity
} from 'lucide-react';
import { signInWithGoogle, logout } from './lib/firebase';
import { UserProfile } from './types';
import { useAppContext } from './context/AppContext';
import { useSocket } from './context/SocketContext';
import { scrollContentToTop } from './lib/smoothScroll';
import { SEO } from './components/SEO';
import LoadingScreen from './components/ui/LoadingScreen';
import NotificationDropdown from './components/ui/NotificationDropdown';
import BackToTopButton from './components/ui/BackToTopButton';
import AccessibilityEnhancer from './components/accessibility/AccessibilityEnhancer';

// Route components are lazy-loaded to reduce the initial bundle size (code splitting)
const Dashboard = lazy(() => import('./components/tabs/Dashboard'));
const Opportunities = lazy(() => import('./components/tabs/Opportunities'));
const SubmitOpportunity = lazy(() => import('./components/tabs/SubmitOpportunity'));
const Mentorship = lazy(() => import('./components/tabs/Mentorship'));
const Profile = lazy(() => import('./components/tabs/Profile'));
const Community = lazy(() => import('./components/tabs/Community'));
const Bookmarks = lazy(() => import('./components/tabs/Bookmarks'));
const SettingsTab = lazy(() => import('./components/tabs/Settings'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const OpportunityDetail = lazy(() => import('./components/tabs/OpportunityDetail'));
const AIAssistant = lazy(() => import('./components/tabs/AIAssistant'));
const OnboardingFlow = lazy(() => import('./components/OnboardingFlow'));
const SplashAuth = lazy(() => import('./components/SplashAuth'));
const Security = lazy(() => import('./components/tabs/Security'));
const Legal = lazy(() => import('./components/tabs/Legal'));
const Support = lazy(() => import('./components/tabs/Support'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Cookies = lazy(() => import('./pages/Cookies'));
const Guidelines = lazy(() => import('./components/tabs/Guidelines'));
const AboutTab = lazy(() => import('./components/tabs/About'));
const HelpCenterPage = lazy(() => import('./pages/HelpCenter'));
const GettingStartedDetail = lazy(() => import('./pages/GettingStartedDetail'));
const BountyBoard = lazy(() => import('./components/tabs/BountyBoard'));
const AuthSecurityCenter = lazy(() => import('./components/tabs/AuthSecurityCenter'));
const CareerMatchStudio = lazy(() => import('./components/tabs/CareerMatchStudio'));
const HackathonStudio = lazy(() => import('./components/tabs/HackathonStudio'));
const DeveloperApiPortal = lazy(() => import('./components/tabs/DeveloperApiPortal'));
const GrantFellowshipStudio = lazy(() => import('./components/tabs/GrantFellowshipStudio'));
const CampusAlumniHub = lazy(() => import('./components/tabs/CampusAlumniHub'));
const ResumeAtsStudio = lazy(() => import('./components/tabs/ResumeAtsStudio'));
const SkillGapStudio = lazy(() => import('./components/tabs/SkillGapStudio'));
const InterviewPrepStudio = lazy(() => import('./components/tabs/InterviewPrepStudio'));
const OpenSourceBountyStudio = lazy(() => import('./components/tabs/OpenSourceBountyStudio'));
const OpportunityMatchStudio = lazy(() => import('./components/tabs/OpportunityMatchStudio'));
const TechEcosystemStudio = lazy(() => import('./components/tabs/TechEcosystemStudio'));
const HackathonJudgeStudio = lazy(() => import('./components/tabs/HackathonJudgeStudio'));
const MentorshipAdvisoryStudio = lazy(() => import('./components/tabs/MentorshipAdvisoryStudio'));
const ResearchGrantPortal = lazy(() => import('./components/tabs/ResearchGrantPortal'));
const ProjectShowcaseVault = lazy(() => import('./components/tabs/ProjectShowcaseVault'));
const StarInterviewStudio = lazy(() => import('./components/tabs/StarInterviewStudio'));
const HelpCenter = lazy(() => import('./components/tabs/HelpCenter'));
const FAQ = lazy(() => import('./components/tabs/FAQ'));
const Teams = lazy(() => import('./components/tabs/Teams'));
const MockInterviewRoom = lazy(() => import('./pages/MockInterviewRoom'));
const ApplicationTracker = lazy(() => import('./pages/ApplicationTracker').then(m => ({ default: m.ApplicationTracker })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const FocusRoom = lazy(() => import('./pages/FocusRoom').then(m => ({ default: m.FocusRoom })));
const ExperiencesHub = lazy(() => import('./components/tabs/ExperiencesHub'));
const PollStudio = lazy(() => import('./components/tabs/PollStudio'));
const WatchlistManager = lazy(() => import('./components/tabs/WatchlistManager'));
const CareerGoalTracker = lazy(() => import('./components/tabs/CareerGoalTracker'));
const ResourceVault = lazy(() => import('./components/tabs/ResourceVault'));
const StudyGroupRooms = lazy(() => import('./components/tabs/StudyGroupRooms'));
const CodeReviewExchange = lazy(() => import('./components/tabs/CodeReviewExchange'));
const DeadlineCalendar = lazy(() => import('./components/tabs/DeadlineCalendar'));
const DirectMessages = lazy(() => import('./components/tabs/DirectMessages'));
const BioAiClinicalTelemetryHub = lazy(() => import('./pages/Enterprise/BioAiClinicalTelemetryHub'));
const LoadingFallback = () => (
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

const PUBLIC_TABS = ['opportunities', 'about', 'privacy', 'terms', 'cookies', 'guidelines', 'security', 'support', 'legal'];

const getSeoPropsForTab = (tab: string) => {
  switch (tab) {
    case 'dashboard':
      return {
        title: "YuvaHub | Find Student Hackathons, Scholarships & Mentorships",
        description: "Discovery platform for Indian students. Find hackathons, scholarships, and mentorship opportunities to boost your career. Real-time updates and AI matching."
      };
    case 'teams':
      return { title: "Team Builder & Matcher | YuvaHub", description: "Find teammates and join teams for hackathons, projects, and opportunities." };
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
    case 'resource_vault':
      return { title: "Resource Vault | YuvaHub", description: "Discover, share, and bookmark the best learning resources curated by the student community." };
    case 'profile':
      return { title: "My Profile | YuvaHub", description: "Manage your student profile, skills, education, and resumes on YuvaHub." };
    case 'settings':
      return { title: "Settings | YuvaHub", description: "Adjust your account configurations and platform settings on YuvaHub." };
    case 'admin':
      return { title: "Admin Dashboard | YuvaHub", description: "YuvaHub administrative operations control panel." };
    case 'ai_assistant':
      return { title: "AI Assistant | YuvaHub", description: "Interact with our intelligent career assistant for optimization and guidance." };
    case 'focus_room':
      return { title: "Global Focus Room | YuvaHub", description: "Join the global Pomodoro focus room and study with other students." };
    case 'faq':
      return { title: "Help Center & FAQ | YuvaHub", description: "Find answers to common questions, troubleshoot issues, and learn how to use YuvaHub effectively." };
    case 'poll_studio':
      return { title: "Community Polls | YuvaHub", description: "Participate in student polls and surveys." };
    case 'code_review':
      return { title: "Peer Code Review Exchange | YuvaHub", description: "Submit your code for review by peers and earn karma by reviewing others." };
    case 'bio_ai_telemetry':
      return { title: "Bio-AI Clinical Telemetry Command Station | YuvaHub Enterprise", description: "Continuous real-time multiparameter ICU/CCU telemetry, Bio-AI deterioration biomarkers, and automated emergency triage." };
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
    setGettingStartedStep,
    karmaBalance,
    karmaBumpFlag
  } = useAppContext();

  const { isConnected, transportMode } = useSocket();
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [profile?.avatarUrl, user?.photoURL]);

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

  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);
  const isAdminUser = Boolean(
    user?.role === 'admin' || 
    user?.isAdmin || 
    (user?.email && adminEmails.includes(user.email.toLowerCase())) || 
    (import.meta.env.DEV && user?.email)
  );

  const NAVIGATION_GROUPS = [
    {
      title: "Core Platform",
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'opportunities', label: 'Opportunities', icon: Globe },
        { id: 'application_tracker', label: 'Application Tracker', icon: Briefcase },
        { id: 'watchlist_manager', label: 'Watchlists & Alerts', icon: Sparkles, badge: 'NEW' },
        { id: 'deadline_calendar', label: 'Deadline Calendar', icon: Calendar, badge: 'NEW' },
        { id: 'opportunity_match', label: 'AI Match Studio', icon: Sparkles, badge: 'AI' },
        { id: 'teams', label: 'Team Builder', icon: Users },
        { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
      ]
    },
    {
      title: "AI & Career Studios",
      items: [
        { id: 'bio_ai_telemetry', label: 'Clinical Telemetry Hub', icon: Activity, badge: 'AI' },
        { id: 'skill_gap', label: 'Skill Gap Analyzer', icon: Target },
        { id: 'ai_assistant', label: 'AI Assistant', icon: Brain },
        { id: 'career_match', label: 'Career Match Studio', icon: TrendingUp },
        { id: 'career_goals', label: 'Career Goal Tracker', icon: Target, badge: 'AI' },
        { id: 'resume_ats', label: 'Resume ATS Optimizer', icon: FileText },
        { id: 'interview_prep', label: 'AI Interview Studio', icon: Video },
        { id: 'project_showcase', label: 'Project Vault', icon: FolderGit2 },
        { id: 'mock_interview', label: 'Mock Interview Room', icon: Mic },
      ]
    },
    {
      title: "Ecosystem & Community",
      items: [
        { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        { id: 'study_groups', label: 'Study Groups', icon: Users, badge: 'NEW' },
        { id: 'mentorship', label: 'Mentorship', icon: GraduationCap },
        { id: 'focus_room', label: 'Global Focus Room', icon: Clock },
        { id: 'bounty_board', label: 'Bounty Board', icon: Coins },
        { id: 'interview_experiences', label: 'Interview Experiences', icon: MessageSquare },
        { id: 'opensource_bounties', label: 'Open Source Bounties', icon: Code2 },
        { id: 'community', label: 'Community Forum', icon: MessageSquare },
        { id: 'resource_vault', label: 'Resource Vault', icon: BookOpen },
        { id: 'poll_studio', label: 'Community Polls', icon: MessageSquare },
        { id: 'code_review', label: 'Code Review Exchange', icon: Code2, badge: 'NEW' },
        { id: 'direct_messages', label: 'Direct Messages', icon: MessageSquare, badge: 'NEW' },
        { id: 'campus_alumni', label: 'Campus & Alumni Hub', icon: Building2 },
      ]
    },
    {
      title: "Grants & Portals",
      items: [
        { id: 'submit', label: 'Submit Opportunity', icon: PlusCircle },
        { id: 'grant_studio', label: 'Grants & Fellowships', icon: Award },
        { id: 'research_grants', label: 'Research Grant Portal', icon: BookOpen },
        { id: 'tech_ecosystem', label: 'Tech Ecosystem Studio', icon: Cpu },
        { id: 'developer_api', label: 'Developer API Portal', icon: Terminal },
      ]
    },
    {
      title: "Account & System",
      items: [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'auth_security', label: 'Auth & Security', icon: ShieldCheck },
        { id: 'settings', label: 'Settings', icon: Settings },
        ...(isAdminUser ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldAlert }] : []),
      ]
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'opportunities': return <Opportunities />;
      case 'application_tracker': return <ApplicationTracker />;
      case 'deadline_calendar': return <DeadlineCalendar />;
      case 'teams': return <Teams />;
      case 'bookmarks': return <Bookmarks />;
      case 'leaderboard': return <Leaderboard />;
      case 'ai_assistant': return (
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading AI Assistant...</p>
          </div>
        }>
          <AIAssistant />
        </Suspense>
      );
      case 'career_match': return <CareerMatchStudio />;
      case 'bio_ai_telemetry': return <BioAiClinicalTelemetryHub />;
      case 'career_goals': return <CareerGoalTracker />;
      case 'hackathon_studio': return <HackathonStudio />;
      case 'developer_api': return <DeveloperApiPortal />;
      case 'grant_studio': return <GrantFellowshipStudio />;
      case 'campus_alumni': return <CampusAlumniHub />;
      case 'resume_ats': return <ResumeAtsStudio />;
      case 'skill_gap': return <SkillGapStudio />;
      case 'interview_prep': return <InterviewPrepStudio />;
      case 'opensource_bounties': return <OpenSourceBountyStudio />;
      case 'opportunity_match': return <OpportunityMatchStudio />;
      case 'tech_ecosystem': return <TechEcosystemStudio />;
      case 'hackathon_judge': return <HackathonJudgeStudio />;
      case 'mentorship_advisory': return <MentorshipAdvisoryStudio />;
      case 'research_grants': return <ResearchGrantPortal />;
      case 'project_showcase': return <ProjectShowcaseVault />;
      case 'star_interview': return <StarInterviewStudio />;
      case 'submit': return <SubmitOpportunity />;
      case 'mentorship': return <MentorshipAdvisoryStudio />;
      case 'focus_room': return <FocusRoom />;
      case 'study_groups': return <StudyGroupRooms />;
      case 'bounty_board': return <BountyBoard />;
      case 'interview_experiences': return <ExperiencesHub />;
      case 'community': return <Community />;
      case 'resource_vault': return <ResourceVault />;
      case 'poll_studio': return <PollStudio />;
      case 'code_review': return <CodeReviewExchange />;
      case 'direct_messages': return <DirectMessages />;
      case 'profile': return <Profile />;
      case 'settings': return <SettingsTab />;
      case 'auth_security': return <AuthSecurityCenter />;
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
      case 'mock_interview': return <MockInterviewRoom />;
      case 'watchlist_manager': return <WatchlistManager />;
      case 'faq': return <FAQ />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return <LoadingScreen fullScreen={true} />;
  }

  if ((activeTab === 'legal' || activeTab === 'security' || activeTab === 'support' || activeTab === 'about' || activeTab === 'guidelines') && !user) {
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
          <Suspense fallback={<LoadingScreen />}>
            {activeTab === 'legal' ? <Legal /> : activeTab === 'security' ? <Security /> : activeTab === 'about' ? <AboutTab /> : activeTab === 'guidelines' ? <Guidelines /> : <Support />}
          </Suspense>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingScreen fullScreen={true} />}>
        <SplashAuth />
      </Suspense>
    );
  }

  // Ensure they are onboarded or we show the onboarding flow (for first-time signups only)
  const hasOnboarded = Boolean(
    profile?.onboarded || 
    profile?.college || 
    profile?.year ||
    profile?.field ||
    (user && typeof localStorage !== 'undefined' && (
      (user.uid && localStorage.getItem(`yuvahub-onboarded-${user.uid}`) === 'true') ||
      (user.email && localStorage.getItem(`yuvahub-onboarded-${user.email}`) === 'true') ||
      localStorage.getItem('yuvahub-user-onboarded') === 'true'
    ))
  );

  if (user && profile && !hasOnboarded) {
    return (
      <Suspense fallback={<LoadingScreen fullScreen={true} />}>
        <OnboardingFlow user={user} profile={profile} onComplete={(updated) => {
          const finishedProfile = { ...updated, onboarded: true };
          setProfile(finishedProfile);
          if (typeof localStorage !== 'undefined') {
            if (user?.uid) localStorage.setItem(`yuvahub-onboarded-${user.uid}`, 'true');
            if (user?.email) localStorage.setItem(`yuvahub-onboarded-${user.email}`, 'true');
            localStorage.setItem('yuvahub-user-onboarded', 'true');
          }
        }} />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden dark:bg-gray-900 dark:text-gray-100">
      {/* Global accessibility enhancer: focus trap, ARIA labels, Esc handling */}
      <AccessibilityEnhancer />

      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[#603620] focus:text-white focus:rounded-lg focus:font-bold focus:text-sm focus:shadow-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Centralized SEO component for logged-in views */}
      {selectedOppId ? null : (
        <SEO 
          title={getSeoPropsForTab(activeTab).title}
          description={getSeoPropsForTab(activeTab).description}
          noindex={!PUBLIC_TABS.includes(activeTab)}
        />
      )}
      
      {/* Sidebar Desktop - Fixed 240px */}
      <aside className="hidden lg:flex w-60 border-r border-[#e8ded1] dark:border-gray-800 flex-col bg-[#fcf9f2] dark:bg-gray-900 z-10 shrink-0 relative">
        <div className="h-16 px-5 border-b border-[#e8ded1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#603620] flex items-center justify-center shadow-md">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#f3e4bd]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <h1 className="text-xl font-serif font-bold tracking-tight text-[#231f20] dark:text-white">
              Yuva<span className="text-[#b56b37] dark:text-blue-400 italic">Hub</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-none" role="tablist" aria-label="Main navigation">
          {NAVIGATION_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#603620] dark:text-gray-400 mb-1">
                {group.title}
              </div>
              {group.items.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id && !selectedOppId;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    id={`tab-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id !== 'help') setGettingStartedStep(null);
                      clearSelectedOpportunity();
                      scrollContentToTop();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#f6efe2] dark:bg-blue-950/60 text-[#b56b37] dark:text-blue-400 font-extrabold border-r-2 border-[#b56b37] dark:border-blue-500 shadow-xs'
                        : 'text-[#603620] dark:text-gray-400 hover:bg-[#f6efe2]/70 dark:hover:bg-gray-800/80 hover:text-[#231f20] dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#b56b37] dark:text-blue-400' : 'text-[#8c7569] dark:text-gray-500'}`} aria-hidden="true" />
                      <span className="truncate">{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#b56b37] dark:bg-blue-600 text-white">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-[#e8ded1]">
          {user ? (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] text-[#8c7569] font-medium truncate px-2">{user.email}</span>
              <button onClick={logout} className="w-full py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200 cursor-pointer">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="clean-btn w-full py-2 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer bg-[#b56b37] hover:bg-[#603620]">
               Sign in with Google
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-[#e8ded1] bg-[#fcf9f2] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#603620] flex items-center justify-center shadow-md">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#f3e4bd]"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          </div>
          <h1 className="text-lg font-serif font-bold tracking-tight text-[#231f20]">
            Yuva<span className="text-[#b56b37] italic">Hub</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationDropdown profile={profile} />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#603620] hover:text-gray-900" aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}>
            {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[#fcf9f2] z-40 p-4 border-b border-[#e8ded1] overflow-y-auto" role="dialog" aria-label="Navigation menu">
          <nav className="space-y-4" role="tablist" aria-label="Main navigation">
            {NAVIGATION_GROUPS.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-[#603620] mb-1">
                  {group.title}
                </div>
                {group.items.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id && !selectedOppId;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id !== 'help') setGettingStartedStep(null);
                        clearSelectedOpportunity();
                        setIsMobileMenuOpen(false);
                        scrollContentToTop();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-3 text-xs font-semibold rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#f6efe2] text-[#b56b37] font-extrabold border-r-2 border-[#b56b37]'
                          : 'text-[#603620] hover:bg-[#f6efe2]/70 hover:text-[#231f20]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#b56b37]' : 'text-[#8c7569]'}`} aria-hidden="true" />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#b56b37] text-white">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            
            <div className="pt-2 border-t border-[#e8ded1]">
              {user ? (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="w-full py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200"
                >
                  Logout ({user.email})
                </button>
              ) : (
                <button
                  onClick={() => { signInWithGoogle(); setIsMobileMenuOpen(false); }}
                  className="clean-btn w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 bg-[#b56b37]"
                >
                  Sign in with Google
                </button>
              )}
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col pt-16 lg:pt-0 h-screen overflow-hidden relative">
        
        {/* Topbar */}
        <div className="hidden lg:flex h-16 border-b border-[#e8ded1] bg-[#fcf9f2] items-center justify-between px-6 shrink-0">
           <div className="flex-1 max-w-[500px] ml-8 mr-8">
              {activeTab === 'opportunities' ? (
                 <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7569]">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <input type="text" placeholder="Search standard competitions..." aria-label="Search opportunities" className="w-full bg-white border border-[#e8ded1] outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-[#231f20] focus:ring-2 focus:ring-[#b56b37]/20 focus:border-[#b56b37] transition-all" value={appSearchQuery} onChange={(e) => setAppSearchQuery(e.target.value)} />
                 </div>
              ) : (
                 <p className="text-xs text-[#603620] font-semibold">
                   {selectedOppId 
                     ? "Detail Overview" 
                     : (user ? `Welcome back, ${profile?.name || user?.displayName || user?.email?.split('@')[0] || 'Student'}` : 'Welcome to YuvaHub')
                   }
                 </p>
              )}
           </div>
           <div className="flex items-center gap-4">
              {user && (
                <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-[#f6efe2] text-[#603620] border border-[#e8ded1] ${karmaBumpFlag ? 'animate-karma-bounce' : ''}`}>
                  <Sparkles className="w-3.5 h-3.5 text-[#b56b37]" />
                  <span>{karmaBalance} Karma</span>
                </div>
              )}
              <div className="hidden md:flex items-center gap-2 text-xs font-semibold bg-white text-[#603620] px-3 py-1 rounded-full border border-[#e8ded1]">
                <span className={`w-2 h-2 rounded-full ${isConnected ? (transportMode === 'websocket' ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-red-500'}`}></span>
                <span>
                  {!isConnected ? 'Disconnected' : (transportMode === 'websocket' ? 'Connected' : 'Polling active')}
                </span>
              </div>
              <NotificationDropdown profile={profile} />
              {(() => {
                const avatarSrc = profile?.avatarUrl || user?.photoURL;
                if (avatarSrc && !avatarError) {
                  return (
                    <img 
                      src={avatarSrc.includes("cloudinary.com") ? avatarSrc.replace("/upload/", "/upload/f_auto,q_auto,c_fill,w_64,h_64/") : avatarSrc} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full object-cover border border-[#e8ded1] shadow-xs cursor-pointer hover:opacity-90 transition-opacity" 
                      referrerPolicy="no-referrer"
                      onError={() => setAvatarError(true)}
                      onClick={() => setActiveTab('profile')}
                    />
                  );
                }
                return (
                  <div 
                    onClick={() => setActiveTab('profile')}
                    className="w-8 h-8 rounded-full bg-[#603620] text-[#f3e4bd] flex items-center justify-center font-extrabold text-xs shadow-xs border border-[#e8ded1] cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : (user?.displayName ? user.displayName.charAt(0).toUpperCase() : (user?.email?.charAt(0).toUpperCase() || 'U'))}
                  </div>
                );
              })()}
           </div>
        </div>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto no-scrollbar pb-24">
          <Suspense fallback={<LoadingScreen />}>
            {selectedOppId ? (
              <OpportunityDetail />
            ) : (
              <Suspense fallback={<LoadingScreen />}>
                {renderContent()}
              </Suspense>
            )}
          </Suspense>
        </div>

        <BackToTopButton />
      </main>

    </div>
  );
}

export default App;
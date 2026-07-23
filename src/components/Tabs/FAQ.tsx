/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Interactive Help Center & FAQ Hub
 * ──────────────────────────────────
 * A dedicated, fully-searchable FAQ page with categorized accordions,
 * a Getting Started guide, Troubleshooting section, and Support links.
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  UserPlus,
  MailCheck,
  UserCircle,
  Compass,
  FileCheck,
  MessageSquare,
  ArrowRight,
  KeyRound,
  Shield,
  Loader,
  LogIn,
  AlertTriangle,
  Bug,
  Lightbulb,
  Users,
  Settings,
  ShieldCheck,
  Wifi,
  Monitor,
  RotateCcw,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { FaqAccordion } from '../ui/FaqAccordion';
import FAQSearch from '../ui/FAQSearch';
import HelpCategory from '../ui/HelpCategory';
import type { FaqEntry } from '../ui/HelpCategory';

/* ── Types ─────────────────────────────────────────────────────────────── */

type FaqCategory =
  | 'all'
  | 'getting_started'
  | 'account'
  | 'authentication'
  | 'security_privacy'
  | 'troubleshooting'
  | 'general';

interface TroubleshootingGuide {
  id: string;
  title: string;
  problem: string;
  cause: string;
  solution: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface GettingStartedStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

/* ── Constants ─────────────────────────────────────────────────────────── */

const FAQ_CATEGORIES: { id: FaqCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'getting_started', label: 'Getting Started' },
  { id: 'account', label: 'Account' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'security_privacy', label: 'Security & Privacy' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'general', label: 'General' },
];

const CATEGORY_LABELS: Record<Exclude<FaqCategory, 'all'>, string> = {
  getting_started: 'Getting Started',
  account: 'Account',
  authentication: 'Authentication',
  security_privacy: 'Security & Privacy',
  troubleshooting: 'Troubleshooting',
  general: 'General',
};

const CATEGORY_ICONS: Record<Exclude<FaqCategory, 'all'>, React.ComponentType<{ className?: string }>> = {
  getting_started: Compass,
  account: Settings,
  authentication: KeyRound,
  security_privacy: ShieldCheck,
  troubleshooting: AlertTriangle,
  general: HelpCircle,
};

/* ── FAQ Data ──────────────────────────────────────────────────────────── */

const FAQ_ITEMS: Array<FaqEntry & { category: Exclude<FaqCategory, 'all'>; keywords: string[] }> = [
  // ── Getting Started ──
  {
    id: 'faq-gs-01',
    category: 'getting_started',
    question: 'How do I create an account on YuvaHub?',
    answer: 'Click "Login" on the home page and choose Google or GitHub. After authorizing, you\'ll be guided through onboarding where you set your name, skills, and preferences. Your account is ready once onboarding is complete.',
    keywords: ['create', 'account', 'signup', 'register', 'google', 'github'],
  },
  {
    id: 'faq-gs-02',
    category: 'getting_started',
    question: 'How do I sign in after creating my account?',
    answer: 'Return to YuvaHub and click "Login". Select the same provider (Google or GitHub) you used during registration. Your profile, bookmarks, and settings will be restored automatically.',
    keywords: ['sign', 'in', 'login', 'return', 'access'],
  },
  {
    id: 'faq-gs-03',
    category: 'getting_started',
    question: 'How do I navigate the dashboard?',
    answer: 'The sidebar (desktop) or hamburger menu (mobile) provides quick access to all sections: Dashboard, Opportunities, Bookmarks, AI Assistant, Mentorship, Community, Profile, and Settings. The top bar shows a search field and your notification bell.',
    keywords: ['navigate', 'dashboard', 'sidebar', 'menu', 'tour'],
  },
  {
    id: 'faq-gs-04',
    category: 'getting_started',
    question: 'What are the main features of YuvaHub?',
    answer: 'YuvaHub offers verified Opportunity listings (internships, jobs, hackathons, scholarships), AI-powered matching, an AI Career Assistant, Mentorship pairing, Community forums, Bookmarks, and a dedicated Support channel—all in one platform.',
    keywords: ['features', 'platform', 'tools', 'capabilities', 'what can'],
  },

  // ── Account ──
  {
    id: 'faq-acct-01',
    category: 'account',
    question: 'How do I change my password?',
    answer: 'YuvaHub uses Google and GitHub for authentication, so passwords are managed externally. Visit your Google or GitHub account settings to change your password, then sign back into YuvaHub with the updated credentials.',
    keywords: ['password', 'change', 'update', 'reset', 'credentials'],
  },
  {
    id: 'faq-acct-02',
    category: 'account',
    question: 'How do I verify my email address?',
    answer: 'Email verification is handled by your Google or GitHub account. After signing in, if additional verification is needed, check your inbox for a prompt from your provider. Once verified, all YuvaHub features are unlocked.',
    keywords: ['verify', 'email', 'confirmation', 'address'],
  },
  {
    id: 'faq-acct-03',
    category: 'account',
    question: 'How do I edit my profile?',
    answer: 'Open the Profile tab from the sidebar and click "Edit Profile". You can update your photo, bio, skills, education, resume, and social links. Keeping your profile current helps the AI recommend better matches.',
    keywords: ['profile', 'edit', 'update', 'bio', 'skills', 'photo'],
  },
  {
    id: 'faq-acct-04',
    category: 'account',
    question: 'How do I delete my account?',
    answer: 'Go to Settings → Account Control and choose "Delete Account". This permanently removes your profile data, bookmarks, and application history. This action cannot be undone—export any data you need before confirming.',
    keywords: ['delete', 'remove', 'close', 'deactivate', 'account'],
  },
  {
    id: 'faq-acct-05',
    category: 'account',
    question: 'Can I change the email associated with my account?',
    answer: 'Your sign-in email comes from your Google or GitHub account. To use a different email, sign in with the provider account that owns the desired address. For account-linked questions, visit Support & Feedback.',
    keywords: ['email', 'change', 'switch', 'address', 'provider'],
  },

  // ── Authentication ──
  {
    id: 'faq-auth-01',
    category: 'authentication',
    question: 'Which sign-in methods does YuvaHub support?',
    answer: 'You can sign in with Google or GitHub from the welcome screen. Both methods use secure OAuth 2.0—YuvaHub never stores your password. Choose the same provider each time to keep your profile linked correctly.',
    keywords: ['login', 'signin', 'google', 'github', 'oauth', 'method'],
  },
  {
    id: 'faq-auth-02',
    category: 'authentication',
    question: 'I cannot log in — what should I try?',
    answer: 'First, confirm you\'re using the same provider (Google or GitHub) as before. Allow pop-ups for YuvaHub, ensure cookies are enabled, and clear any stale browser sessions. If the popup was blocked, allow it and retry. For persistent issues, see the Troubleshooting section.',
    keywords: ['cannot', 'login', 'fail', 'blocked', 'popup', 'error'],
  },
  {
    id: 'faq-auth-03',
    category: 'authentication',
    question: 'How do I reset my password?',
    answer: 'Since YuvaHub delegates authentication to Google and GitHub, use your provider\'s "Forgot password" flow. After resetting, return to YuvaHub and sign in with the updated credentials.',
    keywords: ['password', 'reset', 'forgot', 'recover', 'lost'],
  },
  {
    id: 'faq-auth-04',
    category: 'authentication',
    question: 'Why was I logged out unexpectedly?',
    answer: 'Sessions can expire after extended periods of inactivity or if you clear browser cookies. Simply sign in again using your original provider. Your profile data and bookmarks are preserved.',
    keywords: ['logout', 'session', 'expired', 'kicked', 'signed out'],
  },

  // ── Security & Privacy ──
  {
    id: 'faq-sec-01',
    category: 'security_privacy',
    question: 'How does YuvaHub protect my account?',
    answer: 'Authentication is delegated to trusted providers (Google/GitHub) via OAuth. We never store passwords. The platform uses HTTPS, encrypted data at rest, and regular security audits. Review the Security Center for best practices.',
    keywords: ['secure', 'protect', 'safety', 'encryption', 'https'],
  },
  {
    id: 'faq-sec-02',
    category: 'security_privacy',
    question: 'What should I do if I suspect unauthorized access?',
    answer: 'Immediately secure your Google or GitHub account: change your password, review active sessions, and enable 2FA. Sign out of YuvaHub on all shared devices. Contact support if you notice unexpected profile changes.',
    keywords: ['unauthorized', 'breach', 'suspicious', 'hijack', 'compromised'],
  },
  {
    id: 'faq-sec-03',
    category: 'security_privacy',
    question: 'Who can see my profile?',
    answer: 'Visibility options are under Settings → Privacy. You can control whether your profile appears in the mentor directory and whether wins are shown in the community feed. Read the Privacy Policy for full details.',
    keywords: ['visibility', 'public', 'private', 'directory', 'profile'],
  },
  {
    id: 'faq-sec-04',
    category: 'security_privacy',
    question: 'Is my personal data sold to advertisers?',
    answer: 'No. YuvaHub does not sell personal data to third-party ad networks. We use data solely to power platform features like AI matching and recommendations. See the Privacy Policy for how data is processed and stored.',
    keywords: ['sell', 'ads', 'tracking', 'data', 'third-party', 'privacy'],
  },
  {
    id: 'faq-sec-05',
    category: 'security_privacy',
    question: 'What are the security best practices for my account?',
    answer: 'Enable two-factor authentication on your Google/GitHub account, use a strong unique password, never share session tokens, log out on shared devices, and periodically review your active sessions on your provider\'s security dashboard.',
    keywords: ['best', 'practices', '2fa', 'two-factor', 'strong', 'password'],
  },

  // ── Troubleshooting ──
  {
    id: 'faq-ts-01',
    category: 'troubleshooting',
    question: 'I can\'t log in — the popup closes or loops.',
    answer: 'This usually means pop-ups are blocked, or you have conflicting browser sessions. Allow pop-ups for YuvaHub, clear site cookies, make sure you\'re using the same Google/GitHub account, and try again. Disable ad blockers temporarily.',
    keywords: ['login', 'popup', 'blocked', 'loop', 'stuck'],
  },
  {
    id: 'faq-ts-02',
    category: 'troubleshooting',
    question: 'How do I reset my password if I\'m locked out?',
    answer: 'Visit your identity provider (Google or GitHub) and use their password recovery flow. Once you\'ve set a new password there, return to YuvaHub and sign in normally. YuvaHub does not store or manage passwords directly.',
    keywords: ['password', 'locked', 'out', 'reset', 'recovery'],
  },
  {
    id: 'faq-ts-03',
    category: 'troubleshooting',
    question: 'Pages load slowly or not at all.',
    answer: 'Check your internet connection first. Verify the Live/Offline indicator in the footer—if the backend is offline, some features may be limited. Try a hard refresh (Ctrl/Cmd+Shift+R), clear browser cache, or try a different browser.',
    keywords: ['slow', 'loading', 'page', 'hang', 'freeze', 'performance'],
  },
  {
    id: 'faq-ts-04',
    category: 'troubleshooting',
    question: 'Which browsers are supported?',
    answer: 'YuvaHub works best on the latest versions of Chrome, Firefox, Safari, and Edge. Ensure JavaScript is enabled and cookies are allowed. Older browsers (Internet Explorer) are not supported.',
    keywords: ['browser', 'compatibility', 'chrome', 'firefox', 'safari', 'edge'],
  },
  {
    id: 'faq-ts-05',
    category: 'troubleshooting',
    question: 'I\'m seeing network or connection errors.',
    answer: 'Network errors typically indicate connectivity issues. Check your Wi-Fi or mobile data, disable VPN if it\'s blocking requests, and ensure firewall rules aren\'t blocking YuvaHub domains. Try again after a few minutes.',
    keywords: ['network', 'connection', 'error', 'offline', 'fetch', 'failed'],
  },
  {
    id: 'faq-ts-06',
    category: 'troubleshooting',
    question: 'My registration or sign-up failed.',
    answer: 'Common causes include a cancelled OAuth popup, network interruption, or an existing session with a different provider. Close duplicate YuvaHub tabs, allow pop-ups, complete the consent screen, and retry once.',
    keywords: ['register', 'signup', 'fail', 'error', 'oauth'],
  },

  // ── General ──
  {
    id: 'faq-gen-01',
    category: 'general',
    question: 'What is YuvaHub?',
    answer: 'YuvaHub is a platform that helps students and early-career professionals discover verified opportunities—internships, hackathons, scholarships, jobs—and connect with mentors and community discussions in one place.',
    keywords: ['yuvahub', 'platform', 'about', 'overview', 'what'],
  },
  {
    id: 'faq-gen-02',
    category: 'general',
    question: 'Is YuvaHub free to use?',
    answer: 'Yes, YuvaHub is completely free for students and early-career talent. You can search, browse, bookmark, and use the AI Assistant without any cost.',
    keywords: ['free', 'cost', 'price', 'pay', 'subscription'],
  },
  {
    id: 'faq-gen-03',
    category: 'general',
    question: 'How are opportunities verified?',
    answer: 'Listings go through verification checks and community reporting. Verified badges indicate audited company identity. Flag suspicious posts so moderators can review them promptly.',
    keywords: ['verified', 'authentic', 'scam', 'flag', 'legit'],
  },
  {
    id: 'faq-gen-04',
    category: 'general',
    question: 'Can I save opportunities for later?',
    answer: 'Yes. Use the bookmark icon on any opportunity card. Saved items appear in the Bookmarks tab where you can revisit deadlines and details anytime.',
    keywords: ['bookmark', 'save', 'later', 'favorites', 'watchlist'],
  },
  {
    id: 'faq-gen-05',
    category: 'general',
    question: 'How do I manage email notifications?',
    answer: 'Open Settings → Delivery Channels and toggle email notifications on or off. You can also control specific alert types like skill matches, deadline reminders, and scholarship alerts under Notification Preferences.',
    keywords: ['email', 'notifications', 'alerts', 'toggle', 'manage'],
  },
  {
    id: 'faq-gen-06',
    category: 'general',
    question: 'How do I contact support?',
    answer: 'Navigate to Support & Feedback from the sidebar or Settings page. You can submit a bug report, feature request, or general inquiry. Our team typically responds within 24 hours.',
    keywords: ['contact', 'support', 'help', 'feedback', 'report'],
  },
];

/* ── Getting Started Steps ─────────────────────────────────────────────── */

const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  { id: 'gs-1', title: 'Create Account', description: 'Sign in with Google or GitHub from the welcome screen.', icon: UserPlus },
  { id: 'gs-2', title: 'Verify Email', description: 'Confirm access through your provider account if prompted.', icon: MailCheck },
  { id: 'gs-3', title: 'Complete Profile', description: 'Add skills, bio, and links so matches stay relevant.', icon: UserCircle },
  { id: 'gs-4', title: 'Explore Opportunities', description: 'Browse, search, and bookmark internships, jobs, and events.', icon: Compass },
  { id: 'gs-5', title: 'Register / Apply', description: 'Open a listing and apply—or use Apply Assist when available.', icon: FileCheck },
  { id: 'gs-6', title: 'Need Help?', description: 'Contact the team or vote on features.', icon: MessageSquare },
];

/* ── Troubleshooting Guides ────────────────────────────────────────────── */

const TROUBLESHOOTING_GUIDES: TroubleshootingGuide[] = [
  {
    id: 'ts-login',
    title: 'Login Problems',
    problem: 'Sign-in popup closes or login never completes.',
    cause: 'Blocked pop-ups, mixed Google/GitHub accounts, or a stale browser session.',
    solution: 'Allow pop-ups for YuvaHub, use the same provider as before, clear site cookies, then try again.',
    icon: LogIn,
  },
  {
    id: 'ts-password',
    title: 'Password Reset',
    problem: 'You need to reset credentials before signing in.',
    cause: 'Passwords are managed by Google or GitHub, not stored inside YuvaHub.',
    solution: 'Reset the password on your identity provider, then return and sign in with the updated account.',
    icon: KeyRound,
  },
  {
    id: 'ts-loading',
    title: 'Loading Issues',
    problem: 'Pages or opportunity lists feel delayed or unresponsive.',
    cause: 'Slow network, busy search indexes, or a temporarily offline backend.',
    solution: 'Refresh once, check the Live/Offline indicator in the footer, and try again on a stronger connection.',
    icon: Loader,
  },
  {
    id: 'ts-browser',
    title: 'Browser Compatibility',
    problem: 'Features may not render correctly or certain interactions fail.',
    cause: 'Older browser versions lack support for modern CSS and JavaScript APIs.',
    solution: 'Update to the latest Chrome, Firefox, Safari, or Edge. Enable JavaScript and allow cookies for YuvaHub.',
    icon: Monitor,
  },
  {
    id: 'ts-network',
    title: 'Network Errors',
    problem: 'You see "Failed to fetch" or connection timeout messages.',
    cause: 'Unstable internet, VPN interference, or firewall rules blocking YuvaHub domains.',
    solution: 'Check connectivity, disable VPN temporarily, and ensure firewall allows YuvaHub traffic. Retry after a moment.',
    icon: Wifi,
  },
  {
    id: 'ts-session',
    title: 'Session Expired',
    problem: 'You are logged out unexpectedly or see an auth error.',
    cause: 'Extended inactivity, cleared cookies, or provider token expiration.',
    solution: 'Sign back in with your original provider. Your data is preserved—no action needed.',
    icon: RotateCcw,
  },
];

/* ── Support Cards ─────────────────────────────────────────────────────── */

const SUPPORT_CARDS = [
  { id: 'support-contact', title: 'Contact Support', description: 'Get personalized help from our support team', icon: MessageSquare, action: 'support' as const, color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900' },
  { id: 'support-bug', title: 'Report a Bug', description: 'Help us improve by reporting issues', icon: Bug, action: 'support' as const, color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900' },
  { id: 'support-feature', title: 'Request a Feature', description: 'Share your ideas for improvements', icon: Lightbulb, action: 'support' as const, color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900' },
  { id: 'support-community', title: 'Community Help', description: 'Get help from other YuvaHub users', icon: Users, action: 'community' as const, color: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900' },
];

/* ── Component ─────────────────────────────────────────────────────────── */

export default function FAQ() {
  const { setActiveTab, setGettingStartedStep } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTroubleshootId, setExpandedTroubleshootId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  /* ── Filtering ─────────────────────────────────────────────────────── */

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((faq) => {
      if (activeCategory !== 'all' && faq.category !== activeCategory) return false;
      if (!query) return true;
      const haystack = [faq.question, faq.answer, faq.category, CATEGORY_LABELS[faq.category], ...faq.keywords]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, activeCategory]);

  /* ── Handlers ──────────────────────────────────────────────────────── */

  const handleToggleFaq = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleToggleTroubleshoot = useCallback((id: string) => {
    setExpandedTroubleshootId((prev) => (prev === id ? null : id));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setExpandedId(null);
  }, []);

  const handleStepClick = useCallback(
    (_stepId: string) => {
      setGettingStartedStep(null);
      setActiveTab('dashboard');
    },
    [setActiveTab, setGettingStartedStep],
  );

  /* ── Group FAQs by category ────────────────────────────────────────── */

  const groupedFaqs = useMemo(() => {
    const groups: Record<string, Array<FaqEntry & { keywords: string[] }>> = {};
    for (const cat of FAQ_CATEGORIES) {
      if (cat.id === 'all') continue;
      groups[cat.id] = filteredFaqs.filter((f) => f.category === cat.id);
    }
    return groups;
  }, [filteredFaqs]);

  const isFiltering = searchQuery.trim() !== '' || activeCategory !== 'all';

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
      <div
        className={`max-w-6xl mx-auto px-4 py-8 transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* ════════════════ Hero / Search ════════════════ */}
        <header className="mb-10 text-center py-12 px-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-gray-800/40 dark:to-gray-900/10 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden transition-all duration-300">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/5 dark:bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/5 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1.5s' }}
          />
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/10" />

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-3 relative z-10">
            <div className="relative">
              <HelpCircle className="w-10 h-10 text-blue-600 dark:text-blue-500" aria-hidden="true" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
            </div>
            Help Center &amp; FAQ
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Find answers to common questions, troubleshoot issues, and learn how to use YuvaHub effectively.
          </p>

          <FAQSearch
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={clearSearch}
            resultCount={isFiltering ? filteredFaqs.length : undefined}
          />
        </header>

        {/* ════════════════ Category Filters ════════════════ */}
        <div className="flex flex-wrap justify-center gap-2 mb-10" role="group" aria-label="FAQ categories">
          {FAQ_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedId(null);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ease-out hover:scale-105 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-transparent'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 hover:border-blue-300 hover:text-blue-600'
                }`}
                aria-pressed={isActive}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* ════════════════ Main Grid: FAQs + Getting Started ════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          {/* ─── FAQ Section ─── */}
          <section className="lg:col-span-2 space-y-8" aria-labelledby="faq-heading">
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div>
                <h2 id="faq-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {filteredFaqs.length} topic{filteredFaqs.length === 1 ? '' : 's'}
                  {isFiltering ? ' matching your filters' : ''}
                </p>
              </div>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 px-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800/50">
                <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
                <p className="font-semibold text-gray-800 dark:text-gray-300">No matching questions found.</p>
                <p className="text-xs text-gray-500 mt-1 mb-6">Try a different keyword or clear your filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    clearSearch();
                    setActiveCategory('all');
                  }}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg"
                >
                  Clear Search &amp; Filters
                </button>
              </div>
            ) : isFiltering ? (
              /* Flat accordion list when filtering/searching */
              <ul className="space-y-3 list-none p-0 m-0">
                {filteredFaqs.map((faq, index) => (
                  <FaqAccordion
                    key={faq.id}
                    faq={{ id: faq.id, category: CATEGORY_LABELS[faq.category], question: faq.question, answer: faq.answer }}
                    isOpen={expandedId === faq.id}
                    onToggle={() => handleToggleFaq(faq.id)}
                    index={index}
                    searchQuery={searchQuery}
                  />
                ))}
              </ul>
            ) : (
              /* Grouped by category when browsing */
              FAQ_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
                const items = groupedFaqs[cat.id];
                if (!items || items.length === 0) return null;
                return (
                  <HelpCategory
                    key={cat.id}
                    title={CATEGORY_LABELS[cat.id]}
                    icon={CATEGORY_ICONS[cat.id]}
                    items={items}
                    expandedId={expandedId}
                    onToggle={handleToggleFaq}
                    searchQuery={searchQuery}
                  />
                );
              })
            )}
          </section>

          {/* ─── Getting Started Sidebar ─── */}
          <aside className="space-y-6" aria-labelledby="getting-started-heading">
            <div>
              <h2 id="getting-started-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
                Getting Started
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                A quick path from signup to your first application.
              </p>
            </div>

            <div className="relative pl-6 border-l-2 border-blue-100 dark:border-gray-700 space-y-4">
              {GETTING_STARTED_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative group">
                    <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-white border-2 border-blue-500 dark:bg-gray-900 dark:border-blue-400 transition-all duration-300 group-hover:scale-125 group-hover:bg-blue-500 group-hover:border-blue-600" />
                    <div
                      onClick={() => handleStepClick(step.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleStepClick(step.id);
                        }
                      }}
                      className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl flex gap-3 items-start shadow-sm cursor-pointer hover:shadow-md hover:border-blue-400/50 dark:hover:border-blue-600/50 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 select-none"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {step.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                          {step.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 shrink-0 mt-2.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        {/* ════════════════ Troubleshooting Guides ════════════════ */}
        <section aria-labelledby="troubleshooting-heading" className="space-y-6 mb-16">
          <div>
            <h2
              id="troubleshooting-heading"
              className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-500" aria-hidden="true" />
              Troubleshooting Guides
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Common issues with problem, cause, and solution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
            {TROUBLESHOOTING_GUIDES.map((guide) => {
              const Icon = guide.icon;
              const isExpanded = expandedTroubleshootId === guide.id;
              return (
                <article
                  key={guide.id}
                  className={`bg-white dark:bg-gray-800 border rounded-2xl overflow-hidden transition-all duration-300 ease-out group ${
                    isExpanded
                      ? 'border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-500/10 -translate-y-[2px]'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/5'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTroubleshoot(guide.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`ts-panel-${guide.id}`}
                    className="w-full p-5 flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 transition-colors duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-900/20"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                        isExpanded
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 scale-110'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 group-hover:scale-110'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <h3
                      className={`text-sm font-bold flex-1 transition-colors duration-200 ${
                        isExpanded
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                      }`}
                    >
                      {guide.title}
                    </h3>
                    <ChevronDown
                      className={`w-4 h-4 transition-all duration-300 ease-out shrink-0 ${
                        isExpanded ? 'rotate-180 text-blue-500' : 'text-gray-400'
                      }`}
                    />
                  </button>

                  <div
                    id={`ts-panel-${guide.id}`}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden min-h-0">
                      <div
                        className={`px-5 pb-5 pt-0 border-t transition-all duration-300 ${
                          isExpanded
                            ? 'opacity-100 border-blue-100 dark:border-blue-900/30'
                            : 'opacity-0 border-gray-100 dark:border-gray-700'
                        }`}
                      >
                        <dl className="space-y-3 text-xs leading-relaxed mt-4">
                          <div>
                            <dt className="font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                              Problem
                            </dt>
                            <dd className="text-gray-700 dark:text-gray-300 m-0">{guide.problem}</dd>
                          </div>
                          <div>
                            <dt className="font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                              Cause
                            </dt>
                            <dd className="text-gray-700 dark:text-gray-300 m-0">{guide.cause}</dd>
                          </div>
                          <div>
                            <dt className="font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400 mb-1">
                              Solution
                            </dt>
                            <dd className="text-gray-700 dark:text-gray-300 m-0 font-medium text-blue-600 dark:text-blue-400">
                              {guide.solution}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ════════════════ Support Section ════════════════ */}
        <section aria-labelledby="support-heading" className="space-y-6">
          <div>
            <h2
              id="support-heading"
              className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-500" aria-hidden="true" />
              Need More Help?
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Get personalized support or connect with our community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUPPORT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveTab(card.action)}
                  className="group relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-left hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 dark:hover:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ${card.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{card.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ════════════════ Community Guidelines Callout ════════════════ */}
        <div className="mt-12 p-6 md:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Community Guidelines</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-md">
              Learn how to participate respectfully, understand our moderation policies, and help keep YuvaHub safe for everyone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('guidelines')}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            Read Guidelines
          </button>
        </div>
      </div>

      {/* ════════════════ Scroll to Top ════════════════ */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

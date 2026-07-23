/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  X,
  ChevronDown,
  UserPlus,
  MailCheck,
  UserCircle,
  Compass,
  FileCheck,
  AlertTriangle,
  KeyRound,
  Shield,
  BellOff,
  Loader,
  LogIn,
  Ban,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { FaqAccordion } from '../ui/FaqAccordion';
import { scrollContentToTop } from '../../lib/smoothScroll';

/* ── Types ─────────────────────────────────────────────────────────────── */

type FaqCategory =
  | 'all'
  | 'general'
  | 'account'
  | 'authentication'
  | 'registration'
  | 'events'
  | 'opportunities'
  | 'security'
  | 'privacy'
  | 'notifications'
  | 'settings';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, 'all'>;
  question: string;
  answer: string;
  keywords: string[];
}

interface GettingStartedStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TroubleshootingGuide {
  id: string;
  title: string;
  problem: string;
  cause: string;
  solution: string;
  icon: React.ComponentType<{ className?: string }>;
}

/* ── Data ──────────────────────────────────────────────────────────────── */

const FAQ_CATEGORIES: { id: FaqCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'account', label: 'Account' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'registration', label: 'Registration' },
  { id: 'events', label: 'Events' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'security', label: 'Security' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'settings', label: 'Settings' },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-general-01',
    category: 'general',
    question: 'What is YuvaHub?',
    answer:
      'YuvaHub is a platform that helps students and early-career professionals discover verified opportunities—internships, hackathons, scholarships, jobs—and connect with mentors and community discussions in one place.',
    keywords: ['yuvahub', 'platform', 'about', 'overview', 'what'],
  },
  {
    id: 'faq-general-02',
    category: 'general',
    question: 'How do I get started on YuvaHub?',
    answer:
      'Sign in with Google or GitHub, complete onboarding and your profile, then explore Opportunities from the sidebar. You can bookmark listings, ask the AI Assistant for matches, and join Community discussions anytime.',
    keywords: ['start', 'onboarding', 'begin', 'first', 'setup'],
  },
  {
    id: 'faq-account-01',
    category: 'account',
    question: 'How do I edit my profile?',
    answer:
      'Open the Profile tab from the sidebar and use Edit Profile to update your photo, bio, skills, and social links. Keeping skills up to date helps the AI Assistant recommend better matches.',
    keywords: ['profile', 'edit', 'bio', 'skills', 'picture'],
  },
  {
    id: 'faq-account-02',
    category: 'account',
    question: 'How do I change my email address?',
    answer:
      'Your sign-in email comes from your Google or GitHub account. To use a different email, sign in with the provider account that owns that address. For account-linked email questions, visit Support & Feedback.',
    keywords: ['email', 'change', 'update', 'address'],
  },
  {
    id: 'faq-account-03',
    category: 'account',
    question: 'How do I delete my account?',
    answer:
      'Go to Settings → Account Control and choose Delete Account. This permanently removes your profile data and cannot be undone. Export anything you need before confirming.',
    keywords: ['delete', 'remove', 'close', 'deactivate', 'account'],
  },
  {
    id: 'faq-auth-01',
    category: 'authentication',
    question: 'Which sign-in methods does YuvaHub support?',
    answer:
      'You can sign in with Google or GitHub from the welcome screen. Choose the same provider each time so your profile and bookmarks stay linked to the correct account.',
    keywords: ['login', 'signin', 'google', 'github', 'oauth'],
  },
  {
    id: 'faq-auth-02',
    category: 'authentication',
    question: 'I cannot log in — what should I try?',
    answer:
      'Confirm you are using the same provider (Google or GitHub) as before, allow pop-ups for YuvaHub, and check that cookies are enabled. If the popup was blocked, retry after allowing it. Still stuck? See the Troubleshooting section below.',
    keywords: ['cannot', 'login', 'fail', 'blocked', 'popup'],
  },
  {
    id: 'faq-auth-03',
    category: 'authentication',
    question: 'How do I reset my password?',
    answer:
      'YuvaHub uses Google and GitHub for authentication, so password resets are handled by those providers. Use your provider’s “Forgot password” flow, then return to YuvaHub and sign in again.',
    keywords: ['password', 'reset', 'forgot', 'recover'],
  },
  {
    id: 'faq-reg-01',
    category: 'registration',
    question: 'Why did my registration or sign-up fail?',
    answer:
      'Common causes include a cancelled OAuth popup, network interruptions, or an existing session with a different provider. Close other YuvaHub tabs, allow pop-ups, and try signing in once more.',
    keywords: ['register', 'signup', 'fail', 'error', 'oauth'],
  },
  {
    id: 'faq-reg-02',
    category: 'registration',
    question: 'Do I need to verify my email?',
    answer:
      'Verification is handled by your Google or GitHub account. After your first successful sign-in, finish YuvaHub onboarding so your profile is complete and personalized recommendations can start.',
    keywords: ['verify', 'email', 'confirmation', 'onboarding'],
  },
  {
    id: 'faq-events-01',
    category: 'events',
    question: 'How do I find hackathons and events?',
    answer:
      'Open Opportunities and filter by type (for example Hackathon). You can also search from the top bar. Bookmark events you care about so they appear under Bookmarks.',
    keywords: ['hackathon', 'event', 'workshop', 'filter'],
  },
  {
    id: 'faq-opp-01',
    category: 'opportunities',
    question: 'How are opportunities verified?',
    answer:
      'Listings go through verification checks and community reporting. Verified badges indicate audited company identity. Flag suspicious posts so moderators can review them.',
    keywords: ['verified', 'authentic', 'scam', 'flag', 'jobs'],
  },
  {
    id: 'faq-opp-02',
    category: 'opportunities',
    question: 'How do I apply to an opportunity?',
    answer:
      'Open an opportunity for details, then follow the Apply link or Apply Assist flow when available. Complete your profile first so applications reflect accurate skills and experience.',
    keywords: ['apply', 'application', 'submit', 'assist'],
  },
  {
    id: 'faq-opp-03',
    category: 'opportunities',
    question: 'Can I save opportunities for later?',
    answer:
      'Yes. Use the bookmark icon on any opportunity card. Saved items live in the Bookmarks tab so you can revisit deadlines and details later.',
    keywords: ['bookmark', 'save', 'later', 'favorites'],
  },
  {
    id: 'faq-sec-01',
    category: 'security',
    question: 'How does YuvaHub protect my account?',
    answer:
      'Authentication is delegated to trusted providers (Google/GitHub). Review the Security Center for best practices, and never share session credentials. Report suspicious activity via Support & Feedback.',
    keywords: ['secure', 'protect', 'hack', 'safety'],
  },
  {
    id: 'faq-sec-02',
    category: 'security',
    question: 'What should I do if I suspect unauthorized access?',
    answer:
      'Secure your Google or GitHub account immediately (change password, review active sessions), then sign out of YuvaHub on shared devices. Contact support if you notice unexpected profile changes.',
    keywords: ['unauthorized', 'breach', 'suspicious', 'hijack'],
  },
  {
    id: 'faq-privacy-01',
    category: 'privacy',
    question: 'Who can see my profile?',
    answer:
      'Visibility options live under Settings → Privacy. You can control directory listing and community win sharing. Read the Privacy Policy for full details on data use.',
    keywords: ['visibility', 'public', 'private', 'directory'],
  },
  {
    id: 'faq-privacy-02',
    category: 'privacy',
    question: 'Is my personal data sold to advertisers?',
    answer:
      'No. YuvaHub does not sell personal profile data to third-party ad networks. See the Privacy Policy and Legal pages for how data is processed and stored.',
    keywords: ['sell', 'ads', 'tracking', 'data', 'third-party'],
  },
  {
    id: 'faq-notif-01',
    category: 'notifications',
    question: 'How do I manage email notifications?',
    answer:
      'Open Settings → Email Notifications and toggle matches, deadlines, mentor updates, and community mentions. Changes apply to future emails from YuvaHub.',
    keywords: ['email', 'alerts', 'toggle', 'unsubscribe'],
  },
  {
    id: 'faq-notif-02',
    category: 'notifications',
    question: 'Why am I missing notifications?',
    answer:
      'Check Settings toggles first, then your spam folder and provider filters. Browser notification permission (if used) must also be allowed for YuvaHub.',
    keywords: ['missing', 'not receiving', 'spam', 'alerts'],
  },
  {
    id: 'faq-settings-01',
    category: 'settings',
    question: 'Where can I change theme or account preferences?',
    answer:
      'Use the sun/moon control in the top bar for light/dark theme. Account, privacy, and notification preferences are under the Settings tab in the sidebar.',
    keywords: ['theme', 'dark', 'preferences', 'settings'],
  },
];

const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  {
    id: 'gs-1',
    title: 'Create Account',
    description: 'Sign in with Google or GitHub from the welcome screen.',
    icon: UserPlus,
  },
  {
    id: 'gs-2',
    title: 'Verify Email',
    description: 'Confirm access through your provider account if prompted.',
    icon: MailCheck,
  },
  {
    id: 'gs-3',
    title: 'Complete Profile',
    description: 'Add skills, bio, and links so matches stay relevant.',
    icon: UserCircle,
  },
  {
    id: 'gs-4',
    title: 'Explore Opportunities',
    description: 'Browse, search, and bookmark internships, jobs, and events.',
    icon: Compass,
  },
  {
    id: 'gs-5',
    title: 'Register / Apply',
    description: 'Open a listing and apply—or use Apply Assist when available.',
    icon: FileCheck,
  },
  {
    id: 'gs-6',
    title: 'Need to contact the team or vote on features?',
    description: 'Open Support & Feedback',
    icon: MessageSquare,
  },
];

const TROUBLESHOOTING_GUIDES: TroubleshootingGuide[] = [
  {
    id: 'ts-login',
    title: 'Cannot Login',
    problem: 'Sign-in popup closes or login never completes.',
    cause: 'Blocked pop-ups, mixed Google/GitHub accounts, or a stale browser session.',
    solution:
      'Allow pop-ups for YuvaHub, use the same provider as before, clear site cookies for this domain, then try again.',
    icon: LogIn,
  },
  {
    id: 'ts-password',
    title: 'Forgot Password',
    problem: 'You need to reset credentials before signing in.',
    cause: 'Passwords are managed by Google or GitHub, not stored inside YuvaHub.',
    solution:
      'Reset the password on your identity provider, then return here and sign in with that updated account.',
    icon: KeyRound,
  },
  {
    id: 'ts-registration',
    title: 'Registration Failed',
    problem: 'First-time sign-up errors out or loops back to the home page.',
    cause: 'Cancelled OAuth consent, network drops, or conflicting open sessions.',
    solution:
      'Close duplicate YuvaHub tabs, check your connection, complete the provider consent screen, and retry once.',
    icon: Ban,
  },
  {
    id: 'ts-email',
    title: 'Email Verification',
    problem: 'You are unsure whether your email is verified for YuvaHub.',
    cause: 'Email verification is owned by Google/GitHub; YuvaHub relies on a successful OAuth login.',
    solution:
      'Verify the email on your provider account, sign out and back into YuvaHub, then finish onboarding.',
    icon: MailCheck,
  },
  {
    id: 'ts-notifications',
    title: 'Notifications Missing',
    problem: 'You stop receiving match or deadline emails.',
    cause: 'Disabled Settings toggles, spam filtering, or provider inbox rules.',
    solution:
      'Re-enable toggles under Settings → Email Notifications, check spam, and whitelist YuvaHub mail.',
    icon: BellOff,
  },
  {
    id: 'ts-slow',
    title: 'Slow Loading',
    problem: 'Pages or opportunity lists feel delayed.',
    cause: 'Slow network, busy search indexes, or a temporarily offline backend strip.',
    solution:
      'Refresh once, check the Live/Offline indicator in the footer, and try again on a stronger connection.',
    icon: Loader,
  },
];

const CATEGORY_LABELS: Record<Exclude<FaqCategory, 'all'>, string> = {
  general: 'General',
  account: 'Account',
  authentication: 'Authentication',
  registration: 'Registration',
  events: 'Events',
  opportunities: 'Opportunities',
  security: 'Security',
  privacy: 'Privacy',
  notifications: 'Notifications',
  settings: 'Settings',
};

/* ── Component ─────────────────────────────────────────────────────────── */

export default function HelpCenter() {
  const { user, setActiveTab, setGettingStartedStep } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedTroubleshootId, setExpandedTroubleshootId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Set loaded state to trigger fade-in transition on mounting
  useEffect(() => {
    setLoaded(true);
  }, []);

  // Filter FAQs by category chip + live search (question, answer, category, keywords)
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter((faq) => {
      if (activeCategory !== 'all' && faq.category !== activeCategory) {
        return false;
      }
      if (!query) return true;

      const haystack = [
        faq.question,
        faq.answer,
        faq.category,
        CATEGORY_LABELS[faq.category],
        ...faq.keywords,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [searchQuery, activeCategory]);

  // Toggle accordion — only one item open at a time; click open item to close
  const handleToggleFaq = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleToggleTroubleshoot = (id: string) => {
    setExpandedTroubleshootId((prev) => (prev === id ? null : id));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setExpandedId(null);
  };

  const handleStepClick = (_stepId: string) => {
    // Every Getting Started card navigates to the Dashboard (home).
    setGettingStartedStep(null);
    setActiveTab('dashboard');
    scrollContentToTop();
  };

  return (
    <div className={`max-w-6xl mx-auto pb-16 transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header / Hero */}
      <header className="mb-10 text-center py-12 px-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 dark:from-gray-800/40 dark:to-gray-900/10 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden transition-all duration-300">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/10" />
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-3 relative z-10">
          <HelpCircle className="w-10 h-10 text-blue-600 dark:text-blue-500 animate-pulse" aria-hidden="true" />
          Help Center &amp; FAQ
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto relative z-10 leading-relaxed">
          Find answers to common questions, troubleshoot issues, and learn how to use YuvaHub effectively.
        </p>

        {/* Search Bar inside Hero */}
        <div className="mt-8 max-w-2xl mx-auto relative z-10 transition-all duration-300 focus-within:scale-[1.01]">
          <label htmlFor="help-search" className="sr-only">
            Search help topics
          </label>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="help-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, answers, categories…"
              autoComplete="off"
              className="w-full pl-12 pr-32 py-3.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all text-gray-900 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Category filters */}
      <div
        className="flex flex-wrap justify-center gap-2 mb-10"
        role="group"
        aria-label="FAQ categories"
      >
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
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-transparent'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
              }`}
              aria-pressed={isActive}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Main: FAQs + Onboarding Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
        <section className="lg:col-span-2 space-y-5" aria-labelledby="faq-heading">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div>
              <h2 id="faq-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {filteredFaqs.length} topic{filteredFaqs.length === 1 ? '' : 's'}
                {searchQuery || activeCategory !== 'all' ? ' matching your filters' : ''}
              </p>
            </div>
          </div>

          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800/50 transition-all duration-300">
              <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
              <p className="font-semibold text-gray-800 dark:text-gray-300">No matching questions found.</p>
              <p className="text-xs text-gray-500 mt-1 mb-6">Try a different keyword or clear your filters.</p>
              <button
                type="button"
                onClick={() => {
                  clearSearch();
                  setActiveCategory('all');
                }}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg"
              >
                Clear Search &amp; Filters
              </button>
            </div>
          ) : (
            <ul className="space-y-4 list-none p-0 m-0 transition-all duration-500">
              {filteredFaqs.map((faq, index) => (
                <FaqAccordion
                  key={faq.id}
                  faq={{
                    id: faq.id,
                    category: CATEGORY_LABELS[faq.category],
                    question: faq.question,
                    answer: faq.answer,
                  }}
                  isOpen={expandedId === faq.id}
                  onToggle={() => handleToggleFaq(faq.id)}
                  index={index}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Onboarding Timeline Sidebar */}
        <aside className="space-y-6" aria-labelledby="getting-started-heading">
          <div>
            <h2 id="getting-started-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
              Getting Started
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              A quick path from signup to your first application.
            </p>
          </div>

          <div className="relative pl-6 border-l-2 border-blue-100 dark:border-gray-800 space-y-6">
            {GETTING_STARTED_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative group">
                  {/* Timeline point indicator */}
                  <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-white border-2 border-blue-500 dark:bg-gray-900 transition-all duration-300 group-hover:scale-125 group-hover:bg-blue-600" />
                  
                  <div
                    onClick={() => handleStepClick(step.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleStepClick(step.id); }}
                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-2xl flex gap-4 items-start shadow-sm cursor-pointer hover:shadow-md hover:border-blue-500/30 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-blue-600">
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Troubleshooting */}
      <section aria-labelledby="troubleshooting-heading" className="space-y-6">
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

        {/*
          CRITICAL FIX: items-start prevents collapsed cards from stretching
          to match the height of an expanded sibling in the same grid row.
          Each card is self-contained; only the card with expandedTroubleshootId === guide.id expands.
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
          {TROUBLESHOOTING_GUIDES.map((guide, index) => {
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
                  aria-controls={`ts-panel-tab-${guide.id}`}
                  className="w-full p-5 flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 transition-colors duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-900/20"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isExpanded
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 scale-110'
                      : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 group-hover:scale-110'
                  }`}>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <h3 className={`text-sm font-bold flex-1 transition-colors duration-200 ${
                    isExpanded
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}>{guide.title}</h3>
                  <ChevronDown
                    className={`w-4 h-4 transition-all duration-300 ease-out shrink-0 ${
                      isExpanded ? 'rotate-180 text-blue-500' : 'text-gray-400'
                    }`}
                  />
                </button>

                {/* Expandable content — grid-rows trick for smooth height animation */}
                <div
                  id={`ts-panel-tab-${guide.id}`}
                  role="region"
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden min-h-0">
                    <div className={`px-5 pb-5 pt-0 border-t transition-all duration-300 ${
                      isExpanded
                        ? 'opacity-100 border-blue-100 dark:border-blue-900/30'
                        : 'opacity-0 border-gray-100 dark:border-gray-700'
                    }`}>
                      <dl className="space-y-3 text-xs leading-relaxed mt-4">
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400 mb-1">Problem</dt>
                          <dd className="text-gray-700 dark:text-gray-300 m-0">{guide.problem}</dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400 mb-1">Cause</dt>
                          <dd className="text-gray-700 dark:text-gray-300 m-0">{guide.cause}</dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-[10px] text-gray-500 dark:text-gray-400 mb-1">Solution</dt>
                          <dd className="text-gray-700 dark:text-gray-300 m-0 font-medium text-blue-600 dark:text-blue-400">{guide.solution}</dd>
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

      {/* Community Guidelines callout */}
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
  );
}

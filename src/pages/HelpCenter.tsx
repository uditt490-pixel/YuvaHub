/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  HelpCircle, Search, X, ChevronDown, UserPlus, MailCheck, UserCircle,
  Compass, FileCheck, AlertTriangle, KeyRound, Shield, BellOff, Loader,
  LogIn, Ban, MessageSquare, ArrowRight, Bug, Lightbulb, Users, ChevronUp,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { FaqAccordion } from '../components/ui/FaqAccordion';

/* ── Types ─────────────────────────────────────────────────────────────── */
type FaqCategory =
  | 'all' | 'general' | 'account' | 'authentication' | 'registration'
  | 'events' | 'opportunities' | 'security' | 'privacy' | 'notifications' | 'settings';

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

const CATEGORY_LABELS: Record<Exclude<FaqCategory, 'all'>, string> = {
  general: 'General', account: 'Account', authentication: 'Authentication',
  registration: 'Registration', events: 'Events', opportunities: 'Opportunities',
  security: 'Security', privacy: 'Privacy', notifications: 'Notifications', settings: 'Settings',
};

const FAQ_ITEMS: FaqItem[] = [
  { id: 'faq-general-01', category: 'general', question: 'What is YuvaHub?',
    answer: 'YuvaHub is a platform that helps students and early-career professionals discover verified opportunities—internships, hackathons, scholarships, jobs—and connect with mentors and community discussions in one place.',
    keywords: ['yuvahub', 'platform', 'about', 'overview', 'what'] },
  { id: 'faq-general-02', category: 'general', question: 'How do I get started on YuvaHub?',
    answer: 'Sign in with Google or GitHub, complete onboarding and your profile, then explore Opportunities from the sidebar. You can bookmark listings, ask the AI Assistant for matches, and join Community discussions anytime.',
    keywords: ['start', 'onboarding', 'begin', 'first', 'setup'] },
  { id: 'faq-account-01', category: 'account', question: 'How do I edit my profile?',
    answer: 'Open the Profile tab from the sidebar and use Edit Profile to update your photo, bio, skills, and social links. Keeping skills up to date helps the AI Assistant recommend better matches.',
    keywords: ['profile', 'edit', 'bio', 'skills', 'picture'] },
  { id: 'faq-account-02', category: 'account', question: 'How do I change my email address?',
    answer: 'Your sign-in email comes from your Google or GitHub account. To use a different email, sign in with the provider account that owns that address. For account-linked email questions, visit Support & Feedback.',
    keywords: ['email', 'change', 'update', 'address'] },
  { id: 'faq-account-03', category: 'account', question: 'How do I delete my account?',
    answer: 'Go to Settings → Account Control and choose Delete Account. This permanently removes your profile data and cannot be undone. Export anything you need before confirming.',
    keywords: ['delete', 'remove', 'close', 'deactivate', 'account'] },
  { id: 'faq-auth-01', category: 'authentication', question: 'Which sign-in methods does YuvaHub support?',
    answer: 'You can sign in with Google or GitHub from the welcome screen. Choose the same provider each time so your profile and bookmarks stay linked to the correct account.',
    keywords: ['login', 'signin', 'google', 'github', 'oauth'] },
  { id: 'faq-auth-02', category: 'authentication', question: 'I cannot log in — what should I try?',
    answer: 'Confirm you are using the same provider (Google or GitHub) as before, allow pop-ups for YuvaHub, and check that cookies are enabled. If the popup was blocked, retry after allowing it. Still stuck? See the Troubleshooting section below.',
    keywords: ['cannot', 'login', 'fail', 'blocked', 'popup'] },
  { id: 'faq-auth-03', category: 'authentication', question: 'How do I reset my password?',
    answer: "YuvaHub uses Google and GitHub for authentication, so password resets are handled by those providers. Use your provider's \"Forgot password\" flow, then return to YuvaHub and sign in again.",
    keywords: ['password', 'reset', 'forgot', 'recover'] },
  { id: 'faq-reg-01', category: 'registration', question: 'Why did my registration or sign-up fail?',
    answer: 'Common causes include a cancelled OAuth popup, network interruptions, or an existing session with a different provider. Close other YuvaHub tabs, allow pop-ups, and try signing in once more.',
    keywords: ['register', 'signup', 'fail', 'error', 'oauth'] },
  { id: 'faq-reg-02', category: 'registration', question: 'Do I need to verify my email?',
    answer: 'Verification is handled by your Google or GitHub account. After your first successful sign-in, finish YuvaHub onboarding so your profile is complete and personalized recommendations can start.',
    keywords: ['verify', 'email', 'confirmation', 'onboarding'] },
  { id: 'faq-events-01', category: 'events', question: 'How do I find hackathons and events?',
    answer: 'Open Opportunities and filter by type (for example Hackathon). You can also search from the top bar. Bookmark events you care about so they appear under Bookmarks.',
    keywords: ['hackathon', 'event', 'workshop', 'filter'] },
  { id: 'faq-opp-01', category: 'opportunities', question: 'How are opportunities verified?',
    answer: 'Listings go through verification checks and community reporting. Verified badges indicate audited company identity. Flag suspicious posts so moderators can review them.',
    keywords: ['verified', 'authentic', 'scam', 'flag', 'jobs'] },
  { id: 'faq-opp-02', category: 'opportunities', question: 'How do I apply to an opportunity?',
    answer: 'Open an opportunity for details, then follow the Apply link or Apply Assist flow when available. Complete your profile first so applications reflect accurate skills and experience.',
    keywords: ['apply', 'application', 'submit', 'assist'] },
  { id: 'faq-opp-03', category: 'opportunities', question: 'Can I save opportunities for later?',
    answer: 'Yes. Use the bookmark icon on any opportunity card. Saved items live in the Bookmarks tab so you can revisit deadlines and details later.',
    keywords: ['bookmark', 'save', 'later', 'favorites'] },
  { id: 'faq-sec-01', category: 'security', question: 'How does YuvaHub protect my account?',
    answer: 'Authentication is delegated to trusted providers (Google/GitHub). Review the Security Center for best practices, and never share session credentials. Report suspicious activity via Support & Feedback.',
    keywords: ['secure', 'protect', 'hack', 'safety'] },
  { id: 'faq-sec-02', category: 'security', question: 'What should I do if I suspect unauthorized access?',
    answer: 'Secure your Google or GitHub account immediately (change password, review active sessions), then sign out of YuvaHub on shared devices. Contact support if you notice unexpected profile changes.',
    keywords: ['unauthorized', 'breach', 'suspicious', 'hijack'] },
  { id: 'faq-privacy-01', category: 'privacy', question: 'Who can see my profile?',
    answer: 'Visibility options live under Settings → Privacy. You can control directory listing and community win sharing. Read the Privacy Policy for full details on data use.',
    keywords: ['visibility', 'public', 'private', 'directory'] },
  { id: 'faq-privacy-02', category: 'privacy', question: 'Is my personal data sold to advertisers?',
    answer: 'No. YuvaHub does not sell personal profile data to third-party ad networks. See the Privacy Policy and Legal pages for how data is processed and stored.',
    keywords: ['sell', 'ads', 'tracking', 'data', 'third-party'] },
  { id: 'faq-notif-01', category: 'notifications', question: 'How do I manage email notifications?',
    answer: 'Open Settings → Email Notifications and toggle matches, deadlines, mentor updates, and community mentions. Changes apply to future emails from YuvaHub.',
    keywords: ['email', 'alerts', 'toggle', 'unsubscribe'] },
  { id: 'faq-notif-02', category: 'notifications', question: 'Why am I missing notifications?',
    answer: 'Check Settings toggles first, then your spam folder and provider filters. Browser notification permission (if used) must also be allowed for YuvaHub.',
    keywords: ['missing', 'not receiving', 'spam', 'alerts'] },
  { id: 'faq-settings-01', category: 'settings', question: 'Where can I change theme or account preferences?',
    answer: 'Use the sun/moon control in the top bar for light/dark theme. Account, privacy, and notification preferences are under the Settings tab in the sidebar.',
    keywords: ['theme', 'dark', 'preferences', 'settings'] },
];

const GETTING_STARTED_STEPS: GettingStartedStep[] = [
  { id: 'gs-1', title: 'Create Account', description: 'Sign in with Google or GitHub from the welcome screen.', icon: UserPlus },
  { id: 'gs-2', title: 'Verify Email', description: 'Confirm access through your provider account if prompted.', icon: MailCheck },
  { id: 'gs-3', title: 'Complete Profile', description: 'Add skills, bio, and links so matches stay relevant.', icon: UserCircle },
  { id: 'gs-4', title: 'Explore Opportunities', description: 'Browse, search, and bookmark internships, jobs, and events.', icon: Compass },
  { id: 'gs-5', title: 'Register / Apply', description: 'Open a listing and apply—or use Apply Assist when available.', icon: FileCheck },
  { id: 'gs-6', title: 'Support & Feedback', description: 'Contact the team or vote on features.', icon: MessageSquare },
];

const TROUBLESHOOTING_GUIDES: TroubleshootingGuide[] = [
  { id: 'ts-login', title: 'Cannot Login',
    problem: 'Sign-in popup closes or login never completes.',
    cause: 'Blocked pop-ups, mixed Google/GitHub accounts, or a stale browser session.',
    solution: 'Allow pop-ups for YuvaHub, use the same provider as before, clear site cookies for this domain, then try again.',
    icon: LogIn },
  { id: 'ts-password', title: 'Forgot Password',
    problem: 'You need to reset credentials before signing in.',
    cause: 'Passwords are managed by Google or GitHub, not stored inside YuvaHub.',
    solution: 'Reset the password on your identity provider, then return here and sign in with that updated account.',
    icon: KeyRound },
  { id: 'ts-registration', title: 'Registration Failed',
    problem: 'First-time sign-up errors out or loops back to the home page.',
    cause: 'Cancelled OAuth consent, network drops, or conflicting open sessions.',
    solution: 'Close duplicate YuvaHub tabs, check your connection, complete the provider consent screen, and retry once.',
    icon: Ban },
  { id: 'ts-email', title: 'Email Verification',
    problem: 'You are unsure whether your email is verified for YuvaHub.',
    cause: 'Email verification is owned by Google/GitHub; YuvaHub relies on a successful OAuth login.',
    solution: 'Verify the email on your provider account, sign out and back into YuvaHub, then finish onboarding.',
    icon: MailCheck },
  { id: 'ts-notifications', title: 'Notifications Missing',
    problem: 'You stop receiving match or deadline emails.',
    cause: 'Disabled Settings toggles, spam filtering, or provider inbox rules.',
    solution: 'Re-enable toggles under Settings → Email Notifications, check spam, and whitelist YuvaHub mail.',
    icon: BellOff },
  { id: 'ts-slow', title: 'Slow Loading',
    problem: 'Pages or opportunity lists feel delayed.',
    cause: 'Slow network, busy search indexes, or a temporarily offline backend strip.',
    solution: 'Refresh once, check the Live/Offline indicator in the footer, and try again on a stronger connection.',
    icon: Loader },
];

const SUPPORT_CARDS = [
  { id: 'support-contact', title: 'Contact Support', description: 'Get personalized help from our support team', icon: MessageSquare, action: 'support', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900' },
  { id: 'support-bug', title: 'Report a Bug', description: 'Help us improve by reporting issues', icon: Bug, action: 'support', color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900' },
  { id: 'support-feature', title: 'Request a Feature', description: 'Share your ideas for improvements', icon: Lightbulb, action: 'support', color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900' },
  { id: 'support-community', title: 'Community Help', description: 'Get help from other YuvaHub users', icon: Users, action: 'community', color: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900' },
];

/* ── Component ─────────────────────────────────────────────────────────── */

export default function HelpCenterPage() {
  const { setActiveTab } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FaqCategory>('all');
  // FIX: Single accordion state — only ONE FAQ open at a time
  const [activeFaqId, setActiveFaqId] = useState<string | null>(null);
  // FIX: Single troubleshooting accordion — only ONE card open at a time
  const [activeTroubleshootId, setActiveTroubleshootId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Filtered FAQs — single source of truth
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((faq) => {
      if (activeCategory !== 'all' && faq.category !== activeCategory) return false;
      if (!query) return true;
      const haystack = [faq.question, faq.answer, faq.category, CATEGORY_LABELS[faq.category], ...faq.keywords].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [searchQuery, activeCategory]);

  // FIX: True accordion — one item at a time
  const handleToggleFaq = useCallback((id: string) => {
    setActiveFaqId((prev) => (prev === id ? null : id));
  }, []);

  // FIX: True accordion for troubleshooting — one card at a time
  const handleToggleTroubleshoot = useCallback((id: string) => {
    setActiveTroubleshootId((prev) => (prev === id ? null : id));
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setActiveFaqId(null);
  };

  const handleStepClick = (_stepId: string) => {
    // Every Getting Started card navigates to the Dashboard (home).
    setActiveTab('dashboard');
  };

  return (
    <div className="bg-background min-h-[calc(100vh-64px)] font-sans pb-16">
      <div className={`max-w-6xl mx-auto px-4 py-8 transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}>

        {/* Hero Section */}
        <header className="mb-10 text-center py-10 px-6 bg-surface rounded-2xl border border-border-theme shadow-xs relative overflow-hidden">
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-text-primary flex items-center justify-center gap-3 relative z-10">
            <div className="relative">
              <HelpCircle className="w-9 h-9 text-primary-blue" aria-hidden="true" />
            </div>
            Help Center &amp; FAQ
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-2.5 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Find answers to common questions, troubleshoot issues, and learn how to use YuvaHub efficiently.
          </p>
          <div className="mt-6 max-w-2xl mx-auto relative z-10">
            <label htmlFor="help-search" className="sr-only">Search help topics</label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" aria-hidden="true" />
              <input id="help-search" type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions, answers, categories…" autoComplete="off"
                className="w-full pl-11 pr-28 py-3 text-xs bg-background border border-border-theme rounded-xl outline-none focus:border-primary-blue text-text-primary placeholder:text-text-muted" />
              {searchQuery && (
                <button type="button" onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg text-text-secondary bg-surface-secondary border border-border-theme cursor-pointer">
                  <X className="w-3.5 h-3.5" aria-hidden="true" />Clear
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10" role="group" aria-label="FAQ categories">
          {FAQ_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button key={cat.id} type="button" onClick={() => { setActiveCategory(cat.id); setActiveFaqId(null); }}
                className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive ? 'bg-primary-blue text-white shadow-xs'
                    : 'bg-surface text-text-secondary border border-border-theme hover:bg-surface-secondary'
                }`}
                aria-pressed={isActive}>
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Main grid: FAQs + Getting Started */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">

          {/* FAQ Section — 2/3 width */}
          <section className="lg:col-span-2 space-y-5" aria-labelledby="faq-heading">
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div>
                <h2 id="faq-heading" className="text-xl font-serif font-bold text-text-primary">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {filteredFaqs.length} topic{filteredFaqs.length === 1 ? '' : 's'}
                  {searchQuery || activeCategory !== 'all' ? ' matching your filters' : ''}
                </p>
              </div>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16 px-4 border border-dashed border-border-theme rounded-2xl bg-surface">
                <AlertTriangle className="w-10 h-10 text-text-muted mx-auto mb-3" aria-hidden="true" />
                <p className="font-serif font-bold text-sm text-text-primary">No matching questions found.</p>
                <p className="text-xs text-text-secondary mt-1 mb-5">Try a different keyword or clear your filters.</p>
                <button type="button" onClick={() => { clearSearch(); setActiveCategory('all'); }}
                  className="text-xs font-extrabold uppercase tracking-wider text-primary-blue hover:underline px-4 py-2 bg-surface-secondary rounded-xl border border-border-theme cursor-pointer">
                  Clear Search &amp; Filters
                </button>
              </div>
            ) : (
              <ul className="space-y-4 list-none p-0 m-0">
                {filteredFaqs.map((faq, index) => (
                  <FaqAccordion
                    key={faq.id}
                    faq={{ id: faq.id, category: CATEGORY_LABELS[faq.category], question: faq.question, answer: faq.answer }}
                    isOpen={activeFaqId === faq.id}
                    onToggle={() => handleToggleFaq(faq.id)}
                    index={index}
                    searchQuery={searchQuery}
                  />
                ))}
              </ul>
            )}
          </section>

          {/* Getting Started Sidebar — 1/3 width, vertical timeline */}
          <aside className="space-y-6" aria-labelledby="getting-started-heading">
            <div>
              <h2 id="getting-started-heading" className="text-xl font-serif font-bold text-text-primary">
                Getting Started
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                A quick path from signup to your first application.
              </p>
            </div>

            {/* Vertical timeline layout */}
            <div className="relative pl-6 border-l-2 border-border-theme space-y-4">
              {GETTING_STARTED_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-surface border-2 border-primary-blue transition-all duration-300 group-hover:bg-primary-blue" />
                    <div
                      onClick={() => handleStepClick(step.id)}
                      role="button"
                      tabIndex={0}
                      className="bg-surface border border-border-theme p-4 rounded-2xl flex gap-3 items-start shadow-xs cursor-pointer hover:border-primary-blue transition-all duration-300 select-none"
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-serif font-bold text-text-primary group-hover:text-primary-blue">
                          {step.title}
                        </h3>
                        <p className="text-[11px] text-text-secondary mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary-blue shrink-0 mt-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        {/* Troubleshooting */}
        <section aria-labelledby="troubleshooting-heading" className="space-y-6 mb-16">
          <div>
            <h2 id="troubleshooting-heading" className="text-xl font-serif font-bold text-text-primary flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-blue" aria-hidden="true" />
              Troubleshooting Guides
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Common issues with problem, cause, and solution.
            </p>
          </div>

          {/*
            CRITICAL FIX: grid with items-start so cards don't stretch to match row height.
            Each card is self-contained. activeTroubleshootId controls which ONE card is open.
            Collapsed cards keep their compact height. No blank white boxes.
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
            {TROUBLESHOOTING_GUIDES.map((guide) => {
              const Icon = guide.icon;
              const isExpanded = activeTroubleshootId === guide.id;
              return (
                <article
                  key={guide.id}
                  className={`bg-surface border rounded-2xl overflow-hidden transition-all duration-300 group ${
                    isExpanded
                      ? 'border-primary-blue shadow-xs'
                      : 'border-border-theme hover:border-primary-blue'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleTroubleshoot(guide.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`ts-panel-${guide.id}`}
                    className="w-full p-5 flex items-center gap-3 text-left focus:outline-none transition-colors hover:bg-background cursor-pointer"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isExpanded
                        ? 'bg-[#603620] text-[#f3e4bd]'
                        : 'bg-surface-secondary text-primary-blue'
                    }`}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <h3 className={`text-xs font-serif font-bold flex-1 transition-colors ${
                      isExpanded ? 'text-primary-blue' : 'text-text-primary group-hover:text-primary-blue'
                    }`}>{guide.title}</h3>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 shrink-0 ${
                      isExpanded ? 'rotate-180 text-primary-blue' : 'text-text-muted'
                    }`} />
                  </button>

                  <div
                    id={`ts-panel-${guide.id}`}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-300 ${
                      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden min-h-0">
                      <div className={`px-5 pb-5 pt-0 border-t transition-all ${
                        isExpanded ? 'opacity-100 border-border-theme' : 'opacity-0 border-transparent'
                      }`}>
                        <dl className="space-y-3 text-xs leading-relaxed mt-4">
                          <div>
                            <dt className="font-extrabold uppercase tracking-wider text-[10px] text-text-secondary mb-1">Problem</dt>
                            <dd className="text-text-primary m-0">{guide.problem}</dd>
                          </div>
                          <div>
                            <dt className="font-extrabold uppercase tracking-wider text-[10px] text-text-secondary mb-1">Cause</dt>
                            <dd className="text-text-primary m-0">{guide.cause}</dd>
                          </div>
                          <div>
                            <dt className="font-extrabold uppercase tracking-wider text-[10px] text-text-secondary mb-1">Solution</dt>
                            <dd className="text-primary-blue m-0 font-bold">{guide.solution}</dd>
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

        {/* Support Section */}
        <section aria-labelledby="support-heading" className="space-y-6">
          <div>
            <h2 id="support-heading" className="text-xl font-serif font-bold text-text-primary flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-blue" aria-hidden="true" />
              Need More Help?
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Get personalized support or connect with our community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SUPPORT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <button key={card.id} type="button"
                  onClick={() => setActiveTab(card.action)}
                  className="group relative overflow-hidden bg-surface border border-border-theme rounded-2xl p-6 text-left shadow-xs transition-all duration-300 hover:border-primary-blue cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-serif font-bold text-text-primary mb-1.5 group-hover:text-primary-blue transition-colors">{card.title}</h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{card.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-extrabold uppercase text-primary-blue">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

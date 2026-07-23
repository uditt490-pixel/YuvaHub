/**
 * Guidelines.tsx — Community Guidelines Center
 * GitHub Issue #85: Introduce a Community Guidelines Center
 *
 * Design system: mirrors Security.tsx / Support.tsx
 *   • max-w-6xl mx-auto, Tailwind v4, CSS custom-property tokens
 *   • Lucide React icons — no new dependencies
 *   • Single-open FAQ accordion via grid-rows animation trick
 *     (same pattern used in SplashAuth.tsx FAQ)
 *
 * Sections
 *  1. Hero
 *  2. Platform Mission
 *  3. Code of Conduct
 *  4. Acceptable Use Policy
 *  5. Content Moderation timeline
 *  6. Community Safety Principles
 *  7. Reporting Process timeline
 *  8. Enforcement Policy
 *  9. Best Practices
 * 10. FAQ Accordion
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
  ShieldCheck,
  Heart,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  Scale,
  Star,
  Lock,
  Eye,
  Handshake,
  ChevronDown,
  ArrowRight,
  BookOpen,
  Megaphone,
  Lightbulb,
  UserCheck,
  Ban,
  ClipboardList,
  Info,
  HelpCircle,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

// ─── Static data ──────────────────────────────────────────────────────────────

const MISSION_CARDS = [
  {
    icon: Users,
    title: 'Why Standards Matter',
    body: 'Community standards protect every member. Without shared norms, platforms become hostile. Our guidelines ensure every student — beginner or expert — feels safe to participate.',
  },
  {
    icon: Heart,
    title: 'Respectful Collaboration',
    body: 'When people treat each other with respect, ideas flow freely. Constructive feedback, inclusive language, and empathy accelerate learning for everyone.',
  },
  {
    icon: ShieldCheck,
    title: 'Building Trust',
    body: 'Trust is the foundation of any community. Consistent enforcement, transparent policies, and fair moderation keep YuvaHub a place worth contributing to.',
  },
  {
    icon: Star,
    title: 'Positive Participation',
    body: "Your contributions shape the culture. Welcoming newcomers, sharing resources, and recognising peers' achievements makes YuvaHub more valuable for all.",
  },
];

const CODE_OF_CONDUCT = [
  {
    icon: Users,
    title: 'Respect Everyone',
    body: 'Treat every member with dignity regardless of skill level, background, or experience. Dismissive responses to beginner questions are not acceptable.',
  },
  {
    icon: MessageSquare,
    title: 'Inclusive Language',
    body: 'Choose words that welcome rather than exclude. Avoid jargon-gatekeeping, gendered assumptions, and culturally insensitive expressions.',
  },
  {
    icon: Shield,
    title: 'No Harassment',
    body: 'Unsolicited personal messages, targeted criticism, and pile-ons are strictly prohibited. Report harassment immediately.',
  },
  {
    icon: Ban,
    title: 'No Hate Speech',
    body: 'Content that demeans people based on race, religion, gender, nationality, sexual orientation, disability, or age will be removed immediately.',
  },
  {
    icon: Handshake,
    title: 'Professional Communication',
    body: 'Keep discussions on-topic and solution-oriented. Sarcasm, passive-aggression, and bad-faith arguments undermine productive conversations.',
  },
  {
    icon: Lightbulb,
    title: 'Constructive Feedback',
    body: 'Critique the work, not the person. Offer specific, actionable suggestions and acknowledge what someone did well before noting areas for improvement.',
  },
];

const ALLOWED_USES = [
  'Learning new skills and discovering opportunities',
  'Networking with peers, mentors, and organisations',
  'Collaborating on hackathons and group projects',
  'Sharing verified internships, scholarships, and fellowships',
  'Exchanging knowledge, tips, and study resources',
  'Giving and receiving constructive mentorship',
];

const PROHIBITED_USES = [
  'Posting spam, duplicate listings, or promotional content',
  'Harassing, threatening, or abusing other members',
  'Creating fake or impersonation accounts',
  'Fraud, phishing, or data-harvesting schemes',
  'Offensive, hateful, or sexually explicit content',
  'Spreading misinformation about opportunities or organisations',
];

const MODERATION_STEPS = [
  { label: 'User Creates Content', desc: 'A post, comment, or opportunity listing is published on YuvaHub.' },
  { label: 'Community Review', desc: 'Members interact with the content; concerns may be observed.' },
  { label: 'Report Submitted', desc: 'Any member flags the content using the Report flow.' },
  { label: 'Moderator Review', desc: 'Our team assesses the flag against community standards within 12 hours.' },
  { label: 'Decision Made', desc: 'Content is approved, edited, or removed based on findings.' },
  { label: 'Action Applied', desc: 'A warning, restriction, or ban is issued where appropriate.' },
  { label: 'Appeal Window', desc: 'The affected member has 7 days to appeal any moderation decision.' },
];

const SAFETY_PRINCIPLES = [
  { icon: Lock,      title: 'Privacy',      body: "Never share another member's personal information without explicit consent." },
  { icon: ShieldCheck, title: 'Security',   body: 'Report suspicious links, phishing attempts, or unusual account activity immediately.' },
  { icon: Heart,     title: 'Respect',      body: 'Assume positive intent. Ask clarifying questions before assuming bad faith.' },
  { icon: Star,      title: 'Integrity',    body: 'Be honest about your experience, credentials, and the opportunities you share.' },
  { icon: Eye,       title: 'Transparency', body: 'Conflicts of interest should be disclosed. Sponsored content must be clearly labelled.' },
  { icon: Handshake, title: 'Trust',        body: 'Follow through on commitments — mentor bookings, collaboration invites, and deadlines.' },
];

const REPORTING_STEPS = [
  { icon: Flag,          step: 1, title: 'Report Content',  desc: "Click the flag icon on any post, comment, or listing to open the report dialog." },
  { icon: ClipboardList, step: 2, title: 'Initial Review',  desc: 'Automated filters triage the report and queue it for human review.' },
  { icon: Scale,         step: 3, title: 'Investigation',   desc: "A moderator reviews the content, the reporter's note, and prior history within 12 hours." },
  { icon: CheckCircle2,  step: 4, title: 'Resolution',      desc: 'A decision is reached: content approved, edited, removed, or account actioned.' },
  { icon: MessageSquare, step: 5, title: 'Feedback',        desc: 'Both the reporter and the reported member receive a notification of the outcome.' },
];

const ENFORCEMENT_STAGES = [
  {
    icon: Info,
    label: 'Friendly Reminder',
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    desc: 'A private note explains which guideline was brushed. Content may be edited, no record kept.',
  },
  {
    icon: AlertTriangle,
    label: 'Formal Warning',
    color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    desc: 'An official warning is issued and recorded. The offending content is removed.',
  },
  {
    icon: Lock,
    label: 'Temporary Restriction',
    color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800',
    iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
    desc: 'The account is placed in read-only mode for 48–168 hours depending on severity.',
  },
  {
    icon: Ban,
    label: 'Permanent Ban',
    color: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
    iconColor: 'text-red-600 dark:text-red-400',
    desc: 'Reserved for severe or repeated violations. The account is permanently suspended.',
  },
];

const BEST_PRACTICES = [
  'Complete your profile with accurate information',
  'Be respectful in every comment and message',
  'Give constructive feedback — specific and actionable',
  'Report harmful or misleading content promptly',
  'Welcome and help newcomers to the community',
  'Share only verified, authentic opportunities',
  "Acknowledge others' contributions and ideas",
  'Respect deadlines and honour commitments',
];

const FAQS = [
  {
    id: 'faq-1',
    question: 'What happens after I report someone?',
    answer:
      'Your report enters our moderation queue. A team member reviews it within 12 hours. You will receive a notification confirming the outcome once a decision is made. Reporting is always anonymous to the reported member.',
  },
  {
    id: 'faq-2',
    question: 'Can moderation decisions be appealed?',
    answer:
      'Yes. For warnings and temporary restrictions you have a 7-day window to submit an appeal via the Support & Feedback Center. Explain the context and any misunderstanding. Our team will review and respond within 48 hours. Permanent bans issued for severe violations are generally not eligible for appeal.',
  },
  {
    id: 'faq-3',
    question: 'How are reports reviewed?',
    answer:
      "Reports are first triaged by automated filters to detect clear violations. A human moderator then reviews the flagged content, the reporter's note, the member's history, and relevant context before making a decision. Every report is treated individually.",
  },
  {
    id: 'faq-4',
    question: 'How do I stay safe on YuvaHub?',
    answer:
      'Keep your Google account secure with two-factor authentication. Never share personal contact details in public posts. Report any suspicious links or unusual messages immediately. Review your privacy settings in Settings to control who can see your profile.',
  },
  {
    id: 'faq-5',
    question: 'Can my account be suspended?',
    answer:
      'Yes, if you repeatedly or severely violate our Community Guidelines. We follow a graduated enforcement policy — Friendly Reminder → Formal Warning → Temporary Restriction → Permanent Ban — except for zero-tolerance violations (hate speech, fraud, threats) which may result in an immediate permanent ban.',
  },
];

// ─── Reporting Timeline (animated, interactive) ───────────────────────────────

interface TimelineStep {
  icon: React.ElementType;
  step: number;
  title: string;
  desc: string;
  detail: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    icon: Flag,
    step: 1,
    title: 'Report Content',
    desc: 'Click the flag icon on any post, comment, or listing to open the report dialog.',
    detail: 'Use the ⚑ icon on any card, comment, or opportunity listing. A dialog will appear asking you to choose a reason category. All reports are submitted anonymously.',
  },
  {
    icon: ClipboardList,
    step: 2,
    title: 'Initial Review',
    desc: 'Automated filters triage the report and queue it for human review.',
    detail: 'Our automated classifier scores the report against known violation patterns. High-confidence matches are escalated immediately; lower-confidence reports join a human review queue.',
  },
  {
    icon: Scale,
    step: 3,
    title: 'Investigation',
    desc: "A moderator reviews the content, the reporter's note, and prior history within 12 hours.",
    detail: 'A trained moderator evaluates the flagged content in full context — including the thread, author history, and any previous actions. All reviews are logged for accountability.',
  },
  {
    icon: CheckCircle2,
    step: 4,
    title: 'Resolution',
    desc: 'A decision is reached: content approved, edited, removed, or account actioned.',
    detail: 'Possible outcomes: ① Content approved (report dismissed) ② Content edited to comply ③ Content removed ④ Account warned, restricted, or permanently banned depending on severity.',
  },
  {
    icon: MessageSquare,
    step: 5,
    title: 'Feedback',
    desc: 'Both the reporter and the reported member receive a notification explaining the outcome.',
    detail: 'You will receive an in-app notification and email summary. The reported member also receives an outcome notice. Appeals can be submitted via Support & Feedback within 7 days.',
  },
];

interface ReportingTimelineProps {
  setActiveTab: (tab: string) => void;
}

function ReportingTimeline({ setActiveTab }: ReportingTimelineProps) {
  // Which step is currently expanded (active)
  const [activeStep, setActiveStep] = useState<number | null>(null);
  // Which steps have been animated into view
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Staggered scroll-reveal using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.stepIndex);
            // Stagger each step by 120ms
            setTimeout(() => {
              setVisibleSteps((prev) => new Set(prev).add(idx));
            }, idx * 120);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleStepClick = useCallback((stepNum: number) => {
    setActiveStep((prev) => (prev === stepNum ? null : stepNum));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, stepNum: number) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStepClick(stepNum);
      }
    },
    [handleStepClick]
  );

  return (
    <section ref={sectionRef} aria-labelledby="gl-reporting-heading">
      <SectionHeader
        id="gl-reporting-heading"
        icon={Flag}
        title="Reporting Process"
        subtitle="A step-by-step guide to flagging harmful content or behaviour. Click any step for details."
      />

      {/* Timeline wrapper */}
      <div className="relative">
        {/* Animated vertical line — sits behind all cards */}
        <div
          aria-hidden="true"
          className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 dark:from-blue-900 dark:via-blue-600 dark:to-blue-900 rounded-full"
        />

        <ol className="relative space-y-5 list-none pl-0 m-0" role="list">
          {TIMELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeStep === step.step;
            const isVisible = visibleSteps.has(idx);

            return (
              <li
                key={step.step}
                ref={(el) => { stepRefs.current[idx] = el; }}
                data-step-index={idx}
                className={`flex items-start gap-4 transition-all duration-500 ease-out ${
                  isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.97]'
                }`}
              >
                {/* Timeline node */}
                <div className="relative shrink-0 z-10 mt-0.5">
                  <button
                    type="button"
                    aria-label={`Step ${step.step}: ${step.title}`}
                    onClick={() => handleStepClick(step.step)}
                    onKeyDown={(e) => handleKeyDown(e, step.step)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-blue-500/40 scale-110 shadow-lg'
                        : 'bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:shadow-blue-500/30 hover:scale-110'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} aria-hidden="true" />
                  </button>
                  {/* Pulse ring on active */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"
                    />
                  )}
                </div>

                {/* Card */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isActive}
                  onClick={() => handleStepClick(step.step)}
                  onKeyDown={(e) => handleKeyDown(e, step.step)}
                  className={`flex-1 rounded-2xl border cursor-pointer transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 overflow-hidden ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 dark:border-blue-700 shadow-lg shadow-blue-500/10 -translate-y-0.5'
                      : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-0.5 hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                  }`}
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}>
                        Step {step.step}
                      </span>
                      <h3 className={`text-sm font-bold leading-snug truncate transition-colors duration-200 ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                        {step.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-all duration-300 ${isActive ? 'rotate-180 text-blue-500' : 'text-gray-400'}`}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Summary (always visible) */}
                  <p className="px-5 pb-3 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>

                  {/* Detail (smooth expand via grid-rows trick) */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className={`px-5 pb-5 pt-0 border-t transition-all duration-300 ${
                        isActive
                          ? 'opacity-100 border-blue-100 dark:border-blue-900/30'
                          : 'opacity-0 border-gray-100 dark:border-gray-700'
                      }`}>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
}

function SectionHeader({ id, icon: Icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <div>
        <h2 id={id} className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Guidelines() {
  const { setActiveTab } = useAppContext();

  // Only one FAQ accordion item open at a time
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-20">

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors bg-transparent border-none p-0 cursor-pointer font-medium"
        >
          Home
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Community Guidelines</span>
      </nav>

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="gl-hero-heading"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#4F46E5] p-10 md:p-16 text-white shadow-xl"
      >
        {/* Decorative blobs */}
        <div aria-hidden="true" className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div aria-hidden="true" className="absolute -bottom-12 -left-12 w-60 h-60 rounded-full bg-white/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <h1 id="gl-hero-heading" className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Community Guidelines
          </h1>

          <p className="mt-4 text-base md:text-lg text-blue-100 font-medium leading-relaxed max-w-xl">
            Help us build a respectful, safe and inclusive community for everyone.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#best-practices"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('best-practices')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#1E3A8A] text-sm font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              Learn Best Practices
            </a>
            <button
              type="button"
              onClick={() => {
                setActiveTab('help');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
              Help Center
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('support')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white text-sm font-bold rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Flag className="w-4 h-4" aria-hidden="true" />
              Report a Violation
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-xs text-blue-200">
            <span>Last Updated: July 2026</span>
            <span aria-hidden="true">·</span>
            <span>Version 3.0</span>
            <span aria-hidden="true">·</span>
            <span>Ref: GUIDELINES-2026-C</span>
          </div>
        </div>
      </section>

      {/* ── 2. Platform Mission ──────────────────────────────────────────── */}
      <section aria-labelledby="gl-mission-heading">
        <SectionHeader
          id="gl-mission-heading"
          icon={Megaphone}
          title="Platform Mission"
          subtitle="Why community standards exist and why they matter for every member."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {MISSION_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{card.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 3. Code of Conduct ───────────────────────────────────────────── */}
      <section aria-labelledby="gl-conduct-heading">
        <SectionHeader
          id="gl-conduct-heading"
          icon={BookOpen}
          title="Code of Conduct"
          subtitle="The core principles every YuvaHub member is expected to uphold."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CODE_OF_CONDUCT.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Acceptable Use Policy ─────────────────────────────────────── */}
      <section aria-labelledby="gl-aup-heading">
        <SectionHeader
          id="gl-aup-heading"
          icon={ClipboardList}
          title="Acceptable Use Policy"
          subtitle="What is permitted and what is strictly prohibited on YuvaHub."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allowed */}
          <div className="bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900/40 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-bold text-green-800 dark:text-green-300">Permitted</h3>
            </div>
            <ul className="space-y-3" role="list">
              {ALLOWED_USES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Prohibited */}
          <div className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/40 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-bold text-red-800 dark:text-red-300">Prohibited</h3>
            </div>
            <ul className="space-y-3" role="list">
              {PROHIBITED_USES.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── 5. Content Moderation ────────────────────────────────────────── */}
      <section aria-labelledby="gl-moderation-heading">
        <SectionHeader
          id="gl-moderation-heading"
          icon={Scale}
          title="Content Moderation"
          subtitle="How content is reviewed and actioned — from creation to resolution."
        />
        <ol className="relative space-y-4 pl-0 list-none" role="list">
          {/* Vertical connecting line */}
          <div aria-hidden="true" className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-blue-200 via-blue-400 to-blue-200 dark:from-blue-900 dark:via-blue-700 dark:to-blue-900 rounded-full" />
          {MODERATION_STEPS.map((step, i) => (
            <li key={step.label} className="flex items-start gap-5">
              <div aria-hidden="true" className="shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-md shadow-blue-500/20 z-10">
                {i + 1}
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 flex-1 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{step.label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── 6. Community Safety Principles ──────────────────────────────── */}
      <section aria-labelledby="gl-safety-heading">
        <SectionHeader
          id="gl-safety-heading"
          icon={ShieldCheck}
          title="Community Safety Principles"
          subtitle="The values that keep every interaction on YuvaHub safe and trustworthy."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAFETY_PRINCIPLES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 7. Reporting Process ─────────────────────────────────────────── */}
      <ReportingTimeline setActiveTab={setActiveTab} />

      {/* ── 8. Enforcement Policy ────────────────────────────────────────── */}
      <section aria-labelledby="gl-enforcement-heading">
        <SectionHeader
          id="gl-enforcement-heading"
          icon={UserCheck}
          title="Enforcement Policy"
          subtitle="How we respond to guideline violations — from gentle reminders to permanent bans."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ENFORCEMENT_STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.label}
                className={`border rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${stage.color}`}
              >
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Stage {i + 1}
                </span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stage.iconBg} ${stage.iconColor}`}>
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">{stage.label}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 9. Best Practices ───────────────────────────────────────────── */}
      <section id="best-practices" aria-labelledby="gl-practices-heading">
        <SectionHeader
          id="gl-practices-heading"
          icon={Star}
          title="Best Practices"
          subtitle="A quick checklist for being an outstanding community member."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BEST_PRACTICES.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-5 py-4 shadow-sm hover:shadow-md hover:border-green-200 dark:hover:border-green-800 hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" aria-hidden="true" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. FAQ Accordion ───────────────────────────────────────────── */}
      <section aria-labelledby="gl-faq-heading">
        <SectionHeader
          id="gl-faq-heading"
          icon={MessageSquare}
          title="Frequently Asked Questions"
          subtitle="Common questions about reporting, moderation, and account safety."
        />

        <div className="space-y-3" role="list">
          {FAQS.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                role="listitem"
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'border-blue-300 dark:border-blue-700 shadow-md shadow-blue-500/10 -translate-y-0.5'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm'
                }`}
              >
                {/* Trigger button — keyboard accessible */}
                <button
                  type="button"
                  id={`faq-btn-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${faq.id}`}
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 bg-white dark:bg-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                >
                  <span className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                    {faq.question}
                  </span>
                  {/* Arrow rotates 180° when open */}
                  <span
                    className={`shrink-0 p-1.5 rounded-lg transition-all duration-300 ${
                      isOpen
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rotate-180'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}
                    aria-hidden="true"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {/* Smooth height expansion via grid-rows trick */}
                <div
                  id={`faq-panel-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-btn-${faq.id}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`px-5 pb-5 border-t bg-white dark:bg-gray-800 transition-all duration-300 ${
                        isOpen
                          ? 'opacity-100 border-blue-100 dark:border-blue-900/30 pt-4'
                          : 'opacity-0 border-gray-100 dark:border-gray-700 pt-0'
                      }`}
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA strip ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-2xl p-8 md:p-10 text-center shadow-sm">
        <Shield className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-4" aria-hidden="true" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Questions or concerns?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
          If you witnessed a violation or have questions about these guidelines, our support team is ready to help.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('support')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Flag className="w-4 h-4" aria-hidden="true" />
            Report a Violation
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('help');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
            Visit Help Center
          </button>
        </div>
      </div>

    </div>
  );
}

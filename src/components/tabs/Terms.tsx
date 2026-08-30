import React, { useState } from 'react';
import {
  Scale, FileText, Users, AlertOctagon, CheckCircle2, ArrowRight, ShieldCheck,
  Sparkles, Award, Lock, BookOpen, AlertTriangle
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Terms() {
  const { setActiveTab } = useAppContext();
  const [activeSection, setActiveSection] = useState<string>('agreement');

  const termsSections = [
    {
      id: 'agreement',
      title: '1. Acceptance of Terms & Eligibility',
      icon: FileText,
      badge: 'BINDING AGREEMENT',
      details: [
        {
          heading: 'Binding Legal Contract',
          text: 'These Terms of Service ("Terms") constitute a legally binding agreement between you and YuvaHub Inc. ("YuvaHub", "we", "us"). By registering for an account or browsing YuvaHub, you confirm that you have read, understood, and agreed to all terms specified herein.'
        },
        {
          heading: 'Student & Developer Eligibility',
          text: 'YuvaHub is designed for students, developers, and early-career tech professionals. You must be at least 13 years of age (or the minimum legal age in your jurisdiction) to create an account.'
        },
        {
          heading: 'Account Security via OAuth',
          text: 'Accounts are created using Google or GitHub OAuth. You are responsible for maintaining the confidentiality of your authentication provider credentials and for all activities that occur under your account.'
        }
      ]
    },
    {
      id: 'ip-rights',
      title: '2. Intellectual Property & User Ownership',
      icon: Scale,
      badge: 'PROPRIETARY & USER ASSETS',
      details: [
        {
          heading: 'YuvaHub Proprietary Code & Design',
          text: 'The YuvaHub logo, design system, client color tokens, match scoring algorithms, and Gemini AI integration pipelines are proprietary property owned by YuvaHub Inc.'
        },
        {
          heading: 'User Content Ownership',
          text: 'You retain 100% full ownership of your uploaded resumes, portfolio links, project submissions, and code repositories. YuvaHub claims no ownership over user intellectual property.'
        },
        {
          heading: 'Limited Processing License',
          text: 'By uploading a resume or profile metadata, you grant YuvaHub a non-exclusive, worldwide, royalty-free license solely to parse, analyze, and process the data for calculating opportunity match scores.'
        }
      ]
    },
    {
      id: 'listings',
      title: '3. Opportunity Listings & Third-Party Events',
      icon: Award,
      badge: 'INDEXING & DISCLAIMER',
      details: [
        {
          heading: 'Third-Party Event Aggregation',
          text: 'YuvaHub indexes hackathons, scholarships, fellowships, and internships hosted by third parties (such as Google, Microsoft, Reliance, and GDSC chapters). We do not host or directly manage third-party reward payouts or admission decisions.'
        },
        {
          heading: 'Organizer Submission Integrity',
          text: 'Event hosts submitting listings via the Submit Opportunity portal warrant that all event details, prize pools, eligibility criteria, and deadlines are accurate and non-deceptive.'
        },
        {
          heading: 'External Links & Third-Party Sites',
          text: 'Our platform contains links to external application portals. YuvaHub is not responsible for the privacy practices, content, or terms of third-party websites.'
        }
      ]
    },
    {
      id: 'conduct',
      title: '4. Acceptable Use & Community Conduct',
      icon: Users,
      badge: 'ZERO TOLERANCE',
      details: [
        {
          heading: 'Prohibited Actions',
          text: 'Users must not: (a) scrape or reverse engineer YuvaHub APIs; (b) deploy automated bots to submit spam listings; (c) upload malicious scripts; (d) misrepresent identity or academic credentials.'
        },
        {
          heading: 'Community Integrity & Team Matching',
          text: 'YuvaHub fosters a supportive student community. Harassment, discrimination, or abusive conduct in community forums or team formation channels will result in immediate permanent account termination.'
        },
        {
          heading: 'Termination & Account Suspension',
          text: 'We reserve the right to suspend or terminate any account that violates these Terms, with or without prior notice.'
        }
      ]
    },
    {
      id: 'ai-tools',
      title: '5. AI Career Tools & Advisory Disclaimer',
      icon: Sparkles,
      badge: 'ADVISORY AI SUITE',
      details: [
        {
          heading: 'AI-Generated Guidance',
          text: 'ATS resume review scores, cover letter drafts, and Gemini AI mentor advice are provided as advisory suggestions to assist your job preparation.'
        },
        {
          heading: 'User Verification Required',
          text: 'You are responsible for reviewing and verifying all AI-generated application text before submitting it to external recruiters.'
        },
        {
          heading: 'Limitation of Liability',
          text: 'YuvaHub shall not be liable for any indirect, incidental, or consequential damages resulting from job rejections, external decision delays, or third-party event cancellations.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans pb-20 selection:bg-[#f3e4bd] selection:text-text-secondary">

      {/* Hero Banner */}
      <div className="max-w-5xl mx-auto text-center space-y-4 pt-10 pb-12 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f3e4bd] border border-border-theme text-text-secondary text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
          <Scale className="w-4 h-4 text-primary-blue" /> Effective: March 2026 · Governance v2.4
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-text-primary">
          Terms of Service & <span className="italic text-primary-blue underline decoration-[#b5c37c] decoration-wavy decoration-2">Platform Guidelines</span>
        </h1>
        <p className="text-base text-text-secondary/90 leading-relaxed max-w-2xl mx-auto">
          Clear, transparent rules governing your rights, responsibilities, AI usage policies, and community standards on YuvaHub.
        </p>
      </div>

      {/* Quick Highlights Bar */}
      <div className="max-w-5xl mx-auto mb-10 px-6">
        <div className="bg-[#603620] text-[#fcf9f2] p-6 rounded-2xl border border-[#231f20] grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Cost</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b5c37c]" /> 100% Free for Students
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Data Rights</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#b5c37c]" /> You Own Your Resume
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">AI Privacy</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#b5c37c]" /> Ephemeral AI Sessions
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Community</span>
            <p className="text-xs font-serif font-bold text-[#b5c37c] flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b5c37c]" /> Zero Tolerance Spam
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Navigation Sidebar */}
        <div className="md:col-span-4 space-y-2">
          {termsSections.map(sec => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isActive
                    ? 'bg-[#603620] text-[#fcf9f2] border-[#603620] shadow-md'
                    : 'bg-surface text-text-secondary border-border-theme hover:border-primary-blue'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#f3e4bd]' : 'text-primary-blue'}`} />
                  <span className="text-xs font-bold">{sec.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Details Content Box */}
        <div className="md:col-span-8 bg-surface p-8 sm:p-10 rounded-3xl border border-border-theme shadow-sm space-y-8">
          {termsSections.filter(s => s.id === activeSection).map(s => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="space-y-6 text-left">
                <div className="flex items-center justify-between pb-4 border-b border-border-theme">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#f3e4bd] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-text-primary">{s.title}</h3>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-blue">{s.badge}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {s.details.map((detail, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-background border border-border-theme space-y-2">
                      <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#63703d] shrink-0" />
                        {detail.heading}
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed pl-6">
                        {detail.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Footer Back Action */}
          <div className="pt-6 border-t border-border-theme flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center gap-1.5 text-[#63703d] font-bold">
              <ShieldCheck className="w-4 h-4" /> Legally Binding Terms
            </span>
            <button
              onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-primary-blue hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              Back to Dashboard →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

import React, { useState } from 'react';
import {
  Zap, Sparkles, Target, Users, ShieldCheck, Trophy, ArrowRight, Award, Compass,
  Heart, Code, CheckCircle2, Globe, BrainCircuit, Star
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function AboutTab() {
  const { setActiveTab } = useAppContext();
  const [activeTabSection, setActiveTabSection] = useState<string>('vision');

  const aboutSections = [
    {
      id: 'vision',
      title: '1. Mission & Core Vision',
      icon: Target,
      badge: 'OUR PURPOSE',
      details: [
        {
          heading: 'Solving Opportunity Fragmentation',
          text: 'Indian tech students spend hours daily searching across 20+ disconnected websites, WhatsApp channels, and Telegram groups for hackathons, scholarships, and internships. YuvaHub unifies everything into one standardized feed.'
        },
        {
          heading: 'Leveling the Playing Field',
          text: 'Whether you study at an IIT, NIT, or a Tier-3 regional engineering college, YuvaHub ensures equal visibility to verified global opportunities, hackathon grants, and SDE hiring challenges.'
        },
        {
          heading: 'Powered by Google Gemini AI',
          text: 'We leverage AI not as a gimmick, but as an intelligent career copilot — calculating affinity match scores, evaluating resume ATS compliance, and suggesting missing skills for target roles.'
        }
      ]
    },
    {
      id: 'pillars',
      title: '2. YuvaHub Ecosystem Pillars',
      icon: Zap,
      badge: 'PLATFORM ARCHITECTURE',
      details: [
        {
          heading: 'Unified Indexing Engine',
          text: 'Standardized ingestion of listings from GDSC, Google Solution Challenge, Reliance Foundation, Microsoft SDE Internships, ETHGlobal, and open-source bounty boards.'
        },
        {
          heading: 'Contextual AI Affinity Matcher',
          text: 'Analyzes user tech stack, degree year, and past achievements to recommend high-probability opportunities tailored to your exact profile.'
        },
        {
          heading: 'ATS Resume Reviewer & Cover Letter AI',
          text: 'Instant keyword density scoring against target job descriptions, bullet point optimization, and 1-click tailored cover letter generation.'
        },
        {
          heading: 'Hackathon Teammate Matcher',
          text: 'Find complementary teammates (Frontend, Backend, AI/ML, Design) to form competitive teams for global hackathons.'
        }
      ]
    },
    {
      id: 'values',
      title: '3. Our Engineering Values',
      icon: Heart,
      badge: 'PRINCIPLES',
      details: [
        {
          heading: '100% Free for Students',
          text: 'All core features — opportunity discovery, Gemini AI matching, resume ATS scoring, and community forums — are completely free for students. We never sell personal user data.'
        },
        {
          heading: 'Verification & Anti-Spam Guarantee',
          text: 'Every listing undergoes validation to filter out fake competitions, deceptive fee-charging courses, and expired deadlines.'
        },
        {
          heading: 'Open-Source & Community-Driven',
          text: 'YuvaHub is built by developers, for developers. We actively incorporate feedback from GDSC leads, hackathon winners, and student contributors.'
        }
      ]
    },
    {
      id: 'impact',
      title: '4. Impact & Student Success Stories',
      icon: Trophy,
      badge: 'PROVEN OUTCOMES',
      details: [
        {
          heading: 'ETHGlobal & Web3 Bounty Winners',
          text: 'YuvaHub scholars have secured over $100,000+ in hackathon bounties and prize pools across global Web3 and Generative AI hackathons.'
        },
        {
          heading: 'SDE Offers at Top Tech Companies',
          text: 'Over 2,500+ students have landed SDE internships and full-time software engineering roles at companies including Amazon, Microsoft, and Google.'
        },
        {
          heading: 'Reliance & Merit Scholarship Scholars',
          text: 'Over ₹50 Crore in merit-based undergraduate scholarships and research fellowships unlocked for ambitious engineering students.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans pb-20 selection:bg-[#f3e4bd] selection:text-text-secondary">

      {/* Hero Banner */}
      <div className="max-w-5xl mx-auto text-center space-y-4 pt-10 pb-12 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f3e4bd] border border-border-theme text-text-secondary text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
          <Sparkles className="w-4 h-4 text-primary-blue" /> India's #1 Student Opportunity Ecosystem
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-text-primary">
          Empowering ambitious developers through <span className="italic text-primary-blue underline decoration-[#b5c37c] decoration-wavy decoration-2">intelligent discovery.</span>
        </h1>
        <p className="text-base text-text-secondary/90 leading-relaxed max-w-2xl mx-auto">
          YuvaHub connects Indian students to verified hackathons, scholarships, fellowships, and software engineering roles — equipped with Google Gemini AI career tools.
        </p>
      </div>

      {/* Quick Highlights Bar */}
      <div className="max-w-5xl mx-auto mb-10 px-6">
        <div className="bg-[#603620] text-[#fcf9f2] p-6 rounded-2xl border border-[#231f20] grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Listings</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#b5c37c]" /> 100K+ Verified Hubs
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Students</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-[#b5c37c]" /> 5M+ Active Learners
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Grants & Prizes</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#b5c37c]" /> ₹50Cr+ Awarded
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">AI Engine</span>
            <p className="text-xs font-serif font-bold text-[#b5c37c] flex items-center justify-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5 text-[#b5c37c]" /> Gemini AI Copilot
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Navigation Sidebar */}
        <div className="md:col-span-4 space-y-2">
          {aboutSections.map(sec => {
            const Icon = sec.icon;
            const isActive = activeTabSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTabSection(sec.id)}
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
          {aboutSections.filter(s => s.id === activeTabSection).map(s => {
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

          {/* Footer CTA Banner inside About box */}
          <div className="pt-6 border-t border-border-theme flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-text-secondary">Ready to build your career with YuvaHub?</span>
            <button
              onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="px-6 py-2.5 bg-primary-blue hover:bg-[#603620] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              Explore Opportunities <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

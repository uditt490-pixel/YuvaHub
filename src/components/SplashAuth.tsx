import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import {
  Sparkles, Search, Zap, Code, Lightbulb, Trophy, Target, ArrowRight, Mail, X,
  Github, Sun, Moon, ChevronDown, Rocket, Calendar, Users, AlertCircle, CheckCircle2,
  Star, ShieldCheck, Flame, Briefcase, GraduationCap, Award, Compass, TrendingUp, Globe
} from 'lucide-react';
import { gsap } from 'gsap';
import { signInWithGoogle, signInWithGithub } from '../lib/firebase';
import { useAppContext } from '../context/AppContext';
import HelpCenter from './tabs/HelpCenter';
import FAQ from './tabs/FAQ';
import Security from './tabs/Security';
import Legal from './tabs/Legal';
import Support from './tabs/Support';
import AboutTab from './tabs/About';
import Privacy from './tabs/Privacy';
import Terms from './tabs/Terms';

// Reusable Animated Stat Counter Component
function StatCounter({ targetNumber, suffix = '', prefix = '', duration = 2 }: { targetNumber: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: targetNumber,
            duration: duration,
            ease: 'power2.out',
            onUpdate: () => {
              setCount(Math.floor(obj.val));
            }
          });
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [targetNumber, duration]);

  return (
    <div ref={ref} className="text-3xl sm:text-4xl font-serif font-bold text-[#f3e4bd] tracking-tight">
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

export default function SplashAuth() {
  const { activeTab, setActiveTab, theme, toggleTheme } = useAppContext();
  const [loading, setLoading] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Refs for GSAP animations
  const heroBadgeRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroParaRef = useRef<HTMLParagraphElement>(null);
  const heroSearchRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const floatBadge1Ref = useRef<HTMLDivElement>(null);
  const floatBadge2Ref = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (heroBadgeRef.current) {
        tl.fromTo(heroBadgeRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
      }

      if (heroTitleRef.current) {
        tl.fromTo(heroTitleRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.3');
      }

      if (heroParaRef.current) {
        tl.fromTo(heroParaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.5');
      }

      if (heroSearchRef.current) {
        tl.fromTo(heroSearchRef.current, { y: 20, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.7 }, '-=0.4');
      }

      if (heroCardRef.current) {
        tl.fromTo(heroCardRef.current, { x: 40, opacity: 0, rotation: 1 }, { x: 0, opacity: 1, rotation: 0, duration: 0.9 }, '-=0.7');
      }

      if (floatBadge1Ref.current && floatBadge2Ref.current) {
        tl.fromTo([floatBadge1Ref.current, floatBadge2Ref.current],
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.2 },
          '-=0.4'
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // Floating Micro Parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroCardRef.current) return;
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 15;
    const y = (clientY / window.innerHeight - 0.5) * 15;

    gsap.to(heroCardRef.current, {
      rotationY: x * 0.5,
      rotationX: -y * 0.5,
      duration: 0.6,
      ease: 'power2.out'
    });
  };

  const handleGoogleLogin = async () => {
    setLoading('google');
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      console.error(e);
      if (e?.code === 'auth/unauthorized-domain') {
        setErrorMsg(`Domain '${window.location.hostname}' is not authorized in Firebase Console. Please add 'localhost' to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
      } else {
        setErrorMsg(e?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    setLoading('github');
    setErrorMsg(null);
    try {
      await signInWithGithub();
    } catch (e: any) {
      console.error(e);
      if (e?.code === 'auth/unauthorized-domain') {
        setErrorMsg(`Domain '${window.location.hostname}' is not authorized in Firebase Console. Please add 'localhost' to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
      } else {
        setErrorMsg(e?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleLogin = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  // Ref for the sign-in modal dialog
  const signInModalRef = useRef<HTMLDivElement>(null);

  // Trap focus inside modal, handle Esc
  useFocusTrap(signInModalRef, isModalOpen, handleCloseModal);

  const categories = [
    { id: 'all', label: 'All Opportunities', icon: Zap, count: '12,400+' },
    { id: 'hackathons', label: 'Hackathons & Grants', icon: Trophy, count: '3,800+' },
    { id: 'internships', label: 'Internships & SDE', icon: Briefcase, count: '5,200+' },
    { id: 'scholarships', label: 'Scholarships', icon: GraduationCap, count: '1,900+' },
    { id: 'freshers', label: 'Freshers Jobs', icon: Rocket, count: '1,500+' }
  ];

  const featuredOpportunities = [
    {
      id: '1',
      category: 'hackathons',
      title: 'Google Solution Challenge 2026',
      org: 'Google Developer Student Clubs',
      orgBadge: 'GDSC',
      badge: 'LIVE · $100K PRIZE POOL',
      badgeClass: 'bg-[#63703d] text-white',
      dates: 'Mar 01 - Apr 30, 2026',
      stipend: '$10,000 Grand Prize',
      tags: ['AI/ML', 'Android', 'Cloud']
    },
    {
      id: '2',
      category: 'internships',
      title: 'Software Development Engineer Intern',
      org: 'Microsoft India',
      orgBadge: 'MSFT',
      badge: 'FEATURED · STIPEND ₹1.2L/mo',
      badgeClass: 'bg-primary-blue text-white',
      dates: 'Apply by May 15, 2026',
      stipend: '₹1,25,000 / month',
      tags: ['React', 'Node.js', 'System Design']
    },
    {
      id: '3',
      category: 'scholarships',
      title: 'Reliance Foundation Undergraduate Scholarship',
      org: 'Reliance Foundation',
      orgBadge: 'RF',
      badge: '100% FUNDED · ₹2 LAKH',
      badgeClass: 'bg-[#603620] text-white',
      dates: 'Deadline: Jun 10, 2026',
      stipend: '₹2,00,000 Grant',
      tags: ['Engineering', 'B.Tech', 'Merit-based']
    }
  ];

  const filteredOpportunities = featuredOpportunities.filter(item =>
    (activeCategory === 'all' || item.category === activeCategory) &&
    (searchQuery === '' || item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.org.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans overflow-x-hidden selection:bg-[#f3e4bd] selection:text-text-secondary">

      {/* Editorial Header / Navbar */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border-theme transition-colors duration-300">
        <div className="max-w-7xl mx-auto h-[72px] px-6 lg:px-12 flex items-center justify-between">

          {/* Logo Mark */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-full bg-[#603620] flex items-center justify-center shadow-md">
              <Zap className="w-4 h-4 text-[#f3e4bd]" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-text-primary">
              Yuva<span className="text-primary-blue italic">Hub</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-10 text-xs uppercase tracking-widest font-bold text-text-secondary">
            <a href="#explore" onClick={(e) => { e.preventDefault(); document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary-blue transition-colors">Explore</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary-blue transition-colors">AI Suite</a>
            <a href="#stats" onClick={(e) => { e.preventDefault(); document.getElementById('stats')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary-blue transition-colors">Impact</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-primary-blue transition-colors">FAQ</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogin}
              className="px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider bg-primary-blue text-white rounded-full shadow-md hover:bg-[#603620] hover:shadow-lg transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'dashboard' ? (
        <>
          {/* Editorial Hero Section */}
          <section
            className="relative px-6 lg:px-12 pt-20 pb-28 max-w-7xl mx-auto"
            onMouseMove={handleMouseMove}
          >
            <div className="grid lg:grid-cols-12 gap-14 items-center">

              {/* Left Content */}
              <div className="lg:col-span-7 space-y-7 text-left">

                <div ref={heroBadgeRef} className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f3e4bd] border border-border-theme text-text-secondary text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-primary-blue" /> India's AI-Powered Student Ecosystem
                </div>

                <h1 ref={heroTitleRef} className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-text-primary leading-[1.12]">
                  Unlocking student potential with <span className="italic font-serif text-primary-blue underline decoration-[#b5c37c] decoration-wavy decoration-2">intelligent matching.</span>
                </h1>

                <p ref={heroParaRef} className="text-base sm:text-lg text-text-secondary/90 font-sans leading-relaxed max-w-xl">
                  YuvaHub aggregates, normalizes, and ranks verified scholarships, hackathons, and software engineering roles for ambitious developers across India.
                </p>

                {/* Editorial Search Bar */}
                <div ref={heroSearchRef} className="relative max-w-xl p-2 bg-surface border border-border-theme rounded-2xl shadow-xl shadow-[#231f20]/5 flex flex-col sm:flex-row items-center gap-2">
                  <div className="flex items-center flex-1 w-full px-3">
                    <Search className="w-5 h-5 text-text-muted shrink-0 mr-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Google AI hackathons, SDE roles, Reliance scholarship..."
                      className="w-full bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted py-2"
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    className="w-full sm:w-auto px-7 py-3 bg-[#603620] hover:bg-primary-blue text-[#fcf9f2] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    Search <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Trending Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Popular:</span>
                  {['Generative AI', 'Web3 Hackathons', 'SDE Internships', 'Reliance Scholarship'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setSearchQuery(tag); handleLogin(); }}
                      className="px-3.5 py-1 bg-[#f3e4bd]/60 border border-border-theme text-text-secondary text-xs font-semibold rounded-full hover:bg-[#b5c37c]/30 hover:border-[#63703d] transition-all cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Hero Showcase Cards */}
              <div className="lg:col-span-5 relative perspective-1000">

                <div ref={heroCardRef} className="relative z-10 bg-[#ffffff] border border-border-theme rounded-3xl p-7 shadow-2xl shadow-[#231f20]/10 space-y-6">

                  <div className="flex items-center justify-between border-b border-border-theme pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-[#f3e4bd] text-text-secondary flex items-center justify-center font-bold">
                        <Zap className="w-6 h-6 text-primary-blue" />
                      </div>
                      <div>
                        <h4 className="text-sm font-serif font-bold text-text-primary">Gemini AI Matcher</h4>
                        <p className="text-xs text-text-muted">Curated for CS Undergraduate</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#63703d]/10 text-[#63703d] text-xs font-extrabold rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#63703d] animate-ping" /> 98% Affinity
                    </span>
                  </div>

                  {/* Opportunity Sample 1 */}
                  <div className="p-4 rounded-2xl bg-background border border-border-theme space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-primary-blue uppercase tracking-wide">GOOGLE AI ODYSSEY 2026</span>
                      <span className="text-[#63703d]">$50,000 Pool</span>
                    </div>
                    <p className="text-xs text-text-secondary/80">Building LLM-powered applications for social impact.</p>
                  </div>

                  {/* Opportunity Sample 2 */}
                  <div className="p-4 rounded-2xl bg-background border border-border-theme space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-text-secondary uppercase tracking-wide">ATS RESUME AUDITOR</span>
                      <span className="text-primary-blue">94/100 Match</span>
                    </div>
                    <p className="text-xs text-text-secondary/80">Keywords aligned with Microsoft SDE role descriptions.</p>
                  </div>
                </div>

                {/* Floating Micro Badge 1 */}
                <div ref={floatBadge1Ref} className="absolute -top-6 -left-6 z-20 bg-surface border border-border-theme p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f3e4bd] text-text-secondary flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary-blue" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">ETHGlobal Winner</p>
                    <p className="text-[10px] text-text-muted">$10,000 Grant Awarded</p>
                  </div>
                </div>

                {/* Floating Micro Badge 2 */}
                <div ref={floatBadge2Ref} className="absolute -bottom-6 -right-4 z-20 bg-surface border border-border-theme p-4 rounded-2xl shadow-xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#b5c37c]/30 text-[#63703d] flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-[#63703d]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">SDE Offer at Amazon</p>
                    <p className="text-[10px] text-text-muted">Verified YuvaHub Scholar</p>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* Platform Stats Section with Animated Scroll Counters */}
          <section id="stats" ref={statsRef} className="bg-[#603620] text-[#fcf9f2] py-16 px-6 border-y border-[#231f20]">
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-1">
                <StatCounter targetNumber={100} suffix="K+" duration={2} />
                <div className="text-xs font-bold uppercase tracking-widest text-[#fcf9f2]/80 mt-1">Verified Listings</div>
              </div>
              <div className="space-y-1">
                <StatCounter targetNumber={5} suffix="M+" duration={2} />
                <div className="text-xs font-bold uppercase tracking-widest text-[#fcf9f2]/80 mt-1">Active Students</div>
              </div>
              <div className="space-y-1">
                <StatCounter targetNumber={50} prefix="₹" suffix="Cr+" duration={2.2} />
                <div className="text-xs font-bold uppercase tracking-widest text-[#fcf9f2]/80 mt-1">Prizes & Grants</div>
              </div>
              <div className="space-y-1">
                <StatCounter targetNumber={2500} suffix="+" duration={2.5} />
                <div className="text-xs font-bold uppercase tracking-widest text-[#fcf9f2]/80 mt-1">Top Tech Recruiters</div>
              </div>
            </div>
          </section>

          {/* Explore Section */}
          <section id="explore" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold text-primary-blue uppercase tracking-widest">Standardized Discovery</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-text-primary">Curated Opportunity Hubs</h2>
              <p className="text-sm text-text-secondary">Eliminate manual daily searching. Browse normalized, structured opportunities in one clean feed.</p>
            </div>

            {/* Editorial Category Selector */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${activeCategory === cat.id
                      ? 'bg-[#603620] text-[#fcf9f2] border-[#603620] shadow-md scale-105'
                      : 'bg-[#f3e4bd]/50 text-text-secondary border-border-theme hover:border-primary-blue'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeCategory === cat.id ? 'bg-[#f3e4bd] text-text-secondary' : 'bg-surface text-text-muted'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Opportunity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {filteredOpportunities.map(opp => (
                <div
                  key={opp.id}
                  onClick={handleLogin}
                  className="group bg-surface border border-border-theme rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full ${opp.badgeClass}`}>
                        {opp.badge}
                      </span>
                      <span className="text-xs font-bold text-text-muted">{opp.orgBadge}</span>
                    </div>

                    <h3 className="text-lg font-serif font-bold text-text-primary leading-snug group-hover:text-primary-blue transition-colors">
                      {opp.title}
                    </h3>
                    <p className="text-xs text-text-secondary font-medium">{opp.org}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {opp.tags.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-background border border-border-theme text-text-secondary text-[11px] font-semibold rounded-md">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-background border-t border-border-theme flex items-center justify-between text-xs font-bold text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary-blue" />
                      {opp.dates}
                    </span>
                    <span className="text-primary-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Apply <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* AI Features Showcase Section */}
          <section id="features" className="py-24 px-6 lg:px-12 bg-surface-secondary border-y border-border-theme">
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                <span className="text-xs font-bold text-primary-blue uppercase tracking-widest">Powered by Google Gemini</span>
                <h2 className="text-3xl sm:text-4xl font-serif font-normal text-text-primary">AI Career Engineering Suite</h2>
                <p className="text-sm text-text-secondary">Bespoke career tools engineered to optimize your application workflow from resume to offer.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="bg-surface p-8 rounded-3xl border border-border-theme shadow-sm hover:shadow-md transition-all space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#f3e4bd] text-text-secondary flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary-blue" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-text-primary">ATS Resume Reviewer</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Evaluates resume text against active SDE & tech job descriptions to calculate keyword density and formatting scores.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="bg-surface p-8 rounded-3xl border border-border-theme shadow-sm hover:shadow-md transition-all space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#f3e4bd] text-text-secondary flex items-center justify-center">
                    <Target className="w-6 h-6 text-[#63703d]" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-text-primary">1-Click Cover Letters</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Generates persuasive, tailored cover letters matching your skills with the employer's specific project goals.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="bg-surface p-8 rounded-3xl border border-border-theme shadow-sm hover:shadow-md transition-all space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#f3e4bd] text-text-secondary flex items-center justify-center">
                    <Compass className="w-6 h-6 text-primary-blue" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-text-primary">24/7 AI Mentorship</h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Interactive technical mentoring, eligibility evaluations, DSA guidance, and interview practice available anytime.
                  </p>
                </div>
              </div>

              {/* Callout Banner */}
              <div className="mt-14 p-9 rounded-3xl bg-[#603620] text-[#fcf9f2] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div className="space-y-2 text-left">
                  <h4 className="text-2xl font-serif font-bold">Start your personalized opportunity feed today</h4>
                  <p className="text-xs sm:text-sm text-[#f3e4bd]">Join thousands of students building their engineering career with YuvaHub.</p>
                </div>
                <button
                  onClick={handleLogin}
                  className="px-8 py-3.5 bg-primary-blue hover:bg-[#231f20] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer shrink-0"
                >
                  Get Started Free
                </button>
              </div>

            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section id="faq" className="py-24 px-6 lg:px-12 max-w-4xl mx-auto">
            <div className="text-center mb-14 space-y-2">
              <span className="text-xs font-bold text-primary-blue uppercase tracking-widest">FAQ</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-normal text-text-primary">Frequently Asked Questions</h2>
              <p className="text-sm text-text-secondary">Hover over any question to expand automatically.</p>
            </div>

            <div className="space-y-4">
              {[
                {
                  q: "What is YuvaHub and who is it for?",
                  a: "YuvaHub is a unified discovery and matching platform designed specifically for students, developers, and early-career tech professionals to find verified hackathons, competitions, fellowships, and internships."
                },
                {
                  q: "Is YuvaHub free to use for students?",
                  a: "Yes, YuvaHub is completely free for students and early-career developers. You can explore, match, and apply for opportunities without any charges."
                },
                {
                  q: "How does Google Gemini AI calculate opportunity match scores?",
                  a: "Our AI engine analyzes your skills, college year, domain preferences, and past achievements against live opportunity metadata to calculate affinity match scores."
                },
                {
                  q: "How do I host or list an opportunity on YuvaHub?",
                  a: "Organizations, GDSC leads, and hackathon hosts can easily submit opportunities using the 'Submit Opportunity' feature inside the app."
                }
              ].map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setOpenFaqIndex(idx)}
                    onMouseLeave={() => setOpenFaqIndex(null)}
                    className={`border rounded-2xl overflow-hidden bg-surface transition-all duration-300 cursor-pointer ${isOpen ? 'border-primary-blue shadow-lg scale-[1.01]' : 'border-border-theme hover:border-primary-blue/60'
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full text-left p-5 flex justify-between items-center gap-4 bg-transparent border-none cursor-pointer"
                    >
                      <span className={`font-bold text-sm md:text-base transition-colors ${isOpen ? 'text-primary-blue' : 'text-text-primary'}`}>
                        {item.q}
                      </span>
                      <span className={`p-2 rounded-xl bg-background text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#f3e4bd] text-primary-blue' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 border-t border-border-theme pt-4 text-xs md:text-sm text-text-secondary leading-relaxed animate-fade-in">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
          <div className="mb-8">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2 text-sm text-primary-blue hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              ← Back to Home / Login
            </button>
          </div>
          {activeTab === 'about' && <AboutTab />}
          {activeTab === 'privacy' && <Privacy />}
          {activeTab === 'terms' && <Terms />}
          {activeTab === 'security' && <Security />}
          {activeTab === 'help' && <HelpCenter />}
          {activeTab === 'support' && <Support />}
          {activeTab === 'legal' && <Legal />}
          {activeTab === 'faq' && <FAQ />}
        </div>
      )}

      {/* Editorial Full-Width Footer */}
      <footer id="footer" className="w-full bg-[#231f20] text-[#fcf9f2] border-t-2 border-primary-blue pt-20 pb-10 px-6 lg:px-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Brand & Bio Column (4 cols) */}
          <div className="md:col-span-4 space-y-5 text-left">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-[#fcf9f2]" />
              </div>
              <span className="font-serif font-bold text-2xl text-[#f3e4bd] tracking-tight">
                Yuva<span className="text-[#b5c37c] italic">Hub</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#fcf9f2]/80 leading-relaxed font-sans max-w-sm">
              India's premier AI-powered opportunity platform connecting ambitious developers, students, and early-career talent to top global hackathons, scholarships, and software engineering roles.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a href="https://github.com/uditt490-pixel/YuvaHub" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-[#603620]/60 border border-[#8c7569]/40 flex items-center justify-center text-[#f3e4bd] hover:bg-primary-blue hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Opportunities Column (2 cols) */}
          <div className="md:col-span-2 space-y-3 text-left">
            <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#f3e4bd]">Discover</h4>
            <ul className="space-y-2 text-xs text-[#fcf9f2]/75">
              {['Hackathons & Grants', 'SDE Internships', 'Scholarships 2026', 'Freshers Tech Jobs', 'Fellowships'].map(item => (
                <li key={item}>
                  <button onClick={handleLogin} className="hover:text-[#b5c37c] transition-colors bg-transparent border-none p-0 cursor-pointer text-left">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Features Column (2 cols) */}
          <div className="md:col-span-2 space-y-3 text-left">
            <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#f3e4bd]">AI Intelligence</h4>
            <ul className="space-y-2 text-xs text-[#fcf9f2]/75">
              {['ATS Resume Reviewer', 'Cover Letter AI', '1-on-1 AI Mentorship', 'Eligibility Matcher', 'Bounty Board'].map(item => (
                <li key={item}>
                  <button onClick={handleLogin} className="hover:text-[#b5c37c] transition-colors bg-transparent border-none p-0 cursor-pointer text-left">
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column (4 cols) */}
          <div className="md:col-span-4 space-y-4 text-left bg-[#603620]/40 p-6 rounded-3xl border border-[#8c7569]/30">
            <h4 className="font-serif font-bold text-sm text-[#f3e4bd] flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary-blue" /> Stay Ahead of Deadlines
            </h4>
            <p className="text-xs text-[#fcf9f2]/80 leading-relaxed">
              Get hand-picked, verified opportunities and AI matching digests delivered directly to your inbox every Monday.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your student email"
                required
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#231f20] border border-[#8c7569]/50 text-[#fcf9f2] outline-none placeholder:text-text-muted focus:border-primary-blue"
              />
              <button type="submit" className="bg-primary-blue hover:bg-[#63703d] text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0">
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar & Status Indicator */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-[#8c7569]/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#fcf9f2]/60">
          <div className="flex items-center gap-3">
            <span>&copy; 2026 YuvaHub Inc. All rights reserved.</span>
            <span className="hidden sm:inline text-text-muted">•</span>
            <span className="hidden sm:flex items-center gap-1.5 text-[#b5c37c] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#b5c37c] animate-pulse" /> All Systems Operational
            </span>
          </div>

          <div className="flex flex-wrap gap-5 text-xs">
            <button onClick={() => setActiveTab('about')} className="hover:text-[#f3e4bd] bg-transparent border-none cursor-pointer">About Us</button>
            <button onClick={() => setActiveTab('privacy')} className="hover:text-[#f3e4bd] bg-transparent border-none cursor-pointer">Privacy Policy</button>
            <button onClick={() => setActiveTab('terms')} className="hover:text-[#f3e4bd] bg-transparent border-none cursor-pointer">Terms of Service</button>
            <button onClick={() => setActiveTab('security')} className="hover:text-[#f3e4bd] bg-transparent border-none cursor-pointer">Security</button>
            <button onClick={() => setActiveTab('help')} className="hover:text-[#f3e4bd] bg-transparent border-none cursor-pointer">Help Center</button>
            <button onClick={() => setActiveTab('support')} className="hover:text-[#f3e4bd] bg-transparent border-none cursor-pointer">Support</button>
          </div>
        </div>
      </footer>

      {/* Sign In Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-[#231f20]/75 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div
            ref={signInModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signin-modal-title"
            className="bg-background rounded-3xl w-full max-w-md shadow-2xl p-8 border border-border-theme relative space-y-6"
          >

            <button
              onClick={handleCloseModal}
              aria-label="Close sign-in dialog"
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-surface border border-border-theme flex items-center justify-center text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center mx-auto shadow-md" aria-hidden="true">
                <Zap className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 id="signin-modal-title" className="text-2xl font-serif font-bold text-text-primary">Welcome to YuvaHub</h3>
              <p className="text-xs text-text-secondary">Sign in to unlock AI matching, ATS resume scores, & mentorship.</p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-border-theme hover:bg-surface rounded-2xl bg-surface text-text-primary font-bold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1c-4.3 0-7.92 2.47-9.82 6.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                <span>{loading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <button
                onClick={handleGithubLogin}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-[#231f20] hover:bg-[#603620] rounded-2xl bg-[#231f20] text-white font-bold text-sm transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Github className="w-5 h-5 text-white shrink-0" />
                <span>{loading === 'github' ? 'Connecting...' : 'Continue with GitHub'}</span>
              </button>
            </div>

            <p className="text-[11px] text-text-secondary text-center leading-relaxed">
              By continuing, you agree to YuvaHub's{' '}
              <button onClick={() => { setIsModalOpen(false); setActiveTab('terms'); }} className="text-primary-blue hover:underline bg-transparent border-none p-0 font-bold">Terms</button>
              {' '}and{' '}
              <button onClick={() => { setIsModalOpen(false); setActiveTab('privacy'); }} className="text-primary-blue hover:underline bg-transparent border-none p-0 font-bold">Privacy Policy</button>.
            </p>

          </div>
        </div>
      )}

    </div>
  );
}

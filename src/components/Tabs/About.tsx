import React, { useState } from 'react';
import { BookOpen, Users, Compass, Code, Star, Heart, Award, ArrowRight, Github, Linkedin, Twitter, MessageCircle, Info, ExternalLink, Cpu, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

type AboutSection = 'mission' | 'team' | 'tech-stack' | 'values' | 'milestones' | 'contributors';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  github: string;
  linkedin: string;
}

export default function About() {
  const { theme } = useAppContext();
  const [activeTab, setActiveTab] = useState<AboutSection>('mission');
  const [roadmapVote, setRoadmapVote] = useState<Record<string, number>>({
    'mobile-app': 142,
    'personalized-alerts': 98,
    'resume-builder': 215,
    'calendar-sync': 64,
    'offline-support': 45,
    'dark-mode-telemetry': 37
  });
  const [votedItems, setVotedItems] = useState<Record<string, boolean>>({});

  const handleVote = (id: string) => {
    if (votedItems[id]) return;
    setRoadmapVote(prev => ({
      ...prev,
      [id]: prev[id] + 1
    }));
    setVotedItems(prev => ({
      ...prev,
      [id]: true
    }));
  };

  const team: TeamMember[] = [
    {
      name: 'Udit Sharma',
      role: 'Project Lead & Architect',
      bio: 'Full-stack software architect specializing in scalable microservices and real-time data streaming architectures. Passionate about builder ecosystems.',
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&h=256&q=80',
      github: 'https://github.com/uditt490-pixel',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Dipanshu Batra',
      role: 'Frontend Lead & Core Contributor',
      bio: 'UI/UX engineer focused on responsive designs, state synchronization, and modern React architectures. Advocate for accessible web engineering.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
      github: 'https://github.com/dipanshubatra',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Ananya Roy',
      role: 'Community Growth Manager',
      bio: 'Educational researcher specializing in university partnerships, student outreach, and mentor recruitment. Oversees verification standards.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Kabir Mehta',
      role: 'Backend Engineering',
      bio: 'Database optimization expert specializing in high-throughput telemetry ingestion, Redis caching layers, and search index design.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Dr. Sarah Jenkins',
      role: 'Academic Advisory Board',
      bio: 'Professor of Computer Science with 15+ years of experience researching digital education systems and student success roadmaps.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    },
    {
      name: 'Vikram Singh',
      role: 'Industry Partnership Lead',
      bio: 'Former technical recruiter connecting university graduates with leading technology firms. Specializes in job readiness workshops.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com'
    }
  ];

  const sections = [
    { id: 'mission', label: 'Our Mission & Story', icon: Compass },
    { id: 'team', label: 'Meet the Team', icon: Users },
    { id: 'tech-stack', label: 'Technology Stack', icon: Cpu },
    { id: 'values', label: 'Open-Source Values', icon: ShieldCheck },
    { id: 'milestones', label: 'Platform Milestones', icon: Award },
    { id: 'contributors', label: 'Special Contributors', icon: Heart }
  ];

  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Header section */}
      <div className="text-center py-10 mb-8 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center justify-center gap-3">
          <Info className="w-10 h-10 text-blue-600 dark:text-blue-500" />
          About YuvaHub
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
          Learn about our vision, our dedicated contributors, the stack powering the platform, and our open-source roadmap.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-450 dark:text-gray-500 mb-2 pl-2">
            Explore
          </h3>
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
            {sections.map((sect) => {
              const Icon = sect.icon;
              const isActive = activeTab === sect.id;
              return (
                <button
                  key={sect.id}
                  onClick={() => setActiveTab(sect.id as AboutSection)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{sect.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10 border border-blue-100/50 dark:border-blue-900/30 mt-6">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-400 flex items-center gap-1.5 mb-2">
              <Star className="w-3.5 h-3.5 fill-blue-400 dark:fill-blue-500 text-blue-400 dark:text-blue-500" />
              Community Supported
            </h4>
            <p className="text-[10px] text-blue-800/80 dark:text-blue-400/80 leading-relaxed">
              YuvaHub is built for students, by students. We are entirely non-profit and rely on open-source contributions.
            </p>
          </div>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 md:p-8 shadow-sm">
          {activeTab === 'mission' && (
            <div className="space-y-6 text-gray-750 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                  Empowering The Next Generation
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-blue-600" />
                  1. The Vision Behind YuvaHub
                </h3>
                <p>
                  Today's academic ecosystem is flooded with career listings, technical certificates, mentorship networks, and hackathons. However, this wealth of resources is often highly fragmented, unverified, or locked behind premium paywalls. Ambitious students spend hours navigating through disconnected job boards, dealing with expired links or misleading details.
                </p>
                <p>
                  YuvaHub was conceived as a unified platform where verified opportunities meet personalized learning paths. Our target is to democratize mentorship, streamline applications, and create a centralized hub where students can launch their professional careers. We believe every aspiring student deserves access to the tools, mentorship, and opportunities that will define their future success, regardless of their background or economic status.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-950 dark:text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  2. Our Core Journey
                </h3>
                <p>
                  What started as a simple script to aggregate local engineering internships quickly turned into a multi-tiered collaboration engine. Over the course of 2026, we expanded the system to support student-to-mentor connections, AI-powered mock interviews, and automated telemetry tracking to verify listing reliability.
                </p>
                <p>
                  By partnering with community groups, open-source sponsors, and volunteer mentors from global organizations, we have built a self-sustaining ecosystem that prioritizes user growth, strict privacy standards, and absolute transparency. Our journey is powered by community enthusiasm, and we remain dedicated to evolving this platform to meet modern industry needs.
                </p>
              </section>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-500">10k+</span>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Active Students</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-500">500+</span>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Verified Mentors</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <span className="text-2xl font-black text-blue-600 dark:text-blue-500">50k+</span>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Opportunities Indexed</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                  Meet the Creators
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                YuvaHub is built and curated by a dedicated group of engineers, designers, and community coordinators committed to open-source software and educational access.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {team.map((member) => (
                  <div key={member.name} className="flex gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-800 shrink-0" 
                    />
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-gray-950 dark:text-white">{member.name}</h4>
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400">{member.role}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">{member.bio}</p>
                      <div className="flex gap-2.5 pt-2">
                        <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                          <Github className="w-4 h-4" />
                        </a>
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tech-stack' && (
            <div className="space-y-6 text-gray-750 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                  Technical Architecture
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <p>
                YuvaHub is built on a highly optimized, state-of-the-art web stack designed for speed, durability, and minimal footprint:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-100 dark:border-gray-700 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Frontend Stack
                  </h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <li>React 18 / TypeScript / TSX</li>
                    <li>Tailwind CSS for responsive aesthetics</li>
                    <li>Lucide Icons for sleek UI controls</li>
                    <li>Firebase Auth & SDK integration</li>
                    <li>Vite bundler for lightning-fast hot module replacement</li>
                  </ul>
                </div>

                <div className="border border-gray-100 dark:border-gray-700 p-4 rounded-xl">
                  <h4 className="font-bold text-gray-950 dark:text-white flex items-center gap-1.5 text-xs">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Backend & Service Layer
                  </h4>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
                    <li>Express.js and Node API endpoints</li>
                    <li>MongoDB Atlas for persistent schema storage</li>
                    <li>BullMQ for asynchronous telemetry pipelines</li>
                    <li>Firebase Admin SDK for key validations</li>
                    <li>Redis cluster caching for opportunity lookups</li>
                  </ul>
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-950 dark:text-white">
                  Why single-file build inlining?
                </h3>
                <p>
                  To provide absolute portability, our build system compiles and inlines assets directly into a single, high-performance static index file. This allows local developer instances, sandbox environments, and cloud targets to deploy and run instantly without dealing with complex micro-asset hosting configurations.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'values' && (
            <div className="space-y-6 text-gray-750 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                  Our Open-Source Pledge
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-950 dark:text-white">
                  1. Transparency First
                </h3>
                <p>
                  We believe software is best when auditable and open. That is why YuvaHub\'s source code is 100% public on GitHub. Any developer can inspect our security implementations, verify how data is ingested, suggest optimization improvements, or run their own local instance.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-bold text-gray-950 dark:text-white">
                  2. Privacy First
                </h3>
                <p>
                  YuvaHub does not track your coordinates, sell your application telemetry to marketing brokers, or inject third-party ad pixels. As a community platform, we operate with a minimum-data-profile requirement: we only collect the minimum parameters necessary to authorize your sessions and connect you with mentors.
                </p>
              </section>

              {/* Interactive Feature Roadmap Voting */}
              <div className="border border-gray-150 dark:border-gray-700 p-5 rounded-xl bg-gray-50 dark:bg-gray-900/50 mt-6">
                <h4 className="font-bold text-gray-950 dark:text-white text-sm mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  Interactive Feature Roadmap
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Vote on the upcoming features you would like the YuvaHub developer community to implement next!
                </p>

                <div className="space-y-3">
                  {[
                    { id: 'resume-builder', label: 'AI Resume Customization Builder' },
                    { id: 'mobile-app', label: 'Sleek Mobile App (Android/iOS)' },
                    { id: 'personalized-alerts', label: 'Push & Daily Email Alerts' },
                    { id: 'calendar-sync', label: 'Google Calendar API Integration' }
                  ].map((feat) => {
                    const votes = roadmapVote[feat.id];
                    const hasVoted = votedItems[feat.id];
                    return (
                      <div key={feat.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-850">
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-300">{feat.label}</span>
                        <button
                          onClick={() => handleVote(feat.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                            hasVoted 
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' 
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:text-blue-400'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${hasVoted ? 'fill-current' : ''}`} />
                          <span>{votes} votes</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-6 text-gray-750 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                  Platform Journey & Milestones
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <p>
                Our developmental journey has been rapid and impactful. Here is an overview of our timeline:
              </p>

              <div className="relative border-l border-gray-200 dark:border-gray-700 ml-4 space-y-8 py-2">
                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800"></span>
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-xs">Q1 2026 — Project Inception</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Initial codebase created. Launched core opportunity parser scraping major student opportunities, hackathons, and fellowship boards. Established primary Firebase Authentication routing schemes.
                  </p>
                </div>

                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800"></span>
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-xs">Q2 2026 — Mentorship Integration</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Developed the connections matching engine. Verified industry mentors completed credentials setups. Integrated Calendly and Google Calendar schedulers for secure session bookings.
                  </p>
                </div>

                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800"></span>
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-xs">Q3 2026 — AI Assistant Release</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Integrated LLM support through server endpoints. Enabled interactive query processing, smart opportunity filtering, and technical mock interview simulators.
                  </p>
                </div>

                <div className="relative pl-6">
                  <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-xs">Q4 2026 — Compliance & Trust Expansion</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Implemented legal privacy matrices, security compliance logs, detailed FAQ libraries, and strict open-source licensing compliance policies.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contributors' && (
            <div className="space-y-6 text-gray-750 dark:text-gray-300 text-xs md:text-sm leading-relaxed">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">
                  Special Thanks & Contributors
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded mt-2"></div>
              </div>

              <p>
                We would like to express our deepest gratitude to the following individuals, university circles, and open-source packages who made YuvaHub possible:
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <h4 className="font-bold text-gray-950 dark:text-white text-xs mb-1">Open Source Foundations</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    We stand on the shoulders of giants. Our system is built using open packages from the Linux Foundation, MongoDB Community Edition, React Org, Firebase, and Tailwind Labs.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <h4 className="font-bold text-gray-950 dark:text-white text-xs mb-1">University Beta Testers</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Over 200 student beta testers from technological colleges spent months verifying layouts, report triggers, and chat assistant capabilities to refine our user journeys.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <h4 className="font-bold text-gray-950 dark:text-white text-xs mb-1">Volunteer Moderators</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Our team of volunteer administrators audits and screens opportunity submissions daily, ensuring that students are safe from recruiter spam or malicious links.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

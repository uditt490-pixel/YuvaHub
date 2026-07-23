/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Search,
  Cpu,
  Terminal,
  ShieldAlert,
  Award,
  Sparkles,
  Star,
  Heart,
  Flame,
  PenTool,
  Printer,
  Copy,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/* ── Types & Interfaces ────────────────────────────────────────────────── */
type HelpTab = 'faq' | 'features' | 'ticketing' | 'status';

interface FAQItem {
  id: string;
  category: 'account' | 'opportunities' | 'ai' | 'security';
  question: string;
  answer: string;
  technicalDetails?: string;
}

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  upvotes: number;
  status: 'planned' | 'under-review' | 'implemented';
  category: string;
  author: string;
}

interface SupportTicket {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

interface LiveLog {
  timestamp: string;
  origin: 'AuthService' | 'OpportunityEngine' | 'AIAssistant' | 'Gateway';
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

/* ── Constant Mock Data ────────────────────────────────────────────────── */
const FAQ_DATABASE: FAQItem[] = [
  {
    id: 'FAQ-ACC-01',
    category: 'account',
    question: 'How do I edit my candidate profile details?',
    answer: 'Navigate to the Profile tab from the sidebar. Click the "Edit Profile" button on the top right of your card. You can upload a new profile picture, update your bio, link your Github/LinkedIn URLs, and add skills that will help the AI Assistant recommend matching jobs.',
    technicalDetails: 'Profile payloads are validated against a strict JSON schema before updating the user profile collection inside our database store.'
  },
  {
    id: 'FAQ-ACC-02',
    category: 'account',
    question: 'Can I bookmark opportunities to apply later?',
    answer: 'Yes! Every opportunity card features a Bookmark icon on the top right corner. Clicking this will save the opportunity in your personal bookmarks drawer. You can view all saved listings by navigating to the Bookmarks tab.',
    technicalDetails: 'Bookmarks are mapped inside the user\'s local state and synced to the profile data index using debounced document patch updates.'
  },
  {
    id: 'FAQ-OPP-01',
    category: 'opportunities',
    question: 'How are opportunities verified for authenticity?',
    answer: 'We deploy regular security scans and require all recruiters to upload verification credentials. Additionally, our community audit system allows users to flag suspicious listings, which are then queued for manual moderator review.',
    technicalDetails: 'Verification flags use a threshold scoring system: if an opportunity gathers more than 5 community flags, it is automatically soft-deleted and queued for moderator intervention.'
  },
  {
    id: 'FAQ-OPP-02',
    category: 'opportunities',
    question: 'What do the tag labels (Verified, High Priority, Remote) mean?',
    answer: 'Tags help filter positions quickly. "Verified" means the company identity was audited. "High Priority" represents positions with short application deadlines. "Remote" represents positions that support completely offsite arrangements.',
    technicalDetails: 'Tags are stored as indexed arrays of strings, enabling fast search aggregations across our database indexes.'
  },
  {
    id: 'FAQ-AI-01',
    category: 'ai',
    question: 'How does the AI Assistant analyze my resume profiles?',
    answer: 'The AI Assistant parses your profile skills list, recent opportunities bookmarked, and bio details. It runs semantic search matching against our live listings to recommend opportunities that match your qualifications.',
    technicalDetails: 'Uses semantic embeddings parsed via Gemini API endpoints. Recommended items are sorted by vector distance closeness scores.'
  },
  {
    id: 'FAQ-SEC-01',
    category: 'security',
    question: 'Is my personal data shared with third-party tracking services?',
    answer: 'Absolutely not. We do not sell or distribute personal user information to third-party ad networks. All user profile records are protected under security protocols outlined in our Trust & Security compliance sheets.',
    technicalDetails: 'All database pipelines enforce Transport Layer Security (TLS 1.3) configurations, with keys managed inside secure secrets storage.'
  }
];

const INITIAL_FEATURES: FeatureRequest[] = [
  {
    id: 'FEAT-001',
    title: 'Dark Mode Theme Preference',
    description: 'Enables users to toggle a global dark theme option to reduce eye strain during late-night reviews.',
    upvotes: 284,
    status: 'implemented',
    category: 'Interface',
    author: 'Aarav Mehta'
  },
  {
    id: 'FEAT-002',
    title: 'Recruiter Chat Direct Messaging',
    description: 'Allows candidates to directly message recruiters who post verified jobs to check application status.',
    upvotes: 418,
    status: 'under-review',
    category: 'Messaging',
    author: 'Neha Sharma'
  },
  {
    id: 'FEAT-003',
    title: 'Geographic Search Radius Filter',
    description: 'Enables candidate searches for jobs within 10km, 25km, or 50km radius from their profile location.',
    upvotes: 195,
    status: 'planned',
    category: 'Search & Maps',
    author: 'Kabir Dev'
  },
  {
    id: 'FEAT-004',
    title: 'Resume PDF Parsing Parser',
    description: 'Allows users to upload their resume PDF to automatically extract skills, experiences, and bios into their profiles.',
    upvotes: 356,
    status: 'under-review',
    category: 'AI Assistant',
    author: 'Anjali Gupta'
  }
];

const MOCK_LOGS: LiveLog[] = [
  { timestamp: '08:41:02', origin: 'Gateway', level: 'info', message: 'API Gateway connection handshake nominal.' },
  { timestamp: '08:41:15', origin: 'AuthService', level: 'success', message: 'JWT session tokens verified. Authorization success.' },
  { timestamp: '08:42:00', origin: 'OpportunityEngine', level: 'info', message: 'Opportunity listings cache refreshed. 124 records active.' },
  { timestamp: '08:42:30', origin: 'AIAssistant', level: 'success', message: 'Gemini embedding vector model loaded. Semantic parser ready.' },
  { timestamp: '08:43:18', origin: 'Gateway', level: 'warning', message: 'High load detected on search endpoints. Latency warning.' }
];

export default function Support() {
  const { theme } = useAppContext();
  
  /* ── States ──────────────────────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<HelpTab>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqCategory, setFaqCategory] = useState<'all' | 'account' | 'opportunities' | 'ai' | 'security'>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Tickets States
  const [ticket, setTicket] = useState<SupportTicket>({
    name: '',
    email: '',
    category: 'opportunities',
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketTrace, setTicketTrace] = useState<string[] | null>(null);

  // Feature Requests States
  const [featureBoard, setFeatureBoard] = useState<FeatureRequest[]>(() => {
    try {
      const saved = localStorage.getItem('yuvahub_feature_requests');
      return saved ? JSON.parse(saved) : INITIAL_FEATURES;
    } catch {
      return INITIAL_FEATURES;
    }
  });
  const [userVotes, setUserVotes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yuvahub_user_votes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newFeature, setNewFeature] = useState({ title: '', desc: '', category: 'Interface' });
  const [featureAddedMessage, setFeatureAddedMessage] = useState(false);

  // Ratings feedback State
  const [helpfulRatings, setHelpfulRatings] = useState<Record<string, 'yes' | 'no'>>({});

  // System Status States
  const [liveLogs, setLiveLogs] = useState<LiveLog[]>(MOCK_LOGS);
  const [latencyPoints, setLatencyPoints] = useState<number[]>([42, 51, 48, 62, 55, 47, 52]);
  const [cpuLoad, setCpuLoad] = useState(38);

  /* ── Effects ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    localStorage.setItem('yuvahub_feature_requests', JSON.stringify(featureBoard));
  }, [featureBoard]);

  useEffect(() => {
    localStorage.setItem('yuvahub_user_votes', JSON.stringify(userVotes));
  }, [userVotes]);

  // Fluctuations simulation for live status tab
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setCpuLoad(prev => Math.max(10, Math.min(95, prev + Math.floor(Math.random() * 11) - 5)));
      setLatencyPoints(prev => {
        const nextVal = Math.max(20, Math.min(150, prev[prev.length - 1] + Math.floor(Math.random() * 21) - 10));
        return [...prev.slice(1), nextVal];
      });

      // Append random live service log
      const origins: LiveLog['origin'][] = ['AuthService', 'OpportunityEngine', 'AIAssistant', 'Gateway'];
      const levels: LiveLog['level'][] = ['info', 'success', 'warning'];
      const randomOrigin = origins[Math.floor(Math.random() * origins.length)];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0];

      let msg = '';
      if (randomOrigin === 'AIAssistant') {
        msg = `Parsed search parameters. Vector semantic matching speed: ${Math.floor(Math.random() * 50) + 15}ms.`;
      } else if (randomOrigin === 'OpportunityEngine') {
        msg = `Indexed opportunity documents search buffer. Refresh successful.`;
      } else if (randomOrigin === 'Gateway') {
        msg = `Payload transport load balancing routing status: Nominal.`;
      } else {
        msg = `JWT heartbeat token verified successfully.`;
      }

      setLiveLogs(prev => [
        { timestamp: timeString, origin: randomOrigin, level: randomLevel, message: msg },
        ...prev.slice(0, 9)
      ]);

    }, 5000);

    return () => clearInterval(statusInterval);
  }, []);

  /* ── Computations ────────────────────────────────────────────────────── */
  const filteredFAQs = useMemo(() => {
    return FAQ_DATABASE.filter(faq => {
      const matchesCat = faqCategory === 'all' || faq.category === faqCategory;
      const matchesSearch = searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (faq.technicalDetails && faq.technicalDetails.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, faqCategory]);

  /* ── Handlers ────────────────────────────────────────────────────────── */
  const handleToggleFAQ = (id: string) => {
    setExpandedFAQ(prev => (prev === id ? null : id));
  };

  const handleFAQRating = (id: string, rating: 'yes' | 'no') => {
    setHelpfulRatings(prev => ({ ...prev, [id]: rating }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVoteFeature = (id: string) => {
    if (userVotes.includes(id)) {
      // Downvote
      setFeatureBoard(prev =>
        prev.map(item => (item.id === id ? { ...item, upvotes: item.upvotes - 1 } : item))
      );
      setUserVotes(prev => prev.filter(v => v !== id));
    } else {
      // Upvote
      setFeatureBoard(prev =>
        prev.map(item => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
      );
      setUserVotes(prev => [...prev, id]);
    }
  };

  const handleNewFeatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeature.title || !newFeature.desc) return;

    const request: FeatureRequest = {
      id: `FEAT-${Math.floor(Math.random() * 900) + 100}`,
      title: newFeature.title,
      description: newFeature.desc,
      upvotes: 1,
      status: 'under-review',
      category: newFeature.category,
      author: 'Candidate User'
    };

    setFeatureBoard(prev => [request, ...prev]);
    setUserVotes(prev => [...prev, request.id]);
    setNewFeature({ title: '', desc: '', category: 'Interface' });
    setFeatureAddedMessage(true);
    setTimeout(() => setFeatureAddedMessage(false), 3000);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.name || !ticket.email || !ticket.subject || !ticket.message) return;

    setIsSubmitting(true);
    setTicketTrace(null);

    // Simulate backend API dispatcher trace
    setTimeout(() => {
      const tId = `TKT-${Math.floor(Math.random() * 9000) + 1000}`;
      const now = new Date();
      const time = now.toTimeString().split(' ')[0];

      const logs = [
        `[${time}] Initializing socket connection to Support Dispatcher...`,
        `[${time}] Connection authenticated for Candidate: ${ticket.email}`,
        `[${time}] Subject parsed for automated matching classification...`,
        `[${time}] Category tag "${ticket.category.toUpperCase()}" assigned.`,
        `[${time}] Ticket successfully queued with ID: ${tId}. Priority: ${ticket.priority.toUpperCase()}`,
        `[${time}] Notification dispatch email queued to candidate inbox.`
      ];

      setTicketTrace(logs);
      setIsSubmitting(false);

      // Append to live logs
      setLiveLogs(prev => [
        { timestamp: time, origin: 'Gateway', level: 'success', message: `Support Ticket ${tId} parsed and queued successfully.` },
        ...prev
      ]);

      // Clear ticket form message
      setTicket(prev => ({ ...prev, subject: '', message: '' }));

    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-16">
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-blue-600 dark:text-blue-500" />
            Candidate Support & Feedback Center
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Ask questions, submit support inquiries, vote on upcoming features, and monitor system performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          >
            {isCopied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span>Copied Link</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation and Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Controls */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search help pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 scrollbar-none">
            {[
              { id: 'faq', label: 'Frequently Asked Questions', icon: HelpCircle },
              { id: 'features', label: 'Feature Suggestion Board', icon: PenTool },
              { id: 'ticketing', label: 'Submit Support Ticket', icon: MessageSquare },
              { id: 'status', label: 'System Status Console', icon: Activity }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as HelpTab)}
                  className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap lg:whitespace-normal shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick status Widget */}
          <div className="hidden lg:block p-4 rounded-xl bg-green-50/50 dark:bg-green-950/20 border border-green-100/50 dark:border-green-900/30">
            <h4 className="text-xs font-bold text-green-900 dark:text-green-400 flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5" />
              API Latency Status
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-green-800 dark:text-green-400 font-semibold">{latencyPoints[latencyPoints.length - 1]}ms (Nominal)</span>
            </div>
            <p className="text-[10px] text-green-800/80 dark:text-green-400/80 leading-normal mt-2">
              API Gateways and AI assistant semantic indexing run with zero active failures.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 md:p-8 shadow-sm">
          
          {/* TAB 1: FAQ Accordion */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Help Categories</h2>
                  <p className="text-xs text-gray-500 mt-1">Browse frequently asked support files.</p>
                </div>
                <div className="flex gap-1.5 overflow-x-auto">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'account', label: 'Profile' },
                    { id: 'opportunities', label: 'Jobs' },
                    { id: 'ai', label: 'AI' },
                    { id: 'security', label: 'Trust' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setFaqCategory(cat.id as any)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded ${
                        faqCategory === cat.id
                          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredFAQs.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-800 dark:text-gray-300">No FAQs found</h4>
                  <p className="text-xs mt-1">Try modifying your query or category selection.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFAQs.map(faq => {
                    const isExpanded = expandedFAQ === faq.id;
                    const rating = helpfulRatings[faq.id];
                    return (
                      <div
                        key={faq.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
                      >
                        <button
                          onClick={() => handleToggleFAQ(faq.id)}
                          className="w-full text-left p-4 flex justify-between items-center gap-4 bg-gray-50/50 dark:bg-gray-900/10 cursor-pointer"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block">
                              {faq.category} &bull; {faq.id}
                            </span>
                            <h3 className="font-bold text-sm text-gray-950 dark:text-white leading-snug">
                              {faq.question}
                            </h3>
                          </div>
                          <div className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 shrink-0">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="p-4 border-t border-gray-150 dark:border-gray-700 space-y-4">
                            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                              {faq.answer}
                            </p>
                            {faq.technicalDetails && (
                              <div className="p-3 bg-gray-50 dark:bg-gray-900 border-l-2 border-blue-500 rounded-r-md text-[10px] font-mono text-gray-600 dark:text-gray-400">
                                <span className="font-bold uppercase tracking-wider text-gray-900 dark:text-white block mb-1">
                                  System Pipeline Integration:
                                </span>
                                {faq.technicalDetails}
                              </div>
                            )}
                            
                            {/* Review Rating Strip */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-750 text-[11px] font-medium text-gray-500">
                              <span>Was this instruction clear and helpful?</span>
                              <div className="flex gap-2">
                                {rating ? (
                                  <span className="text-green-600 font-semibold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Feedback saved!
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleFAQRating(faq.id, 'yes')}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-650 cursor-pointer"
                                    >
                                      <ThumbsUp className="w-3 h-3 text-green-500" />
                                      Yes
                                    </button>
                                    <button
                                      onClick={() => handleFAQRating(faq.id, 'no')}
                                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-650 cursor-pointer"
                                    >
                                      <ThumbsDown className="w-3 h-3 text-red-500" />
                                      No
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Feature Suggestion Board */}
          {activeTab === 'features' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Feature Board</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Have an idea to improve YuvaHub? Propose features, upvote requests, and track what our dev team is working on.
                </p>
              </div>

              {/* Submit Feature Suggestion Form */}
              <div className="border border-gray-200 dark:border-gray-750 p-5 rounded-xl bg-gray-50 dark:bg-gray-900/40">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-blue-600" />
                  Suggest a Feature
                </h3>
                
                {featureAddedMessage && (
                  <div className="p-3 bg-green-50 border border-green-150 text-green-700 rounded-lg text-xs font-semibold mb-3">
                    Thank you! Your feature suggestion has been published to the board.
                  </div>
                )}

                <form onSubmit={handleNewFeatureSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Feature Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Integrate Slack updates notifications"
                        className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                        value={newFeature.title}
                        onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Category</label>
                      <select
                        className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                        value={newFeature.category}
                        onChange={(e) => setNewFeature({ ...newFeature, category: e.target.value })}
                      >
                        <option value="Interface">Interface</option>
                        <option value="Messaging">Messaging</option>
                        <option value="Search & Maps">Search & Maps</option>
                        <option value="AI Assistant">AI Assistant</option>
                        <option value="Other">Other Category</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Short Description</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Explain how this feature will help candidates or recruiters..."
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white font-sans"
                      value={newFeature.desc}
                      onChange={(e) => setNewFeature({ ...newFeature, desc: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center justify-center gap-1">
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Suggestion</span>
                  </button>
                </form>
              </div>

              {/* Feature requests feed */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureBoard.map(feat => {
                  const hasVoted = userVotes.includes(feat.id);
                  return (
                    <div
                      key={feat.id}
                      className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-850 hover:border-gray-300 dark:hover:border-gray-650 transition flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded uppercase tracking-wider">
                            {feat.category}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                            feat.status === 'implemented'
                              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                              : feat.status === 'under-review'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          }`}>
                            {feat.status}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">{feat.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-sans">{feat.description}</p>
                      </div>

                      <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700/60 pt-3 text-[10px] text-gray-400 font-mono">
                        <span>Proposed by: {feat.author}</span>
                        <button
                          onClick={() => handleVoteFeature(feat.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                            hasVoted
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'bg-gray-55 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{feat.upvotes} Votes</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Support Ticketing */}
          {activeTab === 'ticketing' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Helpdesk Ticketing</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Submit detailed bug reports or questions. Direct route to YuvaHub support team.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form column */}
                <form onSubmit={handleTicketSubmit} className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                        value={ticket.name}
                        onChange={(e) => setTicket({ ...ticket, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Your Email</label>
                      <input
                        type="email"
                        required
                        className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                        value={ticket.email}
                        onChange={(e) => setTicket({ ...ticket, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Inquiry Category</label>
                      <select
                        className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                        value={ticket.category}
                        onChange={(e) => setTicket({ ...ticket, category: e.target.value })}
                      >
                        <option value="opportunities">Opportunity Listings</option>
                        <option value="profile">Profile & CV Editor</option>
                        <option value="ai">AI Matcher Assistant</option>
                        <option value="security">Trust & Safety Abuse</option>
                        <option value="other">General Feedback</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Priority</label>
                      <div className="flex gap-2">
                        {(['low', 'medium', 'high'] as const).map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setTicket({ ...ticket, priority: p })}
                            className={`flex-1 py-1.5 rounded border text-[10px] font-mono font-bold uppercase transition ${
                              ticket.priority === p
                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                : 'bg-white dark:bg-gray-850 border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="Summary of issue..."
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white"
                      value={ticket.subject}
                      onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Detailed Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Explain steps to reproduce bug or details of query..."
                      className="w-full text-xs p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-white font-sans"
                      value={ticket.message}
                      onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Queuing Socket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit support ticket</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Console Log column */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white font-mono text-[10px] self-start space-y-4">
                  <h4 className="text-xs text-blue-400 font-bold border-b border-slate-800 pb-2 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    Helpdesk Dispatcher Logs
                  </h4>
                  {ticketTrace ? (
                    <div className="space-y-1.5">
                      {ticketTrace.map((log, idx) => (
                        <div key={idx} className="leading-relaxed">{log}</div>
                      ))}
                      <div className="pt-3 border-t border-slate-800 text-xs text-green-400 font-sans flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Ticket Dispatched. A support member will contact you at <b>{ticket.email}</b>.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs py-8 text-center italic">
                      Submit support ticket on the left to see local dispatcher socket trace logs in real-time.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: System Status Console */}
          {activeTab === 'status' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Performance Monitor</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Simulated active logs monitoring application gateway routing loops.
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'CPU Cluster Load', value: `${cpuLoad}%`, color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Gateway Ping', value: `${latencyPoints[latencyPoints.length - 1]}ms`, color: 'text-green-600 dark:text-green-400' },
                  { label: 'Uptime Index', value: '99.98%', color: 'text-purple-600 dark:text-purple-400' }
                ].map(metric => (
                  <div key={metric.label} className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-center">
                    <span className="text-2xl font-black block tracking-tight dark:text-white">{metric.value}</span>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mt-1">{metric.label}</span>
                  </div>
                ))}
              </div>

              {/* Sparkline latency graph */}
              <div className="p-5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 rounded-xl space-y-3">
                <span className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  Real-time API Gateway latency sparkline graph (ms)
                </span>
                <div className="h-28 w-full bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-lg flex items-end p-2 relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                    <line x1="0" y1="20" x2="200" y2="20" stroke="rgba(156, 163, 175, 0.15)" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="0" y1="40" x2="200" y2="40" stroke="rgba(156, 163, 175, 0.15)" strokeWidth="0.5" strokeDasharray="3,3" />
                    <line x1="0" y1="60" x2="200" y2="60" stroke="rgba(156, 163, 175, 0.15)" strokeWidth="0.5" strokeDasharray="3,3" />
                    <polyline
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2"
                      points={latencyPoints
                        .map((val, idx) => `${(idx * 200) / 6},${80 - (val / 150) * 65}`)
                        .join(' ')}
                    />
                  </svg>
                  <span className="absolute left-2.5 top-2 text-[9px] font-mono text-gray-400">150ms</span>
                  <span className="absolute left-2.5 bottom-2 text-[9px] font-mono text-gray-400">20ms</span>
                  <span className="absolute right-2.5 bottom-2 text-xs font-mono text-blue-600 dark:text-blue-400 font-bold">
                    {latencyPoints[latencyPoints.length - 1]}ms
                  </span>
                </div>
              </div>

              {/* Console log box */}
              <div className="space-y-3">
                <span className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  Service Heartbeat Log Stream
                </span>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto font-mono text-[10px] text-white space-y-2 select-text">
                  {liveLogs.map((log, index) => {
                    const tagStyle = 
                      log.level === 'success' ? 'text-green-400' :
                      log.level === 'warning' ? 'text-amber-400 font-bold' :
                      log.level === 'error' ? 'text-red-400 font-bold' : 'text-slate-400';
                    
                    const origStyle =
                      log.origin === 'AIAssistant' ? 'text-purple-400' :
                      log.origin === 'OpportunityEngine' ? 'text-cyan-400' :
                      log.origin === 'AuthService' ? 'text-blue-400' : 'text-slate-300';

                    return (
                      <div key={index} className="border-b border-slate-800 pb-2 last:border-none last:pb-0">
                        <div className="flex justify-between text-slate-500 text-[9px] mb-0.5">
                          <span>[{log.timestamp}]</span>
                          <span className={`${origStyle} font-bold`}>{log.origin}</span>
                        </div>
                        <p className="text-slate-200">
                          <span className={`${tagStyle} mr-1.5`}>&bull;</span>
                          {log.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Target,
  Globe,
  Sliders,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  Bookmark,
  Zap,
  Clock,
  Briefcase,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  FileCode,
  Bell,
  Brain,
  HelpCircle,
  ThumbsDown,
  ExternalLink,
  Save,
  RotateCcw
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import {
  fetchPersonalizedRecommendations,
  fetchMatchExplanation,
  fetchRecommendationPreferences,
  updateRecommendationPreferences,
  recordRecommendationInteraction,
  fetchProfileCompletenessScore
} from '../../services/apiClient';

export default function OpportunityMatchStudio() {
  const { user, profile, bookmarkedIds, toggleBookmark } = useAppContext();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'matches' | 'preferences' | 'pipeline' | 'export'>('matches');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Data Loading State
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [selectedType, setSelectedType] = useState('All');
  const [minMatchScore, setMinMatchScore] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  // Completeness State
  const [completeness, setCompleteness] = useState<any>(null);
  const [showCompletenessModal, setShowCompletenessModal] = useState(false);

  // AI Explanation Modal State
  const [explanationModal, setExplanationModal] = useState<{ open: boolean; loading: boolean; data: any }>({
    open: false,
    loading: false,
    data: null
  });

  // Saved Preferences State
  const [targetRole, setTargetRole] = useState('Software & AI Engineer');
  const [preferredLocation, setPreferredLocation] = useState('Remote');
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [minStipend, setMinStipend] = useState('1000');
  const [preferredTypes, setPreferredTypes] = useState<string[]>(['Hackathon', 'Open Source', 'Internship', 'Grant']);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Pipeline State
  const [pipeline, setPipeline] = useState([
    { id: 'p_1', title: 'Google Summer of Code 2026', org: 'Google Open Source', stage: 'APPLIED', date: '2026-07-15' },
    { id: 'p_2', title: 'ETHGlobal AI Autonomous Agent Hackathon', org: 'ETHGlobal', stage: 'SCREENING', date: '2026-07-18' },
    { id: 'p_3', title: 'Stripe Engineering Fellowship', org: 'Stripe', stage: 'INTERVIEW', date: '2026-07-22' }
  ]);
  const [newAppTitle, setNewAppTitle] = useState('');

  // Fetch recommendations from API backend
  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetchPersonalizedRecommendations({
        minScore: minMatchScore,
        type: selectedType,
        limit: 30
      });

      if (res && res.status === 'success') {
        setMatches(res.items || []);
        setTotalCount(res.total || 0);
        if (res.completeness) setCompleteness(res.completeness);
      } else {
        // Mock fallback if offline
        setMatches([
          {
            id: 'm_1',
            title: 'Google Summer of Code 2026',
            organization: 'Google Open Source',
            type: 'Open Source Grant',
            matchScore: 98,
            matchDetails: { matchingSkills: ['Python', 'Git', 'C++'], missingSkills: ['Docker'] },
            stipend: '$3,000 USD',
            location: 'Remote',
            deadline: '2026-08-20',
            tags: ['Python', 'C++', 'Git', 'Open Source']
          },
          {
            id: 'm_2',
            title: 'ETHGlobal AI & Autonomous Agent Hackathon',
            organization: 'ETHGlobal',
            type: 'Hackathon',
            matchScore: 94,
            matchDetails: { matchingSkills: ['TypeScript', 'Gemini'], missingSkills: ['Solidity'] },
            stipend: '$50,000 Pool',
            location: 'Global / Virtual',
            deadline: '2026-09-05',
            tags: ['TypeScript', 'Solidity', 'Gemini', 'AI']
          },
          {
            id: 'm_3',
            title: 'Stripe Software Engineering Fellowship',
            organization: 'Stripe',
            type: 'Internship',
            matchScore: 89,
            matchDetails: { matchingSkills: ['JavaScript', 'API Design'], missingSkills: ['Ruby', 'Go'] },
            stipend: '$8,000 / Mo',
            location: 'Remote',
            deadline: '2026-10-01',
            tags: ['Ruby', 'Go', 'API Design', 'Backend']
          }
        ]);
      }
    } catch (err) {
      console.error("Load recommendations error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    loadRecommendations();
  }, [minMatchScore, selectedType]);

  // Fetch saved preferences on mount
  useEffect(() => {
    async function loadPrefs() {
      const res = await fetchRecommendationPreferences();
      if (res && res.status === 'success' && res.preferences) {
        const p = res.preferences;
        if (p.targetRole) setTargetRole(p.targetRole);
        if (p.preferredLocations && p.preferredLocations.length > 0) setPreferredLocation(p.preferredLocations.join(', '));
        if (typeof p.remoteOnly === 'boolean') setRemoteOnly(p.remoteOnly);
        if (p.minStipend) setMinStipend(p.minStipend.toString());
        if (p.preferredTypes) setPreferredTypes(p.preferredTypes);
        if (p.minMatchScore) setMinMatchScore(p.minMatchScore);
      }
    }
    loadPrefs();
  }, []);

  // Fetch profile completeness score
  useEffect(() => {
    async function loadCompleteness() {
      const res = await fetchProfileCompletenessScore();
      if (res && res.status === 'success') {
        setCompleteness(res.completeness);
      }
    }
    loadCompleteness();
  }, [profile]);

  // Open "Why this opportunity?" modal
  const handleOpenExplanation = async (opp: any) => {
    setExplanationModal({ open: true, loading: true, data: { opp } });
    const oppId = opp.id || opp._id;
    const res = await fetchMatchExplanation(oppId);
    if (res && res.status === 'success') {
      setExplanationModal({
        open: true,
        loading: false,
        data: {
          opp,
          explanation: res.explanation,
          matchDetails: res.matchDetails
        }
      });
    } else {
      setExplanationModal({
        open: true,
        loading: false,
        data: {
          opp,
          explanation: `This opportunity aligns ${opp.matchScore || 85}% with your candidate profile based on matching skills (${(opp.matchDetails?.matchingSkills || opp.tags || []).join(', ')}) and target role interest.`,
          matchDetails: opp.matchDetails || { matchScore: opp.matchScore || 85, matchingSkills: opp.tags || [], missingSkills: [] }
        }
      });
    }

    // Record 'view' telemetry
    recordRecommendationInteraction(oppId, 'view', opp.tags || [], opp.type || '');
  };

  // Handle Dismiss (Not Interested)
  const handleDismissOpportunity = async (oppId: string, tags: string[], type: string) => {
    setMatches(matches.filter(m => (m.id || m._id) !== oppId));
    setNotification({ type: 'success', message: 'Dismissed opportunity. Recommendations retuned!' });
    await recordRecommendationInteraction(oppId, 'dismiss', tags, type);
  };

  // Save preferences handler
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const payload = {
        targetRole,
        preferredLocations: preferredLocation.split(',').map(s => s.trim()).filter(Boolean),
        remoteOnly,
        minStipend: parseInt(minStipend) || 0,
        preferredTypes,
        minMatchScore
      };
      await updateRecommendationPreferences(payload);
      setNotification({ type: 'success', message: 'Saved recommendation preferences! Retuning feed...' });
      await loadRecommendations();
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to save preferences.' });
    } finally {
      setSavingPrefs(false);
    }
  };

  // Add Pipeline Item
  const handleAddPipeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppTitle.trim()) return;

    const newItem = {
      id: `p_${Date.now()}`,
      title: newAppTitle.trim(),
      org: 'External Platform',
      stage: 'APPLIED',
      date: new Date().toISOString().split('T')[0]
    };

    setPipeline([...pipeline, newItem]);
    setNewAppTitle('');
    setNotification({ type: 'success', message: 'Added opportunity to tracking pipeline!' });
  };

  // Filtered matches calculation
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (m.title || '').toLowerCase().includes(q);
        const orgMatch = (m.organization || '').toLowerCase().includes(q);
        const tagMatch = (m.tags || []).some((t: string) => t.toLowerCase().includes(q));
        if (!titleMatch && !orgMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [matches, searchQuery]);

  // Average match score
  const avgScore = useMemo(() => {
    if (matches.length === 0) return 85;
    const sum = matches.reduce((acc, curr) => acc + (curr.matchScore || 0), 0);
    return Math.round(sum / matches.length);
  }, [matches]);

  // Export Match Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      user: user?.displayName || profile?.name || 'Candidate Applicant',
      targetRole,
      preferredLocation,
      remoteOnly,
      minStipend: `$${minStipend} USD`,
      profileCompleteness: completeness?.score || 80,
      matchesCount: matches.length,
      topMatches: matches.slice(0, 5).map(m => ({ title: m.title, score: m.matchScore, type: m.type })),
      pipelineSummary: pipeline,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Opportunity_Matches_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner Header - Brand Theme */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Recommendation Engine
              </span>
              <button onClick={() => setShowCompletenessModal(true)} className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Profile Completeness: {completeness?.score || 85}%
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              AI Opportunity Match <span className="text-primary-blue italic">& Personalization Studio</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Algorithmic matching engine pairing your complete profile, skills, and interest telemetry with verified global opportunities.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-base text-primary-blue">
              {avgScore}%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average Alignment Score</div>
              <div className="text-xs font-extrabold text-white">{pipeline.length} Active Pipeline Applications</div>
              <div className="text-[11px] text-emerald-400 font-semibold">{totalCount || matches.length} Top Matches Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Notifications */}
      {notification.message && (
        <div className={`mt-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
          notification.type === 'error'
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
        {[
          { id: 'matches', label: `Personalized Recommendations (${matches.length})`, icon: Sparkles },
          { id: 'preferences', label: 'Saved Preferences & Parameters', icon: Sliders },
          { id: 'pipeline', label: `Application Pipeline (${pipeline.length})`, icon: Layers },
          { id: 'export', label: 'Match Manifest JSON', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-surface dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: MATCHES */}
      {activeTab === 'matches' && (
        <div className="space-y-6">
          
          {/* Controls & Filter Bar */}
          <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search matches by keyword or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0 text-xs font-semibold">
                {['All', 'Hackathon', 'Open Source', 'Internship', 'Grant', 'AI & Data Science'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedType(cat)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                      selectedType === cat
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Min Score Threshold Slider */}
            <div className="flex items-center gap-4 text-xs pt-2 border-t border-gray-100 dark:border-gray-700/60">
              <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Sliders size={13} /> Minimum Match Score Filter: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{minMatchScore}%</span>
              </span>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={minMatchScore}
                onChange={(e) => setMinMatchScore(parseInt(e.target.value))}
                className="flex-1 accent-blue-600 cursor-pointer"
              />
              <button
                onClick={loadRecommendations}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-100 transition cursor-pointer"
              >
                <RotateCcw size={12} /> Refresh Feed
              </button>
            </div>
          </div>

          {/* Opportunity Recommendation Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
              <Sparkles className="animate-spin mx-auto text-blue-500" size={28} />
              <p className="text-xs font-bold">Computing candidate profile alignment vectors...</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-12 text-center bg-surface dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
              <Search className="mx-auto text-gray-400" size={32} />
              <h4 className="font-bold text-gray-800 dark:text-white text-sm">No matches found for current filter</h4>
              <p className="text-xs text-gray-500">Try lowering the minimum match score threshold or clearing category filters.</p>
              <button
                onClick={() => { setMinMatchScore(30); setSelectedType('All'); setSearchQuery(''); }}
                className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {filteredMatches.map((m) => {
                const id = m.id || m._id;
                const isSaved = bookmarkedIds.includes(id);
                const matchScore = m.matchScore || 85;

                return (
                  <div key={id} className="p-5 bg-surface dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-4 flex flex-col justify-between text-xs shadow-sm hover:shadow-md transition">
                    <div className="space-y-3">
                      
                      {/* Header Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400 uppercase text-[11px] tracking-wide">
                          {m.organization || 'Global Sponsor'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2.5 py-1 font-extrabold rounded-lg text-xs ${
                            matchScore >= 90
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : matchScore >= 75
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                          }`}>
                            {matchScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Title & Category */}
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-base leading-snug">{m.title}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                          {m.type || 'Opportunity'} • {m.stipend || m.location || 'Remote'}
                        </p>
                      </div>

                      {/* Tags */}
                      {m.tags && m.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {m.tags.slice(0, 4).map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Matching Skills Pill Preview */}
                      {m.matchDetails?.matchingSkills && m.matchDetails.matchingSkills.length > 0 && (
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
                          <span className="font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> Matched Skills:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.matchDetails.matchingSkills.map((sk: string, i: number) => (
                              <span key={i} className="px-1.5 py-0.5 bg-emerald-200/60 dark:bg-emerald-900/60 rounded font-mono text-[10px]">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Action Buttons */}
                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                      
                      {/* AI "Why this opportunity?" button */}
                      <button
                        onClick={() => handleOpenExplanation(m)}
                        className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                      >
                        <Brain size={14} /> Why This Opportunity? (AI Rationale)
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => toggleBookmark(id)}
                          className={`py-2 font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
                            isSaved
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Bookmark size={13} /> {isSaved ? 'Saved' : 'Save'}
                        </button>

                        <button
                          onClick={() => handleDismissOpportunity(id, m.tags || [], m.type || '')}
                          className="py-2 bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <ThumbsDown size={13} /> Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PREFERENCES */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sliders size={18} className="text-blue-500" /> Saved Recommendation Parameters
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Tune your matching engine parameters to adjust recommendations and notification thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Target Role Focus</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Full Stack Developer, AI Engineer, Data Scientist"
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Preferred Locations</label>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="e.g. Remote, India, United States"
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1.5">Minimum Desired Stipend ($/mo)</label>
              <input
                type="number"
                value={minStipend}
                onChange={(e) => setMinStipend(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="remoteOnlyCheck"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="remoteOnlyCheck" className="font-bold text-gray-800 dark:text-gray-200 cursor-pointer">
                Strictly Remote / Virtual Opportunities Only
              </label>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-gray-100 dark:border-gray-700/60 pt-4">
            <label className="block font-bold text-gray-700 dark:text-gray-300">Preferred Opportunity Categories</label>
            <div className="flex flex-wrap gap-2">
              {['Hackathon', 'Open Source', 'Internship', 'Grant', 'Fellowship', 'Research'].map((cat) => {
                const isSelected = preferredTypes.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => {
                      if (isSelected) setPreferredTypes(preferredTypes.filter(t => t !== cat));
                      else setPreferredTypes([...preferredTypes, cat]);
                    }}
                    className={`px-3.5 py-2 rounded-xl font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              disabled={savingPrefs}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={15} /> {savingPrefs ? 'Saving Preferences...' : 'Save & Retune Engine'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Application Stage Telemetry</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track active applications across recruitment stages.</p>
          </div>

          <form onSubmit={handleAddPipeline} className="flex gap-2">
            <input
              type="text"
              placeholder="Add opportunity title (e.g. OpenAI Research Fellowship)..."
              value={newAppTitle}
              onChange={(e) => setNewAppTitle(e.target.value)}
              className="flex-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              required
            />
            <button type="submit" className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition cursor-pointer">
              + Track Application
            </button>
          </form>

          <div className="space-y-2">
            {pipeline.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{p.title}</div>
                  <div className="text-gray-500 text-[11px]">{p.org} • Applied: {p.date}</div>
                </div>

                <span className={`px-3 py-1 text-[11px] font-extrabold rounded-full ${
                  p.stage === 'INTERVIEW' ? 'bg-purple-100 text-purple-700' :
                  p.stage === 'SCREENING' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {p.stage}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXPORT */}
      {activeTab === 'export' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Opportunity Match Manifest JSON</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete summary of recommendation scores and tracked applications.</p>
            </div>

            <button
              onClick={handleExportManifest}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} /> Download Manifest JSON
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-blue-300 overflow-x-auto">
            <pre>{JSON.stringify({
              user: user?.displayName || profile?.name || 'Candidate Applicant',
              targetRole,
              preferredLocation,
              remoteOnly,
              minStipend: `$${minStipend} USD`,
              profileCompleteness: completeness?.score || 85,
              matchesCount: matches.length,
              pipelineSummary: pipeline,
              timestamp: new Date().toISOString()
            }, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* AI Explanation Rationale Modal */}
      {explanationModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            
            <button
              onClick={() => setExplanationModal({ open: false, loading: false, data: null })}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/80 rounded-2xl text-blue-600 dark:text-blue-400">
                <Brain size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">AI Recommendation Rationale</h3>
                <p className="text-xs text-gray-500">{explanationModal.data?.opp?.title}</p>
              </div>
            </div>

            {explanationModal.loading ? (
              <div className="py-8 text-center text-gray-500 space-y-2">
                <Sparkles className="animate-spin mx-auto text-blue-500" size={24} />
                <p className="text-xs font-bold">Synthesizing candidate skill alignment explanation...</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                
                {/* Match Score Bar */}
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/40">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Match Alignment Score:</span>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                    {explanationModal.data?.matchDetails?.matchScore || explanationModal.data?.opp?.matchScore || 85}%
                  </span>
                </div>

                {/* Explanation text */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  {explanationModal.data?.explanation}
                </p>

                {/* Matched & Missing Skills */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 mb-1.5">
                      <CheckCircle2 size={12} /> Matching Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(explanationModal.data?.matchDetails?.matchingSkills || explanationModal.data?.opp?.tags || ['Software Engineering']).map((sk: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 bg-emerald-200/60 dark:bg-emerald-900/60 rounded text-[10px] font-mono">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/40">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 mb-1.5">
                      <AlertTriangle size={12} /> Skills to Learn:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(explanationModal.data?.matchDetails?.missingSkills || ['System Architecture']).map((sk: string, i: number) => (
                        <span key={i} className="px-1.5 py-0.5 bg-amber-200/60 dark:bg-amber-900/60 rounded text-[10px] font-mono">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setExplanationModal({ open: false, loading: false, data: null })}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                  >
                    Got It
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Completeness Breakdown Modal */}
      {showCompletenessModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowCompletenessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Profile Completeness Score</h3>
                <p className="text-xs text-gray-500">Completeness level directly impacts recommendation accuracy.</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                <span className="font-bold text-gray-800 dark:text-gray-200">Overall Profile Progress</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{completeness?.score || 85}%</span>
              </div>

              {completeness?.breakdown && (
                <div className="space-y-2">
                  {Object.entries(completeness.breakdown).map(([key, item]: [string, any]) => (
                    <div key={key} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <span className="font-bold text-gray-700 dark:text-gray-300">{item.title}</span>
                      <span className={`font-mono font-bold ${item.earned === item.max ? 'text-emerald-600' : 'text-amber-500'}`}>
                        {item.earned} / {item.max} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {completeness?.missingFields && completeness.missingFields.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="font-bold text-gray-800 dark:text-gray-200">Recommended Steps to Reach 100%:</span>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    {completeness.missingFields.map((mf: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5 text-[11px]">
                        <ChevronRight size={12} className="text-blue-500" /> {mf.suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowCompletenessModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

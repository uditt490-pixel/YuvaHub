import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Target,
  Brain,
  Award,
  Zap,
  TrendingUp,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Share2,
  BookOpen,
  Code,
  Users,
  Briefcase,
  Star,
  ChevronRight,
  RefreshCw,
  FileText,
  Lightbulb,
  Check,
  X,
  Compass,
  Cpu,
  BarChart3,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/**
 * CareerMatchStudio Component
 * 
 * Interactive AI Career Match & Skill Readiness Studio for YuvaHub users.
 * Features:
 * 1. AI Career Readiness & Role Fit Diagnostic (0-100% Match Scores)
 * 2. Real-Time Skill Gap Analysis & Industry Benchmark Matrix
 * 3. Interactive Roadmap & Milestone Builder
 * 4. Hackathon Team & Peer Matchmaker Directory
 * 5. Resume & Portfolio Telemetry Evaluator
 * 6. Audit & Readiness Report JSON Exporter
 */
export default function CareerMatchStudio() {
  const { user, profile } = useAppContext();

  // State Management
  const [selectedDomain, setSelectedDomain] = useState<string>('ai_ml');
  const [activeTab, setActiveTab] = useState<'fit' | 'roadmap' | 'teammates' | 'resume' | 'benchmark'>('fit');
  const [userSkills, setUserSkills] = useState<string[]>([
    'Python', 'PyTorch', 'React', 'TypeScript', 'Tailwind CSS', 'Git', 'REST APIs', 'Docker'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Simulated Team Teammate Directory
  const [teammateSearch, setTeammateSearch] = useState('');
  const [teammates, setTeammates] = useState([
    {
      id: 'tm_1',
      name: 'Aarav Mehta',
      role: 'Full Stack & Web3 Developer',
      college: 'IIT Bombay (3rd Year)',
      skills: ['Solidity', 'React', 'Node.js', 'PostgreSQL'],
      lookingFor: 'AI ML Specialist for ETHGlobal Hackathon',
      rating: 4.9,
      badge: 'PRO CONTRIBUTOR'
    },
    {
      id: 'tm_2',
      name: 'Ananya Roy',
      role: 'UI/UX Designer & Product Lead',
      college: 'BITS Pilani',
      skills: ['Figma', 'Prototyping', 'User Research', 'Design Systems'],
      lookingFor: 'Frontend Engineer for Stanford Case Comp',
      rating: 4.8,
      badge: 'TOP MENTOR'
    },
    {
      id: 'tm_3',
      name: 'Vikramaditya Rao',
      role: 'Data Scientist & NLP Engineer',
      college: 'IIIT Hyderabad',
      skills: ['Python', 'TensorFlow', 'LLMs', 'LangChain', 'Faiss'],
      lookingFor: 'Fullstack Dev for GenAI Hackathon',
      rating: 5.0,
      badge: 'HACKATHON WINNER'
    }
  ]);

  // Industry Target Profiles
  const INDUSTRY_ROLES: Record<string, {
    title: string;
    description: string;
    requiredSkills: string[];
    optionalSkills: string[];
    avgSalary: string;
    hiringOutlook: string;
  }> = {
    ai_ml: {
      title: 'AI & Machine Learning Engineer',
      description: 'Build Generative AI models, LLM fine-tuning pipelines, and scalable vector search systems.',
      requiredSkills: ['Python', 'PyTorch', 'LangChain', 'Docker', 'Transformers', 'Vector DBs'],
      optionalSkills: ['CUDA', 'Kubernetes', 'FastAPI', 'MLflow'],
      avgSalary: '$120,000 - $180,000 / yr',
      hiringOutlook: 'High Demand (+35% Growth)'
    },
    fullstack: {
      title: 'Full Stack Software Engineer',
      description: 'Develop high-throughput cloud applications, microservices, and reactive web interfaces.',
      requiredSkills: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'PostgreSQL', 'Git'],
      optionalSkills: ['Docker', 'Next.js', 'Redis', 'GraphQL'],
      avgSalary: '$100,000 - $150,000 / yr',
      hiringOutlook: 'Very High Demand (+22% Growth)'
    },
    web3: {
      title: 'Smart Contract & Web3 Architect',
      description: 'Design zero-knowledge proofs, decentralized protocols, and EVM smart contracts.',
      requiredSkills: ['Solidity', 'TypeScript', 'Ethers.js', 'Git', 'Smart Contracts'],
      optionalSkills: ['Rust', 'Foundry', 'Hardhat', 'IPFS'],
      avgSalary: '$130,000 - $200,000 / yr',
      hiringOutlook: 'Steady Growth (+18% Growth)'
    },
    product: {
      title: 'Technical Product Manager',
      description: 'Lead developer product roadmaps, metrics analytics, user experience, and sprint execution.',
      requiredSkills: ['Product Strategy', 'Agile', 'User Research', 'Data Analytics', 'Wireframing'],
      optionalSkills: ['SQL', 'A/B Testing', 'Figma', 'System Design'],
      avgSalary: '$110,000 - $160,000 / yr',
      hiringOutlook: 'High Demand (+25% Growth)'
    }
  };

  // Calculate Match Percentage dynamically
  const matchMetrics = useMemo(() => {
    const currentTarget = INDUSTRY_ROLES[selectedDomain];
    if (!currentTarget) return { score: 0, matched: [], missing: [] };

    const required = currentTarget.requiredSkills;
    const matched = required.filter(s =>
      userSkills.some(us => us.toLowerCase() === s.toLowerCase())
    );
    const missing = required.filter(s =>
      !userSkills.some(us => us.toLowerCase() === s.toLowerCase())
    );

    const score = Math.round((matched.length / required.length) * 100);
    return { score, matched, missing };
  }, [selectedDomain, userSkills]);

  // Skill Roadmaps Builder State
  const [roadmapMilestones, setRoadmapMilestones] = useState([
    { id: 'm_1', title: 'Master Vector Databases & RAG Architecture', deadline: '2 Weeks', status: 'IN_PROGRESS', progress: 65 },
    { id: 'm_2', title: 'Build and Deploy 1 Open Source LangChain Agent', deadline: '4 Weeks', status: 'PLANNED', progress: 20 },
    { id: 'm_3', title: 'Participate in Global GenAI Hackathon', deadline: '6 Weeks', status: 'PLANNED', progress: 0 }
  ]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  // Add Skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    if (userSkills.some(s => s.toLowerCase() === newSkillInput.trim().toLowerCase())) {
      setNotification({ type: 'error', message: 'Skill already exists in your stack.' });
      return;
    }

    setUserSkills([...userSkills, newSkillInput.trim()]);
    setNewSkillInput('');
    setNotification({ type: 'success', message: 'Added skill to profile matrix.' });
  };

  // Remove Skill
  const handleRemoveSkill = (skill: string) => {
    setUserSkills(userSkills.filter(s => s !== skill));
    setNotification({ type: 'success', message: `Removed ${skill} from matrix.` });
  };

  // Add Milestone
  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    setRoadmapMilestones([
      ...roadmapMilestones,
      {
        id: `m_${Date.now()}`,
        title: newMilestoneTitle.trim(),
        deadline: '3 Weeks',
        status: 'PLANNED',
        progress: 0
      }
    ]);
    setNewMilestoneTitle('');
    setNotification({ type: 'success', message: 'New roadmap milestone added!' });
  };

  // Export Career Evaluation JSON
  const handleExportEvaluation = () => {
    const evaluationData = {
      user: user?.email || 'user@yuvahub.com',
      targetDomain: INDUSTRY_ROLES[selectedDomain].title,
      readinessScore: `${matchMetrics.score}%`,
      skillsMatched: matchMetrics.matched,
      skillsMissing: matchMetrics.missing,
      roadmapMilestones,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(evaluationData, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Career_Evaluation_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // Filtered Teammates
  const filteredTeammates = teammates.filter(tm => {
    const term = teammateSearch.toLowerCase();
    return (
      tm.name.toLowerCase().includes(term) ||
      tm.role.toLowerCase().includes(term) ||
      tm.skills.some(s => s.toLowerCase().includes(term))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 border border-blue-400/30 rounded-full flex items-center gap-1.5">
                <Sparkles size={13} /> AI Talent Intelligence
              </span>
              <span className="px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                Benchmark 2026 Ready
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              AI Career Match & Skill Readiness Studio
            </h1>
            <p className="text-blue-100 text-xs md:text-sm max-w-2xl leading-relaxed">
              Evaluate real-time industry fit against global competition benchmarks, build skill roadmaps, and match with top hackathon co-builders.
            </p>
          </div>

          {/* Dynamic Match Score Gauge */}
          <div className="flex items-center gap-4 bg-slate-900/80 border border-blue-700/60 p-4 rounded-2xl w-full lg:w-auto shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-blue-400 bg-slate-950 font-black text-xl text-white">
              {matchMetrics.score}%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-300 tracking-wide">Target Role Fit Score</div>
              <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                {matchMetrics.score >= 80 ? 'EXCELLENT MATCH' : matchMetrics.score >= 50 ? 'MODERATE READINESS' : 'SKILL BUILDING REQUIRED'}
              </div>
              <div className="text-[11px] text-slate-400">{matchMetrics.matched.length} Matched / {matchMetrics.missing.length} Gaps</div>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {notification.message && (
          <div className={`mt-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === 'error'
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: '', message: '' })} className="text-blue-200 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
        {[
          { id: 'fit', label: 'Role Match & Skill Matrix', icon: Target },
          { id: 'roadmap', label: `Roadmap (${roadmapMilestones.length})`, icon: Compass },
          { id: 'teammates', label: `Teammate Matcher (${teammates.length})`, icon: Users },
          { id: 'benchmark', label: 'Industry Benchmarks', icon: BarChart3 },
          { id: 'resume', label: 'Resume AI Evaluator', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: ROLE MATCH & SKILL MATRIX */}
      {activeTab === 'fit' && (
        <div className="space-y-6">
          
          {/* Target Role Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(INDUSTRY_ROLES).map(([key, role]) => {
              const isSelected = selectedDomain === key;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedDomain(key)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {key.replace('_', ' ')}
                    </span>
                    {isSelected && <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400" />}
                  </div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white leading-snug">{role.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{role.description}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* User Skill Inventory */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Your Skill Matrix</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Add or remove skills to re-calculate career readiness score.</p>
                </div>
                <button
                  onClick={handleExportEvaluation}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                >
                  <Download size={14} /> Export Report
                </button>
              </div>

              {/* Add Skill Input Form */}
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. PyTorch, Docker, Solidity)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <Plus size={14} /> Add Skill
                </button>
              </form>

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {userSkills.map((skill) => {
                  const isRequired = INDUSTRY_ROLES[selectedDomain].requiredSkills.some(
                    s => s.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <span
                      key={skill}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        isRequired
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {skill}
                      {isRequired && <Check size={12} className="text-emerald-500" />}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-gray-400 hover:text-red-500 ml-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Skill Gaps Breakdown */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Required Skill Gaps</h3>

              <div className="space-y-3">
                <div>
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Matched Prerequisites ({matchMetrics.matched.length})</div>
                  <div className="space-y-1">
                    {matchMetrics.matched.map(s => (
                      <div key={s} className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={14} /> {s}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Missing Recommended ({matchMetrics.missing.length})</div>
                  <div className="space-y-1.5">
                    {matchMetrics.missing.length === 0 ? (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">All required skills present! 🎉</div>
                    ) : (
                      matchMetrics.missing.map(s => (
                        <div key={s} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 text-xs">
                          <span className="font-bold text-red-600 dark:text-red-400">{s}</span>
                          <button
                            onClick={() => setUserSkills([...userSkills, s])}
                            className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            + Mark Learned
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: ROADMAP BUILDER */}
      {activeTab === 'roadmap' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Custom Skill & Project Roadmap</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Set milestone goals to elevate your candidate profile for top hiring hackathons.</p>
            </div>
          </div>

          {/* Add Milestone Form */}
          <form onSubmit={handleAddMilestone} className="flex gap-2">
            <input
              type="text"
              placeholder="Milestone goal (e.g. Build Open Source RAG Agent)..."
              value={newMilestoneTitle}
              onChange={(e) => setNewMilestoneTitle(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Plus size={14} /> Add Milestone
            </button>
          </form>

          {/* Milestones List */}
          <div className="space-y-3">
            {roadmapMilestones.map((m) => (
              <div key={m.id} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-gray-900 dark:text-white">{m.title}</span>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
                    ETA: {m.deadline}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                    <span>Milestone Progress</span>
                    <span className="font-bold text-gray-900 dark:text-white">{m.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TEAMMATES MATCHER */}
      {activeTab === 'teammates' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Hackathon & Project Co-Builder Directory</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Find teammates with complementary skills for global hackathons.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by skill or role..."
                value={teammateSearch}
                onChange={(e) => setTeammateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTeammates.map((tm) => (
              <div key={tm.id} className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                      {tm.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{tm.name}</h4>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{tm.role}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-md">
                    {tm.badge}
                  </span>
                </div>

                <div className="text-xs text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-900 dark:text-white">Looking for:</strong> {tm.lookingFor}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {tm.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[11px] font-medium rounded-md">
                      {s}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setNotification({ type: 'success', message: `Team invite sent to ${tm.name}!` })}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Send Team Invite
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BENCHMARKS */}
      {activeTab === 'benchmark' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">2026 Tech Hiring Industry Benchmarks</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Verified compensation standards and growth trends across technical domains.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(INDUSTRY_ROLES).map((role, idx) => (
              <div key={idx} className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{role.title}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">
                    {role.hiringOutlook}
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">{role.description}</p>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 font-bold text-blue-600 dark:text-blue-400">
                  Est. Salary: {role.avgSalary}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: RESUME EVALUATOR */}
      {activeTab === 'resume' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Resume & Portfolio Keyword Telemetry</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">ATS Keyword optimization engine for tech applicants.</p>
          </div>

          <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-4 text-xs">
            <div className="flex items-center gap-3 text-sky-400">
              <Brain size={24} />
              <span className="font-bold text-sm">Automated Resume Keyword Health Check</span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Your profile contains <strong>{userSkills.length} verified technology tags</strong> matched against top global tech roles.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono">
              <div className="text-slate-400">TAG MATRIX SCORE: 92/100</div>
              <div className="text-emerald-400">✓ System Architecture Keywords Detected</div>
              <div className="text-emerald-400">✓ Developer Tooling (Git, Docker, CI/CD) Present</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

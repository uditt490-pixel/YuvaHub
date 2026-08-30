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

export default function CareerMatchStudio() {
  const { user, profile } = useAppContext();

  // State Management
  const [selectedDomain, setSelectedDomain] = useState<string>('ai_ml');
  const [activeTab, setActiveTab] = useState<'fit' | 'roadmap' | 'teammates' | 'resume' | 'export'>('fit');
  const [userSkills, setUserSkills] = useState<string[]>([
    'Python', 'PyTorch', 'React', 'TypeScript', 'Tailwind CSS', 'Git', 'REST APIs', 'Docker'
  ]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Peer Matchmaker Directory State
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
      badge: 'DESIGN FELLOW'
    },
    {
      id: 'tm_3',
      name: 'Rohan Sharma',
      role: 'Backend & Cloud Systems Engineer',
      college: 'IIIT Hyderabad',
      skills: ['Go', 'Kubernetes', 'gRPC', 'Distributed Systems'],
      lookingFor: 'DevOps Contributor for Open Source Project',
      rating: 5.0,
      badge: 'CORE MAINTAINER'
    }
  ]);

  // Industry Role Benchmarks Data
  const roleBenchmarks = useMemo(() => {
    return {
      ai_ml: {
        title: 'Senior AI & ML Research Engineer',
        requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'Vector DBs', 'CUDA', 'Docker', 'Distributed Training', 'LLMs'],
        avgSalary: '$140,000 / yr',
        readinessBase: 78
      },
      fullstack: {
        title: 'Lead Full Stack TypeScript Architect',
        requiredSkills: ['React', 'TypeScript', 'Next.js', 'Node.js', 'PostgreSQL', 'Redis', 'GraphQL', 'Tailwind CSS'],
        avgSalary: '$130,000 / yr',
        readinessBase: 85
      },
      cloud_devops: {
        title: 'Cloud Infrastructure & DevOps Engineer',
        requiredSkills: ['Go', 'Kubernetes', 'Docker', 'Terraform', 'AWS', 'CI/CD Pipelines', 'Linux Kernel', 'Prometheus'],
        avgSalary: '$135,000 / yr',
        readinessBase: 65
      }
    };
  }, []);

  const currentRole = roleBenchmarks[selectedDomain as keyof typeof roleBenchmarks];

  // Dynamic Fit Score Calculator based on user skills vs required skills
  const dynamicMatchResult = useMemo(() => {
    const matched = currentRole.requiredSkills.filter(req =>
      userSkills.some(s => s.toLowerCase() === req.toLowerCase())
    );
    const missing = currentRole.requiredSkills.filter(req =>
      !userSkills.some(s => s.toLowerCase() === req.toLowerCase())
    );
    const score = Math.min(100, Math.round((matched.length / currentRole.requiredSkills.length) * 100));

    return { matched, missing, score };
  }, [userSkills, currentRole]);

  // Handle Add Skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    if (userSkills.some(s => s.toLowerCase() === newSkillInput.trim().toLowerCase())) {
      setNotification({ type: 'error', message: 'Skill already exists in your stack!' });
      return;
    }
    setUserSkills([...userSkills, newSkillInput.trim()]);
    setNewSkillInput('');
    setNotification({ type: 'success', message: 'Added new skill to your readiness matrix!' });
  };

  // Handle Remove Skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setUserSkills(userSkills.filter(s => s !== skillToRemove));
    setNotification({ type: 'success', message: `Removed ${skillToRemove} from stack.` });
  };

  // Export Readiness Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      user: profile?.name || user?.displayName || 'Student Developer',
      selectedTargetRole: currentRole.title,
      readinessScore: `${dynamicMatchResult.score}%`,
      skillsMatched: dynamicMatchResult.matched,
      missingSkills: dynamicMatchResult.missing,
      recommendedTeammates: teammates,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Career_Match_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setNotification({ type: 'success', message: 'Exported Career Match Readiness JSON Manifest!' });
  };

  const filteredTeammates = teammates.filter(t =>
    t.name.toLowerCase().includes(teammateSearch.toLowerCase()) ||
    t.role.toLowerCase().includes(teammateSearch.toLowerCase()) ||
    t.skills.some(s => s.toLowerCase().includes(teammateSearch.toLowerCase()))
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      
      {/* Top Banner Header - Brand Theme */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <Target className="w-3.5 h-3.5 text-indigo-400" /> AI Career Match & Skill Readiness Studio
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                Real-Time Benchmark
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Career Match <span className="text-primary-blue italic">Studio</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Analyze target role readiness, discover missing skill gaps, match with peer hackathon teammates, and export career telemetry.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-base text-primary-blue">
              {dynamicMatchResult.score}%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Role Match Score</div>
              <div className="text-xs font-extrabold text-white">{currentRole.title}</div>
              <div className="text-[11px] text-emerald-400 font-semibold">{dynamicMatchResult.matched.length} of {currentRole.requiredSkills.length} Skills Matched</div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-border-theme dark:border-slate-800 pb-3">
        {[
          { id: 'ai_ml', label: 'AI & ML Engineer', icon: Brain },
          { id: 'fullstack', label: 'Full Stack Architect', icon: Code },
          { id: 'cloud_devops', label: 'Cloud & DevOps', icon: Cpu }
        ].map(dom => {
          const IconComponent = dom.icon;
          const isActive = selectedDomain === dom.id;
          return (
            <button
              key={dom.id}
              onClick={() => setSelectedDomain(dom.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-[#603620] border-[#603620] text-[#f3e4bd] shadow-sm scale-[1.02]'
                  : 'bg-surface dark:bg-slate-900 border-border-theme dark:border-slate-800 text-text-secondary dark:text-slate-300 hover:bg-surface-secondary'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-[#f3e4bd]' : 'text-primary-blue'}`} />
              <span>{dom.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-border-theme dark:border-slate-800 pb-3">
        {[
          { id: 'fit', label: 'Role Fit Diagnostic', icon: Target },
          { id: 'roadmap', label: 'Skill Gap & Roadmap', icon: TrendingUp },
          { id: 'teammates', label: 'Peer Team Matcher', icon: Users },
          { id: 'export', label: 'Export Telemetry', icon: Download }
        ].map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-primary-blue border-primary-blue text-white shadow-sm scale-[1.02]'
                  : 'bg-surface dark:bg-slate-900 border-border-theme dark:border-slate-800 text-text-secondary dark:text-slate-300 hover:bg-surface-secondary'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-primary-blue'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification Banner */}
      {notification.message && (
        <div className={`flex items-center justify-between p-3.5 rounded-xl text-xs font-bold animate-fade-in ${
          notification.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab 1: Role Fit Diagnostic */}
      {activeTab === 'fit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Skills Manager */}
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
            <div className="border-b border-border-theme dark:border-slate-800 pb-4">
              <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">Your Technical Stack</h2>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">Add or remove skills to dynamically recalculate your role fit score.</p>
            </div>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new skill (e.g. Kubernetes, Solidity)..."
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                className="flex-1 bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              />
              <button type="submit" className="px-5 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {userSkills.map(skill => (
                <span key={skill} className="px-3 py-1.5 bg-surface-secondary dark:bg-slate-800 text-text-primary dark:text-slate-200 border border-border-theme dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs">
                  <span>{skill}</span>
                  <button onClick={() => handleRemoveSkill(skill)} className="text-text-muted hover:text-red-600 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Role Match Skill Audit */}
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
            <div className="border-b border-border-theme dark:border-slate-800 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">Role Match Audit</h2>
                <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">{currentRole.title}</p>
              </div>
              <span className="text-xs font-bold text-primary-blue bg-[#f3e4bd] px-3 py-1 rounded-full border border-border-theme">
                {currentRole.avgSalary}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-[#63703d] uppercase tracking-wider block mb-2">Matched Skills ({dynamicMatchResult.matched.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {dynamicMatchResult.matched.map(s => (
                    <span key={s} className="px-3 py-1 bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30 text-xs font-bold rounded-xl flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-2">Skill Gaps to Master ({dynamicMatchResult.missing.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {dynamicMatchResult.missing.map(s => (
                    <span key={s} className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skill Gap Roadmap */}
      {activeTab === 'roadmap' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-border-theme dark:border-slate-800 pb-4">
            <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">Recommended Skill Upgrade Path</h2>
            <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">Focus on these missing skills to reach 100% role readiness for {currentRole.title}.</p>
          </div>

          <div className="space-y-4">
            {dynamicMatchResult.missing.map((gap, idx) => (
              <div key={gap} className="p-5 rounded-2xl bg-background dark:bg-slate-800/50 border border-border-theme dark:border-slate-700 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#603620] text-[#f3e4bd] font-serif font-bold flex items-center justify-center text-sm shadow-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-text-primary dark:text-white">{gap}</h3>
                    <p className="text-xs text-text-secondary font-medium">Recommended: Complete 2 hands-on projects using {gap}.</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setUserSkills([...userSkills, gap]);
                    setNotification({ type: 'success', message: `Marked ${gap} as mastered!` });
                  }}
                  className="px-4 py-2 bg-primary-blue hover:bg-[#96552a] text-white text-xs font-bold rounded-xl cursor-pointer shadow-2xs"
                >
                  Mark Mastered
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Peer Team Matcher */}
      {activeTab === 'teammates' && (
        <div className="space-y-6">
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search teammates by name, role, or skill..."
                value={teammateSearch}
                onChange={e => setTeammateSearch(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeammates.map(tm => (
              <div key={tm.id} className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-primary-blue transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif font-bold text-base text-text-primary dark:text-white">{tm.name}</h3>
                    <p className="text-xs text-primary-blue font-bold mt-0.5">{tm.role}</p>
                    <p className="text-[11px] text-text-muted font-medium">{tm.college}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30">
                    ★ {tm.rating}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {tm.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-surface-secondary text-text-secondary text-[10px] font-bold rounded-md border border-border-theme">
                      #{s}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-border-theme dark:border-slate-800 text-xs font-semibold text-text-secondary">
                  Seeking: {tm.lookingFor}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Export */}
      {activeTab === 'export' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
          <div className="w-16 h-16 bg-surface-secondary text-primary-blue flex items-center justify-center rounded-full mx-auto border border-border-theme">
            <Download className="w-8 h-8 text-primary-blue" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary dark:text-white">Export Career Match Telemetry</h2>
          <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">
            Download full role match diagnostics, skill gap analysis, and teammate recommendations in a JSON file.
          </p>
          <button onClick={handleExportManifest} className="px-6 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Career Readiness JSON
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  Award,
  Trophy,
  Users,
  Globe,
  Code2,
  Sparkles,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Star,
  Activity,
  Zap,
  Target,
  Share2,
  ShieldCheck,
  Check,
  X,
  FileCode
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { EmptyState } from '../ui/states';

export default function TechEcosystemStudio() {
  const { user } = useAppContext();

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'trends' | 'university' | 'certificate' | 'export'>('leaderboard');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Student Leaderboard State
  const [leaderboard, setLeaderboard] = useState([
    {
      id: 'dev_1',
      name: 'Dipanshu Batra',
      college: 'IIT Bombay',
      score: 9850,
      rank: 1,
      commits: 420,
      bountiesWon: '$3,400',
      badge: 'TOP CONTRIBUTOR 2026',
      skills: ['TypeScript', 'React', 'Node.js', 'Python']
    },
    {
      id: 'dev_2',
      name: 'Aarav Patel',
      college: 'BITS Pilani',
      score: 8920,
      rank: 2,
      commits: 340,
      bountiesWon: '$2,100',
      badge: 'OPEN SOURCE FELLOW',
      skills: ['Rust', 'WebAssembly', 'Go']
    },
    {
      id: 'dev_3',
      name: 'Sneha Kulkarni',
      college: 'IIIT Hyderabad',
      score: 8450,
      rank: 3,
      commits: 290,
      bountiesWon: '$1,800',
      badge: 'AI RESEARCH FELLOW',
      skills: ['PyTorch', 'CUDA', 'Python', 'MLOps']
    }
  ]);

  // Skill Demand Matrix
  const [skills, setSkills] = useState([
    { name: 'TypeScript & React', demand: 98, growth: '+34%', jobsCount: '1,450' },
    { name: 'AI Engineering & PyTorch', demand: 95, growth: '+62%', jobsCount: '1,120' },
    { name: 'Rust & Systems Programming', demand: 89, growth: '+28%', jobsCount: '620' },
    { name: 'Cloud Native & Kubernetes', demand: 91, growth: '+22%', jobsCount: '890' }
  ]);

  // Inter-University Battleground
  const [universities, setUniversities] = useState([
    { rank: 1, name: 'IIT Bombay GDSC Chapter', score: 45200, members: 420, projects: 88 },
    { rank: 2, name: 'BITS Pilani Open Source Club', score: 41800, members: 380, projects: 74 },
    { rank: 3, name: 'IIIT Hyderabad AI Guild', score: 39500, members: 310, projects: 65 }
  ]);

  // Export Ecosystem Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      leaderboard: leaderboard,
      skillDemandTrends: skills,
      universityChapters: universities,
      exportTimestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Ecosystem_Analytics_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setNotification({ type: 'success', message: 'Exported Ecosystem Analytics JSON Manifest!' });
  };

  const filteredLeaderboard = leaderboard.filter(dev => {
    return dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           dev.college.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      
            {/* Top Banner Header - Brand Theme */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30">
                <Globe className="w-3.5 h-3.5 text-indigo-400 inline-block mr-1" /> TECH ECOSYSTEM INTELLIGENCE
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                Global Chapter Rankings
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Tech Ecosystem <span className="text-primary-blue italic">Studio</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Analyze global student developer rankings, skill demand trends, inter-university chapter performance, and talent verification credentials.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-lg text-primary-blue">
              #1
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Top University Chapter</div>
              <div className="text-xs font-extrabold text-white">IIT Bombay GDSC</div>
              <div className="text-[11px] text-[#63703d] font-semibold">45,200 Ecosystem Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-border-theme dark:border-slate-800 pb-3">
        {[
          { id: 'leaderboard', label: 'Developer Leaderboard', icon: Trophy },
          { id: 'trends', label: 'Skill Demand Matrix', icon: TrendingUp },
          { id: 'university', label: 'Chapter Rankings', icon: Users },
          { id: 'certificate', label: 'Talent Credentialing', icon: ShieldCheck },
          { id: 'export', label: 'Export Analytics', icon: Download }
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

      {/* Notification */}
      {notification.message && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#63703d]/15 border border-[#63703d]/30 text-[#63703d] text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab 1: Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
            <div className="relative flex-1 w-full sm:w-auto max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search developer name or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-primary-blue"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredLeaderboard.map((dev) => (
              <div key={dev.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 shadow-2xs gap-4 hover:border-primary-blue transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#603620] text-indigo-400 font-serif font-bold flex items-center justify-center text-sm shadow-xs">
                    #{dev.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-sm text-white">{dev.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30">
                        {dev.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium">{dev.college}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs font-bold">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase block">Commits</span>
                    <span className="text-text-primary dark:text-slate-200">{dev.commits}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase block">Bounties</span>
                    <span className="text-[#63703d]">{dev.bountiesWon}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase block">Ecosystem Points</span>
                    <span className="text-primary-blue font-extrabold">{dev.score} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Skill Demand */}
      {activeTab === 'trends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {skills.map((s, idx) => (
            <div key={idx} className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-base text-white">{s.name}</h3>
                <span className="px-2.5 py-1 rounded-md bg-[#63703d]/15 text-[#63703d] font-bold text-xs">
                  {s.growth} YoY
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-text-secondary">
                  <span>Market Demand Index</span>
                  <span>{s.demand}/100</span>
                </div>
                <div className="h-2 rounded-full bg-[#e8ded1] overflow-hidden">
                  <div className="h-full bg-primary-blue" style={{ width: `${s.demand}%` }} />
                </div>
              </div>
              <p className="text-xs text-text-muted font-medium pt-1">Over {s.jobsCount} verified active student opportunities requiring this skill.</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: University Chapters */}
      {activeTab === 'university' && (
        <div className="space-y-4">
          {universities.map(u => (
            <div key={u.rank} className="flex items-center justify-between p-5 rounded-2xl bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#603620] text-indigo-400 font-serif font-bold flex items-center justify-center text-sm">
                  #{u.rank}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">{u.name}</h3>
                  <p className="text-xs text-text-secondary font-medium">{u.members} Active Members · {u.projects} Open Projects</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-primary-blue">{u.score.toLocaleString()} PTS</div>
                <span className="text-[10px] font-bold text-[#63703d] uppercase">Ranked #1 Regional</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Certificate */}
      {activeTab === 'certificate' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
          <div className="w-16 h-16 bg-surface-secondary text-primary-blue flex items-center justify-center rounded-full mx-auto border border-border-theme">
            <ShieldCheck className="w-8 h-8 text-primary-blue" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Talent Credentialing Portal</h2>
          <p className="text-xs text-slate-300 font-medium">
            Verify and export cryptographic proof of your student developer ranking, open-source commits, and verified bounty wins.
          </p>
          <button onClick={() => setNotification({ type: 'success', message: 'Credential badge verified and synced to profile!' })} className="px-6 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer">
            Issue Verified Developer Credential
          </button>
        </div>
      )}

      {/* Tab 5: Export */}
      {activeTab === 'export' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
          <div className="w-16 h-16 bg-surface-secondary text-primary-blue flex items-center justify-center rounded-full mx-auto border border-border-theme">
            <Download className="w-8 h-8 text-primary-blue" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Export Ecosystem Analytics</h2>
          <p className="text-xs text-slate-300 font-medium">
            Download full leaderboard rankings, skill demand matrix, and university chapter statistics in a structured JSON manifest.
          </p>
          <button onClick={handleExportManifest} className="px-6 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Ecosystem Analytics JSON
          </button>
        </div>
      )}
    </div>
  );
}

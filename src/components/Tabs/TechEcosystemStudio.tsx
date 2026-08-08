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

/**
 * TechEcosystemStudio Component
 * 
 * Interactive Global Tech Ecosystem Analytics & Student Developer Leaderboard Studio for YuvaHub.
 * Features:
 * 1. Global Student Developer Rank & Contribution Leaderboard
 * 2. Tech Stack Market Demand & Skill Trend Matrix
 * 3. Inter-University Chapter Battleground Analytics
 * 4. Talent Certification & Verification Badge Generator
 * 5. Ecosystem Analytics JSON Manifest Exporter
 */
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
      score: 8410,
      rank: 3,
      commits: 290,
      bountiesWon: '$1,850',
      badge: 'AI RESEARCH CHAMP',
      skills: ['PyTorch', 'CUDA', 'LLMs']
    }
  ]);

  // Skill Market Trends State
  const [techTrends] = useState([
    { name: 'TypeScript / React 19', demandScore: 98, growth: '+34%', category: 'Frontend' },
    { name: 'PyTorch & LLM Fine-Tuning', demandScore: 95, growth: '+52%', category: 'AI/ML' },
    { name: 'Rust & Distributed Systems', demandScore: 91, growth: '+28%', category: 'Systems' },
    { name: 'Solidity & Zero-Knowledge Proofs', demandScore: 86, growth: '+19%', category: 'Web3' }
  ]);

  // University Rankings
  const [universities] = useState([
    { rank: 1, name: 'IIT Bombay', totalCommits: 14200, activeStudents: 420, score: 98.4 },
    { rank: 2, name: 'BITS Pilani', totalCommits: 11800, activeStudents: 310, score: 94.1 },
    { rank: 3, name: 'IIIT Hyderabad', totalCommits: 9950, activeStudents: 260, score: 91.8 }
  ]);

  // Certificate Verification Form State
  const [certificateData, setCertificateData] = useState({
    candidateName: user?.displayName || 'Dipanshu Batra',
    trackName: 'Full Stack & AI Systems Developer',
    issuedDate: new Date().toISOString().split('T')[0],
    verificationHash: '0x99A8F71B2C4E3D56'
  });

  // Export Ecosystem Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      platform: 'YuvaHub Global Ecosystem Analytics',
      user: user?.displayName || 'Student Developer',
      developerRank: 1,
      certificate: certificateData,
      leaderboardTop3: leaderboard,
      techTrendsSummary: techTrends,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Ecosystem_Analytics_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // Filtered Leaderboard
  const filteredLeaderboard = leaderboard.filter(dev =>
    dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dev.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                <Trophy size={13} /> Global Tech Ecosystem Analytics
              </span>
              <span className="px-3 py-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                50,000+ Student Commits
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Student Developer Leaderboard & Ecosystem Studio
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Track global student developer rankings, monitor tech stack demand metrics, and issue talent verification badges.
            </p>
          </div>

          {/* Global Contribution Score Meter */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-emerald-700/60 p-4 rounded-2xl w-full lg:w-auto shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-emerald-400 bg-slate-950 font-black text-xl text-emerald-400">
              #1
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Global Leaderboard Rank</div>
              <div className="text-xs font-extrabold text-cyan-400">9,850 Contribution Points</div>
              <div className="text-[11px] text-slate-400">Top 1% Worldwide</div>
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
              {notification.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: '', message: '' })} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
        {[
          { id: 'leaderboard', label: `Global Leaderboard (${leaderboard.length})`, icon: Trophy },
          { id: 'trends', label: 'Tech Skill Demand Trends', icon: TrendingUp },
          { id: 'university', label: 'University Rankings', icon: Users },
          { id: 'certificate', label: 'Talent Verification Badge', icon: Award },
          { id: 'export', label: 'Analytics Manifest JSON', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Global Student Developer Rankings</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ranked by verified GitHub commits, hackathons won, and bounties claimed.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search developer or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {filteredLeaderboard.length === 0 ? (
            <EmptyState
              title="No developers found"
              description="No contributors match your current search. Try a different filter."
              icon={<Users className="h-6 w-6" aria-hidden="true" />}
            />
          ) : (
            <div className="space-y-3">
              {filteredLeaderboard.map((dev) => (
              <div key={dev.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center">
                    #{dev.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{dev.name}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">
                        {dev.badge}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{dev.college} • {dev.commits} Commits • {dev.bountiesWon} Earned</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="font-black text-emerald-600 dark:text-emerald-400 text-base">{dev.score} pts</div>
                    <div className="text-[10px] text-gray-400">Contribution Index</div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TECH TRENDS */}
      {activeTab === 'trends' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Tech Stack Demand & Growth Index</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Real-time market demand metrics across engineering disciplines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {techTrends.map((t) => (
              <div key={t.name} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-md">
                    {t.growth} YoY
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Category: {t.category}</span>
                  <span className="font-bold text-emerald-600">Demand Score: {t.demandScore}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: UNIVERSITY RANKINGS */}
      {activeTab === 'university' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Inter-University Battleground Rankings</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Aggregated open-source contribution output by institution.</p>
          </div>

          <div className="space-y-3 text-xs">
            {universities.map((u) => (
              <div key={u.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="font-black text-emerald-600 text-sm">#{u.rank}</span>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{u.name}</div>
                    <div className="text-gray-500 text-[11px]">{u.activeStudents} Active Student Contributors</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white">{u.totalCommits.toLocaleString()} Commits</div>
                  <div className="text-emerald-600 font-bold text-[11px]">{u.score} Rating</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CERTIFICATE */}
      {activeTab === 'certificate' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Talent Verification Badge & Certificate</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Generate a verified digital badge for LinkedIn and GitHub profiles.</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 rounded-2xl border border-emerald-800 text-white space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">VERIFIED DEVELOPER BADGE</span>
              <Award className="text-emerald-400" size={24} />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">Certified Candidate:</div>
              <h2 className="text-xl font-black text-white">{certificateData.candidateName}</h2>
              <p className="text-xs text-emerald-300 font-bold">{certificateData.trackName}</p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-emerald-900/60 font-mono">
              <span>Issue Date: {certificateData.issuedDate}</span>
              <span>Hash: {certificateData.verificationHash}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXPORT */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Ecosystem Analytics Manifest JSON</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete summary of global developer rankings and university battleground scores.</p>
            </div>

            <button
              onClick={handleExportManifest}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Download size={14} /> Download Manifest JSON
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto">
            <pre>{JSON.stringify({
              platform: 'YuvaHub Global Ecosystem Analytics',
              user: user?.displayName || 'Student Developer',
              developerRank: 1,
              certificate: certificateData,
              leaderboardTop3: leaderboard,
              techTrendsSummary: techTrends,
              timestamp: new Date().toISOString()
            }, null, 2)}</pre>
          </div>
        </div>
      )}

    </div>
  );
}

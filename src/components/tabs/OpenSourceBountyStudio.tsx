import React, { useState, useMemo, useEffect } from 'react';
import {
  Code,
  GitPullRequest,
  DollarSign,
  Award,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  Github,
  Star,
  Clock,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Check,
  X,
  FileCode,
  TrendingUp,
  UserCheck,
  Trophy
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { EmptyState } from '../ui/states';

export default function OpenSourceBountyStudio() {
  const { user, profile, karmaBalance } = useAppContext();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'bounties' | 'pr_claim' | 'leaderboard' | 'export'>('bounties');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');

  // Bounties Data State
  const [bounties, setBounties] = useState([
    {
      id: 'bnty_1',
      title: 'Optimize Vector Index Search Latency in Node.js',
      repo: 'yuvahub/yuva-vector-engine',
      reward: '$1,200 USD',
      rewardAmount: 1200,
      difficulty: 'INTERMEDIATE',
      language: 'TypeScript',
      issueUrl: 'https://github.com/Chirag1724/YuvaHub/issues/104',
      claimedBy: null,
      claimed: false,
      tags: ['TypeScript', 'Vector DB', 'Performance']
    },
    {
      id: 'bnty_2',
      title: 'Implement WebAuthn FIDO2 Passkey Support',
      repo: 'yuvahub/yuva-auth-core',
      reward: '$1,500 USD',
      rewardAmount: 1500,
      difficulty: 'HARD',
      language: 'TypeScript',
      issueUrl: 'https://github.com/Chirag1724/YuvaHub/issues/88',
      claimedBy: 'Aarav Patel',
      claimed: true,
      tags: ['Passkeys', 'Security', 'WebAuthn']
    },
    {
      id: 'bnty_3',
      title: 'Fix Memory Leak in PyTorch Distributed Worker Loop',
      repo: 'yuvahub/yuva-ml-pipeline',
      reward: '$800 USD',
      rewardAmount: 800,
      difficulty: 'EASY',
      language: 'Python',
      issueUrl: 'https://github.com/Chirag1724/YuvaHub/issues/62',
      claimedBy: null,
      claimed: false,
      tags: ['Python', 'PyTorch', 'Memory']
    }
  ]);

  // PR Submission State
  const [prUrl, setPrUrl] = useState('');
  const [claimedBountyId, setClaimedBountyId] = useState(bounties[0]?.id || '');
  const [prDesc, setPrDesc] = useState('');

  // Contributors State (Dynamically calculated and sorted)
  const [rawContributors, setRawContributors] = useState([
    { id: 'c_1', name: 'Aarav Patel', github: '@aaravdev', bountiesSolved: 14, earnedNum: 8400, badge: 'LEGENDARY CONTRIBUTOR' },
    { id: 'c_2', name: 'Sneha Kulkarni', github: '@sneha-ai', bountiesSolved: 11, earnedNum: 6200, badge: 'OPEN SOURCE FELLOW' },
    { id: 'c_3', name: profile?.name || 'Chirag Dwivedi', github: `@${(user?.email?.split('@')[0]) || 'Chirag1724'}`, bountiesSolved: 9, earnedNum: 5100, badge: 'CORE MAINTAINER' }
  ]);

  // Fetch Live Leaderboard on Mount
  useEffect(() => {
    fetch('/api/v1/leaderboard')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.items && Array.isArray(data.items) && data.items.length > 0) {
          const mapped = data.items.map((item: any, idx: number) => ({
            id: item.userId || `c_api_${idx}`,
            name: item.name || 'Student Contributor',
            github: `@${item.name.toLowerCase().replace(/\s+/g, '')}`,
            bountiesSolved: item.bountiesResolved || Math.floor((item.reputation || 500) / 100),
            earnedNum: (item.bountiesResolved || 5) * 500 + (item.reputation || 0) * 10,
            badge: idx === 0 ? 'TOP CONTRIBUTOR' : (idx === 1 ? 'OPEN SOURCE FELLOW' : 'ACTIVE CONTRIBUTOR')
          }));
          setRawContributors(mapped);
        }
      })
      .catch(() => {
        // Fallback gracefully to dynamic state
      });
  }, []);

  // Synchronize current user's profile into contributor list
  useEffect(() => {
    if (user && profile?.name) {
      setRawContributors(prev => {
        const exists = prev.some(c => c.name.toLowerCase() === profile.name.toLowerCase());
        if (!exists) {
          return [
            ...prev,
            {
              id: user.uid,
              name: profile.name,
              github: `@${user.email?.split('@')[0] || 'user'}`,
              bountiesSolved: 1,
              earnedNum: (karmaBalance || 10) * 100,
              badge: 'COMMUNITY MEMBER'
            }
          ];
        }
        return prev;
      });
    }
  }, [user, profile, karmaBalance]);

  // DYNAMIC RANK CALCULATOR (Re-sorts entries in real-time by earnings and assigns dynamic #1, #2, #3 ranks)
  const dynamicRankedContributors = useMemo(() => {
    return [...rawContributors]
      .sort((a, b) => b.earnedNum - a.earnedNum || b.bountiesSolved - a.bountiesSolved)
      .map((contributor, index) => ({
        ...contributor,
        rank: index + 1,
        earnedFormatted: `$${contributor.earnedNum.toLocaleString()} Earned`
      }));
  }, [rawContributors]);

  // Submit PR Claim (Dynamically updates current user's solved bounties and re-calculates ranks!)
  const handleSubmitPr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prUrl.trim() || !prUrl.includes('github.com')) {
      setNotification({ type: 'error', message: 'Please enter a valid GitHub Pull Request URL.' });
      return;
    }

    const targetBounty = bounties.find(b => b.id === claimedBountyId);
    const rewardAmount = targetBounty?.rewardAmount || 1000;

    // 1. Update Bounty Claim Status
    setBounties(bounties.map(b => b.id === claimedBountyId ? { ...b, claimed: true, claimedBy: profile?.name || user?.displayName || 'Student Contributor' } : b));

    // 2. DYNAMIC RANK UPDATE: Increment earnings and solved count for current user
    const currentUserName = profile?.name || user?.displayName || 'Chirag Dwivedi';
    setRawContributors(prev => {
      const userExists = prev.some(c => c.name.toLowerCase() === currentUserName.toLowerCase());
      if (userExists) {
        return prev.map(c => {
          if (c.name.toLowerCase() === currentUserName.toLowerCase()) {
            return {
              ...c,
              bountiesSolved: c.bountiesSolved + 1,
              earnedNum: c.earnedNum + rewardAmount
            };
          }
          return c;
        });
      } else {
        return [
          ...prev,
          {
            id: user?.uid || `user_${Date.now()}`,
            name: currentUserName,
            github: `@${user?.email?.split('@')[0] || 'contributor'}`,
            bountiesSolved: 1,
            earnedNum: rewardAmount,
            badge: 'ACTIVE CONTRIBUTOR'
          }
        ];
      }
    });

    setPrUrl('');
    setPrDesc('');
    setNotification({ type: 'success', message: 'Pull Request submitted! Ranks dynamically updated on the leaderboard.' });
  };

  // Export Claims Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      openSourceBounties: bounties,
      topContributors: dynamicRankedContributors,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_OS_Bounties_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setNotification({ type: 'success', message: 'Exported Open Source Bounty Claims Manifest!' });
  };

  const filteredBounties = bounties.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.repo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = selectedLanguage === 'all' || b.language === selectedLanguage;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      
      {/* Top Banner Header - Brand Theme */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <Code className="w-3.5 h-3.5 text-indigo-400" /> Open Source Bounty Vault
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                Live Dynamic Rankings
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Open Source Bounties <span className="text-primary-blue italic">Studio</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Solve verified open source GitHub issues, submit Pull Request links for test suite verification, and earn financial grants with real-time rank updates.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-base text-primary-blue">
              $3.5K
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Bounty Pool</div>
              <div className="text-xs font-extrabold text-white">3 Active Open Bounties</div>
              <div className="text-[11px] text-emerald-400 font-semibold">Instant Maintainer Review</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-border-theme dark:border-slate-800 pb-3">
        {[
          { id: 'bounties', label: 'Bounty Directory', icon: Code },
          { id: 'pr_claim', label: 'Submit PR Claim', icon: GitPullRequest },
          { id: 'leaderboard', label: 'Contributor Ranks', icon: Trophy },
          { id: 'export', label: 'Export Manifest', icon: Download }
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

      {/* Tab 1: Bounties Directory */}
      {activeTab === 'bounties' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
            <div className="relative flex-1 w-full sm:w-auto max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by issue title or repository..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue"
              />
            </div>

            <div className="flex items-center gap-2">
              {['all', 'TypeScript', 'Python'].map(lang => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                    selectedLanguage === lang
                      ? 'bg-[#231f20] text-white border-[#231f20]'
                      : 'bg-surface border-border-theme text-text-secondary hover:bg-surface-secondary'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBounties.map(bounty => (
              <div key={bounty.id} className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-primary-blue transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{bounty.repo}</span>
                    <h3 className="font-serif font-bold text-base text-text-primary dark:text-white mt-1 leading-snug">{bounty.title}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${
                    bounty.claimed ? 'bg-[#f3e4bd] text-text-secondary border-border-theme' : 'bg-[#63703d]/15 text-[#63703d] border-[#63703d]/30'
                  }`}>
                    {bounty.claimed ? 'CLAIMED' : 'OPEN'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {bounty.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-surface-secondary text-text-secondary text-[10px] font-bold rounded-md border border-border-theme">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-border-theme dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <div className="text-primary-blue">{bounty.reward}</div>
                  <a
                    href={bounty.issueUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary-blue hover:underline"
                  >
                    <span>View GitHub Issue</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Submit PR Claim */}
      {activeTab === 'pr_claim' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs max-w-2xl mx-auto">
          <div className="border-b border-border-theme dark:border-slate-800 pb-4">
            <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">Submit Pull Request Link</h2>
            <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">Link your merged or active Pull Request to claim the bounty grant and boost your dynamic rank.</p>
          </div>

          <form onSubmit={handleSubmitPr} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase">Select Target Bounty</label>
              <select
                value={claimedBountyId}
                onChange={e => setClaimedBountyId(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              >
                {bounties.map(b => (
                  <option key={b.id} value={b.id}>{b.title} ({b.reward})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase">GitHub Pull Request URL</label>
              <input
                type="url"
                required
                placeholder="https://github.com/org/repo/pull/123"
                value={prUrl}
                onChange={e => setPrUrl(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase">PR Summary & Test Suite Results</label>
              <textarea
                rows={3}
                placeholder="Explain what changes were made and link passed CI build tests..."
                value={prDesc}
                onChange={e => setPrDesc(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none resize-none"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2">
              <GitPullRequest className="w-4 h-4" /> Submit Pull Request for Verification
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: DYNAMIC Contributor Ranks */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          {dynamicRankedContributors.map(c => (
            <div key={c.id} className="flex items-center justify-between p-5 rounded-2xl bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 shadow-2xs hover:border-primary-blue transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full font-serif font-bold flex items-center justify-center text-sm shadow-xs ${
                  c.rank === 1 ? 'bg-[#603620] text-[#f3e4bd]' : (c.rank === 2 ? 'bg-primary-blue text-white' : 'bg-surface-secondary text-text-secondary border border-border-theme')
                }`}>
                  #{c.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-sm text-text-primary dark:text-white">{c.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30">
                      {c.badge}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary font-semibold">{c.github}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-primary-blue">{c.earnedFormatted}</div>
                <span className="text-[10px] font-bold text-text-muted">{c.bountiesSolved} Bounties Merged</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Export */}
      {activeTab === 'export' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
          <div className="w-16 h-16 bg-surface-secondary text-primary-blue flex items-center justify-center rounded-full mx-auto border border-border-theme">
            <Download className="w-8 h-8 text-primary-blue" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary dark:text-white">Export Bounty Manifest</h2>
          <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">
            Download all active bounty listings and verified contributor claims as a JSON file.
          </p>
          <button onClick={handleExportManifest} className="px-6 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Open Source Bounties JSON
          </button>
        </div>
      )}
    </div>
  );
}

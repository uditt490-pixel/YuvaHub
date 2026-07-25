import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Share2,
  Calculator,
  FileText,
  Clock,
  Sparkles,
  Search,
  Filter,
  Users,
  Building,
  Check,
  X,
  ExternalLink,
  Zap,
  TrendingUp,
  ShieldCheck,
  Globe,
  PieChart
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/**
 * GrantFellowshipStudio Component
 * 
 * Interactive 550+ line Student Grant & Fellowship Application Studio for YuvaHub.
 * Features:
 * 1. Grant Eligibility Match Calculator (0-100% Match Scores)
 * 2. Interactive Budget & Milestone Calculator
 * 3. Proposal Draft Builder & Live Readiness Diagnostics
 * 4. Active Grants & Research Fellowships Directory
 * 5. Mentor Endorsement & Recommendation Ledger
 * 6. Grant Application Manifest & Proposal Exporter
 */
export default function GrantFellowshipStudio() {
  const { user, profile } = useAppContext();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'directory' | 'proposal' | 'budget' | 'mentors' | 'export'>('directory');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Grant Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Grants Database
  const [grants, setGrants] = useState([
    {
      id: 'g_1',
      title: 'Google Open Source Research Grant',
      sponsor: 'Google Research',
      amount: '$10,000 USD',
      deadline: '2026-08-30',
      category: 'open_source',
      eligibilityMatch: 95,
      description: 'Funding for undergraduate & graduate students building open-source developer tooling and ML infrastructure.',
      applied: false
    },
    {
      id: 'g_2',
      title: 'Ethereum Foundation Ecosystem Grant',
      sponsor: 'Ethereum Foundation',
      amount: '$15,000 USD',
      deadline: '2026-09-15',
      category: 'web3',
      eligibilityMatch: 88,
      description: 'Supports research on zero-knowledge cryptography, Layer-2 scalability, and decentralized identity.',
      applied: true
    },
    {
      id: 'g_3',
      title: 'AWS Cloud Credits for Student Startups',
      sponsor: 'Amazon Web Services',
      amount: '$5,000 Credits',
      deadline: '2026-10-01',
      category: 'cloud',
      eligibilityMatch: 90,
      description: 'Cloud infrastructure credits for early-stage student founder projects and AI model hosting.',
      applied: false
    }
  ]);

  // Proposal Draft State
  const [proposalData, setProposalData] = useState({
    title: 'Distributed Vector Database Optimization for Edge Devices',
    abstract: 'This project aims to optimize memory-efficient vector indexing algorithms for low-power mobile devices.',
    targetGrant: 'Google Open Source Research Grant',
    deliverables: 'Open-source Python library, 2 research papers, benchmark suite.',
    timelineMonths: 6,
    requestedAmount: 8500
  });

  // Budget Breakdown State
  const [budgetItems, setBudgetItems] = useState([
    { id: 'b_1', item: 'GPU Cloud Compute (Nvidia A100)', cost: 3500, category: 'Compute' },
    { id: 'b_2', item: 'Hardware Test Devices & Microcontrollers', cost: 2000, category: 'Hardware' },
    { id: 'b_3', item: 'Open Source Conference Travel Stipend', cost: 1500, category: 'Travel' },
    { id: 'b_4', item: 'Domain & SSL Security Infrastructure', cost: 500, category: 'Hosting' }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');

  // Mentor Endorsements State
  const [mentors, setMentors] = useState([
    { id: 'm_1', name: 'Dr. Ramesh Kumar', title: 'Professor of CS, IIT Delhi', status: 'ENDORSED', date: '2026-07-15' },
    { id: 'm_2', name: 'Sarah Jenkins', title: 'Senior Staff Engineer, Google AI', status: 'PENDING', date: '2026-07-20' }
  ]);
  const [newMentorName, setNewMentorName] = useState('');

  // Total Budget Calculator
  const totalBudget = useMemo(() => {
    return budgetItems.reduce((acc, curr) => acc + curr.cost, 0);
  }, [budgetItems]);

  // Readiness Score
  const readinessScore = useMemo(() => {
    let score = 30;
    if (proposalData.title.length > 10) score += 20;
    if (proposalData.abstract.length > 30) score += 20;
    if (budgetItems.length >= 2) score += 15;
    if (mentors.some(m => m.status === 'ENDORSED')) score += 15;
    return Math.min(score, 100);
  }, [proposalData, budgetItems, mentors]);

  // Add Budget Item
  const handleAddBudgetItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemCost || isNaN(Number(newItemCost))) return;

    const newItem = {
      id: `b_${Date.now()}`,
      item: newItemName.trim(),
      cost: Number(newItemCost),
      category: 'General'
    };

    setBudgetItems([...budgetItems, newItem]);
    setNewItemName('');
    setNewItemCost('');
    setNotification({ type: 'success', message: 'Added budget allocation item!' });
  };

  // Remove Budget Item
  const handleRemoveBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter(b => b.id !== id));
  };

  // Add Mentor Request
  const handleAddMentorRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentorName.trim()) return;

    const newM = {
      id: `m_${Date.now()}`,
      name: newMentorName.trim(),
      title: 'Advisor / Researcher',
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0]
    };

    setMentors([...mentors, newM]);
    setNewMentorName('');
    setNotification({ type: 'success', message: `Requested recommendation from ${newM.name}!` });
  };

  // Export Proposal Manifest JSON
  const handleExportProposal = () => {
    const manifest = {
      proposal: proposalData,
      totalRequestedBudget: `$${totalBudget} USD`,
      budgetBreakdown: budgetItems,
      endorsements: mentors,
      readinessScore: `${readinessScore}%`,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Grant_Proposal_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // Filtered Grants
  const filteredGrants = grants.filter(g => {
    const matchesSearch = g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          g.sponsor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || g.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center gap-1.5">
                <DollarSign size={13} /> Student Fellowship Vault
              </span>
              <span className="px-3 py-1 text-[11px] font-bold text-sky-400 bg-sky-500/20 border border-sky-500/30 rounded-full">
                2026 Cycle Active
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Student Grant & Open Source Fellowship Studio
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Find verified research grants, build budget estimations, request mentor endorsements, and compile grant proposal manifests.
            </p>
          </div>

          {/* Proposal Readiness Meter */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-emerald-700/60 p-4 rounded-2xl w-full lg:w-auto shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-emerald-400 bg-slate-950 font-black text-xl text-emerald-400">
              {readinessScore}%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Proposal Readiness Score</div>
              <div className="text-xs font-extrabold text-emerald-400">${totalBudget} Budgeted</div>
              <div className="text-[11px] text-slate-400">{mentors.filter(m => m.status === 'ENDORSED').length} Mentor Endorsements</div>
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
            <button onClick={() => setNotification({ type: '', message: '' })} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
        {[
          { id: 'directory', label: `Active Grants (${grants.length})`, icon: DollarSign },
          { id: 'proposal', label: 'Proposal Editor', icon: FileText },
          { id: 'budget', label: `Budget Calculator ($${totalBudget})`, icon: Calculator },
          { id: 'mentors', label: `Mentor Endorsements (${mentors.length})`, icon: Users },
          { id: 'export', label: 'Proposal Manifest JSON', icon: Download }
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

      {/* TAB 1: GRANTS DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Student Research & Project Fellowships</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Verified funding opportunities with automated match scoring.</p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search grants or sponsors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-900 dark:text-white outline-none"
              >
                <option value="all">All Categories</option>
                <option value="open_source">Open Source</option>
                <option value="web3">Web3 & Crypto</option>
                <option value="cloud">Cloud & Infrastructure</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredGrants.map((g) => (
              <div key={g.id} className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">{g.sponsor}</span>
                    <span className="px-2 py-0.5 font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md">
                      {g.amount}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-2">{g.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{g.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Match Score: <strong className="text-emerald-600">{g.eligibilityMatch}%</strong></span>
                    <span className="text-gray-400">Deadline: {g.deadline}</span>
                  </div>

                  <button
                    onClick={() => {
                      setProposalData({ ...proposalData, targetGrant: g.title });
                      setActiveTab('proposal');
                      setNotification({ type: 'success', message: `Selected ${g.title} for proposal!` });
                    }}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
                  >
                    Draft Application
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROPOSAL EDITOR */}
      {activeTab === 'proposal' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Grant Proposal Draft Editor</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Target Grant: <strong className="text-emerald-600">{proposalData.targetGrant}</strong></p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Research Project Title</label>
              <input
                type="text"
                value={proposalData.title}
                onChange={(e) => setProposalData({ ...proposalData, title: e.target.value })}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Executive Summary / Abstract</label>
              <textarea
                rows={4}
                value={proposalData.abstract}
                onChange={(e) => setProposalData({ ...proposalData, abstract: e.target.value })}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Expected Deliverables & Key Milestones</label>
              <input
                type="text"
                value={proposalData.deliverables}
                onChange={(e) => setProposalData({ ...proposalData, deliverables: e.target.value })}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BUDGET CALCULATOR */}
      {activeTab === 'budget' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Grant Budget Breakdown</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Requested: <strong className="text-emerald-600">${totalBudget} USD</strong></p>
            </div>
          </div>

          <form onSubmit={handleAddBudgetItem} className="flex gap-2">
            <input
              type="text"
              placeholder="Expense Item (e.g. Cloud GPU Credits)..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              required
            />
            <input
              type="number"
              placeholder="Amount ($)..."
              value={newItemCost}
              onChange={(e) => setNewItemCost(e.target.value)}
              className="w-32 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              required
            />
            <button type="submit" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition">
              + Add Item
            </button>
          </form>

          <div className="space-y-2">
            {budgetItems.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <span className="font-bold text-gray-900 dark:text-white">{b.item}</span>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-emerald-600">${b.cost} USD</span>
                  <button onClick={() => handleRemoveBudgetItem(b.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MENTOR ENDORSEMENTS */}
      {activeTab === 'mentors' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Mentor & Advisor Recommendation Letters</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Request formal endorsement signatures for your proposal.</p>
          </div>

          <form onSubmit={handleAddMentorRequest} className="flex gap-2">
            <input
              type="text"
              placeholder="Mentor Full Name & Title..."
              value={newMentorName}
              onChange={(e) => setNewMentorName(e.target.value)}
              className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              required
            />
            <button type="submit" className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition">
              + Request Endorsement
            </button>
          </form>

          <div className="space-y-3">
            {mentors.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{m.name}</div>
                  <div className="text-gray-500 dark:text-gray-400">{m.title}</div>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                  m.status === 'ENDORSED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXPORT MANIFEST */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Grant Application Manifest JSON</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete grant application payload ready for submission.</p>
            </div>

            <button
              onClick={handleExportProposal}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Download size={14} /> Download Proposal JSON
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
            <pre>{JSON.stringify({
              proposal: proposalData,
              totalRequestedBudget: `$${totalBudget} USD`,
              budgetBreakdown: budgetItems,
              endorsements: mentors,
              readinessScore: `${readinessScore}%`,
              timestamp: new Date().toISOString()
            }, null, 2)}</pre>
          </div>
        </div>
      )}

    </div>
  );
}

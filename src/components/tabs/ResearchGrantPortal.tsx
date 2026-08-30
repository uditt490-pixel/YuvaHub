import React, { useState, useMemo } from 'react';
import {
  Award,
  Globe,
  DollarSign,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  BookOpen,
  Send,
  Layers,
  BarChart3,
  Check,
  X,
  FileCode,
  ShieldCheck,
  Building2,
  Flame
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { EmptyState } from '../ui/states';

/**
 * ResearchGrantPortal Component
 * 
 * Interactive Research Grant & Innovation Fellowship Portal for YuvaHub.
 * Features:
 * 1. Global Innovation Grant & Fellowship Directory ($5k - $100k)
 * 2. Proposal Builder & Peer Pre-Review Engine
 * 3. Grant Milestone Disbursement Tracker
 * 4. Scientific Advisory Board Evaluation Scorecard
 * 5. Grant Application JSON Manifest Exporter
 */
export default function ResearchGrantPortal() {
  const { user } = useAppContext();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'grants' | 'proposal' | 'milestones' | 'export'>('grants');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');

  // Available Grants State
  const [grants, setGrants] = useState([
    {
      id: 'grant_1',
      title: 'Global AI Safety Research Fellowship 2026',
      sponsor: 'Open Research Institute',
      amount: '$50,000 USD',
      deadline: '2026-09-15',
      category: 'Artificial Intelligence',
      applied: true,
      description: 'Funding novel research in mechanistic interpretability and automated LLM red-teaming.'
    },
    {
      id: 'grant_2',
      title: 'Decentralized Web Infrastructure Grant',
      sponsor: 'Protocol Labs & IPFS Foundation',
      amount: '$25,000 USD',
      deadline: '2026-10-01',
      category: 'Web3 & Distributed Systems',
      applied: false,
      description: 'Supporting high-throughput content-addressed storage nodes and P2P networking.'
    },
    {
      id: 'grant_3',
      title: 'Climate Tech & Renewable Energy Hardware Innovation',
      sponsor: 'CleanTech Venture Alliance',
      amount: '$75,000 USD',
      deadline: '2026-11-20',
      category: 'Clean Energy Hardware',
      applied: false,
      description: 'Micro-grants for prototyping low-cost smart grid telemetry sensors.'
    }
  ]);

  // Proposal Draft State
  const [proposal, setProposal] = useState({
    title: 'Automated Mechanistic Interpretability for Agentic Workflows',
    sponsor: 'Open Research Institute',
    abstract: 'This research proposes a zero-shot activation patching framework to detect hallucination paths in multi-agent networks.',
    budget: '50000',
    durationMonths: '6',
    milestonesCount: '3'
  });

  // Tracked Grant Milestones
  const [milestones, setMilestones] = useState([
    { id: 'm_1', title: 'Phase 1: Dataset Curation & Model Instrumentation', payout: '$15,000', status: 'COMPLETED', date: '2026-06-30' },
    { id: 'm_2', title: 'Phase 2: Activation Patching Algorithm & Benchmark', payout: '$20,000', status: 'IN_PROGRESS', date: '2026-08-31' },
    { id: 'm_3', title: 'Phase 3: Peer-Reviewed Paper Submission & Open Code', payout: '$15,000', status: 'PENDING', date: '2026-10-31' }
  ]);

  // Save Proposal
  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification({ type: 'success', message: 'Saved research fellowship proposal draft!' });
  };

  // Export Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      applicant: user?.displayName || 'Research Fellow',
      proposalDraft: proposal,
      grantMilestones: milestones,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Research_Grant_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const filteredGrants = grants.filter(g =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.sponsor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center gap-1.5">
                <Award size={13} /> Research Grant & Innovation Portal
              </span>
              <span className="px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                $150,000+ Non-Dilutive Funding
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Global Innovation Fellowship & Grant Portal
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Apply for non-dilutive research grants, submit peer-reviewed proposals, and track milestone disbursements.
            </p>
          </div>

          {/* Funding Counter Meter */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-cyan-700/60 p-4 rounded-2xl w-full lg:w-auto shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-cyan-400 bg-slate-950 font-black text-xl text-cyan-400">
              $50K
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Active Research Grant</div>
              <div className="text-xs font-extrabold text-emerald-400">Milestone 1 Disbursed</div>
              <div className="text-[11px] text-slate-400">Phase 2 In Progress</div>
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
          { id: 'grants', label: `Open Grants (${grants.length})`, icon: Globe },
          { id: 'proposal', label: 'Proposal Builder', icon: FileText },
          { id: 'milestones', label: `Milestones (${milestones.length})`, icon: Layers },
          { id: 'export', label: 'Grant Proposal JSON', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
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

      {/* TAB 1: GRANTS */}
      {activeTab === 'grants' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Available Innovation Grants</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Non-dilutive funding for open research and open-source infrastructure.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search grant or sponsor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {filteredGrants.length === 0 ? (
            <EmptyState
              title="No grants found"
              description="No grants match your current search. Try a different keyword or category."
              icon={<BookOpen className="h-6 w-6" aria-hidden="true" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredGrants.map((g) => (
              <div key={g.id} className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">{g.sponsor}</span>
                    <span className="px-2 py-0.5 font-black bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded-md">
                      {g.amount}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-2">{g.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{g.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="text-gray-400 text-[11px]">Deadline: {g.deadline}</div>
                  <button
                    onClick={() => {
                      setProposal({ ...proposal, title: g.title, sponsor: g.sponsor });
                      setActiveTab('proposal');
                    }}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition"
                  >
                    Draft Proposal Application
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROPOSAL */}
      {activeTab === 'proposal' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Research Proposal Builder</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Formulate research objectives and budget allocation.</p>
          </div>

          <form onSubmit={handleSaveProposal} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Proposal Title</label>
              <input
                type="text"
                value={proposal.title}
                onChange={(e) => setProposal({ ...proposal, title: e.target.value })}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Abstract & Methodology Summary</label>
              <textarea
                rows={4}
                value={proposal.abstract}
                onChange={(e) => setProposal({ ...proposal, abstract: e.target.value })}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Requested Funding ($ USD)</label>
                <input
                  type="number"
                  value={proposal.budget}
                  onChange={(e) => setProposal({ ...proposal, budget: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Duration (Months)</label>
                <input
                  type="number"
                  value={proposal.durationMonths}
                  onChange={(e) => setProposal({ ...proposal, durationMonths: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl transition">
              Save Proposal Application
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: MILESTONES */}
      {activeTab === 'milestones' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Milestone Disbursement Ledger</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track grant payouts based on verified research deliverables.</p>
          </div>

          <div className="space-y-3 text-xs">
            {milestones.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{m.title}</div>
                  <div className="text-gray-500 text-[11px]">Target Date: {m.date} • Payout: {m.payout}</div>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                  m.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  m.status === 'IN_PROGRESS' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-200 text-gray-700'
                }`}>
                  {m.status}
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
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Grant Proposal Manifest JSON</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete application proposal data and milestone schedule.</p>
            </div>

            <button
              onClick={handleExportManifest}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Download size={14} /> Download Manifest JSON
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
            <pre>{JSON.stringify({
              applicant: user?.displayName || 'Research Fellow',
              proposalDraft: proposal,
              grantMilestones: milestones,
              timestamp: new Date().toISOString()
            }, null, 2)}</pre>
          </div>
        </div>
      )}

    </div>
  );
}

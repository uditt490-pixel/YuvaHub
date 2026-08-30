import React, { useState, useEffect } from 'react';
import {
  ResearchProposal,
  GrantAnalytics,
  ResearchGrantFilterOptions,
  PeerReviewScorecard,
  MilestoneItem,
  GrantDisbursementPayload
} from '../../types/researchGrant';
import { ResearchGrantService } from '../../services/ResearchGrantService';
import { ResearchGrantMetricsCard } from '../../components/Enterprise/ResearchGrantMetricsCard';
import { ResearchGrantFilterToolbar } from '../../components/Enterprise/ResearchGrantFilterToolbar';
import { ProposalDetailModal } from '../../components/Enterprise/ProposalDetailModal';
import { GrantDisbursementModal } from '../../components/Enterprise/GrantDisbursementModal';
import {
  BookOpen,
  LayoutGrid,
  List,
  Award,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  Zap
} from 'lucide-react';

export const ResearchGrantTelemetryLab: React.FC = () => {
  const [proposals, setProposals] = useState<ResearchProposal[]>([]);
  const [analytics, setAnalytics] = useState<GrantAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'grid' | 'ledger' | 'peer_review'>('grid');

  // Filters
  const [filters, setFilters] = useState<ResearchGrantFilterOptions>({
    searchQuery: '',
    category: 'ALL',
    status: 'ALL',
    college: '',
    minScore: 0,
    sortBy: 'score',
    sortOrder: 'desc'
  });

  // Modals & Selection
  const [selectedProposal, setSelectedProposal] = useState<ResearchProposal | null>(null);
  const [disbursementTarget, setDisbursementTarget] = useState<{ proposal: ResearchProposal; milestone: MilestoneItem } | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warn' } | null>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, stats] = await Promise.all([
        ResearchGrantService.getProposals(filters),
        ResearchGrantService.getAnalytics()
      ]);
      setProposals(list);
      setAnalytics(stats);
    } catch (err) {
      showToast('Failed to load research grant telemetry', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmitPeerReview = async (proposalId: string, review: Omit<PeerReviewScorecard, 'id' | 'reviewedAt'>) => {
    try {
      const updated = await ResearchGrantService.submitPeerReview(proposalId, review);
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProposal && selectedProposal.id === updated.id) {
        setSelectedProposal(updated);
      }
      showToast(`Peer evaluation recorded. Composite score: ${updated.compositeReviewScore}%`);
      const stats = await ResearchGrantService.getAnalytics();
      setAnalytics(stats);
    } catch (err: any) {
      showToast(err.message || 'Review failed', 'warn');
    }
  };

  const handleDisbursementConfirm = async (payload: GrantDisbursementPayload) => {
    try {
      const updated = await ResearchGrantService.executeMilestoneDisbursement(payload);
      setProposals((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProposal && selectedProposal.id === updated.id) {
        setSelectedProposal(updated);
      }
      setDisbursementTarget(null);
      showToast(`💰 Capital tranche of ₹${payload.disbursementAmountLakhs} Lakhs successfully released!`, 'success');
      const stats = await ResearchGrantService.getAnalytics();
      setAnalytics(stats);
    } catch (err: any) {
      showToast(err.message || 'Disbursement failed', 'warn');
    }
  };

  const handleExportCsv = () => {
    const csv = ResearchGrantService.exportCSV(proposals);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `YuvaHub_Research_Grants_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Research Grants CSV');
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'ALL',
      status: 'ALL',
      college: '',
      minScore: 0,
      sortBy: 'score',
      sortOrder: 'desc'
    });
  };

  const getStatusBadge = (status: ResearchProposal['status']) => {
    switch (status) {
      case 'FUNDS_DISBURSED':
        return 'bg-emerald-500/200 text-white';
      case 'INSTITUTIONAL_APPROVAL':
        return 'bg-blue-500/200 text-white';
      case 'PEER_REVIEW':
        return 'bg-purple-500/200 text-white';
      case 'DRAFTING':
        return 'bg-slate-400 text-white';
      case 'AUDIT_FLAGGED':
        return 'bg-rose-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 text-text-primary dark:text-slate-100 p-4 sm:p-6 lg:p-10 font-sans space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 bg-primary-blue text-white dark:bg-surface dark:text-text-primary border border-border-theme animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface dark:bg-primary-blue p-6 rounded-3xl border border-border-theme dark:border-border-theme shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 dark:bg-emerald-950 text-emerald-400 dark:text-emerald-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/30 dark:border-emerald-900">
              <BookOpen className="w-3.5 h-3.5" /> Academic Research & Capital Grants
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-secondary dark:bg-surface-secondary text-text-secondary dark:text-slate-300 text-[10px] font-mono font-bold">
              DST / SERB / BIRAC
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight">
            Research Grant & Proposal Telemetry Lab
          </h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-text-muted mt-1">
            Peer review scorecards, milestone tranche disbursements, and institutional scientific governance.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-surface-secondary dark:bg-surface-secondary p-1.5 rounded-2xl border border-border-theme dark:border-border-theme">
          <button
            onClick={() => setActiveView('grid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'grid'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Proposals Board
          </button>
          <button
            onClick={() => setActiveView('ledger')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'ledger'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4" /> Capital Ledger
          </button>
          <button
            onClick={() => setActiveView('peer_review')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'peer_review'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" /> Peer Review Matrix
          </button>
        </div>
      </div>

      {/* Analytics KPI Block */}
      {analytics && <ResearchGrantMetricsCard analytics={analytics} />}

      {/* Filter Toolbar */}
      <ResearchGrantFilterToolbar
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        onExportCsv={handleExportCsv}
        totalMatches={proposals.length}
      />

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Syncing National Grant Ledger...
          </p>
        </div>
      ) : activeView === 'grid' ? (
        /* Proposals Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal) => {
            const nextLocked = proposal.milestones.find((m) => !m.isUnlocked);
            return (
              <div
                key={proposal.id}
                onClick={() => setSelectedProposal(proposal)}
                className="p-5 rounded-3xl bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs font-bold text-text-muted">
                      {proposal.grantCode}
                    </div>
                    <h3 className="font-bold text-sm text-text-primary dark:text-white line-clamp-1 mt-0.5">
                      {proposal.title}
                    </h3>
                    <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{proposal.college}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(proposal.status)}`}>
                    {proposal.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-text-secondary dark:text-text-muted line-clamp-2 leading-relaxed">
                  {proposal.abstract}
                </p>

                {/* Score & Tranche Bar */}
                <div className="p-3 rounded-2xl bg-surface dark:bg-surface-secondary/60 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-text-muted">Disbursed Tranche</span>
                    <span className="text-emerald-400 font-extrabold">
                      ₹{proposal.disbursedGrantLakhs} / ₹{proposal.requestedGrantLakhs} Lakhs
                    </span>
                  </div>
                  <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full"
                      style={{ width: `${(proposal.disbursedGrantLakhs / (proposal.requestedGrantLakhs || 1)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* PI & Duration */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/40">
                    <div className="text-[10px] text-text-muted font-bold uppercase">Principal Inv.</div>
                    <div className="font-bold text-text-primary dark:text-slate-200 mt-0.5 truncate">
                      {proposal.principalInvestigator}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/40">
                    <div className="text-[10px] text-text-muted font-bold uppercase">Duration</div>
                    <div className="font-bold text-text-primary dark:text-slate-200 mt-0.5">
                      {proposal.durationMonths} Months
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-border-theme dark:border-border-theme flex items-center justify-between">
                  {nextLocked ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDisbursementTarget({ proposal, milestone: nextLocked });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 dark:bg-emerald-950 text-emerald-400 font-bold text-xs flex items-center gap-1 hover:bg-emerald-500/200/20"
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Disburse
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400">Fully Disbursed</span>
                  )}
                  <span className="text-xs font-bold text-blue-400 dark:text-blue-400 flex items-center gap-0.5">
                    Inspect <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeView === 'ledger' ? (
        /* Ledger Table View */
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface dark:bg-surface-secondary/80 border-b border-border-theme dark:border-border-theme text-text-muted dark:text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Grant Code & Title</th>
                  <th className="p-4">Principal Investigator</th>
                  <th className="p-4">College</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Requested</th>
                  <th className="p-4">Disbursed</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {proposals.map((p) => (
                  <tr key={p.id} className="hover:bg-surface dark:hover:bg-surface-secondary/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-text-primary dark:text-white">{p.grantCode}</div>
                      <div className="text-[11px] text-text-muted truncate max-w-[220px]">{p.title}</div>
                    </td>
                    <td className="p-4 font-semibold text-text-primary dark:text-slate-200">
                      {p.principalInvestigator}
                    </td>
                    <td className="p-4 text-text-primary dark:text-slate-300">
                      {p.college}
                    </td>
                    <td className="p-4 font-bold text-blue-400 dark:text-blue-400">
                      {p.category.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4 font-mono font-bold">₹{p.requestedGrantLakhs} L</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">₹{p.disbursedGrantLakhs} L</td>
                    <td className="p-4 font-extrabold text-blue-400">{p.compositeReviewScore}%</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(p.status)}`}>
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedProposal(p)}
                        className="px-3 py-1 rounded-lg bg-blue-500/20 dark:bg-blue-950 text-blue-400 dark:text-blue-400 font-bold hover:bg-blue-500/200/20"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Peer Review Matrix */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              National Scientific Peer Review Framework
            </h3>
            <p className="text-xs text-text-muted dark:text-text-muted leading-relaxed">
              Every submitted proposal undergoes double-blind evaluation by senior academicians from premier national research labs across 3 primary dimensions: Scientific Merit, Commercial Feasibility, and Methodology Rigor.
            </p>
            <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span>Minimum Funding Threshold</span>
                <span className="text-emerald-400">&gt; 85% Composite Score</span>
              </div>
              <div className="flex justify-between">
                <span>Average Evaluation Turnaround</span>
                <span className="text-blue-400">&lt; 14 Days</span>
              </div>
            </div>
          </div>

          <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Institutional Ethics & IRB Governance
            </h3>
            <p className="text-xs text-text-muted dark:text-text-muted leading-relaxed">
              Capital disbursements are conditionally locked until institutional review board (IRB) ethical clearances and safety certifications are confirmed.
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-900">
                <div className="text-xl font-black text-emerald-400 dark:text-emerald-400">100%</div>
                <div className="text-[10px] text-text-muted">Ethics Compliant</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-500/20 dark:bg-blue-950/40 border border-blue-500/30 dark:border-blue-900">
                <div className="text-xl font-black text-blue-400 dark:text-blue-400">Milestone</div>
                <div className="text-[10px] text-text-muted">Tranche Governance</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Detail Modal */}
      {selectedProposal && (
        <ProposalDetailModal
          proposal={selectedProposal}
          onClose={() => setSelectedProposal(null)}
          onDisburseMilestone={(prop, ms) => {
            setSelectedProposal(null);
            setDisbursementTarget({ proposal: prop, milestone: ms });
          }}
          onSubmitPeerReview={handleSubmitPeerReview}
        />
      )}

      {/* Grant Disbursement Modal */}
      {disbursementTarget && (
        <GrantDisbursementModal
          proposal={disbursementTarget.proposal}
          milestone={disbursementTarget.milestone}
          onClose={() => setDisbursementTarget(null)}
          onConfirm={handleDisbursementConfirm}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { ResearchProposal, PeerReviewScorecard, MilestoneItem } from '../../types/researchGrant';
import {
  X,
  Award,
  DollarSign,
  BookOpen,
  Send,
  Plus,
  Zap,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Building2,
  Calendar,
  Lock,
  Unlock
} from 'lucide-react';

interface ProposalDetailModalProps {
  proposal: ResearchProposal;
  onClose: () => void;
  onDisburseMilestone: (proposal: ResearchProposal, milestone: MilestoneItem) => void;
  onSubmitPeerReview: (proposalId: string, review: Omit<PeerReviewScorecard, 'id' | 'reviewedAt'>) => Promise<void>;
}

export const ProposalDetailModal: React.FC<ProposalDetailModalProps> = ({
  proposal,
  onClose,
  onDisburseMilestone,
  onSubmitPeerReview
}) => {
  const [activeTab, setActiveTab] = useState<'abstract' | 'milestones' | 'reviews'>('abstract');

  // Peer review form
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewerName, setReviewerName] = useState('Prof. A. N. Murthy (Jury Evaluator)');
  const [reviewerTitle, setReviewerTitle] = useState('Chief Scientist @ IISc Bangalore');
  const [scientificScore, setScientificScore] = useState<number>(9.5);
  const [feasibilityScore, setFeasibilityScore] = useState<number>(9.0);
  const [methodologyScore, setMethodologyScore] = useState<number>(9.4);
  const [recommendation, setRecommendation] = useState<PeerReviewScorecard['overallRecommendation']>('STRONGLY_FUND');
  const [writtenEval, setWrittenEval] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writtenEval.trim()) return;

    setIsSubmitting(true);
    await onSubmitPeerReview(proposal.id, {
      reviewerName: reviewerName.trim(),
      reviewerTitle: reviewerTitle.trim(),
      scientificMeritScore: Number(scientificScore),
      commercialFeasibilityScore: Number(feasibilityScore),
      methodologyRigorScore: Number(methodologyScore),
      overallRecommendation: recommendation,
      writtenEvaluation: writtenEval.trim()
    });
    setWrittenEval('');
    setShowAddReview(false);
    setIsSubmitting(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-blue/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border-theme dark:border-border-theme bg-surface dark:bg-primary-blue/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs text-text-muted font-bold">{proposal.grantCode}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(proposal.status)}`}>
                {proposal.status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-500/200/20 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {proposal.category.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              {proposal.title}
            </h2>
            <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
              <span>{proposal.principalInvestigator}</span> • <span className="font-semibold text-blue-400 dark:text-blue-400">{proposal.college}</span> ({proposal.department})
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-secondary dark:hover:text-white hover:bg-surface-secondary dark:hover:bg-surface-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Capital & Duration Bar */}
        <div className="px-6 py-3 bg-surface dark:bg-primary-blue border-b border-border-theme dark:border-border-theme grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Requested Grant</div>
            <div className="text-base font-extrabold text-text-primary dark:text-white mt-0.5">
              ₹{proposal.requestedGrantLakhs} Lakhs
            </div>
          </div>
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Disbursed Capital</div>
            <div className="text-base font-extrabold text-emerald-400 dark:text-emerald-400 mt-0.5">
              ₹{proposal.disbursedGrantLakhs} Lakhs
            </div>
          </div>
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Scientific Score</div>
            <div className="text-base font-extrabold text-blue-400 dark:text-blue-400 mt-0.5">
              {proposal.compositeReviewScore}%
            </div>
          </div>
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Research Duration</div>
            <div className="text-base font-extrabold text-purple-400 dark:text-purple-400 mt-0.5">
              {proposal.durationMonths} Months
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-theme dark:border-border-theme px-6 bg-surface/50 dark:bg-primary-blue/40 text-xs">
          <button
            onClick={() => setActiveTab('abstract')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'abstract'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Scientific Abstract & Methodology
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'milestones'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Milestone Disbursement ({proposal.milestones.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Award className="w-4 h-4" /> Peer Review Scorecards ({proposal.peerReviews.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'abstract' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-2">
                <span className="text-text-muted font-bold uppercase text-[10px]">Research Abstract</span>
                <p className="text-text-primary dark:text-slate-200 leading-relaxed">{proposal.abstract}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-1">
                  <span className="text-text-muted font-bold uppercase text-[10px]">Principal Investigator Email</span>
                  <div className="font-semibold text-text-primary dark:text-white">{proposal.piEmail}</div>
                </div>
                <div className="p-4 rounded-xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-1">
                  <span className="text-text-muted font-bold uppercase text-[10px]">IRB Ethics Approval Code</span>
                  <div className="font-mono font-bold text-emerald-400">{proposal.irbApprovalCode || 'IRB-SERB-PENDING'}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold uppercase tracking-wider text-text-muted">
                Capital Tranche Milestones & Deliverables
              </h4>
              <div className="space-y-3">
                {proposal.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary dark:text-white">{m.milestoneTitle}</span>
                        {m.isUnlocked ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/200/20 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> Unlocked & Disbursed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-border-theme text-text-primary text-[10px] font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Locked
                          </span>
                        )}
                      </div>
                      <p className="text-text-secondary dark:text-text-muted">{m.deliverablesSummary}</p>
                      <div className="text-[10px] text-text-muted">Target Month: Month {m.targetMonth}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-sm text-emerald-400">₹{m.allocatedAmountLakhs} Lakhs</span>
                      {!m.isUnlocked && (
                        <button
                          onClick={() => onDisburseMilestone(proposal, m)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" /> Disburse Tranche
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-center">
                <h4 className="font-bold uppercase tracking-wider text-text-muted">
                  Peer Review Evaluations
                </h4>
                <button
                  onClick={() => setShowAddReview(!showAddReview)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Peer Review
                </button>
              </div>

              {showAddReview && (
                <form onSubmit={handleSubmitReview} className="p-4 rounded-2xl bg-blue-500/20 dark:bg-blue-950/40 border border-blue-500/30 dark:border-blue-900 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold mb-1">Scientific Merit (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={scientificScore}
                        onChange={(e) => setScientificScore(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Feasibility (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={feasibilityScore}
                        onChange={(e) => setFeasibilityScore(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1">Methodology (0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={methodologyScore}
                        onChange={(e) => setMethodologyScore(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Written Critique & Funding Verdict</label>
                    <textarea
                      rows={2}
                      value={writtenEval}
                      onChange={(e) => setWrittenEval(e.target.value)}
                      placeholder="Scientific evaluation notes..."
                      className="w-full p-2.5 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme"
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddReview(false)}
                      className="px-3 py-1 text-text-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl"
                    >
                      Save Evaluation
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {proposal.peerReviews.length === 0 ? (
                  <p className="text-text-muted italic">No peer review evaluations recorded yet.</p>
                ) : (
                  proposal.peerReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-2">
                      <div className="flex justify-between font-bold">
                        <span>{rev.reviewerName} ({rev.reviewerTitle})</span>
                        <span className="text-emerald-400 font-extrabold">{rev.overallRecommendation.replace(/_/g, ' ')}</span>
                      </div>
                      <p className="italic text-text-primary dark:text-slate-300">"{rev.writtenEvaluation}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

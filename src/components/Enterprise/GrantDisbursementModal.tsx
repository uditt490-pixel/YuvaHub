import React, { useState } from 'react';
import { ResearchProposal, MilestoneItem, GrantDisbursementPayload } from '../../types/researchGrant';
import { X, DollarSign, ShieldCheck, Check } from 'lucide-react';

interface GrantDisbursementModalProps {
  proposal: ResearchProposal;
  milestone: MilestoneItem;
  onClose: () => void;
  onConfirm: (payload: GrantDisbursementPayload) => Promise<void>;
}

export const GrantDisbursementModal: React.FC<GrantDisbursementModalProps> = ({
  proposal,
  milestone,
  onClose,
  onConfirm
}) => {
  const [approverEmail, setApproverEmail] = useState('dst.serb.director@gov.in');
  const [declaration, setDeclaration] = useState(
    'Deliverables verified via institutional scientific audit committee. Tranche capital released for lab operations.'
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declaration.trim()) return;

    setIsProcessing(true);
    await onConfirm({
      proposalId: proposal.id,
      milestoneId: milestone.id,
      disbursementAmountLakhs: milestone.allocatedAmountLakhs,
      approverEmail: approverEmail.trim(),
      complianceDeclaration: declaration.trim()
    });
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-blue/80 backdrop-blur-sm">
      <div className="bg-surface dark:bg-primary-blue border border-emerald-500 dark:border-emerald-600/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="text-base font-extrabold">💰 Capital Grant Disbursement</h3>
              <p className="text-xs text-emerald-100">Authorize milestone tranche capital release</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/20 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200">
              Releasing <span className="font-bold">₹{milestone.allocatedAmountLakhs} Lakhs</span> for <span className="font-bold">{milestone.milestoneTitle}</span> to <span className="font-bold">{proposal.college}</span> ({proposal.principalInvestigator}).
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted mb-1.5">
              Financial Officer / DST Director Email:
            </label>
            <input
              type="email"
              value={approverEmail}
              onChange={(e) => setApproverEmail(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs font-bold text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted mb-1.5">
              Audit Compliance Declaration:
            </label>
            <textarea
              rows={3}
              value={declaration}
              onChange={(e) => setDeclaration(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-border-theme dark:border-border-theme flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-text-secondary dark:text-slate-300 hover:bg-surface-secondary dark:hover:bg-surface-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isProcessing ? 'Authorizing...' : 'Disburse Tranche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

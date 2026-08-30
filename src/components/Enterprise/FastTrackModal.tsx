import React, { useState } from 'react';
import { Candidate, PipelineStage, FastTrackPayload } from '../../types/talentPipeline';
import { X, Zap, AlertTriangle, ShieldAlert, Check } from 'lucide-react';

interface FastTrackModalProps {
  candidate: Candidate;
  onClose: () => void;
  onConfirm: (payload: FastTrackPayload) => Promise<void>;
}

export const FastTrackModal: React.FC<FastTrackModalProps> = ({
  candidate,
  onClose,
  onConfirm
}) => {
  const [stage, setStage] = useState<PipelineStage>('LEADERSHIP_ROUND');
  const [justification, setJustification] = useState(
    'Top 99th percentile AI match, Hackathon winner, competing offer risk mitigation.'
  );
  const [approverEmail, setApproverEmail] = useState('head.talent@enterprise.ac.in');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim() || !approverEmail.trim()) return;

    setIsProcessing(true);
    await onConfirm({
      candidateId: candidate.id,
      immediateStage: stage,
      justification: justification.trim(),
      approverEmail: approverEmail.trim()
    });
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-blue/75 backdrop-blur-sm">
      <div className="bg-surface dark:bg-primary-blue border border-amber-300 dark:border-amber-700/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="text-base font-extrabold">⚡ Emergency Fast-Track Protocol</h3>
              <p className="text-xs text-amber-100">Bypass standard intermediate interview gates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-500/20 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              Promoting <span className="font-bold">{candidate.fullName}</span> ({candidate.college}).
              This action writes an immutable audit record to the recruitment telemetry ledger.
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted mb-1.5">
              Promote Directly To Stage:
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as PipelineStage)}
              className="w-full p-2.5 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs font-bold text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="TECHNICAL_ASSESSMENT">TECHNICAL ASSESSMENT</option>
              <option value="LEADERSHIP_ROUND">LEADERSHIP ROUND (Executive Loop)</option>
              <option value="OFFER_EXTENDED">OFFER EXTENDED (Immediate Hire Letter)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted mb-1.5">
              Executive Fast-Track Justification:
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted mb-1.5">
              Authorizing Sponsor / VP Email:
            </label>
            <input
              type="email"
              value={approverEmail}
              onChange={(e) => setApproverEmail(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
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
              className="px-5 py-2 rounded-xl bg-amber-500/200 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isProcessing ? 'Authorizing...' : 'Authorize Fast-Track'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

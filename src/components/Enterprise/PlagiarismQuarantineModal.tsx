import React, { useState } from 'react';
import { HackathonProjectSubmission, PlagiarismQuarantinePayload } from '../../types/hackathonEvaluation';
import { X, ShieldAlert, AlertTriangle, Check } from 'lucide-react';

interface PlagiarismQuarantineModalProps {
  project: HackathonProjectSubmission;
  onClose: () => void;
  onConfirm: (payload: PlagiarismQuarantinePayload) => Promise<void>;
}

export const PlagiarismQuarantineModal: React.FC<PlagiarismQuarantineModalProps> = ({
  project,
  onClose,
  onConfirm
}) => {
  const [justification, setJustification] = useState(
    'Public codebase similarity exceeds acceptable threshold (>90%) with zero substantive custom code changes.'
  );
  const [leadJudgeEmail, setLeadJudgeEmail] = useState('lead.judge@smartindiahackathon.ac.in');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim()) return;

    setIsProcessing(true);
    await onConfirm({
      projectId: project.id,
      justification: justification.trim(),
      leadJudgeEmail: leadJudgeEmail.trim()
    });
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-blue/80 backdrop-blur-sm">
      <div className="bg-surface dark:bg-primary-blue border border-rose-500 dark:border-rose-600/50 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="text-base font-extrabold">🚨 Plagiarism Disqualification Protocol</h3>
              <p className="text-xs text-rose-100">Disqualify project from prize competition</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-surface/20 transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200">
              Disqualifying project <span className="font-bold">{project.title}</span> by <span className="font-bold">{project.teamName}</span> ({project.college}).
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted mb-1.5">
              Forensic Plagiarism Justification:
            </label>
            <textarea
              rows={3}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-text-muted mb-1.5">
              Lead Judge / Jury Chair Email:
            </label>
            <input
              type="email"
              value={leadJudgeEmail}
              onChange={(e) => setLeadJudgeEmail(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs text-text-primary dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {isProcessing ? 'Disqualifying...' : 'Disqualify Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

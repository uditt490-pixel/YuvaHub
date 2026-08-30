import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

interface ProposalSubmitModalProps {
  gig: any;
  onClose: () => void;
  onSubmit: (proposalText: string) => Promise<void>;
}

export const ProposalSubmitModal: React.FC<ProposalSubmitModalProps> = ({ gig, onClose, onSubmit }) => {
  const [proposalText, setProposalText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalText.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(proposalText);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit Proposal</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Gig: {gig.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Reward: {gig.rewardPoints} Points</p>
          </div>
          <div className="mb-5">
            <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Why are you a good fit?
            </label>
            <textarea
              id="proposal"
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-surface dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none resize-none"
              placeholder="Describe your relevant experience and how you plan to complete this gig..."
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !proposalText.trim()}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Submitting...' : (
                <>
                  <Send className="w-4 h-4" /> Submit Proposal
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

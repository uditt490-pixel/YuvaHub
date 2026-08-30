import React, { useState } from 'react';
import { CheckCircle, UploadCloud, Link as LinkIcon } from 'lucide-react';

interface MilestoneTrackerProps {
  gig: any;
  isCreator: boolean;
  onAcceptDeliverable: (deliverableId: string) => Promise<void>;
  onSubmitDeliverable: (data: { description: string; contentUrl: string }) => Promise<void>;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  gig,
  isCreator,
  onAcceptDeliverable,
  onSubmitDeliverable
}) => {
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitDeliverable({ description: desc, contentUrl: url });
      setDesc('');
      setUrl('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-blue-600" />
        Milestone Tracker
      </h3>

      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-2">
           <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</span>
           <span className="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
             {gig.status.toUpperCase()}
           </span>
        </div>
      </div>

      {!isCreator && gig.status === 'in_progress' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Submit Deliverable</h4>
          <div>
            <textarea
              className="w-full p-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what you completed..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-gray-400" />
            <input
              type="url"
              className="flex-1 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 outline-none"
              placeholder="Link to deliverable (e.g., GitHub, Figma)..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !desc}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            Submit Work for Review
          </button>
        </form>
      )}

      {isCreator && gig.status === 'in_progress' && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Waiting for the student to submit their deliverables.
          </p>
          <button
            onClick={() => onAcceptDeliverable('dummy_deliverable_id_for_now')} // In a real flow, you'd list deliverables and accept a specific one
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition"
          >
            Accept Work & Release Payment
          </button>
        </div>
      )}
    </div>
  );
};

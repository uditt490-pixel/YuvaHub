import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext.js';
import { apiFetch } from '../../lib/apiFetch.js';
import { GigListingCard } from './GigListingCard.js';
import { ProposalSubmitModal } from './ProposalSubmitModal.js';
import { MilestoneTracker } from './MilestoneTracker.js';

export default function GigMarketHub() {
  const { user } = useAppContext();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGig, setSelectedGig] = useState<any | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const fetchGigs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/v1/gigs?search=${searchQuery}`);
      setGigs(res.items || []);
    } catch (err) {
      console.error('Error fetching gigs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, [searchQuery]);

  const handlePostGig = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPosting(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      rewardPoints: parseInt(formData.get('reward') as string, 10),
    };

    try {
      await apiFetch('/v1/gigs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await fetchGigs();
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      console.error(err);
      alert('Failed to post gig. Check console.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSubmitProposal = async (text: string) => {
    await apiFetch(`/v1/gigs/${selectedGig.id}/proposals`, {
      method: 'POST',
      body: JSON.stringify({ proposalText: text })
    });
    alert('Proposal submitted!');
  };

  const handleAcceptDeliverable = async (deliverableId: string) => {
    await apiFetch(`/v1/gigs/${selectedGig.id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ deliverableId })
    });
    alert('Deliverable accepted! Points transferred.');
    fetchGigs();
    setSelectedGig(null);
  };

  const handleSubmitDeliverable = async (data: { description: string; contentUrl: string }) => {
    await apiFetch(`/v1/gigs/${selectedGig.id}/deliverables`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    alert('Deliverable submitted!');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">Student Gig Marketplace</h1>
          <p className="text-gray-600 dark:text-gray-400">Find micro-freelance gigs or hire peers using points.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search gigs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : gigs.length === 0 ? (
            <div className="text-center py-12 bg-surface dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No open gigs found. Be the first to post one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gigs.map(gig => (
                <GigListingCard key={gig.id} gig={gig} onClick={() => setSelectedGig(gig)} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-surface dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" /> Post a New Gig
            </h2>
            <form onSubmit={handlePostGig} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input name="title" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Design a logo" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reward (Points)</label>
                <input name="reward" type="number" min="1" required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. 50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea name="description" required rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none" placeholder="Requirements..." />
              </div>
              <button type="submit" disabled={isPosting} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
                {isPosting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post Gig'}
              </button>
            </form>
          </div>

          {selectedGig && (
            <div className="bg-surface dark:bg-gray-800 p-6 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{selectedGig.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{selectedGig.description}</p>
              
              {selectedGig.status === 'open' && selectedGig.posterId !== user?.uid ? (
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
                >
                  Submit Proposal
                </button>
              ) : selectedGig.status !== 'open' ? (
                <MilestoneTracker 
                  gig={selectedGig} 
                  isCreator={selectedGig.posterId === user?.uid} 
                  onAcceptDeliverable={handleAcceptDeliverable}
                  onSubmitDeliverable={handleSubmitDeliverable}
                />
              ) : (
                <p className="text-sm text-gray-500 italic">This is your gig. Wait for proposals.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {showProposalModal && selectedGig && (
        <ProposalSubmitModal
          gig={selectedGig}
          onClose={() => setShowProposalModal(false)}
          onSubmit={handleSubmitProposal}
        />
      )}
    </div>
  );
}

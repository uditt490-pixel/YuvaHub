import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { auth } from '../../lib/firebase';
import { Bounty } from '../../types';
import Leaderboard from '../ui/Leaderboard';
import BountyChat from '../BountyChat';
import { EmptyState, ErrorState } from '../ui/states';
import { Coins, Plus, Sparkles, MessageSquare, CheckCircle, Clock, Award, X } from 'lucide-react';

export default function BountyBoard() {
  const { profile, karmaBalance } = useAppContext();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newReward, setNewReward] = useState(50);
  
  const [activeChatBounty, setActiveChatBounty] = useState<Bounty | null>(null);

  const fetchBounties = async () => {
    setError(null);
    try {
      const res = await fetch('/api/v1/bounties');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load bounties');
      if (data.items) setBounties(data.items);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Failed to load bounties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  const handlePostBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !profile) return;
    if (karmaBalance < newReward) {
      alert("Insufficient karma points balance.");
      return;
    }
    
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/v1/bounties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          reward: newReward,
          posterName: profile.name,
          tags: []
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowPostModal(false);
        setNewTitle("");
        setNewDesc("");
        setNewReward(50);
        fetchBounties();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptBounty = async (bountyId: string) => {
    if (!auth.currentUser || !profile) return;
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/v1/bounties/${bountyId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ mentorName: profile.name })
      });
      const data = await res.json();
      if (data.success) {
        fetchBounties();
      }
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      {/* Header Banner - YuvaHub Brand Theme */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 p-6 rounded-3xl shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#603620] text-[#f3e4bd] text-xs font-bold uppercase tracking-wider mb-2">
            <Coins className="w-3.5 h-3.5 text-[#f3e4bd]" />
            <span>Peer Karma Exchange</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-text-primary dark:text-white tracking-tight">
            Mentorship <span className="text-primary-blue italic">Bounty Board</span>
          </h1>
          <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">
            Spend Karma points to request 1-on-1 help, or complete student tasks to earn Karma points.
          </p>
        </div>

        <button 
          onClick={() => setShowPostModal(true)}
          className="bg-primary-blue hover:bg-[#96552a] text-white px-5 py-3 rounded-xl text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Post a Bounty
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-surface-secondary dark:bg-slate-800 rounded-2xl w-full" />)}
            </div>
          ) : error ? (
            <ErrorState
              description={error}
              onRetry={() => {
                setLoading(true);
                void fetchBounties();
              }}
              retrying={loading}
            />
          ) : bounties.length === 0 ? (
            <EmptyState
              title="No active bounties"
              description="Be the first to request mentorship help from the community!"
            />
          ) : bounties.map(bounty => (
            <div key={bounty.id} className="bg-surface dark:bg-slate-900 rounded-2xl p-6 border border-border-theme dark:border-slate-800 shadow-2xs hover:border-primary-blue transition-all space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h3 className="font-serif font-bold text-base text-text-primary dark:text-white leading-snug">{bounty.title}</h3>
                <div className="inline-flex items-center gap-1.5 bg-[#f3e4bd] text-text-secondary px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs border border-border-theme shrink-0">
                  <Coins className="w-3.5 h-3.5 text-primary-blue" /> {bounty.reward} Karma
                </div>
              </div>

              <p className="text-xs text-text-secondary dark:text-slate-300 font-medium leading-relaxed line-clamp-3">{bounty.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border-theme dark:border-slate-800 text-xs">
                <div className="flex items-center gap-2 text-text-muted">
                  <div className="w-7 h-7 rounded-full bg-[#603620] text-[#f3e4bd] flex items-center justify-center font-serif font-bold text-xs shadow-2xs">
                    {bounty.posterName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-text-primary dark:text-slate-200">Posted by {bounty.posterName}</span>
                </div>
                
                {bounty.status === 'open' && bounty.posterId !== profile?.uid && (
                  <button onClick={() => handleAcceptBounty(bounty.id)} className="bg-primary-blue hover:bg-[#96552a] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-2xs transition-colors cursor-pointer">
                    Accept Bounty
                  </button>
                )}
                {bounty.status === 'accepted' && (bounty.posterId === profile?.uid || bounty.mentorId === profile?.uid) && (
                  <button onClick={() => setActiveChatBounty(bounty)} className="bg-[#603620] hover:bg-[#482817] text-[#f3e4bd] px-4 py-2 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer">
                    <MessageSquare className="w-3.5 h-3.5" /> Open Chat
                  </button>
                )}
                {bounty.status === 'accepted' && bounty.posterId !== profile?.uid && bounty.mentorId !== profile?.uid && (
                  <span className="text-xs font-bold text-[#63703d]">Accepted by {bounty.mentorName}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </div>

      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-surface dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border-theme dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-border-theme">
              <h3 className="text-base font-serif font-bold text-text-primary dark:text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-primary-blue" /> Post a Bounty
              </h3>
              <button onClick={() => setShowPostModal(false)} className="text-text-muted hover:text-text-primary p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostBounty} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-text-secondary uppercase mb-1">Title</label>
                <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none" placeholder="e.g. Mock Interview for Google SWE" />
              </div>
              <div>
                <label className="block font-bold text-text-secondary uppercase mb-1">Description</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none resize-none" placeholder="Describe what help you need..." />
              </div>
              <div>
                <label className="block font-bold text-text-secondary uppercase mb-1">Karma Reward Points</label>
                <input required type="number" min={10} max={Math.max(10, karmaBalance)} value={newReward} onChange={e => setNewReward(parseInt(e.target.value)||0)} className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none" />
                <p className="text-[11px] text-text-muted mt-1 font-semibold">Available Karma Balance: {karmaBalance}</p>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-border-theme">
                <button type="button" onClick={() => setShowPostModal(false)} className="px-4 py-2 text-xs font-bold text-text-secondary bg-surface-secondary rounded-xl">Cancel</button>
                <button type="submit" className="bg-primary-blue hover:bg-[#96552a] text-white px-5 py-2 text-xs font-bold rounded-xl shadow-xs cursor-pointer">Post Bounty</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeChatBounty && (
        <BountyChat 
          bountyId={activeChatBounty.id} 
          posterId={activeChatBounty.posterId}
          mentorId={activeChatBounty.mentorId!}
          onClose={() => setActiveChatBounty(null)}
          onResolved={() => {
            setActiveChatBounty(null);
            fetchBounties();
          }}
        />
      )}
    </div>
  );
}

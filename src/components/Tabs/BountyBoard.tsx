import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { auth } from '../../lib/firebase';
import { Bounty } from '../../types';
import Leaderboard from '../ui/Leaderboard';
import BountyChat from '../BountyChat';

export default function BountyBoard() {
  const { profile, karmaBalance } = useAppContext();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newReward, setNewReward] = useState(50);
  
  const [activeChatBounty, setActiveChatBounty] = useState<Bounty | null>(null);

  const fetchBounties = async () => {
    try {
      const res = await fetch('/api/v1/bounties');
      const data = await res.json();
      if (data.items) setBounties(data.items);
    } catch (e) {
      console.error(e);
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
      alert("Insufficient karma points.");
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Peer Mentorship Bounties</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Spend Karma to get help, or earn Karma by helping others.</p>
        </div>
        <button 
          onClick={() => setShowPostModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-sm shadow-blue-500/20 flex items-center gap-2"
        >
          <span>➕</span> Post a Bounty
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl w-full" />)}
            </div>
          ) : bounties.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-10 text-center border border-gray-100 dark:border-gray-700">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No active bounties</h3>
              <p className="text-gray-500">Be the first to ask for help from the community!</p>
            </div>
          ) : bounties.map(bounty => (
            <div key={bounty.id} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{bounty.title}</h3>
                <div className="inline-flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 px-3 py-1 rounded-full font-bold shadow-sm">
                  <span>💠</span> {bounty.reward}
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{bounty.description}</p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                    {bounty.posterName?.charAt(0).toUpperCase()}
                  </div>
                  <span>Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{bounty.posterName}</span></span>
                </div>
                
                {bounty.status === 'open' && bounty.posterId !== profile?.uid && (
                  <button onClick={() => handleAcceptBounty(bounty.id)} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm">
                    Accept Bounty
                  </button>
                )}
                {bounty.status === 'accepted' && (bounty.posterId === profile?.uid || bounty.mentorId === profile?.uid) && (
                  <button onClick={() => setActiveChatBounty(bounty)} className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-lg font-medium text-sm">
                    Open Chat
                  </button>
                )}
                {bounty.status === 'accepted' && bounty.posterId !== profile?.uid && bounty.mentorId !== profile?.uid && (
                  <span className="text-sm text-gray-400">Accepted by {bounty.mentorName}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Post a Bounty</h3>
            <form onSubmit={handlePostBounty} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input required type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2" placeholder="e.g. Need mock interview for Google" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2" placeholder="Describe what you need help with..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Karma Reward</label>
                <input required type="number" min={10} max={Math.max(10, karmaBalance)} value={newReward} onChange={e => setNewReward(parseInt(e.target.value)||0)} className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2" />
                <p className="text-xs text-gray-500 mt-1">Available balance: {karmaBalance}</p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowPostModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">Post Bounty</button>
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

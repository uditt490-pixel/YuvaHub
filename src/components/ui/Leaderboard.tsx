import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../../types';
import { Trophy, Award, Coins, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Leaderboard() {
  const { profile, karmaBalance } = useAppContext();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.items && Array.isArray(data.items)) {
          setLeaders(data.items);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-surface-secondary dark:bg-slate-800 rounded-2xl w-full" />)}
      </div>
    );
  }

  return (
    <div className="bg-surface dark:bg-slate-900 rounded-3xl border border-border-theme dark:border-slate-800 overflow-hidden shadow-2xs">
      <div className="p-4 border-b border-border-theme dark:border-slate-800 bg-background dark:bg-slate-800/50">
        <h3 className="font-serif font-bold text-sm text-text-primary dark:text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary-blue" /> Top Community Mentors
        </h3>
      </div>
      <div className="divide-y divide-[#e8ded1] dark:divide-slate-800">
        {leaders.length === 0 ? (
          <div className="p-6 text-center text-xs font-semibold text-text-secondary dark:text-slate-400">
            No mentors on the board yet. Be the first to earn reputation!
          </div>
        ) : (
          leaders.map((leader, index) => (
            <div key={leader.userId} className="flex items-center justify-between p-3.5 hover:bg-background dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`font-serif font-bold text-xs w-6 text-center ${
                  index === 0 ? 'text-primary-blue' : (index === 1 ? 'text-text-secondary' : 'text-text-muted')
                }`}>
                  #{index + 1}
                </span>
                <img 
                  src={leader.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.name)}&background=603620&color=f3e4bd`} 
                  alt={leader.name} 
                  className="w-9 h-9 rounded-full border border-border-theme object-cover" 
                />
                <div>
                  <p className="font-serif font-bold text-xs text-text-primary dark:text-white">{leader.name}</p>
                  <p className="text-[10px] text-text-secondary dark:text-slate-400 font-semibold">{leader.bountiesResolved || 0} bounties resolved</p>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 bg-[#f3e4bd] text-text-secondary px-2.5 py-1 rounded-full text-[10px] font-extrabold border border-border-theme">
                  <Coins className="w-3 h-3 text-primary-blue" /> {leader.reputation} Karma
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

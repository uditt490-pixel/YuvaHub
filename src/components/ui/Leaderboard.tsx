import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../../types';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.items) setLeaders(data.items);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">
       {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl w-full" />)}
    </div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          🏆 Top Mentors This Week
        </h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {leaders.length === 0 ? (
           <div className="p-6 text-center text-sm text-gray-500">No mentors on the board yet. Be the first!</div>
        ) : leaders.map((leader, index) => (
          <div key={leader.userId} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`font-bold w-6 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-500' : 'text-gray-400'}`}>
                #{index + 1}
              </span>
              <img src={leader.avatarUrl || `https://ui-avatars.com/api/?name=${leader.name}`} alt={leader.name} className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{leader.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{leader.bountiesResolved} bounties resolved</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 px-2.5 py-1 rounded-full text-xs font-semibold">
                ⭐ {leader.reputation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

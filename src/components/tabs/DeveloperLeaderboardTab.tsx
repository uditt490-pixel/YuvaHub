import React, { useState } from 'react';
import { 
    Trophy, 
    Flame, 
    Award, 
    GitCommit, 
    GitMerge, 
    Zap, 
    Sparkles 
} from 'lucide-react';
import { 
    MOCK_LEADERBOARD_USERS, 
    LeaderboardUser, 
    generateMockStreakMatrix 
} from '../../services/leaderboardEngine';
import { ContributionStreakMatrix } from './ContributionStreakMatrix';

export const DeveloperLeaderboardTab: React.FC = () => {
    const [users, setUsers] = useState<LeaderboardUser[]>(MOCK_LEADERBOARD_USERS);
    const streakDays = generateMockStreakMatrix();

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
            {/* Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                            <Trophy className="w-4 h-4" /> Gamified Developer XP Leaderboard
                        </div>
                        <h1 className="text-2xl font-black text-slate-100 mt-1">YuvaHub Weekly Hall of Fame</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-2">
                            <Flame className="w-4 h-4" /> Season 8 Active
                        </div>
                    </div>
                </div>

                {/* Contribution Heatmap Preview */}
                <ContributionStreakMatrix days={streakDays} streakCount={users[0].currentStreakDays} />
            </div>

            {/* Leaderboard Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-400" /> Top Contributor Standings
                </h3>

                <div className="space-y-3">
                    {users.map((u) => (
                        <div
                            key={u.rank}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                                u.rank === 1
                                    ? 'bg-slate-950/90 border-amber-500/40 shadow-lg shadow-amber-500/5'
                                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs ${
                                    u.rank === 1 ? 'bg-amber-500 text-slate-950' : u.rank === 2 ? 'bg-slate-300 text-slate-950' : 'bg-slate-800 text-slate-300'
                                }`}>
                                    #{u.rank}
                                </span>

                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-800">
                                    <img src={u.avatarUrl} alt={u.username} className="w-full h-full object-cover" />
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                                        @{u.username}
                                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border" style={{ color: u.tierColor, borderColor: `${u.tierColor}40`, backgroundColor: `${u.tierColor}10` }}>
                                            {u.badgeTitle}
                                        </span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{u.prsMergedCount} Pull Requests Merged</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs font-mono">
                                <div>
                                    <span className="text-slate-500 block text-[10px]">Streak</span>
                                    <span className="text-amber-400 font-bold flex items-center gap-1">
                                        <Flame className="w-3 h-3" /> {u.currentStreakDays}d
                                    </span>
                                </div>

                                <div className="text-right">
                                    <span className="text-slate-500 block text-[10px]">Weekly XP</span>
                                    <span className="text-indigo-400 font-bold text-sm">{u.weeklyXp.toLocaleString()} XP</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeveloperLeaderboardTab;

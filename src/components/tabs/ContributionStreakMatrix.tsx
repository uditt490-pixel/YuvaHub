import React from 'react';
import { ContributionDay } from '../../services/leaderboardEngine';

interface StreakMatrixProps {
    days: ContributionDay[];
    streakCount: number;
}

export const ContributionStreakMatrix: React.FC<StreakMatrixProps> = ({ days, streakCount }) => {
    const intensityColors = [
        'bg-slate-950 border-slate-800',
        'bg-teal-950 border-teal-800 text-teal-300',
        'bg-teal-700 border-teal-600 text-teal-100',
        'bg-indigo-600 border-indigo-500 text-white',
        'bg-amber-500 border-amber-400 text-slate-950 font-bold'
    ];

    return (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">28-Day Contribution Activity</span>
                <span className="font-mono text-amber-400 font-bold">🔥 {streakCount} Days Active Streak</span>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 pt-1">
                {days.map((day, idx) => (
                    <div
                        key={idx}
                        title={`${day.date}: ${day.count} contributions`}
                        className={`h-7 rounded-lg border flex items-center justify-center text-[10px] transition-all hover:scale-110 cursor-pointer ${intensityColors[day.intensityLevel]}`}
                    >
                        {day.count > 0 ? day.count : ''}
                    </div>
                ))}
            </div>
        </div>
    );
};

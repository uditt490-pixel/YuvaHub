import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ProfileWidgetsProps {
    githubStats: {
        topLanguages: { name: string; percentage: number }[];
        contributionGraph: { date: string; count: number }[];
    };
    leetcodeStats: {
        totalSolved: number;
        easySolved: number;
        mediumSolved: number;
        hardSolved: number;
    };
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

/**
 * ProfileWidgets renders visual representations of GitHub and LeetCode stats.
 * Includes a Pie Chart for languages and a grid-based heatmap for contributions.
 */
export const ProfileWidgets: React.FC<ProfileWidgetsProps> = ({ githubStats, leetcodeStats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* GitHub Languages Pie Chart */}
            <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Languages</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={githubStats.topLanguages}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="percentage"
                            >
                                {githubStats.topLanguages.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* LeetCode Stats Summary */}
            <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">LeetCode Progress</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-center">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{leetcodeStats.totalSolved}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Solved</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{leetcodeStats.easySolved}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">Easy</p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg text-center">
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{leetcodeStats.mediumSolved}</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">Medium</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg text-center">
                        <p className="text-3xl font-bold text-red-600 dark:text-red-400">{leetcodeStats.hardSolved}</p>
                        <p className="text-sm text-red-600 dark:text-red-400">Hard</p>
                    </div>
                </div>
            </div>

            {/* GitHub Contribution Heatmap (Simplified Grid) */}
            <div className="md:col-span-2 bg-surface dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contribution Activity</h3>
                <div className="flex flex-wrap gap-1">
                    {githubStats.contributionGraph.map((day, idx) => {
                        const intensity = Math.min(4, Math.floor(day.count / 3));
                        const bgClass = [
                            'bg-gray-200 dark:bg-gray-700',
                            'bg-green-200 dark:bg-green-900',
                            'bg-green-400 dark:bg-green-700',
                            'bg-green-600 dark:bg-green-500',
                            'bg-green-800 dark:bg-green-300',
                        ][intensity];

                        return (
                            <div
                                key={idx}
                                className={`w-3 h-3 rounded-sm ${bgClass} transition-colors hover:ring-1 ring-gray-400`}
                                title={`${day.date}: ${day.count} contributions`}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AdminDataTable } from '../components/AdminDataTable';
import { ReportModerationQueue } from '../components/admin/ReportModerationQueue';
import { Users, Briefcase, TrendingUp } from 'lucide-react';

interface PlatformStats {
    totalUsers: number;
    activeOpportunities: number;
    dailySignups: { name: string; value: number }[];
}

/**
 * AdminDashboard provides a secure, gated interface for platform moderators.
 * It visualizes metrics using Recharts and provides data tables for user management.
 */
export const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch - replace with actual API call to /api/admin/stats
        const fetchStats = async () => {
            try {
                // const res = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } });
                // const data = await res.json();
                // setStats(data.data);

                // Mock data for demonstration
                setStats({
                    totalUsers: 1250,
                    activeOpportunities: 342,
                    dailySignups: [
                        { name: 'Mon', value: 12 },
                        { name: 'Tue', value: 19 },
                        { name: 'Wed', value: 15 },
                        { name: 'Thu', value: 25 },
                        { name: 'Fri', value: 32 },
                    ],
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Moderation Panel</h1>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
                    <Users className="w-10 h-10 text-blue-500 mr-4" />
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers}</p>
                    </div>
                </div>
                <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
                    <Briefcase className="w-10 h-10 text-green-500 mr-4" />
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Active Opportunities</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.activeOpportunities}</p>
                    </div>
                </div>
                <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center">
                    <TrendingUp className="w-10 h-10 text-purple-500 mr-4" />
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Daily Signups</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">20.6</p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Daily Signups</h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.dailySignups}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-surface dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Users</h2>
                <AdminDataTable
                    columns={['Name', 'Email', 'Reputation', 'Joined']}
                    data={[
                        { Name: 'Alice', Email: 'alice@example.com', Reputation: 150, Joined: '2023-10-01' },
                        { Name: 'Bob', Email: 'bob@example.com', Reputation: 45, Joined: '2023-10-05' },
                    ]}
                />
            </div>

            {/* Moderation Queue */}
            <ReportModerationQueue />
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, ExternalLink, Award, ArrowUp, ArrowDown } from 'lucide-react';

interface Sponsor {
    _id: string;
    name: string;
    logoUrl: string;
    websiteUrl: string;
    currentTier: string;
    engagementScore: number;
    resourcesProvided: number;
    boothVisits: number;
    previousRank?: number;
}

/**
 * SponsorLeaderboardWidget displays the top sponsors ranked by engagement.
 * Features animated rank changes and tier badges.
 */
export const SponsorLeaderboardWidget: React.FC = () => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data fetch
        setTimeout(() => {
            setSponsors([
                {
                    _id: '1',
                    name: 'TechCorp Global',
                    logoUrl: 'https://via.placeholder.com/40',
                    websiteUrl: 'https://techcorp.com',
                    currentTier: 'platinum',
                    engagementScore: 2850,
                    resourcesProvided: 12,
                    boothVisits: 340,
                    previousRank: 2,
                },
                {
                    _id: '2',
                    name: 'DevTools Inc',
                    logoUrl: 'https://via.placeholder.com/40',
                    websiteUrl: 'https://devtools.io',
                    currentTier: 'gold',
                    engagementScore: 1200,
                    resourcesProvided: 5,
                    boothVisits: 150,
                    previousRank: 1,
                },
                {
                    _id: '3',
                    name: 'CloudScale',
                    logoUrl: 'https://via.placeholder.com/40',
                    websiteUrl: 'https://cloudscale.net',
                    currentTier: 'silver',
                    engagementScore: 650,
                    resourcesProvided: 2,
                    boothVisits: 80,
                    previousRank: 3,
                },
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'diamond': return 'text-cyan-400 bg-cyan-900/30 border-cyan-700';
            case 'platinum': return 'text-gray-300 bg-gray-800 border-gray-600';
            case 'gold': return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
            case 'silver': return 'text-gray-400 bg-gray-700 border-gray-500';
            default: return 'text-orange-400 bg-orange-900/30 border-orange-700';
        }
    };

    if (loading) {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                    <Trophy className="w-6 h-6 text-yellow-500 mr-3" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sponsor Leaderboard</h2>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Live Engagement
                </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {sponsors.map((sponsor, index) => {
                    const rankChange = sponsor.previousRank ? sponsor.previousRank - (index + 1) : 0;

                    return (
                        <div key={sponsor._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4 flex-1">
                                {/* Rank */}
                                <div className="w-8 text-center">
                                    <span className={`text-lg font-bold ${index < 3 ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                        #{index + 1}
                                    </span>
                                    {rankChange > 0 && <ArrowUp className="w-4 h-4 text-green-500 mx-auto" />}
                                    {rankChange < 0 && <ArrowDown className="w-4 h-4 text-red-500 mx-auto" />}
                                </div>

                                {/* Logo & Info */}
                                <img src={sponsor.logoUrl} alt={sponsor.name} className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 object-cover" />
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {sponsor.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${getTierColor(sponsor.currentTier)}`}>
                                            {sponsor.currentTier}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {sponsor.engagementScore} pts
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics & Action */}
                            <div className="flex items-center gap-6 text-right">
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{sponsor.resourcesProvided}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Resources</p>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{sponsor.boothVisits}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Visits</p>
                                </div>
                                <a
                                    href={sponsor.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-center border-t border-gray-200 dark:border-gray-700">
                <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    View Full Leaderboard
                </button>
            </div>
        </div>
    );
};

export default SponsorLeaderboardWidget;

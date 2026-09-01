/**
 * Developer Leaderboard & Contribution Streak Engine
 * XP formulas, rank calculations, daily commit matrix data generators, and badge assigners.
 */

export interface LeaderboardUser {
    rank: number;
    username: string;
    avatarUrl: string;
    weeklyXp: number;
    currentStreakDays: number;
    prsMergedCount: number;
    badgeTitle: 'Grandmaster' | 'Maintainer' | 'Rising Star' | 'Code Ninja';
    tierColor: string;
}

export interface ContributionDay {
    date: string;
    count: number;
    intensityLevel: 0 | 1 | 2 | 3 | 4; // 0=none, 4=high
}

export const MOCK_LEADERBOARD_USERS: LeaderboardUser[] = [
    {
        rank: 1,
        username: "dipanshubatra",
        avatarUrl: "https://avatars.githubusercontent.com/u/209317047?v=4",
        weeklyXp: 4850,
        currentStreakDays: 24,
        prsMergedCount: 18,
        badgeTitle: "Grandmaster",
        tierColor: "#f59e0b"
    },
    {
        rank: 2,
        username: "uditt490-pixel",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        weeklyXp: 4120,
        currentStreakDays: 19,
        prsMergedCount: 14,
        badgeTitle: "Maintainer",
        tierColor: "#6366f1"
    },
    {
        rank: 3,
        username: "alex-rivera-dev",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        weeklyXp: 3450,
        currentStreakDays: 12,
        prsMergedCount: 9,
        badgeTitle: "Rising Star",
        tierColor: "#10b981"
    },
    {
        rank: 4,
        username: "sarah-jenkins-tech",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        weeklyXp: 2980,
        currentStreakDays: 8,
        prsMergedCount: 6,
        badgeTitle: "Code Ninja",
        tierColor: "#ec4899"
    }
];

export const generateMockStreakMatrix = (): ContributionDay[] => {
    const days: ContributionDay[] = [];
    const today = new Date();

    for (let i = 27; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const count = Math.floor(Math.random() * 8);
        let intensityLevel: 0 | 1 | 2 | 3 | 4 = 0;
        if (count > 0 && count <= 2) intensityLevel = 1;
        else if (count > 2 && count <= 4) intensityLevel = 2;
        else if (count > 4 && count <= 6) intensityLevel = 3;
        else if (count > 6) intensityLevel = 4;

        days.push({
            date: d.toISOString().split('T')[0],
            count,
            intensityLevel
        });
    }

    return days;
};

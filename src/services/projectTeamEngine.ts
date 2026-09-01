/**
 * Community Project Collaboration Matcher Engine
 * Team listing schemas, open role matchers, application submission reducers, and search utilities.
 */

export interface OpenRole {
    roleTitle: string;
    levelNeeded: 'Beginner' | 'Intermediate' | 'Advanced';
    isFilled: boolean;
}

export interface ProjectTeamListing {
    id: string;
    projectName: string;
    tagline: string;
    description: string;
    ownerName: string;
    ownerAvatar: string;
    techStack: string[];
    openRoles: OpenRole[];
    githubRepoUrl: string;
    discordUrl?: string;
    teamSizeCurrent: number;
    teamSizeTarget: number;
    createdAt: string;
    hasApplied: boolean;
}

export const MOCK_PROJECT_TEAMS: ProjectTeamListing[] = [
    {
        id: "team_1",
        projectName: "DevFlow AI - Code Review Automation",
        tagline: "Autonomous GitHub PR reviewer leveraging localized LLMs and AST parsing.",
        description: "We are building an open-source GitHub Action that analyzes diffs, detects security flaws, and posts interactive suggestions.",
        ownerName: "dipanshubatra",
        ownerAvatar: "https://avatars.githubusercontent.com/u/209317047?v=4",
        techStack: ["TypeScript", "Node.js", "Python", "OpenAI"],
        openRoles: [
            { roleTitle: "Frontend React Engineer", levelNeeded: "Intermediate", isFilled: false },
            { roleTitle: "Python AST Parser Specialist", levelNeeded: "Advanced", isFilled: false }
        ],
        githubRepoUrl: "https://github.com/uditt490-pixel/YuvaHub",
        teamSizeCurrent: 3,
        teamSizeTarget: 5,
        createdAt: "1 day ago",
        hasApplied: false
    },
    {
        id: "team_2",
        projectName: "EcoMetrics - Open Carbon Calculator",
        tagline: "API & browser extension tracking carbon footprint of cloud instances.",
        description: "Real-time energy consumption tracking for AWS EC2, GCP compute instances, and Kubernetes node pools.",
        ownerName: "Sarah Jenkins",
        ownerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        techStack: ["Go", "React", "Docker", "Prometheus"],
        openRoles: [
            { roleTitle: "DevOps & Prometheus Lead", levelNeeded: "Advanced", isFilled: false },
            { roleTitle: "Technical Writer", levelNeeded: "Beginner", isFilled: true }
        ],
        githubRepoUrl: "https://github.com/uditt490-pixel/YuvaHub",
        teamSizeCurrent: 4,
        teamSizeTarget: 6,
        createdAt: "3 days ago",
        hasApplied: true
    }
];

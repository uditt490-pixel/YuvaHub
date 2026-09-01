/**
 * Community Mentorship & Peer Code Review Engine
 * Data models, mentor search matchers, review request state reducers, and scheduling utilities.
 */

export interface MentorProfile {
    id: string;
    name: string;
    avatarUrl: string;
    role: string;
    company: string;
    expertiseTags: string[];
    rating: number;
    completedReviewsCount: number;
    hourlyMentorshipRate: string;
    isAvailable: boolean;
    githubUsername: string;
}

export interface PeerReviewRequest {
    id: string;
    repositoryName: string;
    prNumber: number;
    prUrl: string;
    authorName: string;
    techStack: string[];
    status: 'open' | 'assigned' | 'completed';
    assignedMentorName?: string;
    linesChanged: number;
    submittedDate: string;
}

export const MOCK_MENTORS: MentorProfile[] = [
    {
        id: "m_1",
        name: "Devon Erickson",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        role: "Staff Frontend Architect",
        company: "Vercel / React Core",
        expertiseTags: ["TypeScript", "React", "Next.js", "Performance"],
        rating: 4.9,
        completedReviewsCount: 142,
        hourlyMentorshipRate: "Free Community",
        isAvailable: true,
        githubUsername: "devonerickson"
    },
    {
        id: "m_2",
        name: "Priya Sharma",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        role: "Senior Backend Lead",
        company: "Stripe",
        expertiseTags: ["Go", "Node.js", "PostgreSQL", "System Design"],
        rating: 4.95,
        completedReviewsCount: 98,
        hourlyMentorshipRate: "Free Community",
        isAvailable: true,
        githubUsername: "priyasharma-dev"
    },
    {
        id: "m_3",
        name: "Marcus Vance",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        role: "DevOps & Cloud Engineer",
        company: "AWS Advocate",
        expertiseTags: ["Kubernetes", "Docker", "CI/CD", "Terraform"],
        rating: 4.88,
        completedReviewsCount: 76,
        hourlyMentorshipRate: "Free Community",
        isAvailable: false,
        githubUsername: "marcusvance"
    }
];

export const MOCK_PEER_REVIEWS: PeerReviewRequest[] = [
    {
        id: "pr_101",
        repositoryName: "YuvaHub/YuvaHub",
        prNumber: 614,
        prUrl: "https://github.com/uditt490-pixel/YuvaHub/pull/614",
        authorName: "Alex Rivera",
        techStack: ["React", "TypeScript", "Tailwind CSS"],
        status: "open",
        linesChanged: 340,
        submittedDate: "2 hours ago"
    },
    {
        id: "pr_102",
        repositoryName: "YuvaHub/backend-api",
        prNumber: 204,
        prUrl: "https://github.com/uditt490-pixel/YuvaHub/pull/204",
        authorName: "Sarah Jenkins",
        techStack: ["Node.js", "Express", "MongoDB"],
        status: "assigned",
        assignedMentorName: "Priya Sharma",
        linesChanged: 185,
        submittedDate: "5 hours ago"
    }
];

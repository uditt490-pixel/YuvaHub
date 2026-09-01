/**
 * Community Discussion Forum & Q&A Engine
 * Discussion thread schemas, upvote state reducers, solved status toggles, and search matchers.
 */

export interface ForumThread {
    id: string;
    title: string;
    bodySummary: string;
    category: 'architecture' | 'frontend' | 'backend' | 'devops' | 'general';
    authorName: string;
    authorAvatar: string;
    upvotes: number;
    hasUpvoted: boolean;
    answersCount: number;
    isSolved: boolean;
    tags: string[];
    createdAt: string;
}

export const MOCK_FORUM_THREADS: ForumThread[] = [
    {
        id: "thread_1",
        title: "How to handle Server-Sent Events (SSE) reconnection recovery in React 19 without memory leaks?",
        bodySummary: "We are building a real-time telemetry stream dashboard in React. When the SSE socket disconnects, handling exponential backoff reconnects causes stale closures in useEffect.",
        category: "frontend",
        authorName: "Alex Rivera",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        upvotes: 42,
        hasUpvoted: true,
        answersCount: 7,
        isSolved: true,
        tags: ["React", "SSE", "TypeScript", "WebSockets"],
        createdAt: "3 hours ago"
    },
    {
        id: "thread_2",
        title: "Best practices for microservices database migrations with Zero-Downtime deployment?",
        bodySummary: "When altering columns in PostgreSQL databases serving high-traffic APIs, what is the recommended multi-phase schema migration pattern (Expand/Contract)?",
        category: "backend",
        authorName: "Priya Sharma",
        authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        upvotes: 35,
        hasUpvoted: false,
        answersCount: 4,
        isSolved: false,
        tags: ["PostgreSQL", "Database", "Microservices", "CI/CD"],
        createdAt: "6 hours ago"
    },
    {
        id: "thread_3",
        title: "Optimizing Docker multi-stage build cache layer order for pnpm monorepos",
        bodySummary: "Our CI pipeline builds take over 8 minutes due to full pnpm store re-installs on every commit. How can we leverage layer caching for lockfile changes?",
        category: "devops",
        authorName: "Marcus Vance",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        upvotes: 28,
        hasUpvoted: false,
        answersCount: 3,
        isSolved: true,
        tags: ["Docker", "pnpm", "CI/CD", "Monorepo"],
        createdAt: "12 hours ago"
    }
];

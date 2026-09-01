/**
 * Community Resource Library Engine
 * Resource categorization, upvote counter reducers, bookmark state persistence, and search matchers.
 */

export interface DevResource {
    id: string;
    title: string;
    description: string;
    category: 'cheat_sheets' | 'system_design' | 'dev_tools' | 'tutorials';
    externalUrl: string;
    upvotes: number;
    hasUpvoted: boolean;
    isBookmarked: boolean;
    curatorName: string;
    curatorAvatar: string;
    tags: string[];
    readTimeMins: number;
}

export const MOCK_DEV_RESOURCES: DevResource[] = [
    {
        id: "res_1",
        title: "System Design Interview Cheat Sheet: Distributed Caching & Redis",
        description: "Comprehensive visual guide covering Cache-Aside, Write-Through, LRU eviction policies, and Redis cluster sharding.",
        category: "system_design",
        externalUrl: "https://github.com/uditt490-pixel/YuvaHub",
        upvotes: 248,
        hasUpvoted: true,
        isBookmarked: true,
        curatorName: "Alex Rivera",
        curatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        tags: ["System Design", "Redis", "Caching", "Architecture"],
        readTimeMins: 12
    },
    {
        id: "res_2",
        title: "Modern React 19 & Next.js 15 Performance Optimization Checklist",
        description: "Essential audit steps for reducing bundle sizes, eliminating layout shifts (CLS), and optimizing Server Components.",
        category: "cheat_sheets",
        externalUrl: "https://github.com/uditt490-pixel/YuvaHub",
        upvotes: 195,
        hasUpvoted: false,
        isBookmarked: false,
        curatorName: "Devon Erickson",
        curatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        tags: ["React", "Next.js", "Performance", "Frontend"],
        readTimeMins: 8
    },
    {
        id: "res_3",
        title: "Docker & Kubernetes Production Security Hardening Guidelines",
        description: "Best practices for rootless container execution, distroless base images, and secret environment isolation.",
        category: "dev_tools",
        externalUrl: "https://github.com/uditt490-pixel/YuvaHub",
        upvotes: 162,
        hasUpvoted: false,
        isBookmarked: true,
        curatorName: "Marcus Vance",
        curatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        tags: ["Docker", "Kubernetes", "DevOps", "Security"],
        readTimeMins: 15
    }
];

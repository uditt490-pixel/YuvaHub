/**
 * Community Event Schedule & Hackathon Directory Engine
 * Event metadata formats, registration state reducers, and calendar reminder link generators.
 */

export interface CommunityEvent {
    id: string;
    title: string;
    description: string;
    eventType: 'hackathon' | 'workshop' | 'tech_talk' | 'qa_session';
    format: 'virtual' | 'hybrid' | 'in_person';
    startDate: string;
    timeString: string;
    prizePool?: string;
    hostName: string;
    bannerImageUrl: string;
    registeredCount: number;
    maxCapacity?: number;
    tags: string[];
    isRegistered: boolean;
}

export const MOCK_COMMUNITY_EVENTS: CommunityEvent[] = [
    {
        id: "evt_1",
        title: "YuvaHub Summer Open Source Hackathon 2026",
        description: "48-hour virtual hackathon focused on building AI tools, React components, and developer infrastructure for open-source communities.",
        eventType: "hackathon",
        format: "virtual",
        startDate: "August 28, 2026",
        timeString: "10:00 AM EST (48 Hours)",
        prizePool: "$5,000 USD + Swag Kits",
        hostName: "YuvaHub Core Team",
        bannerImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
        registeredCount: 342,
        maxCapacity: 500,
        tags: ["AI", "React", "Node.js", "Hackathon"],
        isRegistered: true
    },
    {
        id: "evt_2",
        title: "High-Performance Next.js Server Actions & Caching Deep Dive",
        description: "Interactive technical workshop demonstrating zero-bundle-size server components, edge database queries, and ISR caching.",
        eventType: "workshop",
        format: "virtual",
        startDate: "September 02, 2026",
        timeString: "6:00 PM EST (90 Mins)",
        hostName: "Vercel Community Advocates",
        bannerImageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
        registeredCount: 189,
        tags: ["Next.js", "Frontend", "Performance"],
        isRegistered: false
    },
    {
        id: "evt_3",
        title: "Building Resilient Microservices with Go & NATS JetStream",
        description: "Architecture tech talk exploring asynchronous event-driven queues, stream replication, and fault tolerance in Go.",
        eventType: "tech_talk",
        format: "hybrid",
        startDate: "September 10, 2026",
        timeString: "2:00 PM EST (60 Mins)",
        hostName: "Stripe Infrastructure Engineers",
        bannerImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
        registeredCount: 124,
        tags: ["Go", "Distributed Systems", "NATS"],
        isRegistered: false
    }
];

export const generateCalendarLink = (event: CommunityEvent): string => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
};

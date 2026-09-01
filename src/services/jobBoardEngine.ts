/**
 * Community Job Board & Referral Exchange Engine
 * Job opening models, referral request state reducers, and salary/remote matchers.
 */

export interface JobOpening {
    id: string;
    title: string;
    company: string;
    companyLogoUrl: string;
    location: string;
    remotePolicy: 'Remote' | 'Hybrid' | 'On-Site';
    salaryRange: string;
    experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
    techStack: string[];
    referralAvailable: boolean;
    referrerName?: string;
    referrerRole?: string;
    applyUrl: string;
    postedDate: string;
    hasRequestedReferral: boolean;
}

export const MOCK_JOB_OPENINGS: JobOpening[] = [
    {
        id: "job_1",
        title: "Senior Frontend Engineer (React / TypeScript)",
        company: "Vercel",
        companyLogoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
        location: "San Francisco, CA / Remote",
        remotePolicy: "Remote",
        salaryRange: "$160,000 - $195,000 USD",
        experienceLevel: "Senior",
        techStack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        referralAvailable: true,
        referrerName: "Devon Erickson",
        referrerRole: "Staff Architect at Vercel",
        applyUrl: "https://github.com/uditt490-pixel/YuvaHub",
        postedDate: "2 days ago",
        hasRequestedReferral: false
    },
    {
        id: "job_2",
        title: "Backend Infrastructure Lead (Go & Microservices)",
        company: "Stripe",
        companyLogoUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=150&q=80",
        location: "New York, NY / Hybrid",
        remotePolicy: "Hybrid",
        salaryRange: "$180,000 - $220,000 USD",
        experienceLevel: "Lead",
        techStack: ["Go", "PostgreSQL", "Kafka", "Docker"],
        referralAvailable: true,
        referrerName: "Priya Sharma",
        referrerRole: "Senior Backend Lead at Stripe",
        applyUrl: "https://github.com/uditt490-pixel/YuvaHub",
        postedDate: "4 days ago",
        hasRequestedReferral: true
    }
];

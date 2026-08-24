import {
  HackathonProjectSubmission,
  HackathonAnalyticsSummary,
  HackathonFilterOptions,
  JudgeReview,
  PlagiarismQuarantinePayload
} from '../types/hackathonEvaluation';

export class HackathonEvaluationService {
  private static submissionsStore: HackathonProjectSubmission[] = [
    {
      id: 'proj-001',
      projectCode: 'HACK-2026-AI-101',
      title: 'AuraMed AI: Autonomous Real-Time ICU Telemetry Diagnostics',
      tagline: 'Edge AI diagnostic pipeline for early septic shock warning with KDIGO compliance.',
      description: 'Built a high-throughput time-series streaming platform that consumes patient telemetry (arterial line pressure, SpO2, lactate) and predicts multi-organ failure with 98.2% accuracy using sparse transformers.',
      teamName: 'NeuralPulse Labs',
      teamLead: 'Rhea Chakraborty',
      teamLeadEmail: 'rhea.c@iitb.ac.in',
      college: 'IIT Bombay',
      track: 'AI_HEALTHCARE',
      status: 'WINNER_SELECTED',
      githubUrl: 'https://github.com/neuralpulse/auramed-icu',
      demoVideoUrl: 'https://youtube.com/watch?v=auramed-demo',
      liveDeployUrl: 'https://auramed-icu.vercel.app',
      techStack: ['PyTorch', 'FastAPI', 'Rust', 'React 19', 'Kafka'],
      commitCount: 142,
      compositeJudgeScore: 97.5,
      reviews: [
        {
          id: 'rev-001',
          judgeName: 'Dr. Arjun Shenoy',
          judgeTitle: 'Chief AI Architect @ MedTech Global',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          rubricScores: [
            { criterion: 'Innovation & Novelty', weightPercentage: 25, score: 10, maxScore: 10 },
            { criterion: 'Technical Depth & Architecture', weightPercentage: 30, score: 9.8, maxScore: 10 },
            { criterion: 'Code Quality & Test Coverage', weightPercentage: 20, score: 9.5, maxScore: 10 },
            { criterion: 'Live Demo & Production Readiness', weightPercentage: 25, score: 9.8, maxScore: 10 }
          ],
          compositeScore: 97.5,
          recommendation: 'TOP_FINALIST',
          writtenCritique: 'Incredible engineering depth. The Rust eBPF streaming hook and KDIGO-aligned risk model are production-ready.',
          reviewedAt: new Date(Date.now() - 4 * 3600000).toISOString()
        }
      ],
      plagiarism: {
        overallSimilarityIndex: 4.2,
        aiGeneratedCodeConfidence: 12.0,
        suspiciousFileCount: 0,
        matchedPublicRepositories: [],
        isFlagged: false
      },
      submittedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
      prizeTrack: 'Grand Champion 1st Prize (INR 5,00,000)'
    },
    {
      id: 'proj-002',
      projectCode: 'HACK-2026-FIN-102',
      title: 'OmniVault: Zero-Knowledge Decentralized Micro-Credit Protocol',
      tagline: 'Privacy-preserving zk-SNARK credit scoring for underbanked student entrepreneurs.',
      description: 'Utilizes zero-knowledge proofs on Polygon zkEVM to authenticate student academic achievements and karma reputation without revealing underlying financial histories.',
      teamName: 'CryptoZero Consortium',
      teamLead: 'Devansh Kothari',
      teamLeadEmail: 'devansh.k@bits-pilani.ac.in',
      college: 'BITS Pilani',
      track: 'FINTECH_WEB3',
      status: 'EVALUATION_COMPLETED',
      githubUrl: 'https://github.com/cryptozero/omnivault-zk',
      demoVideoUrl: 'https://youtube.com/watch?v=omnivault-demo',
      liveDeployUrl: 'https://omnivault.eth.limo',
      techStack: ['Circom', 'Solidity', 'Rust', 'Ethers.js', 'Next.js 15'],
      commitCount: 98,
      compositeJudgeScore: 92.8,
      reviews: [
        {
          id: 'rev-002',
          judgeName: 'Meenakshi Sundaram',
          judgeTitle: 'VP of Engineering @ Polygon',
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
          rubricScores: [
            { criterion: 'Innovation & Novelty', weightPercentage: 25, score: 9.5, maxScore: 10 },
            { criterion: 'Technical Depth & Architecture', weightPercentage: 30, score: 9.2, maxScore: 10 },
            { criterion: 'Code Quality & Test Coverage', weightPercentage: 20, score: 9.0, maxScore: 10 },
            { criterion: 'Live Demo & Production Readiness', weightPercentage: 25, score: 9.4, maxScore: 10 }
          ],
          compositeScore: 92.8,
          recommendation: 'STRONG_CONTENDER',
          writtenCritique: 'Well-formed zk-circuits with audited constraint parameters. Great UX integration.',
          reviewedAt: new Date(Date.now() - 6 * 3600000).toISOString()
        }
      ],
      plagiarism: {
        overallSimilarityIndex: 6.8,
        aiGeneratedCodeConfidence: 18.5,
        suspiciousFileCount: 0,
        matchedPublicRepositories: [],
        isFlagged: false
      },
      submittedAt: new Date(Date.now() - 26 * 3600000).toISOString()
    },
    {
      id: 'proj-003',
      projectCode: 'HACK-2026-SEC-103',
      title: 'SpectreGuard: Kernel-Level eBPF Zero-Trust Microsegmentation',
      tagline: 'Real-time container network isolation for multi-tenant educational clusters.',
      description: 'Leverages Linux eBPF probes in Kubernetes to enforce zero-trust boundary controls and instantly terminate anomalous shell spawns inside student workspace containers.',
      teamName: 'KernelHacks Core',
      teamLead: 'Sameer Bhardwaj',
      teamLeadEmail: 'sameer.b@iiit.ac.in',
      college: 'IIIT Hyderabad',
      track: 'CYBERSECURITY_ZERO_TRUST',
      status: 'SCORING_IN_PROGRESS',
      githubUrl: 'https://github.com/kernelhacks/spectreguard',
      liveDeployUrl: 'https://spectreguard.internal.dev',
      techStack: ['C', 'Golang', 'eBPF', 'Kubernetes', 'Prometheus'],
      commitCount: 114,
      compositeJudgeScore: 89.0,
      reviews: [],
      plagiarism: {
        overallSimilarityIndex: 8.4,
        aiGeneratedCodeConfidence: 10.0,
        suspiciousFileCount: 0,
        matchedPublicRepositories: [],
        isFlagged: false
      },
      submittedAt: new Date(Date.now() - 18 * 3600000).toISOString()
    },
    {
      id: 'proj-004',
      projectCode: 'HACK-2026-AI-104',
      title: 'Plagiarized ChatBot Wrapper (Flagged Clone)',
      tagline: 'Generic OpenAI wrapper cloned from outdated public GitHub tutorial.',
      description: 'Clone of a boilerplate LangChain template with hardcoded API keys and no original intellectual contribution.',
      teamName: 'ScriptKiddies Elite',
      teamLead: 'Rohit Jha',
      teamLeadEmail: 'rohit.jha@external.edu',
      college: 'Unknown Institution',
      track: 'AI_HEALTHCARE',
      status: 'FLAGGED_PLAGIARISM',
      githubUrl: 'https://github.com/scriptkiddies/simple-chatgpt-clone',
      techStack: ['HTML', 'JavaScript'],
      commitCount: 2,
      compositeJudgeScore: 18.0,
      reviews: [],
      plagiarism: {
        overallSimilarityIndex: 94.6,
        aiGeneratedCodeConfidence: 99.0,
        suspiciousFileCount: 8,
        matchedPublicRepositories: [
          'github.com/freeCodeCamp/simple-openai-chatgpt-tutorial',
          'github.com/langchain-ai/langchain-starter-2023'
        ],
        isFlagged: true
      },
      submittedAt: new Date(Date.now() - 30 * 3600000).toISOString()
    }
  ];

  public static async getSubmissions(
    filters?: Partial<HackathonFilterOptions>
  ): Promise<HackathonProjectSubmission[]> {
    await new Promise((r) => setTimeout(r, 300));
    let list = [...this.submissionsStore];

    if (!filters) return list;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.teamName.toLowerCase().includes(q) ||
          p.college.toLowerCase().includes(q) ||
          p.projectCode.toLowerCase().includes(q) ||
          p.techStack.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.track && filters.track !== 'ALL') {
      list = list.filter((p) => p.track === filters.track);
    }

    if (filters.status && filters.status !== 'ALL') {
      list = list.filter((p) => p.status === filters.status);
    }

    if (filters.college) {
      list = list.filter((p) => p.college === filters.college);
    }

    if (filters.minScore && filters.minScore > 0) {
      list = list.filter((p) => p.compositeJudgeScore >= filters.minScore!);
    }

    if (filters.sortBy) {
      list.sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (filters.sortBy === 'score') {
          valA = a.compositeJudgeScore;
          valB = b.compositeJudgeScore;
        } else if (filters.sortBy === 'commits') {
          valA = a.commitCount;
          valB = b.commitCount;
        } else if (filters.sortBy === 'submittedAt') {
          valA = new Date(a.submittedAt).getTime();
          valB = new Date(b.submittedAt).getTime();
        }
        return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return list;
  }

  public static async submitJudgeReview(
    projectId: string,
    review: Omit<JudgeReview, 'id' | 'reviewedAt'>
  ): Promise<HackathonProjectSubmission> {
    await new Promise((r) => setTimeout(r, 400));
    const index = this.submissionsStore.findIndex((p) => p.id === projectId);
    if (index === -1) throw new Error('Project submission not found');

    const project = this.submissionsStore[index];
    const newReview: JudgeReview = {
      ...review,
      id: `rev-${Date.now()}`,
      reviewedAt: new Date().toISOString()
    };

    const updatedReviews = [newReview, ...project.reviews];
    const avgScore =
      updatedReviews.reduce((acc, curr) => acc + curr.compositeScore, 0) /
      updatedReviews.length;

    const updatedProject: HackathonProjectSubmission = {
      ...project,
      reviews: updatedReviews,
      compositeJudgeScore: Math.round(avgScore * 10) / 10,
      status: avgScore >= 90 ? 'WINNER_SELECTED' : 'EVALUATION_COMPLETED'
    };

    this.submissionsStore[index] = updatedProject;
    return updatedProject;
  }

  public static async quarantinePlagiarism(
    payload: PlagiarismQuarantinePayload
  ): Promise<HackathonProjectSubmission> {
    await new Promise((r) => setTimeout(r, 350));
    const index = this.submissionsStore.findIndex((p) => p.id === payload.projectId);
    if (index === -1) throw new Error('Project not found');

    const updated: HackathonProjectSubmission = {
      ...this.submissionsStore[index],
      status: 'FLAGGED_PLAGIARISM',
      compositeJudgeScore: 0,
      plagiarism: {
        ...this.submissionsStore[index].plagiarism,
        isFlagged: true
      }
    };

    this.submissionsStore[index] = updated;
    return updated;
  }

  public static async getAnalytics(): Promise<HackathonAnalyticsSummary> {
    await new Promise((r) => setTimeout(r, 250));
    const list = this.submissionsStore;
    const evaluated = list.filter((p) => p.status === 'EVALUATION_COMPLETED' || p.status === 'WINNER_SELECTED').length;
    const flagged = list.filter((p) => p.status === 'FLAGGED_PLAGIARISM').length;
    const finalists = list.filter((p) => p.compositeJudgeScore >= 90).length;
    const avgScore = list.reduce((acc, p) => acc + p.compositeJudgeScore, 0) / (list.length || 1);

    return {
      totalSubmissions: list.length,
      evaluatedSubmissions: evaluated,
      averageScore: Math.round(avgScore * 10) / 10,
      flaggedPlagiarismCount: flagged,
      shortlistedFinalistsCount: finalists,
      trackBreakdown: [
        { track: 'AI_HEALTHCARE', projectCount: 38, averageScore: 94.5 },
        { track: 'FINTECH_WEB3', projectCount: 29, averageScore: 91.2 },
        { track: 'CYBERSECURITY_ZERO_TRUST', projectCount: 22, averageScore: 89.4 },
        { track: 'EDTECH_STUDENT_TOOLS', projectCount: 45, averageScore: 88.0 }
      ],
      collegeRankings: [
        { college: 'IIT Bombay', totalProjects: 24, topScore: 97.5 },
        { college: 'BITS Pilani', totalProjects: 20, topScore: 92.8 },
        { college: 'IIIT Hyderabad', totalProjects: 18, topScore: 89.0 },
        { college: 'DTU', totalProjects: 22, topScore: 88.4 }
      ]
    };
  }

  public static exportCSV(submissions: HackathonProjectSubmission[]): string {
    const headers = [
      'Project Code',
      'Title',
      'Team Name',
      'College',
      'Track',
      'Status',
      'Judge Score',
      'Commits',
      'Plagiarism %'
    ];

    const rows = submissions.map((p) => [
      p.projectCode,
      `"${p.title}"`,
      `"${p.teamName}"`,
      `"${p.college}"`,
      p.track,
      p.status,
      p.compositeJudgeScore,
      p.commitCount,
      p.plagiarism.overallSimilarityIndex
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

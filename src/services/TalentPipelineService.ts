import {
  Candidate,
  PipelineStage,
  PipelineAnalyticsSummary,
  PipelineFilterOptions,
  FastTrackPayload
} from '../types/talentPipeline';

export class TalentPipelineService {
  private static candidatesStore: Candidate[] = [
    {
      id: 'cand-001',
      candidateNumber: 'YH-2026-8801',
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@iitb.ac.in',
      phone: '+91 98765 43210',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      college: 'Indian Institute of Technology, Bombay',
      degree: 'B.Tech in Computer Science & Engineering',
      graduationYear: 2026,
      gpa: 9.42,
      targetRole: 'Senior Distributed Systems Engineer',
      department: 'Platform Architecture',
      currentStage: 'TECHNICAL_ASSESSMENT',
      priority: 'CRITICAL_MATCH',
      skills: [
        { name: 'Golang / Rust', category: 'CORE_ENGINEERING', score: 96, verified: true },
        { name: 'Kubernetes & eBPF', category: 'SYSTEMS_AI', score: 92, verified: true },
        { name: 'Distributed Consensus (Raft)', category: 'CORE_ENGINEERING', score: 95, verified: true },
        { name: 'System Design & Telemetry', category: 'CORE_ENGINEERING', score: 90, verified: true }
      ],
      assessment: {
        atsScore: 98,
        codeQualityIndex: 95,
        problemSolvingIndex: 98,
        behavioralScore: 89,
        compositeFitScore: 95.5,
        recommendation: 'STRONG_HIRE',
        keyStrengths: [
          'Ranked Top 5 in National Smart India Hackathon',
          'Core Contributor to open-source CNCF sandbox project',
          'Authored high-throughput concurrent caching engine in Rust'
        ],
        growthAreas: ['Enterprise cross-functional executive presentations'],
        hackathonWins: 4,
        openSourceContributions: 86
      },
      telemetry: [
        {
          id: 'tel-101',
          timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
          actor: 'AI Ingestion Engine',
          actorRole: 'Autonomous Screener',
          action: 'Resume parsed & high-assurance verification completed',
          notes: 'Candidate verified via GitHub activity and verified campus portal.'
        },
        {
          id: 'tel-102',
          timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
          actor: 'Campus TPO Gateway',
          actorRole: 'Placement Coordinator',
          action: 'Advanced to Technical Coding Round',
          stageFrom: 'AI_SCREENED',
          stageTo: 'TECHNICAL_ASSESSMENT',
          notes: 'Scored 100% on automated algorithms assessment (Concurrency & Graph DP).'
        }
      ],
      githubUrl: 'https://github.com/aarav-distributed',
      linkedinUrl: 'https://linkedin.com/in/aarav-sharma-iitb',
      portfolioUrl: 'https://aaravsharma.dev',
      resumeFileName: 'Aarav_Sharma_IITB_Resume_2026.pdf',
      expectedCtcLpa: 42,
      appliedDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      lastUpdated: new Date(Date.now() - 1 * 86400000).toISOString(),
      tags: ['Tier-1 Campus', 'Rust Core', 'Hackathon Champion', 'High Velocity'],
      notes: ['Candidate has competing offer from top hedge fund, prioritize interview scheduling.']
    },
    {
      id: 'cand-002',
      candidateNumber: 'YH-2026-8802',
      fullName: 'Priya Sundaram',
      email: 'priya.sundaram@bits-pilani.ac.in',
      phone: '+91 97123 45678',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      college: 'BITS Pilani, Pilani Campus',
      degree: 'Dual Degree B.E. Computer Science & M.Sc. Mathematics',
      graduationYear: 2026,
      gpa: 9.68,
      targetRole: 'Bio-AI & LLM Research Engineer',
      department: 'Applied AI & Cognitive Science',
      currentStage: 'LEADERSHIP_ROUND',
      priority: 'CRITICAL_MATCH',
      skills: [
        { name: 'PyTorch / JAX', category: 'SYSTEMS_AI', score: 98, verified: true },
        { name: 'Transformer Optimization & FlashAttention', category: 'SYSTEMS_AI', score: 94, verified: true },
        { name: 'Vector Databases & RAG Architecture', category: 'SYSTEMS_AI', score: 96, verified: true },
        { name: 'Statistical Inference & Probability', category: 'DOMAIN_EXPERTISE', score: 99, verified: true }
      ],
      assessment: {
        atsScore: 99,
        codeQualityIndex: 92,
        problemSolvingIndex: 97,
        behavioralScore: 94,
        compositeFitScore: 96.2,
        recommendation: 'STRONG_HIRE',
        keyStrengths: [
          'NeurIPS workshop paper on sparse attention distillation',
          '9.68 CGPA with Department Gold Medal track',
          'Demonstrated expertise in enterprise model alignment and safety guardrails'
        ],
        growthAreas: ['Production Kubernetes scaling for multi-node GPU clusters'],
        hackathonWins: 3,
        openSourceContributions: 42
      },
      telemetry: [
        {
          id: 'tel-201',
          timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
          actor: 'AI Ingestion Engine',
          actorRole: 'Autonomous Screener',
          action: 'Ranked #1 in Applied AI Talent Pool',
          notes: 'Candidate benchmarked at 99.4th percentile in transformer fine-tuning.'
        },
        {
          id: 'tel-202',
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          actor: 'Dr. Siddharth Sen',
          actorRole: 'VP of AI Research',
          action: 'Advanced to Final Executive Leadership Round',
          stageFrom: 'TECHNICAL_ASSESSMENT',
          stageTo: 'LEADERSHIP_ROUND',
          notes: 'Exceptional deep dive on quantization-aware training.'
        }
      ],
      githubUrl: 'https://github.com/priya-deeplearning',
      linkedinUrl: 'https://linkedin.com/in/priyasundaram-bits',
      portfolioUrl: 'https://priyasundaram.ai',
      resumeFileName: 'Priya_Sundaram_BITS_AI_2026.pdf',
      expectedCtcLpa: 48,
      appliedDate: new Date(Date.now() - 12 * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      tags: ['Research Author', 'AI Architect', 'Double Degree', 'Dean Scholar'],
      notes: ['Fast-track to offer stage approved by VP.']
    },
    {
      id: 'cand-003',
      candidateNumber: 'YH-2026-8803',
      fullName: 'Rohan Deshmukh',
      email: 'rohan.d@iitd.ac.in',
      phone: '+91 99887 76655',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      college: 'Indian Institute of Technology, Delhi',
      degree: 'B.Tech in Electrical Engineering with CS Minor',
      graduationYear: 2026,
      gpa: 8.91,
      targetRole: 'Full Stack Cloud Platform Engineer',
      department: 'Core Product Engineering',
      currentStage: 'OFFER_EXTENDED',
      priority: 'HIGH_POTENTIAL',
      skills: [
        { name: 'React 19 / Next.js / TypeScript', category: 'CORE_ENGINEERING', score: 94, verified: true },
        { name: 'Node.js / Express / Redis', category: 'CORE_ENGINEERING', score: 91, verified: true },
        { name: 'GraphQL & WebSockets', category: 'CORE_ENGINEERING', score: 88, verified: true },
        { name: 'PostgreSQL Query Optimization', category: 'DOMAIN_EXPERTISE', score: 89, verified: true }
      ],
      assessment: {
        atsScore: 92,
        codeQualityIndex: 90,
        problemSolvingIndex: 89,
        behavioralScore: 92,
        compositeFitScore: 90.8,
        recommendation: 'HIRE',
        keyStrengths: [
          'Built multi-tenant real-time collaboration tool with 20k active users',
          'Fast execution speed and stellar UX intuition',
          'Clean test-driven development discipline'
        ],
        growthAreas: ['Low-level database lock management'],
        hackathonWins: 2,
        openSourceContributions: 38
      },
      telemetry: [
        {
          id: 'tel-301',
          timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
          actor: 'System Sourced',
          actorRole: 'YuvaHub Recruiter Matcher',
          action: 'Candidate profile matched target job specs'
        },
        {
          id: 'tel-302',
          timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
          actor: 'Talent Acquisition Team',
          actorRole: 'Head of Recruiting',
          action: 'Official Offer Extended (INR 34 LPA base + stock)',
          stageFrom: 'LEADERSHIP_ROUND',
          stageTo: 'OFFER_EXTENDED'
        }
      ],
      githubUrl: 'https://github.com/rohandesh-cloud',
      linkedinUrl: 'https://linkedin.com/in/rohandesh-iitd',
      resumeFileName: 'Rohan_Deshmukh_IITD_2026.pdf',
      expectedCtcLpa: 36,
      appliedDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      lastUpdated: new Date(Date.now() - 1 * 86400000).toISOString(),
      tags: ['React Specialist', 'Full Stack', 'High Product Sense'],
      notes: ['Offer letter dispatched. Awaiting candidate e-signature.']
    },
    {
      id: 'cand-004',
      candidateNumber: 'YH-2026-8804',
      fullName: 'Ananya Roy',
      email: 'ananya.roy@iiit.ac.in',
      phone: '+91 91234 56780',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      college: 'IIIT Hyderabad',
      degree: 'B.Tech in Computer Science & MS by Research',
      graduationYear: 2026,
      gpa: 9.55,
      targetRole: 'Zero-Trust Security & Cryptography Engineer',
      department: 'Information Security & Cloud Compliance',
      currentStage: 'AI_SCREENED',
      priority: 'FAST_TRACK',
      skills: [
        { name: 'Zero-Trust Architecture', category: 'DOMAIN_EXPERTISE', score: 97, verified: true },
        { name: 'Elliptic Curve Cryptography & TLS 1.3', category: 'CORE_ENGINEERING', score: 95, verified: true },
        { name: 'Rust Memory Safety & Audit Tools', category: 'CORE_ENGINEERING', score: 93, verified: true },
        { name: 'SOC2 / ISO 27001 Compliance Automation', category: 'DOMAIN_EXPERTISE', score: 91, verified: true }
      ],
      assessment: {
        atsScore: 96,
        codeQualityIndex: 96,
        problemSolvingIndex: 94,
        behavioralScore: 88,
        compositeFitScore: 94.0,
        recommendation: 'STRONG_HIRE',
        keyStrengths: [
          'Reported 6 responsible disclosure CVE bug bounties to Fortune 500 portals',
          'Extensive experience in PKI infrastructure and JWT security'
        ],
        growthAreas: ['Frontend UI integration workflows'],
        hackathonWins: 5,
        openSourceContributions: 54
      },
      telemetry: [
        {
          id: 'tel-401',
          timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
          actor: 'Automated Security Screener',
          actorRole: 'Security AI Bot',
          action: 'Candidate passed all sandbox verification benchmarks'
        }
      ],
      githubUrl: 'https://github.com/ananya-infosec',
      linkedinUrl: 'https://linkedin.com/in/ananya-roy-iiith',
      resumeFileName: 'Ananya_Roy_IIITH_Security_2026.pdf',
      expectedCtcLpa: 40,
      appliedDate: new Date(Date.now() - 3 * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      tags: ['Security Bug Hunter', 'Cryptography', 'IIIT Top Ranker'],
      notes: ['Requested expedited technical loop due to early placement window.']
    },
    {
      id: 'cand-005',
      candidateNumber: 'YH-2026-8805',
      fullName: 'Vikramaditya Iyer',
      email: 'vikram.iyer@nitt.edu',
      phone: '+91 94455 66778',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      college: 'National Institute of Technology, Tiruchirappalli',
      degree: 'B.Tech in Instrumentation & Control Engineering',
      graduationYear: 2026,
      gpa: 8.75,
      targetRole: 'Real-Time Telemetry & IoT Systems Engineer',
      department: 'Edge Computing & Hardware Integration',
      currentStage: 'SOURCED',
      priority: 'STANDARD',
      skills: [
        { name: 'Embedded C / C++', category: 'CORE_ENGINEERING', score: 91, verified: true },
        { name: 'MQTT / WebSockets Telemetry', category: 'SYSTEMS_AI', score: 87, verified: true },
        { name: 'Time-Series Data (InfluxDB / Timescale)', category: 'CORE_ENGINEERING', score: 85, verified: true },
        { name: 'RTOS & Microcontroller Interfacing', category: 'DOMAIN_EXPERTISE', score: 92, verified: true }
      ],
      assessment: {
        atsScore: 88,
        codeQualityIndex: 87,
        problemSolvingIndex: 86,
        behavioralScore: 89,
        compositeFitScore: 87.5,
        recommendation: 'HIRE',
        keyStrengths: [
          'Winner of National Smart Mobility Hackathon',
          'High proficiency in low-latency telemetry pipelines and edge computing'
        ],
        growthAreas: ['Microservices architecture in cloud-native environments'],
        hackathonWins: 2,
        openSourceContributions: 19
      },
      telemetry: [
        {
          id: 'tel-501',
          timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
          actor: 'Campus Crawler Bot',
          actorRole: 'Talent Sourcing AI',
          action: 'Discovered profile from NIT Trichy Pragyan Technical Festival roster'
        }
      ],
      githubUrl: 'https://github.com/vikram-iot-edge',
      linkedinUrl: 'https://linkedin.com/in/vikramiyer-nitt',
      resumeFileName: 'Vikramaditya_Iyer_NITT_2026.pdf',
      expectedCtcLpa: 28,
      appliedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      tags: ['Hardware IoT', 'NIT Trichy', 'Real-Time Data'],
      notes: ['Scheduled for initial phone screen with campus talent lead.']
    },
    {
      id: 'cand-006',
      candidateNumber: 'YH-2026-8806',
      fullName: 'Tanvi Agarwal',
      email: 'tanvi.agarwal@dtu.ac.in',
      phone: '+91 98111 22334',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      college: 'Delhi Technological University (DTU)',
      degree: 'B.Tech in Software Engineering',
      graduationYear: 2026,
      gpa: 9.31,
      targetRole: 'Data Engineering & MLOps Architect',
      department: 'Data Platforms & Feature Store',
      currentStage: 'HIRED',
      priority: 'CRITICAL_MATCH',
      skills: [
        { name: 'Apache Spark & Kafka', category: 'CORE_ENGINEERING', score: 95, verified: true },
        { name: 'Snowflake & dbt Modeling', category: 'DOMAIN_EXPERTISE', score: 93, verified: true },
        { name: 'Feast Feature Store / MLOps', category: 'SYSTEMS_AI', score: 91, verified: true },
        { name: 'Python / PySpark', category: 'CORE_ENGINEERING', score: 96, verified: true }
      ],
      assessment: {
        atsScore: 97,
        codeQualityIndex: 94,
        problemSolvingIndex: 95,
        behavioralScore: 96,
        compositeFitScore: 95.8,
        recommendation: 'STRONG_HIRE',
        keyStrengths: [
          'Accepted offer for Senior Data Platform Engineer role',
          'Perfect score in System Design Assessment for large-scale streaming pipeline'
        ],
        growthAreas: ['Public speaking at tech conferences'],
        hackathonWins: 4,
        openSourceContributions: 62
      },
      telemetry: [
        {
          id: 'tel-601',
          timestamp: new Date(Date.now() - 20 * 86400000).toISOString(),
          actor: 'Campus TPO Gateway',
          actorRole: 'Placement Coordinator',
          action: 'Candidate shortlisted for DTU Day 1 hiring slot'
        },
        {
          id: 'tel-602',
          timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
          actor: 'Managing Director of Engineering',
          actorRole: 'Executive Sponsor',
          action: 'Offer Formally Signed & Onboarding Workflow Initiated',
          stageFrom: 'OFFER_EXTENDED',
          stageTo: 'HIRED'
        }
      ],
      githubUrl: 'https://github.com/tanvi-data-stream',
      linkedinUrl: 'https://linkedin.com/in/tanviagarwal-dtu',
      resumeFileName: 'Tanvi_Agarwal_DTU_DataEng_2026.pdf',
      expectedCtcLpa: 38,
      appliedDate: new Date(Date.now() - 25 * 86400000).toISOString(),
      lastUpdated: new Date().toISOString(),
      tags: ['DTU Gold Scholar', 'Data Pipeline', 'Placed Day-1'],
      notes: ['Candidate completed background checks. Laptop kit shipped.']
    }
  ];

  public static async getCandidates(
    filters?: Partial<PipelineFilterOptions>
  ): Promise<Candidate[]> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let result = [...this.candidatesStore];

    if (!filters) return result;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.college.toLowerCase().includes(q) ||
          c.targetRole.toLowerCase().includes(q) ||
          c.skills.some((s) => s.name.toLowerCase().includes(q)) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters.stage && filters.stage !== 'ALL') {
      result = result.filter((c) => c.currentStage === filters.stage);
    }

    if (filters.priority && filters.priority !== 'ALL') {
      result = result.filter((c) => c.priority === filters.priority);
    }

    if (filters.minAtsScore && filters.minAtsScore > 0) {
      result = result.filter((c) => c.assessment.atsScore >= filters.minAtsScore!);
    }

    if (filters.minGpa && filters.minGpa > 0) {
      result = result.filter((c) => c.gpa >= filters.minGpa!);
    }

    if (filters.selectedCollege) {
      result = result.filter((c) => c.college === filters.selectedCollege);
    }

    if (filters.selectedSkill) {
      result = result.filter((c) =>
        c.skills.some((s) => s.name.toLowerCase().includes(filters.selectedSkill!.toLowerCase()))
      );
    }

    if (filters.sortBy) {
      result.sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (filters.sortBy === 'compositeFit') {
          valA = a.assessment.compositeFitScore;
          valB = b.assessment.compositeFitScore;
        } else if (filters.sortBy === 'atsScore') {
          valA = a.assessment.atsScore;
          valB = b.assessment.atsScore;
        } else if (filters.sortBy === 'gpa') {
          valA = a.gpa;
          valB = b.gpa;
        } else if (filters.sortBy === 'appliedDate') {
          valA = new Date(a.appliedDate).getTime();
          valB = new Date(b.appliedDate).getTime();
        }
        return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }

  public static async getCandidateById(id: string): Promise<Candidate | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.candidatesStore.find((c) => c.id === id) || null;
  }

  public static async updateCandidateStage(
    candidateId: string,
    newStage: PipelineStage,
    actor: string,
    notes?: string
  ): Promise<Candidate> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const index = this.candidatesStore.findIndex((c) => c.id === candidateId);
    if (index === -1) {
      throw new Error(`Candidate with ID ${candidateId} not found.`);
    }

    const candidate = this.candidatesStore[index];
    const prevStage = candidate.currentStage;

    const newTelemetry: any = {
      id: `tel-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      actorRole: 'Talent Reviewer / System Admin',
      action: `Stage transitioned from ${prevStage} to ${newStage}`,
      stageFrom: prevStage,
      stageTo: newStage,
      notes: notes || `Candidate transitioned by ${actor}`
    };

    const updatedCandidate: Candidate = {
      ...candidate,
      currentStage: newStage,
      lastUpdated: new Date().toISOString(),
      telemetry: [newTelemetry, ...candidate.telemetry]
    };

    this.candidatesStore[index] = updatedCandidate;
    return updatedCandidate;
  }

  public static async executeFastTrackPromotion(payload: FastTrackPayload): Promise<Candidate> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const index = this.candidatesStore.findIndex((c) => c.id === payload.candidateId);
    if (index === -1) throw new Error('Candidate not found');

    const candidate = this.candidatesStore[index];
    const log: any = {
      id: `tel-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: payload.approverEmail,
      actorRole: 'Executive Hiring Sponsor',
      action: `⚡ EMERGENCY FAST-TRACK PROTOCOL ACTIVATED to ${payload.immediateStage}`,
      stageFrom: candidate.currentStage,
      stageTo: payload.immediateStage,
      notes: `Justification: ${payload.justification}`
    };

    const updated: Candidate = {
      ...candidate,
      currentStage: payload.immediateStage,
      priority: 'CRITICAL_MATCH',
      lastUpdated: new Date().toISOString(),
      telemetry: [log, ...candidate.telemetry],
      tags: Array.from(new Set([...candidate.tags, 'Fast-Track Protocol', 'Executive Priority']))
    };

    this.candidatesStore[index] = updated;
    return updated;
  }

  public static async addCandidateNote(
    candidateId: string,
    note: string,
    author: string
  ): Promise<Candidate> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = this.candidatesStore.findIndex((c) => c.id === candidateId);
    if (index === -1) throw new Error('Candidate not found');

    const candidate = this.candidatesStore[index];
    const log: any = {
      id: `tel-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: author,
      actorRole: 'Interviewer / Reviewer',
      action: 'Added Interview Review Note',
      notes: note
    };

    const updated: Candidate = {
      ...candidate,
      notes: [note, ...candidate.notes],
      lastUpdated: new Date().toISOString(),
      telemetry: [log, ...candidate.telemetry]
    };

    this.candidatesStore[index] = updated;
    return updated;
  }

  public static async batchPromoteCandidates(
    candidateIds: string[],
    nextStage: PipelineStage,
    actor: string
  ): Promise<Candidate[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const results: Candidate[] = [];
    for (const id of candidateIds) {
      try {
        const updated = await this.updateCandidateStage(
          id,
          nextStage,
          actor,
          'Bulk batch promotion executed from Pipeline Station'
        );
        results.push(updated);
      } catch (err) {
        // continue with other candidates
      }
    }
    return results;
  }

  public static async getAnalyticsSummary(): Promise<PipelineAnalyticsSummary> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const candidates = this.candidatesStore;
    const stageDist: Record<PipelineStage, number> = {
      SOURCED: 0,
      AI_SCREENED: 0,
      TECHNICAL_ASSESSMENT: 0,
      LEADERSHIP_ROUND: 0,
      OFFER_EXTENDED: 0,
      HIRED: 0,
      REJECTED: 0
    };

    let totalScoreSum = 0;
    candidates.forEach((c) => {
      stageDist[c.currentStage] = (stageDist[c.currentStage] || 0) + 1;
      totalScoreSum += c.assessment.compositeFitScore;
    });

    const activeCount = candidates.filter(
      (c) => c.currentStage !== 'HIRED' && c.currentStage !== 'REJECTED'
    ).length;

    const fastTrackCount = candidates.filter(
      (c) => c.priority === 'CRITICAL_MATCH' || c.priority === 'FAST_TRACK'
    ).length;

    const hiredCount = stageDist['HIRED'] || 0;
    const offerCount = stageDist['OFFER_EXTENDED'] || 0;
    const acceptanceRate =
      offerCount + hiredCount > 0 ? (hiredCount / (offerCount + hiredCount)) * 100 : 85.7;

    return {
      totalCandidates: candidates.length,
      activeInPipeline: activeCount,
      fastTrackCount,
      averageDaysToHire: 14.2,
      offerAcceptanceRate: Math.round(acceptanceRate),
      averageCompositeScore: +(totalScoreSum / (candidates.length || 1)).toFixed(1),
      stageDistribution: stageDist,
      topSkillsInDemand: [
        { skill: 'Golang / Rust', count: 18, averageScore: 94 },
        { skill: 'PyTorch / LLMs', count: 24, averageScore: 96 },
        { skill: 'React 19 / TypeScript', count: 32, averageScore: 92 },
        { skill: 'Kubernetes & Cloud', count: 15, averageScore: 89 }
      ],
      campusBreakdown: [
        { campus: 'IIT Bombay', studentCount: 14, averageAtsScore: 96, conversionRate: 78.5 },
        { campus: 'BITS Pilani', studentCount: 12, averageAtsScore: 95, conversionRate: 82.0 },
        { campus: 'IIT Delhi', studentCount: 11, averageAtsScore: 94, conversionRate: 75.0 },
        { campus: 'IIIT Hyderabad', studentCount: 9, averageAtsScore: 97, conversionRate: 88.0 },
        { campus: 'DTU', studentCount: 15, averageAtsScore: 91, conversionRate: 71.4 },
        { campus: 'NIT Trichy', studentCount: 8, averageAtsScore: 89, conversionRate: 66.7 }
      ]
    };
  }

  public static exportTalentRosterCSV(candidates: Candidate[]): string {
    const headers = [
      'Candidate ID',
      'Full Name',
      'Email',
      'College',
      'Target Role',
      'Stage',
      'Priority',
      'GPA',
      'ATS Score',
      'Composite Fit',
      'Expected CTC (LPA)'
    ];

    const rows = candidates.map((c) => [
      c.candidateNumber,
      `"${c.fullName}"`,
      c.email,
      `"${c.college}"`,
      `"${c.targetRole}"`,
      c.currentStage,
      c.priority,
      c.gpa,
      c.assessment.atsScore,
      c.assessment.compositeFitScore,
      c.expectedCtcLpa
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

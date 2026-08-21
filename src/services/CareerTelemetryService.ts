import {
  StudentTelemetryRecord,
  CareerTelemetryAnalytics,
  CareerTelemetryFilter,
  CareerInterventionPayload,
  MockInterviewLog
} from '../types/careerTelemetry';

export class CareerTelemetryService {
  private static telemetryStore: StudentTelemetryRecord[] = [
    {
      id: 'tel-rec-001',
      studentId: 'YH-STU-901',
      fullName: 'Ishaan Verma',
      email: 'ishaan.verma@iitb.ac.in',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      institution: 'IIT Bombay',
      degree: 'B.Tech in Computer Science',
      graduationYear: 2026,
      targetDomain: 'DISTRIBUTED_SYSTEMS',
      riskStatus: 'OPTIMAL',
      employabilityIndex: 96.5,
      atsReadinessScore: 98,
      weeklyStudyHours: 24.5,
      streakDays: 48,
      mockInterviews: [
        {
          id: 'int-001',
          interviewType: 'SYSTEM_DESIGN',
          score: 95,
          feedback: 'Excellent design of distributed cache with Raft consensus. Clear understanding of CAP theorem.',
          interviewer: 'Dr. Anand Kumar (Ex-Google L6)',
          date: new Date(Date.now() - 4 * 86400000).toISOString()
        },
        {
          id: 'int-002',
          interviewType: 'CODING_ALGORITHMS',
          score: 98,
          feedback: 'Optimal solution for Trie-based autocomplete with concurrency locks in under 25 mins.',
          interviewer: 'Pooja Iyer (Staff Engineer @ Uber)',
          date: new Date(Date.now() - 12 * 86400000).toISOString()
        }
      ],
      skills: [
        { skill: 'Golang / Distributed Concurrency', category: 'SYSTEMS', currentMastery: 94, targetMastery: 95, growthVelocity: +12, verifiedCredential: true },
        { skill: 'Kubernetes / Service Mesh', category: 'SYSTEMS', currentMastery: 90, targetMastery: 95, growthVelocity: +8, verifiedCredential: true },
        { skill: 'Data Structures & Algorithms', category: 'CORE', currentMastery: 98, targetMastery: 100, growthVelocity: +4, verifiedCredential: true },
        { skill: 'Cross-functional Communication', category: 'SOFT_SKILL', currentMastery: 88, targetMastery: 90, growthVelocity: +6, verifiedCredential: false }
      ],
      hackathonsAttended: 5,
      bountiesResolved: 14,
      mentorAssigned: 'Prof. S. Ranganathan',
      lastActive: new Date().toISOString(),
      interventionHistory: []
    },
    {
      id: 'tel-rec-002',
      studentId: 'YH-STU-902',
      fullName: 'Meera Nambiar',
      email: 'meera.nambiar@bits-pilani.ac.in',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      institution: 'BITS Pilani',
      degree: 'B.E. Computer Science & M.Sc. Data Science',
      graduationYear: 2026,
      targetDomain: 'AI_MLOPS',
      riskStatus: 'OPTIMAL',
      employabilityIndex: 94.8,
      atsReadinessScore: 96,
      weeklyStudyHours: 28.0,
      streakDays: 62,
      mockInterviews: [
        {
          id: 'int-003',
          interviewType: 'AI_ARCHITECTURE',
          score: 96,
          feedback: 'Superb breakdown of quantization-aware distillation pipelines and GPU VRAM optimization.',
          interviewer: 'Dr. Vivek Sharma (Principal AI Scientist)',
          date: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ],
      skills: [
        { skill: 'PyTorch / TensorRT / Triton', category: 'SYSTEMS', currentMastery: 96, targetMastery: 98, growthVelocity: +15, verifiedCredential: true },
        { skill: 'LLM Fine-tuning (LoRA / QLoRA)', category: 'SYSTEMS', currentMastery: 94, targetMastery: 95, growthVelocity: +18, verifiedCredential: true },
        { skill: 'Vector Databases & LangChain', category: 'SYSTEMS', currentMastery: 91, targetMastery: 95, growthVelocity: +10, verifiedCredential: true },
        { skill: 'Mathematical Statistics & Linear Algebra', category: 'CORE', currentMastery: 98, targetMastery: 100, growthVelocity: +5, verifiedCredential: true }
      ],
      hackathonsAttended: 4,
      bountiesResolved: 8,
      mentorAssigned: 'Dr. Vivek Sharma',
      lastActive: new Date(Date.now() - 1 * 86400000).toISOString(),
      interventionHistory: []
    },
    {
      id: 'tel-rec-003',
      studentId: 'YH-STU-903',
      fullName: 'Kabir Sengupta',
      email: 'kabir.sengupta@iitd.ac.in',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      institution: 'IIT Delhi',
      degree: 'B.Tech in Information Technology',
      graduationYear: 2026,
      targetDomain: 'FULLSTACK_CLOUD',
      riskStatus: 'ON_TRACK',
      employabilityIndex: 88.2,
      atsReadinessScore: 89,
      weeklyStudyHours: 19.5,
      streakDays: 24,
      mockInterviews: [
        {
          id: 'int-004',
          interviewType: 'CODING_ALGORITHMS',
          score: 85,
          feedback: 'Good problem-solving logic. Recommended deeper practice on Graph Tarjan algorithms.',
          interviewer: 'Sunil Nair (Engineering Lead)',
          date: new Date(Date.now() - 8 * 86400000).toISOString()
        }
      ],
      skills: [
        { skill: 'React 19 & TypeScript', category: 'CORE', currentMastery: 90, targetMastery: 95, growthVelocity: +10, verifiedCredential: true },
        { skill: 'Node.js / GraphQL APIs', category: 'CORE', currentMastery: 86, targetMastery: 90, growthVelocity: +8, verifiedCredential: true },
        { skill: 'Docker / AWS ECS Deployment', category: 'SYSTEMS', currentMastery: 82, targetMastery: 90, growthVelocity: +12, verifiedCredential: false }
      ],
      hackathonsAttended: 2,
      bountiesResolved: 5,
      lastActive: new Date(Date.now() - 2 * 86400000).toISOString(),
      interventionHistory: []
    },
    {
      id: 'tel-rec-004',
      studentId: 'YH-STU-904',
      fullName: 'Sneha Patel',
      email: 'sneha.patel@iiit.ac.in',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      institution: 'IIIT Hyderabad',
      degree: 'B.Tech in Computer Science',
      graduationYear: 2026,
      targetDomain: 'CYBERSECURITY_INFRA',
      riskStatus: 'AT_RISK',
      employabilityIndex: 72.4,
      atsReadinessScore: 75,
      weeklyStudyHours: 8.5,
      streakDays: 3,
      mockInterviews: [
        {
          id: 'int-005',
          interviewType: 'SYSTEM_DESIGN',
          score: 68,
          feedback: 'Struggled with OAuth2 PKCE flow and TLS mutual authentication handshakes.',
          interviewer: 'Rohit Kulkarni (Security Architect)',
          date: new Date(Date.now() - 6 * 86400000).toISOString()
        }
      ],
      skills: [
        { skill: 'Network Security & PKI', category: 'SYSTEMS', currentMastery: 74, targetMastery: 90, growthVelocity: -2, verifiedCredential: false },
        { skill: 'Rust Secure Coding', category: 'CORE', currentMastery: 70, targetMastery: 85, growthVelocity: +4, verifiedCredential: false }
      ],
      hackathonsAttended: 1,
      bountiesResolved: 2,
      lastActive: new Date(Date.now() - 5 * 86400000).toISOString(),
      interventionHistory: [
        {
          id: 'intv-001',
          protocol: 'SKILL_GAP_SPRINT',
          initiatedBy: 'Academic Advisor TPO',
          timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
          notes: 'Identified 35% study hours deficit and lagging security mock interview scores.'
        }
      ]
    },
    {
      id: 'tel-rec-005',
      studentId: 'YH-STU-905',
      fullName: 'Aditya Mukhopadhyay',
      email: 'aditya.m@dtu.ac.in',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      institution: 'DTU',
      degree: 'B.Tech in Software Engineering',
      graduationYear: 2026,
      targetDomain: 'DATA_ENGINEERING',
      riskStatus: 'CRITICAL_INTERVENTION',
      employabilityIndex: 61.2,
      atsReadinessScore: 64,
      weeklyStudyHours: 4.0,
      streakDays: 0,
      mockInterviews: [],
      skills: [
        { skill: 'Apache Spark & PySpark', category: 'SYSTEMS', currentMastery: 62, targetMastery: 88, growthVelocity: -5, verifiedCredential: false },
        { skill: 'SQL & Data Warehousing', category: 'CORE', currentMastery: 68, targetMastery: 90, growthVelocity: +2, verifiedCredential: false }
      ],
      hackathonsAttended: 0,
      bountiesResolved: 0,
      lastActive: new Date(Date.now() - 10 * 86400000).toISOString(),
      interventionHistory: []
    }
  ];

  public static async getStudentTelemetry(
    filters?: Partial<CareerTelemetryFilter>
  ): Promise<StudentTelemetryRecord[]> {
    await new Promise((r) => setTimeout(r, 300));
    let records = [...this.telemetryStore];

    if (!filters) return records;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      records = records.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.institution.toLowerCase().includes(q) ||
          r.targetDomain.toLowerCase().includes(q) ||
          r.studentId.toLowerCase().includes(q)
      );
    }

    if (filters.domain && filters.domain !== 'ALL') {
      records = records.filter((r) => r.targetDomain === filters.domain);
    }

    if (filters.riskStatus && filters.riskStatus !== 'ALL') {
      records = records.filter((r) => r.riskStatus === filters.riskStatus);
    }

    if (filters.institution) {
      records = records.filter((r) => r.institution === filters.institution);
    }

    if (filters.minEmployabilityIndex && filters.minEmployabilityIndex > 0) {
      records = records.filter((r) => r.employabilityIndex >= filters.minEmployabilityIndex!);
    }

    if (filters.sortBy) {
      records.sort((a, b) => {
        let valA = 0;
        let valB = 0;
        if (filters.sortBy === 'employabilityIndex') {
          valA = a.employabilityIndex;
          valB = b.employabilityIndex;
        } else if (filters.sortBy === 'weeklyHours') {
          valA = a.weeklyStudyHours;
          valB = b.weeklyStudyHours;
        } else if (filters.sortBy === 'streak') {
          valA = a.streakDays;
          valB = b.streakDays;
        } else if (filters.sortBy === 'atsScore') {
          valA = a.atsReadinessScore;
          valB = b.atsReadinessScore;
        }
        return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return records;
  }

  public static async executeCareerIntervention(
    payload: CareerInterventionPayload
  ): Promise<StudentTelemetryRecord> {
    await new Promise((r) => setTimeout(r, 400));
    const index = this.telemetryStore.findIndex((s) => s.id === payload.studentId);
    if (index === -1) throw new Error('Student telemetry record not found');

    const target = this.telemetryStore[index];
    const newIntervention = {
      id: `intv-${Date.now()}`,
      protocol: payload.protocolType,
      initiatedBy: payload.initiator,
      timestamp: new Date().toISOString(),
      notes: `Assigned Mentor: ${payload.assignedMentor}. Justification: ${payload.justification}`
    };

    const updated: StudentTelemetryRecord = {
      ...target,
      riskStatus: 'ON_TRACK',
      mentorAssigned: payload.assignedMentor,
      interventionHistory: [newIntervention, ...target.interventionHistory],
      weeklyStudyHours: Math.max(target.weeklyStudyHours, 16.0)
    };

    this.telemetryStore[index] = updated;
    return updated;
  }

  public static async addMockInterview(
    studentId: string,
    interview: Omit<MockInterviewLog, 'id' | 'date'>
  ): Promise<StudentTelemetryRecord> {
    await new Promise((r) => setTimeout(r, 350));
    const index = this.telemetryStore.findIndex((s) => s.id === studentId);
    if (index === -1) throw new Error('Student record not found');

    const student = this.telemetryStore[index];
    const newLog: MockInterviewLog = {
      ...interview,
      id: `int-${Date.now()}`,
      date: new Date().toISOString()
    };

    // Recalculate employability index
    const totalScore = student.mockInterviews.reduce((acc, curr) => acc + curr.score, newLog.score);
    const avgInterview = totalScore / (student.mockInterviews.length + 1);
    const updatedEmployability = Math.round((student.employabilityIndex * 0.7 + avgInterview * 0.3) * 10) / 10;

    const updated: StudentTelemetryRecord = {
      ...student,
      mockInterviews: [newLog, ...student.mockInterviews],
      employabilityIndex: updatedEmployability,
      riskStatus: updatedEmployability >= 85 ? 'OPTIMAL' : updatedEmployability >= 70 ? 'ON_TRACK' : 'AT_RISK'
    };

    this.telemetryStore[index] = updated;
    return updated;
  }

  public static async getAnalytics(): Promise<CareerTelemetryAnalytics> {
    await new Promise((r) => setTimeout(r, 250));
    const list = this.telemetryStore;

    const highCount = list.filter((s) => s.employabilityIndex >= 85).length;
    const atRisk = list.filter((s) => s.riskStatus === 'AT_RISK' || s.riskStatus === 'CRITICAL_INTERVENTION').length;
    const avgScore = list.reduce((acc, s) => acc + s.employabilityIndex, 0) / (list.length || 1);
    const avgHours = list.reduce((acc, s) => acc + s.weeklyStudyHours, 0) / (list.length || 1);

    return {
      totalMonitoredStudents: list.length,
      highEmployabilityCount: highCount,
      atRiskCount: atRisk,
      averageEmployabilityScore: Math.round(avgScore * 10) / 10,
      averageWeeklyStudyHours: Math.round(avgHours * 10) / 10,
      mockInterviewPassingRate: 91.4,
      domainDistribution: [
        { domain: 'DISTRIBUTED_SYSTEMS', count: 18, averageScore: 94.2 },
        { domain: 'AI_MLOPS', count: 26, averageScore: 93.8 },
        { domain: 'FULLSTACK_CLOUD', count: 34, averageScore: 89.0 },
        { domain: 'CYBERSECURITY_INFRA', count: 12, averageScore: 84.5 },
        { domain: 'DATA_ENGINEERING', count: 15, averageScore: 81.2 }
      ],
      institutionVelocity: [
        { institution: 'IIT Bombay', averageIndex: 96.2, studentCount: 14 },
        { institution: 'BITS Pilani', averageIndex: 94.5, studentCount: 12 },
        { institution: 'IIT Delhi', averageIndex: 92.8, studentCount: 11 },
        { institution: 'IIIT Hyderabad', averageIndex: 93.4, studentCount: 9 },
        { institution: 'DTU', averageIndex: 86.7, studentCount: 15 }
      ]
    };
  }

  public static exportCSV(records: StudentTelemetryRecord[]): string {
    const headers = [
      'Student ID',
      'Full Name',
      'Institution',
      'Degree',
      'Target Domain',
      'Employability Index',
      'ATS Score',
      'Weekly Hours',
      'Streak Days',
      'Risk Status',
      'Assigned Mentor'
    ];

    const rows = records.map((r) => [
      r.studentId,
      `"${r.fullName}"`,
      `"${r.institution}"`,
      `"${r.degree}"`,
      r.targetDomain,
      r.employabilityIndex,
      r.atsReadinessScore,
      r.weeklyStudyHours,
      r.streakDays,
      r.riskStatus,
      `"${r.mentorAssigned || 'Unassigned'}"`
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

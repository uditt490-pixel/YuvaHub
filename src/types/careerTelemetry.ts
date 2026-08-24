export type TelemetryRiskStatus = 'OPTIMAL' | 'ON_TRACK' | 'AT_RISK' | 'CRITICAL_INTERVENTION';

export type CareerDomain =
  | 'DISTRIBUTED_SYSTEMS'
  | 'AI_MLOPS'
  | 'FULLSTACK_CLOUD'
  | 'CYBERSECURITY_INFRA'
  | 'DATA_ENGINEERING'
  | 'EMBEDDED_IOT';

export interface SkillProgressMetric {
  skill: string;
  category: 'CORE' | 'SYSTEMS' | 'SOFT_SKILL' | 'LEADERSHIP';
  currentMastery: number; // 0 - 100
  targetMastery: number; // 0 - 100
  growthVelocity: number; // % change per month
  verifiedCredential: boolean;
}

export interface MockInterviewLog {
  id: string;
  interviewType: 'SYSTEM_DESIGN' | 'CODING_ALGORITHMS' | 'BEHAVIORAL_LEADERSHIP' | 'AI_ARCHITECTURE';
  score: number; // 0 - 100
  feedback: string;
  interviewer: string;
  date: string;
}

export interface StudentTelemetryRecord {
  id: string;
  studentId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  institution: string;
  degree: string;
  graduationYear: number;
  targetDomain: CareerDomain;
  riskStatus: TelemetryRiskStatus;
  employabilityIndex: number; // 0 - 100
  atsReadinessScore: number; // 0 - 100
  weeklyStudyHours: number;
  streakDays: number;
  mockInterviews: MockInterviewLog[];
  skills: SkillProgressMetric[];
  hackathonsAttended: number;
  bountiesResolved: number;
  mentorAssigned?: string;
  lastActive: string;
  interventionHistory: {
    id: string;
    protocol: string;
    initiatedBy: string;
    timestamp: string;
    notes: string;
  }[];
}

export interface CareerTelemetryAnalytics {
  totalMonitoredStudents: number;
  highEmployabilityCount: number;
  atRiskCount: number;
  averageEmployabilityScore: number;
  averageWeeklyStudyHours: number;
  mockInterviewPassingRate: number;
  domainDistribution: { domain: CareerDomain; count: number; averageScore: number }[];
  institutionVelocity: { institution: string; averageIndex: number; studentCount: number }[];
}

export interface CareerTelemetryFilter {
  searchQuery: string;
  domain: CareerDomain | 'ALL';
  riskStatus: TelemetryRiskStatus | 'ALL';
  institution: string;
  minEmployabilityIndex: number;
  sortBy: 'employabilityIndex' | 'weeklyHours' | 'streak' | 'atsScore';
  sortOrder: 'asc' | 'desc';
}

export interface CareerInterventionPayload {
  studentId: string;
  protocolType: 'INTENSIVE_MENTORSHIP' | 'MOCK_INTERVIEW_ACCELERATOR' | 'SKILL_GAP_SPRINT' | 'PORTFOLIO_REVAMP';
  assignedMentor: string;
  justification: string;
  initiator: string;
}

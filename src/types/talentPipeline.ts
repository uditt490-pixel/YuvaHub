export type PipelineStage =
  | 'SOURCED'
  | 'AI_SCREENED'
  | 'TECHNICAL_ASSESSMENT'
  | 'LEADERSHIP_ROUND'
  | 'OFFER_EXTENDED'
  | 'HIRED'
  | 'REJECTED';

export type CandidatePriority = 'CRITICAL_MATCH' | 'HIGH_POTENTIAL' | 'STANDARD' | 'FAST_TRACK';

export interface SkillCompetency {
  name: string;
  category: 'CORE_ENGINEERING' | 'SYSTEMS_AI' | 'SOFT_SKILLS' | 'DOMAIN_EXPERTISE';
  score: number; // 0-100
  verified: boolean;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  stageFrom?: PipelineStage;
  stageTo?: PipelineStage;
  notes?: string;
}

export interface AIAssessmentReport {
  atsScore: number;
  codeQualityIndex: number;
  problemSolvingIndex: number;
  behavioralScore: number;
  compositeFitScore: number;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'LEAN_HIRE' | 'HOLD' | 'REJECT';
  keyStrengths: string[];
  growthAreas: string[];
  hackathonWins: number;
  openSourceContributions: number;
}

export interface Candidate {
  id: string;
  candidateNumber: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  college: string;
  degree: string;
  graduationYear: number;
  gpa: number;
  targetRole: string;
  department: string;
  currentStage: PipelineStage;
  priority: CandidatePriority;
  skills: SkillCompetency[];
  assessment: AIAssessmentReport;
  telemetry: TelemetryLog[];
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl?: string;
  resumeFileName: string;
  expectedCtcLpa: number;
  appliedDate: string;
  lastUpdated: string;
  tags: string[];
  notes: string[];
}

export interface PipelineAnalyticsSummary {
  totalCandidates: number;
  activeInPipeline: number;
  fastTrackCount: number;
  averageDaysToHire: number;
  offerAcceptanceRate: number;
  averageCompositeScore: number;
  stageDistribution: Record<PipelineStage, number>;
  topSkillsInDemand: { skill: string; count: number; averageScore: number }[];
  campusBreakdown: { campus: string; studentCount: number; averageAtsScore: number; conversionRate: number }[];
}

export interface PipelineFilterOptions {
  searchQuery: string;
  stage: PipelineStage | 'ALL';
  priority: CandidatePriority | 'ALL';
  minAtsScore: number;
  minGpa: number;
  selectedCollege: string;
  selectedSkill: string;
  sortBy: 'compositeFit' | 'appliedDate' | 'gpa' | 'atsScore';
  sortOrder: 'asc' | 'desc';
}

export interface FastTrackPayload {
  candidateId: string;
  immediateStage: PipelineStage;
  justification: string;
  approverEmail: string;
}

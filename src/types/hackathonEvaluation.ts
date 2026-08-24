export type HackathonTrack =
  | 'AI_HEALTHCARE'
  | 'FINTECH_WEB3'
  | 'EDTECH_STUDENT_TOOLS'
  | 'CYBERSECURITY_ZERO_TRUST'
  | 'SMART_MOBILITY_IOT'
  | 'OPEN_INNOVATION';

export type EvaluationStatus =
  | 'UNEVALUATED'
  | 'SCORING_IN_PROGRESS'
  | 'EVALUATION_COMPLETED'
  | 'FLAGGED_PLAGIARISM'
  | 'WINNER_SELECTED';

export interface RubricScoreItem {
  criterion: string;
  weightPercentage: number;
  score: number; // 0 - 10
  maxScore: number;
  judgeRemarks?: string;
}

export interface JudgeReview {
  id: string;
  judgeName: string;
  judgeTitle: string;
  avatarUrl: string;
  rubricScores: RubricScoreItem[];
  compositeScore: number; // 0 - 100
  recommendation: 'TOP_FINALIST' | 'STRONG_CONTENDER' | 'STANDARD_PASS' | 'DISQUALIFY';
  writtenCritique: string;
  reviewedAt: string;
}

export interface PlagiarismReport {
  overallSimilarityIndex: number; // 0 - 100
  aiGeneratedCodeConfidence: number; // 0 - 100
  suspiciousFileCount: number;
  matchedPublicRepositories: string[];
  isFlagged: boolean;
}

export interface HackathonProjectSubmission {
  id: string;
  projectCode: string;
  title: string;
  tagline: string;
  description: string;
  teamName: string;
  teamLead: string;
  teamLeadEmail: string;
  college: string;
  track: HackathonTrack;
  status: EvaluationStatus;
  githubUrl: string;
  demoVideoUrl?: string;
  liveDeployUrl?: string;
  techStack: string[];
  commitCount: number;
  compositeJudgeScore: number; // 0 - 100
  reviews: JudgeReview[];
  plagiarism: PlagiarismReport;
  submittedAt: string;
  prizeTrack?: string;
}

export interface HackathonAnalyticsSummary {
  totalSubmissions: number;
  evaluatedSubmissions: number;
  averageScore: number;
  flaggedPlagiarismCount: number;
  shortlistedFinalistsCount: number;
  trackBreakdown: { track: HackathonTrack; projectCount: number; averageScore: number }[];
  collegeRankings: { college: string; totalProjects: number; topScore: number }[];
}

export interface HackathonFilterOptions {
  searchQuery: string;
  track: HackathonTrack | 'ALL';
  status: EvaluationStatus | 'ALL';
  college: string;
  minScore: number;
  sortBy: 'score' | 'submittedAt' | 'commits';
  sortOrder: 'asc' | 'desc';
}

export interface PlagiarismQuarantinePayload {
  projectId: string;
  justification: string;
  leadJudgeEmail: string;
}

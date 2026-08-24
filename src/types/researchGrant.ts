export type GrantCategory =
  | 'AI_BIOTECH_RESEARCH'
  | 'QUANTUM_COMPUTING'
  | 'CLEANTECH_ENERGY'
  | 'SEMICONDUCTOR_VLSI'
  | 'NEUROSCIENCE_COGNITIVE';

export type GrantStatus =
  | 'DRAFTING'
  | 'PEER_REVIEW'
  | 'INSTITUTIONAL_APPROVAL'
  | 'FUNDS_DISBURSED'
  | 'AUDIT_FLAGGED';

export interface MilestoneItem {
  id: string;
  milestoneTitle: string;
  targetMonth: number;
  allocatedAmountLakhs: number;
  deliverablesSummary: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface PeerReviewScorecard {
  id: string;
  reviewerName: string;
  reviewerTitle: string;
  scientificMeritScore: number; // 0 - 10
  commercialFeasibilityScore: number; // 0 - 10
  methodologyRigorScore: number; // 0 - 10
  overallRecommendation: 'STRONGLY_FUND' | 'FUND_WITH_CONDITIONS' | 'REVISE_RESUBMIT' | 'REJECT';
  writtenEvaluation: string;
  reviewedAt: string;
}

export interface ResearchProposal {
  id: string;
  grantCode: string;
  title: string;
  abstract: string;
  principalInvestigator: string;
  piEmail: string;
  college: string;
  department: string;
  category: GrantCategory;
  requestedGrantLakhs: number;
  disbursedGrantLakhs: number;
  durationMonths: number;
  status: GrantStatus;
  compositeReviewScore: number; // 0 - 100
  milestones: MilestoneItem[];
  peerReviews: PeerReviewScorecard[];
  submittedAt: string;
  irbApprovalCode?: string;
}

export interface GrantAnalytics {
  totalRequestedCapitalLakhs: number;
  totalDisbursedCapitalLakhs: number;
  activeProposals: number;
  fundedProposalsCount: number;
  averageScientificScore: number;
  auditComplianceRate: number;
  categoryDistribution: { category: GrantCategory; proposalCount: number; capitalLakhs: number }[];
  institutionAllocations: { college: string; awardedCapitalLakhs: number; projectCount: number }[];
}

export interface ResearchGrantFilterOptions {
  searchQuery: string;
  category: GrantCategory | 'ALL';
  status: GrantStatus | 'ALL';
  college: string;
  minScore: number;
  sortBy: 'score' | 'grantAmount' | 'submittedAt';
  sortOrder: 'asc' | 'desc';
}

export interface GrantDisbursementPayload {
  proposalId: string;
  milestoneId: string;
  disbursementAmountLakhs: number;
  approverEmail: string;
  complianceDeclaration: string;
}

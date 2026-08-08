export interface EligibilityBreakdown {
  skills: {
    score: number;
    matched: string[];
    missing: string[];
  };
  education: {
    score: number;
    matched: string[];
    missing: string[];
  };
  experience: {
    score: number;
    matched: string[];
    missing: string[];
  };
  projects: {
    score: number;
    matched: string[];
    missing: string[];
  };
  certifications: {
    score: number;
    matched: string[];
    missing: string[];
  };
}

export interface EligibilityPrediction {
  _id?: string;
  userId: string;
  opportunityId: string;
  successScore: number;
  breakdown: EligibilityBreakdown;
  reasons: string[];
  recommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}
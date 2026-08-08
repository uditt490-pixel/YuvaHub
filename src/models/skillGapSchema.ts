export interface SkillGapItem {
  skill: string;
  category: "technical" | "soft";
  priority: "high" | "medium" | "low";
  reason: string;
  completed: boolean;
}

export interface LearningRoadmapItem {
  skill: string;
  priority: "high" | "medium" | "low";
  estimatedWeeks: number;
  resources: string[];
  project: string;
  completed: boolean;
}

export interface SkillGapAnalysis {
  userId: string;
  opportunityId?: string;
  opportunityTitle?: string;

  matchPercentage: number;

  existingSkills: string[];
  missingSkills: SkillGapItem[];

  roadmap: LearningRoadmapItem[];

  createdAt: Date;
  updatedAt: Date;
}
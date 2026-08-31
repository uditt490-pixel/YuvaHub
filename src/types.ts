export type ApplicationStatus = 'Interested' | 'Applied' | 'Rejected' | 'Selected';

export interface Opportunity {
  id: string;
  type: string;
  title: string;
  organization: string;
  description: string;
  location: string;
  deadline: string; // ISO date string
  link: string;
  tags: string[];
  contactEmail: string;
  status: 'pending_review' | 'active' | 'closed';
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  college?: string;
  year?: string;
  field?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  resumeUrl?: string;
  resumePublicId?: string;
  coverLetterUrl?: string;
  coverLetterPublicId?: string;
  onboarded?: boolean;
  bookmarks?: string[];
  fcmToken?: string;
  notificationPreferences?: NotificationPreferences;
  education?: Education[];
  workExperience?: WorkExperience[];
  canonicalSkills?: string[];
  interests?: string[];
  recommendationPreferences?: RecommendationPreferences;
  profileCompleteness?: number;
  points?: number;
  badges?: string[];
  isPublicProfile?: boolean;
  role?: 'student' | 'alumni' | 'employer' | string;
  current_role?: string;
  graduation_year?: number | string | null;
  current_company?: string;
  alumni_status?: boolean;
  is_open_to_mentoring?: boolean;
  mentoring_interests?: string[];
  alumni_profile_bio?: string;
  verified_skills?: string[];
  verifiedSkills?: string[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface QuizSubmission {
  skill: string;
  answers: { questionId: string; selectedOptionIndex: number }[];
}

export interface QuizResult {
  passed: boolean;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  badgeAwarded: boolean;
  message: string;
}

export interface RecommendationPreferences {
  targetRole: string;
  preferredLocations: string[];
  remoteOnly: boolean;
  minStipend: number;
  preferredTypes: string[];
  minMatchScore: number;
}

export interface MatchDetails {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  aiExplanation?: string;
  typeMatch?: boolean;
  locationMatch?: boolean;
  completenessBonus?: number;
}

export interface RecommendationInteraction {
  id?: string;
  userId: string;
  opportunityId: string;
  interactionType: 'view' | 'save' | 'apply' | 'dismiss';
  tags: string[];
  opportunityType: string;
  timestamp: Date | string | number;
}

export interface ResumeItem {
  id: string;
  userId: string;
  displayName: string;
  originalFileName: string;
  fileUrl: string;
  publicId?: string;
  uploadedAt: string | Date;
  updatedAt?: string | Date;
  isDefault: boolean;
}

export interface Education {
  degree: string;
  institution: string;
  dates: string;
  gpa?: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  dates: string;
  impact: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  deadlineRemindersEnabled: boolean;
  skillAlertsEnabled: boolean;
  scholarshipAlertsEnabled: boolean;
  hackathonAlertsEnabled: boolean;
  opportunityAlertsEnabled: boolean;
}


export interface MentorApplication {
  id: string;
  name: string;
  linkedinUrl: string;
  collegeCompany: string;
  field: string;
  experience: number;
  availability: string[];
  whyMentor: string;
  status: 'pending' | 'approved';
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Bounty {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  tags: string[];
  reward: number;
  status: 'open' | 'accepted' | 'resolved';
  posterId: string;
  posterName: string;
  mentorId?: string;
  mentorName?: string;
  createdAt: number;
  updatedAt: number;
}

export interface KarmaTransaction {
  _id?: string;
  userId: string;
  amount: number;
  type: 'daily_login' | 'bounty_post' | 'bounty_reward' | 'profile_setup' | 'expired_report' | 'other';
  timestamp: number;
  metadata?: any;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarUrl?: string;
  reputation: number;
  karmaEarned: number;
  bountiesResolved: number;
}

export interface InAppNotification {
  id?: string;
  _id?: string;
  userId: string;
  type: 'team_invite' | 'forum_reply' | 'mentorship_request' | 'system' | string;
  content: string;
  link?: string;
  isRead: boolean;
  read?: boolean;
  createdAt: Date | string | number;
}

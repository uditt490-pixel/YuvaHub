export type ApplicationStatus = 'Interested' | 'Applied' | 'Rejected' | 'Selected';

export interface Opportunity {
  id: string;
  type: string;
  title: string;
  organization: string;
  description: string;
  location: string;
  deadline: string; // ISO date string
  startDate?: string;
  endDate?: string;
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

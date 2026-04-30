export interface Event {
  id: string;
  title: string;
  organization: string;
  type: 'hackathon' | 'scheme' | 'program';
  description: string;
  location: string;
  date: string;
  link: string;
  applyLink?: string;
  price?: string;
  isPaid: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  language?: string;
  field?: string;
  industry?: string;
  eligibility?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export type ApplicationStatus = 'Interested' | 'Applied' | 'Rejected' | 'Selected';

export interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dob?: string;
  college?: string;
  skills?: string[];
  location: string;
  age: number | '';
  interests?: string[];
  notificationsEnabled: boolean;
  bookmarkedEventIds?: string[];
  registeredEventIds?: string[];
  messages?: Message[];
  // New Onboarding & Filtering Fields
  onboardingComplete?: boolean;
  currentClass?: string;
  grades?: string;
  fieldOfStudy?: string;
  preferredLanguage?: string;
  budgetPreference?: 'free' | 'paid' | 'any';
  deadlinePreference?: 'any' | 'next-7-days' | 'next-30-days';
  preferredDomains?: string[];
}

export interface Message {
  id: string;
  sender: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface UserRegistration {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  userPhone?: string;
  userAddress?: string;
  userDob?: string;
  userCollege?: string;
  userSkills?: string[];
  userLocation: string;
  userAge: number | '';
  eventId: string;
  eventTitle: string;
  registeredAt: any;
  // Tracker Fields
  status: ApplicationStatus;
  dueDate?: string;
  checklist?: { item: string; completed: boolean }[];
  notes?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'new_event' | 'deadline' | 'system';
  link?: string;
  eventId?: string; // To allow navigating to detail
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isSuggestedOpportunity?: boolean;
}

export interface RelatedDomain {
  title: string;
  description: string;
  relevance: string;
  marketTrend: string;
}

export interface RelatedDomains {
  topic: string;
  domains: RelatedDomain[];
}

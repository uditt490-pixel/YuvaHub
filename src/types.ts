export interface Event {
  id: string;
  title: string;
  organization: string;
  type: 'hackathon' | 'scheme' | 'program';
  description: string;
  location: string;
  date: string;
  link: string;
  price?: string; // e.g., "Free", "Paid", "₹500"
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface UserProfile {
  location: string;
  age: number | '';
  interests: string[];
  notificationsEnabled: boolean;
  bookmarkedEventIds?: string[];
  registeredEventIds?: string[];
  messages?: Message[];
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
  userLocation: string;
  userAge: number | '';
  eventId: string;
  eventTitle: string;
  registeredAt: any;
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
}

export interface TopicDeepDive {
  topic: string;
  summary: string;
  keySkills: string[];
  trendingOpportunities: { title: string; desc: string }[];
  marketOutlook: string;
  relatedTags: string[];
}

import {
  BrainCircuit,
  Search,
  Users,
  Trophy,
  Zap,
  Code2,
  Database,
  Globe,
  Shield,
  Layers,
  Bot,
  Filter,
  Bell,
  Sparkles,
  Target,
  GitBranch,
  HeartHandshake,
} from 'lucide-react';
import type {
  FeatureCard,
  ArchitectureNode,
  AgentStep,
  TechItem,
  PhilosophyPrinciple,
  StatHighlight,
} from './types';

// ─── Platform feature cards ───────────────────────────────────────────────────
export const FEATURE_CARDS: FeatureCard[] = [
  {
    icon: Search,
    title: 'Smart Discovery',
    description:
      'AI-powered opportunity discovery that surfaces internships, hackathons, scholarships, and jobs matched to your skills and goals.',
    colorClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    icon: BrainCircuit,
    title: 'AI Mentorship',
    description:
      'Gemini-powered AI assistant helps you write applications, prepare for interviews, and plan your career path.',
    colorClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  },
  {
    icon: Users,
    title: 'Peer Community',
    description:
      'Connect with thousands of Indian students across domains. Share tips, form teams, and collaborate on projects.',
    colorClass: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  },
  {
    icon: Trophy,
    title: 'Competition Hub',
    description:
      'Browse and register for hackathons, case competitions, quizzes, and cultural events — all in one place.',
    colorClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  {
    icon: Bell,
    title: 'Real-Time Alerts',
    description:
      'Never miss a deadline. Get push and email notifications for new opportunities matching your profile.',
    colorClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  },
  {
    icon: HeartHandshake,
    title: 'Mentorship Network',
    description:
      'Get paired with industry professionals and alumni who can guide your journey from campus to career.',
    colorClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  },
];

// ─── Platform architecture nodes ──────────────────────────────────────────────
export const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    label: 'React Frontend',
    description: 'React 19 + Vite SPA with Tailwind v4, Motion animations, and full dark-mode support.',
    icon: Layers,
    colorClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  },
  {
    label: 'Express API',
    description: 'Node/Express backend with rate-limiting, Firebase Auth, and typed route handlers.',
    icon: Code2,
    colorClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  {
    label: 'AI Layer',
    description: 'Google Gemini powers the Apply Assist, AI mentorship chat, and intelligent query parsing.',
    icon: BrainCircuit,
    colorClass: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  },
  {
    label: 'MongoDB Atlas',
    description: 'Document store for opportunities, user profiles, bookmarks, and community posts.',
    icon: Database,
    colorClass: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  {
    label: 'Firebase',
    description: 'Google & GitHub OAuth, Firestore for real-time feeds, and Cloud Messaging for push alerts.',
    icon: Shield,
    colorClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  },
  {
    label: 'Scraping Pipeline',
    description: 'Multi-source scrapers aggregate opportunities across Devpost, LinkedIn, Internshala, and more.',
    icon: Globe,
    colorClass: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  },
];

// ─── Multi-agent workflow steps ───────────────────────────────────────────────
export const AGENT_STEPS: AgentStep[] = [
  {
    step: 1,
    agent: 'Discovery Agent',
    action: 'Scrapes & validates opportunities across 20+ sources every hour',
    output: 'Normalised opportunity objects stored in MongoDB',
    colorClass: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
  },
  {
    step: 2,
    agent: 'Enrichment Agent',
    action: 'Calls Gemini to generate summaries, eligibility tags, and skill keywords',
    output: 'Enriched metadata attached to each document',
    colorClass: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
  },
  {
    step: 3,
    agent: 'Filter Agent',
    action: 'Matches enriched data against each user\'s profile, skills, and preferences',
    output: 'Personalised ranked feed per user',
    colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800',
  },
  {
    step: 4,
    agent: 'Notification Agent',
    action: 'Sends push + email digests for high-relevance matches and upcoming deadlines',
    output: 'Timely alerts delivered via Firebase & BullMQ',
    colorClass: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  },
  {
    step: 5,
    agent: 'Apply Assist Agent',
    action: 'Generates tailored cover letters and application drafts on user request',
    output: 'Ready-to-use application text powered by Gemini',
    colorClass: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
  },
];

// ─── Technology stack items ───────────────────────────────────────────────────
export const TECH_STACK: TechItem[] = [
  { name: 'React 19', role: 'UI Framework', colorClass: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' },
  { name: 'TypeScript', role: 'Type Safety', colorClass: 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-800' },
  { name: 'Vite', role: 'Build Tool', colorClass: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800' },
  { name: 'Tailwind v4', role: 'Styling', colorClass: 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800' },
  { name: 'Motion', role: 'Animations', colorClass: 'bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-900/20 dark:text-pink-300 dark:border-pink-800' },
  { name: 'Express', role: 'API Server', colorClass: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  { name: 'MongoDB', role: 'Database', colorClass: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' },
  { name: 'Firebase', role: 'Auth & Push', colorClass: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800' },
  { name: 'Google Gemini', role: 'AI / LLM', colorClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800' },
  { name: 'BullMQ', role: 'Job Queues', colorClass: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' },
  { name: 'Redis', role: 'Queue Broker', colorClass: 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800' },
  { name: 'Meilisearch', role: 'Full-Text Search', colorClass: 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800' },
];

// ─── Development philosophy principles ───────────────────────────────────────
export const PHILOSOPHY_PRINCIPLES: PhilosophyPrinciple[] = [
  {
    icon: Code2,
    title: 'Open Source First',
    description: 'Every line of code is public and welcomes community contributions. We believe transparent development builds better software.',
  },
  {
    icon: Zap,
    title: 'Performance Matters',
    description: 'From lazy-loaded routes to optimistic UI updates, we treat performance as a feature — not an afterthought.',
  },
  {
    icon: Shield,
    title: 'Security by Default',
    description: 'Rate limiting, Firebase Auth, input validation, and Firestore rules ensure user data is always protected.',
  },
  {
    icon: Target,
    title: 'Student-Centric Design',
    description: 'Every decision is filtered through one question: does this help an Indian student find their next big opportunity?',
  },
  {
    icon: GitBranch,
    title: 'Modular Architecture',
    description: 'Small, single-responsibility components and services make the codebase approachable for contributors at every level.',
  },
  {
    icon: Sparkles,
    title: 'AI-Augmented',
    description: 'We use AI where it adds real value — discovery, enrichment, and assistance — without replacing human judgement.',
  },
];

// ─── Platform highlight stats ─────────────────────────────────────────────────
export const PLATFORM_HIGHLIGHTS: StatHighlight[] = [
  { value: '5M+', label: 'Students Served' },
  { value: '100k+', label: 'Opportunities Listed' },
  { value: '2k+', label: 'Partner Companies' },
  { value: '500k+', label: 'Successful Placements' },
];

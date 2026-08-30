import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Target, CheckCircle, Clock, Star, TrendingUp, Award, Zap,
  Code, Database, Globe, Palette, Brain, Rocket, ChevronRight, ChevronDown,
  Search, Filter, Plus, BarChart3, Calendar, Users, ArrowRight, Flame,
  Trophy, Sparkles, RefreshCw, Lock, Unlock, Play, Pause, Eye,
  Lightbulb, GraduationCap, Bookmark, Share2, Info, AlertTriangle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type PathStatus = 'not-started' | 'in-progress' | 'completed' | 'paused';
type MilestoneStatus = 'locked' | 'available' | 'in-progress' | 'completed';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
  progress: number; // 0-100
  hoursSpent: number;
  projectsCompleted: number;
  lastPracticed: string;
  streak: number;
  icon: string;
  color: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  totalSkills: number;
  completedSkills: number;
  estimatedHours: number;
  hoursSpent: number;
  status: PathStatus;
  skills: string[];
  milestones: Milestone[];
  enrolledDate: string;
  lastAccessed: string;
  rating: number;
  enrolledBy: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  requiredSkills: string[];
  reward: string;
  unlockCondition: string;
  completedDate?: string;
}

interface DailyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

interface LearningActivity {
  id: string;
  type: 'course' | 'project' | 'practice' | 'review' | 'quiz';
  title: string;
  skill: string;
  duration: number;
  date: string;
  score?: number;
  xpEarned: number;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  skill: string;
  difficulty: SkillLevel;
  estimatedTime: string;
  type: 'course' | 'project' | 'practice' | 'challenge';
  priority: 'high' | 'medium' | 'low';
}

// ─── Data ──────────────────────────────────────────────────────────
const SKILLS: Skill[] = [
  { id: 'sk1', name: 'React', category: 'Frontend', level: 'advanced', progress: 78, hoursSpent: 124, projectsCompleted: 8, lastPracticed: '2026-08-26', streak: 12, icon: '⚛️', color: '#61dafb' },
  { id: 'sk2', name: 'TypeScript', category: 'Languages', level: 'intermediate', progress: 62, hoursSpent: 86, projectsCompleted: 5, lastPracticed: '2026-08-25', streak: 8, icon: '🔷', color: '#3178c6' },
  { id: 'sk3', name: 'Node.js', category: 'Backend', level: 'intermediate', progress: 55, hoursSpent: 72, projectsCompleted: 4, lastPracticed: '2026-08-24', streak: 5, icon: '🟢', color: '#68a063' },
  { id: 'sk4', name: 'Python', category: 'Languages', level: 'advanced', progress: 85, hoursSpent: 156, projectsCompleted: 12, lastPracticed: '2026-08-26', streak: 20, icon: '🐍', color: '#3776ab' },
  { id: 'sk5', name: 'Machine Learning', category: 'AI/ML', level: 'beginner', progress: 32, hoursSpent: 28, projectsCompleted: 2, lastPracticed: '2026-08-20', streak: 3, icon: '🧠', color: '#ff6f00' },
  { id: 'sk6', name: 'PostgreSQL', category: 'Database', level: 'intermediate', progress: 48, hoursSpent: 54, projectsCompleted: 3, lastPracticed: '2026-08-23', streak: 4, icon: '🐘', color: '#336791' },
  { id: 'sk7', name: 'Tailwind CSS', category: 'Frontend', level: 'expert', progress: 92, hoursSpent: 98, projectsCompleted: 15, lastPracticed: '2026-08-26', streak: 30, icon: '🎨', color: '#06b6d4' },
  { id: 'sk8', name: 'Git & GitHub', category: 'Tools', level: 'expert', progress: 95, hoursSpent: 68, projectsCompleted: 20, lastPracticed: '2026-08-26', streak: 45, icon: '📦', color: '#f05032' },
  { id: 'sk9', name: 'Docker', category: 'DevOps', level: 'beginner', progress: 22, hoursSpent: 16, projectsCompleted: 1, lastPracticed: '2026-08-18', streak: 0, icon: '🐳', color: '#2496ed' },
  { id: 'sk10', name: 'AWS', category: 'Cloud', level: 'beginner', progress: 18, hoursSpent: 12, projectsCompleted: 0, lastPracticed: '2026-08-15', streak: 0, icon: '☁️', color: '#ff9900' },
  { id: 'sk11', name: 'GraphQL', category: 'API', level: 'intermediate', progress: 45, hoursSpent: 38, projectsCompleted: 3, lastPracticed: '2026-08-22', streak: 6, icon: '◼️', color: '#e10098' },
  { id: 'sk12', name: 'System Design', category: 'Architecture', level: 'beginner', progress: 28, hoursSpent: 20, projectsCompleted: 1, lastPracticed: '2026-08-19', streak: 2, icon: '🏗️', color: '#8b5cf6' },
  { id: 'sk13', name: 'Data Structures', category: 'CS Fundamentals', level: 'advanced', progress: 80, hoursSpent: 110, projectsCompleted: 6, lastPracticed: '2026-08-26', streak: 15, icon: '🌲', color: '#10b981' },
  { id: 'sk14', name: 'Algorithms', category: 'CS Fundamentals', level: 'advanced', progress: 75, hoursSpent: 95, projectsCompleted: 8, lastPracticed: '2026-08-25', streak: 14, icon: '⚡', color: '#f59e0b' },
  { id: 'sk15', name: 'Next.js', category: 'Frontend', level: 'intermediate', progress: 58, hoursSpent: 64, projectsCompleted: 4, lastPracticed: '2026-08-24', streak: 7, icon: '▲', color: '#000000' },
];

const PATHS: LearningPath[] = [
  {
    id: 'p1', title: 'Full-Stack Web Developer', description: 'Master frontend, backend, and database to become a complete web developer.',
    category: 'Web Development', icon: <Globe className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500',
    totalSkills: 8, completedSkills: 4, estimatedHours: 500, hoursSpent: 312, status: 'in-progress',
    skills: ['sk1', 'sk2', 'sk3', 'sk6', 'sk7', 'sk8', 'sk11', 'sk15'],
    milestones: [
      { id: 'm1', title: 'Frontend Foundations', description: 'Master React, TypeScript, and CSS', status: 'completed', requiredSkills: ['sk1', 'sk2', 'sk7'], reward: '🎨 Frontend Badge', unlockCondition: 'Complete 3 frontend skills', completedDate: '2026-07-15' },
      { id: 'm2', title: 'Backend Basics', description: 'Build APIs with Node.js and databases', status: 'completed', requiredSkills: ['sk3', 'sk6'], reward: '🔧 Backend Badge', unlockCondition: 'Complete Node.js and PostgreSQL', completedDate: '2026-08-10' },
      { id: 'm3', title: 'API Design Master', description: 'Build RESTful and GraphQL APIs', status: 'in-progress', requiredSkills: ['sk11'], reward: '🔌 API Badge', unlockCondition: 'Master GraphQL', },
      { id: 'm4', title: 'Full-Stack Project', description: 'Deploy a complete full-stack application', status: 'locked', requiredSkills: ['sk15'], reward: '🚀 Full-Stack Certificate', unlockCondition: 'Complete Next.js + Deploy project', },
    ],
    enrolledDate: '2026-05-01', lastAccessed: '2026-08-26', rating: 4.8, enrolledBy: 12450,
  },
  {
    id: 'p2', title: 'AI & Machine Learning Engineer', description: 'Learn Python, ML algorithms, and deploy AI models.',
    category: 'AI/ML', icon: <Brain className="w-5 h-5" />, color: 'from-purple-500 to-pink-500',
    totalSkills: 6, completedSkills: 1, estimatedHours: 400, hoursSpent: 86, status: 'in-progress',
    skills: ['sk4', 'sk5', 'sk10', 'sk9', 'sk12', 'sk6'],
    milestones: [
      { id: 'm5', title: 'Python Proficiency', description: 'Master Python for data science', status: 'completed', requiredSkills: ['sk4'], reward: '🐍 Python Badge', unlockCondition: 'Complete Python track', completedDate: '2026-06-20' },
      { id: 'm6', title: 'ML Fundamentals', description: 'Learn core ML algorithms', status: 'in-progress', requiredSkills: ['sk5'], reward: '🧠 ML Badge', unlockCondition: 'Complete ML basics + 3 projects', },
      { id: 'm7', title: 'Cloud Deployment', description: 'Deploy ML models to cloud', status: 'locked', requiredSkills: ['sk10'], reward: '☁️ Cloud ML Badge', unlockCondition: 'AWS + Docker proficiency', },
    ],
    enrolledDate: '2026-06-01', lastAccessed: '2026-08-24', rating: 4.7, enrolledBy: 8900,
  },
  {
    id: 'p3', title: 'CS Fundamentals Mastery', description: 'Strengthen DSA, algorithms, and system design for coding interviews.',
    category: 'CS Fundamentals', icon: <Code className="w-5 h-5" />, color: 'from-emerald-500 to-teal-500',
    totalSkills: 4, completedSkills: 2, estimatedHours: 300, hoursSpent: 225, status: 'in-progress',
    skills: ['sk13', 'sk14', 'sk12', 'sk2'],
    milestones: [
      { id: 'm8', title: 'DSA Expert', description: 'Master data structures and algorithms', status: 'completed', requiredSkills: ['sk13', 'sk14'], reward: '🌲 DSA Badge', unlockCondition: 'Complete 200+ DSA problems', completedDate: '2026-08-01' },
      { id: 'm9', title: 'System Design Starter', description: 'Learn fundamental system design concepts', status: 'in-progress', requiredSkills: ['sk12'], reward: '🏗️ Design Badge', unlockCondition: 'Complete 5 system design exercises', },
      { id: 'm10', title: 'Interview Ready', description: 'Pass mock interviews with confidence', status: 'locked', requiredSkills: [], reward: '🏆 Interview Champion', unlockCondition: 'Score 80%+ in 3 mock interviews', },
    ],
    enrolledDate: '2026-04-15', lastAccessed: '2026-08-26', rating: 4.9, enrolledBy: 15200,
  },
  {
    id: 'p4', title: 'DevOps & Cloud Engineer', description: 'Master Docker, CI/CD, AWS, and infrastructure as code.',
    category: 'DevOps', icon: <Rocket className="w-5 h-5" />, color: 'from-orange-500 to-red-500',
    totalSkills: 5, completedSkills: 0, estimatedHours: 350, hoursSpent: 28, status: 'not-started',
    skills: ['sk9', 'sk10', 'sk8', 'sk3', 'sk6'],
    milestones: [
      { id: 'm11', title: 'Containerization', description: 'Master Docker and container orchestration', status: 'available', requiredSkills: ['sk9'], reward: '🐳 Docker Badge', unlockCondition: 'Complete Docker fundamentals', },
      { id: 'm12', title: 'Cloud Certified', description: 'Get AWS certification ready', status: 'locked', requiredSkills: ['sk10'], reward: '☁️ AWS Badge', unlockCondition: 'Complete AWS cloud practitioner', },
    ],
    enrolledDate: '', lastAccessed: '', rating: 4.6, enrolledBy: 6800,
  },
];

const DAILY_GOALS: DailyGoal[] = [
  { id: 'g1', title: 'Learning Time', target: 2, current: 1.5, unit: 'hours', icon: <BookOpen className="w-4 h-4" />, color: 'text-cyan-400' },
  { id: 'g2', title: 'Problems Solved', target: 3, current: 2, unit: 'problems', icon: <Target className="w-4 h-4" />, color: 'text-emerald-400' },
  { id: 'g3', title: 'Code Streak', target: 30, current: 20, unit: 'days', icon: <Flame className="w-4 h-4" />, color: 'text-amber-400' },
  { id: 'g4', title: 'XP Points', target: 500, current: 320, unit: 'XP', icon: <Zap className="w-4 h-4" />, color: 'text-purple-400' },
];

const ACTIVITIES: LearningActivity[] = [
  { id: 'a1', type: 'practice', title: 'React Hooks Deep Dive', skill: 'React', duration: 45, date: '2026-08-26', score: 92, xpEarned: 85 },
  { id: 'a2', type: 'project', title: 'Built Todo App with TypeScript', skill: 'TypeScript', duration: 120, date: '2026-08-25', xpEarned: 150 },
  { id: 'a3', type: 'quiz', title: 'Data Structures Quiz', skill: 'Data Structures', duration: 30, date: '2026-08-25', score: 88, xpEarned: 60 },
  { id: 'a4', type: 'course', title: 'GraphQL Mutations & Subscriptions', skill: 'GraphQL', duration: 60, date: '2026-08-24', xpEarned: 70 },
  { id: 'a5', type: 'practice', title: 'LeetCode: Binary Tree Traversal', skill: 'Algorithms', duration: 25, date: '2026-08-24', score: 95, xpEarned: 50 },
  { id: 'a6', type: 'project', title: 'REST API with Express', skill: 'Node.js', duration: 90, date: '2026-08-23', xpEarned: 120 },
  { id: 'a7', type: 'review', title: 'Reviewed PostgreSQL Joins', skill: 'PostgreSQL', duration: 20, date: '2026-08-23', xpEarned: 30 },
  { id: 'a8', type: 'quiz', title: 'ML Algorithms Quiz', skill: 'Machine Learning', duration: 40, date: '2026-08-22', score: 76, xpEarned: 55 },
];

const RECOMMENDATIONS: AIRecommendation[] = [
  { id: 'r1', title: 'Advanced React Patterns', description: 'Learn compound components, render props, and custom hooks patterns.', reason: 'Your React progress is 78% — push to expert level with advanced patterns.', skill: 'React', difficulty: 'advanced', estimatedTime: '8 hours', type: 'course', priority: 'high' },
  { id: 'r2', title: 'Docker Project: Deploy Your Apps', description: 'Containerize a full-stack app and deploy to AWS ECS.', reason: 'DevOps skills are critical for your career goals — start with a hands-on project.', skill: 'Docker', difficulty: 'beginner', estimatedTime: '12 hours', type: 'project', priority: 'high' },
  { id: 'r3', title: 'System Design: URL Shortener', description: 'Design and build a scalable URL shortener from scratch.', reason: 'System Design is a key interview topic — practice with real-world examples.', skill: 'System Design', difficulty: 'intermediate', estimatedTime: '6 hours', type: 'project', priority: 'medium' },
  { id: 'r4', title: 'Python ML: Build a Sentiment Analyzer', description: 'Use NLP and scikit-learn to analyze social media sentiment.', reason: 'Your ML progress is 32% — a practical project will solidify your understanding.', skill: 'Machine Learning', difficulty: 'intermediate', estimatedTime: '10 hours', type: 'project', priority: 'medium' },
  { id: 'r5', title: 'Daily DSA Practice: Trees & Graphs', description: 'Solve 3 tree/graph problems on LeetCode today.', reason: 'Keep your DSA streak alive — tree problems are your weakest area.', skill: 'Algorithms', difficulty: 'intermediate', estimatedTime: '1.5 hours', type: 'practice', priority: 'high' },
  { id: 'r6', title: 'Next.js App Router Deep Dive', description: 'Master the new App Router with server components and actions.', reason: 'Next.js progress is 58% — the App Router is essential for modern Next.js.', skill: 'Next.js', difficulty: 'intermediate', estimatedTime: '5 hours', type: 'course', priority: 'low' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Frontend': 'text-blue-400 bg-blue-500/20',
  'Backend': 'text-emerald-400 bg-emerald-500/20',
  'Languages': 'text-purple-400 bg-purple-500/20',
  'AI/ML': 'text-orange-400 bg-orange-500/20',
  'Database': 'text-cyan-400 bg-cyan-500/20',
  'Tools': 'text-gray-400 bg-gray-500/20',
  'DevOps': 'text-red-400 bg-red-500/20',
  'Cloud': 'text-amber-400 bg-amber-500/20',
  'API': 'text-pink-400 bg-pink-500/20',
  'Architecture': 'text-indigo-400 bg-indigo-500/20',
  'CS Fundamentals': 'text-teal-400 bg-teal-500/20',
};

const LEVEL_CONFIG: Record<SkillLevel, { label: string; color: string; min: number }> = {
  beginner: { label: 'Beginner', color: 'text-gray-400 bg-gray-500/20', min: 0 },
  intermediate: { label: 'Intermediate', color: 'text-blue-400 bg-blue-500/20', min: 40 },
  advanced: { label: 'Advanced', color: 'text-purple-400 bg-purple-500/20', min: 70 },
  expert: { label: 'Expert', color: 'text-amber-400 bg-amber-500/20', min: 90 },
};

// ─── Utility ──────────────────────────────────────────────────────
const statusColor = (s: PathStatus) => ({
  'not-started': 'text-gray-400 bg-gray-500/20', 'in-progress': 'text-cyan-400 bg-cyan-500/20',
  'completed': 'text-emerald-400 bg-emerald-500/20', 'paused': 'text-amber-400 bg-amber-500/20',
}[s]);

const milestoneStatusColor = (s: MilestoneStatus) => ({
  locked: 'text-gray-500 bg-gray-500/10 border-gray-500/30', available: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  'in-progress': 'text-amber-400 bg-amber-500/10 border-amber-500/30', completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
}[s]);

const getLevelForProgress = (p: number): SkillLevel => {
  if (p >= 90) return 'expert';
  if (p >= 70) return 'advanced';
  if (p >= 40) return 'intermediate';
  return 'beginner';
};

// ─── Main Component ───────────────────────────────────────────────
export default function LearningPathTracker() {
  const [activeTab, setActiveTab] = useState<'overview' | 'paths' | 'skills' | 'activities' | 'recommendations'>('overview');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set(['m3']));

  const toggleMilestone = useCallback((id: string) => {
    setExpandedMilestones(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  // Stats
  const totalHours = SKILLS.reduce((s, sk) => s + sk.hoursSpent, 0);
  const totalProjects = SKILLS.reduce((s, sk) => s + sk.projectsCompleted, 0);
  const avgProgress = Math.round(SKILLS.reduce((s, sk) => s + sk.progress, 0) / SKILLS.length);
  const activeStreaks = SKILLS.filter(sk => sk.streak > 0).length;
  const totalXP = ACTIVITIES.reduce((s, a) => s + a.xpEarned, 0);

  const filteredSkills = useMemo(() => {
    let skills = [...SKILLS];
    if (filterCategory !== 'all') skills = skills.filter(s => s.category === filterCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      skills = skills.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    return skills.sort((a, b) => b.progress - a.progress);
  }, [filterCategory, searchQuery]);

  const categories = [...new Set(SKILLS.map(s => s.category))];

  // ─── Tab: Overview ──────────────────────────────────────────────
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Daily Goals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {DAILY_GOALS.map(goal => {
          const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
          return (
            <div key={goal.id} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl bg-surface/5 ${goal.color}`}>{goal.icon}</div>
                <span className="text-gray-400 text-sm">{goal.title}</span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <div className="text-2xl font-bold text-white">{goal.current}</div>
                <div className="text-gray-500 text-sm mb-0.5">/ {goal.target} {goal.unit}</div>
              </div>
              <div className="h-2 bg-surface/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{
                  width: `${pct}%`,
                  backgroundColor: pct >= 100 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#3b82f6',
                }} />
              </div>
              {pct >= 100 && <div className="text-[10px] text-emerald-400 mt-1">✓ Goal achieved!</div>}
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Skills', value: SKILLS.length, color: 'text-blue-400' },
          { label: 'Hours Learned', value: totalHours, color: 'text-cyan-400' },
          { label: 'Projects Done', value: totalProjects, color: 'text-emerald-400' },
          { label: 'Avg Progress', value: `${avgProgress}%`, color: 'text-purple-400' },
          { label: 'Total XP', value: totalXP.toLocaleString(), color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active Paths */}
      <div>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-cyan-400" /> Active Learning Paths
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PATHS.filter(p => p.status === 'in-progress').map((path, i) => (
            <motion.div key={path.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => { setSelectedPath(path.id); setActiveTab('paths'); }}
              className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-white/20 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${path.color} text-white`}>{path.icon}</div>
                <div>
                  <div className="text-white font-semibold text-sm">{path.title}</div>
                  <div className="text-gray-500 text-[10px]">{path.category}</div>
                </div>
              </div>
              <p className="text-gray-400 text-xs mb-3 line-clamp-2">{path.description}</p>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{path.completedSkills}/{path.totalSkills} skills</span>
                  <span className="text-gray-400">{Math.round((path.completedSkills / path.totalSkills) * 100)}%</span>
                </div>
                <div className="h-2 bg-surface/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    style={{ width: `${(path.completedSkills / path.totalSkills) * 100}%` }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>{path.hoursSpent}/{path.estimatedHours} hours</span>
                <span>⭐ {path.rating}</span>
                <span>{path.enrolledBy.toLocaleString()} enrolled</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Skill Progress */}
      <div>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" /> Top Skills
        </h3>
        <div className="space-y-2">
          {SKILLS.sort((a, b) => b.progress - a.progress).slice(0, 6).map(skill => (
            <div key={skill.id} className="flex items-center gap-4 p-3 bg-surface/5 rounded-xl">
              <span className="text-lg">{skill.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{skill.name}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-medium ${LEVEL_CONFIG[skill.level].color}`}>{LEVEL_CONFIG[skill.level].label}</span>
                </div>
                <div className="h-1.5 bg-surface/10 rounded-full mt-1.5">
                  <div className="h-full rounded-full" style={{ width: `${skill.progress}%`, backgroundColor: skill.color }} />
                </div>
              </div>
              <div className="text-right text-xs">
                <div className="text-white font-medium">{skill.progress}%</div>
                <div className="text-gray-500">{skill.hoursSpent}h</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" /> Recent Activity
        </h3>
        <div className="space-y-2">
          {ACTIVITIES.slice(0, 5).map(activity => (
            <div key={activity.id} className="flex items-center gap-4 p-3 bg-surface/5 rounded-xl">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                activity.type === 'course' ? 'bg-blue-500/20 text-blue-400' :
                activity.type === 'project' ? 'bg-emerald-500/20 text-emerald-400' :
                activity.type === 'practice' ? 'bg-purple-500/20 text-purple-400' :
                activity.type === 'quiz' ? 'bg-amber-500/20 text-amber-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {activity.type === 'course' ? <BookOpen className="w-4 h-4" /> :
                 activity.type === 'project' ? <Rocket className="w-4 h-4" /> :
                 activity.type === 'practice' ? <Code className="w-4 h-4" /> :
                 activity.type === 'quiz' ? <Target className="w-4 h-4" /> :
                 <Eye className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">{activity.title}</div>
                <div className="text-gray-500 text-[10px]">{activity.skill} · {activity.duration}min · {activity.date}</div>
              </div>
              <div className="text-right">
                {activity.score && <div className="text-xs text-emerald-400">{activity.score}%</div>}
                <div className="text-[10px] text-amber-400">+{activity.xpEarned} XP</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Tab: Paths ─────────────────────────────────────────────────
  const PathsTab = () => (
    <div className="space-y-6">
      {/* Path Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PATHS.map((path, i) => (
          <motion.div key={path.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
            className={`bg-surface/5 backdrop-blur-md border rounded-2xl p-5 cursor-pointer transition-all ${
              selectedPath === path.id ? "border-cyan-500/50 ring-1 ring-cyan-500/30" : "border-white/10 hover:border-white/20"
            }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${path.color} text-white`}>{path.icon}</div>
                <div>
                  <div className="text-white font-semibold">{path.title}</div>
                  <div className="text-gray-500 text-[10px]">{path.category} · {path.enrolledBy.toLocaleString()} enrolled</div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusColor(path.status)}`}>{path.status}</span>
            </div>
            <p className="text-gray-400 text-xs mb-3">{path.description}</p>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">{path.completedSkills}/{path.totalSkills} skills</span>
                <span className="text-white">{Math.round((path.completedSkills / path.totalSkills) * 100)}%</span>
              </div>
              <div className="h-2 bg-surface/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  style={{ width: `${(path.completedSkills / path.totalSkills) * 100}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <span>⏱ {path.hoursSpent}/{path.estimatedHours} hours</span>
              <span>⭐ {path.rating}</span>
              <span>📅 {path.lastAccessed || 'Not started'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Path Detail */}
      {selectedPath && (() => {
        const path = PATHS.find(p => p.id === selectedPath);
        if (!path) return null;
        return (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden">
            <div className="bg-surface/5 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                {path.icon} {path.title} — Milestones
              </h3>
              <div className="space-y-3">
                {path.milestones.map(milestone => {
                  const isExpanded = expandedMilestones.has(milestone.id);
                  return (
                    <div key={milestone.id} className={`rounded-xl border p-4 ${milestoneStatusColor(milestone.status)}`}>
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleMilestone(milestone.id)}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                            milestone.status === 'completed' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                            milestone.status === 'in-progress' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
                            milestone.status === 'available' ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' :
                            'bg-gray-500/10 border-gray-500/30 text-gray-500'
                          }`}>
                            {milestone.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                             milestone.status === 'locked' ? <Lock className="w-4 h-4" /> :
                             <Unlock className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">{milestone.title}</div>
                            <div className="text-gray-400 text-[10px]">{milestone.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-surface/5 text-gray-400">{milestone.reward}</span>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                          className="mt-3 pt-3 border-t border-white/10 text-xs space-y-2">
                          <div className="text-gray-400">Unlock: <span className="text-white">{milestone.unlockCondition}</span></div>
                          {milestone.requiredSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {milestone.requiredSkills.map(skId => {
                                const skill = SKILLS.find(s => s.id === skId);
                                return skill ? (
                                  <span key={skId} className="px-2 py-0.5 rounded bg-surface/5 text-gray-300 text-[10px]">
                                    {skill.icon} {skill.name} ({skill.progress}%)
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                          {milestone.completedDate && (
                            <div className="text-emerald-400">✓ Completed on {milestone.completedDate}</div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );

  // ─── Tab: Skills ────────────────────────────────────────────────
  const SkillsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search skills..."
              className="bg-surface/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm w-56 focus:outline-none focus:border-cyan-500/50" />
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="bg-surface/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <span className="text-gray-400 text-sm">{filteredSkills.length} skills</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill, i) => {
          const level = LEVEL_CONFIG[skill.level];
          return (
            <motion.div key={skill.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
              className={`bg-surface/5 backdrop-blur-md border rounded-2xl p-5 cursor-pointer transition-all ${
                selectedSkill === skill.id ? "border-cyan-500/50 ring-1 ring-cyan-500/30" : "border-white/10 hover:border-white/20"
              }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{skill.icon}</span>
                  <div>
                    <div className="text-white font-semibold text-sm">{skill.name}</div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-medium ${level.color}`}>{level.label}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">{skill.progress}%</div>
                </div>
              </div>
              <div className="h-2 bg-surface/10 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full" style={{ width: `${skill.progress}%`, backgroundColor: skill.color }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-surface/5 rounded-lg p-2">
                  <div className="text-white text-xs font-medium">{skill.hoursSpent}h</div>
                  <div className="text-[9px] text-gray-500">Hours</div>
                </div>
                <div className="bg-surface/5 rounded-lg p-2">
                  <div className="text-white text-xs font-medium">{skill.projectsCompleted}</div>
                  <div className="text-[9px] text-gray-500">Projects</div>
                </div>
                <div className="bg-surface/5 rounded-lg p-2">
                  <div className="text-amber-400 text-xs font-medium">🔥 {skill.streak}</div>
                  <div className="text-[9px] text-gray-500">Streak</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] text-gray-500">
                <span className={`px-2 py-0.5 rounded ${CATEGORY_COLORS[skill.category] || 'text-gray-400 bg-gray-500/20'}`}>{skill.category}</span>
                <span>Last: {skill.lastPracticed}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  // ─── Tab: Activities ────────────────────────────────────────────
  const ActivitiesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: totalXP.toLocaleString(), color: 'text-amber-400' },
          { label: 'Active Streaks', value: activeStreaks, color: 'text-emerald-400' },
          { label: 'Activities', value: ACTIVITIES.length, color: 'text-cyan-400' },
          { label: 'Avg Score', value: `${Math.round(ACTIVITIES.filter(a => a.score).reduce((s, a) => s + (a.score || 0), 0) / ACTIVITIES.filter(a => a.score).length)}%`, color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" /> Activity Timeline
        </h3>
        <div className="space-y-3">
          {ACTIVITIES.map(activity => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-surface/5 rounded-xl hover:bg-surface/10 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                activity.type === 'course' ? 'bg-blue-500/20 text-blue-400' :
                activity.type === 'project' ? 'bg-emerald-500/20 text-emerald-400' :
                activity.type === 'practice' ? 'bg-purple-500/20 text-purple-400' :
                activity.type === 'quiz' ? 'bg-amber-500/20 text-amber-400' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {activity.type === 'course' ? <BookOpen className="w-5 h-5" /> :
                 activity.type === 'project' ? <Rocket className="w-5 h-5" /> :
                 activity.type === 'practice' ? <Code className="w-5 h-5" /> :
                 activity.type === 'quiz' ? <Target className="w-5 h-5" /> :
                 <Eye className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm">{activity.title}</div>
                <div className="text-gray-500 text-[10px] mt-0.5">{activity.skill} · {activity.duration}min · {activity.date}</div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs text-amber-400 font-medium">+{activity.xpEarned} XP</div>
                {activity.score && (
                  <div className={`text-xs font-medium ${activity.score >= 90 ? 'text-emerald-400' : activity.score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                    {activity.score}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── Tab: Recommendations ───────────────────────────────────────
  const RecommendationsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" /> AI Learning Recommendations
        </h3>
        <p className="text-gray-400 text-sm">Personalized suggestions based on your progress, goals, and skill gaps.</p>
      </div>

      <div className="space-y-4">
        {RECOMMENDATIONS.map((rec, i) => (
          <motion.div key={rec.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-surface/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  rec.type === 'course' ? 'bg-blue-500/20 text-blue-400' :
                  rec.type === 'project' ? 'bg-emerald-500/20 text-emerald-400' :
                  rec.type === 'practice' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-amber-500/20 text-amber-400'
                }`}>
                  {rec.type === 'course' ? <BookOpen className="w-5 h-5" /> :
                   rec.type === 'project' ? <Rocket className="w-5 h-5" /> :
                   rec.type === 'practice' ? <Code className="w-5 h-5" /> :
                   <Zap className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-white font-semibold">{rec.title}</div>
                  <div className="text-gray-500 text-[10px]">{rec.skill} · {rec.estimatedTime} · {LEVEL_CONFIG[rec.difficulty].label}</div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                rec.priority === 'high' ? 'text-red-400 bg-red-500/20' :
                rec.priority === 'medium' ? 'text-amber-400 bg-amber-500/20' :
                'text-gray-400 bg-gray-500/20'
              }`}>
                {rec.priority.toUpperCase()}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-2">{rec.description}</p>
            <div className="bg-surface/5 rounded-xl p-3 mb-3">
              <div className="text-[10px] text-gray-400 mb-1 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" /> Why this?
              </div>
              <div className="text-xs text-gray-300">{rec.reason}</div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-1.5 bg-surface/5 border border-white/10 rounded-lg text-gray-400 text-xs hover:text-white transition-all">
                Later
              </button>
              <button className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white text-xs font-medium transition-all flex items-center gap-1">
                Start Now <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20" />
        <div className="relative px-6 py-8">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-cyan-400" />
            Learning Path Tracker
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-gray-400 mt-2">{SKILLS.length} skills · {PATHS.filter(p => p.status === 'in-progress').length} active paths · {totalHours} hours learned · {totalXP.toLocaleString()} XP earned</motion.p>
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {[
              { id: 'overview' as const, label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'paths' as const, label: 'Paths', icon: <Rocket className="w-4 h-4" />, count: PATHS.length },
              { id: 'skills' as const, label: 'Skills', icon: <Target className="w-4 h-4" />, count: SKILLS.length },
              { id: 'activities' as const, label: 'Activities', icon: <Clock className="w-4 h-4" />, count: ACTIVITIES.length },
              { id: 'recommendations' as const, label: 'AI Picks', icon: <Sparkles className="w-4 h-4" />, count: RECOMMENDATIONS.length },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-surface/10 text-white border border-white/20 shadow-lg" : "text-gray-400 hover:text-white hover:bg-surface/5"
                }`}>
                {tab.icon}{tab.label}
                {tab.count !== undefined && <span className="text-xs opacity-60">({tab.count})</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "paths" && <PathsTab />}
            {activeTab === "skills" && <SkillsTab />}
            {activeTab === "activities" && <ActivitiesTab />}
            {activeTab === "recommendations" && <RecommendationsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Re-export needed icons
import { LayoutDashboard } from 'lucide-react';

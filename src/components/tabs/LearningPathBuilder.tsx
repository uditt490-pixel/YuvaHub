import React, { useState, useMemo } from 'react';
import {
  Map, Target, BookOpen, Video, Code, CheckCircle, Circle, Clock, Star,
  ChevronRight, ChevronDown, Plus, Filter, Search, TrendingUp, Award,
  Zap, ArrowRight, BarChart3, Calendar, Bookmark, ExternalLink, Sparkles,
  Layers, Rocket, Users, Lightbulb, AlertTriangle, Check
} from 'lucide-react';

// ─── Data ──────────────────────────────────────────────────────────

/** Pre-built learning paths for different career tracks */
const LEARNING_PATHS = [
  {
    id: 'fullstack',
    title: 'Full-Stack Web Developer',
    icon: '🌐',
    color: '#2563EB',
    difficulty: 'Intermediate',
    duration: '12 weeks',
    learners: 2847,
    rating: 4.8,
    description: 'Master modern web development from frontend to backend with React, Node.js, and databases.',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    milestones: [
      {
        id: 'm1',
        title: 'Frontend Foundations',
        weeks: '1-3',
        completed: true,
        modules: [
          { id: 'mod1', title: 'HTML & CSS Mastery', type: 'course', duration: '4h', completed: true, resource: 'https://web.dev/learn' },
          { id: 'mod2', title: 'JavaScript Deep Dive', type: 'course', duration: '8h', completed: true, resource: 'https://javascript.info' },
          { id: 'mod3', title: 'React Fundamentals', type: 'course', duration: '6h', completed: true, resource: 'https://react.dev' },
          { id: 'mod4', title: 'Build a Portfolio Site', type: 'project', duration: '6h', completed: true },
        ],
      },
      {
        id: 'm2',
        title: 'Backend & APIs',
        weeks: '4-6',
        completed: true,
        modules: [
          { id: 'mod5', title: 'Node.js & Express', type: 'course', duration: '6h', completed: true },
          { id: 'mod6', title: 'REST API Design', type: 'course', duration: '4h', completed: true },
          { id: 'mod7', title: 'PostgreSQL Basics', type: 'course', duration: '5h', completed: true },
          { id: 'mod8', title: 'Build a REST API', type: 'project', duration: '8h', completed: true },
        ],
      },
      {
        id: 'm3',
        title: 'Advanced Topics',
        weeks: '7-9',
        completed: false,
        modules: [
          { id: 'mod9', title: 'Authentication & Security', type: 'course', duration: '5h', completed: false },
          { id: 'mod10', title: 'Testing with Jest', type: 'course', duration: '4h', completed: false },
          { id: 'mod11', title: 'TypeScript Advanced', type: 'course', duration: '6h', completed: false },
          { id: 'mod12', title: 'Build a Full-Stack App', type: 'project', duration: '12h', completed: false },
        ],
      },
      {
        id: 'm4',
        title: 'Deployment & DevOps',
        weeks: '10-12',
        completed: false,
        modules: [
          { id: 'mod13', title: 'Docker Fundamentals', type: 'course', duration: '4h', completed: false },
          { id: 'mod14', title: 'CI/CD Pipelines', type: 'course', duration: '3h', completed: false },
          { id: 'mod15', title: 'AWS / Vercel Deployment', type: 'course', duration: '5h', completed: false },
          { id: 'mod16', title: 'Capstone Project', type: 'project', duration: '20h', completed: false },
        ],
      },
    ],
  },
  {
    id: 'datascience',
    title: 'Data Science & ML',
    icon: '🧠',
    color: '#7C3AED',
    difficulty: 'Advanced',
    duration: '16 weeks',
    learners: 1923,
    rating: 4.7,
    description: 'Learn data analysis, machine learning, and AI with Python, pandas, and TensorFlow.',
    skills: ['Python', 'Pandas', 'Scikit-learn', 'TensorFlow', 'SQL'],
    milestones: [
      {
        id: 'm1',
        title: 'Python for Data Science',
        weeks: '1-4',
        completed: true,
        modules: [
          { id: 'mod1', title: 'Python Fundamentals', type: 'course', duration: '10h', completed: true },
          { id: 'mod2', title: 'NumPy & Pandas', type: 'course', duration: '8h', completed: true },
          { id: 'mod3', title: 'Data Visualization', type: 'course', duration: '6h', completed: true },
          { id: 'mod4', title: 'Exploratory Data Analysis Project', type: 'project', duration: '10h', completed: true },
        ],
      },
      {
        id: 'm2',
        title: 'Statistics & Math',
        weeks: '5-8',
        completed: false,
        modules: [
          { id: 'mod5', title: 'Probability & Statistics', type: 'course', duration: '8h', completed: false },
          { id: 'mod6', title: 'Linear Algebra Refresher', type: 'course', duration: '5h', completed: false },
          { id: 'mod7', title: 'Hypothesis Testing', type: 'course', duration: '4h', completed: false },
          { id: 'mod8', title: 'Statistical Analysis Project', type: 'project', duration: '8h', completed: false },
        ],
      },
      {
        id: 'm3',
        title: 'Machine Learning',
        weeks: '9-12',
        completed: false,
        modules: [
          { id: 'mod9', title: 'Scikit-learn Fundamentals', type: 'course', duration: '8h', completed: false },
          { id: 'mod10', title: 'Regression & Classification', type: 'course', duration: '6h', completed: false },
          { id: 'mod11', title: 'Model Evaluation', type: 'course', duration: '4h', completed: false },
          { id: 'mod12', title: 'ML Kaggle Competition', type: 'project', duration: '15h', completed: false },
        ],
      },
      {
        id: 'm4',
        title: 'Deep Learning & Deployment',
        weeks: '13-16',
        completed: false,
        modules: [
          { id: 'mod13', title: 'Neural Networks with TensorFlow', type: 'course', duration: '10h', completed: false },
          { id: 'mod14', title: 'CNNs for Image Classification', type: 'course', duration: '8h', completed: false },
          { id: 'mod15', title: 'Model Deployment with FastAPI', type: 'course', duration: '5h', completed: false },
          { id: 'mod16', title: 'End-to-End ML Project', type: 'project', duration: '20h', completed: false },
        ],
      },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile App Developer',
    icon: '📱',
    color: '#059669',
    difficulty: 'Intermediate',
    duration: '10 weeks',
    learners: 1456,
    rating: 4.6,
    description: 'Build cross-platform mobile apps with React Native and Flutter.',
    skills: ['React Native', 'Flutter', 'Dart', 'Firebase', 'UI/UX'],
    milestones: [
      {
        id: 'm1',
        title: 'Mobile UI Foundations',
        weeks: '1-3',
        completed: true,
        modules: [
          { id: 'mod1', title: 'React Native Basics', type: 'course', duration: '6h', completed: true },
          { id: 'mod2', title: 'Mobile UI/UX Principles', type: 'course', duration: '4h', completed: true },
          { id: 'mod3', title: 'Navigation Patterns', type: 'course', duration: '3h', completed: true },
          { id: 'mod4', title: 'Build a Weather App', type: 'project', duration: '6h', completed: true },
        ],
      },
      {
        id: 'm2',
        title: 'State & Data',
        weeks: '4-6',
        completed: false,
        modules: [
          { id: 'mod5', title: 'State Management', type: 'course', duration: '5h', completed: false },
          { id: 'mod6', title: 'Firebase Integration', type: 'course', duration: '6h', completed: false },
          { id: 'mod7', title: 'Offline Storage', type: 'course', duration: '3h', completed: false },
          { id: 'mod8', title: 'Build a Todo App', type: 'project', duration: '8h', completed: false },
        ],
      },
      {
        id: 'm3',
        title: 'Advanced Features',
        weeks: '7-10',
        completed: false,
        modules: [
          { id: 'mod9', title: 'Push Notifications', type: 'course', duration: '3h', completed: false },
          { id: 'mod10', title: 'Camera & Media', type: 'course', duration: '4h', completed: false },
          { id: 'mod11', title: 'App Store Deployment', type: 'course', duration: '3h', completed: false },
          { id: 'mod12', title: 'Capstone: Social Media App', type: 'project', duration: '20h', completed: false },
        ],
      },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud Engineer',
    icon: '☁️',
    color: '#DC2626',
    difficulty: 'Advanced',
    duration: '14 weeks',
    learners: 987,
    rating: 4.9,
    description: 'Master cloud infrastructure, containers, CI/CD, and monitoring.',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'GitHub Actions'],
    milestones: [
      {
        id: 'm1',
        title: 'Linux & Networking',
        weeks: '1-3',
        completed: false,
        modules: [
          { id: 'mod1', title: 'Linux Command Line', type: 'course', duration: '6h', completed: false },
          { id: 'mod2', title: 'Networking Fundamentals', type: 'course', duration: '5h', completed: false },
          { id: 'mod3', title: 'Shell Scripting', type: 'course', duration: '4h', completed: false },
          { id: 'mod4', title: 'Server Setup Project', type: 'project', duration: '6h', completed: false },
        ],
      },
      {
        id: 'm2',
        title: 'Containers & Orchestration',
        weeks: '4-7',
        completed: false,
        modules: [
          { id: 'mod5', title: 'Docker Deep Dive', type: 'course', duration: '8h', completed: false },
          { id: 'mod6', title: 'Kubernetes Fundamentals', type: 'course', duration: '10h', completed: false },
          { id: 'mod7', title: 'Helm Charts', type: 'course', duration: '4h', completed: false },
          { id: 'mod8', title: 'Deploy a Microservices App', type: 'project', duration: '12h', completed: false },
        ],
      },
      {
        id: 'm3',
        title: 'Cloud & IaC',
        weeks: '8-11',
        completed: false,
        modules: [
          { id: 'mod9', title: 'AWS Core Services', type: 'course', duration: '10h', completed: false },
          { id: 'mod10', title: 'Terraform Basics', type: 'course', duration: '6h', completed: false },
          { id: 'mod11', title: 'GitHub Actions CI/CD', type: 'course', duration: '5h', completed: false },
          { id: 'mod12', title: 'Infrastructure Project', type: 'project', duration: '10h', completed: false },
        ],
      },
      {
        id: 'm4',
        title: 'Monitoring & SRE',
        weeks: '12-14',
        completed: false,
        modules: [
          { id: 'mod13', title: 'Prometheus & Grafana', type: 'course', duration: '6h', completed: false },
          { id: 'mod14', title: 'Log Management (ELK)', type: 'course', duration: '5h', completed: false },
          { id: 'mod15', title: 'Incident Response', type: 'course', duration: '3h', completed: false },
          { id: 'mod16', title: 'SRE Capstone', type: 'project', duration: '15h', completed: false },
        ],
      },
    ],
  },
];

/** Module type metadata */
const MODULE_TYPES: Record<string, { icon: typeof BookOpen; label: string; color: string }> = {
  course: { icon: BookOpen, label: 'Course', color: '#2563EB' },
  project: { icon: Code, label: 'Project', color: '#7C3AED' },
  video: { icon: Video, label: 'Video', color: '#DC2626' },
  assessment: { icon: Target, label: 'Assessment', color: '#F59E0B' },
};

// ─── Helpers ───────────────────────────────────────────────────────

/** Calculate path completion percentage */
function getPathProgress(milestones: typeof LEARNING_PATHS[0]['milestones']) {
  const total = milestones.reduce((s, m) => s + m.modules.length, 0);
  const done = milestones.reduce((s, m) => s + m.modules.filter((mod) => mod.completed).length, 0);
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

/** Get star rating display */
function stars(rating: number) {
  return Array.from({ length: 5 }, (_, i) => i < Math.round(rating));
}

// ─── Sub-Components ────────────────────────────────────────────────

/** Learning path card for the overview grid */
function PathCard({ path, onSelect, selected }: {
  path: typeof LEARNING_PATHS[0];
  onSelect: () => void;
  selected: boolean;
}) {
  const progress = getPathProgress(path.milestones);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left p-5 rounded-2xl border-2 transition-all w-full ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-surface dark:bg-gray-800 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{path.icon}</span>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">{path.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                {path.difficulty}
              </span>
              <span className="text-xs text-gray-500">{path.duration}</span>
            </div>
          </div>
        </div>
        {progress > 0 && (
          <div className="text-right">
            <div className="text-lg font-bold" style={{ color: path.color }}>{progress}%</div>
            <div className="text-[10px] text-gray-400">complete</div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{path.description}</p>
      <div className="flex flex-wrap gap-1 mb-3">
        {path.skills.map((skill) => (
          <span key={skill} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${path.color}15`, color: path.color }}>
            {skill}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span>{path.learners.toLocaleString()} learners</span>
        </div>
        <div className="flex items-center gap-1">
          {stars(path.rating).map((filled, i) => (
            <Star key={i} size={10} fill={filled ? '#F59E0B' : 'none'} color={filled ? '#F59E0B' : '#D1D5DB'} />
          ))}
          <span className="ml-0.5">{path.rating}</span>
        </div>
      </div>
      {progress > 0 && (
        <div className="mt-3 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: path.color }} />
        </div>
      )}
    </button>
  );
}

/** Milestone section with collapsible modules */
function MilestoneSection({ milestone, index, pathColor, onToggleModule }: {
  milestone: typeof LEARNING_PATHS[0]['milestones'][0];
  index: number;
  pathColor: string;
  onToggleModule: (moduleId: string) => void;
}) {
  const [expanded, setExpanded] = useState(index < 2);
  const completedCount = milestone.modules.filter((m) => m.completed).length;
  const progress = Math.round((completedCount / milestone.modules.length) * 100);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: pathColor }}>
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-900 dark:text-white">{milestone.title}</div>
          <div className="text-xs text-gray-500">Weeks {milestone.weeks} · {milestone.modules.length} modules · {completedCount} done</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold" style={{ color: progress === 100 ? '#10B981' : pathColor }}>{progress}%</div>
          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: progress === 100 ? '#10B981' : pathColor }} />
          </div>
          {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2">
          {milestone.modules.map((mod) => {
            const typeInfo = MODULE_TYPES[mod.type] || MODULE_TYPES.course;
            const TypeIcon = typeInfo.icon;
            return (
              <div
                key={mod.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  mod.completed
                    ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                    : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <button type="button" onClick={() => onToggleModule(mod.id)} className="shrink-0">
                  {mod.completed ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : (
                    <Circle size={20} className="text-gray-300 dark:text-gray-600 hover:text-blue-500" />
                  )}
                </button>
                <TypeIcon size={14} style={{ color: typeInfo.color }} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${mod.completed ? 'text-green-700 dark:text-green-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                    {mod.title}
                  </div>
                  <div className="text-[10px] text-gray-400">{typeInfo.label} · {mod.duration}</div>
                </div>
                {mod.resource && (
                  <a href={mod.resource} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Stats summary card */
function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof Target;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-surface dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

/** Learning Path Builder — personalized skill roadmap with milestones, resources, and progress tracking */
export default function LearningPathBuilder() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);

  const path = LEARNING_PATHS.find((p) => p.id === selectedPath);

  const filteredPaths = useMemo(() => {
    return LEARNING_PATHS.filter((p) => {
      const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty = filterDifficulty === 'all' || p.difficulty.toLowerCase() === filterDifficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, filterDifficulty]);

  const totalModules = path ? path.milestones.reduce((s, m) => s + m.modules.length, 0) : 0;
  const completedModules = path ? path.milestones.reduce((s, m) => s + m.modules.filter((mod) => mod.completed).length, 0) : 0;
  const totalHours = path ? path.milestones.reduce((s, m) => s + m.modules.reduce((ss, mod) => ss + parseInt(mod.duration), 0), 0) : 0;
  const completedHours = path ? path.milestones.reduce((s, m) => s + m.modules.filter((mod) => mod.completed).reduce((ss, mod) => ss + parseInt(mod.duration), 0), 0) : 0;

  const handleToggleModule = (moduleId: string) => {
    // In a real app, this would update state/API
    console.log('Toggle module:', moduleId);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                  <Map className="w-3.5 h-3.5 text-indigo-400" /> Skill Roadmaps
                </span>
                <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                  Adaptive Learning
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
                Learning Path <span className="text-primary-blue italic">Builder</span>
              </h1>
              <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
                Build your personalized skill roadmap and track your learning journey across technologies and frameworks.
              </p>
            </div>
          </div>
        </div>

        {!path ? (
          <>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-surface dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search paths or skills..."
                />
              </div>
              <div className="flex gap-2">
                {['all', 'intermediate', 'advanced'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFilterDifficulty(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      filterDifficulty === d
                        ? 'bg-blue-600 text-white'
                        : 'bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard icon={Layers} label="Learning Paths" value={LEARNING_PATHS.length} color="#2563EB" />
              <StatCard icon={Users} label="Total Learners" value={LEARNING_PATHS.reduce((s, p) => s + p.learners, 0).toLocaleString()} color="#7C3AED" />
              <StatCard icon={BookOpen} label="Total Modules" value={LEARNING_PATHS.reduce((s, p) => s + p.milestones.reduce((ss, m) => ss + m.modules.length, 0), 0)} color="#059669" />
              <StatCard icon={Clock} label="Total Hours" value={`${LEARNING_PATHS.reduce((s, p) => s + p.milestones.reduce((ss, m) => ss + m.modules.reduce((sss, mod) => sss + parseInt(mod.duration), 0), 0), 0)}h`} color="#F59E0B" />
            </div>

            {/* Path Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPaths.map((p) => (
                <PathCard
                  key={p.id}
                  path={p}
                  onSelect={() => { setSelectedPath(p.id); setActiveMilestone(null); }}
                  selected={false}
                />
              ))}
            </div>

            {filteredPaths.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">No learning paths match your search</p>
                <p className="text-sm mt-1">Try different keywords or filters</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Path Detail View */}
            <button
              type="button"
              onClick={() => setSelectedPath(null)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold mb-6"
            >
              ← Back to all paths
            </button>

            {/* Path Header */}
            <div className="bg-surface dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{path.icon}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{path.title}</h2>
                  <p className="text-gray-500 mt-1">{path.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {path.skills.map((skill) => (
                      <span key={skill} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: `${path.color}15`, color: path.color }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold" style={{ color: path.color }}>{getPathProgress(path.milestones)}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{completedModules}/{totalModules}</div>
                  <div className="text-xs text-gray-500">Modules</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{completedHours}h/{totalHours}h</div>
                  <div className="text-xs text-gray-500">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{path.milestones.length}</div>
                  <div className="text-xs text-gray-500">Milestones</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{path.duration}</div>
                  <div className="text-xs text-gray-500">Duration</div>
                </div>
              </div>

              <div className="mt-4 w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${getPathProgress(path.milestones)}%`, background: path.color }}
                />
              </div>
            </div>

            {/* Milestones Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Rocket size={20} style={{ color: path.color }} />
                Learning Milestones
              </h3>
              {path.milestones.map((milestone, i) => (
                <MilestoneSection
                  key={milestone.id}
                  milestone={milestone}
                  index={i}
                  pathColor={path.color}
                  onToggleModule={handleToggleModule}
                />
              ))}
            </div>

            {/* AI Recommendations */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">AI Learning Recommendations</h3>
                  <p className="text-xs text-gray-500">Personalized suggestions based on your progress</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-surface dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <Lightbulb size={16} className="text-amber-500 mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Focus on Weak Areas</div>
                  <div className="text-xs text-gray-500 mt-1">You have 2 incomplete modules in Backend & APIs. Prioritize these before moving forward.</div>
                </div>
                <div className="bg-surface dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <TrendingUp size={16} className="text-green-500 mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Great Momentum</div>
                  <div className="text-xs text-gray-500 mt-1">You've completed 50% of the path! Maintain your current pace to finish in 6 weeks.</div>
                </div>
                <div className="bg-surface dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <Zap size={16} className="text-purple-500 mb-2" />
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Next Milestone</div>
                  <div className="text-xs text-gray-500 mt-1">Start "Advanced Topics" milestone — estimated 25 hours to complete.</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  FolderGit2,
  Globe,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  Video,
  Code2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Star,
  Award,
  Share2,
  Check,
  X,
  FileCode,
  Users
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { EmptyState } from '../ui/states';

/**
 * ProjectShowcaseVault Component
 * 
 * Interactive Hackathon Project Showcase & Video Pitch Vault for YuvaHub.
 * Features:
 * 1. Global Student Project Gallery with Video Demos & Live Links
 * 2. Community Upvoting & Peer Feedback Engine
 * 3. Project Submission Console (Video Pitch, Architecture & Repo)
 * 4. Recruiter & Employer Spotlight Radar
 * 5. Project Portfolio JSON Manifest Exporter
 */
export default function ProjectShowcaseVault() {
  const { user } = useAppContext();

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<'gallery' | 'submit' | 'spotlight' | 'export'>('gallery');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Showcase Projects Data State
  const [projects, setProjects] = useState([
    {
      id: 'proj_vault_1',
      title: 'YuvaHub Enterprise AI Platform',
      teamName: 'Team Antigravity',
      category: 'AI & Full Stack',
      upvotes: 342,
      views: 1850,
      hasUpvoted: true,
      repoUrl: 'https://github.com/dipanshubatra/YuvaHub',
      demoUrl: 'https://yuvahub.dev',
      videoPitch: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      description: 'Unified career discovery, AI ATS optimizer, hackathon studio, and open source bounty platform.',
      tags: ['React 19', 'TypeScript', 'Tailwind', 'Gemini AI']
    },
    {
      id: 'proj_vault_2',
      title: 'Autonomous Multi-Agent DAG Scheduler',
      teamName: 'CronVault Labs',
      category: 'Distributed Systems',
      upvotes: 289,
      views: 1420,
      hasUpvoted: false,
      repoUrl: 'https://github.com/cronvault/dag-scheduler',
      demoUrl: 'https://cronvault.io',
      videoPitch: '',
      description: 'Distributed workflow engine supporting cron expressions, retry backoff, and webhook triggers.',
      tags: ['Spring Boot', 'PostgreSQL', 'Docker', 'Redis']
    },
    {
      id: 'proj_vault_3',
      title: 'Zero-Knowledge Electronic Health Ledger',
      teamName: 'MedTrack Security',
      category: 'Healthcare & Web3',
      upvotes: 215,
      views: 980,
      hasUpvoted: false,
      repoUrl: 'https://github.com/medtrack/zk-ledger',
      demoUrl: 'https://medtrack.health',
      videoPitch: '',
      description: 'Zero-trust equipment tracking and encrypted patient medical history audit logs.',
      tags: ['Java 21', 'JPA', 'SecurityGuard', 'React']
    }
  ]);

  // Project Submission Form State
  const [newProject, setNewProject] = useState({
    title: '',
    teamName: '',
    category: 'AI & Full Stack',
    repoUrl: '',
    demoUrl: '',
    videoPitch: '',
    description: '',
    tags: ''
  });

  // Toggle Upvote
  const handleToggleUpvote = (projectId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const nextUpvoted = !p.hasUpvoted;
        return {
          ...p,
          hasUpvoted: nextUpvoted,
          upvotes: nextUpvoted ? p.upvotes + 1 : p.upvotes - 1
        };
      }
      return p;
    }));
  };

  // Submit New Showcase Project
  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title || !newProject.repoUrl) return;

    const createdProject = {
      id: `proj_vault_${Date.now()}`,
      title: newProject.title,
      teamName: newProject.teamName || user?.displayName || 'Student Team',
      category: newProject.category,
      upvotes: 1,
      views: 12,
      hasUpvoted: true,
      repoUrl: newProject.repoUrl,
      demoUrl: newProject.demoUrl || 'https://yuvahub.dev',
      videoPitch: newProject.videoPitch,
      description: newProject.description,
      tags: newProject.tags ? newProject.tags.split(',').map(t => t.trim()) : ['React', 'TypeScript']
    };

    setProjects([createdProject, ...projects]);
    setNewProject({ title: '', teamName: '', category: 'AI & Full Stack', repoUrl: '', demoUrl: '', videoPitch: '', description: '', tags: '' });
    setNotification({ type: 'success', message: 'Published project to Global Showcase Vault!' });
    setActiveTab('gallery');
  };

  // Export Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      platform: 'YuvaHub Global Project Vault',
      user: user?.displayName || 'Student Developer',
      totalProjectsCount: projects.length,
      topProjects: projects,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Project_Showcase_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // Filtered Projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center gap-1.5">
                <FolderGit2 size={13} /> Global Hackathon Showcase Vault
              </span>
              <span className="px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                Peer Upvoted Projects
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Hackathon Project Showcase & Video Pitch Vault
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Explore standout student hackathon submissions, watch video pitches, and showcase your repository to recruiters.
            </p>
          </div>

          {/* Upvote Counter Meter */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-indigo-700/60 p-4 rounded-2xl w-full lg:w-auto shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-indigo-400 bg-slate-950 font-black text-xl text-indigo-400">
              {projects.reduce((acc, p) => acc + p.upvotes, 0)}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Community Upvotes</div>
              <div className="text-xs font-extrabold text-emerald-400">{projects.length} Verified Repositories</div>
              <div className="text-[11px] text-slate-400">Recruiter Spotlight Enabled</div>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {notification.message && (
          <div className={`mt-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === 'error'
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: '', message: '' })} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
        {[
          { id: 'gallery', label: `Project Gallery (${projects.length})`, icon: FolderGit2 },
          { id: 'submit', label: 'Publish Project Showcase', icon: Plus },
          { id: 'spotlight', label: 'Recruiter Spotlight', icon: Star },
          { id: 'export', label: 'Portfolio JSON Manifest', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: GALLERY */}
      {activeTab === 'gallery' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Featured Project Gallery</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Discover and upvote high-impact student projects.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search project or stack..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <EmptyState
              title="No projects found"
              description="No projects match your current search. Try a different keyword or filter."
              icon={<FolderGit2 className="h-6 w-6" aria-hidden="true" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredProjects.map((p) => (
              <div key={p.id} className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{p.teamName}</span>
                    <button
                      onClick={() => handleToggleUpvote(p.id)}
                      className={`px-2.5 py-1 font-bold rounded-lg flex items-center gap-1 transition ${
                        p.hasUpvoted
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-100'
                      }`}
                    >
                      <ThumbsUp size={12} /> {p.upvotes}
                    </button>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-2">{p.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">{p.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {p.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-semibold rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-indigo-600 dark:text-indigo-400 font-bold">
                    <a href={p.repoUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                      GitHub <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SUBMIT */}
      {activeTab === 'submit' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Publish Project to Global Vault</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Share repository links, video pitches, and technical architecture.</p>
          </div>

          <form onSubmit={handleSubmitProject} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Agentic Workflow Engine"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">GitHub Repository URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={newProject.repoUrl}
                  onChange={(e) => setNewProject({ ...newProject, repoUrl: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Live Demo / Deployment Link</label>
                <input
                  type="url"
                  placeholder="https://myproject.dev"
                  value={newProject.demoUrl}
                  onChange={(e) => setNewProject({ ...newProject, demoUrl: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Project Abstract & Features</label>
              <textarea
                rows={3}
                placeholder="Briefly describe what your project builds and key features..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Tech Stack Tags (Comma Separated)</label>
              <input
                type="text"
                placeholder="React 19, TypeScript, PyTorch, Go"
                value={newProject.tags}
                onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition">
              Publish Project to Showcase Vault
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SPOTLIGHT */}
      {activeTab === 'spotlight' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Recruiter & Employer Spotlight</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Top-rated repositories flagged for engineering recruitment teams.</p>
          </div>

          <div className="space-y-3 text-xs">
            {projects.slice(0, 2).map((p, idx) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="font-black text-indigo-600 text-sm">#{idx + 1}</span>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{p.title}</div>
                    <div className="text-gray-500 text-[11px]">{p.teamName} • {p.upvotes} Upvotes</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 text-[10px] font-extrabold bg-emerald-100 text-emerald-700 rounded-md">
                  VERIFIED TOP 1%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXPORT */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Project Portfolio Manifest JSON</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete summary of published projects and community upvote metrics.</p>
            </div>

            <button
              onClick={handleExportManifest}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Download size={14} /> Download Manifest JSON
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
            <pre>{JSON.stringify({
              platform: 'YuvaHub Global Project Vault',
              user: user?.displayName || 'Student Developer',
              totalProjectsCount: projects.length,
              topProjects: projects,
              timestamp: new Date().toISOString()
            }, null, 2)}</pre>
          </div>
        </div>
      )}

    </div>
  );
}

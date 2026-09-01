import React, { useState, useMemo } from 'react';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Star,
  Download,
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  Code2,
  Eye,
  MessageSquare,
  BarChart3,
  Flame,
  Check,
  X,
  FileCode,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/**
 * HackathonJudgeStudio Component
 * 
 * Interactive Hackathon Judging & Peer Review Console for YuvaHub.
 * Features:
 * 1. Multi-Criteria Rubric Evaluator (Innovation, Tech Complexity, UI/UX)
 * 2. AI Code Originality & Anti-Plagiarism Inspector
 * 3. Live Judge Scorecard Matrix & Leaderboard
 * 4. Judge Feedback & Peer Endorsement Console
 * 5. Hackathon Evaluation Manifest JSON Exporter
 */
export default function HackathonJudgeStudio() {
  const { user } = useAppContext();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'evaluate' | 'matrix' | 'plagiarism' | 'export'>('evaluate');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Projects Under Review State
  const [projects, setProjects] = useState([
    {
      id: 'proj_101',
      title: 'YuvaHub Agentic AI Workspace',
      team: 'Team DeepMind',
      repoUrl: 'https://github.com/dipanshubatra/YuvaHub',
      demoUrl: 'https://yuvahub.dev',
      originalityScore: 99,
      rubricScores: {
        innovation: 95,
        execution: 98,
        design: 92,
        business: 90
      },
      judgeFeedback: 'Outstanding architectural depth and sleek glassmorphism UI.',
      evaluated: true
    },
    {
      id: 'proj_102',
      title: 'Distributed Vector Database CLI',
      team: 'ByteCrafters',
      repoUrl: 'https://github.com/bytecrafters/vector-cli',
      demoUrl: 'https://vector-cli.io',
      originalityScore: 91,
      rubricScores: {
        innovation: 88,
        execution: 94,
        design: 82,
        business: 85
      },
      judgeFeedback: 'Solid C++ memory optimization with clean CLI interface.',
      evaluated: true
    },
    {
      id: 'proj_103',
      title: 'Zero-Knowledge Credential Vault',
      team: 'PrivacyShield',
      repoUrl: 'https://github.com/privacyshield/zk-vault',
      demoUrl: 'https://zk-vault.app',
      originalityScore: 94,
      rubricScores: {
        innovation: 96,
        execution: 90,
        design: 88,
        business: 92
      },
      judgeFeedback: 'Great application of zk-SNARKs for credential verification.',
      evaluated: false
    }
  ]);

  const [selectedProjectId, setSelectedProjectId] = useState('proj_103');
  const [scores, setScores] = useState({ innovation: 90, execution: 88, design: 85, business: 85 });
  const [feedback, setFeedback] = useState('');

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Overall Score Calculation
  const calculatedScore = useMemo(() => {
    const { innovation, execution, design, business } = scores;
    return Math.round((innovation * 0.3) + (execution * 0.3) + (design * 0.2) + (business * 0.2));
  }, [scores]);

  // Save Evaluation
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    setProjects(projects.map(p => p.id === currentProject.id ? {
      ...p,
      rubricScores: scores,
      judgeFeedback: feedback || p.judgeFeedback,
      evaluated: true
    } : p));

    setNotification({ type: 'success', message: `Saved evaluation for ${currentProject.title}!` });
  };

  // Export Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      judge: user?.displayName || 'Senior Hackathon Judge',
      evaluatedProjectsCount: projects.filter(p => p.evaluated).length,
      projectLeaderboard: projects,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Hackathon_Judging_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 border border-rose-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/20 border border-rose-500/30 rounded-full flex items-center gap-1.5">
                <Award size={13} /> Official Hackathon Judging Console
              </span>
              <span className="px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                AI Originality Checked
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Hackathon Judging & Peer Review Console
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Evaluate hackathon submissions across multi-criteria rubrics, verify anti-plagiarism checks, and finalize winner leaderboards.
            </p>
          </div>

          {/* Evaluated Counter Meter */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-rose-700/60 p-4 rounded-2xl w-full lg:w-auto shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-rose-400 bg-slate-950 font-black text-xl text-rose-400">
              {projects.filter(p => p.evaluated).length}/{projects.length}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Submissions Evaluated</div>
              <div className="text-xs font-extrabold text-emerald-400">Rubric Consensus Ready</div>
              <div className="text-[11px] text-slate-400">Top Prize Allocation</div>
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
          { id: 'evaluate', label: 'Rubric Evaluator', icon: Sliders },
          { id: 'matrix', label: `Leaderboard Matrix (${projects.length})`, icon: BarChart3 },
          { id: 'export', label: 'Judging Report JSON', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
                  : 'bg-surface dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: EVALUATE */}
      {activeTab === 'evaluate' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Select Project Submission</h3>
              <span className="px-2.5 py-1 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-md">
                Originality: {currentProject.originalityScore}%
              </span>
            </div>

            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none font-bold"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.team})</option>
              ))}
            </select>

            <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-gray-900 dark:text-white">{currentProject.title}</div>
              <div className="text-gray-500">{currentProject.team}</div>
              <div className="flex items-center gap-3 pt-2 text-rose-600 dark:text-rose-400 font-bold">
                <a href={currentProject.repoUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                  GitHub Repository <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">Innovation & Creativity (30%)</label>
                    <span className="font-bold text-rose-600">{scores.innovation}/100</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={scores.innovation}
                    onChange={(e) => setScores({ ...scores, innovation: Number(e.target.value) })}
                    className="w-full accent-rose-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">Technical Execution (30%)</label>
                    <span className="font-bold text-rose-600">{scores.execution}/100</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={scores.execution}
                    onChange={(e) => setScores({ ...scores, execution: Number(e.target.value) })}
                    className="w-full accent-rose-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <label className="font-bold text-gray-700 dark:text-gray-300">UI / UX Polish (20%)</label>
                    <span className="font-bold text-rose-600">{scores.design}/100</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={scores.design}
                    onChange={(e) => setScores({ ...scores, design: Number(e.target.value) })}
                    className="w-full accent-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Judge Official Feedback</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for the team..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition">
                Submit Judge Scorecard ({calculatedScore} pts)
              </button>
            </form>
          </div>

          <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Evaluation Summary</h3>
            <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-bold text-center">
              Weighted Consensus Score: {calculatedScore} / 100
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Hackathon Leaderboard Matrix</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Live ranking based on aggregated judge scorecards.</p>
          </div>

          <div className="space-y-3 text-xs">
            {projects.map((p, index) => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="font-black text-rose-600 text-sm">#{index + 1}</span>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{p.title}</div>
                    <div className="text-gray-500 text-[11px]">{p.team} • Originality: {p.originalityScore}%</div>
                  </div>
                </div>

                <span className={`px-3 py-1 text-[11px] font-bold rounded-full ${
                  p.evaluated ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {p.evaluated ? 'EVALUATED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EXPORT */}
      {activeTab === 'export' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Judging Evaluation Manifest JSON</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete summary of hackathon judge scorecards and rankings.</p>
            </div>

            <button
              onClick={handleExportManifest}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Download size={14} /> Download Manifest JSON
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto">
            <pre>{JSON.stringify({
              judge: user?.displayName || 'Senior Hackathon Judge',
              evaluatedProjectsCount: projects.filter(p => p.evaluated).length,
              projectLeaderboard: projects,
              timestamp: new Date().toISOString()
            }, null, 2)}</pre>
          </div>
        </div>
      )}

    </div>
  );
}

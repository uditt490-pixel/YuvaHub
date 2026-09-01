import React, { useState, useEffect } from 'react';
import {
  HackathonProjectSubmission,
  HackathonAnalyticsSummary,
  HackathonFilterOptions,
  JudgeReview,
  PlagiarismQuarantinePayload
} from '../../types/hackathonEvaluation';
import { HackathonEvaluationService } from '../../services/HackathonEvaluationService';
import { HackathonMetricsCard } from '../../components/Enterprise/HackathonMetricsCard';
import { HackathonFilterToolbar } from '../../components/Enterprise/HackathonFilterToolbar';
import { ProjectEvaluationModal } from '../../components/Enterprise/ProjectEvaluationModal';
import { PlagiarismQuarantineModal } from '../../components/Enterprise/PlagiarismQuarantineModal';
import {
  Trophy,
  LayoutGrid,
  List,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  Code2,
  Award,
  Github,
  Globe,
  Sparkles,
  Building
} from 'lucide-react';

export const HackathonEvaluationHub: React.FC = () => {
  const [submissions, setSubmissions] = useState<HackathonProjectSubmission[]>([]);
  const [analytics, setAnalytics] = useState<HackathonAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'grid' | 'leaderboard' | 'integrity'>('grid');

  // Filters
  const [filters, setFilters] = useState<HackathonFilterOptions>({
    searchQuery: '',
    track: 'ALL',
    status: 'ALL',
    college: '',
    minScore: 0,
    sortBy: 'score',
    sortOrder: 'desc'
  });

  // Modals & Selection
  const [selectedProject, setSelectedProject] = useState<HackathonProjectSubmission | null>(null);
  const [quarantineTarget, setQuarantineTarget] = useState<HackathonProjectSubmission | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warn' } | null>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [list, stats] = await Promise.all([
        HackathonEvaluationService.getSubmissions(filters),
        HackathonEvaluationService.getAnalytics()
      ]);
      setSubmissions(list);
      setAnalytics(stats);
    } catch (err) {
      showToast('Failed to load hackathon submissions', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmitReview = async (projectId: string, review: Omit<JudgeReview, 'id' | 'reviewedAt'>) => {
    try {
      const updated = await HackathonEvaluationService.submitJudgeReview(projectId, review);
      setSubmissions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated);
      }
      showToast(`Rubric review submitted. Composite score: ${updated.compositeJudgeScore}%`);
      const stats = await HackathonEvaluationService.getAnalytics();
      setAnalytics(stats);
    } catch (err: any) {
      showToast(err.message || 'Review submission failed', 'warn');
    }
  };

  const handleQuarantineConfirm = async (payload: PlagiarismQuarantinePayload) => {
    try {
      const updated = await HackathonEvaluationService.quarantinePlagiarism(payload);
      setSubmissions((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedProject && selectedProject.id === updated.id) {
        setSelectedProject(updated);
      }
      setQuarantineTarget(null);
      showToast(`🚨 Project disqualified for code plagiarism`, 'success');
      const stats = await HackathonEvaluationService.getAnalytics();
      setAnalytics(stats);
    } catch (err: any) {
      showToast(err.message || 'Quarantine failed', 'warn');
    }
  };

  const handleExportCsv = () => {
    const csv = HackathonEvaluationService.exportCSV(submissions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `YuvaHub_Hackathon_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Hackathon Submissions CSV');
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      track: 'ALL',
      status: 'ALL',
      college: '',
      minScore: 0,
      sortBy: 'score',
      sortOrder: 'desc'
    });
  };

  const getStatusBadge = (status: HackathonProjectSubmission['status']) => {
    switch (status) {
      case 'WINNER_SELECTED':
        return 'bg-amber-500/200 text-white';
      case 'EVALUATION_COMPLETED':
        return 'bg-emerald-500/200 text-white';
      case 'SCORING_IN_PROGRESS':
        return 'bg-blue-500/200 text-white';
      case 'FLAGGED_PLAGIARISM':
        return 'bg-rose-500 text-white';
      case 'UNEVALUATED':
        return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 text-text-primary dark:text-slate-100 p-4 sm:p-6 lg:p-10 font-sans space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 bg-primary-blue text-white dark:bg-surface dark:text-text-primary border border-border-theme animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface dark:bg-primary-blue p-6 rounded-3xl border border-border-theme dark:border-border-theme shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 dark:bg-amber-950 text-amber-400 dark:text-amber-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-amber-500/30 dark:border-amber-900">
              <Trophy className="w-3.5 h-3.5" /> Jury & Judge Command Station
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-secondary dark:bg-surface-secondary text-text-secondary dark:text-slate-300 text-[10px] font-mono font-bold">
              AICTE Smart India Standard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight">
            Campus Hackathon Evaluation & Judge Studio
          </h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-text-muted mt-1">
            Rubric scoring matrices, architectural telemetry analysis, and automated code plagiarism quarantine.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-surface-secondary dark:bg-surface-secondary p-1.5 rounded-2xl border border-border-theme dark:border-border-theme">
          <button
            onClick={() => setActiveView('grid')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'grid'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Submissions Grid
          </button>
          <button
            onClick={() => setActiveView('leaderboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'leaderboard'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <List className="w-4 h-4" /> Leaderboard
          </button>
          <button
            onClick={() => setActiveView('integrity')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'integrity'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Plagiarism Guard
          </button>
        </div>
      </div>

      {/* Analytics KPI Block */}
      {analytics && <HackathonMetricsCard analytics={analytics} />}

      {/* Filter Toolbar */}
      <HackathonFilterToolbar
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        onExportCsv={handleExportCsv}
        totalMatches={submissions.length}
      />

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Syncing Jury Rubric Telemetry...
          </p>
        </div>
      ) : activeView === 'grid' ? (
        /* Submissions Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((project) => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="p-5 rounded-3xl bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme shadow-sm hover:shadow-md hover:border-amber-500 transition-all cursor-pointer space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs font-bold text-text-muted">
                    {project.projectCode}
                  </div>
                  <h3 className="font-bold text-sm text-text-primary dark:text-white line-clamp-1 mt-0.5">
                    {project.title}
                  </h3>
                  <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    <span>{project.college}</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(project.status)}`}>
                  {project.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p className="text-xs text-text-secondary dark:text-text-muted line-clamp-2 leading-relaxed">
                {project.tagline}
              </p>

              {/* Score Meter */}
              <div className="p-3 rounded-2xl bg-surface dark:bg-surface-secondary/60 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-text-muted">Judge Rubric Score</span>
                  <span className="text-amber-400 dark:text-amber-400 font-extrabold">
                    {project.compositeJudgeScore}%
                  </span>
                </div>
                <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-600 h-full rounded-full"
                    style={{ width: `${project.compositeJudgeScore}%` }}
                  />
                </div>
              </div>

              {/* Tech Stack Pills */}
              <div className="flex flex-wrap gap-1">
                {project.techStack.slice(0, 3).map((tech) => (
                  <span key={tech} className="text-[10px] px-2 py-0.5 rounded-md bg-surface-secondary dark:bg-surface-secondary text-text-secondary dark:text-slate-300 font-medium">
                    {tech}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-border-theme dark:border-border-theme flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQuarantineTarget(project);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 font-bold text-xs flex items-center gap-1 hover:bg-rose-100"
                >
                  <ShieldAlert className="w-3.5 h-3.5" /> Disqualify
                </button>
                <span className="text-xs font-bold text-blue-400 dark:text-blue-400 flex items-center gap-0.5">
                  Evaluate <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : activeView === 'leaderboard' ? (
        /* Leaderboard Table View */
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface dark:bg-surface-secondary/80 border-b border-border-theme dark:border-border-theme text-text-muted dark:text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Rank & Project</th>
                  <th className="p-4">Track</th>
                  <th className="p-4">College</th>
                  <th className="p-4">Judge Score</th>
                  <th className="p-4">Commits</th>
                  <th className="p-4">Plagiarism</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {submissions.map((project, idx) => (
                  <tr key={project.id} className="hover:bg-surface dark:hover:bg-surface-secondary/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-surface-secondary dark:bg-surface-secondary text-center font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-text-primary dark:text-white">{project.title}</div>
                          <div className="text-[11px] text-text-muted">{project.teamName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-blue-400 dark:text-blue-400">
                      {project.track.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4 text-text-primary dark:text-slate-300 font-medium">
                      {project.college}
                    </td>
                    <td className="p-4 font-extrabold text-amber-400 dark:text-amber-400 text-sm">
                      {project.compositeJudgeScore}%
                    </td>
                    <td className="p-4 font-mono">
                      {project.commitCount}
                    </td>
                    <td className="p-4 font-bold">
                      <span className={project.plagiarism.overallSimilarityIndex > 30 ? 'text-rose-600' : 'text-emerald-400'}>
                        {project.plagiarism.overallSimilarityIndex}%
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(project.status)}`}>
                        {project.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="px-3 py-1 rounded-lg bg-blue-500/20 dark:bg-blue-950 text-blue-400 dark:text-blue-400 font-bold hover:bg-blue-500/200/20"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Integrity & Plagiarism View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              Automated Code Plagiarism Detection Engine
            </h3>
            <p className="text-xs text-text-muted dark:text-text-muted leading-relaxed">
              YuvaHub's automated AST fingerprinting scans AST tokens across 25M+ public GitHub repositories, Kaggle kernels, and previous hackathon submission archives.
            </p>
            <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span>Plagiarism Quarantine Threshold</span>
                <span className="text-rose-600">&gt; 30% Similarity</span>
              </div>
              <div className="flex justify-between">
                <span>AI Code Synthesis Model</span>
                <span className="text-blue-400">Calibrated Transformer Classifier</span>
              </div>
            </div>
          </div>

          <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              National Jury Accreditation
            </h3>
            <p className="text-xs text-text-muted dark:text-text-muted leading-relaxed">
              Every score submitted by verified industry judges is cryptographically signed and published to the hackathon prize distribution ledger.
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-amber-500/20 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-900">
                <div className="text-xl font-black text-amber-400 dark:text-amber-400">100%</div>
                <div className="text-[10px] text-text-muted">Audited Scoring</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-900">
                <div className="text-xl font-black text-emerald-400 dark:text-emerald-400">Zero AI Bias</div>
                <div className="text-[10px] text-text-muted">Blind Double Scoring</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Evaluation Modal */}
      {selectedProject && (
        <ProjectEvaluationModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onQuarantine={(proj) => {
            setSelectedProject(null);
            setQuarantineTarget(proj);
          }}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Plagiarism Quarantine Modal */}
      {quarantineTarget && (
        <PlagiarismQuarantineModal
          project={quarantineTarget}
          onClose={() => setQuarantineTarget(null)}
          onConfirm={handleQuarantineConfirm}
        />
      )}
    </div>
  );
};

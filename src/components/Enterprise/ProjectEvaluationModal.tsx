import React, { useState } from 'react';
import { HackathonProjectSubmission, JudgeReview, RubricScoreItem } from '../../types/hackathonEvaluation';
import {
  X,
  Trophy,
  Award,
  Github,
  Globe,
  Video,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Plus,
  Zap,
  Code2
} from 'lucide-react';

interface ProjectEvaluationModalProps {
  project: HackathonProjectSubmission;
  onClose: () => void;
  onQuarantine: (project: HackathonProjectSubmission) => void;
  onSubmitReview: (projectId: string, review: Omit<JudgeReview, 'id' | 'reviewedAt'>) => Promise<void>;
}

export const ProjectEvaluationModal: React.FC<ProjectEvaluationModalProps> = ({
  project,
  onClose,
  onQuarantine,
  onSubmitReview
}) => {
  const [activeTab, setActiveTab] = useState<'rubric' | 'telemetry' | 'plagiarism' | 'reviews'>('rubric');

  // Rubric form state
  const [judgeName, setJudgeName] = useState('Dr. Siddharth Sen (Staff Judge)');
  const [judgeTitle, setJudgeTitle] = useState('Director of AI Research');
  const [scoreInnovation, setScoreInnovation] = useState<number>(9.5);
  const [scoreTechDepth, setScoreTechDepth] = useState<number>(9.0);
  const [scoreCodeQuality, setScoreCodeQuality] = useState<number>(9.2);
  const [scoreDemo, setScoreDemo] = useState<number>(9.4);
  const [recommendation, setRecommendation] = useState<JudgeReview['recommendation']>('TOP_FINALIST');
  const [writtenCritique, setWrittenCritique] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateComposite = () => {
    const raw =
      scoreInnovation * 2.5 +
      scoreTechDepth * 3.0 +
      scoreCodeQuality * 2.0 +
      scoreDemo * 2.5;
    return Math.round(raw * 10) / 10;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writtenCritique.trim()) return;

    const rubricItems: RubricScoreItem[] = [
      { criterion: 'Innovation & Novelty', weightPercentage: 25, score: scoreInnovation, maxScore: 10 },
      { criterion: 'Technical Depth & Architecture', weightPercentage: 30, score: scoreTechDepth, maxScore: 10 },
      { criterion: 'Code Quality & Test Coverage', weightPercentage: 20, score: scoreCodeQuality, maxScore: 10 },
      { criterion: 'Live Demo & Production Readiness', weightPercentage: 25, score: scoreDemo, maxScore: 10 }
    ];

    setIsSubmitting(true);
    await onSubmitReview(project.id, {
      judgeName: judgeName.trim(),
      judgeTitle: judgeTitle.trim(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rubricScores: rubricItems,
      compositeScore: calculateComposite(),
      recommendation,
      writtenCritique: writtenCritique.trim()
    });
    setWrittenCritique('');
    setIsSubmitting(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-blue/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border-theme dark:border-border-theme bg-surface dark:bg-primary-blue/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-mono text-xs text-text-muted font-bold">{project.projectCode}</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${getStatusBadge(project.status)}`}>
                {project.status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-500/200/20 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {project.track.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 className="text-lg font-bold text-text-primary dark:text-white">
              {project.title}
            </h2>
            <div className="text-xs text-text-muted flex items-center gap-2 mt-0.5">
              <span>{project.teamName}</span> • <span className="font-semibold text-blue-400 dark:text-blue-400">{project.college}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuarantine(project)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" /> Flag Plagiarism
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-secondary dark:hover:text-white hover:bg-surface-secondary dark:hover:bg-surface-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Links & KPI Bar */}
        <div className="px-6 py-3 bg-surface dark:bg-primary-blue border-b border-border-theme dark:border-border-theme flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-surface-secondary dark:bg-surface-secondary text-text-primary dark:text-slate-300 hover:text-blue-400 flex items-center gap-1.5 font-semibold"
            >
              <Github className="w-3.5 h-3.5" /> Repository ({project.commitCount} Commits)
            </a>
            {project.liveDeployUrl && (
              <a
                href={project.liveDeployUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 dark:bg-blue-950 text-blue-400 font-semibold flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" /> Live Prototype
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-muted font-bold uppercase text-[10px]">Judge Score:</span>
            <span className="text-base font-extrabold text-blue-400 dark:text-blue-400">
              {project.compositeJudgeScore}%
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-theme dark:border-border-theme px-6 bg-surface/50 dark:bg-primary-blue/40 text-xs">
          <button
            onClick={() => setActiveTab('rubric')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'rubric'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Award className="w-4 h-4" /> Rubric Scoring Matrix
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'telemetry'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Code2 className="w-4 h-4" /> Architecture & Tech Stack
          </button>
          <button
            onClick={() => setActiveTab('plagiarism')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'plagiarism'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Plagiarism & AI Check ({project.plagiarism.overallSimilarityIndex}%)
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Trophy className="w-4 h-4" /> Judge Reviews ({project.reviews.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'rubric' && (
            <form onSubmit={handleSubmitReview} className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-500/20 dark:bg-blue-950/40 border border-blue-500/30 dark:border-blue-900 flex justify-between items-center text-xs">
                <div>
                  <span className="text-text-muted font-bold uppercase text-[10px]">Calculated Composite Score</span>
                  <div className="text-2xl font-black text-blue-400 dark:text-blue-400 mt-0.5">
                    {calculateComposite()}% / 100%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-text-muted font-bold uppercase text-[10px]">Recommendation</span>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value as any)}
                    className="block mt-1 p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme text-xs font-bold"
                  >
                    <option value="TOP_FINALIST">Top Finalist</option>
                    <option value="STRONG_CONTENDER">Strong Contender</option>
                    <option value="STANDARD_PASS">Standard Pass</option>
                    <option value="DISQUALIFY">Disqualify</option>
                  </select>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Innovation & Novelty (25%)</span>
                    <span className="text-blue-400">{scoreInnovation} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scoreInnovation}
                    onChange={(e) => setScoreInnovation(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Technical Depth & Architecture (30%)</span>
                    <span className="text-blue-400">{scoreTechDepth} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scoreTechDepth}
                    onChange={(e) => setScoreTechDepth(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Code Quality & Tests (20%)</span>
                    <span className="text-blue-400">{scoreCodeQuality} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scoreCodeQuality}
                    onChange={(e) => setScoreCodeQuality(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Live Demo & Execution (25%)</span>
                    <span className="text-blue-400">{scoreDemo} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scoreDemo}
                    onChange={(e) => setScoreDemo(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              {/* Written critique */}
              <div className="space-y-2 text-xs">
                <label className="block font-bold uppercase tracking-wider text-text-muted">
                  Judge Written Critique & Award Recommendation
                </label>
                <textarea
                  rows={3}
                  value={writtenCritique}
                  onChange={(e) => setWrittenCritique(e.target.value)}
                  placeholder="Record architectural assessment, novelty review, and constructive student feedback..."
                  required
                  className="w-full p-3 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !writtenCritique.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Save Judge Rubric Review
                </button>
              </div>
            </form>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-2">
                <span className="text-text-muted font-bold uppercase text-[10px]">Project Description</span>
                <p className="text-text-primary dark:text-slate-200 leading-relaxed">{project.description}</p>
              </div>

              <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-2">
                <span className="text-text-muted font-bold uppercase text-[10px]">Utilized Technology Stack</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded-lg bg-blue-500/20 dark:bg-blue-950 text-blue-400 font-bold border border-blue-500/30 dark:border-blue-900">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'plagiarism' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Public Repository Similarity Index</span>
                  <span className={project.plagiarism.overallSimilarityIndex > 30 ? 'text-rose-600 font-bold text-sm' : 'text-emerald-400 font-bold text-sm'}>
                    {project.plagiarism.overallSimilarityIndex}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">AI Synthesized Code Confidence</span>
                  <span className="text-blue-400 font-bold text-sm">
                    {project.plagiarism.aiGeneratedCodeConfidence}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-3 text-xs">
              {project.reviews.length === 0 ? (
                <p className="text-text-muted italic">No judge reviews recorded yet.</p>
              ) : (
                project.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-2">
                    <div className="flex justify-between font-bold">
                      <span>{rev.judgeName} ({rev.judgeTitle})</span>
                      <span className="text-blue-400 font-extrabold">{rev.compositeScore}%</span>
                    </div>
                    <p className="italic text-text-primary dark:text-slate-300">"{rev.writtenCritique}"</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

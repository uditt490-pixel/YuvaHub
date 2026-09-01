import React, { useState } from 'react';
import { Candidate, PipelineStage } from '../../types/talentPipeline';
import {
  X,
  Sparkles,
  Award,
  Github,
  Linkedin,
  FileText,
  Clock,
  Send,
  Zap,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  DollarSign
} from 'lucide-react';

interface CandidateDetailModalProps {
  candidate: Candidate;
  onClose: () => void;
  onUpdateStage: (id: string, stage: PipelineStage, notes?: string) => Promise<void>;
  onFastTrack: (candidate: Candidate) => void;
  onAddNote: (id: string, note: string) => Promise<void>;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  onUpdateStage,
  onFastTrack,
  onAddNote
}) => {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'telemetry' | 'notes' | 'offer'>('diagnostics');
  const [noteInput, setNoteInput] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value as PipelineStage;
    setIsUpdatingStage(true);
    await onUpdateStage(candidate.id, newStage, `Stage updated to ${newStage} via Modal Inspector`);
    setIsUpdatingStage(false);
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    setIsSubmittingNote(true);
    await onAddNote(candidate.id, noteInput.trim());
    setNoteInput('');
    setIsSubmittingNote(false);
  };

  const getStageBadgeColor = (stage: PipelineStage) => {
    switch (stage) {
      case 'SOURCED':
        return 'bg-surface-secondary text-text-primary border-border-theme dark:bg-surface-secondary dark:text-slate-300';
      case 'AI_SCREENED':
        return 'bg-blue-500/200/20 text-blue-800 border-blue-500/30 dark:bg-blue-950 dark:text-blue-300';
      case 'TECHNICAL_ASSESSMENT':
        return 'bg-purple-500/200/20 text-purple-800 border-purple-500/30 dark:bg-purple-950 dark:text-purple-300';
      case 'LEADERSHIP_ROUND':
        return 'bg-amber-500/200/20 text-amber-800 border-amber-500/30 dark:bg-amber-950 dark:text-amber-300';
      case 'OFFER_EXTENDED':
        return 'bg-emerald-500/200/20 text-emerald-800 border-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300';
      case 'HIRED':
        return 'bg-green-600 text-white border-green-700';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-blue/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-border-theme dark:border-border-theme bg-surface dark:bg-primary-blue/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={candidate.avatarUrl}
              alt={candidate.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-border-theme shadow-md"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-text-primary dark:text-white">
                  {candidate.fullName}
                </h2>
                <span className="font-mono text-xs text-text-muted">
                  {candidate.candidateNumber}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getStageBadgeColor(candidate.currentStage)}`}>
                  {candidate.currentStage.replace(/_/g, ' ')}
                </span>
                {candidate.priority === 'CRITICAL_MATCH' && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/200 text-white flex items-center gap-1 shadow-sm">
                    <Zap className="w-3 h-3" /> Critical Match
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary dark:text-text-muted">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> {candidate.college}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" /> {candidate.targetRole}
                </span>
                <span className="font-semibold text-emerald-400 dark:text-emerald-400">
                  CGPA: {candidate.gpa}/10
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onFastTrack(candidate)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/200 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" /> Fast-Track
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-secondary dark:hover:text-white hover:bg-surface-secondary dark:hover:bg-surface-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-surface dark:bg-primary-blue border-b border-border-theme dark:border-border-theme flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-text-secondary dark:text-text-muted">Stage:</span>
            <select
              value={candidate.currentStage}
              onChange={handleStageChange}
              disabled={isUpdatingStage}
              className="bg-surface-secondary dark:bg-surface-secondary border border-border-theme dark:border-border-theme rounded-lg px-3 py-1.5 font-bold text-text-primary dark:text-slate-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="SOURCED">SOURCED</option>
              <option value="AI_SCREENED">AI SCREENED</option>
              <option value="TECHNICAL_ASSESSMENT">TECHNICAL ASSESSMENT</option>
              <option value="LEADERSHIP_ROUND">LEADERSHIP ROUND</option>
              <option value="OFFER_EXTENDED">OFFER EXTENDED</option>
              <option value="HIRED">HIRED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={candidate.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-surface-secondary dark:bg-surface-secondary text-text-primary dark:text-slate-300 hover:text-blue-400 transition-colors"
              title="GitHub Profile"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={candidate.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-surface-secondary dark:bg-surface-secondary text-text-primary dark:text-slate-300 hover:text-blue-400 transition-colors"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 dark:bg-blue-950/60 text-blue-400 dark:text-blue-300 text-xs font-semibold border border-blue-100 dark:border-blue-900">
              <FileText className="w-3.5 h-3.5" />
              {candidate.resumeFileName}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border-theme dark:border-border-theme px-6 bg-surface/50 dark:bg-primary-blue/40">
          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'diagnostics'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Diagnostics & Skills
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'telemetry'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" /> Telemetry & Audit ({candidate.telemetry.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'notes'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Notes & Review ({candidate.notes.length})
          </button>
          <button
            onClick={() => setActiveTab('offer')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'offer'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary dark:hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" /> Offer & CTC Package
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'diagnostics' && (
            <div className="space-y-6">
              {/* Composite AI Rating Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-blue-300 font-bold">
                    AI Autonomous Recommendation
                  </span>
                  <div className="text-2xl font-black mt-1 flex items-center gap-2">
                    {candidate.assessment.recommendation.replace('_', ' ')}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/200/20 text-emerald-300 border border-emerald-400/30">
                      Score: {candidate.assessment.compositeFitScore}%
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-surface/10 p-2.5 rounded-xl backdrop-blur-sm">
                    <div className="text-xs text-blue-200">ATS Match</div>
                    <div className="text-lg font-bold">{candidate.assessment.atsScore}%</div>
                  </div>
                  <div className="bg-surface/10 p-2.5 rounded-xl backdrop-blur-sm">
                    <div className="text-xs text-blue-200">Code Quality</div>
                    <div className="text-lg font-bold">{candidate.assessment.codeQualityIndex}%</div>
                  </div>
                  <div className="bg-surface/10 p-2.5 rounded-xl backdrop-blur-sm">
                    <div className="text-xs text-blue-200">Problem Solving</div>
                    <div className="text-lg font-bold">{candidate.assessment.problemSolvingIndex}%</div>
                  </div>
                </div>
              </div>

              {/* Skills breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted mb-3">
                  Verified Technical Competencies
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {candidate.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="p-3.5 rounded-xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-text-primary dark:text-slate-200 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          {skill.name}
                          {skill.verified && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 dark:text-blue-400" />
                          )}
                        </span>
                        <span className="text-blue-400 dark:text-blue-400">{skill.score}%</span>
                      </div>
                      <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                          style={{ width: `${skill.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Growth Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-500/20 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-900">
                  <h4 className="text-xs font-bold uppercase text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Key Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-200">
                    {candidate.assessment.keyStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-500/20 dark:bg-amber-950/40 border border-amber-500/30 dark:border-amber-900">
                  <h4 className="text-xs font-bold uppercase text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Growth Areas
                  </h4>
                  <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                    {candidate.assessment.growthAreas.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
                Audited Telemetry Log
              </h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-border-theme dark:before:bg-surface-secondary">
                {candidate.telemetry.map((log) => (
                  <div key={log.id} className="relative pl-7 space-y-1">
                    <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-text-primary dark:text-white">
                        {log.action}
                      </span>
                      <span className="text-text-muted font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary dark:text-text-muted">
                      By <span className="font-semibold text-blue-400 dark:text-blue-400">{log.actor}</span> ({log.actorRole})
                    </div>
                    {log.notes && (
                      <div className="p-2 rounded-lg bg-surface dark:bg-surface-secondary text-xs text-text-primary dark:text-slate-300 italic border border-border-theme dark:border-border-theme">
                        "{log.notes}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <form onSubmit={handleAddNoteSubmit} className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
                  Add Interview Reviewer Note
                </label>
                <textarea
                  rows={3}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Record assessment insights, technical feedback, or compensation notes..."
                  className="w-full p-3 rounded-xl border border-border-theme dark:border-border-theme bg-surface dark:bg-surface-secondary text-xs text-text-primary dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmittingNote || !noteInput.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" /> Save Note
                </button>
              </form>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
                  Past Reviewer Notes
                </h4>
                {candidate.notes.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No notes recorded yet.</p>
                ) : (
                  candidate.notes.map((n, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme text-xs text-text-primary dark:text-slate-200 leading-relaxed"
                    >
                      {n}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'offer' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-4">
                <h4 className="text-sm font-bold text-text-primary dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Campus Compensation Structure & CTC Specification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme">
                    <span className="text-xs text-text-muted">Expected Base CTC</span>
                    <div className="text-xl font-extrabold text-text-primary dark:text-white mt-1">
                      ₹{candidate.expectedCtcLpa} LPA
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme">
                    <span className="text-xs text-text-muted">Joining Bonus</span>
                    <div className="text-xl font-extrabold text-emerald-400 dark:text-emerald-400 mt-1">
                      ₹4,00,000
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme">
                    <span className="text-xs text-text-muted">Stock Grants (ESOPs)</span>
                    <div className="text-xl font-extrabold text-indigo-400 dark:text-indigo-400 mt-1">
                      ₹12,00,000 / 4 yrs
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-theme dark:border-border-theme flex justify-end gap-3">
                  <button
                    onClick={() => onUpdateStage(candidate.id, 'OFFER_EXTENDED', 'Official Offer Dispatched')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                  >
                    Dispatch Official Offer Letter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

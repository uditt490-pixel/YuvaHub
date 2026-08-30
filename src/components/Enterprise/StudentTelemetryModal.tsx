import React, { useState } from 'react';
import { StudentTelemetryRecord, MockInterviewLog } from '../../types/careerTelemetry';
import {
  X,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Send,
  Zap,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface StudentTelemetryModalProps {
  student: StudentTelemetryRecord;
  onClose: () => void;
  onIntervene: (student: StudentTelemetryRecord) => void;
  onAddMockInterview: (studentId: string, interview: Omit<MockInterviewLog, 'id' | 'date'>) => Promise<void>;
}

export const StudentTelemetryModal: React.FC<StudentTelemetryModalProps> = ({
  student,
  onClose,
  onIntervene,
  onAddMockInterview
}) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'interviews' | 'interventions'>('skills');

  // Form for mock interview
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [interviewType, setInterviewType] = useState<MockInterviewLog['interviewType']>('SYSTEM_DESIGN');
  const [interviewScore, setInterviewScore] = useState<number>(85);
  const [interviewer, setInterviewer] = useState('Staff Engineer / AI Reviewer');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setIsSubmitting(true);
    await onAddMockInterview(student.id, {
      interviewType,
      score: Number(interviewScore),
      interviewer: interviewer.trim(),
      feedback: feedback.trim()
    });
    setFeedback('');
    setShowAddInterview(false);
    setIsSubmitting(false);
  };

  const getRiskBadge = (risk: StudentTelemetryRecord['riskStatus']) => {
    switch (risk) {
      case 'OPTIMAL':
        return 'bg-emerald-500/200/20 text-emerald-800 border-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300';
      case 'ON_TRACK':
        return 'bg-blue-500/200/20 text-blue-800 border-blue-500/30 dark:bg-blue-950 dark:text-blue-300';
      case 'AT_RISK':
        return 'bg-amber-500/200/20 text-amber-800 border-amber-500/30 dark:bg-amber-950 dark:text-amber-300';
      case 'CRITICAL_INTERVENTION':
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
              src={student.avatarUrl}
              alt={student.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-border-theme shadow-md"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-text-primary dark:text-white">
                  {student.fullName}
                </h2>
                <span className="font-mono text-xs text-text-muted">
                  {student.studentId}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getRiskBadge(student.riskStatus)}`}>
                  {student.riskStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary dark:text-text-muted">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> {student.institution} ({student.graduationYear})
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> {student.targetDomain.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onIntervene(student)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/200 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" /> Trigger Intervention
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-text-muted hover:text-text-secondary dark:hover:text-white hover:bg-surface-secondary dark:hover:bg-surface-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Quick Telemetry Band */}
        <div className="px-6 py-3 bg-surface dark:bg-primary-blue border-b border-border-theme dark:border-border-theme grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Employability Index</div>
            <div className="text-base font-extrabold text-blue-400 dark:text-blue-400 mt-0.5">
              {student.employabilityIndex}%
            </div>
          </div>
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">ATS Resume Match</div>
            <div className="text-base font-extrabold text-emerald-400 dark:text-emerald-400 mt-0.5">
              {student.atsReadinessScore}%
            </div>
          </div>
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Weekly Study Hours</div>
            <div className="text-base font-extrabold text-text-primary dark:text-slate-200 mt-0.5">
              {student.weeklyStudyHours} hrs
            </div>
          </div>
          <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/50">
            <div className="text-text-muted text-[10px] font-bold uppercase">Active Streak</div>
            <div className="text-base font-extrabold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" /> {student.streakDays} Days
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-border-theme dark:border-border-theme px-6 bg-surface/50 dark:bg-primary-blue/40 text-xs">
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'skills'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Skill Gap & Competency Telemetry
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interviews'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Mock Interviews ({student.mockInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab('interventions')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interventions'
                ? 'border-blue-600 text-blue-400 dark:text-blue-400'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            <Zap className="w-4 h-4" /> Mentorship & Protocols ({student.interventionHistory.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
                Verified Skill Competencies & Target Trajectories
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {student.skills.map((skill) => (
                  <div
                    key={skill.skill}
                    className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary/80 border border-border-theme dark:border-border-theme space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-text-primary dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        {skill.skill}
                        {skill.verifiedCredential && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </span>
                      <span className="text-blue-400 dark:text-blue-400">
                        {skill.currentMastery}% / {skill.targetMastery}%
                      </span>
                    </div>

                    <div className="w-full bg-border-theme dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                        style={{ width: `${skill.currentMastery}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>Category: {skill.category}</span>
                      <span className={skill.growthVelocity >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-600 font-bold'}>
                        Velocity: {skill.growthVelocity >= 0 ? `+${skill.growthVelocity}%` : `${skill.growthVelocity}%`} /mo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
                  Mock Interview Telemetry Log
                </h4>
                <button
                  onClick={() => setShowAddInterview(!showAddInterview)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Log Mock Assessment
                </button>
              </div>

              {showAddInterview && (
                <form onSubmit={handleSubmitInterview} className="p-4 rounded-2xl bg-blue-500/20 dark:bg-blue-950/40 border border-blue-500/30 dark:border-blue-900 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-text-primary dark:text-slate-300 mb-1">Interview Type</label>
                      <select
                        value={interviewType}
                        onChange={(e) => setInterviewType(e.target.value as any)}
                        className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme text-xs"
                      >
                        <option value="SYSTEM_DESIGN">System Design</option>
                        <option value="CODING_ALGORITHMS">Coding & Algorithms</option>
                        <option value="BEHAVIORAL_LEADERSHIP">Behavioral & Leadership</option>
                        <option value="AI_ARCHITECTURE">AI Architecture</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-text-primary dark:text-slate-300 mb-1">Score (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={interviewScore}
                        onChange={(e) => setInterviewScore(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-text-primary dark:text-slate-300 mb-1">Interviewer Name</label>
                      <input
                        type="text"
                        value={interviewer}
                        onChange={(e) => setInterviewer(e.target.value)}
                        className="w-full p-2 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-primary dark:text-slate-300 mb-1">Detailed Feedback</label>
                    <textarea
                      rows={2}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Candidate's technical performance notes and key recommendations..."
                      className="w-full p-2.5 rounded-lg bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme text-xs"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddInterview(false)}
                      className="px-3 py-1 text-xs text-text-secondary dark:text-text-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                    >
                      Save Mock Result
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {student.mockInterviews.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No mock interviews recorded yet.</p>
                ) : (
                  student.mockInterviews.map((mock) => (
                    <div
                      key={mock.id}
                      className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-text-primary dark:text-white">
                          {mock.interviewType.replace(/_/g, ' ')}
                        </span>
                        <span className="font-extrabold text-blue-400 dark:text-blue-400">
                          {mock.score}% Score
                        </span>
                      </div>
                      <div className="text-xs text-text-secondary dark:text-text-muted">
                        Interviewer: <span className="font-semibold text-text-primary dark:text-slate-200">{mock.interviewer}</span> • {new Date(mock.date).toLocaleDateString()}
                      </div>
                      <p className="text-xs text-text-primary dark:text-slate-300 italic pt-1">
                        "{mock.feedback}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'interventions' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary border border-border-theme dark:border-border-theme flex justify-between items-center text-xs">
                <div>
                  <span className="text-text-muted font-bold uppercase text-[10px]">Assigned Career Mentor</span>
                  <div className="text-sm font-bold text-text-primary dark:text-white mt-0.5">
                    {student.mentorAssigned || 'Unassigned — Trigger Intervention to assign'}
                  </div>
                </div>
                <button
                  onClick={() => onIntervene(student)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/200 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Launch Protocol
                </button>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted dark:text-text-muted">
                Protocol Intervention Ledger
              </h4>
              <div className="space-y-3">
                {student.interventionHistory.length === 0 ? (
                  <p className="text-xs text-text-muted italic">No previous emergency interventions required.</p>
                ) : (
                  student.interventionHistory.map((intv) => (
                    <div
                      key={intv.id}
                      className="p-3.5 rounded-xl bg-amber-500/20 dark:bg-amber-950/30 border border-amber-500/30 dark:border-amber-900 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                        <span>⚡ {intv.protocol.replace(/_/g, ' ')}</span>
                        <span className="text-[11px] font-normal">{new Date(intv.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="text-amber-800 dark:text-amber-300">
                        Initiated by {intv.initiatedBy}
                      </div>
                      <div className="text-text-primary dark:text-slate-300 italic text-[11px]">
                        {intv.notes}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

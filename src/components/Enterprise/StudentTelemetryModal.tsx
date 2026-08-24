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
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
      case 'ON_TRACK':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
      case 'AT_RISK':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
      case 'CRITICAL_INTERVENTION':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={student.avatarUrl}
              alt={student.fullName}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-md"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {student.fullName}
                </h2>
                <span className="font-mono text-xs text-slate-400">
                  {student.studentId}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getRiskBadge(student.riskStatus)}`}>
                  {student.riskStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> {student.institution} ({student.graduationYear})
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> {student.targetDomain.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onIntervene(student)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4" /> Trigger Intervention
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Quick Telemetry Band */}
        <div className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-slate-400 text-[10px] font-bold uppercase">Employability Index</div>
            <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
              {student.employabilityIndex}%
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-slate-400 text-[10px] font-bold uppercase">ATS Resume Match</div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {student.atsReadinessScore}%
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-slate-400 text-[10px] font-bold uppercase">Weekly Study Hours</div>
            <div className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
              {student.weeklyStudyHours} hrs
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="text-slate-400 text-[10px] font-bold uppercase">Active Streak</div>
            <div className="text-base font-extrabold text-amber-500 mt-0.5 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" /> {student.streakDays} Days
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
          <button
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'skills'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Skill Gap & Competency Telemetry
          </button>
          <button
            onClick={() => setActiveTab('interviews')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interviews'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Mock Interviews ({student.mockInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab('interventions')}
            className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interventions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" /> Mentorship & Protocols ({student.interventionHistory.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Verified Skill Competencies & Target Trajectories
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {student.skills.map((skill) => (
                  <div
                    key={skill.skill}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        {skill.skill}
                        {skill.verifiedCredential && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {skill.currentMastery}% / {skill.targetMastery}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                        style={{ width: `${skill.currentMastery}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Category: {skill.category}</span>
                      <span className={skill.growthVelocity >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
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
                <form onSubmit={handleSubmitInterview} className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Interview Type</label>
                      <select
                        value={interviewType}
                        onChange={(e) => setInterviewType(e.target.value as any)}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                      >
                        <option value="SYSTEM_DESIGN">System Design</option>
                        <option value="CODING_ALGORITHMS">Coding & Algorithms</option>
                        <option value="BEHAVIORAL_LEADERSHIP">Behavioral & Leadership</option>
                        <option value="AI_ARCHITECTURE">AI Architecture</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Score (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={interviewScore}
                        onChange={(e) => setInterviewScore(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Interviewer Name</label>
                      <input
                        type="text"
                        value={interviewer}
                        onChange={(e) => setInterviewer(e.target.value)}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Detailed Feedback</label>
                    <textarea
                      rows={2}
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Candidate's technical performance notes and key recommendations..."
                      className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddInterview(false)}
                      className="px-3 py-1 text-xs text-slate-600 dark:text-slate-400"
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
                  <p className="text-xs text-slate-400 italic">No mock interviews recorded yet.</p>
                ) : (
                  student.mockInterviews.map((mock) => (
                    <div
                      key={mock.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {mock.interviewType.replace(/_/g, ' ')}
                        </span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">
                          {mock.score}% Score
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Interviewer: <span className="font-semibold text-slate-800 dark:text-slate-200">{mock.interviewer}</span> • {new Date(mock.date).toLocaleDateString()}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic pt-1">
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
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Assigned Career Mentor</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {student.mentorAssigned || 'Unassigned — Trigger Intervention to assign'}
                  </div>
                </div>
                <button
                  onClick={() => onIntervene(student)}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" /> Launch Protocol
                </button>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Protocol Intervention Ledger
              </h4>
              <div className="space-y-3">
                {student.interventionHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No previous emergency interventions required.</p>
                ) : (
                  student.interventionHistory.map((intv) => (
                    <div
                      key={intv.id}
                      className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs space-y-1"
                    >
                      <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                        <span>⚡ {intv.protocol.replace(/_/g, ' ')}</span>
                        <span className="text-[11px] font-normal">{new Date(intv.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="text-amber-800 dark:text-amber-300">
                        Initiated by {intv.initiatedBy}
                      </div>
                      <div className="text-slate-700 dark:text-slate-300 italic text-[11px]">
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

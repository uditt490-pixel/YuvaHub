import React, { useState } from 'react';
import { Award, Trophy, ShieldCheck, Search, CheckCircle2, Clock, Activity, Sparkles, Code2, Gavel, Star, FileCode } from 'lucide-react';
import SubmissionEvaluationCard from '../components/SubmissionEvaluationCard';
import EvaluationStreamTimeline from '../components/EvaluationStreamTimeline';

export interface HackathonSubmissionItem {
  id: string;
  projectName: string;
  trackName: string;
  teamLead: string;
  technicalComplexityScore: number;
  innovationOriginalityScore: number;
  codeQualityScore: number;
  totalWeightedScore: number;
  judgeStatus: 'EVALUATED' | 'UNDER_REVIEW' | 'FLAGGED_PLAGIARISM';
  githubRepoUrl: string;
}

const HACKATHON_SUBMISSIONS: HackathonSubmissionItem[] = [
  {
    id: 'sub-301',
    projectName: 'NeuroShield - Real-Time EEG Seizure Prediction',
    trackName: 'AI & Healthcare Track',
    teamLead: 'Siddharth Varma (Team Synapse)',
    technicalComplexityScore: 98.0,
    innovationOriginalityScore: 95.5,
    codeQualityScore: 94.0,
    totalWeightedScore: 96.2,
    judgeStatus: 'EVALUATED',
    githubRepoUrl: 'github.com/yuva-hack/neuroshield',
  },
  {
    id: 'sub-302',
    projectName: 'ChainPay - Offline Zero-Knowledge Crypto POS',
    trackName: 'Web3 & FinTech Track',
    teamLead: 'Elena Rostova',
    technicalComplexityScore: 92.5,
    innovationOriginalityScore: 96.0,
    codeQualityScore: 90.0,
    totalWeightedScore: 93.1,
    judgeStatus: 'UNDER_REVIEW',
    githubRepoUrl: 'github.com/yuva-hack/chainpay-zk',
  },
  {
    id: 'sub-303',
    projectName: 'AgriSense - IoT Soil Carbon Sequestration Sensor',
    trackName: 'Climate & Sustainability Track',
    teamLead: 'Karan Mehra',
    technicalComplexityScore: 89.0,
    innovationOriginalityScore: 91.0,
    codeQualityScore: 88.5,
    totalWeightedScore: 89.6,
    judgeStatus: 'EVALUATED',
    githubRepoUrl: 'github.com/yuva-hack/agrisense-iot',
  },
];

export default function HackathonJudgeStudioPage() {
  const [submissions, setSubmissions] = useState<HackathonSubmissionItem[]>(HACKATHON_SUBMISSIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'submissions' | 'evaluation-stream'>('submissions');
  const [selectedSubmissionModal, setSelectedSubmissionModal] = useState<HackathonSubmissionItem | null>(null);

  const evaluatedCount = submissions.filter(s => s.judgeStatus === 'EVALUATED').length;

  const filteredSubmissions = submissions.filter(s =>
    s.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.trackName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.teamLead.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen  p-6 md:p-10 font-sans">
      {/* Header Banner */}
      <header className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 border border-amber-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold border border-amber-500/30 flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5" /> YuvaHub Jury Engine
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Automated AST Code Similarity & Plagiarism Audited
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-200 bg-clip-text text-transparent">
              Hackathon Jury & Project Evaluation Studio
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
              Multi-dimensional rubric scoring, automated GitHub repository code quality inspection, live leaderboards, and prize pool allocation management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-amber-600/30 transition flex items-center gap-2 border border-amber-400/20 text-sm">
              <Trophy className="w-4 h-4" /> Finalize Track Leaderboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Evaluated Projects</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{evaluatedCount} / {submissions.length}</div>
            <div className="text-emerald-400 text-xs mt-2 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Rubric Verification Complete
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Top Project Score</span>
              <Star className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">96.2 / 100</div>
            <div className="text-orange-400 text-xs mt-2 font-medium">
              NeuroShield (Healthcare Track)
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>AST Plagiarism Clean Rate</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">99.1% Clean</div>
            <div className="text-emerald-400 text-xs mt-2 font-medium">
              Zero Unattributed Code Clones
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'submissions'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Code2 className="w-4 h-4" /> Project Submissions
            </button>
            <button
              onClick={() => setActiveTab('evaluation-stream')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'evaluation-stream'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" /> Live Jury Stream
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search project or track..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Tab Body */}
        {activeTab === 'evaluation-stream' ? (
          <EvaluationStreamTimeline />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSubmissions.map((sub) => (
              <SubmissionEvaluationCard
                key={sub.id}
                submission={sub}
                onInspect={() => setSelectedSubmissionModal(sub)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal View */}
      {selectedSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedSubmissionModal(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>

            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedSubmissionModal.projectName}</h3>
                <div className="text-xs text-slate-400 font-mono">Track: {selectedSubmissionModal.trackName}</div>
              </div>
              <span className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded font-mono text-xs font-bold border border-amber-500/30">
                {selectedSubmissionModal.judgeStatus}
              </span>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Rubric Score Breakdown</span>
                <span className="text-amber-400 font-bold text-sm">Tech: {selectedSubmissionModal.technicalComplexityScore} | Innovation: {selectedSubmissionModal.innovationOriginalityScore} | Code: {selectedSubmissionModal.codeQualityScore}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 block">Repository Ref</span>
                <span className="text-orange-300 font-semibold">{selectedSubmissionModal.githubRepoUrl}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedSubmissionModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs transition"
              >
                Close Rubric Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

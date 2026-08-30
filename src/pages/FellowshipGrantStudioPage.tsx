import React, { useState } from 'react';
import { Award, GraduationCap, ShieldCheck, Search, CheckCircle2, Clock, Activity, DollarSign, Sparkles, BookOpen, Users, FileCheck } from 'lucide-react';
import FellowshipGrantCard from '../components/FellowshipGrantCard';
import GrantStreamTimeline from '../components/GrantStreamTimeline';

export interface StudentFellowshipItem {
  id: string;
  fellowshipTitle: string;
  grantProvider: string;
  eligibleDomain: string;
  stipendAmountMonthlyINR: number;
  durationMonths: number;
  aiEligibilityMatchScore: number;
  applicationDeadline: string;
  status: 'OPEN_APPLICATIONS' | 'INTERVIEW_PHASE' | 'AWARDED';
  keyRequirement: string;
}

const FELLOWSHIP_GRANTS: StudentFellowshipItem[] = [
  {
    id: 'fel-701',
    fellowshipTitle: 'PM Research Fellowship (PMRF) - DeepTech AI',
    grantProvider: 'Ministry of Education & IIT Council',
    eligibleDomain: 'Artificial Intelligence & Robotics',
    stipendAmountMonthlyINR: 80000,
    durationMonths: 24,
    aiEligibilityMatchScore: 96.5,
    applicationDeadline: 'Sept 30, 2026',
    status: 'OPEN_APPLICATIONS',
    keyRequirement: 'Minimum CGPA 8.5/10 & 1 Top-Tier Conference Publication',
  },
  {
    id: 'fel-702',
    fellowshipTitle: 'YuvaHub Innovation Seed Grant 2026',
    grantProvider: 'YuvaHub Foundation & Industry Partners',
    eligibleDomain: 'Clean Energy & Climate Solutions',
    stipendAmountMonthlyINR: 50000,
    durationMonths: 12,
    aiEligibilityMatchScore: 91.2,
    applicationDeadline: 'Oct 15, 2026',
    status: 'INTERVIEW_PHASE',
    keyRequirement: 'Working Hardware Prototype & Industry Mentor Endorsement',
  },
  {
    id: 'fel-703',
    fellowshipTitle: 'Global STEM Women Leadership Fellowship',
    grantProvider: 'Global Tech Initiative & UNESCO',
    eligibleDomain: 'Biotechnology & Data Science',
    stipendAmountMonthlyINR: 75000,
    durationMonths: 18,
    aiEligibilityMatchScore: 98.0,
    applicationDeadline: 'Nov 01, 2026',
    status: 'OPEN_APPLICATIONS',
    keyRequirement: 'Demonstrated Community Impact & Research Proposal',
  },
];

export default function FellowshipGrantStudioPage() {
  const [grants, setGrants] = useState<StudentFellowshipItem[]>(FELLOWSHIP_GRANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'grants' | 'grant-stream'>('grants');
  const [selectedGrantModal, setSelectedGrantModal] = useState<StudentFellowshipItem | null>(null);

  const totalStipendValuation = grants.reduce((acc, g) => acc + (g.stipendAmountMonthlyINR * g.durationMonths), 0);

  const filteredGrants = grants.filter(g =>
    g.fellowshipTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.grantProvider.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.eligibleDomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen  p-6 md:p-10 font-sans">
      {/* Header Banner */}
      <header className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full font-semibold border border-purple-500/30 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> YuvaHub Fellowship Studio
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Direct Benefit Transfer (DBT) Verified
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-200 bg-clip-text text-transparent">
              Student Fellowship & Research Grant Studio
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
              National research fellowship matching, automated AI eligibility scoring, monthly stipend disbursement tracking, and proposal endorsement workflows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-purple-600/30 transition flex items-center gap-2 border border-purple-400/20 text-sm">
              <Award className="w-4 h-4" /> Check Fellowship Eligibility
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
              <span>Total Fellowship Pool Value</span>
              <DollarSign className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">₹{(totalStipendValuation / 100000).toFixed(1)} Lakhs</div>
            <div className="text-purple-400 text-xs mt-2 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Funded Research Slots
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>AI Match Accuracy Rate</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">95.2% Score</div>
            <div className="text-indigo-400 text-xs mt-2 font-medium">
              Academic Transcript & Skills Matched
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Research Fellows</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">185 Fellows</div>
            <div className="text-cyan-400 text-xs mt-2 font-medium">
              Enrolled Across Premier Institutions
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('grants')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'grants'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-4 h-4" /> Available Fellowships
            </button>
            <button
              onClick={() => setActiveTab('grant-stream')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'grant-stream'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" /> Live Grant Disbursement Stream
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search fellowship or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Tab Body */}
        {activeTab === 'grant-stream' ? (
          <GrantStreamTimeline />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGrants.map((grant) => (
              <FellowshipGrantCard
                key={grant.id}
                grant={grant}
                onInspect={() => setSelectedGrantModal(grant)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal View */}
      {selectedGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedGrantModal(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>

            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedGrantModal.fellowshipTitle}</h3>
                <div className="text-xs text-slate-400 font-mono">Provider: {selectedGrantModal.grantProvider}</div>
              </div>
              <span className="bg-purple-500/20 text-purple-400 px-2.5 py-1 rounded font-mono text-xs font-bold border border-purple-500/30">
                {selectedGrantModal.status}
              </span>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Monthly Stipend</span>
                <span className="text-purple-400 font-bold text-sm">₹{selectedGrantModal.stipendAmountMonthlyINR.toLocaleString('en-IN')} / month ({selectedGrantModal.durationMonths} Months)</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 block">Key Eligibility Requirement</span>
                <span className="text-indigo-300 font-semibold">{selectedGrantModal.keyRequirement}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedGrantModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs transition"
              >
                Close Fellowship View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

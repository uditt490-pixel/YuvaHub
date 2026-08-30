import React, { useState } from 'react';
import { Rocket, ShieldCheck, Download, Search, Sparkles, CheckCircle2, Clock, Activity, TrendingUp, DollarSign, Building2, Award } from 'lucide-react';
import IncubationStartupCard from '../components/IncubationStartupCard';
import IncubationStreamTimeline from '../components/IncubationStreamTimeline';

export interface StartupCohortItem {
  id: string;
  startupName: string;
  sectorDomain: string;
  foundingLead: string;
  totalGrantDisbursedINR: number;
  milestoneStage: 'MILESTONE_1_MVP' | 'MILESTONE_2_TRACTION' | 'MILESTONE_3_SCALE';
  investorReadinessScore: number;
  cohortYear: string;
  status: 'GRANT_APPROVED' | 'IN_AUDIT' | 'FUNDED';
  keyTractionMetric: string;
}

const INCUBATION_COHORTS: StartupCohortItem[] = [
  {
    id: 'inc-901',
    startupName: 'Nexus AI - MedTech Diagnostics',
    sectorDomain: 'Healthcare & Clinical AI',
    foundingLead: 'Priya Sharma (IIT Bombay Alum)',
    totalGrantDisbursedINR: 2500000,
    milestoneStage: 'MILESTONE_2_TRACTION',
    investorReadinessScore: 94.8,
    cohortYear: 'Cohort 2026-Q1',
    status: 'FUNDED',
    keyTractionMetric: '15 Active Hospital Pilots & ₹1.2M ARR',
  },
  {
    id: 'inc-902',
    startupName: 'GreenGrid Mobility - EV Battery Swapping',
    sectorDomain: 'CleanTech & Sustainable Mobility',
    foundingLead: 'Rohan Gupta & Team',
    totalGrantDisbursedINR: 1500000,
    milestoneStage: 'MILESTONE_1_MVP',
    investorReadinessScore: 88.5,
    cohortYear: 'Cohort 2026-Q2',
    status: 'GRANT_APPROVED',
    keyTractionMetric: '120 Swap Stations Deployed across Metro Hubs',
  },
  {
    id: 'inc-903',
    startupName: 'FinNova - Micro-MSME Supply Chain Credit',
    sectorDomain: 'FinTech & B2B Banking',
    foundingLead: 'Ananya Roy',
    totalGrantDisbursedINR: 3500000,
    milestoneStage: 'MILESTONE_3_SCALE',
    investorReadinessScore: 97.2,
    cohortYear: 'Cohort 2025-Q4',
    status: 'FUNDED',
    keyTractionMetric: '₹45M Loan Volume Processed / 0.2% NPL',
  },
];

export default function IncubationAcceleratorPage() {
  const [startups, setStartups] = useState<StartupCohortItem[]>(INCUBATION_COHORTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'startups' | 'incubation-stream'>('startups');
  const [selectedStartupModal, setSelectedStartupModal] = useState<StartupCohortItem | null>(null);

  const totalGrantsINR = startups.reduce((acc, s) => acc + s.totalGrantDisbursedINR, 0);

  const filteredStartups = startups.filter(s =>
    s.startupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.foundingLead.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sectorDomain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen  p-6 md:p-10 font-sans">
      {/* Header Banner */}
      <header className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5" /> YuvaHub Incubation Accelerator
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Startup India & TIDE 2.0 Grant Verified
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-200 bg-clip-text text-transparent">
              Enterprise Incubation & Startup Accelerator Hub
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
              Seed capital milestone tracking, AI investor readiness scoring, venture capital demo day matching, and government grant disbursement management.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 border border-emerald-400/20 text-sm">
              <Rocket className="w-4 h-4" /> Apply for Seed Funding
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
              <span>Total Seed Capital Disbursed</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">₹{(totalGrantsINR / 100000).toFixed(1)} Lakhs</div>
            <div className="text-emerald-400 text-xs mt-2 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Milestone Verified
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Mean Investor Readiness</span>
              <Award className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">93.5% Score</div>
            <div className="text-teal-400 text-xs mt-2 font-medium">
              Top 5% Institutional VC Match
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Cohort Survival Rate</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">94.2%</div>
            <div className="text-cyan-400 text-xs mt-2 font-medium">
              42 Startups Active in Portfolio
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('startups')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'startups'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-4 h-4" /> Portfolio Startups
            </button>
            <button
              onClick={() => setActiveTab('incubation-stream')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'incubation-stream'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-4 h-4" /> Live Grant & Demo Stream
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search startup or lead..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Tab Body */}
        {activeTab === 'incubation-stream' ? (
          <IncubationStreamTimeline />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredStartups.map((sup) => (
              <IncubationStartupCard
                key={sup.id}
                startup={sup}
                onInspect={() => setSelectedStartupModal(sup)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal View */}
      {selectedStartupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedStartupModal(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>

            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedStartupModal.startupName}</h3>
                <div className="text-xs text-slate-400 font-mono">Founding Lead: {selectedStartupModal.foundingLead}</div>
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded font-mono text-xs font-bold border border-emerald-500/30">
                {selectedStartupModal.status}
              </span>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Grant Disbursed</span>
                <span className="text-emerald-400 font-bold text-sm">₹{(selectedStartupModal.totalGrantDisbursedINR / 100000).toFixed(2)} Lakhs</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 block">Key Traction Metric</span>
                <span className="text-teal-300 font-semibold">{selectedStartupModal.keyTractionMetric}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedStartupModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs transition"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

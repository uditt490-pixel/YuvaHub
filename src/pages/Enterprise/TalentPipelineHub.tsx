import React, { useState, useEffect } from 'react';
import {
  Candidate,
  PipelineStage,
  PipelineFilterOptions,
  PipelineAnalyticsSummary,
  FastTrackPayload
} from '../../types/talentPipeline';
import { TalentPipelineService } from '../../services/TalentPipelineService';
import { TalentAnalyticsCard } from '../../components/Enterprise/TalentAnalyticsCard';
import { TalentFilterToolbar } from '../../components/Enterprise/TalentFilterToolbar';
import { CandidateDetailModal } from '../../components/Enterprise/CandidateDetailModal';
import { FastTrackModal } from '../../components/Enterprise/FastTrackModal';
import {
  Briefcase,
  LayoutGrid,
  Kanban,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Award,
  AlertCircle,
  Building,
  UserCheck,
  TrendingUp,
  Clock,
  Layers
} from 'lucide-react';

const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'SOURCED', label: 'Sourced', color: 'border-border-theme dark:border-border-theme bg-surface0/10' },
  { key: 'AI_SCREENED', label: 'AI Screened', color: 'border-blue-300 dark:border-blue-700 bg-blue-500/200/10' },
  { key: 'TECHNICAL_ASSESSMENT', label: 'Technical Assessment', color: 'border-purple-300 dark:border-purple-700 bg-purple-500/200/10' },
  { key: 'LEADERSHIP_ROUND', label: 'Leadership Loop', color: 'border-amber-300 dark:border-amber-700 bg-amber-500/200/10' },
  { key: 'OFFER_EXTENDED', label: 'Offer Extended', color: 'border-emerald-300 dark:border-emerald-700 bg-emerald-500/200/10' },
  { key: 'HIRED', label: 'Hired & Onboarded', color: 'border-green-400 dark:border-green-600 bg-green-500/15' }
];

export const TalentPipelineHub: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [analytics, setAnalytics] = useState<PipelineAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<'kanban' | 'roster' | 'benchmarks'>('kanban');

  // Filters
  const [filters, setFilters] = useState<PipelineFilterOptions>({
    searchQuery: '',
    stage: 'ALL',
    priority: 'ALL',
    minAtsScore: 0,
    minGpa: 0,
    selectedCollege: '',
    selectedSkill: '',
    sortBy: 'compositeFit',
    sortOrder: 'desc'
  });

  // Modals & Selection
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [fastTrackTarget, setFastTrackTarget] = useState<Candidate | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warn' } | null>(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [candList, summary] = await Promise.all([
        TalentPipelineService.getCandidates(filters),
        TalentPipelineService.getAnalyticsSummary()
      ]);
      setCandidates(candList);
      setAnalytics(summary);
    } catch (err) {
      showToast('Failed to load candidate data', 'warn');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStageUpdate = async (id: string, newStage: PipelineStage, notes?: string) => {
    try {
      const updated = await TalentPipelineService.updateCandidateStage(
        id,
        newStage,
        'Campus Talent Admin',
        notes
      );
      setCandidates((prev) => prev.map((c) => (c.id === id ? updated : c)));
      if (selectedCandidate && selectedCandidate.id === id) {
        setSelectedCandidate(updated);
      }
      showToast(`Candidate transitioned to ${newStage.replace(/_/g, ' ')}`);
      // refresh analytics
      const summary = await TalentPipelineService.getAnalyticsSummary();
      setAnalytics(summary);
    } catch (err: any) {
      showToast(err.message || 'Stage transition failed', 'warn');
    }
  };

  const handleFastTrackPromotion = async (payload: FastTrackPayload) => {
    try {
      const updated = await TalentPipelineService.executeFastTrackPromotion(payload);
      setCandidates((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      if (selectedCandidate && selectedCandidate.id === updated.id) {
        setSelectedCandidate(updated);
      }
      setFastTrackTarget(null);
      showToast(`⚡ Fast-Track Protocol executed for ${updated.fullName}`, 'success');
      const summary = await TalentPipelineService.getAnalyticsSummary();
      setAnalytics(summary);
    } catch (err: any) {
      showToast(err.message || 'Fast-track failed', 'warn');
    }
  };

  const handleAddNote = async (id: string, note: string) => {
    try {
      const updated = await TalentPipelineService.addCandidateNote(
        id,
        note,
        'Technical Recruiter'
      );
      setCandidates((prev) => prev.map((c) => (c.id === id ? updated : c)));
      if (selectedCandidate && selectedCandidate.id === id) {
        setSelectedCandidate(updated);
      }
      showToast('Reviewer note saved to audit ledger');
    } catch (err: any) {
      showToast('Failed to add note', 'warn');
    }
  };

  const handleBatchAdvance = async (targetStage: PipelineStage) => {
    if (selectedCandidateIds.length === 0) return;
    try {
      await TalentPipelineService.batchPromoteCandidates(
        selectedCandidateIds,
        targetStage,
        'Campus TPO Gateway'
      );
      showToast(`Advanced ${selectedCandidateIds.length} candidates to ${targetStage}`);
      setSelectedCandidateIds([]);
      loadData();
    } catch (err) {
      showToast('Batch update failed', 'warn');
    }
  };

  const handleExportCsv = () => {
    const csv = TalentPipelineService.exportTalentRosterCSV(candidates);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `YuvaHub_Talent_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Talent Roster CSV');
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      stage: 'ALL',
      priority: 'ALL',
      minAtsScore: 0,
      minGpa: 0,
      selectedCollege: '',
      selectedSkill: '',
      sortBy: 'compositeFit',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="min-h-screen bg-surface dark:bg-slate-950 text-text-primary dark:text-slate-100 p-4 sm:p-6 lg:p-10 font-sans space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 bg-primary-blue text-white dark:bg-surface dark:text-text-primary border border-border-theme animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-surface dark:bg-primary-blue p-6 rounded-3xl border border-border-theme dark:border-border-theme shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 dark:bg-blue-950 text-blue-400 dark:text-blue-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-blue-500/30 dark:border-blue-900">
              <Briefcase className="w-3.5 h-3.5" /> Enterprise Placement Gateway
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-secondary dark:bg-surface-secondary text-text-secondary dark:text-slate-300 text-[10px] font-mono font-bold">
              ISO-27001 / SOC-2
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white tracking-tight">
            Campus Talent Pipeline & Placement Command Station
          </h1>
          <p className="text-xs sm:text-sm text-text-muted dark:text-text-muted mt-1">
            Autonomous multi-campus sourcing, real-time code telemetry, and AI interview orchestration.
          </p>
        </div>

        {/* View Switchers */}
        <div className="flex items-center bg-surface-secondary dark:bg-surface-secondary p-1.5 rounded-2xl border border-border-theme dark:border-border-theme">
          <button
            onClick={() => setActiveView('kanban')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'kanban'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <Kanban className="w-4 h-4" /> Pipeline Board
          </button>
          <button
            onClick={() => setActiveView('roster')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'roster'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Candidate Roster
          </button>
          <button
            onClick={() => setActiveView('benchmarks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeView === 'benchmarks'
                ? 'bg-surface dark:bg-primary-blue text-blue-400 dark:text-blue-400 shadow-sm'
                : 'text-text-muted hover:text-text-primary dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> AI Telemetry
          </button>
        </div>
      </div>

      {/* Analytics KPI Section */}
      {analytics && <TalentAnalyticsCard analytics={analytics} />}

      {/* Filter Bar */}
      <TalentFilterToolbar
        filters={filters}
        onChange={setFilters}
        onReset={resetFilters}
        onExportCsv={handleExportCsv}
        totalMatches={candidates.length}
      />

      {/* Bulk Action Bar (when candidates selected) */}
      {selectedCandidateIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-blue-600 text-white flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-blue-500/20">
          <div className="flex items-center gap-2 text-xs font-bold">
            <UserCheck className="w-4 h-4" />
            <span>{selectedCandidateIds.length} candidate(s) selected for batch execution</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleBatchAdvance('TECHNICAL_ASSESSMENT')}
              className="px-3 py-1.5 bg-surface text-blue-400 font-bold rounded-xl hover:bg-blue-500/20 transition-colors"
            >
              Batch to Tech Round
            </button>
            <button
              onClick={() => handleBatchAdvance('LEADERSHIP_ROUND')}
              className="px-3 py-1.5 bg-surface text-blue-400 font-bold rounded-xl hover:bg-blue-500/20 transition-colors"
            >
              Batch to Final Loop
            </button>
            <button
              onClick={() => setSelectedCandidateIds([])}
              className="px-3 py-1.5 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main View Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Syncing Campus Telemetry Streams...
          </p>
        </div>
      ) : activeView === 'kanban' ? (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4 items-start">
          {STAGES.map((stg) => {
            const colCandidates = candidates.filter((c) => c.currentStage === stg.key);
            return (
              <div
                key={stg.key}
                className={`rounded-2xl border ${stg.color} p-3.5 space-y-3 min-h-[500px] flex flex-col`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border-theme dark:border-border-theme">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-text-primary dark:text-slate-200">
                    {stg.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-border-theme dark:bg-surface-secondary text-[11px] font-bold text-text-primary dark:text-slate-300">
                    {colCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colCandidates.length === 0 ? (
                    <div className="p-4 text-center text-text-muted text-xs italic">
                      No candidates in this stage
                    </div>
                  ) : (
                    colCandidates.map((cand) => (
                      <div
                        key={cand.id}
                        onClick={() => setSelectedCandidate(cand)}
                        className="p-4 rounded-2xl bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme shadow-sm hover:shadow-md hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={cand.avatarUrl}
                              alt={cand.fullName}
                              className="w-9 h-9 rounded-xl object-cover border border-border-theme dark:border-border-theme"
                            />
                            <div>
                              <div className="text-xs font-bold text-text-primary dark:text-white leading-tight">
                                {cand.fullName}
                              </div>
                              <div className="text-[10px] text-text-muted dark:text-text-muted truncate max-w-[130px]">
                                {cand.college}
                              </div>
                            </div>
                          </div>
                          {cand.priority === 'CRITICAL_MATCH' && (
                            <span className="p-1 rounded-md bg-amber-500/200 text-white shrink-0" title="Critical Match">
                              <Zap className="w-3 h-3" />
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-semibold text-text-primary dark:text-slate-300">
                          {cand.targetRole}
                        </div>

                        {/* Metrics Meter */}
                        <div className="p-2 rounded-xl bg-surface dark:bg-surface-secondary/80 text-[10px] space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-text-muted">AI Composite Fit</span>
                            <span className="text-blue-400 dark:text-blue-400">
                              {cand.assessment.compositeFitScore}%
                            </span>
                          </div>
                          <div className="w-full bg-border-theme dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${cand.assessment.compositeFitScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {cand.skills.slice(0, 2).map((s) => (
                            <span
                              key={s.name}
                              className="text-[9px] px-1.5 py-0.5 rounded-md bg-surface-secondary dark:bg-surface-secondary text-text-secondary dark:text-slate-300 font-medium"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>

                        <div className="pt-2 border-t border-border-theme dark:border-border-theme flex items-center justify-between text-[10px] text-text-muted">
                          <span>₹{cand.expectedCtcLpa} LPA</span>
                          <span className="font-bold text-blue-400 dark:text-blue-400 flex items-center gap-0.5">
                            Inspect <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : activeView === 'roster' ? (
        /* Table / Roster Grid View */
        <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface dark:bg-surface-secondary/80 border-b border-border-theme dark:border-border-theme text-text-muted dark:text-text-muted font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        candidates.length > 0 &&
                        selectedCandidateIds.length === candidates.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCandidateIds(candidates.map((c) => c.id));
                        } else {
                          setSelectedCandidateIds([]);
                        }
                      }}
                      className="rounded accent-blue-600"
                    />
                  </th>
                  <th className="p-4">Candidate & College</th>
                  <th className="p-4">Target Engineering Role</th>
                  <th className="p-4">Stage</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">AI Fit Score</th>
                  <th className="p-4">CGPA</th>
                  <th className="p-4">Expected CTC</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {candidates.map((c) => {
                  const isChecked = selectedCandidateIds.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-surface dark:hover:bg-surface-secondary/50 transition-colors ${
                        isChecked ? 'bg-blue-500/20/50 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCandidateIds([...selectedCandidateIds, c.id]);
                            } else {
                              setSelectedCandidateIds(
                                selectedCandidateIds.filter((id) => id !== c.id)
                              );
                            }
                          }}
                          className="rounded accent-blue-600"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.avatarUrl}
                            alt={c.fullName}
                            className="w-10 h-10 rounded-xl object-cover border border-border-theme dark:border-border-theme"
                          />
                          <div>
                            <div className="font-bold text-text-primary dark:text-white">
                              {c.fullName}
                            </div>
                            <div className="text-[11px] text-text-muted">{c.college}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-text-primary dark:text-slate-200">
                        {c.targetRole}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-surface-secondary dark:bg-surface-secondary text-text-primary dark:text-slate-300 border border-border-theme dark:border-border-theme">
                          {c.currentStage.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        {c.priority === 'CRITICAL_MATCH' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/200 text-white flex items-center gap-1 w-fit">
                            <Zap className="w-3 h-3" /> Critical
                          </span>
                        ) : (
                          <span className="text-text-muted text-[11px]">{c.priority}</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-blue-400 dark:text-blue-400">
                        {c.assessment.compositeFitScore}%
                      </td>
                      <td className="p-4 font-semibold text-emerald-400 dark:text-emerald-400">
                        {c.gpa} / 10
                      </td>
                      <td className="p-4 font-mono font-bold">₹{c.expectedCtcLpa} LPA</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedCandidate(c)}
                          className="px-3 py-1 rounded-lg bg-blue-500/20 dark:bg-blue-950 text-blue-400 dark:text-blue-400 font-bold hover:bg-blue-500/200/20 transition-colors"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => setFastTrackTarget(c)}
                          className="px-3 py-1 rounded-lg bg-amber-500/20 dark:bg-amber-950 text-amber-400 dark:text-amber-400 font-bold hover:bg-amber-500/200/20 transition-colors"
                        >
                          Fast-Track
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* AI Telemetry & Benchmarks View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              Autonomous AI Ingestion Diagnostics
            </h3>
            <p className="text-xs text-text-muted dark:text-text-muted leading-relaxed">
              YuvaHub's proprietary multi-modal assessment parser correlates ATS keyword density, live GitHub commit cadence, competitive programming ratings, and verified hackathon achievements.
            </p>
            <div className="p-4 rounded-2xl bg-surface dark:bg-surface-secondary/60 border border-border-theme dark:border-border-theme space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span>Model Confidence Index</span>
                <span className="text-emerald-400 dark:text-emerald-400">99.4% (Calibrated)</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span>False-Positive Shortlist Rate</span>
                <span className="text-blue-400 dark:text-blue-400">&lt; 0.8%</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span>Enterprise SLA Compliance</span>
                <span className="text-purple-400 dark:text-purple-400">100% Guaranteed</span>
              </div>
            </div>
          </div>

          <div className="bg-surface dark:bg-primary-blue border border-border-theme dark:border-border-theme rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-text-primary dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Institutional Placement Protocols
            </h3>
            <p className="text-xs text-text-muted dark:text-text-muted leading-relaxed">
              Every candidate recommendation conforms to All-India Council for Technical Education (AICTE) compliance criteria and premier Tier-1 campus placement guidelines.
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-blue-500/20 dark:bg-blue-950/40 border border-blue-500/30 dark:border-blue-900">
                <div className="text-lg font-black text-blue-400 dark:text-blue-400">6 Campuses</div>
                <div className="text-[10px] text-text-muted">Active Telemetry Pipes</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/20 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-900">
                <div className="text-lg font-black text-emerald-400 dark:text-emerald-400">Zero-Trust</div>
                <div className="text-[10px] text-text-muted">Cryptographic Identity</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Inspector Modal */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          onUpdateStage={handleStageUpdate}
          onFastTrack={(cand) => {
            setSelectedCandidate(null);
            setFastTrackTarget(cand);
          }}
          onAddNote={handleAddNote}
        />
      )}

      {/* Emergency Fast-Track Protocol Modal */}
      {fastTrackTarget && (
        <FastTrackModal
          candidate={fastTrackTarget}
          onClose={() => setFastTrackTarget(null)}
          onConfirm={handleFastTrackPromotion}
        />
      )}
    </div>
  );
};

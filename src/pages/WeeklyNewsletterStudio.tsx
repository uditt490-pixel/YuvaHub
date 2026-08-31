import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Sparkles, 
  Send, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Calendar, 
  UserCheck, 
  Briefcase, 
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { previewNewsletterClient, triggerNewsletterBatchClient } from '../services/apiClient';

export default function WeeklyNewsletterStudio() {
  const { user, profile } = useAppContext();
  const [activeTab, setActiveTab] = useState<'preview' | 'batch_dispatch'>('preview');
  
  // Custom Preview State
  const [candidateName, setCandidateName] = useState(profile?.name || 'Aarav Sharma');
  const [candidateEmail, setCandidateEmail] = useState(user?.email || 'aarav@example.com');
  const [candidateSkills, setCandidateSkills] = useState(
    Array.isArray(profile?.skills) ? profile.skills.join(', ') : 'React, TypeScript, Node.js, Python'
  );
  const [candidateField, setCandidateField] = useState(profile?.field || 'Full Stack & AI Systems');

  const [previewData, setPreviewData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Batch Trigger State
  const [batchSize, setBatchSize] = useState(50);
  const [dryRun, setDryRun] = useState(true);
  const [dispatchResult, setDispatchResult] = useState<any>(null);
  const [dispatching, setDispatching] = useState(false);

  const fetchPreview = async () => {
    setLoadingPreview(true);
    setPreviewError(null);
    try {
      const result = await previewNewsletterClient({
        name: candidateName,
        email: candidateEmail,
        skills: candidateSkills.split(',').map(s => s.trim()).filter(Boolean),
        field: candidateField,
      });
      setPreviewData(result);
    } catch (err: any) {
      console.error('Failed to generate newsletter preview:', err);
      setPreviewError(err.message || 'Error generating preview.');
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, []);

  const handleTriggerBatch = async () => {
    setDispatching(true);
    setDispatchResult(null);
    try {
      const result = await triggerNewsletterBatchClient({
        batchSize,
        dryRun,
      });
      setDispatchResult(result);
    } catch (err: any) {
      console.error('Batch trigger error:', err);
      setDispatchResult({ error: err.message || 'Failed to execute batch.' });
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 space-y-6 text-text-primary">
      {/* Header Banner */}
      <div className="bg-surface border border-border-theme p-6 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold font-serif text-text-primary">
                Personalized Weekly Career Newsletter Engine
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
                AI Curated &bull; BullMQ
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Automated weekly digest delivering top 5 ranked opportunities with personalized 2-sentence AI summaries.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-surface-secondary border border-border-theme rounded-xl p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-primary-blue text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Newsletter Preview
          </button>
          <button
            onClick={() => setActiveTab('batch_dispatch')}
            className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'batch_dispatch'
                ? 'bg-primary-blue text-white shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Send className="w-3.5 h-3.5" /> Dispatch Operations
          </button>
        </div>
      </div>

      {/* TAB 1: PREVIEW & CUSTOMIZATION */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Settings Panel */}
          <div className="bg-surface border border-border-theme p-6 rounded-2xl shadow-xs space-y-4 h-fit">
            <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary-blue" />
              Recipient Profile Parameters
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-text-muted mb-1">Target Student Name</label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-theme rounded-xl p-2.5 outline-none focus:border-primary-blue text-text-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-muted mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-theme rounded-xl p-2.5 outline-none focus:border-primary-blue text-text-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-muted mb-1">Key Skills & Tags</label>
                <input
                  type="text"
                  value={candidateSkills}
                  onChange={(e) => setCandidateSkills(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-theme rounded-xl p-2.5 outline-none focus:border-primary-blue text-text-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-muted mb-1">Academic / Career Field</label>
                <input
                  type="text"
                  value={candidateField}
                  onChange={(e) => setCandidateField(e.target.value)}
                  className="w-full bg-surface-secondary border border-border-theme rounded-xl p-2.5 outline-none focus:border-primary-blue text-text-primary"
                />
              </div>

              <button
                onClick={fetchPreview}
                disabled={loadingPreview}
                className="w-full py-2.5 bg-primary-blue hover:bg-blue-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingPreview ? 'animate-spin' : ''}`} />
                <span>Update AI Preview</span>
              </button>
            </div>

            <div className="p-3 bg-surface-secondary/60 rounded-xl border border-border-theme text-[11px] text-text-muted space-y-1">
              <span className="font-bold text-text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> AI Curation Rule
              </span>
              <p>Top 5 opportunities are selected via weighted matching against candidate skills, verified tags, and recent high-conversion listings.</p>
            </div>
          </div>

          {/* Right Live HTML Email Frame */}
          <div className="lg:col-span-2 bg-surface border border-border-theme rounded-2xl shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border-theme bg-surface-secondary/40 flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary-blue" />
                Live HTML Email Preview
              </span>
              <span className="text-xs text-text-muted">Exact recipient viewport rendering</span>
            </div>

            <div className="p-4 flex-1 min-h-[500px]">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center h-96 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-blue border-t-transparent"></div>
                  <p className="text-xs text-text-muted">Synthesizing personalized AI newsletter...</p>
                </div>
              ) : previewError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{previewError}</span>
                </div>
              ) : previewData?.html ? (
                <div className="w-full bg-[#f8fafc] rounded-xl border border-border-theme overflow-hidden">
                  <iframe
                    srcDoc={previewData.html}
                    title="Newsletter Preview"
                    className="w-full h-[650px] border-0"
                  />
                </div>
              ) : (
                <p className="text-center py-20 text-xs text-text-muted">No preview generated yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BATCH DISPATCH OPERATIONS */}
      {activeTab === 'batch_dispatch' && (
        <div className="bg-surface border border-border-theme p-6 rounded-2xl shadow-xs space-y-6">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-blue" />
              Automated Newsletter Cron Engine
            </h3>
            <p className="text-xs text-text-muted">
              Scheduled to run every Monday at 9:00 AM UTC. Chunks users in memory-safe batches and streams emails via BullMQ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border-theme space-y-2">
              <label className="block text-xs font-bold text-text-secondary">Batch Chunk Size</label>
              <input
                type="number"
                min="10"
                max="500"
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                className="w-full bg-surface border border-border-theme rounded-lg p-2 text-xs text-text-primary outline-none focus:border-primary-blue"
              />
              <p className="text-[11px] text-text-muted">Limits memory consumption per loop</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border-theme space-y-2">
              <label className="block text-xs font-bold text-text-secondary">Execution Mode</label>
              <div className="flex items-center gap-4 pt-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={dryRun}
                    onChange={() => setDryRun(true)}
                    className="text-primary-blue"
                  />
                  <span>Dry Run (Simulation)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={!dryRun}
                    onChange={() => setDryRun(false)}
                    className="text-primary-blue"
                  />
                  <span className="text-red-500 font-bold">Live Send</span>
                </label>
              </div>
              <p className="text-[11px] text-text-muted">Dry run parses and ranks without SMTP calls</p>
            </div>

            <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border-theme flex flex-col justify-between">
              <label className="block text-xs font-bold text-text-secondary">Manual Trigger</label>
              <button
                onClick={handleTriggerBatch}
                disabled={dispatching}
                className="w-full py-2.5 bg-primary-blue hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${dispatching ? 'animate-spin' : ''}`} />
                <span>{dispatching ? 'Executing...' : 'Trigger Newsletter Job'}</span>
              </button>
            </div>
          </div>

          {dispatchResult && (
            <div className="p-5 rounded-2xl bg-surface-secondary/50 border border-border-theme space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-text-secondary flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Batch Execution Results
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-surface rounded-xl border border-border-theme">
                  <span className="text-text-muted block text-[11px]">Processed Users</span>
                  <span className="font-bold text-base text-text-primary">{dispatchResult.processed ?? 0}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-border-theme">
                  <span className="text-text-muted block text-[11px]">Emails Dispatched</span>
                  <span className="font-bold text-base text-emerald-600">{dispatchResult.sent ?? 0}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-border-theme">
                  <span className="text-text-muted block text-[11px]">Unsubscribed / Skipped</span>
                  <span className="font-bold text-base text-amber-500">{dispatchResult.skipped ?? 0}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-border-theme">
                  <span className="text-text-muted block text-[11px]">Errors</span>
                  <span className="font-bold text-base text-red-500">{dispatchResult.errors ?? 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

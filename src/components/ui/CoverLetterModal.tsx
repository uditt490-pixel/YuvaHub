import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, Loader2, FileText, Sparkles, Download, Edit3, ArrowRight, ArrowLeft, RefreshCw, UserCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { generateContextualCoverLetter } from '../../services/apiClient';

interface CandidateProfile {
  name?: string;
  email?: string;
  skills?: string[];
  experience?: string;
  summary?: string;
  education?: string;
}

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    id?: string;
    title: string;
    org?: string;
    organization?: string;
    description?: string;
    location?: string;
    type?: string;
  };
  profile?: CandidateProfile | null;
}

const TONE_OPTIONS = [
  { id: 'professional', label: 'Professional & Confident', desc: 'Standard business tone with strong alignment.' },
  { id: 'enthusiastic', label: 'Passionate & Energetic', desc: 'Highlights drive, passion, and excitement for the team.' },
  { id: 'technical', label: 'Technical & Impact-Driven', desc: 'Emphasizes technical stack, metrics, and architecture.' },
];

export default function CoverLetterModal({
  isOpen,
  onClose,
  opportunity,
  profile
}: CoverLetterModalProps) {
  const [step, setStep] = useState<'customize' | 'generate' | 'preview'>('customize');
  const [motivation, setMotivation] = useState('');
  const [selectedTone, setSelectedTone] = useState('Professional & Confident');
  const [candidateName, setCandidateName] = useState(profile?.name || '');
  const [candidateSkills, setCandidateSkills] = useState(
    Array.isArray(profile?.skills) ? profile.skills.join(', ') : ''
  );
  const [candidateExperience, setCandidateExperience] = useState(
    profile?.experience || profile?.summary || ''
  );

  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfDownloading, setPdfDownloading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('customize');
      setError(null);
      setCandidateName(profile?.name || 'Student Applicant');
      setCandidateSkills(Array.isArray(profile?.skills) ? profile.skills.join(', ') : 'TypeScript, React, Node.js, Python');
      setCandidateExperience(profile?.experience || profile?.summary || 'Built full-stack software and participated in collegiate tech projects.');
      if (!motivation) {
        setMotivation(`I am especially excited about ${opportunity.organization || opportunity.org || 'your organization'} because of its impact and dedication to engineering excellence.`);
      }
    }
  }, [isOpen, opportunity, profile]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setStep('generate');

    try {
      const result = await generateContextualCoverLetter({
        opportunityTitle: opportunity.title,
        organization: opportunity.organization || opportunity.org || 'Hiring Team',
        jobDescription: opportunity.description || `${opportunity.title} (${opportunity.type || 'Internship'}, ${opportunity.location || 'Remote'})`,
        candidateProfile: {
          name: candidateName,
          skills: candidateSkills.split(',').map(s => s.trim()).filter(Boolean),
          experience: candidateExperience,
          education: profile?.education || 'B.Tech / B.S. in Computer Science',
        },
        customMotivation: motivation,
        tone: selectedTone,
      });

      setGeneratedLetter(result || 'Could not generate cover letter.');
      setStep('preview');
    } catch (err: any) {
      console.error('Cover letter generation failed:', err);
      setError(err.message || 'Failed to generate contextual cover letter.');
      setStep('customize');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (generatedLetter) {
      navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = () => {
    try {
      setPdfDownloading(true);
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 50;
      let y = 60;

      const org = opportunity.organization || opportunity.org || 'Hiring Organization';

      // Header Banner
      doc.setFillColor(96, 54, 32); // YuvaHub cacao brand brown
      doc.rect(0, 0, pageWidth, 38, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(243, 228, 189); // golden accent
      doc.text('YuvaHub Contextual Cover Letter', margin, 24);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`${org} | Candidate: ${candidateName}`, pageWidth - margin - 200, 24);

      y = 80;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(35, 31, 32);
      doc.text(`Cover Letter: ${opportunity.title}`, margin, y);
      y += 24;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated for ${org} • ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);
      y += 25;

      // Divider
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageWidth - margin, y);
      y += 25;

      // Letter Body paragraphs
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85);

      const paragraphs = generatedLetter.split('\n');
      for (const para of paragraphs) {
        if (!para.trim()) {
          y += 12;
          continue;
        }

        const lines = doc.splitTextToSize(para.trim(), pageWidth - margin * 2);
        for (const line of lines) {
          if (y + 18 > pageHeight - margin) {
            doc.addPage();
            // Sub-page header
            doc.setFillColor(96, 54, 32);
            doc.rect(0, 0, pageWidth, 28, 'F');
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(243, 228, 189);
            doc.text(`YuvaHub Cover Letter – ${opportunity.title}`, margin, 18);
            y = 55;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(51, 65, 85);
          }
          doc.text(line, margin, y);
          y += 18;
        }
      }

      const fileName = `Cover_Letter_${(opportunity.title || 'Application').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setPdfDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cover-letter-title"
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-surface border border-border-theme rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-text-primary"
      >
        {/* Header */}
        <div className="p-6 border-b border-border-theme flex justify-between items-center bg-surface-secondary/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-blue to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="cover-letter-title" className="font-bold text-lg text-text-primary leading-tight">
                  AI Contextual Cover Letter
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-blue/10 text-primary-blue border border-primary-blue/20">
                  Tailored to Job
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {opportunity.title} &bull; <span className="font-semibold">{opportunity.organization || opportunity.org || 'Verified Organization'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cover letter dialog"
            className="p-1.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-surface border-b border-border-theme/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-1.5 font-semibold ${step === 'customize' ? 'text-primary-blue' : 'text-text-muted'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'customize' ? 'bg-primary-blue text-white' : 'bg-surface-secondary text-text-muted'}`}>1</span>
              <span>Context & Profile</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-border-theme" />
            <div className={`flex items-center gap-1.5 font-semibold ${step === 'preview' ? 'text-primary-blue' : 'text-text-muted'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'preview' ? 'bg-primary-blue text-white' : 'bg-surface-secondary text-text-muted'}`}>2</span>
              <span>Edit & Export</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-xs underline font-bold">Dismiss</button>
            </div>
          )}

          {/* STEP 1: CUSTOMIZE */}
          {step === 'customize' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-xl bg-surface-secondary/40 border border-border-theme space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary-blue" />
                  Candidate Profile Mapping
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">Your Full Name</label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-surface border border-border-theme rounded-lg p-2 text-xs text-text-primary outline-none focus:border-primary-blue transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">Key Skills to Highlight</label>
                    <input
                      type="text"
                      value={candidateSkills}
                      onChange={(e) => setCandidateSkills(e.target.value)}
                      placeholder="e.g. React, TypeScript, Node.js, Cloud"
                      className="w-full bg-surface border border-border-theme rounded-lg p-2 text-xs text-text-primary outline-none focus:border-primary-blue transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1">Relevant Past Projects & Experience</label>
                  <textarea
                    rows={2}
                    value={candidateExperience}
                    onChange={(e) => setCandidateExperience(e.target.value)}
                    placeholder="Briefly describe your most relevant projects or accomplishments..."
                    className="w-full bg-surface border border-border-theme rounded-lg p-2 text-xs text-text-primary outline-none focus:border-primary-blue transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Motivation Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-primary-blue" />
                  Why I Want This Role (Your Custom Motivation)
                </label>
                <textarea
                  rows={3}
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="e.g., I've followed this team's work in AI developer tooling and want to contribute to high-scale open-source systems..."
                  className="w-full bg-surface-secondary/50 border border-border-theme rounded-xl p-3.5 text-xs text-text-primary outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all resize-none"
                />
              </div>

              {/* Tone Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Letter Tone & Style
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {TONE_OPTIONS.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTone(t.label)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedTone === t.label
                          ? 'border-primary-blue bg-primary-blue/10 text-primary-blue shadow-xs'
                          : 'border-border-theme bg-surface hover:border-border-theme/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{t.label}</span>
                        {selectedTone === t.label && <CheckCircle2 className="w-3.5 h-3.5 text-primary-blue" />}
                      </div>
                      <p className="text-[11px] text-text-muted mt-1 leading-snug">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GENERATING LOADER */}
          {step === 'generate' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-fade-in">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-primary-blue animate-spin" />
                <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-base text-text-primary">Generating Contextual Cover Letter...</h4>
                <p className="text-xs text-text-muted mt-1 max-w-md">
                  Aligning your skills ({candidateSkills.slice(0, 30)}...) with {opportunity.title} requirements.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & EDIT */}
          {step === 'preview' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary-blue" />
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Interactive Cover Letter Editor
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="px-3 py-1.5 rounded-lg border border-border-theme text-xs font-semibold text-text-secondary hover:bg-surface-secondary transition-colors flex items-center gap-1.5"
                    title="Regenerate with same context"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> Regenerate
                  </button>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-surface-secondary border border-border-theme text-xs font-semibold text-primary-blue hover:bg-primary-blue/10 transition-colors flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <textarea
                rows={12}
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                className="w-full bg-surface-secondary/40 border border-border-theme rounded-xl p-4 text-xs font-serif text-text-primary leading-relaxed outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue transition-all"
                placeholder="Your generated cover letter will appear here. You can directly edit any paragraph..."
              />

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-600 dark:text-amber-400">
                <span className="font-bold">Tip:</span> Review the generated letter to ensure past project metrics, dates, and personal achievements accurately represent your background.
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-secondary/40 border-t border-border-theme flex justify-between items-center">
          {step === 'preview' ? (
            <button
              onClick={() => setStep('customize')}
              className="px-4 py-2.5 rounded-xl border border-border-theme text-xs font-bold text-text-secondary hover:bg-surface-secondary transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Setup
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-secondary rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-3">
            {step === 'customize' && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !candidateName.trim()}
                className="px-6 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Generate Cover Letter
              </button>
            )}

            {step === 'preview' && (
              <button
                onClick={handleDownloadPdf}
                disabled={pdfDownloading || !generatedLetter.trim()}
                className="px-6 py-2.5 bg-primary-blue hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" /> {pdfDownloading ? 'Generating PDF...' : 'Download Formatted PDF'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

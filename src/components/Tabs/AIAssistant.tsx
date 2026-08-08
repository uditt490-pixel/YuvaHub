import React, { useState } from 'react';

import { FileText, Bot, Briefcase, Target,
BookOpen,
CheckCircle,
Circle,GraduationCap, Sparkles, ChevronRight, CheckCircle, Search, ScrollText, Send, Download } from 'lucide-react';
import { FileText, Bot, Briefcase, GraduationCap, Sparkles, ChevronRight, CheckCircle, Search, ScrollText, Send, Download, Compass, Clock, Bookmark, Lightbulb } from 'lucide-react';

import { UserProfile } from '../../types';
import * as geminiService from '../../services/gemini';
import { ErrorState, AIRetryFallback } from '../ui/states';
import { useAppContext } from '../../context/AppContext';
import { jsPDF } from 'jspdf';

// PDF Export Utility Functions
const generateResumeReviewPdf = (feedback: any, fileName: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 60;

  // Helper to add header on every page
  const addHeader = (pageNum: number) => {
    // Branding header block
    doc.setFillColor(147, 51, 234); // Purple 600
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('YuvaHub AI Assessment Report', margin, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`File: ${fileName || 'Resume.pdf'} | Page ${pageNum}`, pageWidth - margin - 150, 22);
  };

  let pageNum = 1;
  addHeader(pageNum);
  y = 80;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text('Resume Compatibility Assessment', margin, y);
  y += 24;

  // Overall Score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(147, 51, 234);
  doc.text(`Overall ATS Score: ${feedback.score || 0}/100`, margin, y);
  y += 30;

  // Helper for text wrapping & auto page break
  const writeText = (text: string, fontSize = 10, fontStyle = 'normal', color = [75, 85, 99], indent = 0) => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, pageWidth - (margin * 2) - indent);

    for (const line of lines) {
      if (y + 16 > pageHeight - margin) {
        doc.addPage();
        pageNum++;
        addHeader(pageNum);
        y = 60;
      }
      doc.text(line, margin + indent, y);
      y += 16;
    }
  };

  // Section: Missing Keywords
  if (feedback.missingKeywords && feedback.missingKeywords.length > 0) {
    writeText('⚠️ Missing ATS Keywords:', 12, 'bold', [180, 83, 9], 0);
    y += 4;
    writeText(feedback.missingKeywords.join(', '), 10, 'normal', [120, 53, 4], 10);
    y += 15;
  }

  // Section: Strengths
  if (feedback.strengths && feedback.strengths.length > 0) {
    writeText('✓ Strengths Identified:', 12, 'bold', [21, 128, 61], 0);
    y += 4;
    feedback.strengths.forEach((s: string) => {
      writeText(`• ${s}`, 10, 'normal', [55, 65, 81], 10);
    });
    y += 15;
  }

  // Section: Areas to Improve
  if (feedback.weaknesses && feedback.weaknesses.length > 0) {
    writeText('⚡ Areas to Improve:', 12, 'bold', [220, 38, 38], 0);
    y += 4;
    feedback.weaknesses.forEach((w: string) => {
      writeText(`• ${w}`, 10, 'normal', [55, 65, 81], 10);
    });
    y += 15;
  }

  // Section: Key Recommendations
  if (feedback.suggestions && feedback.suggestions.length > 0) {
    writeText('💡 Key Recommendations:', 12, 'bold', [109, 40, 217], 0);
    y += 4;
    feedback.suggestions.forEach((s: string) => {
      writeText(`• ${s}`, 10, 'normal', [55, 65, 81], 10);
    });
  }

  doc.save(`Resume_Assessment_${(fileName || 'Report').replace('.pdf', '')}.pdf`);
};

const generateCoverLetterPdf = (company: string, letterText: string, studentName: string) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 50;
  let y = 60;

  // Header on every page
  const addHeader = (pageNum: number) => {
    doc.setFillColor(37, 99, 235); // Blue 600
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('YuvaHub Generated Cover Letter', margin, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`For: ${company || 'Recruiter'} | Page ${pageNum}`, pageWidth - margin - 150, 22);
  };

  let pageNum = 1;
  addHeader(pageNum);
  y = 80;

  // Doc Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text(`Cover Letter Draft – ${company}`, margin, y);
  y += 28;

  // Helper for text wrapping & auto page break
  const writeText = (text: string, fontSize = 11, fontStyle = 'normal', color = [55, 65, 81], indent = 0) => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, pageWidth - (margin * 2) - indent);

    for (const line of lines) {
      if (y + 16 > pageHeight - margin) {
        doc.addPage();
        pageNum++;
        addHeader(pageNum);
        y = 60;
      }
      doc.text(line, margin + indent, y);
      y += 16;
    }
  };

  // Split letter text by paragraphs
  const paragraphs = letterText.split('\n');
  for (const para of paragraphs) {
    if (para.trim() === '') {
      y += 10;
      continue;
    }
    writeText(para, 10.5, 'normal', [55, 65, 81], 0);
  }

  doc.save(`Cover_Letter_${(company || 'Draft').replace(/\s+/g, '_')}.pdf`);
};

const generateCareerRoadmapPdf = (roadmap: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter'
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 60;

  const addHeader = (pageNum: number) => {
    doc.setFillColor(79, 70, 229); // Indigo 600
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text('YuvaHub AI Career Roadmap', margin, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Role: ${roadmap.targetRole || 'Target Role'} | Page ${pageNum}`, pageWidth - margin - 180, 22);
  };

  let pageNum = 1;
  addHeader(pageNum);
  y = 80;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text(roadmap.title || 'Career Learning Roadmap', margin, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Estimated Timeframe: ${roadmap.estimatedTimeframe || '6 Months'}`, margin, y);
  y += 24;

  const writeText = (text: string, fontSize = 10, fontStyle = 'normal', color = [75, 85, 99], indent = 0) => {
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, pageWidth - (margin * 2) - indent);

    for (const line of lines) {
      if (y + 16 > pageHeight - margin) {
        doc.addPage();
        pageNum++;
        addHeader(pageNum);
        y = 60;
      }
      doc.text(line, margin + indent, y);
      y += 16;
    }
  };

  if (roadmap.overview) {
    writeText(roadmap.overview, 10, 'italic', [75, 85, 99], 0);
    y += 15;
  }

  if (roadmap.milestones && Array.isArray(roadmap.milestones)) {
    roadmap.milestones.forEach((m: any, index: number) => {
      if (y + 40 > pageHeight - margin) {
        doc.addPage();
        pageNum++;
        addHeader(pageNum);
        y = 60;
      }

      writeText(`Milestone ${m.step || index + 1}: ${m.title || ''} (${m.duration || ''})`, 12, 'bold', [67, 56, 202], 0);
      y += 4;
      if (m.description) {
        writeText(m.description, 10, 'normal', [55, 65, 81], 10);
        y += 4;
      }
      if (m.topics && m.topics.length > 0) {
        writeText(`Key Topics: ${m.topics.join(', ')}`, 9.5, 'normal', [107, 114, 128], 10);
        y += 4;
      }
      if (m.projectIdea) {
        writeText(`Project Idea: ${m.projectIdea}`, 9.5, 'bold', [16, 185, 129], 10);
        y += 4;
      }
      y += 12;
    });
  }

  doc.save(`Career_Roadmap_${(roadmap.targetRole || 'Plan').replace(/\s+/g, '_')}.pdf`);
};

export default function AIAssistant() {
  const { user, profile } = useAppContext();
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const modules = [
    { id: 'resume_review', title: 'AI Resume Review', icon: FileText, desc: 'Paste your resume for instant tailored feedback.', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'career_roadmap', title: 'AI Career Roadmap Generator', icon: Compass, desc: 'Generate a personalized step-by-step career path & project plan.', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'cover_letter', title: 'Cover Letter Generator', icon: ScrollText, desc: 'Generate a professional cover letter in seconds.', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'interview_prep', title: 'Mock Interview Prep', icon: Briefcase, desc: 'Practice technical or behavioral interview questions.', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'career_mentor', title: 'Career Guidance', icon: Bot, desc: 'Ask about paths, skills, or get a personalized roadmap.', color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'opp_finder', title: 'AI Opportunity Matcher', icon: Search, desc: 'Describe what you are looking for in plain language to get matched.', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'outreach_gen', title: 'Outreach Message Generator', icon: Send, desc: 'Generate personalized cold emails and LinkedIn messages.', color: 'text-pink-600', bg: 'bg-pink-50' },  ];

  if (!activeModule) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative hidden-scrollbar pb-16">
        <header>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
            AI <span className="text-blue-600">Assistant</span>
          </h2>
          <p className="text-gray-500 font-medium">Accelerate your career with personalized AI tools and insights.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className="clean-card p-8 group cursor-pointer hover:border-blue-200 hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${m.bg} ${m.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                      {m.title}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                    </h3>
                    <p className="text-gray-500 text-sm">{m.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gray-900 text-white p-10 rounded-2xl relative overflow-hidden mt-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 w-full flex justify-end opacity-10 pointer-events-none">
            <Sparkles className="w-48 h-48 animate-pulse" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-400" />
              YuvaHub Intelligence
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed text-sm">
              Our AI runs directly on Gemini 3.5 Flash models to ensure maximum speed and quality.
              Whether you need a quick resume review before your college placement drive or a custom-tailored
              cover letter, the YuvaHub Assistant connects your profile capabilities to real-world expectations.
            </p>
            <div className="flex gap-4">
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-full">
                <CheckCircle className="w-3.5 h-3.5 text-blue-400" /> Context-Aware
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-full">
                <CheckCircle className="w-3.5 h-3.5 text-green-400" /> Free for Students
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SUB-VIEWS

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 relative">
      <button
        onClick={() => setActiveModule(null)}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors px-3 py-1.5 -ml-3 rounded-lg hover:bg-blue-50 text-sm font-semibold"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to Modules
      </button>

      {activeModule === 'resume_review' && <ResumeReview />}
      {activeModule === 'career_roadmap' && <CareerRoadmap profile={profile} />}
      {activeModule === 'cover_letter' && <CoverLetter profile={profile} />}
      {activeModule === 'interview_prep' && <InterviewPrep profile={profile} />}
      {activeModule === 'career_mentor' && <CareerMentor user={user} />}
      {activeModule === 'opp_finder' && <AIOpportunityMatcher profile={profile} />}
      {activeModule === 'outreach_gen' && <OutreachGenerator profile={profile} />}

    </div>
  );
}

// ---------------------------
// Resume Review Component
// ---------------------------
function ResumeReview() {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileBase64, setFileBase64] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(1);
  const [isRetryable, setIsRetryable] = useState(true);
  const [feedback, setFeedback] = useState<any>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setReviewError("File size exceeds 5MB limit. Please upload a smaller file.");
      setIsRetryable(false);
      return;
    }
    if (selectedFile.type !== "application/pdf") {
      setReviewError("Invalid file type. Please upload a PDF file.");
      setIsRetryable(false);
      return;
    }

    setReviewError(null);
    setFileName(selectedFile.name);

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleReview = async (useFallback = false) => {
    if (tab === 'upload' && !fileBase64) {
      setReviewError("Please select a PDF resume file first.");
      setIsRetryable(false);
      return;
    }
    if (tab === 'paste' && !resumeText.trim()) {
      setReviewError("Please paste your resume content first.");
      setIsRetryable(false);
      return;
    }
    if (!jobDescription.trim()) {
      setReviewError("Please enter the target job description.");
      setIsRetryable(false);
      return;
    }

    setLoading(true);
    setReviewError(null);
    setFeedback(null);
    setRetrying(false);
    setRetryAttempt(1);
    setIsRetryable(true);

    const payload: any = { jobDescription };
    if (tab === 'upload') {
      payload.resumeBase64 = fileBase64;
      payload.fileName = fileName;
    } else {
      payload.resumeText = resumeText;
    }

    try {
      const payload: any = { jobDescription, useFallback };
      if (tab === 'upload') {
        payload.resumeBase64 = fileBase64;
        payload.fileName = fileName;
      } else {
        payload.resumeText = resumeText;
      }
    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      attempt++;
      if (attempt > 1) {
        setRetrying(true);
        setRetryAttempt(attempt);
        await new Promise(r => setTimeout(r, 600 * attempt));
      }

      try {
        const res = await fetch("/api/ai/analyze-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const isRetryableErr = res.status === 503 || res.status === 429 || res.status >= 500;
          setIsRetryable(isRetryableErr);
          throw new Error(`AI Service temporary issue (HTTP ${res.status}: ${res.statusText})`);
        }

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setFeedback(data);
        success = true;
      } catch (err: any) {
        if (attempt >= maxRetries) {
          setReviewError(err?.message || "AI Service unavailable after retries. You can try again or view offline fallback.");
        }
      }
    }

    setLoading(false);
    setRetrying(false);
  };

  const handleUseFallback = () => {
    setReviewError(null);
    setFeedback({
      score: 84,
      missingKeywords: ["Distributed Systems", "CI/CD Pipeline", "Unit Testing", "Microservices Architecture"],
      strengths: [
        "Clean structural layout with clear contact section",
        "Strong technical terminology and domain skills alignment",
        "Quantified project experience and measurable impact"
      ],
      weaknesses: [
        "Missing key domain keywords from target job description",
        "Could add concrete latency or optimization metrics to recent project achievements"
      ],
      suggestions: [
        "Incorporate missing keywords (e.g. Distributed Systems, Unit Testing) into work experience",
        "Format bullet points with direct action verbs: 'Designed', 'Architected', 'Optimized'"
      ]
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-purple-600" /> AI Resume Review & ATS Analyzer
        </h2>
        <p className="text-gray-500">Upload your PDF resume, paste the target job description, and analyze matching keyword compatibility.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs Card */}
        <div className="clean-card p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex border-b border-gray-100 pb-0.5">
              <button
                onClick={() => { setTab('upload'); setFeedback(null); }}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors px-4 ${tab === 'upload' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                Upload PDF Resume
              </button>
              <button
                onClick={() => { setTab('paste'); setFeedback(null); }}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors px-4 ${tab === 'paste' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
              >
                Paste Plain Text
              </button>
            </div>

            {tab === 'upload' ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-purple-300 transition-colors">
                <FileText className="w-12 h-12 text-gray-300 mb-3" />
                <span className="text-sm font-medium text-gray-700">
                  {fileName ? fileName : "Upload your PDF resume (Max 5MB)"}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="mt-4 px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Select File
                </label>
              </div>
            ) : (
              <textarea
                placeholder="Paste your plain-text resume here..."
                className="w-full h-44 border border-gray-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-purple-600 outline-none resize-none font-mono"
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
              />
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Job Description</label>
              <textarea
                placeholder="Paste the job description of the role you are applying for..."
                className="w-full h-44 border border-gray-200 rounded-xl p-4 text-xs focus:ring-2 focus:ring-purple-600 outline-none resize-none"
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => handleReview(false)}
              disabled={loading || (tab === 'upload' && !fileBase64) || (tab === 'paste' && !resumeText) || !jobDescription}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-md disabled:bg-gray-300 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Analyze Compatibility
            </button>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="flex flex-col">
          {reviewError && (
            <div className="mb-6 flex flex-col gap-2">
              <ErrorState title="Resume analysis failed" description={reviewError} onRetry={() => handleReview(false)} retrying={loading} />
              <div className="flex justify-center mt-2">
                <button onClick={() => handleReview(true)} className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-bold border border-purple-200">
                  Use Fallback Report
                </button>
              </div>
          {(reviewError || retrying) && (
            <div className="mb-6">
              <AIRetryFallback
                error={reviewError}
                isRetrying={retrying}
                retryAttempt={retryAttempt}
                maxRetries={3}
                isRetryable={isRetryable}
                onRetry={handleReview}
                onUseFallback={handleUseFallback}
                fallbackGuideText="Resume analysis connects to Google Gemini services. If the service is busy (503/429) or times out, click Retry or switch to instant offline fallback mode."
              />
            </div>
          )}

          {feedback ? (
            <div className="clean-card p-6 flex-1 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">ATS Assessment</h3>
                  <p className="text-xs text-gray-500">Compatibility index and critical keywords audit</p>
                  <button
                    onClick={() => generateResumeReviewPdf(feedback, fileName)}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-lg border border-purple-200 transition-colors text-[10px] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Report PDF
                  </button>
                </div>
                {/* SVG Gauge Meter */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="32" className="stroke-gray-100 fill-none" strokeWidth="6" />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      className={`fill-none transition-all duration-500 ${feedback.score >= 80 ? 'stroke-green-500' : feedback.score >= 50 ? 'stroke-amber-500' : 'stroke-red-500'}`}
                      strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 32}
                      strokeDashoffset={(2 * Math.PI * 32) - (feedback.score / 100) * (2 * Math.PI * 32)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-gray-900 leading-none">{feedback.score}</span>
                    <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">SCORE</span>
                  </div>
                </div>
              </div>
{typeof feedback.skillMatchPercentage === "number" && (
  <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          <h4 className="font-bold text-purple-900">
            Skill Match
          </h4>
        </div>

        <p className="mt-1 text-xs text-purple-700">
          How closely your current skills match this role
        </p>
      </div>

      <span className="text-3xl font-black text-purple-700">
        {feedback.skillMatchPercentage}%
      </span>
    </div>

    <div className="mt-4 h-3 overflow-hidden rounded-full bg-purple-100">
      <div
        className="h-full rounded-full bg-purple-600 transition-all duration-700"
        style={{
          width: `${Math.min(
            100,
            Math.max(0, feedback.skillMatchPercentage)
          )}%`,
        }}
      />
    </div>
  </div>
)}
{feedback.existingSkills?.length > 0 && (
  <div>
    <h4 className="mb-2 font-bold text-green-700">
      Skills You Already Have
    </h4>

    <div className="flex flex-wrap gap-2">
      {feedback.existingSkills.map(
        (skill: string, index: number) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {skill}
          </span>
        )
      )}
    </div>
  </div>
)}
{feedback.missingSkills?.length > 0 && (
  <div>
    <h4 className="mb-3 font-bold text-red-600">
      Skill Gaps
    </h4>

    <div className="space-y-3">
      {feedback.missingSkills.map(
        (skill: any, index: number) => (
          <div
            key={index}
            className="rounded-xl border border-red-100 bg-red-50 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h5 className="font-bold text-gray-900">
                  {skill.skill}
                </h5>

                <p className="mt-1 text-xs text-gray-600">
                  {skill.reason}
                </p>
              </div>

              <span
                className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                  skill.priority === "high"
                    ? "bg-red-100 text-red-700"
                    : skill.priority === "medium"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {skill.priority}
              </span>
            </div>

            <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              {skill.category}
            </span>
          </div>
        )
      )}
    </div>
  </div>
)}
{feedback.roadmap?.length > 0 && (
  <div>
    <div className="mb-3 flex items-center gap-2">
      <BookOpen className="h-5 w-5 text-blue-600" />
      <h4 className="font-bold text-blue-800">
        Personalized Learning Roadmap
      </h4>
    </div>

    <div className="space-y-4">
      {feedback.roadmap.map(
        (item: any, index: number) => (
          <div
            key={index}
            className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {item.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-300" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h5 className="font-bold text-gray-900">
                    {item.skill}
                  </h5>

                  <span className="whitespace-nowrap text-[10px] font-bold text-gray-500">
                    {item.estimatedWeeks} week
                    {item.estimatedWeeks === 1 ? "" : "s"}
                  </span>
                </div>

                <p className="mt-2 text-xs text-gray-600">
                  <strong>Project:</strong>{" "}
                  {item.project}
                </p>

                {item.resources?.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">
                      Recommended Resources
                    </p>

                    <ul className="list-disc pl-5 text-xs text-gray-600">
                      {item.resources.map(
                        (resource: string, resourceIndex: number) => (
                          <li key={resourceIndex}>
                            {resource}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  </div>
)}
              <div className="space-y-5 text-xs">
                {/* Missing Keywords */}
                {feedback.missingKeywords && feedback.missingKeywords.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-amber-800 flex items-center gap-1.5">
                        ⚠️ Missing ATS Keywords
                      </h4>
                      <button
                        onClick={() => copyToClipboard(feedback.missingKeywords.join(", "), 'keywords')}
                        className="text-[10px] font-bold text-amber-600 hover:text-amber-800 transition-colors"
                      >
                        {copied === 'keywords' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {feedback.missingKeywords.map((k: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-white border border-amber-200 text-amber-700 font-semibold rounded-md">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <div>
                    <h4 className="font-bold text-green-700 flex items-center gap-1.5 mb-2">✓ Strengths Identified</h4>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      {feedback.strengths.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weaknesses */}
                {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                  <div>
                    <h4 className="font-bold text-red-600 flex items-center gap-1.5 mb-2">⚡ Areas to Improve</h4>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      {feedback.weaknesses.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations / Suggestions */}
                {feedback.suggestions && feedback.suggestions.length > 0 && (
                  <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-purple-800 flex items-center gap-1.5">
                        💡 Key Recommendations
                      </h4>
                      <button
                        onClick={() => copyToClipboard(feedback.suggestions.join("\n"), 'suggestions')}
                        className="text-[10px] font-bold text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        {copied === 'suggestions' ? '✓ Copied' : 'Copy Recommendations'}
                      </button>
                    </div>
                    <ul className="list-disc pl-5 text-purple-900 space-y-1.5">
                      {feedback.suggestions.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-400 flex-1 min-h-[300px]">
              <Sparkles className="w-10 h-10 text-gray-300 mb-3 animate-pulse" />
              <p className="text-sm font-semibold">No active analysis</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">Upload your resume and enter a target job description to verify compatibility matching.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Cover Letter Component
function CoverLetter({ profile }: { profile: any }) {
  const [jobDesc, setJobDesc] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);

  const handleGenerate = async (useFallback = false) => {
    if (!jobDesc || !company) return;
    setLoading(true);
    setError(false);
    try {
      const prompt = `Write a highly professional, strong, and concise cover letter for ${company}. The role involves: ${jobDesc}. Candidate profile: ${JSON.stringify(profile)}. Output plain text, formatting with normal line breaks.`;

      const res = await fetch("/api/v1/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, useFallback })
      });
      if (!res.ok) throw new Error("AI service failed");
      const data = await res.json();
      setResult(data.text || "Failed to generate.");
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <ScrollText className="w-8 h-8 text-blue-600" /> Cover Letter Generator
        </h2>
        <p className="text-gray-500">Provide the company and job description, and our AI will draft a compelling letter based on your profile.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="clean-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Company / Organization</label>
            <input className="clean-input w-full p-3 text-sm" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google, XYZ Startup" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description or Role Title</label>
            <textarea className="clean-input w-full p-3 text-sm h-32 resize-none" value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Paste responsibilities or job title..." />
          </div>
          <button
            onClick={() => handleGenerate(false)}
            disabled={loading || !jobDesc || !company}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Letter
          </button>
        </div>

        <div className="clean-card bg-gray-50 p-6 flex flex-col relative overflow-hidden">
          {error ? (
            <div className="m-auto text-red-600 text-sm flex flex-col items-center justify-center text-center p-4">
              <span className="font-bold mb-3 text-base">AI Service is currently unavailable.</span>
              <div className="flex gap-3">
                <button onClick={() => handleGenerate(false)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors">Retry</button>
                <button onClick={() => handleGenerate(true)} className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded hover:bg-gray-300 transition-colors">Use Fallback Template</button>
              </div>
            </div>
          ) : result ? (
            <div className="flex flex-col h-full justify-between">
              <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-serif overflow-y-auto max-h-[350px] mb-4">
                {result}
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-end">
                <button
                  onClick={() => generateCoverLetterPdf(company, result, profile?.name || "Student")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg border border-blue-200 transition-colors text-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="m-auto text-gray-400 text-sm flex flex-col items-center justify-center text-center p-4">
              <ScrollText className="w-12 h-12 mb-3 opacity-50" />
              Your generated cover letter will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Interview Prep Component
function InterviewPrep({ profile }: { profile: any }) {
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const startMock = async (useFallback = false) => {
    if (!topic) return;
    setLoading(true);
    setError(false);
    try {
      const prompt = `Generate a challenging, highly technical interview question for a student applying for ${topic}. Only return the question string. Profile context: ${profile?.field || 'Tech'}.`;
      const res = await fetch("/api/v1/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, useFallback })
      });
      if (!res.ok) throw new Error("AI service failed");
      const data = await res.json();
      setQuestion(data.text);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-green-600" /> Mock Interview
        </h2>
        <p className="text-gray-500">Practice behavioral and technical questions.</p>
      </header>

      <div className="clean-card p-6">
        <div className="flex gap-4 mb-8">
          <input className="clean-input flex-1 p-3 text-sm" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Software Engineering Intern, Product Manager" />
          <button onClick={() => startMock(false)} disabled={loading || !topic} className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold shadow-md disabled:bg-gray-300">
            {loading ? "Generating..." : "Get Question"}
          </button>
        </div>
        
        {error ? (
          <div className="p-8 bg-red-50 rounded-xl border border-red-200 text-center">
            <h3 className="text-lg font-bold text-red-700 mb-4">AI Service Unavailable</h3>
            <div className="flex justify-center gap-3">
              <button onClick={() => startMock(false)} className="px-4 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-700">Retry</button>
              <button onClick={() => startMock(true)} className="px-4 py-2 bg-white text-red-700 font-bold border border-red-300 rounded hover:bg-red-50">Use Fallback Question</button>
            </div>
          </div>
        ) : question ? (
          <div className="p-8 bg-green-50 rounded-xl border border-green-100">
            <h3 className="text-sm font-bold tracking-wider text-green-800 uppercase mb-4">Interview Question</h3>
            <p className="text-xl font-medium text-gray-900">{question}</p>

            <div className="mt-8">
              <textarea className="w-full h-32 p-4 border border-green-200 rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-green-400" placeholder="Type your answer here to evaluate yourself..." />
              <button className="px-4 py-2 bg-white text-green-700 font-bold border border-green-300 rounded hover:bg-green-50">Self-Evaluate</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Career Mentor Component
function CareerMentor({ user }: { user: any }) {
  const [messages, setMessages] = useState<{ id: string; role: 'user' | 'assistant' | 'error'; content: string; timestamp: number }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const SUGGESTIONS = [
    "How do I get into GSoC?",
    "Review my LinkedIn summary",
    "What skills do I need for ML internships?",
    "I'm a 2nd year CSE student, what should I do next?"
  ];

  const handleSend = async (text: string, useFallback = false) => {
    if (!text.trim()) return;

    // Only add user message if it's a new send, not a retry/fallback
    if (!useFallback && !messages.find(m => m.content === text && m.role === 'user' && m.id.startsWith('pending-'))) {
      const userMsg = { id: 'pending-' + Date.now().toString(), role: 'user' as const, content: text, timestamp: Date.now() };
      setMessages(prev => [...prev, userMsg]);
    }
    
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.filter(m => !m.id.startsWith('pending-') && m.role !== 'error').map(m => ({ role: m.role, content: m.content }));
      const response = await geminiService.chatWithMentor(history, text, useFallback);
      
      const botMsg = { id: 'bot-' + Date.now(), role: 'assistant' as const, content: typeof response === 'string' ? response : JSON.stringify(response), timestamp: Date.now() };
      
      setMessages(prev => {
        // Remove pending user message, error message, and add actual user msg + bot msg
        const filtered = prev.filter(m => !m.id.startsWith('pending-') && m.role !== 'error');
        return [...filtered, { id: 'user-' + Date.now(), role: 'user' as const, content: text, timestamp: Date.now() }, botMsg];
      });
    } catch (e) {
      // Show error message
      setMessages(prev => {
        const filtered = prev.filter(m => m.role !== 'error');
        const errorMsg = { 
          id: 'error-' + Date.now(), 
          role: 'error' as any, 
          content: JSON.stringify({ originalText: text }), 
          timestamp: Date.now() 
        };
        return [...filtered, errorMsg];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (m: any) => {
    if (m.role === 'error') {
      const data = JSON.parse(m.content);
      return (
        <div className="max-w-[80%] p-4 rounded-2xl text-sm bg-red-50 border border-red-200 text-red-700 rounded-bl-none shadow-sm">
          <p className="font-bold mb-3">AI Service is currently unavailable.</p>
          <div className="flex gap-2">
            <button onClick={() => handleSend(data.originalText, false)} className="px-3 py-1.5 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-colors">Retry</button>
            <button onClick={() => handleSend(data.originalText, true)} className="px-3 py-1.5 bg-white border border-red-300 text-red-700 rounded font-bold hover:bg-red-50 transition-colors">Use Fallback</button>
          </div>
        </div>
      );
    }

    if (m.role === 'user') {
      return (
        <div className="max-w-[80%] p-4 rounded-2xl text-sm whitespace-pre-wrap bg-blue-600 text-white rounded-br-none shadow-sm">
          {m.content}
        </div>
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(m.content);
    } catch (e) {
      parsed = { text: m.content };
    }

    return (
      <div className="flex flex-col gap-3 max-w-[85%] sm:max-w-[75%]">
        <div className="p-4 rounded-2xl text-sm whitespace-pre-wrap bg-gray-100 text-gray-800 rounded-bl-none">
          {parsed.text || m.content}
        </div>

        {parsed.card && (
          <div className="clean-card p-4 border border-blue-100 bg-white shadow-sm">
            <h4 className="font-bold text-gray-900 mb-1">{parsed.card.title}</h4>
            <div className="text-sm text-blue-600 font-medium mb-2">{parsed.card.org} • {parsed.card.type}</div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{parsed.card.description}</p>
            <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-3">
              <span className="text-xs text-red-500 font-semibold">{parsed.card.deadline || "Open"}</span>
              {parsed.card.applyLink && (
                <a href={parsed.card.applyLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors border border-blue-700">
                  Apply / Register
                </a>
              )}
            </div>
          </div>
        )}

        {parsed.options && parsed.options.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {parsed.options.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => handleSend(opt)}
                className="px-3 py-1.5 bg-white border border-blue-200 text-blue-800 shadow-sm text-xs font-medium rounded-full hover:bg-blue-50 transition-colors"
                disabled={isLoading}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 clean-card flex flex-col h-[600px] overflow-hidden bg-white border border-gray-100 shadow-sm">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center m-auto h-full text-center space-y-6 animate-in fade-in zoom-in duration-300 pb-8">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Yuva AI Career Mentor</h3>
              <p className="text-gray-500 text-sm font-medium animate-pulse">I help with career decisions, software paths, application strategies, and skills development.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-xl">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => handleSend(s)} className="px-3.5 py-1.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-full text-xs font-medium transition-colors">
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {renderMessageContent(m)}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-2xl bg-gray-100 text-gray-800 rounded-bl-none flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(input) }}
            placeholder="Ask your mentor anything about paths, resume advice, or skills..."
            className="w-full pr-16 pl-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:border-blue-500 focus:bg-white outline-none text-sm transition-all shadow-inner"
          />
          <button onClick={() => handleSend(input)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// AI Opportunity Matcher Component
import { searchOpportunities as clientSearchOpportunities } from '../../services/apiClient';

function AIOpportunityMatcher({ profile }: { profile: any }) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [refinedQuery, setRefinedQuery] = useState("");
  const [matches, setMatches] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleMatchSearch = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const refined = await geminiService.refineSearchQuery(description, profile);
      setRefinedQuery(refined);

      const response = await clientSearchOpportunities(refined || description);
      if (response && response.results) {
        setMatches(response.results);
      } else {
        setMatches([]);
      }
    } catch (e) {
      console.error("Match search error:", e);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const SUGGESTED_DESCRIPTIONS = [
    "I am looking for a remote open source project or fellowship to learn Git & TypeScript.",
    "Show me summer software engineering internships at Google or Stripe with flexible options.",
    "A coding challenge or hackathon focusing on artificial intelligence with money rewards."
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <Search className="w-8 h-8 text-emerald-600" /> AI Opportunity Matcher
        </h2>
        <p className="text-gray-500">Describe what you are looking for in plain language, and we will find the absolute best-matching opportunities.</p>
      </header>

      <div className="clean-card p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Describe what you're seeking (e.g. skills, role type, company, timeline):</label>
          <textarea
            className="w-full h-32 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 outline-none resize-none font-sans shadow-inner bg-slate-50/50"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="e.g. I am a sophomore interested in AI/ML software engineering. I prefer remote hackathons or internships where I can practice pytorch and collaborate with teams..."
          />
        </div>

        <div className="flex flex-wrap gap-2 pb-2">
          {SUGGESTED_DESCRIPTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setDescription(s)}
              className="text-left px-3.5 py-2 border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 bg-white rounded-xl text-xs font-semibold text-gray-650 hover:text-emerald-800 transition-all max-w-full cursor-pointer"
            >
              "{s}"
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleMatchSearch}
            disabled={loading || !description.trim()}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md disabled:bg-gray-300 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
          >
            {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-100 fill-emerald-100" />}
            Find Best Matches
          </button>
        </div>
      </div>

      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-950">Matched Opportunities</h3>
              {refinedQuery && (
                <p className="text-xs text-gray-500 mt-1">
                  AI Concentrated Keywords: <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-semibold text-[11px]">{refinedQuery}</span>
                </p>
              )}
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-bold">
              {matches.length} matches found
            </span>
          </div>

          {loading ? (
            <div className="clean-card p-12 text-center flex flex-col items-center justify-center space-y-4 bg-white">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-50 border-t-emerald-600 animate-spin" />
              <p className="text-sm font-semibold text-gray-600">Yuva Scout Protocol analyzing match scores...</p>
            </div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((item, idx) => (
                <div key={item.id || idx} className="clean-card p-6 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between h-full group bg-white border border-gray-150">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xxs font-black uppercase rounded-md tracking-wider">
                        {item.type || 'Opportunity'}
                      </span>
                      {item.match_score && (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50/50 px-2 py-0.5 rounded">
                          {item.match_score}% Align
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors text-base line-clamp-1 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 font-semibold mb-3">
                      {item.organization} • {item.location || 'Remote'}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xxs font-bold text-slate-600 bg-[#F1F5F9] px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-100 pt-3.5 mt-auto">
                    <span className="text-xxs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                      {item.deadline || 'Rolling admission'}
                    </span>
                    <a
                      href={item.apply_link || item.applyLink || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-emerald-600 text-white hover:bg-emerald-750 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      Apply / Open
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="clean-card p-12 text-center text-gray-400 bg-white">
              <p className="text-sm font-semibold mb-2">No matching opportunities found for your query.</p>
              <p className="text-xs text-gray-500">Try broadening your description or searching with other keywords.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Career Roadmap Component
function CareerRoadmap({ profile }: { profile: UserProfile | null }) {
  const [targetRole, setTargetRole] = useState('');
  const [education, setEducation] = useState(profile?.college ? `${profile.field || profile.year || 'Degree'} at ${profile.college}` : 'B.Tech Computer Science');
  const [currentSkills, setCurrentSkills] = useState(profile?.skills?.join(', ') || 'JavaScript, HTML/CSS, Git');
  const [timeframe, setTimeframe] = useState('6 Months');

  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [saved, setSaved] = useState(false);

  const rolePresets = [
    'Full Stack Developer',
    'Frontend Engineer',
    'Backend Engineer',
    'Data Scientist / AI Engineer',
    'Mobile App Developer (React Native/Flutter)',
    'DevOps / Cloud Architect',
    'Product Manager'
  ];

  const handleGenerate = async (e?: React.FormEvent, useFallback = false) => {
    if (e) e.preventDefault();
    if (!targetRole.trim()) {
      setError('Please enter or select a target career role.');
      return;
    }

    setLoading(true);
    setError(null);
    setRoadmap(null);
    setCompletedSteps([]);
    setSaved(false);

    try {
      const response = await fetch('/api/ai/career-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          education,
          currentSkills,
          timeframe,
          useFallback
        })
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      const data = await response.json();
      setRoadmap(data);
    } catch (err: any) {
      console.error('Roadmap generation error:', err);
      setError('Could not generate career roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStepCompleted = (stepNum: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepNum) ? prev.filter(s => s !== stepNum) : [...prev, stepNum]
    );
  };

  const handleSaveRoadmap = () => {
    if (!roadmap) return;
    try {
      const existing = JSON.parse(localStorage.getItem('yuvahub_saved_roadmaps') || '[]');
      const updated = [roadmap, ...existing.filter((r: any) => r.title !== roadmap.title)];
      localStorage.setItem('yuvahub_saved_roadmaps', JSON.stringify(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Error saving roadmap locally:', e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">AI Career Roadmap Generator</h3>
              <p className="text-xs text-gray-500 font-medium">Build a step-by-step milestone learning path tailored to your goals.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Target Role Input & Presets */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Target Career Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Developer, Data Scientist, DevOps Engineer"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-gray-400 font-medium py-1">Quick Picks:</span>
              {rolePresets.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetRole(role)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${targetRole === role
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Education Level
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="e.g. B.Tech 2nd Year, BCA"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Current Known Skills
              </label>
              <input
                type="text"
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                placeholder="e.g. Python, C++, HTML/CSS"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Desired Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium bg-white"
              >
                <option value="3 Months">3 Months (Intensive)</option>
                <option value="6 Months">6 Months (Standard)</option>
                <option value="1 Year">1 Year (Comprehensive)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex flex-col gap-2">
              <ErrorState title="Generation Notice" description={error} />
              <div className="flex justify-center mt-1 mb-2">
                <button type="button" onClick={() => handleGenerate(undefined, true)} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold border border-indigo-200 hover:bg-indigo-100">
                  Use Fallback Roadmap
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                Building Customized Career Roadmap...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate AI Career Roadmap
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200/80 shadow-sm space-y-6 animate-pulse">
          <div className="h-7 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="h-4 bg-gray-100 rounded-lg w-2/3"></div>
          <div className="space-y-4 pt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap Output View */}
      {roadmap && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-sm space-y-8 animate-fade-in">
          {/* Header & Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                  {roadmap.targetRole}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {roadmap.estimatedTimeframe}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{roadmap.title}</h3>
              {roadmap.overview && <p className="text-sm text-gray-600 mt-1">{roadmap.overview}</p>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveRoadmap}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 transition-colors text-gray-700"
              >
                <Bookmark className="w-4 h-4 text-indigo-600" />
                {saved ? 'Saved to Profile!' : 'Save Roadmap'}
              </button>
              <button
                onClick={() => generateCareerRoadmapPdf(roadmap)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Progress Tracker Bar */}
          {roadmap.milestones && (
            <div className="bg-indigo-50/60 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                Progress Tracker: {completedSteps.length} of {roadmap.milestones.length} Milestones Completed
              </div>
              <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-500"
                  style={{ width: `${(completedSteps.length / roadmap.milestones.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Vertical Timeline Nodes */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200">
            {roadmap.milestones?.map((m: any, index: number) => {
              const stepNum = m.step || index + 1;
              const isCompleted = completedSteps.includes(stepNum);

              return (
                <div key={stepNum} className="relative group">
                  {/* Step Node Marker */}
                  <button
                    onClick={() => toggleStepCompleted(stepNum)}
                    className={`absolute -left-6 sm:-left-8 top-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${isCompleted
                        ? 'bg-emerald-500 text-white shadow-md ring-4 ring-emerald-100'
                        : 'bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100 group-hover:scale-110'
                      }`}
                  >
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNum}
                  </button>

                  <div className={`bg-gray-50/80 rounded-2xl p-5 sm:p-6 border transition-all ${isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-gray-200/70 hover:border-indigo-200 hover:shadow-md'}`}>
                    {/* Milestone Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        {m.title}
                      </h4>
                      {m.duration && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                          {m.duration}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{m.description}</p>

                    {/* Topics Pills */}
                    {m.topics && m.topics.length > 0 && (
                      <div className="mb-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Key Skills & Concepts:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.topics.map((t: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-2xs">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Project Idea Callout */}
                    {m.projectIdea && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 mb-4 flex items-start gap-3">
                        <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-emerald-900 block">Milestone Portfolio Project:</span>
                          <p className="text-xs text-emerald-800 font-medium mt-0.5">{m.projectIdea}</p>
                        </div>
                      </div>
                    )}

                    {/* Recommended Resources */}
                    {m.recommendedResources && m.recommendedResources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/50">
                        <span className="text-xs font-medium text-gray-500">Suggested Resources:</span>
                        {m.recommendedResources.map((res: string, i: number) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline">
                            {res}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function OutreachGenerator({ profile }: { profile: any }) {
  const [recruiterName, setRecruiterName] = useState("");
  const [company, setCompany] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [outreachType, setOutreachType] = useState("Email");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!recruiterName || !company || !jobRole || !outreachType) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          recruiterName, 
          company, 
          jobRole, 
          outreachType,
          resumeContext: JSON.stringify(profile)
        })
      });
      const data = await res.json();
      setResult(data.text || "Failed to generate.");
    } catch (e) {
      console.error(e);
      setResult(`Hi ${recruiterName}, I'm reaching out about the ${jobRole} role at ${company}. Given my background, I'd love to connect and learn more.`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
          <Send className="w-8 h-8 text-pink-600" /> Outreach Message Generator
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Generate personalized, punchy cold emails and LinkedIn messages to recruiters and founders.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="clean-card p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter / Contact Name</label>
            <input className="clean-input w-full p-3 text-sm" value={recruiterName} onChange={e => setRecruiterName(e.target.value)} placeholder="e.g. Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Company</label>
            <input className="clean-input w-full p-3 text-sm" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Job Role</label>
            <input className="clean-input w-full p-3 text-sm" value={jobRole} onChange={e => setJobRole(e.target.value)} placeholder="e.g. Frontend Engineer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Outreach Type</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-700">
                <input type="radio" name="outreachType" value="Email" checked={outreachType === 'Email'} onChange={() => setOutreachType('Email')} className="text-pink-600 focus:ring-pink-500 w-4 h-4" />
                Email
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer text-gray-700">
                <input type="radio" name="outreachType" value="LinkedIn Connect" checked={outreachType === 'LinkedIn Connect'} onChange={() => setOutreachType('LinkedIn Connect')} className="text-pink-600 focus:ring-pink-500 w-4 h-4" />
                LinkedIn
              </label>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !recruiterName || !company || !jobRole}
            className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold shadow-md disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Message
          </button>
        </div>

        <div className="clean-card bg-gray-50 p-6 flex flex-col relative overflow-hidden">
          {result ? (
            <div className="flex flex-col h-full justify-between">
              <div className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed overflow-y-auto max-h-[350px] mb-4 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                {result}
              </div>
              <div className="pt-3 flex justify-end">
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-50 text-pink-700 hover:bg-pink-100 font-bold rounded-lg border border-pink-200 transition-colors text-sm cursor-pointer"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />} 
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
            </div>
          ) : (
            <div className="m-auto text-gray-400 text-sm flex flex-col items-center justify-center text-center p-4">
              <Send className="w-12 h-12 mb-3 opacity-50 text-pink-300" />
              Your generated outreach message will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Award,
  BookOpen,
  Code,
  Briefcase,
  Target,
  Sliders,
  ShieldCheck,
  Layers,
  X,
  FileCode
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function ResumeAtsStudio() {
  const { user, profile } = useAppContext();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'editor' | 'ats_check' | 'benchmarks' | 'export'>('editor');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Resume Data State
  const [resumeData, setResumeData] = useState({
    fullName: profile?.name || user?.displayName || 'Student Developer',
    email: user?.email || 'student@yuvahub.com',
    targetRole: 'Senior Full Stack & AI Engineer',
    summary: 'Full stack developer with experience building scalable Web apps, real-time telemetry, and LLM integrations using React, TypeScript, and Node.js.',
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Firebase', 'Python', 'Google Cloud AI'],
    experiences: [
      {
        id: 'exp_1',
        title: 'Lead Software Developer',
        company: 'YuvaHub Open Source',
        duration: '2024 - Present',
        bullets: [
          'Architected responsive React/TypeScript components reducing UI latency by 40%.',
          'Integrated secure REST API backends with JWT authentication telemetry.'
        ]
      }
    ],
    projects: [
      {
        id: 'proj_1',
        name: 'YuvaHub Talent Platform',
        tech: 'React, TypeScript, Express',
        link: 'https://github.com/Chirag1724/YuvaHub',
        description: 'Global student opportunity aggregator featuring AI career match and hackathon submission studio.'
      }
    ]
  });

  const [jobDescription, setJobDescription] = useState(`Seeking a Full Stack Engineer proficient in React, TypeScript, GraphQL, Node.js, and Cloud Infrastructure to build high-scale web applications.`);
  const [newSkill, setNewSkill] = useState('');

  // Dynamic ATS Score Calculation
  const atsAnalysis = useMemo(() => {
    const jdKeywords = jobDescription.toLowerCase().match(/\b[a-z0-9.]+\b/g) || [];
    const resumeText = `${resumeData.summary} ${resumeData.skills.join(' ')} ${resumeData.experiences.flatMap(e => e.bullets).join(' ')}`.toLowerCase();

    const matched = Array.from(new Set(jdKeywords.filter((k: string) => k.length > 3 && resumeText.includes(k))));
    const score = Math.min(96, Math.max(50, Math.round((matched.length / Math.max(1, new Set(jdKeywords).size)) * 300)));

    return {
      score,
      matchedCount: matched.length,
      topMatched: matched.slice(0, 8),
      recommendations: [
        'Use action verbs at the start of bullet points: "Architected", "Deployed", "Optimized".',
        'Add quantifiable metrics (e.g. "% performance gain" or "X concurrent users").',
        'Ensure contact information and LinkedIn URL are in plain header text.'
      ]
    };
  }, [resumeData, jobDescription]);

  // Handle Add Skill
  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (resumeData.skills.includes(newSkill.trim())) return;
    setResumeData({ ...resumeData, skills: [...resumeData.skills, newSkill.trim()] });
    setNewSkill('');
    setNotification({ type: 'success', message: 'Added skill to resume ATS stack!' });
  };

  // Handle Remove Skill
  const handleRemoveSkill = (skill: string) => {
    setResumeData({ ...resumeData, skills: resumeData.skills.filter(s => s !== skill) });
    setNotification({ type: 'success', message: `Removed ${skill} from resume.` });
  };

  // Export Resume JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(resumeData, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Resume_${(resumeData.fullName || 'Draft').replace(/\s+/g, '_')}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setNotification({ type: 'success', message: 'Exported Resume JSON Manifest!' });
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      
      {/* Top Banner Header - Brand Theme */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Resume & Career Builder
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                Real-Time ATS Parsing
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Resume ATS <span className="text-primary-blue italic">Optimizer</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Analyze your developer resume against target job descriptions, discover missing technical keywords, and guarantee Applicant Tracking System compatibility.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-base text-primary-blue">
              {atsAnalysis.score}%
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">ATS Score</div>
              <div className="text-xs font-extrabold text-white">High Compatibility</div>
              <div className="text-[11px] text-emerald-400 font-semibold">{atsAnalysis.matchedCount} Keywords Matched</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-border-theme dark:border-slate-800 pb-3">
        {[
          { id: 'editor', label: 'Resume Section Editor', icon: Sliders },
          { id: 'ats_check', label: 'ATS Keyword Audit', icon: Target },
          { id: 'benchmarks', label: 'Role Benchmarks', icon: Award },
          { id: 'export', label: 'Export Manifest', icon: Download }
        ].map(tab => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-primary-blue border-primary-blue text-white shadow-sm scale-[1.02]'
                  : 'bg-surface dark:bg-slate-900 border-border-theme dark:border-slate-800 text-text-secondary dark:text-slate-300 hover:bg-surface-secondary'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-primary-blue'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification Banner */}
      {notification.message && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30 text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab 1: Resume Section Editor */}
      {activeTab === 'editor' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-border-theme dark:border-slate-800 pb-4">
            <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">Resume Information & Skill Stack</h2>
            <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">Update your profile summary and technical skills to maximize keyword matching.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase">Full Name</label>
                <input
                  type="text"
                  value={resumeData.fullName}
                  onChange={e => setResumeData({ ...resumeData, fullName: e.target.value })}
                  className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-text-secondary uppercase">Target Role Title</label>
                <input
                  type="text"
                  value={resumeData.targetRole}
                  onChange={e => setResumeData({ ...resumeData, targetRole: e.target.value })}
                  className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase">Professional Summary</label>
              <textarea
                rows={3}
                value={resumeData.summary}
                onChange={e => setResumeData({ ...resumeData, summary: e.target.value })}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="font-bold text-text-secondary uppercase">Technical Skills Stack</label>
              <form onSubmit={handleAddSkill} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Redis, GraphQL)..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  className="flex-1 bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-2.5 text-xs text-text-primary dark:text-white outline-none"
                />
                <button type="submit" className="px-4 py-2.5 bg-primary-blue text-white font-bold rounded-xl flex items-center gap-1 cursor-pointer">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                {resumeData.skills.map(s => (
                  <span key={s} className="px-3 py-1 bg-surface-secondary dark:bg-slate-800 text-text-primary dark:text-slate-200 border border-border-theme rounded-xl text-xs font-bold flex items-center gap-2">
                    <span>{s}</span>
                    <button onClick={() => handleRemoveSkill(s)} className="text-text-muted hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: ATS Keyword Audit */}
      {activeTab === 'ats_check' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
          <div className="border-b border-border-theme dark:border-slate-800 pb-4">
            <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">Target Job Description & Keyword Audit</h2>
            <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">Paste the target job description to dynamically audit matching keywords.</p>
          </div>

          <div className="space-y-4">
            <textarea
              rows={4}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none resize-none"
            />

            <div className="p-5 rounded-2xl bg-background border border-border-theme space-y-3">
              <h3 className="font-serif font-bold text-sm text-text-primary">Identified Matched Keywords ({atsAnalysis.matchedCount})</h3>
              <div className="flex flex-wrap gap-1.5">
                {atsAnalysis.topMatched.map(m => (
                  <span key={m} className="px-2.5 py-1 bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30 text-xs font-bold rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-xs text-text-secondary uppercase">ATS Optimization Recommendations</h4>
              {atsAnalysis.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <Sparkles className="w-3.5 h-3.5 text-primary-blue" /> {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Benchmarks */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          {[
            { role: 'Senior Full Stack Engineer', keywords: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL'], scoreNeeded: 85 },
            { role: 'AI & Machine Learning Engineer', keywords: ['Python', 'PyTorch', 'Vector DB', 'CUDA', 'Docker'], scoreNeeded: 90 }
          ].map((b, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 shadow-2xs flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-base text-text-primary dark:text-white">{b.role}</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {b.keywords.map(k => (
                    <span key={k} className="px-2 py-0.5 bg-surface-secondary text-text-secondary text-[10px] font-bold rounded border border-border-theme">
                      #{k}
                    </span>
                  ))}
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#f3e4bd] text-text-secondary font-extrabold text-xs">
                Min {b.scoreNeeded}% ATS
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Export */}
      {activeTab === 'export' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
          <div className="w-16 h-16 bg-surface-secondary text-primary-blue flex items-center justify-center rounded-full mx-auto border border-border-theme">
            <Download className="w-8 h-8 text-primary-blue" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary dark:text-white">Export Resume Manifest</h2>
          <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">
            Download full structured resume sections, skills stack, and experiences in JSON format.
          </p>
          <button onClick={handleExportJson} className="px-6 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Resume JSON Manifest
          </button>
        </div>
      )}
    </div>
  );
}

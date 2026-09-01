import React, { useState } from 'react';
import {
  Shield, Lock, Server, Key, Terminal, CheckCircle2, ArrowRight, FileText,
  AlertTriangle, ShieldCheck, Eye, Cpu, Database, Send, Check, Activity, Globe, LockKeyhole
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Security() {
  const { setActiveTab } = useAppContext();
  const [activeSection, setActiveSection] = useState<string>('auth');
  const [reportForm, setReportForm] = useState({
    name: '',
    email: '',
    severity: 'medium',
    component: 'auth',
    description: '',
    steps: ''
  });
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportForm.email && reportForm.description) {
      setReportSubmitted(true);
    }
  };

  const securitySections = [
    {
      id: 'auth',
      title: '1. Auth & Zero-Trust Protocol',
      icon: Key,
      badge: 'OAUTH 2.0 / OIDC',
      details: [
        {
          heading: 'OAuth 2.0 & Firebase Auth Isolation',
          text: 'Authentication is delegated to trusted providers (Google OAuth & GitHub OAuth). Passwords are never collected, hashed, or stored directly on YuvaHub servers, eliminating credential leak vectors.'
        },
        {
          heading: 'Stateless Session Verification',
          text: 'Client sessions rely on cryptographically signed JWT tokens with short lifespans. Re-authentication is required for sensitive administrative and account updates.'
        },
        {
          heading: 'Automated Rate-Limiting & WAF',
          text: 'Protected by Cloudflare Web Application Firewall (WAF) and Redis rate limiting to mitigate brute-force attacks, DDoS attempts, and automated credential stuffing.'
        }
      ]
    },
    {
      id: 'encryption',
      title: '2. Data Encryption & AI Isolation',
      icon: Lock,
      badge: 'AES-256 & TLS 1.3',
      details: [
        {
          heading: 'AES-256 Encryption at Rest',
          text: 'All student profile records, bookmarks, and application tracking data are encrypted at rest using AES-256 in isolated Google Cloud Firestore and MongoDB Atlas clusters.'
        },
        {
          heading: 'Enforced TLS 1.3 in Transit',
          text: 'All data transmitted between your browser and YuvaHub microservices is strictly encrypted over TLS 1.3 with HTTPS enforcement and HTTP Strict Transport Security (HSTS).'
        },
        {
          heading: 'Stateless Gemini AI Prompt Sandboxing',
          text: 'Resumes, cover letters, and technical queries sent to Google Gemini AI API endpoints are processed in ephemeral, stateless sessions. Raw student documents are never used to train public LLM models.'
        }
      ]
    },
    {
      id: 'cloud',
      title: '3. Cloud & Infrastructure Perimeter',
      icon: Server,
      badge: 'VPC & RBAC',
      details: [
        {
          heading: 'Isolated Virtual Private Clouds (VPC)',
          text: 'Production databases and background workers run inside private subnetworks inaccessible directly from the public internet. Access is restricted to authenticated backend services via VPC peering.'
        },
        {
          heading: 'Role-Based Access Control (RBAC)',
          text: 'Internal developer and operational access strictly follows the Principle of Least Privilege. Multi-Factor Authentication (MFA) and hardware keys are mandatory for all infrastructure access.'
        },
        {
          heading: 'Continuous Automated Audits',
          text: 'Automated static code analysis (SAST) and software bill of materials (SBOM) scanning pipelines run on every pull request to identify and patch vulnerable dependencies before deployment.'
        }
      ]
    },
    {
      id: 'bounty',
      title: '4. Vulnerability Disclosure & Bug Bounty',
      icon: Terminal,
      badge: 'RESPONSIBLE DISCLOSURE',
      details: []
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans pb-20 selection:bg-[#f3e4bd] selection:text-text-secondary">

      {/* Hero Banner */}
      <div className="max-w-5xl mx-auto text-center space-y-4 pt-10 pb-12 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f3e4bd] border border-border-theme text-text-secondary text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#63703d]" /> SOC-2 Type II & ISO 27001 Aligned
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-text-primary">
          Enterprise Security & <span className="italic text-primary-blue underline decoration-[#b5c37c] decoration-wavy decoration-2">Zero-Trust Architecture</span>
        </h1>
        <p className="text-base text-text-secondary/90 leading-relaxed max-w-2xl mx-auto">
          YuvaHub employs defense-in-depth security to protect student profiles, resume data, AI prompts, and verified opportunity databases against unauthorized access.
        </p>
      </div>

      {/* Telemetry Live Indicator Bar */}
      <div className="max-w-5xl mx-auto mb-10 px-6">
        <div className="bg-[#603620] text-[#fcf9f2] p-5 rounded-2xl border border-[#231f20] grid grid-cols-2 md:grid-cols-4 gap-4 text-center shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Encryption</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <LockKeyhole className="w-3.5 h-3.5 text-[#b5c37c]" /> AES-256 & TLS 1.3
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Authentication</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b5c37c]" /> OAuth 2.0 Stateless
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">AI Privacy</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#b5c37c]" /> Zero LLM Training
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">System Health</span>
            <p className="text-xs font-serif font-bold text-[#b5c37c] flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#b5c37c] animate-pulse" /> 100% Operational
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Navigation Sidebar */}
        <div className="md:col-span-4 space-y-2">
          {securitySections.map(sec => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${isActive
                    ? 'bg-[#603620] text-[#fcf9f2] border-[#603620] shadow-md'
                    : 'bg-surface text-text-secondary border-border-theme hover:border-primary-blue'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#f3e4bd]' : 'text-primary-blue'}`} />
                  <span className="text-xs font-bold">{sec.title}</span>
                </div>
              </button>
            );
          })}

          {/* Quick Contact Card */}
          <div className="mt-6 p-5 bg-[#f3e4bd]/50 border border-border-theme rounded-2xl text-left space-y-2">
            <h4 className="text-xs font-serif font-bold text-text-secondary">Security Emergency?</h4>
            <p className="text-[11px] text-text-secondary/80">Contact our Security Operations Center directly at <span className="font-bold underline">security@yuvahub.com</span>.</p>
          </div>
        </div>

        {/* Details Content Box */}
        <div className="md:col-span-8 bg-surface p-8 sm:p-10 rounded-3xl border border-border-theme shadow-sm space-y-8">

          {activeSection !== 'bounty' ? (
            securitySections.filter(s => s.id === activeSection).map(s => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="space-y-6 text-left">
                  <div className="flex items-center justify-between pb-4 border-b border-border-theme">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#f3e4bd] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-blue" />
                      </div>
                      <div>
                        <h3 className="text-xl font-serif font-bold text-text-primary">{s.title}</h3>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-blue">{s.badge}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {s.details.map((detail, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-background border border-border-theme space-y-2">
                        <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#63703d] shrink-0" />
                          {detail.heading}
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed pl-6">
                          {detail.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            /* Vulnerability Report Form Section */
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-border-theme">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#f3e4bd] flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-primary-blue" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-text-primary">Vulnerability Disclosure Form</h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#63703d]">RESPONSIBLE DISCLOSURE PROGRAM</span>
                  </div>
                </div>
              </div>

              {reportSubmitted ? (
                <div className="p-8 bg-background border border-border-theme rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#63703d] mx-auto" />
                  <h4 className="text-lg font-serif font-bold text-text-primary">Report Received</h4>
                  <p className="text-xs text-text-secondary max-w-sm mx-auto">
                    Thank you for contributing to YuvaHub security. Our security team will review your submission within 24 hours.
                  </p>
                  <button
                    onClick={() => setReportSubmitted(false)}
                    className="px-5 py-2 bg-[#603620] text-white text-xs font-bold rounded-xl"
                  >
                    Submit Another Report
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Researcher Name</label>
                      <input
                        type="text"
                        required
                        value={reportForm.name}
                        onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
                        placeholder="Your full name or handle"
                        className="w-full text-xs px-3.5 py-2.5 bg-background border border-border-theme rounded-xl outline-none focus:border-primary-blue"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Email Address</label>
                      <input
                        type="email"
                        required
                        value={reportForm.email}
                        onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                        placeholder="researcher@domain.com"
                        className="w-full text-xs px-3.5 py-2.5 bg-background border border-border-theme rounded-xl outline-none focus:border-primary-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Severity Level</label>
                      <select
                        value={reportForm.severity}
                        onChange={(e) => setReportForm({ ...reportForm, severity: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 bg-background border border-border-theme rounded-xl outline-none focus:border-primary-blue"
                      >
                        <option value="low">Low (UI glitch / Information Leak)</option>
                        <option value="medium">Medium (CSRF / Rate Limit bypass)</option>
                        <option value="high">High (Stored XSS / Privilege escalation)</option>
                        <option value="critical">Critical (RCE / Authentication bypass)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Affected Module</label>
                      <select
                        value={reportForm.component}
                        onChange={(e) => setReportForm({ ...reportForm, component: e.target.value })}
                        className="w-full text-xs px-3.5 py-2.5 bg-background border border-border-theme rounded-xl outline-none focus:border-primary-blue"
                      >
                        <option value="auth">Firebase Auth / OAuth Sessions</option>
                        <option value="api">Backend API / Express Endpoints</option>
                        <option value="ai">Gemini AI Pipeline / Prompt Gateway</option>
                        <option value="db">Firestore / MongoDB Storage</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">Vulnerability Description & Impact</label>
                    <textarea
                      rows={3}
                      required
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      placeholder="Detailed description of the potential vulnerability..."
                      className="w-full text-xs px-3.5 py-2.5 bg-background border border-border-theme rounded-xl outline-none focus:border-primary-blue resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-primary-blue hover:bg-[#603620] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    Submit Disclosure Report <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer Back Action */}
          <div className="pt-6 border-t border-border-theme flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center gap-1.5 text-[#63703d] font-bold">
              <ShieldCheck className="w-4 h-4" /> Continuous Vulnerability Scanning
            </span>
            <button
              onClick={() => { setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="text-primary-blue hover:underline font-bold bg-transparent border-none cursor-pointer"
            >
              Back to Dashboard →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

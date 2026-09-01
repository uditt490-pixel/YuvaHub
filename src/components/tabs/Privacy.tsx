import React, { useState } from 'react';
import {
  Shield, Eye, Lock, Server, CheckCircle2, ArrowRight, FileText,
  Database, UserCheck, Trash2, Download, Mail, ShieldCheck, Sparkles, Globe
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Privacy() {
  const { setActiveTab } = useAppContext();
  const [activeSection, setActiveSection] = useState<string>('overview');

  const privacySections = [
    {
      id: 'overview',
      title: '1. Privacy Overview & Zero-Selling Guarantee',
      icon: Shield,
      badge: 'STRICT DATA ISOLATION',
      details: [
        {
          heading: 'Zero Data-Selling Guarantee',
          text: 'YuvaHub Inc. ("we", "our", "us") will NEVER sell, rent, or monetize student personal information, resumes, or application metadata to third-party data brokers or advertisers.'
        },
        {
          heading: 'Purpose-Driven Data Collection',
          text: 'We collect and process personal data solely to deliver normalized opportunity indexing, Gemini AI profile matching, ATS resume scoring, and community mentorship features.'
        },
        {
          heading: 'Global Privacy Standard',
          text: 'Our data protection architecture complies with General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), and Children\'s Online Privacy Protection Act (COPPA) guidelines.'
        }
      ]
    },
    {
      id: 'collection',
      title: '2. Information We Collect & Process',
      icon: Eye,
      badge: 'ACCOUNT & METADATA',
      details: [
        {
          heading: 'Authentication Account Credentials',
          text: 'Via Google OAuth and GitHub OAuth (Firebase Auth), we receive your display name, verified email address, avatar URL, and unique firebase identifier (UID).'
        },
        {
          heading: 'Academic & Skill Metadata',
          text: 'Supplementary details provided during profile setup, including college/university name, degree, graduation year, technical skills (e.g. React, Python), resume links, and portfolio URLs.'
        },
        {
          heading: 'Automated Usage & Telemetry Data',
          text: 'Technical metadata collected automatically during API requests: IP address, device type, browser environment, error diagnostics, and rate-limit activity logs.'
        }
      ]
    },
    {
      id: 'ai-privacy',
      title: '3. Google Gemini AI Ephemeral Sandboxing',
      icon: Sparkles,
      badge: 'EPHEMERAL AI PROCESSING',
      details: [
        {
          heading: 'Stateless API Processing',
          text: 'Resumes, cover letter prompts, and mock interview queries sent to Google Gemini AI API endpoints are processed in ephemeral, isolated server containers.'
        },
        {
          heading: 'Zero LLM Model Training',
          text: 'Raw student resumes, project descriptions, and personal portfolio data are NEVER used to train public foundational AI models or fine-tune third-party LLMs.'
        },
        {
          heading: 'Encryption in AI Transmission',
          text: 'All requests sent to Gemini AI API gateways are encrypted using TLS 1.3 with strict API key scoping and automated payload sanitization.'
        }
      ]
    },
    {
      id: 'subprocessors',
      title: '4. Cloud Sub-Processors & Data Isolation',
      icon: Server,
      badge: 'ENCRYPTED CLOUD INFRASTRUCTURE',
      details: [
        {
          heading: 'Firebase & Google Cloud Platform (GCP)',
          text: 'Authentication sessions and core user profile documents are stored in Firestore clusters encrypted at rest using AES-256 with IAM access controls.'
        },
        {
          heading: 'MongoDB Atlas & Redis Cache',
          text: 'Encrypted document collections and ephemeral rate-limiting counters operate in private VPC subnetworks isolated from public internet exposure.'
        },
        {
          heading: 'Cloudflare Edge Security & WAF',
          text: 'DDoS protection, Web Application Firewall (WAF) filtering, and SSL/TLS termination at the global edge network.'
        }
      ]
    },
    {
      id: 'student-rights',
      title: '5. Student Data Rights & Erasure (GDPR/CCPA)',
      icon: UserCheck,
      badge: 'FULL USER CONTROL',
      details: [
        {
          heading: 'Right to Access & Data Export',
          text: 'You have the right to request a complete machine-readable copy of your personal data stored on YuvaHub at any time.'
        },
        {
          heading: 'Right to Erasure ("Right to be Forgotten")',
          text: 'You can request the permanent deletion of your account, profile metadata, saved bookmarks, and activity records by emailing privacy@yuvahub.com.'
        },
        {
          heading: 'Contact Data Protection Officer (DPO)',
          text: 'For data privacy inquiries or formal requests, contact our Data Protection Officer at privacy@yuvahub.com. All requests are processed within 48 business hours.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans pb-20 selection:bg-[#f3e4bd] selection:text-text-secondary">

      {/* Hero Banner */}
      <div className="max-w-5xl mx-auto text-center space-y-4 pt-10 pb-12 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#f3e4bd] border border-border-theme text-text-secondary text-xs font-bold uppercase tracking-widest rounded-full shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#63703d]" /> GDPR & CCPA Compliant · Zero Data Selling
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-text-primary">
          Privacy Policy & <span className="italic text-primary-blue underline decoration-[#b5c37c] decoration-wavy decoration-2">Data Protection</span>
        </h1>
        <p className="text-base text-text-secondary/90 leading-relaxed max-w-2xl mx-auto">
          Transparent data protection standards safeguarding Indian student developers across account creation, AI matching, and opportunity discovery.
        </p>
      </div>

      {/* Quick Highlights Bar */}
      <div className="max-w-5xl mx-auto mb-10 px-6">
        <div className="bg-[#603620] text-[#fcf9f2] p-6 rounded-2xl border border-[#231f20] grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-md">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Data Monetization</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#b5c37c]" /> Zero Data Selling
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Encryption</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#b5c37c]" /> AES-256 & TLS 1.3
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">AI Isolation</span>
            <p className="text-xs font-serif font-bold text-[#f3e4bd] flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#b5c37c]" /> Zero LLM Model Training
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fcf9f2]/70">Student Control</span>
            <p className="text-xs font-serif font-bold text-[#b5c37c] flex items-center justify-center gap-1">
              <Trash2 className="w-3.5 h-3.5 text-[#b5c37c]" /> 1-Click Erasure Right
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">

        {/* Navigation Sidebar */}
        <div className="md:col-span-4 space-y-2">
          {privacySections.map(sec => {
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
        </div>

        {/* Details Content Box */}
        <div className="md:col-span-8 bg-surface p-8 sm:p-10 rounded-3xl border border-border-theme shadow-sm space-y-8">
          {privacySections.filter(s => s.id === activeSection).map(s => {
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

                <div className="space-y-5">
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
          })}

          {/* Footer Back Action */}
          <div className="pt-6 border-t border-border-theme flex items-center justify-between text-xs text-text-muted">
            <span className="flex items-center gap-1.5 text-[#63703d] font-bold">
              <ShieldCheck className="w-4 h-4" /> Enforced Privacy Architecture
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

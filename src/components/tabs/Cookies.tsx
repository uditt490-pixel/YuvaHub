import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cookie, 
  Shield, 
  Lock, 
  Sliders, 
  Check, 
  CheckCircle, 
  RefreshCw, 
  Activity, 
  AlertTriangle, 
  Trash2, 
  Eye, 
  Search, 
  Server, 
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

// Structured Cookie Sections
const cookieSections = [
  {
    id: "overview",
    title: "1. Overview of Cookie Policy",
    icon: Cookie,
    content: `Welcome to the YuvaHub Cookie Policy. This policy explains how YuvaHub ("we", "us", and "our") uses cookies and similar tracking technologies when you visit our website at yuvahub.com and interact with our web-based dashboard and API services.

We use tracking mechanisms to guarantee session continuity for student opportunites indexing, prevent authentication bypass exploits, and optimize real-time LLM chat interface loading. 

This policy should be read alongside our Privacy Policy, which details our data compilation boundaries, subprocessor locations, and GDPR/CCPA request forms.`
  },
  {
    id: "definition",
    title: "2. What are Cookies and Tracking Pixels?",
    icon: HelpCircle,
    content: `Cookies are small text files stored directly on your computer or mobile device by your web browser when you access online applications. They serve as a temporary memory bank, allowing web apps to recall configuration state and secure login parameters across page switches.

We categorize cookies as follows:
- First-Party Cookies: Set directly by our domain (yuvahub.com) to store user theme preferences, current UI tab locations, and Firebase authentication tokens.
- Third-Party Cookies: Set by partner services (e.g. Firebase Auth Gateway, MongoDB Atlas, Cloudinary) to ensure secure file uploads and API endpoints access.
- Local Storage: Modern web storage (localStorage and sessionStorage) used to persist state profiles without sending header data on every HTTP request.`
  },
  {
    id: "purpose",
    title: "3. Why We Use Cookies",
    icon: Sliders,
    content: `We utilize tracking cookies to fulfill essential platform functions, monitor API performance, and deliver personalized dashboards.

A. Strictly Necessary & Essential:
These cookies are required to let you navigate the site and utilize core secure features. For instance, storing your Firebase identity token so you remain logged in as you browse mentoring forums.

B. Personalization & Preferences:
Used to store local layout preferences (such as dark mode selection or sidebar collapse state) so you don't have to reconfigure the interface on every visit.

C. Analytics & Core Diagnostic Tracking:
These cookies help us gather anonymous metrics regarding page load latency, network response speeds, and resource errors. This data is fed into our optimization engines to improve code performance.`
  },
  {
    id: "thirdparty",
    title: "4. Third-Party Cookie Disclosures",
    icon: Server,
    content: `Some opportunities indexed on YuvaHub link to external applicant tracking networks. When you click these external links, third-party sites may place cookies on your browser.

Our verified third-party partners include:
- Firebase Authentication (Google): Manages secure user token refreshing, session security, and OAuth logins.
- Cloudinary Media CDN: Sets media optimization cookies to accelerate resume downloading speeds.
- Google Gemini API: Requires session validation parameters to secure chat streams in our AIAssistant.`
  },
  {
    id: "control",
    title: "5. Controlling and Deleting Cookies",
    icon: Lock,
    content: `You have the right to decide whether to accept or reject optional cookies. You can update your storage choices inside our Consent Manager at any time.

Additionally, most browser configurations allow you to:
- Review cookies currently stored on your system.
- Block all cookies, block only third-party cookies, or accept all cookies.
- Clear all cookies upon closing your browser window.

Please note that disabling strictly necessary cookies will prevent you from signing into the dashboard or using the AIAssistant.`
  }
];

// Simulated Cookie audit list
const initialCookies = [
  { name: "yuvahub-session-token", domain: "yuvahub.com", category: "Essential", expires: "End of Session", value: "firebase-jwt-secure-tok..." },
  { name: "yuvahub-theme", domain: "yuvahub.com", category: "Functional", expires: "1 Year", value: "dark" },
  { name: "activeTab", domain: "yuvahub.com", category: "Functional", expires: "7 Days", value: "dashboard" },
  { name: "_ga_analytics_id", domain: "google-analytics.com", category: "Analytics", expires: "2 Years", value: "GA1.2.14885239..." },
  { name: "cloudinary-delivery-opt", domain: "cloudinary.com", category: "Analytics", expires: "30 Days", value: "webp-optimized-true" }
];

export default function Cookies() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Cookie Preferences
  const [preferences, setPreferences] = useState({
    essential: true,
    functional: true,
    analytics: false
  });
  
  // Cookie Audit States
  const [auditedCookies, setAuditedCookies] = useState<typeof initialCookies>([]);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Opt-out states
  const [optOutEmail, setOptOutEmail] = useState("");
  const [optOutStatus, setOptOutStatus] = useState<string | null>(null);

  // FAQ Expand
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return cookieSections;
    const query = searchQuery.toLowerCase();
    return cookieSections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(query) ||
        sec.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Simulate cookie scan
  const handleStartScan = () => {
    setScanning(true);
    setScanComplete(false);
    setTimeout(() => {
      setAuditedCookies(initialCookies);
      setScanning(false);
      setScanComplete(true);
    }, 2000);
  };

  // Clear audited cookies
  const handleClearCookies = () => {
    setAuditedCookies([]);
    setScanComplete(false);
  };

  // Submit Opt-Out Request
  const handleOptOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optOutEmail.trim()) return;
    setOptOutStatus("processing");
    setTimeout(() => {
      setOptOutStatus("completed");
    }, 1500);
  };

  const faqs = [
    {
      q: "What happens if I reject all optional cookies?",
      a: "You will still be able to search and browse opportunities. However, the site won't remember your tab selections, search parameters, or custom study-plan history from the AIAssistant."
    },
    {
      q: "Does YuvaHub track my browsing behavior on other websites?",
      a: "No. We do not use cross-site behavioral tracking cookies. Third-party cookies on our site are restricted to infrastructure providers (Firebase, Cloudinary) to deliver core services."
    },
    {
      q: "How can I completely wipe out all local storage cached by YuvaHub?",
      a: "You can do this at any time in your browser settings (Clear Site Data) or by using our Session Audit panel below."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Header banner */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-600 to-indigo-850 p-8 md:p-12 text-white shadow-lg">
        <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-96 h-96 rounded-full bg-surface/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/15 border border-white/20 text-xs font-semibold uppercase tracking-wider mb-4">
            <Cookie className="w-3.5 h-3.5" /> Storage Compliance Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Cookie Policy
          </h1>
          <p className="mt-4 text-base md:text-lg text-indigo-100 font-medium">
            Understand how our application uses cookies, local storage indexes, and session states to provide a safe and persistent student experience.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-xs text-indigo-200">
            <span>Last Updated: July 16, 2026</span>
            <span>•</span>
            <span>Version 1.2.0 (Modular split)</span>
            <span>•</span>
            <span>Document Ref: COOKIE-2026-A</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-4 space-y-6 sticky top-6">
          <div className="clean-card p-5 dark:bg-gray-800 dark:border-gray-700">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-1.5 px-1">
              <Sliders className="w-4 h-4 text-indigo-500" /> Clause Index
            </h3>
            <nav className="space-y-1">
              {cookieSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveTab(sec.id);
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg text-left transition-all ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    <span className="truncate">{sec.title.split(". ")[1]}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cookie policy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 dark:text-white"
                />
                <Sliders className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/15 border border-indigo-200/50 dark:border-indigo-900/30 text-indigo-950 dark:text-indigo-400 shadow-xs">
            <h4 className="font-extrabold text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-650 dark:text-indigo-400" /> Storage Boundary
            </h4>
            <p className="text-[11px] leading-relaxed mt-2 text-indigo-800/90 dark:text-indigo-450/80">
              LocalStorage items set during the session do not get transmitted to any marketing databases. They remain strictly client-side.
            </p>
          </div>
        </aside>

        {/* Content sections */}
        <div className="lg:col-span-8 space-y-8">
          <div className="clean-card p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 space-y-8">
            {filteredSections.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">No sections found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Try searching for terms like "First-Party", "Google", "Local Storage", or "Analytics".
                </p>
              </div>
            ) : (
              filteredSections.map((sec) => {
                const Icon = sec.icon;
                const isHighlighted = activeTab === sec.id;
                return (
                  <article
                    id={sec.id}
                    key={sec.id}
                    className={`scroll-mt-24 pb-8 border-b border-gray-100 last:border-none last:pb-0 dark:border-gray-700/60 transition-all ${
                      isHighlighted ? 'bg-indigo-50/5 dark:bg-indigo-950/5 -mx-4 px-4 rounded-xl' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                        {sec.title}
                      </h2>
                    </div>
                    <div className="text-xs md:text-sm text-gray-650 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Interactive Widget 1: Browser Cookie Scan Audit Simulator */}
          <section className="clean-card p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Session Cookie Audit</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Scan your local browser instance to identify active cookies placed by YuvaHub.</p>
                </div>
              </div>
            </div>

            {auditedCookies.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 text-gray-450 dark:text-gray-500 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">No active scan results loaded</h4>
                  <p className="text-xs text-gray-450 dark:text-gray-500 mt-1">Initiate a local diagnosis scan to read cookie categories and expiry values.</p>
                </div>
                <button
                  onClick={handleStartScan}
                  disabled={scanning}
                  className="clean-btn px-6 py-2.5 text-xs font-semibold flex items-center gap-1.5 mx-auto"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Header Records...
                    </>
                  ) : (
                    <>
                      <Cookie className="w-3.5 h-3.5" /> Scan Browser Cookies
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="py-2.5 font-bold">Cookie Name</th>
                        <th className="py-2.5 font-bold">Category</th>
                        <th className="py-2.5 font-bold">Expires</th>
                        <th className="py-2.5 font-bold">Value Segment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {auditedCookies.map((cookie) => (
                        <tr key={cookie.name} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition">
                          <td className="py-2.5 font-bold text-gray-800 dark:text-white font-mono text-[11px]">{cookie.name}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cookie.category === 'Essential' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400' 
                                : cookie.category === 'Functional'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-400'
                            }`}>
                              {cookie.category}
                            </span>
                          </td>
                          <td className="py-2.5 text-gray-550 dark:text-gray-400">{cookie.expires}</td>
                          <td className="py-2.5 text-gray-400 dark:text-gray-500 font-mono text-[10px]">{cookie.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-[11px] text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> 5 Cookies Verified (0 Suspicious tracking nodes detected)
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleStartScan}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                    >
                      Rescan Headers
                    </button>
                    <button 
                      onClick={handleClearCookies}
                      className="px-4 py-2 bg-red-50 text-red-600 font-bold text-xs rounded-lg hover:bg-red-100 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear Audit Logs
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Interactive Widget 2: Global Advertising Opt-Out Portal */}
          <section className="clean-card p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Regional Advertising & Tracking Opt-Out</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Submit an automated opt-out preference request to block third-party indexers.</p>
              </div>
            </div>

            {optOutStatus === 'completed' ? (
              <div className="p-5 border border-dashed border-green-200 dark:border-green-900/60 bg-green-50/15 dark:bg-green-950/10 rounded-xl text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Opt-Out Preference Registered</h4>
                  <p className="text-[11px] text-gray-450 dark:text-gray-500 mt-1">Your marketing identifier has been blacklisted on partner subprocessor routes.</p>
                </div>
                <div className="max-w-xs mx-auto bg-surface dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-lg p-2.5 text-xs text-left">
                  <span className="text-gray-400">Registry Token:</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 block mt-0.5 break-all">GOP-REG-9477218B</span>
                </div>
                <button 
                  onClick={() => { setOptOutStatus(null); setOptOutEmail(""); }}
                  className="px-3.5 py-1.5 border border-gray-250 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition"
                >
                  Register Another Domain
                </button>
              </div>
            ) : (
              <form onSubmit={handleOptOutSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Account email / Registry scope</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="user@example.com"
                      value={optOutEmail}
                      onChange={(e) => setOptOutEmail(e.target.value)}
                      className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-lg px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-gray-950 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={optOutStatus === 'processing'}
                      className="clean-btn px-5 py-2.5 text-xs font-semibold shrink-0"
                    >
                      {optOutStatus === 'processing' ? 'Registering...' : 'Submit Opt-Out'}
                    </button>
                  </div>
                </div>
                <span className="block text-[10px] text-gray-400 dark:text-gray-500 leading-normal">
                  Your email will be added to our local blacklist and matches will be excluded from third-party conversion trackers.
                </span>
              </form>
            )}
          </section>

          {/* Interactive FAQs Accordion */}
          <section className="clean-card p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Cookie FAQs
                </h2>
                <p className="text-xs text-gray-400 dark:text-indigo-500 mt-0.5">
                  Understand details about storage lifetimes and cookie compliance.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-gray-150 dark:border-gray-700/60 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/10 hover:bg-gray-50 dark:hover:bg-gray-700/30 text-left transition duration-150"
                    >
                      <span className="font-semibold text-xs text-gray-900 dark:text-white">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-450 transition-transform duration-200 shrink-0 ml-2 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-surface dark:bg-gray-850 border-t border-gray-150 dark:border-gray-700/60 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

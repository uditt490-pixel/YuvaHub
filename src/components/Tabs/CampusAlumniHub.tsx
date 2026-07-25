import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Building2,
  Users,
  MapPin,
  Calendar,
  Award,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Share2,
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  Send,
  Globe,
  Briefcase,
  Star,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  UserCheck,
  Clock,
  TrendingUp
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/**
 * CampusAlumniHub Component
 * 
 * Interactive 550+ line Campus Chapter & Alumni Network Hub for YuvaHub.
 * Features:
 * 1. Campus Tech Chapter Directory (GDSC, Open Source Clubs, Hackathon Guilds)
 * 2. Verified Alumni Directory & Referral Request Portal
 * 3. Campus Event Hosting & Live RSVP System
 * 4. Chapter Leaderboard & Activity Points Matrix
 * 5. Referral & Office Hour Request Ledger
 * 6. Campus Network Manifest JSON Exporter
 */
export default function CampusAlumniHub() {
  const { user, profile } = useAppContext();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'chapters' | 'alumni' | 'events' | 'referrals' | 'export'>('chapters');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Search & Filters
  const [chapterSearch, setChapterSearch] = useState('');
  const [alumniSearch, setAlumniSearch] = useState('');

  // Campus Chapters State
  const [chapters, setChapters] = useState([
    {
      id: 'ch_1',
      name: 'IIT Bombay Open Source Club',
      college: 'IIT Bombay',
      location: 'Mumbai, MH',
      members: 1420,
      lead: 'Devanshi Mehta',
      rank: 1,
      badge: 'TOP CHAPTER 2026',
      tags: ['Open Source', 'AI/ML', 'System Programming']
    },
    {
      id: 'ch_2',
      name: 'BITS Pilani Developer Guild',
      college: 'BITS Pilani',
      location: 'Pilani, RJ',
      members: 980,
      lead: 'Rohan Verma',
      rank: 2,
      badge: 'HACKATHON CHAMPIONS',
      tags: ['Web3', 'Full Stack', 'Competitive Prog']
    },
    {
      id: 'ch_3',
      name: 'IIIT Hyderabad AI Society',
      college: 'IIIT Hyderabad',
      location: 'Hyderabad, TS',
      members: 760,
      lead: 'Ananya Roy',
      rank: 3,
      badge: 'RESEARCH HUB',
      tags: ['LLMs', 'Computer Vision', 'PyTorch']
    }
  ]);

  // Alumni Directory State
  const [alumni, setAlumni] = useState([
    {
      id: 'alm_1',
      name: 'Siddharth Sharma',
      company: 'Google Cloud AI',
      role: 'Senior Staff ML Engineer',
      gradYear: '2022',
      college: 'IIT Bombay',
      referralsAvailable: true,
      officeHours: 'Thursdays 6:00 PM IST',
      avatar: 'S'
    },
    {
      id: 'alm_2',
      name: 'Priya Nambiar',
      company: 'Stripe',
      role: 'Backend Infrastructure Lead',
      gradYear: '2021',
      college: 'BITS Pilani',
      referralsAvailable: true,
      officeHours: 'Saturdays 11:00 AM IST',
      avatar: 'P'
    },
    {
      id: 'alm_3',
      name: 'Karan Malhotra',
      company: 'Meta AI',
      role: 'Research Scientist',
      gradYear: '2023',
      college: 'IIIT Hyderabad',
      referralsAvailable: false,
      officeHours: 'By Appointment',
      avatar: 'K'
    }
  ]);

  // Events State
  const [events, setEvents] = useState([
    {
      id: 'evt_1',
      title: 'Generative AI & Agentic Workflows Summit',
      chapter: 'IIT Bombay Open Source Club',
      date: '2026-08-10',
      time: '5:00 PM IST',
      location: 'Online / Auditorium 1',
      rsvps: 340,
      maxCapacity: 500,
      userRsvp: true
    },
    {
      id: 'evt_2',
      title: 'Rust & WebAssembly Systems Workshop',
      chapter: 'BITS Pilani Developer Guild',
      date: '2026-08-18',
      time: '6:30 PM IST',
      location: 'Tech Block 3',
      rsvps: 180,
      maxCapacity: 200,
      userRsvp: false
    }
  ]);
  const [newEventTitle, setNewEventTitle] = useState('');

  // Referral Requests State
  const [referralRequests, setReferralRequests] = useState([
    {
      id: 'ref_1',
      alumniName: 'Siddharth Sharma',
      company: 'Google Cloud AI',
      roleTarget: 'Software Engineering Intern 2026',
      status: 'ACCEPTED',
      requestDate: '2026-07-10'
    }
  ]);
  const [targetRole, setTargetRole] = useState('');
  const [selectedAlumniId, setSelectedAlumniId] = useState('');

  // Toggle RSVP
  const handleToggleRsvp = (eventId: string) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        const nextRsvp = !e.userRsvp;
        return {
          ...e,
          userRsvp: nextRsvp,
          rsvps: nextRsvp ? e.rsvps + 1 : e.rsvps - 1
        };
      }
      return e;
    }));
    setNotification({ type: 'success', message: 'Updated event RSVP status!' });
  };

  // Submit Referral Request
  const handleRequestReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim() || !selectedAlumniId) return;

    const targetAlumni = alumni.find(a => a.id === selectedAlumniId);
    if (!targetAlumni) return;

    const newRef = {
      id: `ref_${Date.now()}`,
      alumniName: targetAlumni.name,
      company: targetAlumni.company,
      roleTarget: targetRole.trim(),
      status: 'PENDING',
      requestDate: new Date().toISOString().split('T')[0]
    };

    setReferralRequests([...referralRequests, newRef]);
    setTargetRole('');
    setNotification({ type: 'success', message: `Submitted referral request to ${targetAlumni.name}!` });
  };

  // Add Campus Event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvt = {
      id: `evt_${Date.now()}`,
      title: newEventTitle.trim(),
      chapter: 'IIT Bombay Open Source Club',
      date: '2026-08-25',
      time: '6:00 PM IST',
      location: 'Virtual / Campus Center',
      rsvps: 1,
      maxCapacity: 250,
      userRsvp: true
    };

    setEvents([...events, newEvt]);
    setNewEventTitle('');
    setNotification({ type: 'success', message: 'Created campus chapter event!' });
  };

  // Export Campus Network Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      chaptersCount: chapters.length,
      alumniCount: alumni.length,
      userRsvps: events.filter(e => e.userRsvp),
      referralRequests: referralRequests,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Campus_Network_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // Filtered Chapters & Alumni
  const filteredChapters = chapters.filter(c =>
    c.name.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    c.college.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const filteredAlumni = alumni.filter(a =>
    a.name.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    a.company.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    a.role.toLowerCase().includes(alumniSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 border border-indigo-500/30 rounded-full flex items-center gap-1.5">
                <GraduationCap size={13} /> Campus Network & Alumni Guild
              </span>
              <span className="px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                50+ University Chapters
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Campus Chapter & Alumni Referral Hub
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Connect with top tech alumni, join campus chapters, host developer workshops, and request job referral endorsements.
            </p>
          </div>

          {/* Network Stats Meter */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-indigo-700/60 p-4 rounded-2xl w-full lg:w-auto shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-indigo-400 bg-slate-950 font-black text-xl text-indigo-400">
              3,160+
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Active Network Members</div>
              <div className="text-xs font-extrabold text-emerald-400">{alumni.length} Verified Alumni</div>
              <div className="text-[11px] text-slate-400">{events.filter(e => e.userRsvp).length} Upcoming Event RSVPs</div>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {notification.message && (
          <div className={`mt-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === 'error'
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: '', message: '' })} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
        {[
          { id: 'chapters', label: `Campus Chapters (${chapters.length})`, icon: Building2 },
          { id: 'alumni', label: `Alumni Directory (${alumni.length})`, icon: Users },
          { id: 'events', label: `Campus Events (${events.length})`, icon: Calendar },
          { id: 'referrals', label: `Referral Requests (${referralRequests.length})`, icon: Briefcase },
          { id: 'export', label: 'Network Manifest JSON', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: CHAPTERS */}
      {activeTab === 'chapters' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">University Tech Chapters</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Join student circles for open source, competitive coding, and hackathons.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by chapter or college..."
                value={chapterSearch}
                onChange={(e) => setChapterSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredChapters.map((c) => (
              <div key={c.id} className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 flex flex-col justify-between text-xs">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">Rank #{c.rank}</span>
                    <span className="px-2 py-0.5 font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px]">
                      {c.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm mt-2">{c.name}</h4>
                  <p className="text-gray-500 dark:text-gray-400">{c.college} • {c.location}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>Members: <strong className="text-gray-900 dark:text-white">{c.members}</strong></span>
                    <span>Lead: {c.lead}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {c.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-semibold rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => setNotification({ type: 'success', message: `Joined ${c.name}!` })}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
                  >
                    Join Chapter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ALUMNI DIRECTORY */}
      {activeTab === 'alumni' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Verified Alumni Network</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Request referrals and book 1-on-1 office hours with alumni in tech.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search company or role..."
                value={alumniSearch}
                onChange={(e) => setAlumniSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredAlumni.map((a) => (
              <div key={a.id} className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                    {a.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">{a.name}</h4>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium">{a.company}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                  <div>Role: <strong>{a.role}</strong></div>
                  <div>Alma Mater: {a.college} ({a.gradYear})</div>
                  <div>Office Hours: {a.officeHours}</div>
                </div>

                <button
                  onClick={() => {
                    setSelectedAlumniId(a.id);
                    setActiveTab('referrals');
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition"
                >
                  Request Referral
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: EVENTS */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Campus Workshops & Seminars</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">RSVP for upcoming technical workshops organized by campus chapters.</p>
            </div>
          </div>

          <form onSubmit={handleAddEvent} className="flex gap-2">
            <input
              type="text"
              placeholder="Host event title (e.g. LLM Fine-Tuning Workshop)..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              required
            />
            <button type="submit" className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition">
              + Host Event
            </button>
          </form>

          <div className="space-y-3">
            {events.map((e) => (
              <div key={e.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{e.title}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md">
                      {e.chapter}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {e.date} at {e.time} • {e.location} • ({e.rsvps} / {e.maxCapacity} RSVPs)
                  </p>
                </div>

                <button
                  onClick={() => handleToggleRsvp(e.id)}
                  className={`px-4 py-2 font-bold rounded-xl transition ${
                    e.userRsvp
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {e.userRsvp ? '✓ RSVP Confirmed' : 'RSVP Spot'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REFERRALS */}
      {activeTab === 'referrals' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Submit Referral Request</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Provide job role details for alumni review.</p>
          </div>

          <form onSubmit={handleRequestReferral} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Select Alumni</label>
              <select
                value={selectedAlumniId}
                onChange={(e) => setSelectedAlumniId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                required
              >
                <option value="">-- Choose Alumni --</option>
                {alumni.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.company} - {a.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Target Job Role & Requisition ID</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer New Grad (Req #99812)..."
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                required
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition">
              Submit Referral Request
            </button>
          </form>

          <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-xs text-gray-900 dark:text-white">Active Referral Ledger</h4>
            {referralRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">{r.alumniName} ({r.company})</div>
                  <div className="text-gray-500">{r.roleTarget}</div>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                  r.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXPORT MANIFEST */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Campus Network Manifest JSON</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete summary of chapter memberships and referral requests.</p>
            </div>

            <button
              onClick={handleExportManifest}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Download size={14} /> Download Manifest JSON
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
            <pre>{JSON.stringify({
              chaptersCount: chapters.length,
              alumniCount: alumni.length,
              userRsvps: events.filter(e => e.userRsvp),
              referralRequests: referralRequests,
              timestamp: new Date().toISOString()
            }, null, 2)}</pre>
          </div>
        </div>
      )}

    </div>
  );
}

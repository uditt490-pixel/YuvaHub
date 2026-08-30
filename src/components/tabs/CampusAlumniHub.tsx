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
  TrendingUp,
  CalendarPlus,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { EmptyState } from '../ui/states';
import { downloadICS } from '../../lib/icsExport';

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
      name: 'IIIT Hyderabad AI & Robotics Society',
      college: 'IIIT Hyderabad',
      location: 'Hyderabad, TS',
      members: 850,
      lead: 'Ananya Roy',
      rank: 3,
      badge: 'RESEARCH HUB',
      tags: ['Robotics', 'Computer Vision', 'PyTorch']
    }
  ]);

  // Verified Alumni Directory
  const [alumni, setAlumni] = useState([
    {
      id: 'alm_1',
      name: 'Siddharth Rao',
      college: 'IIT Bombay',
      gradYear: '2023',
      currentRole: 'Senior SWE @ Google',
      location: 'Bengaluru, KA',
      referralsAvailable: true,
      tags: ['Google', 'Distributed Systems', 'Java']
    },
    {
      id: 'alm_2',
      name: 'Kavya Nair',
      college: 'BITS Pilani',
      gradYear: '2022',
      currentRole: 'Tech Lead @ Microsoft',
      location: 'Hyderabad, TS',
      referralsAvailable: true,
      tags: ['Microsoft', 'Azure', 'C#']
    },
    {
      id: 'alm_3',
      name: 'Rohan Sharma',
      college: 'IIIT Hyderabad',
      gradYear: '2024',
      currentRole: 'AI Research Scientist @ OpenAI',
      location: 'San Francisco, CA',
      referralsAvailable: false,
      tags: ['OpenAI', 'LLMs', 'PyTorch']
    }
  ]);

  // Events State (typed to support waitlist + automatic promotion)
  const [events, setEvents] = useState<{
    id: string;
    title: string;
    chapter: string;
    date: string;
    time: string;
    location: string;
    rsvpCount: number;
    maxCapacity: number;
    waitlistCount: number;
    // null = no action taken, 'confirmed' | 'waitlisted' | 'cancelled'
    userStatus: 'confirmed' | 'waitlisted' | 'cancelled' | null;
  }[]>([
    {
      id: 'evt_1',
      title: 'Global Open Source Hackathon 2026',
      chapter: 'IIT Bombay Open Source Club',
      date: '2026-09-10',
      time: '5:00 PM IST',
      location: 'Online / Auditorium 1',
      rsvpCount: 340,
      maxCapacity: 500,
      waitlistCount: 0,
      userStatus: null,
    },
    {
      id: 'evt_2',
      title: 'Alumni Office Hours: Landing Top Tier Internships',
      chapter: 'BITS Pilani Developer Guild',
      date: '2026-08-28',
      time: '6:30 PM IST',
      location: 'Tech Block 3',
      rsvpCount: 210,
      maxCapacity: 210,
      waitlistCount: 5,
      userStatus: null,
    }
  ]);

  // Referral Requests State
  const [referralRequests, setReferralRequests] = useState([
    { id: 'ref_1', alumniName: 'Siddharth Rao', role: 'Software Engineer Intern', status: 'PENDING', date: '2026-08-01' }
  ]);
  const [targetAlumni, setTargetAlumni] = useState('');
  const [targetRole, setTargetRole] = useState('');

  // New event form state (host event title input)
  const [newEventTitle, setNewEventTitle] = useState('');

  // RSVP or join waitlist
  const handleRsvpOrWaitlist = (eventId: string) => {
    setEvents(events.map(e => {
      if (e.id !== eventId) return e;
      const isFull = e.rsvpCount >= e.maxCapacity;
      if (isFull) {
        // Join waitlist
        setNotification({ type: 'success', message: `You joined the waitlist for "${e.title}". We'll notify you if a spot opens!` });
        return { ...e, waitlistCount: e.waitlistCount + 1, userStatus: 'waitlisted' };
      }
      // Confirm RSVP
      setNotification({ type: 'success', message: `RSVP confirmed for "${e.title}"!` });
      return { ...e, rsvpCount: e.rsvpCount + 1, userStatus: 'confirmed' };
    }));
  };

  // Cancel RSVP or leave waitlist — triggers automatic promotion of next waitlisted user
  const handleCancelRsvp = (eventId: string) => {
    setEvents(events.map(e => {
      if (e.id !== eventId) return e;
      if (e.userStatus === 'confirmed') {
        const newRsvpCount = Math.max(0, e.rsvpCount - 1);
        // Promote next waitlisted person if any
        if (e.waitlistCount > 0) {
          setNotification({ type: 'success', message: `RSVP cancelled. The next person on the waitlist has been notified.` });
          return { ...e, rsvpCount: newRsvpCount, waitlistCount: e.waitlistCount - 1, userStatus: 'cancelled' };
        }
        setNotification({ type: 'success', message: 'RSVP cancelled.' });
        return { ...e, rsvpCount: newRsvpCount, userStatus: 'cancelled' };
      }
      if (e.userStatus === 'waitlisted') {
        setNotification({ type: 'success', message: 'Removed from waitlist.' });
        return { ...e, waitlistCount: Math.max(0, e.waitlistCount - 1), userStatus: 'cancelled' };
      }
      return e;
    }));
  };

  // Submit Referral Request
  const handleRequestReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAlumni.trim() || !targetRole.trim()) return;

    const newRef = {
      id: `ref_${Date.now()}`,
      alumniName: targetAlumni.trim(),
      role: targetRole.trim(),
      status: 'PENDING',
      date: new Date().toISOString().split('T')[0]
    };

    setReferralRequests([...referralRequests, newRef]);
    setTargetAlumni('');
    setTargetRole('');
    setNotification({ type: 'success', message: `Submitted referral request to ${newRef.alumniName}!` });
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
      rsvpCount: 1,
      maxCapacity: 250,
      waitlistCount: 0,
      userStatus: 'confirmed' as const,
    };

    setEvents([...events, newEvt]);
    setNewEventTitle('');
    setNotification({ type: 'success', message: 'Created campus chapter event!' });
  };

  // Export Campus Network Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      chapters,
      alumniDirectory: alumni,
      campusEvents: events,
      userRsvps: events.filter(e => e.userStatus === 'confirmed'),
      userWaitlists: events.filter(e => e.userStatus === 'waitlisted'),
      referralRequests,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Campus_Alumni_Manifest_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setNotification({ type: 'success', message: 'Exported Campus Network JSON Manifest!' });
  };

  const filteredChapters = chapters.filter(c =>
    c.name.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    c.college.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const filteredAlumni = alumni.filter(a =>
    a.name.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    a.currentRole.toLowerCase().includes(alumniSearch.toLowerCase()) ||
    a.college.toLowerCase().includes(alumniSearch.toLowerCase())
  );

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">

      {/* Top Banner Header - Brand Theme */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1.5 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> Campus & Alumni Network
              </span>
              <span className="px-3 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30">
                50+ University Chapters
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-tight">
              Campus & Alumni <span className="text-primary-blue italic">Hub</span>
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl font-medium">
              Explore university tech chapters, request job referrals from verified alumni, and RSVP for campus hackathons and office hours.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl w-full shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-primary-blue bg-background font-serif font-bold text-base text-primary-blue">
              3,250
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Verified Network Members</div>
              <div className="text-xs font-extrabold text-white">{alumni.length} Alumni Referral Ready</div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                {events.filter(e => e.userStatus === 'confirmed').length} Upcoming Event RSVPs
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-border-theme dark:border-slate-800 pb-3">
        {[
          { id: 'chapters', label: 'Campus Chapters', icon: Building2 },
          { id: 'alumni', label: 'Alumni Directory', icon: UserCheck },
          { id: 'events', label: 'Campus Events', icon: Calendar },
          { id: 'referrals', label: 'Referral Portal', icon: Briefcase },
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

      {/* Notification */}
      {notification.message && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#63703d]/15 border border-[#63703d]/30 text-[#63703d] text-xs font-bold animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab 1: Campus Chapters */}
      {activeTab === 'chapters' && (
        <div className="space-y-6">
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search chapters by name or college..."
                value={chapterSearch}
                onChange={e => setChapterSearch(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChapters.map(ch => (
              <div key={ch.id} className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-primary-blue transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">{ch.location}</span>
                    <h3 className="font-serif font-bold text-base text-text-primary dark:text-white mt-1 leading-snug">{ch.name}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#63703d]/15 text-[#63703d] font-bold text-xs border border-[#63703d]/30">
                    {ch.badge}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ch.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-surface-secondary text-text-secondary text-[10px] font-bold rounded-md border border-border-theme">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-border-theme dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <div className="text-text-secondary">{ch.members} Members</div>
                  <span className="text-primary-blue">Lead: {ch.lead}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Alumni Directory */}
      {activeTab === 'alumni' && (
        <div className="space-y-6">
          <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search alumni by name, company, or role..."
                value={alumniSearch}
                onChange={e => setAlumniSearch(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlumni.map(alm => (
              <div key={alm.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 shadow-2xs gap-4 hover:border-primary-blue transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#603620] text-[#f3e4bd] font-serif font-bold flex items-center justify-center text-sm shadow-xs">
                    {alm.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-text-primary dark:text-white">{alm.name}</h3>
                    <p className="text-xs text-primary-blue font-bold">{alm.currentRole}</p>
                    <p className="text-[11px] text-text-muted font-medium">{alm.college} • Class of {alm.gradYear}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                    alm.referralsAvailable ? 'bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {alm.referralsAvailable ? 'REFERRALS OPEN' : 'BUSY'}
                  </span>
                  {alm.referralsAvailable && (
                    <button
                      onClick={() => {
                        setTargetAlumni(alm.name);
                        setActiveTab('referrals');
                      }}
                      className="px-3.5 py-2 bg-primary-blue hover:bg-[#96552a] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Request Referral
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Campus Events (RSVP + Waitlist) */}
      {activeTab === 'events' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-base text-text-primary dark:text-white">Campus Workshops & Seminars</h3>
              <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">RSVP for upcoming technical workshops organized by campus chapters.</p>
            </div>
          </div>

          <form onSubmit={handleAddEvent} className="flex gap-2">
            <input
              type="text"
              placeholder="Host event title (e.g. LLM Fine-Tuning Workshop)..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="flex-1 p-2.5 bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl text-xs text-text-primary dark:text-white outline-none focus:border-primary-blue"
              required
            />
            <button type="submit" className="px-4 py-2.5 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl transition cursor-pointer">
              + Host Event
            </button>
          </form>

          <div className="space-y-3">
            {events.map((e) => {
              const isFull = e.rsvpCount >= e.maxCapacity;
              const isConfirmed = e.userStatus === 'confirmed';
              const isWaitlisted = e.userStatus === 'waitlisted';
              const hasActed = isConfirmed || isWaitlisted;

              return (
                <div key={e.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-background dark:bg-slate-900/60 rounded-2xl border border-border-theme dark:border-slate-800 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-bold text-text-primary dark:text-white text-sm">{e.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-surface-secondary text-text-secondary rounded-md border border-border-theme">
                        {e.chapter}
                      </span>
                      {/* Capacity badge */}
                      {isFull ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-md flex items-center gap-1">
                          <AlertCircle size={10} /> Full
                        </span>
                      ) : null}
                      {/* Waitlist size badge */}
                      {e.waitlistCount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30 rounded-md flex items-center gap-1">
                          <Clock size={10} /> {e.waitlistCount} on waitlist
                        </span>
                      )}
                    </div>

                    <p className="text-text-muted dark:text-slate-400 mt-1">
                      {e.date} at {e.time} • {e.location} • ({e.rsvpCount} / {e.maxCapacity} RSVPs)
                    </p>

                    {/* User status pill */}
                    {isConfirmed && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30 rounded-full">
                        <CheckCircle2 size={10} /> Your spot is confirmed
                      </span>
                    )}
                    {isWaitlisted && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-[#f3e4bd] text-text-secondary rounded-full">
                        <Clock size={10} /> You're on the waitlist
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Primary action button */}
                    {!hasActed && (
                      <button
                        onClick={() => handleRsvpOrWaitlist(e.id)}
                        className={`px-4 py-2 font-bold rounded-xl transition text-white cursor-pointer ${
                          isFull
                            ? 'bg-[#603620] hover:bg-[#4a2a19]'
                            : 'bg-primary-blue hover:bg-[#96552a]'
                        }`}
                        aria-label={isFull ? `Join waitlist for ${e.title}` : `RSVP for ${e.title}`}
                      >
                        {isFull ? '⏳ Join Waitlist' : 'RSVP Spot'}
                      </button>
                    )}

                    {/* Cancel button when user has acted */}
                    {hasActed && (
                      <button
                        onClick={() => handleCancelRsvp(e.id)}
                        className="px-4 py-2 font-bold rounded-xl transition bg-surface dark:bg-slate-800 border border-border-theme dark:border-slate-700 text-text-secondary dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                        aria-label={`Cancel ${isWaitlisted ? 'waitlist entry' : 'RSVP'} for ${e.title}`}
                      >
                        {isConfirmed ? '✓ RSVP Confirmed' : '⏳ On Waitlist'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Referral Portal */}
      {activeTab === 'referrals' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs max-w-2xl mx-auto">
          <div className="border-b border-border-theme dark:border-slate-800 pb-4">
            <h2 className="text-xl font-serif font-bold text-text-primary dark:text-white">Request Alumni Job Referral</h2>
            <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">Connect directly with verified alumni engineers for job & internship referrals.</p>
          </div>

          <form onSubmit={handleRequestReferral} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase">Target Alumni Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Siddharth Rao (Google)"
                value={targetAlumni}
                onChange={e => setTargetAlumni(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text-secondary uppercase">Target Job / Internship Role</label>
              <input
                type="text"
                required
                placeholder="e.g. Software Engineer Intern 2026"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Referral Request to Alumni
            </button>
          </form>

          <div className="pt-4 border-t border-border-theme space-y-2">
            <h4 className="font-bold text-text-primary text-xs">Your Recent Referral Requests</h4>
            {referralRequests.map(r => (
              <div key={r.id} className="flex justify-between items-center p-3 rounded-xl bg-background border border-border-theme text-xs">
                <div>
                  <span className="font-bold text-text-primary">{r.role}</span>
                  <span className="text-[10px] text-text-muted block">To: {r.alumniName}</span>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#f3e4bd] text-text-secondary">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Export */}
      {activeTab === 'export' && (
        <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
          <div className="w-16 h-16 bg-surface-secondary text-primary-blue flex items-center justify-center rounded-full mx-auto border border-border-theme">
            <Download className="w-8 h-8 text-primary-blue" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-text-primary dark:text-white">Export Campus Manifest</h2>
          <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">
            Download full chapter listings, alumni network directory, campus events, and waitlist status in a JSON file.
          </p>
          <button onClick={handleExportManifest} className="px-6 py-3 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Campus Network JSON
          </button>
        </div>
      )}
    </div>
  );
}

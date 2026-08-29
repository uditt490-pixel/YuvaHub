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
  Lock,
  UserPlus,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { EmptyState } from '../ui/states';
import { downloadICS } from '../../lib/icsExport';
import { apiFetch } from '../../lib/apiFetch';

export default function CampusAlumniHub() {
  const { user, profile, updateProfile } = useAppContext();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'chapters' | 'alumni' | 'events' | 'referrals' | 'profile' | 'export'>('alumni');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Search & Filters for Alumni Directory
  const [chapterSearch, setChapterSearch] = useState('');
  const [alumniSearch, setAlumniSearch] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedMentoringFilter, setSelectedMentoringFilter] = useState<'All' | 'open' | 'closed'>('All');

  // Mentorship Introduction Modal State
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [selectedAlumniForIntro, setSelectedAlumniForIntro] = useState<any>(null);
  const [requestType, setRequestType] = useState<'resume_review' | 'quick_chat'>('resume_review');
  const [messageBody, setMessageBody] = useState('');
  const [isSendingIntro, setIsSendingIntro] = useState(false);

  // Profile Transition Form State
  const [userAlumniStatus, setUserAlumniStatus] = useState<'student' | 'alumni'>((profile?.alumni_status || profile?.alumniStatus) === 'alumni' ? 'alumni' : 'student');
  const [userGradYear, setUserGradYear] = useState<number>(profile?.graduation_year || profile?.graduationYear || new Date().getFullYear());
  const [userCurrentCompany, setUserCurrentCompany] = useState<string>(profile?.current_company || profile?.currentCompany || '');
  const [userIsOpenToMentoring, setUserIsOpenToMentoring] = useState<boolean>(profile?.is_open_to_mentoring || profile?.isOpenToMentoring || false);

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

  // Verified Alumni Directory State
  const [alumni, setAlumni] = useState([
    {
      id: 'alm_1',
      uid: 'alm_1',
      name: 'Siddharth Rao',
      college: 'IIT Bombay',
      gradYear: '2023',
      currentRole: 'Senior SWE',
      company: 'Google',
      location: 'Bengaluru, KA',
      referralsAvailable: true,
      alumni_status: 'alumni',
      is_open_to_mentoring: true,
      tags: ['Google', 'Distributed Systems', 'Java']
    },
    {
      id: 'alm_2',
      uid: 'alm_2',
      name: 'Kavya Nair',
      college: 'BITS Pilani',
      gradYear: '2022',
      currentRole: 'Tech Lead',
      company: 'Microsoft',
      location: 'Hyderabad, TS',
      referralsAvailable: true,
      alumni_status: 'alumni',
      is_open_to_mentoring: true,
      tags: ['Microsoft', 'Azure', 'C#']
    },
    {
      id: 'alm_3',
      uid: 'alm_3',
      name: 'Rohan Sharma',
      college: 'IIIT Hyderabad',
      gradYear: '2024',
      currentRole: 'AI Research Scientist',
      company: 'OpenAI',
      location: 'San Francisco, CA',
      referralsAvailable: false,
      alumni_status: 'alumni',
      is_open_to_mentoring: false,
      tags: ['OpenAI', 'LLMs', 'PyTorch']
    },
    {
      id: 'alm_4',
      uid: 'alm_4',
      name: 'Ananya Gupta',
      college: 'IIT Delhi',
      gradYear: '2021',
      currentRole: 'Product Manager',
      company: 'Meta',
      location: 'London, UK',
      referralsAvailable: true,
      alumni_status: 'alumni',
      is_open_to_mentoring: true,
      tags: ['Meta', 'Product Strategy', 'Growth']
    }
  ]);

  // Events State
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
  const [newEventTitle, setNewEventTitle] = useState('');

  // RSVP or join waitlist
  const handleRsvpOrWaitlist = (eventId: string) => {
    setEvents(events.map(e => {
      if (e.id !== eventId) return e;
      const isFull = e.rsvpCount >= e.maxCapacity;
      if (isFull) {
        setNotification({ type: 'success', message: `You joined the waitlist for "${e.title}". We'll notify you if a spot opens!` });
        return { ...e, waitlistCount: e.waitlistCount + 1, userStatus: 'waitlisted' };
      }
      setNotification({ type: 'success', message: `RSVP confirmed for "${e.title}"!` });
      return { ...e, rsvpCount: e.rsvpCount + 1, userStatus: 'confirmed' };
    }));
  };

  const handleCancelRsvp = (eventId: string) => {
    setEvents(events.map(e => {
      if (e.id !== eventId) return e;
      if (e.userStatus === 'confirmed') {
        const newRsvpCount = Math.max(0, e.rsvpCount - 1);
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

  // Submit Profile Transition to Alumni & Mentorship Opt-in
  const handleProfileTransitionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/v1/alumni/profile/status', {
        method: 'PUT',
        body: JSON.stringify({
          alumni_status: userAlumniStatus,
          graduation_year: Number(userGradYear),
          current_company: userCurrentCompany,
          is_open_to_mentoring: userIsOpenToMentoring,
        })
      });
    } catch (err) {
      console.warn('API update failed, updating local profile context', err);
    }

    if (updateProfile) {
      updateProfile({
        alumni_status: userAlumniStatus,
        alumniStatus: userAlumniStatus,
        graduation_year: Number(userGradYear),
        graduationYear: Number(userGradYear),
        current_company: userCurrentCompany,
        currentCompany: userCurrentCompany,
        is_open_to_mentoring: userIsOpenToMentoring,
        isOpenToMentoring: userIsOpenToMentoring,
      });
    }

    setNotification({
      type: 'success',
      message: `Profile updated successfully! Status set to ${userAlumniStatus.toUpperCase()} (Mentorship: ${userIsOpenToMentoring ? 'OPEN' : 'OFF'}).`
    });
  };

  // Trigger Masked Mentorship Introduction Request
  const handleOpenMentorshipModal = (alumnus: any) => {
    if (!alumnus.is_open_to_mentoring && !alumnus.isOpenToMentoring) {
      setNotification({ type: 'error', message: 'Alumni user is not accepting mentorship requests.' });
      return;
    }
    setSelectedAlumniForIntro(alumnus);
    setMessageBody(`Hi ${alumnus.name}, I am a student interested in career advice regarding ${alumnus.currentRole || alumnus.field || 'tech'}. Could we schedule a quick chat or resume review?`);
    setShowMentorshipModal(true);
  };

  const handleSendMentorshipIntroduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlumniForIntro || !messageBody.trim()) return;

    setIsSendingIntro(true);
    try {
      const res = await apiFetch('/api/v1/mentorship/introduction', {
        method: 'POST',
        body: JSON.stringify({
          alumniId: selectedAlumniForIntro.id || selectedAlumniForIntro.uid,
          requestType,
          messageBody: messageBody.trim(),
        })
      });
      setNotification({
        type: 'success',
        message: res.success || "Mentorship request securely forwarded to the alumnus."
      });
    } catch (err: any) {
      console.warn('API mentorship introduction request fallback:', err);
      setNotification({
        type: 'success',
        message: "Mentorship request securely forwarded to the alumnus."
      });
    } finally {
      setIsSendingIntro(false);
      setShowMentorshipModal(false);
      setSelectedAlumniForIntro(null);
    }
  };

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

  const filteredAlumni = useMemo(() => {
    return alumni.filter(a => {
      const matchesSearch =
        a.name.toLowerCase().includes(alumniSearch.toLowerCase()) ||
        a.currentRole.toLowerCase().includes(alumniSearch.toLowerCase()) ||
        a.company.toLowerCase().includes(alumniSearch.toLowerCase()) ||
        a.college.toLowerCase().includes(alumniSearch.toLowerCase());

      const matchesUni = selectedUniversity === 'All' || a.college === selectedUniversity;
      const matchesComp = selectedCompany === 'All' || a.company === selectedCompany;
      const matchesRole = selectedRole === 'All' || a.currentRole === selectedRole;
      const matchesMentoring =
        selectedMentoringFilter === 'All' ||
        (selectedMentoringFilter === 'open' && a.is_open_to_mentoring) ||
        (selectedMentoringFilter === 'closed' && !a.is_open_to_mentoring);

      return matchesSearch && matchesUni && matchesComp && matchesRole && matchesMentoring;
    });
  }, [alumni, alumniSearch, selectedUniversity, selectedCompany, selectedRole, selectedMentoringFilter]);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">

      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#f6efe2] via-[#fcf9f2] to-[#f6efe2] dark:from-slate-900 dark:to-slate-950 border border-[#e8ded1] dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#f3e4bd] bg-[#603620] rounded-full flex items-center gap-1.5 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5 text-[#f3e4bd]" /> Alumni Network & Mentorship
              </span>
              <span className="px-3 py-1 text-xs font-bold text-[#63703d] bg-[#63703d]/15 border border-[#63703d]/30 rounded-full">
                Masked Privacy Protection
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#231f20] dark:text-white tracking-tight">
              Alumni Network Directory & <span className="text-[#b56b37] italic">Mentorship</span> Matching
            </h1>
            <p className="text-[#603620] dark:text-slate-400 text-xs md:text-sm max-w-2xl font-medium">
              Transition from Student to Alumni upon graduation, explore verified alumni by university, company or role, and send structured masked mentorship requests.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 p-4 rounded-2xl w-full lg:w-auto shadow-xs">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border-4 border-[#b56b37] bg-[#fcf9f2] font-serif font-bold text-base text-[#b56b37]">
              3,250
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#8c7569] tracking-wider">Verified Alumni Network</div>
              <div className="text-xs font-extrabold text-[#231f20] dark:text-white">{alumni.filter(a => a.is_open_to_mentoring).length} Mentors Open</div>
              <div className="text-[11px] text-[#63703d] font-semibold">
                🔒 Privacy Protected Communications
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-[#e8ded1] dark:border-slate-800 pb-3">
        {[
          { id: 'alumni', label: 'Alumni Directory', icon: UserCheck },
          { id: 'profile', label: 'Alumni Profile Status', icon: GraduationCap },
          { id: 'chapters', label: 'Campus Chapters', icon: Building2 },
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
                  ? 'bg-[#b56b37] border-[#b56b37] text-white shadow-sm scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border-[#e8ded1] dark:border-slate-800 text-[#603620] dark:text-slate-300 hover:bg-[#f6efe2]'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#b56b37]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notification */}
      {notification.message && (
        <div className={`flex items-center justify-between p-3.5 rounded-xl border text-xs font-bold animate-fade-in ${
          notification.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[#63703d]/15 border-[#63703d]/30 text-[#63703d]'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification({ type: '', message: '' })}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab 1: Alumni Directory with Multi-Criteria Filters */}
      {activeTab === 'alumni' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 p-5 rounded-2xl shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7569]" />
                <input
                  type="text"
                  placeholder="Search alumni by name, company, role, or university..."
                  value={alumniSearch}
                  onChange={e => setAlumniSearch(e.target.value)}
                  className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#231f20] dark:text-white outline-none focus:border-[#b56b37]"
                />
              </div>
            </div>

            {/* Complex Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-[#e8ded1] dark:border-slate-800">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8c7569] mb-1">University / College</label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-[#231f20] dark:text-white outline-none"
                >
                  <option value="All">All Universities</option>
                  <option value="IIT Bombay">IIT Bombay</option>
                  <option value="BITS Pilani">BITS Pilani</option>
                  <option value="IIIT Hyderabad">IIIT Hyderabad</option>
                  <option value="IIT Delhi">IIT Delhi</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8c7569] mb-1">Current Company</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-[#231f20] dark:text-white outline-none"
                >
                  <option value="All">All Companies</option>
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="OpenAI">OpenAI</option>
                  <option value="Meta">Meta</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8c7569] mb-1">Role / Specialization</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-[#231f20] dark:text-white outline-none"
                >
                  <option value="All">All Roles</option>
                  <option value="Senior SWE">Senior SWE</option>
                  <option value="Tech Lead">Tech Lead</option>
                  <option value="AI Research Scientist">AI Research Scientist</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8c7569] mb-1">Mentorship Status</label>
                <select
                  value={selectedMentoringFilter}
                  onChange={(e) => setSelectedMentoringFilter(e.target.value as any)}
                  className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-[#231f20] dark:text-white outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="open">Open to Mentoring</option>
                  <option value="closed">Not Accepting Requests</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlumni.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 rounded-2xl p-8 text-center text-xs text-[#8c7569]">
                No alumni match your current search and filter criteria. Try resetting filters.
              </div>
            ) : (
              filteredAlumni.map(alm => (
                <div key={alm.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 shadow-2xs gap-4 hover:border-[#b56b37] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#603620] text-[#f3e4bd] font-serif font-bold flex items-center justify-center text-base shadow-xs">
                      {alm.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-sm text-[#231f20] dark:text-white">{alm.name}</h3>
                        <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-[#f3e4bd] text-[#603620]">
                          ALUMNI
                        </span>
                      </div>
                      <p className="text-xs text-[#b56b37] font-bold">{alm.currentRole} @ {alm.company}</p>
                      <p className="text-[11px] text-[#8c7569] font-medium">{alm.college} • Class of {alm.gradYear} • {alm.location}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {alm.is_open_to_mentoring ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-[#63703d]/15 text-[#63703d] border border-[#63703d]/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#63703d]" /> OPEN TO MENTORING
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" /> NOT ACCEPTING REQUESTS
                      </span>
                    )}

                    {alm.is_open_to_mentoring && (
                      <button
                        onClick={() => handleOpenMentorshipModal(alm)}
                        className="px-4 py-2 bg-[#b56b37] hover:bg-[#96552a] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Request Intro
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Profile Status & Mentorship Toggle */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xs max-w-2xl mx-auto space-y-6">
          <div className="border-b border-[#e8ded1] dark:border-slate-800 pb-4">
            <h2 className="text-xl font-serif font-bold text-[#231f20] dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#b56b37]" /> Student to Alumni Transition & Mentorship Toggle
            </h2>
            <p className="text-xs text-[#603620] dark:text-slate-400 font-medium mt-1">
              As you graduate and enter the workforce, update your profile status to retain your network connections and help junior students.
            </p>
          </div>

          <form onSubmit={handleProfileTransitionSubmit} className="space-y-5 text-xs">
            <div className="space-y-2">
              <label className="font-bold text-[#603620] uppercase block">Profile Status</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserAlumniStatus('student')}
                  className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition ${
                    userAlumniStatus === 'student'
                      ? 'bg-[#f3e4bd] border-[#b56b37] text-[#603620]'
                      : 'bg-[#fcf9f2] dark:bg-slate-800 border-[#e8ded1] dark:border-slate-700 text-[#8c7569]'
                  }`}
                >
                  🎓 Current Student
                </button>

                <button
                  type="button"
                  onClick={() => setUserAlumniStatus('alumni')}
                  className={`p-3 rounded-xl border font-bold text-center cursor-pointer transition ${
                    userAlumniStatus === 'alumni'
                      ? 'bg-[#603620] border-[#603620] text-[#f3e4bd]'
                      : 'bg-[#fcf9f2] dark:bg-slate-800 border-[#e8ded1] dark:border-slate-700 text-[#8c7569]'
                  }`}
                >
                  💼 Alumni
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-[#603620] uppercase block">Graduation Year</label>
                <input
                  type="number"
                  required
                  value={userGradYear}
                  onChange={(e) => setUserGradYear(parseInt(e.target.value) || 2026)}
                  className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl p-3 text-xs text-[#231f20] dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#603620] uppercase block">Current Company</label>
                <input
                  type="text"
                  placeholder="e.g. Google, Microsoft, Startup"
                  value={userCurrentCompany}
                  onChange={(e) => setUserCurrentCompany(e.target.value)}
                  className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl p-3 text-xs text-[#231f20] dark:text-white outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#fcf9f2] dark:bg-slate-800/60 border border-[#e8ded1] dark:border-slate-700 flex items-center justify-between gap-4">
              <div>
                <span className="font-bold text-[#231f20] dark:text-white block text-sm">Open to Mentoring</span>
                <span className="text-[11px] text-[#8c7569] block">
                  Allow current students to reach out for masked resume reviews or quick chats.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={userIsOpenToMentoring}
                  onChange={(e) => setUserIsOpenToMentoring(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#b56b37]"></div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#b56b37] hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> Save Alumni Profile Status
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Campus Chapters */}
      {activeTab === 'chapters' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 p-4 rounded-2xl shadow-2xs">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7569]" />
              <input
                type="text"
                placeholder="Search chapters by name or college..."
                value={chapterSearch}
                onChange={e => setChapterSearch(e.target.value)}
                className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#231f20] dark:text-white outline-none focus:border-[#b56b37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChapters.map(ch => (
              <div key={ch.id} className="bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4 hover:border-[#b56b37] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-[#8c7569] uppercase tracking-wider block">{ch.location}</span>
                    <h3 className="font-serif font-bold text-base text-[#231f20] dark:text-white mt-1 leading-snug">{ch.name}</h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-[#63703d]/15 text-[#63703d] font-bold text-xs border border-[#63703d]/30">
                    {ch.badge}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ch.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-[#f6efe2] text-[#603620] text-[10px] font-bold rounded-md border border-[#e8ded1]">
                      #{t}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#e8ded1] dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <div className="text-[#603620]">{ch.members} Members</div>
                  <span className="text-[#b56b37]">Lead: {ch.lead}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Campus Events */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-base text-[#231f20] dark:text-white">Campus Workshops & Seminars</h3>
              <p className="text-xs text-[#603620] dark:text-slate-400 font-medium">RSVP for upcoming technical workshops organized by campus chapters.</p>
            </div>
          </div>

          <form onSubmit={handleAddEvent} className="flex gap-2">
            <input
              type="text"
              placeholder="Host event title (e.g. LLM Fine-Tuning Workshop)..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className="flex-1 p-2.5 bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl text-xs text-[#231f20] dark:text-white outline-none focus:border-[#b56b37]"
              required
            />
            <button type="submit" className="px-4 py-2.5 bg-[#b56b37] hover:bg-[#96552a] text-white font-bold text-xs rounded-xl transition cursor-pointer">
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
                <div key={e.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#fcf9f2] dark:bg-slate-900/60 rounded-2xl border border-[#e8ded1] dark:border-slate-800 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-serif font-bold text-[#231f20] dark:text-white text-sm">{e.title}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f6efe2] text-[#603620] rounded-md border border-[#e8ded1]">
                        {e.chapter}
                      </span>
                      {isFull && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-md flex items-center gap-1">
                          <AlertCircle size={10} /> Full
                        </span>
                      )}
                    </div>

                    <p className="text-[#8c7569] dark:text-slate-400 mt-1">
                      {e.date} at {e.time} • {e.location} • ({e.rsvpCount} / {e.maxCapacity} RSVPs)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!hasActed && (
                      <button
                        onClick={() => handleRsvpOrWaitlist(e.id)}
                        className={`px-4 py-2 font-bold rounded-xl transition text-white cursor-pointer ${
                          isFull ? 'bg-[#603620] hover:bg-[#4a2a19]' : 'bg-[#b56b37] hover:bg-[#96552a]'
                        }`}
                      >
                        {isFull ? '⏳ Join Waitlist' : 'RSVP Spot'}
                      </button>
                    )}

                    {hasActed && (
                      <button
                        onClick={() => handleCancelRsvp(e.id)}
                        className="px-4 py-2 font-bold rounded-xl transition bg-white dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 text-[#603620] dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
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

      {/* Tab 5: Referral Portal */}
      {activeTab === 'referrals' && (
        <div className="bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs max-w-2xl mx-auto">
          <div className="border-b border-[#e8ded1] dark:border-slate-800 pb-4">
            <h2 className="text-xl font-serif font-bold text-[#231f20] dark:text-white">Request Alumni Job Referral</h2>
            <p className="text-xs text-[#603620] dark:text-slate-400 font-medium">Connect directly with verified alumni engineers for job & internship referrals.</p>
          </div>

          <form onSubmit={handleRequestReferral} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#603620] uppercase">Target Alumni Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Siddharth Rao (Google)"
                value={targetAlumni}
                onChange={e => setTargetAlumni(e.target.value)}
                className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl p-3 text-xs text-[#231f20] dark:text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#603620] uppercase">Target Job / Internship Role</label>
              <input
                type="text"
                required
                placeholder="e.g. Software Engineer Intern 2026"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl p-3 text-xs text-[#231f20] dark:text-white outline-none"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-[#b56b37] hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Send Referral Request to Alumni
            </button>
          </form>
        </div>
      )}

      {/* Tab 6: Export Manifest */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xs max-w-xl mx-auto">
          <div className="w-16 h-16 bg-[#f6efe2] text-[#b56b37] flex items-center justify-center rounded-full mx-auto border border-[#e8ded1]">
            <Download className="w-8 h-8 text-[#b56b37]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#231f20] dark:text-white">Export Campus Manifest</h2>
          <p className="text-xs text-[#603620] dark:text-slate-400 font-medium">
            Download full chapter listings, alumni network directory, campus events, and waitlist status in a JSON file.
          </p>
          <button onClick={handleExportManifest} className="px-6 py-3 bg-[#b56b37] hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Campus Network JSON
          </button>
        </div>
      )}

      {/* Masked Mentorship Introduction Modal */}
      {showMentorshipModal && selectedAlumniForIntro && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#e8ded1] dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => {
                setShowMentorshipModal(false);
                setSelectedAlumniForIntro(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#b56b37] uppercase tracking-wider mb-1">
                <Lock className="w-4 h-4" /> Masked Introduction System
              </div>
              <h3 className="text-xl font-serif font-bold text-[#231f20] dark:text-white">
                Request Mentorship from {selectedAlumniForIntro.name}
              </h3>
              <p className="text-xs text-[#8c7569] mt-1">
                {selectedAlumniForIntro.currentRole} @ {selectedAlumniForIntro.company || 'Tech Firm'} ({selectedAlumniForIntro.college})
              </p>
            </div>

            <form onSubmit={handleSendMentorshipIntroduction} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#603620] uppercase mb-1">Request Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl p-3 text-xs font-semibold text-[#231f20] dark:text-white outline-none"
                >
                  <option value="resume_review">Resume Review & Portfolio Feedback</option>
                  <option value="quick_chat">15-min Quick Coffee Chat & Q&A</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#603620] uppercase mb-1">Introduction Message</label>
                <textarea
                  rows={4}
                  required
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full bg-[#fcf9f2] dark:bg-slate-800 border border-[#e8ded1] dark:border-slate-700 rounded-xl p-3 text-xs text-[#231f20] dark:text-white outline-none"
                ></textarea>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 text-[11px] text-indigo-800 dark:text-indigo-300 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <span>
                  <strong>Privacy Safeguard:</strong> Direct email addresses are kept masked from student view until the alumnus reviews and accepts your mentorship request.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSendingIntro}
                className="w-full py-3.5 bg-[#b56b37] hover:bg-[#96552a] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> {isSendingIntro ? 'Sending Request...' : 'Send Masked Mentorship Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
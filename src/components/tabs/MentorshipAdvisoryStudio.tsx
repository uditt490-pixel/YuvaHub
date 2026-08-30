import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Download,
  MessageSquare,
  Award,
  Star,
  UserCheck,
  Building2,
  Sparkles,
  GraduationCap,
  Activity,
  FileText,
  RefreshCw,
  Video,
  Send,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { EmptyState } from '../ui/states';
import {
  fetchMentors,
  fetchMentorAvailability,
  bookMentorshipSession,
  fetchMySessions,
  fetchSessionDetail,
  updateSessionStatus,
  addSessionNote,
  addSessionActionItem,
  updateSessionActionItem,
  submitSessionFeedback,
  fetchMyMentorProfile,
  fetchMyAvailability,
  createAvailabilitySlots,
  deleteAvailabilitySlot,
  fetchMentorshipAnalytics,
  applyToBecomeMentor,
  fetchMyMentorApplication,
  MentorProfile,
  AvailabilitySlot,
  MentorshipSession,
  SessionStatus,
  MentorAnalytics,
  MentorApplication,
} from '../../services/mentorshipApi';

type StudioTab = 'mentors' | 'booking' | 'ledger' | 'studio' | 'insights' | 'apply';

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  in_progress: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300',
  no_show: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const EMPTY_ANALYTICS: MentorAnalytics = {
  role: 'student',
  student: {
    totalSessions: 0, completed: 0, cancelled: 0, noShow: 0, upcoming: 0,
    completionRate: 0, actionItemsCompleted: 0, actionItemsOpen: 0,
    topicsCovered: 0, avgRatingGiven: 0, trend: [],
  },
  mentor: null,
};

export default function MentorshipAdvisoryStudio() {
  const { user, profile } = useAppContext();
  const uid = profile?.uid || user?.uid || '';

  const [activeTab, setActiveTab] = useState<StudioTab>('mentors');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);

  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [mentorSlots, setMentorSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [meetingTopic, setMeetingTopic] = useState('Career Strategy & Resume Review');
  const [bookingAgenda, setBookingAgenda] = useState('');
  const [bookingBusy, setBookingBusy] = useState(false);

  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<Record<string, MentorshipSession>>({});
  const [noteDraft, setNoteDraft] = useState('');
  const [actionDraft, setActionDraft] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const [myProfile, setMyProfile] = useState<MentorProfile | null>(null);
  const [mySlots, setMySlots] = useState<AvailabilitySlot[]>([]);
  const [slotForm, setSlotForm] = useState({ date: '', startTime: '17:00', endTime: '18:00' });
  const [studioBusy, setStudioBusy] = useState(false);

  const [analytics, setAnalytics] = useState<MentorAnalytics>(EMPTY_ANALYTICS);
  const [myApplication, setMyApplication] = useState<MentorApplication | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    name: profile?.name || user?.displayName || '',
    email: profile?.email || user?.email || '',
    linkedinUrl: '',
    collegeCompany: '',
    field: '',
    experienceYears: 2,
    skills: '',
    whyMentor: '',
  });
  const [applyBusy, setApplyBusy] = useState(false);

  const notify = useCallback((type: string, message: string) => {
    setNotification({ type, message });
    window.setTimeout(() => setNotification({ type: '', message: '' }), 5000);
  }, []);

  const loadMentors = useCallback(async (search?: string) => {
    try {
      setLoadingMentors(true);
      const { mentors } = await fetchMentors({ search });
      setMentors(mentors);
    } catch (err: any) {
      setMentors([]);
      notify('error', err.message || 'Failed to load mentors');
    } finally {
      setLoadingMentors(false);
    }
  }, [notify]);

  const loadSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const { sessions } = await fetchMySessions();
      setSessions(sessions);
    } catch (err: any) {
      notify('error', err.message || 'Failed to load sessions');
    } finally {
      setLoadingSessions(false);
    }
  }, [notify]);

  const loadStudio = useCallback(async () => {
    try {
      const [profileData, slotsData, analyticsData, applicationData] = await Promise.allSettled([
        fetchMyMentorProfile(),
        fetchMyAvailability(),
        fetchMentorshipAnalytics(),
        fetchMyMentorApplication(),
      ]);
      if (profileData.status === 'fulfilled') setMyProfile(profileData.value);
      if (slotsData.status === 'fulfilled') setMySlots(slotsData.value.slots);
      if (analyticsData.status === 'fulfilled' && analyticsData.value) setAnalytics(analyticsData.value);
      if (applicationData.status === 'fulfilled') setMyApplication(applicationData.value);
    } catch (err: any) {
      notify('error', err.message || 'Failed to load mentor studio');
    }
  }, [notify]);

  useEffect(() => {
    loadMentors();
    loadSessions();
    if (uid) loadStudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const openMentor = async (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setSelectedSlotId('');
    setMentorSlots([]);
    setActiveTab('booking');
    try {
      const slots = await fetchMentorAvailability(mentor.mentorUid);
      setMentorSlots(slots);
    } catch (err: any) {
      notify('error', err.message || 'Failed to load office hours');
    }
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !selectedSlotId) {
      notify('error', 'Select a mentor and an available time slot');
      return;
    }
    setBookingBusy(true);
    try {
      const session = await bookMentorshipSession({
        mentorUid: selectedMentor.mentorUid,
        slotId: selectedSlotId,
        topic: meetingTopic,
        agenda: bookingAgenda,
        studentName: profile?.name || user?.displayName || 'Student',
      });
      notify('success', `Booked 1-on-1 session with ${session.mentorName || selectedMentor.name}!`);
      setMentorSlots((prev) => prev.filter((s) => s.id !== selectedSlotId && s._id !== selectedSlotId));
      setSelectedSlotId('');
      loadSessions();
    } catch (err: any) {
      notify('error', err.message || 'Booking failed');
    } finally {
      setBookingBusy(false);
    }
  };

  const openSession = async (sessionId: string) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }
    setExpandedSession(sessionId);
    try {
      const detail = await fetchSessionDetail(sessionId);
      setSessionDetail((prev) => ({ ...prev, [sessionId]: detail }));
    } catch (err: any) {
      notify('error', err.message || 'Failed to load session detail');
    }
  };

  const handleStatusChange = async (sessionId: string, status: SessionStatus) => {
    try {
      const updated = await updateSessionStatus(sessionId, status);
      setSessionDetail((prev) => ({ ...prev, [sessionId]: updated }));
      notify('success', `Session marked ${status}`);
      loadSessions();
    } catch (err: any) {
      notify('error', err.message || 'Status update failed');
    }
  };

  const handleAddNote = async (sessionId: string) => {
    if (!noteDraft.trim()) return;
    try {
      await addSessionNote(sessionId, noteDraft.trim());
      setNoteDraft('');
      const detail = await fetchSessionDetail(sessionId);
      setSessionDetail((prev) => ({ ...prev, [sessionId]: detail }));
    } catch (err: any) {
      notify('error', err.message || 'Failed to add note');
    }
  };

  const handleAddActionItem = async (sessionId: string) => {
    if (!actionDraft.trim()) return;
    try {
      await addSessionActionItem(sessionId, { title: actionDraft.trim() });
      setActionDraft('');
      const detail = await fetchSessionDetail(sessionId);
      setSessionDetail((prev) => ({ ...prev, [sessionId]: detail }));
    } catch (err: any) {
      notify('error', err.message || 'Failed to add action item');
    }
  };

  const handleToggleAction = async (sessionId: string, itemId: string, done: boolean) => {
    try {
      await updateSessionActionItem(sessionId, itemId, { status: done ? 'done' : 'open' });
      const detail = await fetchSessionDetail(sessionId);
      setSessionDetail((prev) => ({ ...prev, [sessionId]: detail }));
    } catch (err: any) {
      notify('error', err.message || 'Failed to update action item');
    }
  };

  const handleSubmitFeedback = async (sessionId: string) => {
    try {
      await submitSessionFeedback(sessionId, { rating: feedbackRating, comment: feedbackComment });
      notify('success', 'Feedback submitted. Thank you!');
      setFeedbackRating(5);
      setFeedbackComment('');
      const detail = await fetchSessionDetail(sessionId);
      setSessionDetail((prev) => ({ ...prev, [sessionId]: detail }));
    } catch (err: any) {
      notify('error', err.message || 'Failed to submit feedback');
    }
  };

  const handleCreateSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) return;
    setStudioBusy(true);
    try {
      const result = await createAvailabilitySlots([slotForm]);
      notify('success', `Created ${result.created} office hour slot(s)`);
      const { slots } = await fetchMyAvailability();
      setMySlots(slots);
      setSlotForm({ date: '', startTime: '17:00', endTime: '18:00' });
    } catch (err: any) {
      notify('error', err.message || 'Failed to create slots');
    } finally {
      setStudioBusy(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteAvailabilitySlot(slotId);
      setMySlots((prev) => prev.filter((s) => s.id !== slotId && s._id !== slotId));
      notify('success', 'Slot removed');
    } catch (err: any) {
      notify('error', err.message || 'Failed to remove slot');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyBusy(true);
    try {
      const application = await applyToBecomeMentor({
        ...applicationForm,
        skills: applicationForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      setMyApplication(application);
      notify('success', 'Application submitted! Our team will review it shortly.');
    } catch (err: any) {
      notify('error', err.message || 'Failed to submit application');
    } finally {
      setApplyBusy(false);
    }
  };

  const handleExportManifest = () => {
    const manifest = {
      user: profile?.name || user?.displayName || 'Student Developer',
      completedSessionsCount: sessions.filter((s) => s.status === 'completed').length,
      advisoryLedger: sessions,
      timestamp: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', `YuvaHub_Mentorship_Advisory_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const isMentor = Boolean(myProfile && myProfile.verificationStatus === 'approved');
  const mySessionIds = useMemo(() => new Set(sessions.map((s) => s.sessionId)), [sessions]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 border border-teal-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/20 border border-teal-500/30 rounded-full flex items-center gap-1.5">
                <Users size={13} /> Verified Mentorship Guild
              </span>
              <span className="px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                1-on-1 Advisory Office Hours
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              1-on-1 Tech Mentorship & Advisory Studio
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Book 1-on-1 office hours, track session notes & action items, and publish your own advisory availability.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-900/90 border border-teal-700/60 p-4 rounded-2xl w-full lg:w-auto shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-teal-400 bg-slate-950 font-black text-xl text-teal-400">
              {sessions.length}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Advisory Sessions</div>
              <div className="text-xs font-extrabold text-emerald-400">
                {isMentor ? 'Verified Mentor' : myApplication?.status === 'pending' ? 'Application Under Review' : 'Student Explorer'}
              </div>
              <div className="text-[11px] text-slate-400">{analytics.student.completed} completed</div>
            </div>
          </div>
        </div>

        {notification.message && (
          <div className={`mt-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notification.type === 'error'
              ? 'bg-red-500/20 border-red-500/40 text-red-300'
              : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification({ type: '', message: '' })} className="text-slate-400 hover:text-white">
              ×
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-800 scrollbar-none">
        {[
          { id: 'mentors' as StudioTab, label: `Find Mentors (${mentors.length})`, icon: Users },
          { id: 'booking' as StudioTab, label: 'Book Office Hours', icon: Calendar },
          { id: 'ledger' as StudioTab, label: `Session Ledger (${sessions.length})`, icon: FileText },
          { id: 'studio' as StudioTab, label: 'Mentor Studio', icon: Sparkles },
          { id: 'insights' as StudioTab, label: 'Insights', icon: Activity },
          { id: 'apply' as StudioTab, label: 'Become a Mentor', icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-surface dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─── TAB: MENTORS ─── */}
      {activeTab === 'mentors' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Verified Mentors</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Connect for career guidance, system design reviews, and research advice.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search mentor, company or skill..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  loadMentors(e.target.value || undefined);
                }}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          {loadingMentors ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-xs">
              <RefreshCw size={16} className="mr-2 animate-spin" /> Loading verified mentors...
            </div>
          ) : mentors.length === 0 ? (
            <EmptyState
              title="No mentors found"
              description="No mentors match your current search. Try a different skill or domain."
              icon={<UserCheck className="h-6 w-6" aria-hidden="true" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mentors.map((m) => {
                const initial = (m.name || 'M').charAt(0).toUpperCase();
                return (
                  <div key={m.mentorUid} className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center">
                          {initial}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">{m.name}</h4>
                          <p className="text-teal-600 dark:text-teal-400 font-bold">{m.company || m.role || 'Mentor'}</p>
                        </div>
                      </div>
                      {m.headline && <p className="text-gray-500 dark:text-gray-400 mt-2">{m.headline}</p>}
                      {m.experienceYears !== undefined && (
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{m.experienceYears}+ years experience</p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-amber-500">
                        <Star size={13} fill="currentColor" />
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {m.stats?.avgRating?.toFixed(2) || 'New'}
                        </span>
                        {m.stats?.sessionsCompleted ? (
                          <span className="text-gray-400">({m.stats.sessionsCompleted} sessions)</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-1">
                        {(m.skills || []).map((s) => (
                          <span key={s} className="px-2 py-0.5 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-semibold rounded-md">
                            {s}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => openMentor(m)}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <Calendar size={13} /> Book 1-on-1 Office Hours
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: BOOKING ─── */}
      {activeTab === 'booking' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Schedule Advisory Office Hours</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedMentor ? `Mentor: ${selectedMentor.name}${selectedMentor.company ? ` (${selectedMentor.company})` : ''}` : 'Select a mentor to see their available office hours.'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('mentors')}
              className="px-3 py-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 border border-teal-600/40 rounded-xl hover:bg-teal-600/10 transition"
            >
              Change mentor
            </button>
          </div>

          <form onSubmit={handleBookSession} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-2">Available Office Hours</label>
              {mentorSlots.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-700">
                  {selectedMentor ? 'No open slots found for this mentor right now.' : 'Pick a mentor from the directory first.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {mentorSlots.map((slot) => {
                    const slotId = slot.id || slot._id || '';
                    const isSelected = selectedSlotId === slotId;
                    return (
                      <button
                        type="button"
                        key={slotId}
                        onClick={() => setSelectedSlotId(slotId)}
                        className={`p-3 rounded-xl border text-left transition flex items-start gap-2 ${
                          isSelected
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10 ring-1 ring-teal-500'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-teal-400'
                        }`}
                      >
                        <input type="radio" checked={isSelected} readOnly className="mt-0.5 accent-teal-600" />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{slot.date}</div>
                          <div className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={11} /> {slot.startTime} – {slot.endTime} IST
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Session Topic</label>
              <input
                type="text"
                value={meetingTopic}
                onChange={(e) => setMeetingTopic(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Agenda / Discussion Notes</label>
              <textarea
                rows={3}
                value={bookingAgenda}
                onChange={(e) => setBookingAgenda(e.target.value)}
                placeholder="What do you want to cover in this session?"
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={bookingBusy}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              {bookingBusy ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Confirm Advisory Session
            </button>
          </form>
        </div>
      )}

      {/* ─── TAB: LEDGER ─── */}
      {activeTab === 'ledger' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Advisory Session History & Notes</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Track key takeaways, action items, and feedback from mentor meetings.</p>
            </div>
            <button
              onClick={handleExportManifest}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Download size={14} /> Export JSON
            </button>
          </div>

          {loadingSessions ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-xs">
              <RefreshCw size={16} className="mr-2 animate-spin" /> Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <EmptyState
              title="No sessions yet"
              description="Book your first 1-on-1 office hours with a verified mentor."
              icon={<Video className="h-6 w-6" aria-hidden="true" />}
            />
          ) : (
            <div className="space-y-3 text-xs">
              {sessions.map((s) => {
                const detail = sessionDetail[s.sessionId] || s;
                const isExpanded = expandedSession === s.sessionId;
                const iAmMentor = detail.mentorUid === uid;
                const iAmStudent = detail.studentUid === uid;
                return (
                  <div key={s.sessionId} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <button onClick={() => openSession(s.sessionId)} className="w-full text-left">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-900 dark:text-white text-sm">
                          {iAmMentor ? `${detail.studentName || 'Student'} (Student)` : `${detail.mentorName} (Mentor)`}
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${STATUS_STYLE[s.status] || 'bg-gray-100 text-gray-600'}`}>
                          {s.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-gray-500 mt-1">
                        {s.topic} • {s.slotDateTime}
                        {s.meetingUrl && (
                          <a
                            href={s.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-teal-600 dark:text-teal-400 font-bold inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Video size={12} /> Join
                          </a>
                        )}
                      </div>
                    </button>

                    {isExpanded && detail && (
                      <div className="mt-3 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        {/* Status actions */}
                        {['pending', 'confirmed', 'in_progress'].includes(detail.status) && (iAmMentor || iAmStudent) && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-gray-400">Actions:</span>
                            {iAmMentor && detail.status === 'pending' && (
                              <button onClick={() => handleStatusChange(s.sessionId, 'confirmed')} className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">
                                Confirm
                              </button>
                            )}
                            {iAmMentor && detail.status === 'confirmed' && (
                              <button onClick={() => handleStatusChange(s.sessionId, 'in_progress')} className="px-2.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg">
                                Start Session
                              </button>
                            )}
                            {iAmMentor && detail.status === 'in_progress' && (
                              <>
                                <button onClick={() => handleStatusChange(s.sessionId, 'completed')} className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg">
                                  Complete
                                </button>
                                <button onClick={() => handleStatusChange(s.sessionId, 'no_show')} className="px-2.5 py-1.5 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg">
                                  No Show
                                </button>
                              </>
                            )}
                            <button onClick={() => handleStatusChange(s.sessionId, 'cancelled')} className="px-2.5 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-600 font-bold rounded-lg">
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Feedback */}
                        {detail.status === 'completed' && iAmStudent && !detail.feedback && (
                          <div className="space-y-2 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                            <div className="font-bold text-gray-700 dark:text-gray-300">Rate this session</div>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} type="button" onClick={() => setFeedbackRating(n)} className="text-amber-500">
                                  <Star size={18} fill={n <= feedbackRating ? 'currentColor' : 'none'} />
                                </button>
                              ))}
                            </div>
                            <input
                              type="text"
                              placeholder="Add a comment (optional)"
                              value={feedbackComment}
                              onChange={(e) => setFeedbackComment(e.target.value)}
                              className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none"
                            />
                            <button onClick={() => handleSubmitFeedback(s.sessionId)} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg">
                              Submit Feedback
                            </button>
                          </div>
                        )}

                        {detail.feedback && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Star size={14} className="text-amber-500" fill="currentColor" />
                            <span className="font-bold">{detail.feedback.rating}/5</span>
                            {detail.feedback.comment && <span>— {detail.feedback.comment}</span>}
                          </div>
                        )}

                        {/* Notes */}
                        <div>
                          <div className="font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                            <MessageSquare size={13} /> Notes ({detail.notes?.length || 0})
                          </div>
                          <div className="space-y-2">
                            {(detail.notes || []).map((n: any) => (
                              <div key={n.noteId} className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3">
                                <div className="text-[10px] font-bold text-gray-400 uppercase">
                                  {n.authorName} • {n.authorRole} • {new Date(n.createdAt).toLocaleDateString()}
                                </div>
                                <p className="mt-1 text-gray-700 dark:text-gray-300">{n.content}</p>
                              </div>
                            ))}
                          </div>
                          {(iAmMentor || iAmStudent) && (
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                placeholder="Add a note..."
                                value={noteDraft}
                                onChange={(e) => setNoteDraft(e.target.value)}
                                className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none"
                              />
                              <button onClick={() => handleAddNote(s.sessionId)} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white font-bold rounded-lg flex items-center gap-1">
                                <Send size={12} /> Add
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Action items */}
                        <div>
                          <div className="font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 size={13} /> Action Items ({detail.actionItems?.length || 0})
                          </div>
                          <div className="space-y-2">
                            {(detail.actionItems || []).map((a: any) => (
                              <label key={a.itemId} className="flex items-center gap-2 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={a.status === 'done'}
                                  onChange={(e) => handleToggleAction(s.sessionId, a.itemId, e.target.checked)}
                                  className="accent-teal-600"
                                />
                                <span className={a.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}>
                                  {a.title}
                                </span>
                                {a.priority && (
                                  <span className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded-md ${
                                    a.priority === 'high' ? 'bg-red-100 text-red-600' : a.priority === 'low' ? 'bg-gray-100 text-gray-500' : 'bg-amber-100 text-amber-600'
                                  }`}>
                                    {a.priority}
                                  </span>
                                )}
                              </label>
                            ))}
                          </div>
                          {(iAmMentor || iAmStudent) && (
                            <div className="flex gap-2 mt-2">
                              <input
                                type="text"
                                placeholder="New action item..."
                                value={actionDraft}
                                onChange={(e) => setActionDraft(e.target.value)}
                                className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none"
                              />
                              <button onClick={() => handleAddActionItem(s.sessionId)} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg flex items-center gap-1">
                                <Plus size={12} /> Add
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: MENTOR STUDIO ─── */}
      {activeTab === 'studio' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          {!isMentor ? (
            <EmptyState
              title="Mentor Studio is locked"
              description={myApplication?.status === 'pending'
                ? 'Your application is under review. You will get access once approved.'
                : 'Apply to become a verified mentor to publish office hours and grow your advisory practice.'}
              icon={<Sparkles className="h-6 w-6" aria-hidden="true" />}
              action={
                <button
                  onClick={() => setActiveTab('apply')}
                  className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Apply to Become a Mentor
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-teal-600 text-white font-black text-lg flex items-center justify-center">
                      {(myProfile?.name || 'M').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{myProfile?.name}</div>
                      <div className="text-teal-600 dark:text-teal-400 font-bold">{myProfile?.company || myProfile?.role || 'Mentor'}</div>
                    </div>
                  </div>
                  {myProfile?.headline && <p className="text-xs text-gray-500 mt-2">{myProfile.headline}</p>}
                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2 bg-surface dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="text-base font-black text-gray-900 dark:text-white">{myProfile?.stats?.sessionsCompleted || 0}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Sessions</div>
                    </div>
                    <div className="p-2 bg-surface dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="text-base font-black text-gray-900 dark:text-white">{myProfile?.stats?.totalHoursMentored || 0}h</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Hours</div>
                    </div>
                    <div className="p-2 bg-surface dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="text-base font-black text-gray-900 dark:text-white flex items-center justify-center gap-0.5">
                        <Star size={13} className="text-amber-500" fill="currentColor" />
                        {myProfile?.stats?.avgRating?.toFixed(1) || '—'}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">Rating</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                    <Calendar size={14} /> Publish Office Hours
                  </div>
                  <form onSubmit={handleCreateSlots} className="space-y-2">
                    <input
                      type="date"
                      value={slotForm.date}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                      className="w-full p-2 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        value={slotForm.startTime}
                        onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                        className="w-full p-2 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none"
                      />
                      <input
                        type="time"
                        value={slotForm.endTime}
                        onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                        className="w-full p-2 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={studioBusy}
                      className="w-full py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <Plus size={13} /> {studioBusy ? 'Publishing...' : 'Publish Slot'}
                    </button>
                  </form>
                </div>
              </div>

              <div>
                <div className="font-bold text-gray-700 dark:text-gray-300 mb-3">My Office Hours ({mySlots.length})</div>
                {mySlots.length === 0 ? (
                  <div className="text-gray-400 text-xs p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center">
                    No slots published yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {mySlots.map((slot) => {
                      const slotId = slot.id || slot._id || '';
                      return (
                        <div key={slotId} className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{slot.date}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock size={11} /> {slot.startTime} – {slot.endTime}
                            </div>
                            <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              slot.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {slot.status}
                            </span>
                          </div>
                          {slot.status === 'open' && (
                            <button
                              onClick={() => handleDeleteSlot(slotId)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                              title="Remove slot"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── TAB: INSIGHTS ─── */}
      {activeTab === 'insights' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Mentorship Insights</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Sessions', value: analytics.student.totalSessions, icon: Calendar, accent: 'text-teal-600' },
              { label: 'Completed', value: analytics.student.completed, icon: CheckCircle2, accent: 'text-emerald-600' },
              { label: 'Upcoming', value: analytics.student.upcoming, icon: Clock, accent: 'text-blue-600' },
              { label: 'Completion Rate', value: `${analytics.student.completionRate}%`, icon: Award, accent: 'text-violet-600' },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <Icon size={16} className={card.accent} />
                  <div className="text-xl font-black text-gray-900 dark:text-white mt-2">{card.value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">{card.label}</div>
                </div>
              );
            })}
          </div>

          {analytics.mentor && (
            <div className="space-y-4">
              <div className="font-bold text-gray-700 dark:text-gray-300">Mentor Performance</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Mentored', value: analytics.mentor.studentsMentored, icon: Users, accent: 'text-teal-600' },
                  { label: 'Hours', value: analytics.mentor.totalHoursMentored, icon: Clock, accent: 'text-blue-600' },
                  { label: 'Avg Rating', value: analytics.mentor.avgRating.toFixed(2), icon: Star, accent: 'text-amber-500' },
                  { label: 'Pending Req', value: analytics.mentor.pendingRequests, icon: UserCheck, accent: 'text-violet-600' },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                      <Icon size={16} className={card.accent} />
                      <div className="text-xl font-black text-gray-900 dark:text-white mt-2">{card.value}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">{card.label}</div>
                    </div>
                  );
                })}
              </div>
              {analytics.mentor.topTopics.length > 0 && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="font-bold text-gray-700 dark:text-gray-300 mb-2">Top Topics</div>
                  <div className="flex flex-wrap gap-2">
                    {analytics.mentor.topTopics.map(([topic, count]) => (
                      <span key={topic} className="px-2.5 py-1 bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-bold rounded-lg">
                        {topic} <span className="text-teal-600 dark:text-teal-400">×{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: APPLY ─── */}
      {activeTab === 'apply' && (
        <div className="bg-surface dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          {myApplication?.status === 'pending' ? (
            <EmptyState
              title="Application under review"
              description={`Your application was submitted on ${new Date(myApplication.createdAt).toLocaleDateString()}. You will be notified once our team reviews it.`}
              icon={<UserCheck className="h-6 w-6" aria-hidden="true" />}
            />
          ) : myApplication?.status === 'approved' || isMentor ? (
            <EmptyState
              title="You are a verified mentor!"
              description="Your mentor profile is live. Publish office hours from the Mentor Studio tab to start accepting students."
              icon={<Award className="h-6 w-6" aria-hidden="true" />}
            />
          ) : (
            <form onSubmit={handleApply} className="space-y-4 text-xs max-w-2xl">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Apply to Become a Mentor</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Share your expertise with Indian students through 1-on-1 advisory office hours.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={applicationForm.name}
                    onChange={(e) => setApplicationForm({ ...applicationForm, name: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={applicationForm.email}
                    onChange={(e) => setApplicationForm({ ...applicationForm, email: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={applicationForm.linkedinUrl}
                    onChange={(e) => setApplicationForm({ ...applicationForm, linkedinUrl: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Company / College</label>
                  <input
                    type="text"
                    value={applicationForm.collegeCompany}
                    onChange={(e) => setApplicationForm({ ...applicationForm, collegeCompany: e.target.value })}
                    placeholder="e.g. Google / IIT Delhi"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Field / Role</label>
                  <input
                    type="text"
                    value={applicationForm.field}
                    onChange={(e) => setApplicationForm({ ...applicationForm, field: e.target.value })}
                    placeholder="e.g. Software Engineering, Data Science"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={applicationForm.experienceYears}
                    onChange={(e) => setApplicationForm({ ...applicationForm, experienceYears: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={applicationForm.skills}
                  onChange={(e) => setApplicationForm({ ...applicationForm, skills: e.target.value })}
                  placeholder="e.g. System Design, Python, Machine Learning"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Why do you want to mentor?</label>
                <textarea
                  rows={4}
                  required
                  value={applicationForm.whyMentor}
                  onChange={(e) => setApplicationForm({ ...applicationForm, whyMentor: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={applyBusy}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition flex items-center gap-2"
              >
                {applyBusy ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                Submit Application
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

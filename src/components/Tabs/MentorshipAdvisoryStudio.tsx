import React, { useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
  Plus,
  Trash2,
  Download,
  ExternalLink,
  MessageSquare,
  Award,
  Video,
  Check,
  X,
  FileCode,
  TrendingUp,
  Star,
  UserCheck,
  Building2
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

/**
 * MentorshipAdvisoryStudio Component
 * 
 * Interactive Tech Mentorship & 1-on-1 Advisory Studio for YuvaHub.
 * Features:
 * 1. Verified Mentor Directory (FAANG & YC Founders)
 * 2. Interactive Office Hours Booking Console
 * 3. Session Notes & Action Item Ledger
 * 4. Topic-Based Peer Advisory Circles
 * 5. Mentorship History JSON Manifest Exporter
 */
export default function MentorshipAdvisoryStudio() {
  const { user } = useAppContext();

  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<'mentors' | 'booking' | 'ledger' | 'circles' | 'export'>('mentors');
  const [notification, setNotification] = useState<{ type: string; message: string }>({ type: '', message: '' });

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState<string>('all');

  // Mentors Data State
  const [mentors, setMentors] = useState([
    {
      id: 'mnt_1',
      name: 'Ananya Sharma',
      company: 'OpenAI',
      role: 'Staff AI Alignment Researcher',
      experience: '8+ Years',
      rating: 4.95,
      reviewsCount: 142,
      officeHours: 'Tuesdays & Thursdays',
      skills: ['LLMs', 'PyTorch', 'Research Papers', 'System Scaling'],
      avatar: 'A'
    },
    {
      id: 'mnt_2',
      name: 'Rohan Deshmukh',
      company: 'Stripe',
      role: 'Principal Distributed Systems Engineer',
      experience: '10+ Years',
      rating: 4.98,
      reviewsCount: 210,
      officeHours: 'Wednesdays & Saturdays',
      skills: ['Distributed Systems', 'Go', 'API Architecture', 'Database Locks'],
      avatar: 'R'
    },
    {
      id: 'mnt_3',
      name: 'Vikramaditya Roy',
      company: 'Google Cloud',
      role: 'Senior Engineering Director',
      experience: '12+ Years',
      rating: 4.92,
      reviewsCount: 98,
      officeHours: 'Fridays 5:00 PM IST',
      skills: ['Engineering Management', 'Career Strategy', 'Cloud Infrastructure'],
      avatar: 'V'
    }
  ]);

  // Booked Sessions State
  const [selectedMentorId, setSelectedMentorId] = useState('mnt_1');
  const [bookingDate, setBookingDate] = useState('2026-08-12');
  const [meetingTopic, setMeetingTopic] = useState('System Design & LLM Fine-Tuning Strategy');
  const [sessions, setSessions] = useState([
    {
      id: 'sess_1',
      mentorName: 'Ananya Sharma',
      company: 'OpenAI',
      date: '2026-07-20',
      topic: 'LLM Fine-Tuning & Evaluation Pipelines',
      status: 'COMPLETED',
      notes: 'Focus on LoRA adapter weights and custom dataset tokenization.'
    }
  ]);

  // Book 1-on-1 Advisory Session
  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMentor = mentors.find(m => m.id === selectedMentorId);
    if (!targetMentor) return;

    const newSession = {
      id: `sess_${Date.now()}`,
      mentorName: targetMentor.name,
      company: targetMentor.company,
      date: bookingDate,
      topic: meetingTopic,
      status: 'CONFIRMED',
      notes: 'Pending meeting link dispatch.'
    };

    setSessions([...sessions, newSession]);
    setNotification({ type: 'success', message: `Booked 1-on-1 advisory session with ${targetMentor.name}!` });
  };

  // Export Manifest JSON
  const handleExportManifest = () => {
    const manifest = {
      user: user?.displayName || 'Student Developer',
      completedSessionsCount: sessions.filter(s => s.status === 'COMPLETED').length,
      advisoryLedger: sessions,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `YuvaHub_Mentorship_Advisory_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  // Filtered Mentors
  const filteredMentors = mentors.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExp = selectedExpertise === 'all' || m.skills.includes(selectedExpertise);
    return matchesSearch && matchesExp;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-950 border border-teal-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/20 border border-teal-500/30 rounded-full flex items-center gap-1.5">
                <Users size={13} /> Verified Tech Mentorship Guild
              </span>
              <span className="px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                1-on-1 Advisory Office Hours
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              1-on-1 Tech Mentorship & Advisory Studio
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Book dedicated advisory sessions with staff engineers and researchers from OpenAI, Stripe, and Google Cloud.
            </p>
          </div>

          {/* Sessions Counter Meter */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-teal-700/60 p-4 rounded-2xl w-full lg:w-auto shadow-lg">
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full border-4 border-teal-400 bg-slate-950 font-black text-xl text-teal-400">
              {sessions.length}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Advisory Sessions Booked</div>
              <div className="text-xs font-extrabold text-emerald-400">Verified Mentor Guild</div>
              <div className="text-[11px] text-slate-400">4.95 Avg Feedback Score</div>
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
              {notification.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
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
          { id: 'mentors', label: `Find Mentors (${mentors.length})`, icon: Users },
          { id: 'booking', label: 'Book Advisory Session', icon: Calendar },
          { id: 'ledger', label: `Session Ledger (${sessions.length})`, icon: FileCode },
          { id: 'export', label: 'Mentorship History JSON', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
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

      {/* TAB 1: MENTORS */}
      {activeTab === 'mentors' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Verified Tech Mentors</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Connect for career guidance, system design reviews, and research advice.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search mentor or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredMentors.map((m) => (
              <div key={m.id} className="p-5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-3 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black text-sm flex items-center justify-center">
                      {m.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{m.name}</h4>
                      <p className="text-teal-600 dark:text-teal-400 font-bold">{m.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">{m.role} • {m.experience}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {m.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[10px] font-semibold rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setSelectedMentorId(m.id);
                      setActiveTab('booking');
                    }}
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition"
                  >
                    Book 1-on-1 Office Hours
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: BOOKING */}
      {activeTab === 'booking' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Schedule Advisory Office Hours</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Select mentor and set discussion agenda.</p>
          </div>

          <form onSubmit={handleBookSession} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Select Mentor</label>
              <select
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none font-bold"
              >
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.company} - {m.role})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Preferred Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">Session Agenda & Discussion Topics</label>
              <textarea
                rows={3}
                value={meetingTopic}
                onChange={(e) => setMeetingTopic(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white outline-none"
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition">
              Confirm Advisory Session
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Advisory Session History & Notes</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Track key takeaways and action items from mentor meetings.</p>
          </div>

          <div className="space-y-3 text-xs">
            {sessions.map((s) => (
              <div key={s.id} className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{s.mentorName} ({s.company})</div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                    s.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <div className="text-gray-500">Topic: {s.topic} • Date: {s.date}</div>
                <p className="text-gray-700 dark:text-gray-300 font-mono text-[11px] bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700">
                  Notes: {s.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXPORT */}
      {activeTab === 'export' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Mentorship History Manifest JSON</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Complete summary of 1-on-1 advisory office hours.</p>
            </div>

            <button
              onClick={handleExportManifest}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
            >
              <Download size={14} /> Download Manifest JSON
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-teal-300 overflow-x-auto">
            <pre>{JSON.stringify({
              user: user?.displayName || 'Student Developer',
              completedSessionsCount: sessions.filter(s => s.status === 'COMPLETED').length,
              advisoryLedger: sessions,
              timestamp: new Date().toISOString()
            }, null, 2)}</pre>
          </div>
        </div>
      )}

    </div>
  );
}

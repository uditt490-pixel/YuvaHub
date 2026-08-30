import React, { useState, useEffect } from 'react';
import { 
  Bot, User, Send, Check, Calendar, Clock, Video, Download, 
  ExternalLink, CheckCircle, XCircle, Clock3, AlertCircle, Plus, X, Sparkles, Building2, Award, Shield
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChatMessage } from '../../types';
import { chatWithAIMentorBackend } from '../../services/apiClient';
import { fetchMySessions, updateSessionStatus } from '../../services/mentorshipApi';
import { EmptyState, ErrorState, LoadingState } from '../ui/states';
import { useAppContext } from '../../context/AppContext';

interface Mentor {
  id: string;
  name: string;
  org: string;
  field: string;
  exp: number;
  tags: string[];
}

interface MentorshipSession {
  sessionId: string;
  studentUid: string;
  mentorUid: string;
  mentorName: string;
  topic: string;
  slotDateTime: string;
  meetingUrl: string;
  status: 'Pending' | 'Confirmed' | 'Declined' | 'Completed' | string;
  createdAt?: string;
}

const DUMMY_MENTORS: Mentor[] = [
  { id: 'm_sarah', name: 'Sarah Jenkins', org: 'Senior SWE @ Google', field: 'Distributed Systems & Cloud Architecture', exp: 8, tags: ['GSoC Mentor', 'System Design', 'Resume Review'] },
  { id: 'm_alex', name: 'Alex Rivera', org: 'Staff Engineer @ Stripe', field: 'Backend Infrastructure & FinTech APIs', exp: 10, tags: ['Distributed DBs', 'System Design', 'Mock Interviews'] },
  { id: 'm_priya', name: 'Priya Sharma', org: 'Tech Lead @ Microsoft', field: 'AI/ML & Cloud Innovation', exp: 6, tags: ['Imagine Cup', 'Machine Learning', 'Career Growth'] },
  { id: 'm_david', name: 'David Chen', org: 'Principal Designer @ Airbnb', field: 'Product Strategy & UX Systems', exp: 7, tags: ['Portfolio Review', 'Design Thinking', 'UX'] },
];

export default function Mentorship() {
  const { user, setActiveTab } = useAppContext();
  const [view, setView] = useState<'ai' | 'human' | 'bookings'>('human');

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-8 font-sans pb-16 px-2 sm:px-4">
      {/* Top Banner Navigation Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#603620] text-[#f3e4bd] text-xs font-bold uppercase tracking-wider mb-2">
            <User className="w-3.5 h-3.5 text-[#f3e4bd]" />
            <span>1-on-1 Guidance & Advisory</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-text-primary dark:text-white tracking-tight">
            Mentorship <span className="text-primary-blue italic">Scheduler</span>
          </h1>
          <p className="text-xs text-text-secondary dark:text-slate-400 font-medium mt-1">
            Book interactive 1-on-1 sessions with verified industry engineers, manage availability, and export to Google Calendar.
          </p>
        </div>
        
        <div className="flex bg-background dark:bg-slate-800 p-1.5 rounded-2xl border border-border-theme dark:border-slate-700 shrink-0">
          <button 
            onClick={() => setView('human')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              view === 'human' 
                ? 'bg-primary-blue text-white shadow-xs' 
                : 'text-text-secondary dark:text-slate-300 hover:bg-surface-secondary'
            }`}
          >
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Industry Mentors</span>
          </button>
          <button 
            onClick={() => setView('bookings')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              view === 'bookings' 
                ? 'bg-primary-blue text-white shadow-xs' 
                : 'text-text-secondary dark:text-slate-300 hover:bg-surface-secondary'
            }`}
          >
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> My Bookings</span>
          </button>
          <button 
            onClick={() => setView('ai')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              view === 'ai' 
                ? 'bg-primary-blue text-white shadow-xs' 
                : 'text-text-secondary dark:text-slate-300 hover:bg-surface-secondary'
            }`}
          >
            <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" /> AI Mentor</span>
          </button>
        </div>
      </header>

      {view === 'ai' && <AIMain user={user} />}
      {view === 'human' && <HumanMain user={user} onBookingCreated={() => setView('bookings')} />}
      {view === 'bookings' && <MyBookingsMain user={user} />}
    </div>
  );
}

function HumanMain({ user, onBookingCreated }: { user: any; onBookingCreated: () => void }) {
  const [showApply, setShowApply] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DUMMY_MENTORS.map(m => (
          <div key={m.id} className="bg-surface dark:bg-slate-900 p-6 rounded-3xl border border-border-theme dark:border-slate-800 shadow-2xs flex flex-col justify-between h-full hover:border-primary-blue transition-all">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-[#603620] text-[#f3e4bd] flex items-center justify-center font-serif font-bold text-lg shadow-2xs">
                      {m.name.charAt(0)}
                   </div>
                   <div>
                     <h3 className="text-base font-serif font-bold text-text-primary dark:text-white leading-tight">{m.name}</h3>
                     <p className="text-xs font-bold text-primary-blue mt-0.5">{m.org}</p>
                   </div>
                </div>
                <span className="px-2.5 py-1 bg-[#63703d]/15 text-[#63703d] text-[10px] font-extrabold rounded-lg border border-[#63703d]/30">{m.exp} Yrs Exp</span>
              </div>
              <p className="text-xs text-text-secondary dark:text-slate-300 font-medium mb-4">{m.field}</p>
              
              <div className="flex flex-wrap gap-1.5 mt-4">
                 {m.tags.map(t => (
                   <span key={t} className="px-2.5 py-1 bg-surface-secondary dark:bg-slate-800 text-text-secondary dark:text-slate-300 text-[10px] font-bold rounded-lg border border-border-theme dark:border-slate-700">
                     #{t}
                   </span>
                 ))}
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedMentor(m)}
              className="w-full py-3 mt-6 bg-primary-blue hover:bg-[#96552a] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" /> Schedule 1-on-1 Session
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedMentor && (
        <BookingModal 
          mentor={selectedMentor} 
          user={user} 
          onClose={() => setSelectedMentor(null)} 
          onSuccess={() => {
            setSelectedMentor(null);
            onBookingCreated();
          }}
        />
      )}

      {/* Mentor Application Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#603620] via-[#482817] to-[#231f20] text-white rounded-3xl p-8 md:p-10 text-center flex flex-col items-center shadow-md border border-border-theme">
         <div className="relative z-10 max-w-xl space-y-3">
           <h3 className="text-2xl font-serif font-bold text-[#f3e4bd]">Want to guide the next generation?</h3>
           <p className="text-xs text-[#e8ded1] font-medium">Share your engineering expertise and mentor ambitious student developers on YuvaHub.</p>
           {!showApply ? (
             <button onClick={() => setShowApply(true)} className="bg-primary-blue hover:bg-[#96552a] text-white px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md mt-2 inline-block cursor-pointer">
               Apply to Become a Mentor
             </button>
           ) : (
             <MentorApplyForm user={user} onClose={() => setShowApply(false)} />
           )}
         </div>
      </div>
    </div>
  );
}

function BookingModal({ mentor, user, onClose, onSuccess }: { mentor: Mentor; user: any; onClose: () => void; onSuccess: () => void }) {
  const [selectedDate, setSelectedDate] = useState('2026-08-15');
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [topic, setTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const TIME_SLOTS = ['10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM', '05:30 PM'];

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setBookingError(null);

    const slotDateTime = `${selectedDate} at ${selectedTime} IST`;

    try {
      const res = await fetch('/api/v1/mentorship/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentUid: user?.uid || 'user_default',
          mentorUid: mentor.id,
          mentorName: mentor.name,
          topic: topic.trim() || 'Resume & Career Growth Strategy',
          slotDateTime,
          meetingUrl: `https://meet.jit.si/yuvahub-mentorship-${Date.now()}`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to book session');

      onSuccess();
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-surface dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-border-theme dark:border-slate-800 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-border-theme dark:border-slate-800">
          <div>
            <h3 className="font-serif font-bold text-base text-text-primary dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-blue" /> Book Session with {mentor.name}
            </h3>
            <p className="text-[11px] text-text-secondary dark:text-slate-400 font-semibold">{mentor.org}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {bookingError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            {bookingError}
          </div>
        )}

        <form onSubmit={handleBook} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-text-secondary uppercase block mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none"
              required
            />
          </div>

          <div>
            <label className="font-bold text-text-secondary uppercase block mb-1.5">Available Time Slot</label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedTime === slot
                      ? 'bg-primary-blue text-white border-primary-blue shadow-xs'
                      : 'bg-background text-text-secondary border-border-theme hover:bg-surface-secondary'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text-text-secondary uppercase block mb-1">Session Topic</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. GSoC proposal review, mock system design interview..."
              className="w-full bg-background dark:bg-slate-800 border border-border-theme dark:border-slate-700 rounded-xl p-3 text-xs text-text-primary dark:text-white outline-none resize-none h-20"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-text-secondary bg-surface-secondary rounded-xl hover:bg-[#e8ded1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-primary-blue hover:bg-[#96552a] rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Booking...' : 'Confirm Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MentorApplyForm({ user, onClose }: { user: any; onClose: () => void }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({ name: user?.displayName || '', company: '', role: '', exp: '3', bio: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 600);
  };

  if (status === 'success') {
    return (
      <div className="bg-surface text-text-primary p-6 rounded-2xl border border-border-theme text-center space-y-3 animate-scale-up">
        <CheckCircle className="w-8 h-8 text-[#63703d] mx-auto" />
        <h4 className="font-serif font-bold text-base">Application Submitted!</h4>
        <p className="text-xs text-text-secondary font-medium">Our team will verify your credentials and reach out via email.</p>
        <button onClick={onClose} className="px-4 py-2 bg-primary-blue text-white text-xs font-bold rounded-xl">Close</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface text-text-primary p-6 rounded-2xl border border-border-theme space-y-3 text-left w-full text-xs">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-text-secondary uppercase block mb-1">Company / Org</label>
          <input required type="text" placeholder="e.g. Google" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-background border border-border-theme p-2.5 rounded-xl text-xs" />
        </div>
        <div>
          <label className="font-bold text-text-secondary uppercase block mb-1">Role Title</label>
          <input required type="text" placeholder="e.g. Staff Engineer" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-background border border-border-theme p-2.5 rounded-xl text-xs" />
        </div>
      </div>
      <div>
        <label className="font-bold text-text-secondary uppercase block mb-1">Brief Bio & Expertise</label>
        <textarea required rows={2} placeholder="Explain what topics you can guide students on..." value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-background border border-border-theme p-2.5 rounded-xl text-xs resize-none" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-3 py-2 text-xs font-bold text-text-secondary bg-surface-secondary rounded-xl">Cancel</button>
        <button type="submit" disabled={status === 'submitting'} className="px-5 py-2 text-xs font-bold text-white bg-primary-blue rounded-xl">Submit Application</button>
      </div>
    </form>
  );
}

function MyBookingsMain({ user }: { user: any }) {
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/mentorship/sessions?uid=${user?.uid || 'user_default'}`);
      if (!res.ok) throw new Error('Failed to load your bookings');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSessions();
  }, [user]);

  if (loading) return <LoadingState title="Loading bookings" description="Fetching your mentorship appointments." />;
  if (error) return <ErrorState title="Unable to load bookings" description={error} onRetry={() => void fetchSessions()} />;

  if (sessions.length === 0) {
    return (
      <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-10 text-center space-y-4">
        <Calendar className="w-10 h-10 text-primary-blue mx-auto" />
        <h3 className="font-serif font-bold text-lg text-text-primary dark:text-white">No Upcoming Sessions</h3>
        <p className="text-xs text-text-secondary font-medium max-w-sm mx-auto">Explore industry mentors to schedule your first 1-on-1 advisory call.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map(s => (
        <div key={s.sessionId} className="p-5 rounded-2xl bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase text-[#63703d] bg-[#63703d]/15 px-2.5 py-0.5 rounded-md border border-[#63703d]/30">{s.status}</span>
            <h3 className="font-serif font-bold text-base text-text-primary dark:text-white mt-1">{s.topic}</h3>
            <p className="text-xs text-text-secondary font-semibold mt-0.5">Mentor: {s.mentorName} • {s.slotDateTime}</p>
          </div>
          <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-primary-blue text-white text-xs font-bold rounded-xl flex items-center gap-2">
            <Video className="w-3.5 h-3.5" /> Join Video Call
          </a>
        </div>
      ))}
    </div>
  );
}

interface LocalAIMessage {
  sender: 'ai' | 'user';
  text: string;
}

function AIMain({ user }: { user: any }) {
  const [messages, setMessages] = useState<LocalAIMessage[]>([
    { sender: 'ai', text: 'Hello! I am your YuvaHub AI Mentor. How can I help with your GSoC application, resume, or career roadmap today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response: any = await chatWithAIMentorBackend([], userMsg);
      const reply = typeof response === 'string' ? response : (response?.text || 'I am processing your query. Please try again.');
      setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: 'AI assistant service temporarily offline. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface dark:bg-slate-900 border border-border-theme dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xs">
      <div className="border-b border-border-theme pb-4 flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-[#603620] text-[#f3e4bd]">
          <Bot className="w-5 h-5 text-[#f3e4bd]" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-base text-text-primary dark:text-white">YuvaHub AI Career Advisor</h3>
          <p className="text-xs text-text-secondary font-medium">Instant guidance on resume review, GSoC proposals, and system design.</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-4 rounded-2xl text-xs font-medium leading-relaxed ${
              m.sender === 'user' 
                ? 'bg-primary-blue text-white shadow-xs' 
                : 'bg-background text-text-primary border border-border-theme'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-text-secondary font-bold animate-pulse">AI is typing...</div>}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 pt-2 border-t border-border-theme">
        <input
          type="text"
          placeholder="Ask AI Mentor anything..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-background border border-border-theme rounded-xl px-4 py-3 text-xs text-text-primary outline-none"
        />
        <button type="submit" disabled={loading} className="px-5 py-3 bg-primary-blue hover:bg-[#96552a] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer">
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
}

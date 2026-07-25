import React, { useState, useEffect } from 'react';
import { 
  Bot, User, Send, Check, Calendar, Clock, Video, Download, 
  ExternalLink, CheckCircle, XCircle, Clock3, AlertCircle, Plus, X
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ChatMessage } from '../../types';
import { chatWithAIMentorBackend } from '../../services/apiClient';
import { ErrorState } from '../ui/states';
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
  const { user } = useAppContext();
  const [view, setView] = useState<'ai' | 'human' | 'bookings'>('human');

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            1-on-1 Peer Mentorship & Scheduler
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Book interactive 1-on-1 mentorship sessions, manage availability, and export to Google Calendar.
          </p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
          <button 
            onClick={() => setView('human')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${view === 'human' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-blue-600" /> Human Mentors</span>
          </button>
          <button 
            onClick={() => setView('bookings')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${view === 'bookings' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-600" /> My Bookings</span>
          </button>
          <button 
            onClick={() => setView('ai')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${view === 'ai' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5 text-purple-600" /> AI Mentor</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DUMMY_MENTORS.map(m => (
          <div key={m.id} className="clean-card p-6 flex flex-col justify-between h-full hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all bg-white rounded-2xl border border-gray-200/80">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                   <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-lg shadow-2xs">
                      {m.name.charAt(0)}
                   </div>
                   <div>
                     <h3 className="text-base font-bold text-gray-900 leading-tight">{m.name}</h3>
                     <p className="text-xs font-semibold text-blue-600">{m.org}</p>
                   </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-lg border border-emerald-200">{m.exp} Yrs Exp</span>
              </div>
              <p className="text-xs text-gray-700 font-medium mb-4">{m.field}</p>
              
              <div className="flex flex-wrap gap-1.5 mt-4">
                 {m.tags.map(t => (
                   <span key={t} className="px-2.5 py-0.5 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-md border border-gray-200">
                     #{t}
                   </span>
                 ))}
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedMentor(m)}
              className="w-full py-2.5 mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2"
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

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 md:p-10 text-center flex flex-col items-center shadow-lg relative overflow-hidden">
         <div className="relative z-10 max-w-xl space-y-3">
           <h3 className="text-2xl font-bold tracking-tight">Want to guide the next generation?</h3>
           <p className="text-blue-100 font-medium text-xs">Share your engineering expertise and mentor ambitious student developers.</p>
           {!showApply ? (
             <button onClick={() => setShowApply(true)} className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-md mt-2 inline-block">Apply to Become a Mentor</button>
           ) : (
             <MentorApplyForm user={user} onClose={() => setShowApply(false)} />
           )}
         </div>
      </div>
    </div>
  );
}

function BookingModal({ mentor, user, onClose, onSuccess }: { mentor: Mentor; user: any; onClose: () => void; onSuccess: () => void }) {
  const [selectedDate, setSelectedDate] = useState('2026-07-25');
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

      if (!res.ok) {
        throw new Error(data.error || 'Failed to book session');
      }

      onSuccess();
    } catch (err: any) {
      setBookingError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-gray-200 shadow-2xl space-y-4 animate-scale-up">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Book Session with {mentor.name}
            </h3>
            <p className="text-[11px] text-gray-500 font-semibold">{mentor.org}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {bookingError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            {bookingError}
          </div>
        )}

        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1.5">Available Time Slot</label>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                    selectedTime === slot
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Session Discussion Topic</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. GSoC proposal review, mock system design interview, resume advice..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold resize-none h-20"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Booking...' : 'Confirm Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MyBookingsMain({ user }: { user: any }) {
  const [sessions, setSessions] = useState<MentorshipSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/v1/mentorship/sessions?uid=${user?.uid || 'user_default'}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSessions();
  }, [user]);

  const handleUpdateStatus = async (sessionId: string, status: string) => {
    setSessions(prev => prev.map(s => s.sessionId === sessionId ? { ...s, status } : s));

    try {
      await fetch('/api/v1/mentorship/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, status })
      });
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const generateGoogleCalendarUrl = (s: MentorshipSession) => {
    const title = encodeURIComponent(`1-on-1 Mentorship Session: ${s.mentorName}`);
    const details = encodeURIComponent(`Topic: ${s.topic}\nMeeting Link: ${s.meetingUrl}`);
    const location = encodeURIComponent(s.meetingUrl);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  const downloadIcsFile = (s: MentorshipSession) => {
    const csData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YuvaHub Mentorship//EN
BEGIN:VEVENT
SUMMARY:1-on-1 Mentorship with ${s.mentorName}
DESCRIPTION:Topic: ${s.topic}\\nMeeting Link: ${s.meetingUrl}
LOCATION:${s.meetingUrl}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([csData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mentorship_session_${s.sessionId}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[10px] font-extrabold flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-600 fill-emerald-600" /> Confirmed</span>;
      case 'Declined':
        return <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 rounded-full text-[10px] font-extrabold flex items-center gap-1"><XCircle className="w-3 h-3 text-red-600" /> Declined</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-full text-[10px] font-extrabold flex items-center gap-1"><Check className="w-3 h-3 text-purple-600" /> Completed</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-[10px] font-extrabold flex items-center gap-1"><Clock3 className="w-3 h-3 text-amber-600" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" /> Scheduled Mentorship Sessions
        </h3>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 font-semibold">Loading bookings...</div>
      ) : sessions.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-2">
          <Calendar className="w-8 h-8 text-gray-300 mx-auto" />
          <h4 className="font-bold text-gray-900 text-sm">No Booked Sessions Yet</h4>
          <p className="text-xs text-gray-500">Book a 1-on-1 session with a mentor from the Human Mentors list.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(s => (
            <div key={s.sessionId} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-base text-gray-900">{s.mentorName}</h4>
                  {getStatusBadge(s.status)}
                </div>

                <div className="text-xs text-gray-600 space-y-1 font-semibold">
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Clock className="w-3.5 h-3.5" /> Slot: {s.slotDateTime}
                  </div>
                  <p className="text-gray-700">Topic: <span className="font-bold text-gray-900">{s.topic}</span></p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
                {s.status === 'Confirmed' && (
                  <>
                    <a
                      href={generateGoogleCalendarUrl(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Add to Google Calendar
                    </a>

                    <button
                      onClick={() => downloadIcsFile(s)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-500" /> .ics Calendar
                    </button>

                    <a
                      href={s.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Room
                    </a>
                  </>
                )}

                {s.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateStatus(s.sessionId, 'Confirmed')}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(s.sessionId, 'Declined')}
                      className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 font-bold text-xs rounded-xl"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AIMain({ user }: { user: any }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const SUGGESTIONS = [
    "How do I get into GSoC?",
    "Review my LinkedIn summary",
    "What skills do I need for ML internships?",
    "I'm a 2nd year CSE student, what should I do next?"
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await chatWithAIMentorBackend(history, text);
      const botMsg: ChatMessage = { id: 'bot-'+Date.now(), role: 'assistant', content: typeof response === 'string' ? response : JSON.stringify(response), timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      const botMsg: ChatMessage = { id: 'bot-'+Date.now(), role: 'assistant', content: JSON.stringify({text: "Connection to logical pathways failed."}), timestamp: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[70vh] bg-white rounded-2xl border border-gray-200/80 p-4 shadow-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center space-y-4 py-12">
            <Bot className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="font-bold text-gray-900 text-lg">YuvaHub AI Career Coach</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto font-medium">Ask for resume advice, GSoC guidance, hackathon strategy, or career roadmaps.</p>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto pt-4">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-semibold px-3 py-1.5 rounded-xl border border-gray-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-medium ${
              m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-xs text-gray-400 font-bold animate-pulse">AI is thinking...</div>}
      </div>

      <div className="pt-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          placeholder="Ask AI mentor..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-purple-500 font-semibold"
        />
        <button
          onClick={() => handleSend(input)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MentorApplyForm({ user, onClose }: any) {
  const [formData, setFormData] = useState({ name: '', linkedin: '', org: '', field: '', exp: '', availability: [] as string[], why: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if(!user) throw new Error("Must be logged in.");
      await addDoc(collection(db, 'mentor_applications'), {
        ...formData, submitterUid: user.uid, status: 'pending', createdAt: serverTimestamp()
      });
      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if(success) {
    return (
      <div className="text-white font-bold bg-white/10 rounded-xl p-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center mb-3">
           <Check className="w-6 h-6" />
        </div>
        Application Submitted Successfully.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="text-left bg-white text-gray-900 rounded-2xl p-6 space-y-4 w-full shadow-xl">
      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
         <h4 className="font-bold text-sm">Mentor Application</h4>
         <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
        <input required type="text" placeholder="Full Name" className="px-3.5 py-2 rounded-xl border border-gray-200" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
        <input required type="url" placeholder="LinkedIn URL" className="px-3.5 py-2 rounded-xl border border-gray-200" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
        <input required type="text" placeholder="College or Company" className="px-3.5 py-2 rounded-xl border border-gray-200" value={formData.org} onChange={e => setFormData({...formData, org: e.target.value})} />
        <input required type="text" placeholder="Field of Expertise" className="px-3.5 py-2 rounded-xl border border-gray-200" value={formData.field} onChange={e => setFormData({...formData, field: e.target.value})} />
      </div>

      <textarea required placeholder="Why do you want to mentor?" rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs resize-none" value={formData.why} onChange={e => setFormData({...formData, why: e.target.value})}/>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading} className="py-2.5 px-4 bg-blue-600 text-white font-bold text-xs rounded-xl flex-1">{loading ? 'Submitting...' : 'Submit Form'}</button>
        <button type="button" onClick={onClose} className="py-2.5 px-4 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl flex-1">Cancel</button>
      </div>
    </form>
  );
}

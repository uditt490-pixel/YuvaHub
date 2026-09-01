import React, { useState } from 'react';
import { HelpCircle, MessageSquare, ShieldCheck, Search, CheckCircle2, Clock, AlertCircle, FileText, Send, Sparkles, Filter, Headset } from 'lucide-react';
import SupportTicketCard from '../components/SupportTicketCard';
import TicketStreamTimeline from '../components/TicketStreamTimeline';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: 'SCHOLARSHIP_DISBURSEMENT' | 'INCUBATION_GRANT' | 'MENTORSHIP_BOOKING' | 'PORTFOLIO_VERIFICATION';
  studentName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'RESOLVED' | 'IN_PROGRESS' | 'PENDING_ADMIN';
  createdAtAgo: string;
  aiSuggestedSolution: string;
}

const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-101',
    ticketNumber: 'YUH-2026-8901',
    subject: 'Scholarship Grant Disbursement Status Delay (Q3 Cohort)',
    category: 'SCHOLARSHIP_DISBURSEMENT',
    studentName: 'Sarah Jenkins',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAtAgo: '20 mins ago',
    aiSuggestedSolution: 'Verified bank mandate in PFMS portal. Escalated to YuvaHub Treasury for direct DBT transfer confirmation.',
  },
  {
    id: 'tkt-102',
    ticketNumber: 'YUH-2026-8902',
    subject: 'Startup Incubation Seed Funding Milestone 2 Sign-off',
    category: 'INCUBATION_GRANT',
    studentName: 'Alex Rivera (Founding Tech Lead)',
    priority: 'HIGH',
    status: 'PENDING_ADMIN',
    createdAtAgo: '45 mins ago',
    aiSuggestedSolution: 'Milestone 2 MVP code audit verified on GitHub. Pending final approval by Incubation Board Committee.',
  },
  {
    id: 'tkt-103',
    ticketNumber: 'YUH-2026-8903',
    subject: '1-on-1 AI Mentorship Slot Rescheduling Request',
    category: 'MENTORSHIP_BOOKING',
    studentName: 'David Chen',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAtAgo: '2 hours ago',
    aiSuggestedSolution: 'Automatically re-booked slot with Dr. Aris Thorne for Friday 4:00 PM IST via Google Calendar API.',
  },
];

export default function StudentSupportDeskPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tickets' | 'ticket-stream'>('tickets');
  const [selectedTicketModal, setSelectedTicketModal] = useState<SupportTicket | null>(null);

  const pendingCount = tickets.filter(t => t.status !== 'RESOLVED').length;

  const filteredTickets = tickets.filter(t =>
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen  p-6 md:p-10 font-sans">
      {/* Header Banner */}
      <header className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/20 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -top-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full font-semibold border border-blue-500/30 flex items-center gap-1.5">
                <Headset className="w-3.5 h-3.5" /> YuvaHub Student Support
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Enterprise SLA Guarantee (&lt; 2hr Response)
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-200 bg-clip-text text-transparent">
              Enterprise Student Support & Resolution Desk
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
              Automated AI support ticket routing, scholarship disbursement tracking, incubation seed fund query resolution, and live SLA monitoring dashboard.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl font-medium shadow-lg shadow-blue-600/30 transition flex items-center gap-2 border border-blue-400/20 text-sm">
              <MessageSquare className="w-4 h-4" /> Submit Support Ticket
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Open Support Tickets</span>
              <AlertCircle className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">{pendingCount} Tickets</div>
            <div className="text-blue-400 text-xs mt-2 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Avg First Response: 14 Mins
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>AI Auto-Resolution Rate</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">78.4%</div>
            <div className="text-indigo-400 text-xs mt-2 font-medium">
              Powered by YuvaHub Support LLM
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Student CSAT Score</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">4.92 / 5.0</div>
            <div className="text-emerald-400 text-xs mt-2 font-medium">
              Over 1,200 Student Reviews
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'tickets'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" /> Active Support Tickets
            </button>
            <button
              onClick={() => setActiveTab('ticket-stream')}
              className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 ${
                activeTab === 'ticket-stream'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-4 h-4" /> Live Resolution Stream
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ticket or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Tab Body */}
        {activeTab === 'ticket-stream' ? (
          <TicketStreamTimeline />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.map((tkt) => (
              <SupportTicketCard
                key={tkt.id}
                ticket={tkt}
                onInspect={() => setSelectedTicketModal(tkt)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal View */}
      {selectedTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTicketModal(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white text-xl font-bold"
            >
              ×
            </button>

            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedTicketModal.subject}</h3>
                <div className="text-xs text-slate-400 font-mono">Ticket #: {selectedTicketModal.ticketNumber} | Student: {selectedTicketModal.studentName}</div>
              </div>
              <span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded font-mono text-xs font-bold border border-blue-500/30">
                {selectedTicketModal.status}
              </span>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">Category</span>
                <span className="text-white font-bold">{selectedTicketModal.category}</span>
              </div>
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 block">AI Resolution Suggestion</span>
                <span className="text-blue-300 font-semibold">{selectedTicketModal.aiSuggestedSolution}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedTicketModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs transition"
              >
                Close Ticket View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

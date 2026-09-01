import React from 'react';
import { UserCheck, GraduationCap, Briefcase, Sparkles, Calendar } from 'lucide-react';

interface CardProps {
  slot: {
    _id: string;
    mentorName: string;
    mentorAlumniBatchYear: number;
    mentorCurrentCompany: string;
    mentorCurrentRole: string;
    campusName: string;
    expertiseArea: string;
    availableSessionsCount: number;
    sessionDurationMinutes: number;
    matchingCompatibilityPercent: number;
    status: string;
    assignedStudentName?: string;
    sessionTopics: string;
  };
  onBookClick: (slotId: string) => void;
}

export const CampusAlumniMentorshipCard: React.FC<CardProps> = ({ slot, onBookClick }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            Class of '{slot.mentorAlumniBatchYear} • {slot.campusName}
          </span>
          <span
            className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
              slot.status === 'BOOKED'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}
          >
            {slot.status}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">{slot.mentorName}</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-semibold">
              {slot.mentorCurrentRole} @ {slot.mentorCurrentCompany}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-indigo-400 block tracking-tight">
              {slot.matchingCompatibilityPercent}%
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Match Score</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">{slot.sessionTopics}</p>

        <div className="bg-slate-950/40 rounded-2xl p-3.5 mb-5 space-y-2 text-xs border border-slate-800/40">
          <div className="flex justify-between">
            <span className="text-slate-400">Expertise Domain:</span>
            <span className="font-bold text-white">{slot.expertiseArea}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Session Duration:</span>
            <span className="font-bold text-indigo-400">{slot.sessionDurationMinutes} Mins 1:1 Call</span>
          </div>
          {slot.assignedStudentName && (
            <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-slate-800/60">
              <span>Matched Student:</span>
              <span>{slot.assignedStudentName}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onBookClick(slot._id)}
        disabled={slot.status === 'BOOKED'}
        className={`w-full font-extrabold text-sm py-3 px-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          slot.status === 'BOOKED'
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-slate-950 shadow-indigo-500/20'
        }`}
      >
        <UserCheck className="w-4 h-4" />
        {slot.status === 'BOOKED' ? 'Mentorship Slot Booked' : 'Book 1:1 Alumni Mentorship'}
      </button>
    </div>
  );
};

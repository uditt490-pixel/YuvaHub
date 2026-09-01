import React from 'react';
import { HeartPulse, UserCheck, ShieldAlert, Calendar, Sparkles } from 'lucide-react';

interface WellnessCardProps {
  checkIn: {
    _id: string;
    studentName: string;
    studentId: string;
    campusName: string;
    moodRating: number;
    stressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    burnoutScorePercent: number;
    primaryStressor: string;
    supportRequested: boolean;
    counselorAssigned?: string;
    sessionStatus: string;
    createdAt: string;
  };
  onAssignCounselorClick: (id: string) => void;
}

export const StudentMentalWellnessCard: React.FC<WellnessCardProps> = ({ checkIn, onAssignCounselorClick }) => {
  const getStressBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'MODERATE':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl hover:border-teal-500/40 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
            {checkIn.campusName}
          </span>
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getStressBadge(checkIn.stressLevel)}`}>
            {checkIn.stressLevel} STRESS
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">{checkIn.studentName}</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {checkIn.studentId}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-teal-400 block tracking-tight">
              {checkIn.burnoutScorePercent}%
            </span>
            <span className="text-[11px] font-semibold text-slate-400">Burnout Score</span>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 mb-4 text-xs space-y-2">
          <div className="flex justify-between items-center text-slate-300 font-semibold">
            <span className="text-slate-400">Primary Stressor:</span>
            <span className="text-teal-400 font-bold">{checkIn.primaryStressor}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300 font-semibold">
            <span className="text-slate-400">Mood Rating:</span>
            <span className="text-amber-400 font-bold">{checkIn.moodRating} / 5 Stars</span>
          </div>
          {checkIn.counselorAssigned && (
            <div className="flex justify-between items-center text-slate-300 font-semibold pt-2 border-t border-slate-800/60">
              <span className="text-slate-400">Assigned Counselor:</span>
              <span className="text-emerald-400 font-bold">{checkIn.counselorAssigned}</span>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => onAssignCounselorClick(checkIn._id)}
        disabled={checkIn.sessionStatus === 'RESOLVED' || checkIn.sessionStatus === 'SCHEDULED'}
        className={`w-full font-extrabold text-sm py-3 px-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${
          checkIn.sessionStatus === 'RESOLVED' || checkIn.sessionStatus === 'SCHEDULED'
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            : 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 shadow-teal-500/20'
        }`}
      >
        <UserCheck className="w-4 h-4" />
        {checkIn.sessionStatus === 'SCHEDULED' ? 'Counselor Scheduled' : checkIn.sessionStatus === 'RESOLVED' ? 'Self-Managed' : 'Assign Wellness Counselor'}
      </button>
    </div>
  );
};

import React from 'react';
import { Star, CheckCircle2, MessageSquare, Calendar, Github } from 'lucide-react';
import { MentorProfile } from '../../services/mentorshipEngine';

interface MentorCardProps {
    mentor: MentorProfile;
    onBookSession: (mentor: MentorProfile) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, onBookSession }) => {
    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between hover:border-indigo-500/50 transition-all">
            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-500/30 flex-shrink-0">
                        <img src={mentor.avatarUrl} alt={mentor.name} className="w-full h-full object-cover" />
                    </div>

                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-100">{mentor.name}</h3>
                            {mentor.isAvailable && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Available for 1-on-1 Mentorship" />
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{mentor.role}</p>
                        <p className="text-[11px] text-indigo-400 font-semibold">{mentor.company}</p>
                    </div>
                </div>

                {/* Rating & Stats */}
                <div className="flex items-center gap-3 text-xs bg-slate-950 p-2.5 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{mentor.rating}</span>
                    </div>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400 font-mono text-[11px]">{mentor.completedReviewsCount} Code Reviews</span>
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {mentor.expertiseTags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-bold">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={() => onBookSession(mentor)}
                disabled={!mentor.isAvailable}
                className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mt-2"
            >
                <Calendar className="w-3.5 h-3.5" />
                <span>{mentor.isAvailable ? 'Schedule 1-on-1 Review' : 'Currently Booked'}</span>
            </button>
        </div>
    );
};

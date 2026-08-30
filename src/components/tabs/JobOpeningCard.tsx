import React from 'react';
import { Briefcase, MapPin, DollarSign, ExternalLink, UserCheck, CheckCircle2 } from 'lucide-react';
import { JobOpening } from '../../services/jobBoardEngine';

interface JobCardProps {
    job: JobOpening;
    onRequestReferral: (jobId: string) => void;
}

export const JobOpeningCard: React.FC<JobCardProps> = ({ job, onRequestReferral }) => {
    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex-shrink-0">
                        <img src={job.companyLogoUrl} alt={job.company} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-indigo-400">{job.company}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400">
                                {job.postedDate}
                            </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100 truncate">{job.title}</h3>
                    </div>
                </div>

                {/* Badges Row */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 font-mono bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{job.salaryRange}</span>
                    </div>
                </div>

                {/* Referrer Info */}
                {job.referralAvailable && (
                    <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs">
                            <UserCheck className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-200">
                                Referral available by <strong className="text-amber-400">{job.referrerName}</strong>
                            </span>
                        </div>
                    </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.techStack.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
                            {t}
                        </span>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
                {job.referralAvailable && (
                    <button
                        type="button"
                        onClick={() => onRequestReferral(job.id)}
                        disabled={job.hasRequestedReferral}
                        className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            job.hasRequestedReferral
                                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                        }`}
                    >
                        {job.hasRequestedReferral ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5" /> Referral Requested
                            </>
                        ) : (
                            'Request Referral'
                        )}
                    </button>
                )}

                <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-1.5"
                >
                    <span>Direct Apply</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    );
};

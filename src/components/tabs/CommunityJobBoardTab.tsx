import React, { useState } from 'react';
import { Briefcase, Search, PlusCircle, UserCheck } from 'lucide-react';
import { MOCK_JOB_OPENINGS, JobOpening } from '../../services/jobBoardEngine';
import { JobOpeningCard } from './JobOpeningCard';

export const CommunityJobBoardTab: React.FC = () => {
    const [jobs, setJobs] = useState<JobOpening[]>(MOCK_JOB_OPENINGS);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [remoteFilter, setRemoteFilter] = useState<string>('all');
    const [showOnlyReferrals, setShowOnlyReferrals] = useState<boolean>(false);

    const handleRequestReferral = (jobId: string) => {
        setJobs(prev => prev.map(j => {
            if (j.id === jobId) {
                return { ...j, hasRequestedReferral: true };
            }
            return j;
        }));
    };

    const filteredJobs = jobs.filter(j => {
        if (showOnlyReferrals && !j.referralAvailable) return false;
        if (remoteFilter !== 'all' && j.remotePolicy !== remoteFilter) return false;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            return (
                j.title.toLowerCase().includes(query) ||
                j.company.toLowerCase().includes(query) ||
                j.techStack.some(t => t.toLowerCase().includes(query))
            );
        }
        return true;
    });

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
            {/* Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                            <Briefcase className="w-4 h-4" /> YuvaHub Tech Opportunity Network
                        </div>
                        <h1 className="text-2xl font-black text-slate-100 mt-1">Community Job Board & Employee Referrals</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => alert("Opening post job opening modal...")}
                        className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Post Tech Role
                    </button>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                        <button
                            onClick={() => { setRemoteFilter('all'); setShowOnlyReferrals(false); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                remoteFilter === 'all' && !showOnlyReferrals ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            All Roles ({jobs.length})
                        </button>
                        <button
                            onClick={() => { setRemoteFilter('Remote'); setShowOnlyReferrals(false); }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                remoteFilter === 'Remote' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Remote Only
                        </button>
                        <button
                            onClick={() => setShowOnlyReferrals(true)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                showOnlyReferrals ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-amber-300'
                            }`}
                        >
                            <UserCheck className="w-3.5 h-3.5" /> Referrals Available
                        </button>
                    </div>

                    <div className="relative w-64">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by company or role..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                    <JobOpeningCard
                        key={job.id}
                        job={job}
                        onRequestReferral={handleRequestReferral}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommunityJobBoardTab;

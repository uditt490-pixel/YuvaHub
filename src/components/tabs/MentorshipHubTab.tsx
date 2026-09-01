import React, { useState } from 'react';
import { 
    Users, 
    Code, 
    GitPullRequest, 
    Search, 
    PlusCircle, 
    CheckCircle2, 
    MessageSquare 
} from 'lucide-react';
import { 
    MOCK_MENTORS, 
    MOCK_PEER_REVIEWS, 
    MentorProfile, 
    PeerReviewRequest 
} from '../../services/mentorshipEngine';
import { MentorCard } from './MentorCard';

export const MentorshipHubTab: React.FC = () => {
    const [mentors, setMentors] = useState<MentorProfile[]>(MOCK_MENTORS);
    const [reviews, setReviews] = useState<PeerReviewRequest[]>(MOCK_PEER_REVIEWS);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeSubTab, setActiveSubTab] = useState<'mentors' | 'reviews'>('mentors');

    const filteredMentors = mentors.filter(m => 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.expertiseTags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleBookSession = (mentor: MentorProfile) => {
        alert(`Booking 1-on-1 Mentorship session with ${mentor.name}... Notification sent to mentor.`);
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
            {/* Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                            <Users className="w-4 h-4" /> YuvaHub Community Mentorship
                        </div>
                        <h1 className="text-2xl font-black text-slate-100 mt-1">Peer Code Review & Mentorship Hub</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => alert("Opening submit PR review modal...")}
                            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                        >
                            <PlusCircle className="w-4 h-4" /> Request Peer PR Review
                        </button>
                    </div>
                </div>

                {/* Sub Tab Navigation */}
                <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
                        <button
                            type="button"
                            onClick={() => setActiveSubTab('mentors')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeSubTab === 'mentors' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Active Mentors ({filteredMentors.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveSubTab('reviews')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                activeSubTab === 'reviews' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            Open Peer PR Reviews ({reviews.length})
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-64">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by skill (e.g. React)..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Tab Contents */}
            {activeSubTab === 'mentors' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredMentors.map((mentor) => (
                        <MentorCard key={mentor.id} mentor={mentor} onBookSession={handleBookSession} />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((rev) => (
                        <div key={rev.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <GitPullRequest className="w-4 h-4 text-emerald-400" />
                                    <a href={rev.prUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-100 hover:underline">
                                        {rev.repositoryName} #{rev.prNumber}
                                    </a>
                                    <span className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400">
                                        +{rev.linesChanged} lines
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400">Requested by <strong className="text-slate-200">{rev.authorName}</strong> • {rev.submittedDate}</p>
                                <div className="flex gap-1.5 pt-1">
                                    {rev.techStack.map((tech, idx) => (
                                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-bold text-indigo-400 border border-slate-800">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => alert(`Assigned to review PR #${rev.prNumber}`)}
                                className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Claim PR Review</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MentorshipHubTab;

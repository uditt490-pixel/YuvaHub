import React, { useState } from 'react';
import { Users, Search, PlusCircle, Filter } from 'lucide-react';
import { MOCK_PROJECT_TEAMS, ProjectTeamListing } from '../../services/projectTeamEngine';
import { ProjectTeamCard } from './ProjectTeamCard';

export const CommunityProjectTeamTab: React.FC = () => {
    const [teams, setTeams] = useState<ProjectTeamListing[]>(MOCK_PROJECT_TEAMS);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleApplyToTeam = (teamId: string) => {
        setTeams(prev => prev.map(team => {
            if (team.id === teamId) {
                return { ...team, hasApplied: true };
            }
            return team;
        }));
    };

    const filteredTeams = teams.filter(team => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            team.projectName.toLowerCase().includes(query) ||
            team.techStack.some(t => t.toLowerCase().includes(query)) ||
            team.openRoles.some(r => r.roleTitle.toLowerCase().includes(query))
        );
    });

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 text-slate-100 font-sans">
            {/* Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
                            <Users className="w-4 h-4" /> YuvaHub Co-Creator Matcher
                        </div>
                        <h1 className="text-2xl font-black text-slate-100 mt-1">Project Collaboration & Team Finder</h1>
                    </div>

                    <button
                        type="button"
                        onClick={() => alert("Opening post new project team modal...")}
                        className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                    >
                        <PlusCircle className="w-4 h-4" /> Post Project & Find Team
                    </button>
                </div>

                {/* Search Bar */}
                <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="text-xs text-slate-400">
                        Discover open-source teams seeking developers with your tech stack.
                    </span>

                    <div className="relative w-72">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter by role or tech (e.g. React)..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTeams.map((team) => (
                    <ProjectTeamCard
                        key={team.id}
                        team={team}
                        onApplyToTeam={handleApplyToTeam}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommunityProjectTeamTab;

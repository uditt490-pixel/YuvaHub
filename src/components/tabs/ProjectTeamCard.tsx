import React from 'react';
import { Users, Github, UserPlus, CheckCircle2, Briefcase } from 'lucide-react';
import { ProjectTeamListing } from '../../services/projectTeamEngine';

interface TeamCardProps {
    team: ProjectTeamListing;
    onApplyToTeam: (teamId: string) => void;
}

export const ProjectTeamCard: React.FC<TeamCardProps> = ({ team, onApplyToTeam }) => {
    return (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="text-base font-bold text-slate-100">{team.projectName}</h3>
                        <p className="text-xs text-indigo-400 font-semibold">{team.tagline}</p>
                    </div>

                    <a
                        href={team.githubRepoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                    >
                        <Github className="w-4 h-4" />
                    </a>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{team.description}</p>

                {/* Team Stats */}
                <div className="flex items-center gap-3 text-xs bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                        <Users className="w-3.5 h-3.5 text-teal-400" />
                        <span>Team Size: <strong className="text-slate-100">{team.teamSizeCurrent}/{team.teamSizeTarget}</strong></span>
                    </div>
                    <span className="text-slate-700">|</span>
                    <span className="text-slate-400 text-[11px]">Started by @{team.ownerName}</span>
                </div>

                {/* Open Roles */}
                <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Open Roles:</span>
                    <div className="space-y-1">
                        {team.openRoles.map((role, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
                                <span className="text-slate-200 font-medium">{role.roleTitle}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    role.isFilled ? 'bg-slate-800 text-slate-500' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                }`}>
                                    {role.isFilled ? 'Filled' : role.levelNeeded}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                    {team.techStack.map((tech, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            <button
                type="button"
                onClick={() => onApplyToTeam(team.id)}
                disabled={team.hasApplied}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 mt-2 ${
                    team.hasApplied
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                }`}
            >
                {team.hasApplied ? (
                    <>
                        <CheckCircle2 className="w-4 h-4" /> Application Submitted
                    </>
                ) : (
                    <>
                        <UserPlus className="w-4 h-4" /> Request to Join Team
                    </>
                )}
            </button>
        </div>
    );
};

import React from 'react';
import { Terminal, ExternalLink, Code, Award, User, HardDrive } from 'lucide-react';
import { PortfolioPayload } from '../../../services/portfolioService';

export const TerminalTemplate: React.FC<{ data: PortfolioPayload }> = ({ data }) => {
  const { meta, settings, projects, badges, skills } = data;
  const { visibleSections } = settings;

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-400 font-mono p-4 sm:p-8 max-w-4xl mx-auto space-y-6">
      {/* Terminal Window Frame */}
      <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/90 shadow-2xl overflow-hidden">
        {/* Title Bar */}
        <div className="bg-slate-950 px-4 py-3 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> bash -- {meta.username}@yuvahub.xyz
          </span>
          <div className="w-12" />
        </div>

        {/* Console Content */}
        <div className="p-6 space-y-6 text-xs sm:text-sm">
          {/* Banner */}
          <div className="space-y-1 text-emerald-300">
            <p className="font-extrabold text-base sm:text-lg">$ whoami</p>
            <p className="text-emerald-400 font-bold">{meta.fullName} [{meta.headline}]</p>
            {visibleSections.bio && meta.bio && (
              <p className="text-emerald-500 opacity-90 leading-relaxed">$ cat bio.txt &gt;&gt; "{meta.bio}"</p>
            )}
          </div>

          {/* Skills CLI */}
          {skills && skills.length > 0 && (
            <div className="space-y-1 border-t border-emerald-500/20 pt-4">
              <p className="font-bold text-emerald-300">$ ./list-skills.sh</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((skill: any, idx: number) => (
                  <span key={idx} className="bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded text-emerald-400 text-xs">
                    [{typeof skill === 'string' ? skill : skill.name}]
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects CLI */}
          {visibleSections.projects && projects.length > 0 && (
            <div className="space-y-2 border-t border-emerald-500/20 pt-4">
              <p className="font-bold text-emerald-300">$ ls -la ./projects</p>
              <div className="space-y-2">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-3 rounded bg-slate-950/70 border border-emerald-500/30 flex justify-between items-start gap-2">
                    <div>
                      <p className="font-bold text-emerald-300">&gt; {proj.name}</p>
                      <p className="text-xs text-emerald-500 opacity-80">{proj.description}</p>
                    </div>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noreferrer" className="text-emerald-400 hover:text-white shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges CLI */}
          {visibleSections.badges && badges.length > 0 && (
            <div className="space-y-2 border-t border-emerald-500/20 pt-4">
              <p className="font-bold text-emerald-300">$ yuvahub-cli badges --verify</p>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, idx) => (
                  <span key={idx} className="text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> {badge.title || badge}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TerminalTemplate;

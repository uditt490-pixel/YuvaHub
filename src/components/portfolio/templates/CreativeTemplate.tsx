import React from 'react';
import { ExternalLink, Sparkles, Award, Github, Linkedin, Mail, Zap, Compass } from 'lucide-react';
import { PortfolioPayload } from '../../../services/portfolioService';

export const CreativeTemplate: React.FC<{ data: PortfolioPayload }> = ({ data }) => {
  const { meta, settings, projects, badges, skills } = data;
  const { visibleSections } = settings;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 sm:p-12 max-w-6xl mx-auto space-y-12">
      {/* Creative Hero Banner */}
      <header className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900 border border-purple-500/30 shadow-2xl overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {meta.avatar && (
            <img
              src={meta.avatar}
              alt={meta.fullName}
              className="w-28 h-28 rounded-3xl border-4 border-purple-500/50 object-cover shadow-2xl"
            />
          )}
          <div className="space-y-2 text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Creative Portfolio
            </span>
            <h1 className="text-4xl sm:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
              {meta.fullName}
            </h1>
            <p className="text-lg font-bold text-slate-300">{meta.headline}</p>
          </div>
        </div>

        {visibleSections.bio && meta.bio && (
          <p className="text-sm text-slate-200 max-w-3xl leading-relaxed font-medium relative z-10">
            {meta.bio}
          </p>
        )}
      </header>

      {/* Projects Showcase */}
      {visibleSections.projects && projects.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-purple-400" /> Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-purple-500/50 hover:shadow-2xl transition duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-white group-hover:text-purple-300 transition">
                    {proj.name}
                  </h3>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-white">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Badges & Achievements */}
      {visibleSections.badges && badges.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-400" /> Verified Achievements
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-center space-y-2">
                <Award className="w-8 h-8 text-purple-400 mx-auto" />
                <span className="font-bold text-xs text-purple-200 block">{badge.title || badge}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CreativeTemplate;

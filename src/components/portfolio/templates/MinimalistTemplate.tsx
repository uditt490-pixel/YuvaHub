import React from 'react';
import { ExternalLink, Github, Linkedin, Mail, Award, Briefcase, GraduationCap, Code } from 'lucide-react';
import { PortfolioPayload } from '../../../services/portfolioService';

export const MinimalistTemplate: React.FC<{ data: PortfolioPayload }> = ({ data }) => {
  const { meta, settings, experience, education, skills, projects, badges } = data;
  const { visibleSections } = settings;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-12 max-w-5xl mx-auto space-y-12">
      {/* Header / Hero */}
      <header className="space-y-4 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-6">
          {meta.avatar && (
            <img
              src={meta.avatar}
              alt={meta.fullName}
              className="w-24 h-24 rounded-full border-2 border-indigo-500/40 object-cover shadow-xl"
            />
          )}
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white">{meta.fullName}</h1>
            <p className="text-lg font-semibold text-indigo-400 mt-1">{meta.headline}</p>
          </div>
        </div>

        {visibleSections.bio && meta.bio && (
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{meta.bio}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-2">
          {meta.socials.github && (
            <a href={meta.socials.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Github className="w-4 h-4 text-indigo-400" /> GitHub
            </a>
          )}
          {meta.socials.linkedin && (
            <a href={meta.socials.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Linkedin className="w-4 h-4 text-indigo-400" /> LinkedIn
            </a>
          )}
          {meta.socials.email && (
            <a href={`mailto:${meta.socials.email}`} className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Mail className="w-4 h-4 text-indigo-400" /> Contact
            </a>
          )}
        </div>
      </header>

      {/* Projects */}
      {visibleSections.projects && projects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" /> Featured Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{proj.name}</h3>
                  {proj.url && (
                    <a href={proj.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-snug">{proj.description}</p>
                {proj.language && (
                  <span className="inline-block text-[10px] font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full mt-2">
                    {proj.language}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience & Education */}
      {visibleSections.experience && (experience.length > 0 || education.length > 0) && (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" /> Experience & Education
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-extrabold text-slate-200">{exp.role}</h4>
                  <p className="text-slate-400">{exp.company}</p>
                </div>
                <span className="text-slate-500 font-medium">{exp.period}</span>
              </div>
            ))}
            {education.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-extrabold text-slate-200">{edu.degree}</h4>
                  <p className="text-slate-400">{edu.institution}</p>
                </div>
                <span className="text-slate-500 font-medium">{edu.year}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Badges & Achievements */}
      {visibleSections.badges && badges.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> Verified Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" /> {badge.title || badge}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MinimalistTemplate;

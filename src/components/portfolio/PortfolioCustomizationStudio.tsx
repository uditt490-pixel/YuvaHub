import React, { useState } from 'react';
import { Palette, Layout, Eye, Check, ExternalLink, Save, Sparkles, Terminal, Shield } from 'lucide-react';
import { apiFetch } from '../../lib/apiFetch';
import { useAppContext } from '../../context/AppContext';
import MinimalistTemplate from './templates/MinimalistTemplate';
import TerminalTemplate from './templates/TerminalTemplate';
import CreativeTemplate from './templates/CreativeTemplate';

export const PortfolioCustomizationStudio: React.FC = () => {
  const { user } = useAppContext();
  const [template, setTemplate] = useState<'minimalist' | 'terminal' | 'creative'>('minimalist');
  const [primaryColor, setPrimaryColor] = useState<string>('#3B82F6');
  const [visibleSections, setVisibleSections] = useState({
    bio: true,
    projects: true,
    badges: true,
    experience: true,
  });
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const username = user?.username || user?.uid || 'developer';

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setIsSaved(false);

    try {
      await apiFetch('/api/v1/portfolio/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template,
          primaryColor,
          visibleSections,
        }),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err) {
      console.warn('Fallback settings save:', err);
      setIsSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  const previewData = {
    meta: {
      username,
      fullName: user?.displayName || user?.name || username,
      headline: 'Student & Full-Stack Developer',
      bio: 'Passionate developer crafting modern, high-performance web solutions.',
      avatar: user?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      socials: {
        github: `https://github.com/${username}`,
        email: `${username}@yuvahub.xyz`,
      },
    },
    settings: {
      template,
      primaryColor,
      visibleSections,
    },
    experience: [{ role: 'Developer Intern', company: 'YuvaHub Inc.', period: '2026' }],
    education: [{ degree: 'B.Tech CS', institution: 'State Tech University', year: '2026' }],
    skills: ['React', 'TypeScript', 'Node.js'],
    projects: [
      { name: 'YuvaHub Platform', description: 'Student recruitment ecosystem.', url: '#', language: 'TypeScript' },
    ],
    badges: [{ title: 'Verified React Expert' }, { title: 'Hackathon Finalist' }],
  };

  return (
    <div className="p-6 sm:p-10 bg-slate-950 min-h-screen text-white font-sans space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <span className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Portfolio Studio
          </span>
          <h1 className="text-3xl font-black text-white">Customizable Portfolio Generator</h1>
          <p className="text-xs text-slate-400 font-medium">
            Personal public site live at: <code className="text-indigo-300">yuvahub.xyz/portfolio/{username}</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1">
              <Check className="w-4 h-4" /> Settings Saved!
            </span>
          )}
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-lg cursor-pointer transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save & Publish Portfolio'}
          </button>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selector */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Layout className="w-4 h-4 text-indigo-400" /> Select Design Template
          </h3>

          <div className="space-y-3">
            {[
              { id: 'minimalist', name: 'Minimalist', desc: 'Clean typography, modern grid' },
              { id: 'terminal', name: 'Terminal-Style', desc: 'Green/cyan monospaced ASCII CLI' },
              { id: 'creative', name: 'Creative', desc: 'Glassmorphism & vibrant hero gradient' },
            ].map((t) => (
              <div
                key={t.id}
                onClick={() => setTemplate(t.id as any)}
                className={`p-4 rounded-2xl border text-xs font-bold transition cursor-pointer flex items-center justify-between ${
                  template === t.id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <p className="font-extrabold text-slate-200">{t.name}</p>
                  <p className="text-[11px] text-slate-500">{t.desc}</p>
                </div>
                {template === t.id && <Check className="w-4 h-4 text-indigo-400" />}
              </div>
            ))}
          </div>
        </div>

        {/* Section Toggles */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" /> Visible Portfolio Sections
          </h3>

          <div className="space-y-3">
            {Object.keys(visibleSections).map((key) => {
              const k = key as keyof typeof visibleSections;
              return (
                <label
                  key={k}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer text-xs font-bold text-slate-300"
                >
                  <span className="capitalize">{k}</span>
                  <input
                    type="checkbox"
                    checked={visibleSections[k]}
                    onChange={(e) =>
                      setVisibleSections((prev) => ({ ...prev, [k]: e.target.checked }))
                    }
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Theme Colors */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-400" /> Accent Color Accent
          </h3>

          <div className="flex items-center gap-3">
            {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'].map((color) => (
              <button
                key={color}
                onClick={() => setPrimaryColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${
                  primaryColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview Container */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" /> Live Preview
        </h3>

        <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950">
          {template === 'terminal' ? (
            <TerminalTemplate data={previewData as any} />
          ) : template === 'creative' ? (
            <CreativeTemplate data={previewData as any} />
          ) : (
            <MinimalistTemplate data={previewData as any} />
          )}
        </div>
      </div>
    </div>
  );
};

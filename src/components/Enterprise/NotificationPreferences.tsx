// ─── Notification Preferences Component ───────────────────────────────────────
// Channel preferences editor with category toggles, quiet hours, digest
// frequency, and channel-specific configuration.

import React, { useState } from 'react';
import {
  Bell, Mail, MessageSquare, Smartphone, Globe, Hash, Monitor, Settings,
  Clock, Save, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Zap,
} from 'lucide-react';
import {
  ChannelPreferences, NotificationChannel, NotificationCategory,
  NotificationPriority, DigestFrequency, CategoryPreference,
} from '../../types/notifications';

interface NotificationPreferencesProps {
  preferences: ChannelPreferences[];
  onUpdate: (channel: NotificationChannel, updates: Partial<ChannelPreferences>) => void;
}

const CHANNEL_CONFIG: Record<NotificationChannel, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  EMAIL: { label: 'Email', icon: <Mail className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  SMS: { label: 'SMS', icon: <MessageSquare className="h-4 w-4" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200' },
  PUSH: { label: 'Push', icon: <Smartphone className="h-4 w-4" />, color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
  IN_APP: { label: 'In-App', icon: <Bell className="h-4 w-4" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50 border-indigo-200' },
  WEBHOOK: { label: 'Webhook', icon: <Globe className="h-4 w-4" />, color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  SLACK: { label: 'Slack', icon: <Hash className="h-4 w-4" />, color: 'text-pink-600', bgColor: 'bg-pink-50 border-pink-200' },
  TEAMS: { label: 'Teams', icon: <Monitor className="h-4 w-4" />, color: 'text-cyan-600', bgColor: 'bg-cyan-50 border-cyan-200' },
};

const DIGEST_LABELS: Record<DigestFrequency, string> = {
  REALTIME: 'Real-time (instant)',
  HOURLY: 'Hourly digest',
  DAILY: 'Daily digest',
  WEEKLY: 'Weekly digest',
  NEVER: 'Disabled',
};

const ALL_CATEGORIES: NotificationCategory[] = [
  'SECURITY_ALERT', 'BILLING_UPDATE', 'SYSTEM_STATUS', 'USER_ACTION', 'COMPLIANCE',
  'DEPLOYMENT', 'ACCESS_CHANGE', 'DATA_EXPORT', 'INCIDENT', 'MAINTENANCE',
  'FEATURE_RELEASE', 'TEAM_UPDATE',
];

const ALL_PRIORITIES: NotificationPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT'];

export const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ preferences, onUpdate }) => {
  const [expandedChannel, setExpandedChannel] = useState<NotificationChannel | null>('EMAIL');
  const [saving, setSaving] = useState<NotificationChannel | null>(null);

  const handleToggleChannel = async (channel: NotificationChannel) => {
    const pref = preferences.find(p => p.channel === channel);
    if (!pref) return;
    setSaving(channel);
    await new Promise(r => setTimeout(r, 300));
    onUpdate(channel, { enabled: !pref.enabled });
    setSaving(null);
  };

  const handleDigestChange = async (channel: NotificationChannel, freq: DigestFrequency) => {
    setSaving(channel);
    await new Promise(r => setTimeout(r, 200));
    onUpdate(channel, { digestFrequency: freq });
    setSaving(null);
  };

  const handleCategoryToggle = async (channel: NotificationChannel, category: NotificationCategory) => {
    const pref = preferences.find(p => p.channel === channel);
    if (!pref) return;
    const updatedCategories = pref.categories.map(c =>
      c.category === category ? { ...c, enabled: !c.enabled } : c
    );
    setSaving(channel);
    await new Promise(r => setTimeout(r, 150));
    onUpdate(channel, { categories: updatedCategories });
    setSaving(null);
  };

  const handleMinPriorityChange = async (channel: NotificationChannel, category: NotificationCategory, priority: NotificationPriority) => {
    const pref = preferences.find(p => p.channel === channel);
    if (!pref) return;
    const updatedCategories = pref.categories.map(c =>
      c.category === category ? { ...c, minPriority: priority } : c
    );
    setSaving(channel);
    await new Promise(r => setTimeout(r, 150));
    onUpdate(channel, { categories: updatedCategories });
    setSaving(null);
  };

  return (
    <div className="space-y-3">
      {preferences.map(pref => {
        const config = CHANNEL_CONFIG[pref.channel];
        const isExpanded = expandedChannel === pref.channel;
        const isSaving = saving === pref.channel;

        return (
          <div key={pref.channel} className={`bg-white rounded-2xl border overflow-hidden transition-all ${pref.enabled ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60'}`}>
            {/* Channel Header */}
            <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors" onClick={() => setExpandedChannel(isExpanded ? null : pref.channel)}>
              <div className={`p-2 rounded-xl border ${config.bgColor} ${config.color}`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-800">{config.label}</h4>
                <p className="text-xs text-slate-500">
                  {pref.enabled ? DIGEST_LABELS[pref.digestFrequency] : 'Disabled'}
                  {pref.enabled && ` · ${pref.categories.filter(c => c.enabled).length}/${ALL_CATEGORIES.length} categories`}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleChannel(pref.channel); }}
                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${pref.enabled ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                disabled={isSaving}
              >
                {isSaving && <div className="absolute inset-0 flex items-center justify-center"><div className="animate-spin h-3 w-3 border border-white/50 border-t-white rounded-full" /></div>}
                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all shadow-sm ${pref.enabled ? 'left-7' : 'left-1'}`} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setExpandedChannel(isExpanded ? null : pref.channel); }} className="p-1 text-slate-400">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {/* Expanded Config */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-5 animate-in slide-in-from-top-1 duration-200">
                {/* Digest Frequency */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Digest Frequency</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(DIGEST_LABELS) as DigestFrequency[]).map(freq => (
                      <button
                        key={freq}
                        onClick={() => handleDigestChange(pref.channel, freq)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                          pref.digestFrequency === freq
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {DIGEST_LABELS[freq]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Channel-Specific Config */}
                {pref.channel === 'EMAIL' && pref.emailAddress && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Email Address</span>
                    <p className="text-sm font-mono text-blue-800 mt-0.5">{pref.emailAddress}</p>
                  </div>
                )}
                {pref.channel === 'SMS' && pref.phoneNumber && (
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Phone Number</span>
                    <p className="text-sm font-mono text-emerald-800 mt-0.5">{pref.phoneNumber}</p>
                  </div>
                )}
                {pref.channel === 'WEBHOOK' && pref.webhookUrl && (
                  <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <span className="text-[10px] font-bold text-orange-600 uppercase">Webhook URL</span>
                    <p className="text-sm font-mono text-orange-800 mt-0.5 break-all">{pref.webhookUrl}</p>
                  </div>
                )}
                {pref.channel === 'SLACK' && pref.slackChannel && (
                  <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                    <span className="text-[10px] font-bold text-pink-600 uppercase">Slack Channel</span>
                    <p className="text-sm font-mono text-pink-800 mt-0.5">{pref.slackChannel}</p>
                  </div>
                )}

                {/* Quiet Hours */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> Quiet Hours
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">{pref.quietHoursStart || '22:00'}</span>
                    <span className="text-slate-400">→</span>
                    <span className="text-sm font-bold text-slate-700">{pref.quietHoursEnd || '07:00'}</span>
                    <span className="text-xs text-slate-500">({pref.quietHoursTimezone})</span>
                  </div>
                </div>

                {/* Category Preferences */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Category Overrides</label>
                  <div className="space-y-1.5">
                    {ALL_CATEGORIES.map(cat => {
                      const catPref = pref.categories.find(c => c.category === cat);
                      const isEnabled = catPref?.enabled ?? true;
                      const minPriority = catPref?.minPriority || 'LOW';

                      return (
                        <div key={cat} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isEnabled ? 'bg-slate-50 hover:bg-slate-100' : 'bg-slate-50/50'}`}>
                          <button
                            onClick={() => handleCategoryToggle(pref.channel, cat)}
                            className="shrink-0"
                          >
                            {isEnabled
                              ? <ToggleRight className="h-5 w-5 text-indigo-500" />
                              : <ToggleLeft className="h-5 w-5 text-slate-300" />
                            }
                          </button>
                          <span className={`text-xs font-bold flex-1 ${isEnabled ? 'text-slate-700' : 'text-slate-400'}`}>
                            {cat.replace(/_/g, ' ')}
                          </span>
                          {isEnabled && (
                            <select
                              value={minPriority}
                              onChange={(e) => handleMinPriorityChange(pref.channel, cat, e.target.value as NotificationPriority)}
                              className="text-[10px] font-bold bg-white border border-slate-200 rounded px-2 py-1 text-slate-600 outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {ALL_PRIORITIES.map(p => (
                                <option key={p} value={p}>Min: {p}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NotificationPreferences;

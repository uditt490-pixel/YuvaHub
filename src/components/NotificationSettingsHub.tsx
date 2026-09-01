import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Monitor, Check, Loader2, Info } from 'lucide-react';

interface Preference {
    eventType: string;
    displayName: string;
    description: string;
    channels: {
        inApp: boolean;
        email: boolean;
        push: boolean;
    };
}

/**
 * NotificationSettingsHub provides a granular, user-friendly matrix UI 
 * for managing notification preferences across different channels.
 */
export const NotificationSettingsHub: React.FC = () => {
    const [preferences, setPreferences] = useState<Preference[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        // Mock fetch
        setTimeout(() => {
            setPreferences([
                {
                    eventType: 'new_match',
                    displayName: 'New Team Matches',
                    description: 'When someone requests to join your team or you are matched.',
                    channels: { inApp: true, email: true, push: false },
                },
                {
                    eventType: 'event_reminder',
                    displayName: 'Event Reminders',
                    description: '24-hour and 1-hour reminders before registered events.',
                    channels: { inApp: true, email: true, push: true },
                },
                {
                    eventType: 'waitlist_promoted',
                    displayName: 'Waitlist Promotions',
                    description: 'When a spot opens up for an event you are waiting for.',
                    channels: { inApp: true, email: true, push: true },
                },
                {
                    eventType: 'badge_earned',
                    displayName: 'Badges & Achievements',
                    description: 'When you unlock a new reputation badge or level up.',
                    channels: { inApp: true, email: false, push: false },
                },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    const toggleChannel = (eventType: string, channel: 'inApp' | 'email' | 'push') => {
        setPreferences(prev => prev.map(pref => {
            if (pref.eventType === eventType) {
                return {
                    ...pref,
                    channels: { ...pref.channels, [channel]: !pref.channels[channel] },
                };
            }
            return pref;
        }));

        // Mock save
        setSaving(eventType);
        setTimeout(() => setSaving(null), 600);
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                Loading preferences...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center mb-8">
                <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                    <p className="text-gray-600 dark:text-gray-400">Control how and when we contact you.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 font-semibold text-sm text-gray-700 dark:text-gray-300">
                    <div className="md:col-span-1">Notification Type</div>
                    <div className="flex items-center justify-center gap-2">
                        <Monitor className="w-4 h-4" /> In-App
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Smartphone className="w-4 h-4" /> Push
                    </div>
                </div>

                {/* Preference Rows */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {preferences.map((pref) => (
                        <div key={pref.eventType} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 items-center hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <div className="md:col-span-1">
                                <h3 className="font-medium text-gray-900 dark:text-white">{pref.displayName}</h3>
                                <div className="flex items-start mt-1">
                                    <Info className="w-3.5 h-3.5 text-gray-400 mr-1.5 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{pref.description}</p>
                                </div>
                            </div>

                            {(['inApp', 'email', 'push'] as const).map((channel) => (
                                <div key={channel} className="flex justify-center">
                                    <button
                                        onClick={() => toggleChannel(pref.eventType, channel)}
                                        disabled={saving === pref.eventType}
                                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 ${pref.channels[channel]
                                                ? 'bg-blue-600'
                                                : 'bg-gray-300 dark:bg-gray-600'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform duration-200 ease-in-out mt-1 ${pref.channels[channel] ? 'translate-x-7' : 'translate-x-1'
                                                }`}
                                        />
                                        {saving === pref.eventType && (
                                            <Loader2 className="absolute inset-0 w-4 h-4 m-auto text-white animate-spin" />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Frequency Preview */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-start">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-300">Estimated Frequency</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        Based on your current settings, you will receive approximately <strong>2-4 emails</strong> and <strong>5-10 push notifications</strong> per week.
                    </p>
                </div>
            </div>
        </div>
    );
};

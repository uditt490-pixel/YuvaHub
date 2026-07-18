import React, { useState } from 'react';
import { Bell, Lock, UserX, Info } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function SettingsTab() {
  const { user, setActiveTab } = useAppContext();
  const [notiMatches, setNotiMatches] = useState(true);
  const [notiDeadlines, setNotiDeadlines] = useState(true);
  const [notiMentor, setNotiMentor] = useState(true);
  const [notiCommunity, setNotiCommunity] = useState(false);
  const [privDirectory, setPrivDirectory] = useState(true);
  const [privWins, setPrivWins] = useState(true);

  if (!user) {
    return <div className="p-12 text-center text-gray-500 dark:text-gray-400">Please sign in to access settings.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Manage your account preferences and notifications.</p>
      </div>

      <div className="space-y-6">

        {/* Email notifications */}
        <div className="clean-card p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <Bell className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
          </div>
          <div className="space-y-4">
            <ToggleOption label="New personalized matches" checked={notiMatches} onChange={setNotiMatches} />
            <ToggleOption label="Application deadlines approaching" checked={notiDeadlines} onChange={setNotiDeadlines} />
            <ToggleOption label="Mentor replies & session updates" checked={notiMentor} onChange={setNotiMentor} />
            <ToggleOption label="Community mentions" checked={notiCommunity} onChange={setNotiCommunity} />
          </div>
        </div>

        {/* Privacy */}
        <div className="clean-card p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <Lock className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy</h3>
          </div>
          <div className="space-y-4">
            <ToggleOption label="Show profile in mentor directory" checked={privDirectory} onChange={setPrivDirectory} />
            <ToggleOption label="Show wins in community feed" checked={privWins} onChange={setPrivWins} />
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">View our full policy and guidelines</span>
              <button
                onClick={() => setActiveTab('privacy')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
              >
                <span>Read Privacy Policy</span>
                <span className="text-sm">→</span>
              </button>
            </div>
          </div>
        </div>

        {/* About YuvaHub — links to the About page */}
        <div className="clean-card p-6 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <Info className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About YuvaHub</h3>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Learn about our mission, platform architecture, and the team behind YuvaHub.
            </p>
            <button
              onClick={() => setActiveTab('about')}
              className="ml-6 shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              <span>View About Page</span>
              <span className="text-sm">→</span>
            </button>
          </div>
        </div>

        {/* Account control */}
        <div className="clean-card p-6 border-red-100 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
            <UserX className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Control</h3>
          </div>
          <div className="space-y-4">
            <button className="clean-btn-outline w-full sm:w-auto px-6 py-2">Change Password</button>
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <div>
                <button className="px-6 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors">
                  Delete Account
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">This action is permanent and cannot be undone.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveTab('security')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                >
                  <span>Security Center</span>
                  <span className="text-sm">→</span>
                </button>
                <button
                  onClick={() => setActiveTab('support')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                >
                  <span>Support & Feedback</span>
                  <span className="text-sm">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function ToggleOption({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        aria-label={label}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

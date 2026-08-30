/**
 * InstallPrompt.tsx
 * "Add to Home Screen" install prompt banner.
 * Matches the project's existing AnnouncementBanner/OfflineBanner UI style.
 * - Appears when browser fires beforeinstallprompt (Android Chrome, Edge, etc.)
 * - Dismissible for the current session (sessionStorage)
 * - Uses the project's colour palette (cacao / rust / mist)
 */

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../../hooks/usePWA';

const DISMISSED_KEY = 'yuvahub-install-prompt-dismissed';

export default function InstallPrompt() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(DISMISSED_KEY) === '1') {
      setDismissed(true);
    }
  }, []);

  if (!canInstall || dismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const handleInstall = async () => {
    await promptInstall();
    handleDismiss();
  };

  return (
    <div
      role="banner"
      aria-label="Install YuvaHub app"
      className="w-full z-50 flex items-center justify-between px-4 py-2.5 sm:px-6 border-b border-border-theme bg-background text-text-primary transition-all duration-300"
    >
      <div className="flex items-center gap-3 flex-1">
        <Download className="w-4 h-4 shrink-0 text-primary-blue" aria-hidden="true" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3">
          <span className="font-semibold text-sm text-text-secondary">Install YuvaHub</span>
          <span className="text-xs text-text-muted">
            Add to your home screen for fast, offline access to saved opportunities.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        <button
          id="pwa-install-btn"
          onClick={() => void handleInstall()}
          className="px-3.5 py-1.5 text-xs font-bold bg-[#603620] text-white rounded-lg hover:bg-primary-blue transition-colors shadow-sm"
          aria-label="Install YuvaHub as app"
        >
          Install
        </button>
        <button
          id="pwa-install-dismiss-btn"
          onClick={handleDismiss}
          className="p-1.5 hover:bg-surface-secondary rounded-full transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

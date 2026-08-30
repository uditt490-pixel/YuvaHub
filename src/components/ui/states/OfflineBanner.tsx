/**
 * OfflineBanner.tsx
 *
 * Two modes:
 *  1. Controlled (existing API): pass `visible` prop from parent.
 *  2. Self-contained (new): omit `visible` — the component auto-shows
 *     based on navigator.onLine via useNetworkStatus().
 *
 * The controlled API is preserved 100% for backward compatibility.
 */

import React, { useState } from "react";
import { WifiOff, X } from "lucide-react";
import { useNetworkStatus } from "../../../hooks/usePWA";

interface OfflineBannerProps {
  /** When provided, component acts in controlled mode (existing behaviour). */
  visible?: boolean;
  onDismiss?: () => void;
  message?: string;
}

export default function OfflineBanner({
  visible,
  onDismiss,
  message,
}: OfflineBannerProps) {
  const { isOnline } = useNetworkStatus();
  const [selfDismissed, setSelfDismissed] = useState(false);

  // Controlled mode: honour the explicit `visible` prop (backward compat)
  const isControlled = visible !== undefined;
  const show = isControlled ? visible : (!isOnline && !selfDismissed);

  if (!show) return null;

  const defaultMessage = isOnline
    ? "YuvaHub is currently unable to reach the backend. Previously loaded content may still be available."
    : "You're offline. Showing your previously saved bookmarks from local storage.";

  const handleDismiss = () => {
    if (onDismiss) onDismiss();
    if (!isControlled) setSelfDismissed(true);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <div className="flex items-start gap-3">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>{message ?? defaultMessage}</p>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="rounded p-1 hover:bg-amber-100 shrink-0"
        aria-label="Dismiss offline notification"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

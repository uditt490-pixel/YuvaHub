import React from "react";
import { WifiOff, X } from "lucide-react";

interface OfflineBannerProps {
  visible: boolean;
  onDismiss?: () => void;
  message?: string;
}

export default function OfflineBanner({
  visible,
  onDismiss,
  message = "YuvaHub is currently unable to reach the backend. Previously loaded content may still be available.",
}: OfflineBannerProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-start justify-between gap-4 border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <div className="flex items-start gap-3">
        <WifiOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>{message}</p>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded p-1 hover:bg-amber-100"
          aria-label="Dismiss offline notification"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

import React from "react";
import { RefreshCw } from "lucide-react";

interface RetryButtonProps {
  onRetry: () => void;
  loading?: boolean;
  label?: string;
}

export default function RetryButton({
  onRetry,
  loading = false,
  label = "Try again",
}: RetryButtonProps) {
  return (
    <button
      type="button"
      onClick={onRetry}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw
        className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {loading ? "Retrying..." : label}
    </button>
  );
}

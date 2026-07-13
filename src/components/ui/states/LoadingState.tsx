import React from "react";
import { LoaderCircle } from "lucide-react";

interface LoadingStateProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export default function LoadingState({
  title = "Loading",
  description = "Please wait while we fetch the latest information.",
  compact = false,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center rounded-2xl border border-slate-200 bg-white ${
        compact ? "min-h-28 p-4" : "min-h-56 p-8"
      }`}
    >
      <div className="text-center">
        <LoaderCircle
          className="mx-auto mb-3 h-7 w-7 animate-spin text-blue-600"
          aria-hidden="true"
        />
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

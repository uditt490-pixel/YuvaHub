import React from "react";
import { AlertTriangle } from "lucide-react";
import RetryButton from "./RetryButton";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export default function ErrorState({
  title = "We could not load this content",
  description = "Something went wrong. Please check your connection and try again.",
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <AlertTriangle
        className="mx-auto mb-3 h-7 w-7 text-red-600"
        aria-hidden="true"
      />
      <h3 className="font-semibold text-red-950">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-red-800">
        {description}
      </p>
      {onRetry ? (
        <div className="mt-4">
          <RetryButton onRetry={onRetry} loading={retrying} />
        </div>
      ) : null}
    </div>
  );
}

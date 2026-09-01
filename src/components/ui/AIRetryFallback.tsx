import React from "react";
import { AlertTriangle, RefreshCw, Sparkles, ShieldAlert, ArrowRight, HelpCircle } from "lucide-react";

export interface AIRetryFallbackProps {
  error: string | null;
  isRetryable?: boolean;
  isRetrying?: boolean;
  retryAttempt?: number;
  maxRetries?: number;
  onRetry: () => void;
  onUseFallback?: () => void;
  title?: string;
  fallbackGuideText?: string;
}

export const AIRetryFallback: React.FC<AIRetryFallbackProps> = ({
  error,
  isRetryable = true,
  isRetrying = false,
  retryAttempt = 1,
  maxRetries = 3,
  onRetry,
  onUseFallback,
  title = "AI Service Request Failed",
  fallbackGuideText,
}) => {
  if (!error && !isRetrying) return null;

  if (isRetrying) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center space-y-4 animate-pulse">
        <div className="flex items-center justify-center gap-3 text-blue-700 font-semibold">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span>Retrying AI Request (Attempt {retryAttempt} of {maxRetries})...</span>
        </div>
        <p className="text-sm text-blue-600">
          Connecting to Google Gemini services. Please hold on while we re-establish connection...
        </p>
        <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500"
            style={{ width: `${(retryAttempt / maxRetries) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-6 space-y-5 animate-fade-in shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-amber-100 rounded-xl shrink-0 text-amber-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-base font-bold text-amber-900">{title}</h4>
          <p className="text-sm text-amber-800 leading-relaxed">{error}</p>
        </div>
      </div>

      {/* Actionable Fallback Guidance */}
      <div className="bg-surface/80 rounded-lg p-4 border border-amber-200 text-xs text-amber-900 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-amber-800">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>Actionable Guidance & Troubleshooting:</span>
        </div>
        <p className="text-amber-700 leading-normal">
          {fallbackGuideText ||
            "Transient API rate limits, 503 service overload, or network latency can temporarily disrupt AI generation. You can retry the request or switch to instant offline fallback mode to get standard recommendations immediately."}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {isRetryable && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Retry AI Request
          </button>
        )}

        {onUseFallback && (
          <button
            onClick={onUseFallback}
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface hover:bg-amber-100/50 text-amber-900 border border-amber-300 rounded-lg text-sm font-semibold transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            Use Offline Fallback Output
            <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AIRetryFallback;

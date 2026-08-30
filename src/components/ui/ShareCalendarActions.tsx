import React, { useMemo, useState } from 'react';
import {
  CalendarPlus,
  Check,
  Copy,
  Download,
  ExternalLink,
  Share2,
} from 'lucide-react';

interface ShareCalendarActionsProps {
  title: string;
  url: string;
  description?: string;
  location?: string;
  deadline?: string | null;
  onOpenFallback?: () => void;
}

type Feedback = {
  type: 'success' | 'error';
  message: string;
} | null;

function parseDeadline(deadline?: string | null): Date | null {
  if (!deadline) return null;

  const normalized = deadline.trim();

  if (
    !normalized ||
    /rolling|ongoing|not specified|tba|n\/a|open/i.test(normalized)
  ) {
    return null;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toGoogleCalendarDate(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatIcsDate(date: Date): string {
  return toGoogleCalendarDate(date);
}

export default function ShareCalendarActions({
  title,
  url,
  description = '',
  location = '',
  deadline,
  onOpenFallback,
}: ShareCalendarActionsProps) {
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [copied, setCopied] = useState(false);

  const parsedDeadline = useMemo(() => parseDeadline(deadline), [deadline]);
  const hasValidDeadline = Boolean(parsedDeadline);

  const eventDescription = useMemo(() => {
    return [description, `Opportunity link: ${url}`]
      .filter(Boolean)
      .join('\n\n');
  }, [description, url]);

  const showFeedback = (nextFeedback: Feedback) => {
    setFeedback(nextFeedback);
    window.setTimeout(() => {
      setFeedback(null);
      setCopied(false);
    }, 3000);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showFeedback({
        type: 'success',
        message: 'Opportunity link copied to your clipboard.',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Could not copy the link. Please copy it manually.',
      });

      if (onOpenFallback) {
        onOpenFallback();
      }
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title,
      text: description || `View ${title} on YuvaHub`,
      url,
    };

    if (navigator.share && (!navigator.canShare || navigator.canShare(shareData))) {
      try {
        await navigator.share(shareData);
        showFeedback({
          type: 'success',
          message: 'Opportunity shared successfully.',
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        showFeedback({
          type: 'error',
          message: 'Sharing was unavailable. Opening fallback options.',
        });
      }
    }

    if (onOpenFallback) {
      onOpenFallback();
      return;
    }

    await handleCopyLink();
  };

  const handleGoogleCalendar = () => {
    if (!parsedDeadline) {
      showFeedback({
        type: 'error',
        message: 'This opportunity does not have a valid deadline.',
      });
      return;
    }

    const endDate = new Date(parsedDeadline.getTime() + 60 * 60 * 1000);

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${toGoogleCalendarDate(parsedDeadline)}/${toGoogleCalendarDate(endDate)}`,
      details: eventDescription,
      location,
    });

    const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;

    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadIcs = () => {
    if (!parsedDeadline) {
      showFeedback({
        type: 'error',
        message: 'This opportunity does not have a valid deadline.',
      });
      return;
    }

    const endDate = new Date(parsedDeadline.getTime() + 60 * 60 * 1000);
    const now = new Date();

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//YuvaHub//Opportunity Deadline//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@yuvahub`,
      `DTSTAMP:${formatIcsDate(now)}`,
      `DTSTART:${formatIcsDate(parsedDeadline)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${escapeIcsText(title)}`,
      `DESCRIPTION:${escapeIcsText(eventDescription)}`,
      `LOCATION:${escapeIcsText(location)}`,
      `URL:${url}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], {
      type: 'text/calendar;charset=utf-8',
    });

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = objectUrl;
    anchor.download = `${title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'opportunity'}-deadline.ics`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(objectUrl);

    showFeedback({
      type: 'success',
      message: 'Calendar file downloaded successfully.',
    });
  };

  return (
    <section
      aria-label="Share and calendar actions"
      className="space-y-3"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label={`Share ${title}`}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label={`Copy link for ${title}`}
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? 'Copied' : 'Copy link'}
        </button>

        <button
          type="button"
          onClick={handleGoogleCalendar}
          disabled={!hasValidDeadline}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-surface disabled:hover:text-gray-700"
          aria-label={
            hasValidDeadline
              ? `Add ${title} deadline to Google Calendar`
              : 'Google Calendar export unavailable because no valid deadline is provided'
          }
          title={
            hasValidDeadline
              ? 'Add deadline to Google Calendar'
              : 'No valid deadline is available'
          }
        >
          <CalendarPlus className="h-4 w-4" aria-hidden="true" />
          Google Calendar
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={handleDownloadIcs}
          disabled={!hasValidDeadline}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-surface px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-surface disabled:hover:text-gray-700"
          aria-label={
            hasValidDeadline
              ? `Download calendar file for ${title}`
              : 'Calendar file unavailable because no valid deadline is provided'
          }
          title={
            hasValidDeadline
              ? 'Download calendar file'
              : 'No valid deadline is available'
          }
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download .ics
        </button>
      </div>

      {!hasValidDeadline ? (
        <p className="text-xs text-amber-700">
          Calendar export is unavailable because this opportunity has no valid
          deadline.
        </p>
      ) : null}

      <div aria-live="polite" aria-atomic="true" className="min-h-5">
        {feedback ? (
          <p
            className={`text-xs font-medium ${
              feedback.type === 'success' ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {feedback.message}
          </p>
        ) : null}
      </div>
    </section>
  );
}

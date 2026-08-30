/**
 * My Events Component
 *
 * Issue #630: QR code check-in for event attendance
 *
 * Displays user's RSVP'd events with:
 * - QR code for check-in
 * - Event details (date, time, location)
 * - Check-in status
 * - ICS download option
 */

import React, { useEffect, useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import {
  Calendar,
  MapPin,
  Clock,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  capacity: number;
  rsvpCount: number;
  userStatus: 'confirmed' | 'waitlisted' | 'cancelled' | null;
  checkedIn?: boolean;
  qrToken?: string;
}

export function MyEvents() {
  const { user } = useAppContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        if (!user?.uid) return;

        const res = await fetch(`/api/v1/events?userId=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setEvents(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user?.uid]);

  const downloadQR = (event: Event) => {
    const element = document.getElementById(`qr-${event.id}`);
    if (!element) return;

    const canvas = element.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${event.title}-checkin.png`;
    link.click();
  };

  const shareQR = async (event: Event) => {
    if (!navigator.share) {
      alert('Sharing not supported on this device');
      return;
    }

    const canvas = document.getElementById(`qr-${event.id}`)?.querySelector('canvas');
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve));
      if (!blob) return;
      await navigator.share({
        title: `${event.title} Check-In QR Code`,
        text: `Scan this QR code to check in for ${event.title}`,
        files: [new File([blob], `${event.title}-qr.png`, { type: 'image/png' })],
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-primary-blue animate-spin" />
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="text-center py-12 px-4">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">No events yet. RSVP to an event to see it here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-surface dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Event Header */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{event.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{event.description}</p>
              </div>
              <div className="flex gap-2 ml-2">
                {event.userStatus === 'confirmed' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Confirmed
                  </div>
                )}
                {event.userStatus === 'waitlisted' && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-full text-xs font-bold">
                    <AlertCircle className="w-3 h-3" />
                    Waitlisted
                  </div>
                )}
                {event.checkedIn && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    Checked In
                  </div>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {event.userStatus === 'confirmed' && event.qrToken && (
            <div
              className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              onClick={() => setExpandedEventId(expandedEventId === event.id ? null : event.id)}
            >
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-3">
                {expandedEventId === event.id ? '▼ Check-In QR Code' : '▶ Check-In QR Code'}
              </p>

              {expandedEventId === event.id && (
                <div className="flex flex-col items-center gap-4 bg-surface dark:bg-slate-800 p-4 rounded-lg">
                  {/* QR Code */}
                  <div
                    id={`qr-${event.id}`}
                    className="border-4 border-primary-blue p-2 rounded-lg"
                  >
                    <QRCode
                      value={event.qrToken}
                      size={200}
                      level="H"
                      includeMargin={true}
                      fgColor="#603620"
                      bgColor="#f6efe2"
                    />
                  </div>

                  {/* Instructions */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                    Show this QR code at the event entrance for automatic check-in
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => downloadQR(event)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-primary-blue hover:bg-[#96552a] text-white rounded-lg font-bold text-sm transition"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => shareQR(event)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg font-bold text-sm transition"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RSVP Stats */}
          <div className="p-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 text-xs">
            <p className="text-gray-600 dark:text-gray-400">
              <span className="font-bold text-primary-blue">{event.rsvpCount}</span> / {event.capacity}{' '}
              confirmed • {event.capacity - event.rsvpCount} spots available
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

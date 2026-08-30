/**
 * Event Check-In Scanner Component
 *
 * Issue #630: QR code check-in for event attendance
 *
 * - Camera-based QR code scanner (organizer-only)
 * - Real-time check-in updates
 * - Duplicate scan handling
 */

import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, CheckCircle2, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface CheckInScannerProps {
  eventId: string;
  onClose: () => void;
}

export function EventCheckInScanner({ eventId, onClose }: CheckInScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [stats, setStats] = useState({ checkedIn: 0, totalRsvps: 0 });
  const [lastScannedToken, setLastScannedToken] = useState<string>('');
  const scannedTokensRef = useRef<Set<string>>(new Set());

  // Start camera on mount
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Camera access denied. Please enable camera permissions.' });
        setScanning(false);
      }
    };

    if (scanning) {
      startCamera();
    }

    return () => {
      // Cleanup: stop all tracks
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [scanning]);

  // Poll for check-in stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/v1/events/${eventId}/checkin-stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data.data || data);
        }
      } catch (err) {
        console.error('Failed to fetch check-in stats:', err);
      }
    };

    const interval = setInterval(fetchStats, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  // Camera scanning loop with jsQR decoding
  useEffect(() => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    const scanFrame = async () => {
      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
        requestAnimationFrame(scanFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Use jsQR to decode QR codes from camera feed
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code && !scannedTokensRef.current.has(code.data)) {
        await handleQRScanned(code.data);
      }

      requestAnimationFrame(scanFrame);
    };

    scanFrame();
  }, [scanning]);

  const handleQRScanned = async (qrToken: string) => {
    if (scannedTokensRef.current.has(qrToken)) {
      setStatus({ type: 'info', message: 'This attendee was already checked in.' });
      return;
    }

    setLastScannedToken(qrToken);
    scannedTokensRef.current.add(qrToken);

    try {
      const res = await fetch(`/api/v1/events/${eventId}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrToken }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatus({
          type: 'success',
          message: `✓ Checked in: ${data.data?.attendeeName || 'Attendee'} (${data.data?.attendeeCount}/${data.data?.totalRsvps})`,
        });
        // Refresh stats
        const statsRes = await fetch(`/api/v1/events/${eventId}/checkin-stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data || statsData);
        }
      } else {
        const err = await res.json();
        setStatus({ type: 'error', message: err.error || 'Check-in failed' });
        scannedTokensRef.current.delete(qrToken);
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: 'Network error. Try again.' });
      scannedTokensRef.current.delete(qrToken);
    }

    // Clear status after 3 seconds
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-surface dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#b56b37] to-[#96552a] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-5 h-5" />
            <h2 className="font-bold">Event Check-In Scanner</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-surface/20 rounded-lg transition"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Camera Feed */}
        <div className="relative w-full bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-square object-cover"
            aria-label="Camera feed for QR scanning"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning Grid Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-emerald-400 rounded-lg opacity-50" />
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 bg-gray-50 dark:bg-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Checked In</p>
            <p className="text-2xl font-bold text-primary-blue">{stats.checkedIn}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Total RSVPs</p>
            <p className="text-2xl font-bold text-gray-700 dark:text-white">{stats.totalRsvps}</p>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`p-3 flex items-center gap-2 text-xs font-bold ${
              status.type === 'success'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : status.type === 'error'
                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 text-xs text-gray-600 dark:text-gray-400 text-center">
          Point your camera at attendee QR codes to check them in.
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 font-bold text-xs text-gray-800 dark:text-white transition"
        >
          Close Scanner
        </button>
      </div>
    </div>
  );
}

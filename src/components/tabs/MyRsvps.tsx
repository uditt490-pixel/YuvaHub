import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, QrCode, Ticket, ExternalLink, Loader2 } from 'lucide-react';
import { fetchUserRsvps } from '../../services/apiClient';
import { QRCodeSVG } from 'qrcode.react';

interface EventRsvpData {
    eventId: string;
    userId: string;
    status: string;
    waitlistPosition?: number;
    createdAt: string;
    event: {
        id: string;
        title: string;
        description: string;
        startDate: string;
        timeString: string;
        format: string;
        bannerImageUrl?: string;
    };
}

export const MyRsvps: React.FC = () => {
    const [rsvps, setRsvps] = useState<EventRsvpData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedQrEvent, setSelectedQrEvent] = useState<EventRsvpData | null>(null);

    useEffect(() => {
        const loadRsvps = async () => {
            try {
                const res = await fetchUserRsvps();
                setRsvps(res.data || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load RSVPs');
            } finally {
                setLoading(false);
            }
        };
        loadRsvps();
    }, []);

    const generateQrData = (rsvp: EventRsvpData) => {
        // Generate a 16-byte random hex string for the nonce
        const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        return `yuvahub:checkin:v1:${rsvp.userId}:${rsvp.eventId}:${nonce}`;
    };

    if (loading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-slate-400 text-sm">Loading your events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-8 text-center text-red-400 bg-red-950/20 rounded-2xl border border-red-500/20">
                {error}
            </div>
        );
    }

    if (rsvps.length === 0) {
        return (
            <div className="w-full p-12 flex flex-col items-center justify-center text-center bg-slate-900/50 rounded-3xl border border-slate-800">
                <Ticket className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-200 mb-2">No RSVPs Yet</h3>
                <p className="text-slate-400 text-sm">You haven't registered for any events. Check out the event directory!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Ticket className="w-6 h-6 text-indigo-400" />
                My Events
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rsvps.map((rsvp) => (
                    <div key={`${rsvp.eventId}_${rsvp.createdAt}`} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col hover:border-indigo-500/30 transition-all">
                        {rsvp.event.bannerImageUrl && (
                            <div className="h-32 w-full relative">
                                <img src={rsvp.event.bannerImageUrl} alt={rsvp.event.title} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                        rsvp.status === 'registered' || rsvp.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                        rsvp.status === 'waitlisted' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                        rsvp.status === 'checked_in' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                        'bg-slate-800 text-slate-400'
                                    }`}>
                                        {rsvp.status.replace('_', ' ')} {rsvp.status === 'waitlisted' && rsvp.waitlistPosition ? `#${rsvp.waitlistPosition}` : ''}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                        <div className="p-5 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                                <h3 className="font-bold text-slate-100 text-base leading-snug line-clamp-2">{rsvp.event.title}</h3>
                                
                                <div className="space-y-2 text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                        <span>{rsvp.event.startDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                                        <span>{rsvp.event.timeString}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="capitalize">{rsvp.event.format}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5">
                                {rsvp.status === 'registered' || rsvp.status === 'confirmed' ? (
                                    <button
                                        onClick={() => setSelectedQrEvent(rsvp)}
                                        className="w-full py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        <QrCode className="w-4 h-4" /> View Check-In QR
                                    </button>
                                ) : (
                                    <div className="w-full py-2.5 bg-slate-950 text-slate-500 border border-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                                        {rsvp.status === 'checked_in' ? 'Checked In' : 'QR Not Available'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* QR Code Modal */}
            {selectedQrEvent && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setSelectedQrEvent(null)}>
                    <div 
                        className="bg-surface dark:bg-slate-900 max-w-sm w-full rounded-3xl p-8 shadow-2xl relative border border-slate-800 flex flex-col items-center text-center animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="font-bold text-xl text-slate-100 mb-2 leading-tight">
                            {selectedQrEvent.event.title}
                        </h3>
                        <p className="text-slate-400 text-sm mb-8">
                            Show this QR code at the event entrance to check in.
                        </p>
                        
                        <div className="bg-surface p-4 rounded-2xl shadow-inner mb-6">
                            <QRCodeSVG 
                                value={generateQrData(selectedQrEvent)} 
                                size={200}
                                level="H"
                            />
                        </div>
                        
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full mb-6">
                            ID: {selectedQrEvent.userId.slice(-6)}
                        </p>

                        <button
                            onClick={() => setSelectedQrEvent(null)}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

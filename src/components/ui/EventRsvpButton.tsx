import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { registerForEvent, cancelEventRegistration } from '../../services/apiClient';
import { getSocketIO } from '../../api/socketInstance';

interface EventRsvpButtonProps {
    eventId: string;
    initialStatus: 'none' | 'registered' | 'waitlisted' | 'confirmed' | 'cancelled';
    initialRegisteredCount: number;
    maxCapacity?: number;
    onStatusChange?: (newStatus: string) => void;
}

export const EventRsvpButton: React.FC<EventRsvpButtonProps> = ({
    eventId,
    initialStatus,
    initialRegisteredCount,
    maxCapacity = 0, // 0 means unlimited
    onStatusChange
}) => {
    const [status, setStatus] = useState(initialStatus);
    const [registeredCount, setRegisteredCount] = useState(initialRegisteredCount);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Socket listener for live capacity updates
    useEffect(() => {
        const socket = getSocketIO();
        if (socket) {
            socket.emit('joinEventRoom', eventId);
            
            const handleUpdate = (data: { eventId: string, registeredCount: number }) => {
                if (data.eventId === eventId) {
                    setRegisteredCount(data.registeredCount);
                }
            };
            
            socket.on('event:rsvpUpdated', handleUpdate);
            
            return () => {
                socket.off('event:rsvpUpdated', handleUpdate);
                socket.emit('leaveEventRoom', eventId);
            };
        }
    }, [eventId]);

    const handleRegister = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await registerForEvent(eventId);
            setStatus(res.data?.status || 'registered');
            if (onStatusChange) onStatusChange(res.data?.status || 'registered');
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setLoading(true);
        setError(null);
        try {
            await cancelEventRegistration(eventId);
            setStatus('none');
            if (onStatusChange) onStatusChange('none');
        } catch (err: any) {
            setError(err.message || 'Failed to cancel');
        } finally {
            setLoading(false);
        }
    };

    const isFull = maxCapacity > 0 && registeredCount >= maxCapacity;
    const progressPercent = maxCapacity > 0 ? Math.min(100, Math.round((registeredCount / maxCapacity) * 100)) : 0;

    return (
        <div className="w-full flex flex-col gap-2">
            {error && (
                <div className="text-xs text-red-400 flex items-center gap-1 bg-red-950/50 p-1.5 rounded-lg">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}
            
            {maxCapacity > 0 && (
                <div className="w-full space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span>Capacity</span>
                        <span className={isFull ? 'text-amber-400' : 'text-emerald-400'}>
                            {registeredCount} / {maxCapacity}
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-500 rounded-full ${
                                isFull ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                {status === 'none' || status === 'cancelled' ? (
                    <button
                        onClick={handleRegister}
                        disabled={loading}
                        className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            isFull 
                                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/50'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isFull ? 'Join Waitlist' : 'Register Now'}
                    </button>
                ) : (
                    <>
                        <div className={`flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border ${
                            status === 'waitlisted' 
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                            {status === 'waitlisted' ? (
                                <><Clock className="w-4 h-4" /> Waitlisted</>
                            ) : (
                                <><CheckCircle2 className="w-4 h-4" /> Registered</>
                            )}
                        </div>
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/30 text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

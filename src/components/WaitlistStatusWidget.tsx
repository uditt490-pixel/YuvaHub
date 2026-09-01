import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface WaitlistStatusWidgetProps {
    eventId: string;
    userId: string;
}

/**
 * WaitlistStatusWidget displays the user's current position, estimated wait time,
 * and real-time status updates for an event waitlist.
 */
export const WaitlistStatusWidget: React.FC<WaitlistStatusWidgetProps> = ({ eventId, userId }) => {
    const [status, setStatus] = useState<'waiting' | 'promoted' | 'claimed' | 'expired' | 'loading' | 'error'>('loading');
    const [position, setPosition] = useState<number>(0);
    const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(0);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // Mock API call - replace with actual fetch
                // const res = await fetch(`/api/waitlist/${eventId}/status`, { headers: { Authorization: `Bearer ${token}` } });
                // const data = await res.json();

                // Simulated response
                const mockData = { position: 3, status: 'waiting', estimatedWaitTime: 6 };
                setPosition(mockData.position);
                setStatus(mockData.status as 'waiting' | 'promoted' | 'claimed' | 'expired' | 'loading' | 'error');
                setEstimatedWaitTime(mockData.estimatedWaitTime);
            } catch (error) {
                setStatus('error');
            }
        };

        fetchStatus();

        // Simulate Socket.io real-time update listener
        // socket.on('waitlist-updated', (data) => { ... });
    }, [eventId, userId]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading waitlist status...</span>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>Failed to load waitlist status. Please try again.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-surface dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Waitlist Status</h3>

            {status === 'claimed' ? (
                <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                    <div>
                        <p className="font-bold text-green-700 dark:text-green-400">Spot Claimed!</p>
                        <p className="text-sm text-green-600 dark:text-green-500">You are officially registered for this event.</p>
                    </div>
                </div>
            ) : status === 'promoted' ? (
                <div className="flex items-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="w-8 h-8 text-yellow-500 mr-3" />
                    <div>
                        <p className="font-bold text-yellow-700 dark:text-yellow-400">Action Required!</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-500">A spot has opened up. Check your email to claim it within 24 hours.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center">
                            <Clock className="w-6 h-6 text-blue-500 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Current Position</p>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">#{position}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Est. Wait Time</p>
                            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">~{estimatedWaitTime} hrs</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        You will be notified via email when a spot becomes available.
                    </p>
                </div>
            )}
        </div>
    );
};

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
    ThumbsUp,
    ThumbsDown,
    Clock,
    User,
    Plus,
    X,
    Loader2,
    AlertCircle
} from 'lucide-react';

interface Session {
    _id: string;
    title: string;
    description?: string;
    proposerName: string;
    tags: string[];
    upvotes: number;
    downvotes: number;
    netVotes?: number;
    status: string;
    startTime?: string;
    durationMinutes?: number;
}

interface CollaborativeAgendaBoardProps {
    eventId: string;
    userId?: string;
}

/**
 * CollaborativeAgendaBoard displays the real-time event agenda.
 * Users can propose new sessions and vote on existing ones.
 * Supports both light and dark modes via Tailwind CSS.
 */
export const CollaborativeAgendaBoard: React.FC<CollaborativeAgendaBoardProps> = ({ eventId, userId }) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Form state for proposing a session
    const [newSessionTitle, setNewSessionTitle] = useState('');
    const [newSessionDesc, setNewSessionDesc] = useState('');
    const [newSessionTags, setNewSessionTags] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Initialize Socket.io connection
        const socketUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
        socketRef.current = io(`${socketUrl}/session-voting`);
        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Connected to session voting namespace');
            socket.emit('join-event-room', { eventId });
        });

        socket.on('initial-state', (data: { sessions: Session[] }) => {
            setSessions(data.sessions);
            setLoading(false);
        });

        socket.on('session-updated', (data: { sessionId: string; upvotes: number; downvotes: number; netVotes: number }) => {
            setSessions((prev) =>
                prev.map((session) =>
                    session._id === data.sessionId
                        ? { ...session, upvotes: data.upvotes, downvotes: data.downvotes, netVotes: data.netVotes }
                        : session
                ).sort((a, b) => (b.netVotes || 0) - (a.netVotes || 0))
            );
        });

        socket.on('new-session-proposed', (data: { session: Session }) => {
            setSessions((prev) => [data.session, ...prev].sort((a, b) => (b.netVotes || 0) - (a.netVotes || 0)));
        });

        socket.on('error', (data: { message: string }) => {
            setError(data.message);
            setTimeout(() => setError(null), 3000);
        });

        return () => {
            socket.disconnect();
        };
    }, [eventId]);

    const handleVote = (sessionId: string, voteType: 'up' | 'down') => {
        if (!userId) {
            setError('Please log in to vote.');
            return;
        }
        socketRef.current?.emit('cast-vote', { sessionId, voteType, userId, eventId });
    };

    const handleProposeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSessionTitle.trim() || !newSessionDesc.trim()) return;

        setSubmitting(true);
        const tagsArray = newSessionTags.split(',').map((t) => t.trim()).filter(Boolean);

        socketRef.current?.emit('propose-session', {
            eventId,
            sessionData: {
                title: newSessionTitle,
                description: newSessionDesc,
                tags: tagsArray,
                proposerId: userId,
                proposerName: 'You', // In real app, get from user context
            },
        });

        // Reset form and close modal
        setNewSessionTitle('');
        setNewSessionDesc('');
        setNewSessionTags('');
        setSubmitting(false);
        setIsModalOpen(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading collaborative agenda...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        Collaborative Agenda
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Propose topics and vote on what you want to see at this event.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Propose Session
                </button>
            </div>

            {/* Error Toast */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-700 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Sessions List */}
            <div className="space-y-4">
                {sessions.length === 0 ? (
                    <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">No sessions proposed yet. Be the first!</p>
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session._id}
                            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                {/* Voting Column */}
                                <div className="flex md:flex-col items-center md:items-center gap-3 md:gap-1 min-w-[80px]">
                                    <button
                                        onClick={() => handleVote(session._id, 'up')}
                                        className="flex items-center gap-1 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
                                        aria-label="Upvote session"
                                    >
                                        <ThumbsUp className="w-5 h-5" />
                                        <span className="font-semibold">{session.upvotes}</span>
                                    </button>

                                    <button
                                        onClick={() => handleVote(session._id, 'down')}
                                        className="flex items-center gap-1 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                                        aria-label="Downvote session"
                                    >
                                        <ThumbsDown className="w-5 h-5" />
                                        <span className="font-semibold">{session.downvotes}</span>
                                    </button>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                            {session.title}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${session.status === 'scheduled'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {session.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                        {session.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-1.5" />
                                            <span>{session.proposerName}</span>
                                        </div>
                                        {session.durationMinutes && (
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-1.5" />
                                                <span>{session.durationMinutes} mins</span>
                                            </div>
                                        )}
                                        {session.tags.map((tag, idx) => (
                                            <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Propose Session Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Propose a Session</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleProposeSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Session Title *
                                </label>
                                <input
                                    type="text"
                                    value={newSessionTitle}
                                    onChange={(e) => setNewSessionTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g., Advanced React Patterns"
                                    required
                                    maxLength={150}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description *
                                </label>
                                <textarea
                                    value={newSessionDesc}
                                    onChange={(e) => setNewSessionDesc(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    rows={4}
                                    placeholder="Briefly describe what this session will cover..."
                                    required
                                    maxLength={1000}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tags (comma separated)
                                </label>
                                <input
                                    type="text"
                                    value={newSessionTags}
                                    onChange={(e) => setNewSessionTags(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="e.g., react, frontend, advanced"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    {submitting ? 'Proposing...' : 'Propose Session'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

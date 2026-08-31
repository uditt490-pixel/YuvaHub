import { Server as SocketIOServer, Socket } from 'socket.io';
import { EventSession } from '../models/EventSession';
import { logger } from '../utils/logger';

/**
 * Rate limiting map to prevent vote spamming.
 * Stores the last vote timestamp for each user-session pair.
 */
const voteRateLimit = new Map<string, number>();
const VOTE_COOLDOWN_MS = 5000; // 5 seconds cooldown between votes

/**
 * Initializes the Socket.io namespace for real-time session voting.
 * Handles joining event rooms, voting, and broadcasting updates.
 * 
 * @param io - The main Socket.io server instance.
 */
export const initializeSessionVotingService = (io: SocketIOServer) => {
    const sessionNamespace = io.of('/session-voting');

    sessionNamespace.on('connection', (socket: Socket) => {
        logger.info(`User connected to session voting namespace: ${socket.id}`);

        /**
         * Handles a user joining a specific event's voting room.
         * Expects payload: { eventId: string }
         */
        socket.on('join-event-room', async (data: { eventId: string }) => {
            const { eventId } = data;
            socket.join(`event-${eventId}`);
            logger.info(`Socket ${socket.id} joined room event-${eventId}`);

            try {
                // Fetch current sessions for the event to sync state on join
                const sessions = await EventSession.find({ eventId })
                    .select('title proposerName tags upvotes downvotes status startTime durationMinutes')
                    .sort({ upvotes: -1, createdAt: -1 });

                socket.emit('initial-state', { eventId, sessions });
            } catch (error) {
                logger.error(`Error fetching initial state for event ${eventId}:`, error);
                socket.emit('error', { message: 'Failed to load session data' });
            }
        });

        /**
         * Handles a user casting a vote on a session.
         * Expects payload: { sessionId: string, voteType: 'up' | 'down', userId: string }
         */
        socket.on('cast-vote', async (data: { sessionId: string; voteType: 'up' | 'down'; userId: string; eventId: string }) => {
            const { sessionId, voteType, userId, eventId } = data;
            const rateLimitKey = `${userId}-${sessionId}`;
            const now = Date.now();

            // Rate limiting check
            const lastVoteTime = voteRateLimit.get(rateLimitKey);
            if (lastVoteTime && now - lastVoteTime < VOTE_COOLDOWN_MS) {
                socket.emit('error', { message: 'Please wait a few seconds before voting again.' });
                return;
            }

            try {
                const session = await EventSession.findById(sessionId);
                if (!session) {
                    socket.emit('error', { message: 'Session not found' });
                    return;
                }

                const hasVoted = session.votedBy.includes(userId as any);

                if (voteType === 'up') {
                    if (hasVoted) {
                        session.upvotes = Math.max(0, session.upvotes - 1);
                        session.votedBy = session.votedBy.filter((id) => id.toString() !== userId);
                    } else {
                        session.upvotes += 1;
                        session.votedBy.push(userId as any);
                    }
                } else if (voteType === 'down') {
                    if (hasVoted) {
                        session.downvotes = Math.max(0, session.downvotes - 1);
                        session.votedBy = session.votedBy.filter((id) => id.toString() !== userId);
                    } else {
                        session.downvotes += 1;
                        session.votedBy.push(userId as any);
                    }
                }

                await session.save();
                voteRateLimit.set(rateLimitKey, now);

                // Broadcast the updated session to everyone in the event room
                sessionNamespace.to(`event-${eventId}`).emit('session-updated', {
                    sessionId: session._id,
                    upvotes: session.upvotes,
                    downvotes: session.downvotes,
                    netVotes: session.netVotes,
                });

            } catch (error) {
                logger.error(`Error processing vote for session ${sessionId}:`, error);
                socket.emit('error', { message: 'Failed to process vote' });
            }
        });

        /**
         * Handles a user proposing a new session.
         * Expects payload: { eventId: string, sessionData: object }
         */
        socket.on('propose-session', async (data: { eventId: string; sessionData: any }) => {
            const { eventId, sessionData } = data;
            try {
                const newSession = await EventSession.create({
                    ...sessionData,
                    eventId,
                    status: 'proposed',
                });

                // Broadcast new session proposal to the room
                sessionNamespace.to(`event-${eventId}`).emit('new-session-proposed', {
                    session: {
                        _id: newSession._id,
                        title: newSession.title,
                        proposerName: newSession.proposerName,
                        tags: newSession.tags,
                        upvotes: newSession.upvotes,
                        downvotes: newSession.downvotes,
                        status: newSession.status,
                    },
                });

                socket.emit('success', { message: 'Session proposed successfully!' });
            } catch (error) {
                logger.error(`Error proposing session for event ${eventId}:`, error);
                socket.emit('error', { message: 'Failed to propose session' });
            }
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected from session voting: ${socket.id}`);
        });
    });
};

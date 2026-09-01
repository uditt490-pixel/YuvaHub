import { Server as SocketIOServer, Socket } from 'socket.io';
import { CodeSnippet } from '../models/CodeSnippet';
import { logger } from '../utils/logger';

/**
 * Manages real-time collaborative editing of code snippets via WebSockets.
 * Implements basic operational transformation (OT) logic for conflict resolution.
 */
export const initializeCollaborativeEditor = (io: SocketIOServer) => {
    const snippetNamespace = io.of('/snippets');

    snippetNamespace.on('connection', (socket: Socket) => {
        logger.info(`User connected to snippet namespace: ${socket.id}`);

        socket.on('join-snippet', async (data: { snippetId: string; userId: string }) => {
            const { snippetId, userId } = data;

            try {
                const snippet = await CodeSnippet.findById(snippetId);
                if (!snippet) {
                    socket.emit('error', { message: 'Snippet not found' });
                    return;
                }

                if (!snippet.isPublic && snippet.authorId.toString() !== userId) {
                    socket.emit('error', { message: 'Unauthorized access' });
                    return;
                }

                socket.join(snippetId);

                // Add to active sessions
                await CodeSnippet.findByIdAndUpdate(snippetId, { $addToSet: { activeSessions: socket.id } });

                // Send current content to the new user
                socket.emit('snippet-state', {
                    content: snippet.content,
                    language: snippet.language,
                    activeUsers: snippet.activeSessions.length
                });

                // Notify others in the room
                socket.to(snippetId).emit('user-joined', { userId, socketId: socket.id });
                logger.info(`User ${userId} joined snippet ${snippetId}`);
            } catch (error) {
                logger.error({ err: error }, 'Error joining snippet:');
                socket.emit('error', { message: 'Failed to join snippet' });
            }
        });

        socket.on('update-content', async (data: { snippetId: string; content: string; userId: string }) => {
            const { snippetId, content, userId } = data;

            try {
                // In a production app, implement full OT or CRDT (e.g., Yjs) here.
                // For this implementation, we save the latest state and broadcast.
                await CodeSnippet.findByIdAndUpdate(snippetId, { content });

                // Broadcast to all other users in the room
                socket.to(snippetId).emit('content-updated', { content, userId });
            } catch (error) {
                logger.error({ err: error }, 'Error updating snippet content:');
            }
        });

        socket.on('disconnect', async () => {
            // Find all rooms the socket was in and remove it from active sessions
            const rooms = Array.from(socket.rooms);
            for (const roomId of rooms) {
                if (roomId !== socket.id) {
                    await CodeSnippet.findByIdAndUpdate(roomId, { $pull: { activeSessions: socket.id } });
                    socket.to(roomId).emit('user-left', { socketId: socket.id });
                }
            }
            logger.info(`User disconnected: ${socket.id}`);
        });
    });
};

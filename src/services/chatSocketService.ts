import { Server as SocketIOServer, Socket } from 'socket.io';
import { DirectMessage } from '../models/DirectMessage';
import { logger } from '../utils/logger';

/**
 * Generates a consistent conversation ID from two user IDs.
 * Ensures that the conversation ID is the same regardless of who initiates.
 * 
 * @param userId1 - First user ID.
 * @param userId2 - Second user ID.
 * @returns A sorted, hyphenated string of the two IDs.
 */
export const getConversationId = (userId1: string, userId2: string): string => {
    return [userId1, userId2].sort().join('-');
};

/**
 * Initializes the Socket.io namespace for secure peer-to-peer messaging.
 * Handles room management, message relaying, and read receipts.
 * 
 * @param io - The main Socket.io server instance.
 */
export const initializeChatSocketService = (io: SocketIOServer) => {
    const chatNamespace = io.of('/secure-chat');

    chatNamespace.on('connection', (socket: Socket) => {
        const userId = socket.handshake.auth.userId;
        if (!userId) {
            socket.disconnect();
            return;
        }

        logger.info(`User connected to secure chat: ${userId} (Socket: ${socket.id})`);

        // Join a personal room to receive direct messages
        socket.join(`user-${userId}`);

        /**
         * Handles sending a new encrypted message.
         * Expects payload: { receiverId, encryptedContent, iv, attachmentUrl?, attachmentName? }
         */
        socket.on('send-message', async (data: any) => {
            const { receiverId, encryptedContent, iv, attachmentUrl, attachmentName } = data;
            const conversationId = getConversationId(userId, receiverId);

            try {
                // Save the encrypted payload to the database (blind relay)
                const newMessage = await DirectMessage.create({
                    conversationId,
                    senderId: userId,
                    receiverId,
                    encryptedContent,
                    iv,
                    attachmentUrl,
                    attachmentName,
                    isRead: false,
                });

                // Emit to the receiver's personal room
                chatNamespace.to(`user-${receiverId}`).emit('receive-message', {
                    messageId: newMessage._id,
                    senderId: userId,
                    conversationId,
                    encryptedContent,
                    iv,
                    attachmentUrl,
                    attachmentName,
                    createdAt: newMessage.createdAt,
                });

                // Acknowledge sender
                socket.emit('message-sent', { messageId: newMessage._id, status: 'delivered' });
            } catch (error) {
                logger.error({ error }, `Error sending message from ${userId} to ${receiverId}:`);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        /**
         * Handles marking a message or conversation as read.
         */
        socket.on('mark-read', async (data: { conversationId: string; senderId: string }) => {
            const { conversationId, senderId } = data;

            try {
                await DirectMessage.updateMany(
                    { conversationId, senderId, receiverId: userId, isRead: false },
                    { isRead: true }
                );

                // Notify the sender that their messages were read
                chatNamespace.to(`user-${senderId}`).emit('messages-read', {
                    conversationId,
                    readerId: userId,
                });
            } catch (error) {
                logger.error({ error }, `Error marking messages as read for ${userId}:`);
            }
        });

        socket.on('disconnect', () => {
            logger.info(`User disconnected from secure chat: ${userId}`);
        });
    });
};

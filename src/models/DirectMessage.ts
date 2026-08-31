import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Interface representing an encrypted direct message.
 * Note: The 'content' field stores the encrypted payload, not plain text.
 */
export interface IDirectMessage extends Document {
    conversationId: string; // Derived from sorted participant IDs
    senderId: Types.ObjectId;
    receiverId: Types.ObjectId;
    encryptedContent: string;
    iv: string; // Initialization vector for AES decryption
    attachmentUrl?: string;
    attachmentName?: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose schema for DirectMessage.
 * Designed to act as a blind relay, storing only cryptographic material.
 */
const directMessageSchema = new Schema<IDirectMessage>(
    {
        conversationId: {
            type: String,
            required: true,
            index: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        receiverId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        encryptedContent: {
            type: String,
            required: true,
        },
        iv: {
            type: String,
            required: true,
        },
        attachmentUrl: {
            type: String,
            required: false,
        },
        attachmentName: {
            type: String,
            required: false,
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for fetching conversation history efficiently
directMessageSchema.index({ conversationId: 1, createdAt: -1 });

export const DirectMessage = mongoose.model<IDirectMessage>('DirectMessage', directMessageSchema);

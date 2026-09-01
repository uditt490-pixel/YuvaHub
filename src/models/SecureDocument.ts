import mongoose, { Schema, Document } from 'mongoose';

export interface ISecureDocument extends Document {
    userId: mongoose.Types.ObjectId;
    originalFileName: string;
    storageUrl: string;
    redactedStorageUrl?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    redactionLog: {
        field: string;
        originalLength: number;
        redacted: boolean;
    }[];
    accessLevel: 'private' | 'shared';
    shareToken?: string;
    shareExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const secureDocumentSchema = new Schema<ISecureDocument>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        originalFileName: { type: String, required: true },
        storageUrl: { type: String, required: true },
        redactedStorageUrl: { type: String },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
            index: true
        },
        redactionLog: [
            {
                field: { type: String, required: true },
                originalLength: { type: Number, required: true },
                redacted: { type: Boolean, default: true },
            },
        ],
        accessLevel: { type: String, enum: ['private', 'shared'], default: 'private' },
        shareToken: { type: String, sparse: true },
        shareExpiresAt: { type: Date },
    },
    { timestamps: true }
);

export const SecureDocument = mongoose.model<ISecureDocument>('SecureDocument', secureDocumentSchema);

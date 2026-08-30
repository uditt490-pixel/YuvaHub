import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface representing a user's position in an event waitlist.
 */
export interface IEventWaitlist extends Document {
    eventId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    position: number;
    status: 'waiting' | 'promoted' | 'claimed' | 'expired';
    claimToken?: string;
    claimExpiresAt?: Date;
    notifiedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const eventWaitlistSchema = new Schema<IEventWaitlist>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
            index: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        position: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['waiting', 'promoted', 'claimed', 'expired'],
            default: 'waiting',
            index: true
        },
        claimToken: {
            type: String,
            sparse: true
        },
        claimExpiresAt: {
            type: Date
        },
        notifiedAt: {
            type: Date
        },
    },
    { timestamps: true }
);

// Compound index to quickly find the next waiting user for a specific event
eventWaitlistSchema.index({ eventId: 1, status: 1, position: 1 });

export const EventWaitlist = mongoose.model<IEventWaitlist>('EventWaitlist', eventWaitlistSchema);

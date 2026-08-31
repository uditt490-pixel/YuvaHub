import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Interface representing a collaborative event session in the agenda.
 * Tracks proposer details, real-time vote counts, and session metadata.
 */
export interface IEventSession extends Document {
    eventId: Types.ObjectId;
    title: string;
    description: string;
    proposerId: Types.ObjectId;
    proposerName: string;
    tags: string[];
    startTime: Date;
    durationMinutes: number;
    upvotes: number;
    downvotes: number;
    votedBy: Types.ObjectId[];
    status: 'proposed' | 'approved' | 'rejected' | 'scheduled';
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose schema for EventSession.
 * Includes indexes for efficient querying of sessions by event and sorting by votes.
 */
const eventSessionSchema = new Schema<IEventSession>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        proposerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        proposerName: {
            type: String,
            required: true,
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
            validate: {
                validator: (v: string[]) => v.length <= 5,
                message: 'A session can have a maximum of 5 tags.',
            },
        },
        startTime: {
            type: Date,
            required: false, // Optional for proposed sessions
        },
        durationMinutes: {
            type: Number,
            required: false,
            min: 15,
            max: 180,
        },
        upvotes: {
            type: Number,
            default: 0,
            min: 0,
        },
        downvotes: {
            type: Number,
            default: 0,
            min: 0,
        },
        votedBy: {
            type: [Schema.Types.ObjectId],
            ref: 'User',
            default: [],
        },
        status: {
            type: String,
            enum: ['proposed', 'approved', 'rejected', 'scheduled'],
            default: 'proposed',
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to quickly fetch and sort sessions by votes for a specific event
eventSessionSchema.index({ eventId: 1, upvotes: -1, createdAt: -1 });

// Virtual to calculate net votes
eventSessionSchema.virtual('netVotes').get(function (this: IEventSession) {
    return this.upvotes - this.downvotes;
});

export const EventSession = mongoose.model<IEventSession>('EventSession', eventSessionSchema);

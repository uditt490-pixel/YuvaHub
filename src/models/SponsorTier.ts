import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface representing a sponsor and their dynamic engagement metrics.
 */
export interface ISponsorTier extends Document {
    name: string;
    logoUrl: string;
    websiteUrl: string;
    currentTier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    engagementScore: number;
    resourcesProvided: number;
    boothVisits: number;
    lastUpdated: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose schema for SponsorTier.
 * Tracks both static sponsor details and dynamic engagement metrics.
 */
const sponsorTierSchema = new Schema<ISponsorTier>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        logoUrl: {
            type: String,
            required: true,
        },
        websiteUrl: {
            type: String,
            required: true,
        },
        currentTier: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
            default: 'bronze',
            index: true,
        },
        engagementScore: {
            type: Number,
            default: 0,
            min: 0,
            index: true,
        },
        resourcesProvided: {
            type: Number,
            default: 0,
            min: 0,
        },
        boothVisits: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast leaderboard sorting
sponsorTierSchema.index({ engagementScore: -1, currentTier: 1 });

export const SponsorTier = mongoose.model<ISponsorTier>('SponsorTier', sponsorTierSchema);

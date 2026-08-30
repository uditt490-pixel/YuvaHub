import mongoose, { Schema, Document } from 'mongoose';

export interface IOpportunity extends Document {
    title: string;
    company: string;
    description: string;
    source: string;
    url: string;
    canonicalId: string;
    sourceLinks: { source: string; url: string }[];
    normalizedStipend: {
        currency: string;
        min: number;
        max: number;
        interval: string;
    };
    embedding: number[];
    status: 'active' | 'expired' | 'removed';
    createdAt: Date;
    updatedAt: Date;
}

const opportunitySchema = new Schema<IOpportunity>(
    {
        title: { type: String, required: true, index: true },
        company: { type: String, required: true },
        description: { type: String, required: true },
        source: { type: String, required: true },
        url: { type: String, required: true, unique: true },
        canonicalId: { type: String, required: true, index: true },
        sourceLinks: [
            {
                source: { type: String, required: true },
                url: { type: String, required: true },
            },
        ],
        normalizedStipend: {
            currency: { type: String, default: 'UNKNOWN' },
            min: { type: Number, default: 0 },
            max: { type: Number, default: 0 },
            interval: { type: String, default: 'UNKNOWN' },
        },
        embedding: { type: [Number], default: [] },
        status: { type: String, enum: ['active', 'expired', 'removed'], default: 'active' },
    },
    { timestamps: true }
);

// Index for efficient stipend filtering
opportunitySchema.index({ 'normalizedStipend.min': 1, 'normalizedStipend.max': 1 });
opportunitySchema.index({ status: 1, createdAt: -1 });

export const Opportunity = mongoose.model<IOpportunity>('Opportunity', opportunitySchema);

import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Interface representing a report of potentially plagiarized or duplicate content.
 */
export interface IContentSimilarityReport extends Document {
    postId: Types.ObjectId;
    contentType: 'forum_post' | 'opportunity' | 'comment';
    similarityScore: number;
    matchedSourceId: Types.ObjectId | null;
    matchedSourceText: string;
    status: 'pending' | 'reviewed' | 'cleared' | 'rejected';
    reviewedBy?: Types.ObjectId;
    reviewNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose schema for ContentSimilarityReport.
 */
const contentSimilarityReportSchema = new Schema<IContentSimilarityReport>(
    {
        postId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        contentType: {
            type: String,
            enum: ['forum_post', 'opportunity', 'comment'],
            required: true,
        },
        similarityScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        matchedSourceId: {
            type: Schema.Types.ObjectId,
            required: false,
            refPath: 'contentType',
        },
        matchedSourceText: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'reviewed', 'cleared', 'rejected'],
            default: 'pending',
            index: true,
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        reviewNotes: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

// Index for moderators to quickly find pending reports
contentSimilarityReportSchema.index({ status: 1, createdAt: -1 });

export const ContentSimilarityReport = mongoose.model<IContentSimilarityReport>(
    'ContentSimilarityReport',
    contentSimilarityReportSchema
);

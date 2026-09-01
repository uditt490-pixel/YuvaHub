import mongoose, { Schema, Document } from 'mongoose';

export interface IReputationLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    pointsAwarded: number;
    description: string;
    createdAt: Date;
}

const reputationLogSchema = new Schema<IReputationLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        action: { type: String, required: true },
        pointsAwarded: { type: Number, required: true },
        description: { type: String, required: true },
    },
    { timestamps: true }
);

// Index for fast querying of user-specific logs
reputationLogSchema.index({ userId: 1, createdAt: -1 });

export const ReputationLog = mongoose.model<IReputationLog>('ReputationLog', reputationLogSchema);

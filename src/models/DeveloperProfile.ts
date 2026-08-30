import mongoose, { Schema, Document } from 'mongoose';

export interface IDeveloperProfile extends Document {
    userId: mongoose.Types.ObjectId;
    githubUsername: string;
    leetcodeUsername: string;
    githubStats: {
        totalCommits: number;
        topLanguages: { name: string; percentage: number }[];
        contributionGraph: { date: string; count: number }[];
    };
    leetcodeStats: {
        totalSolved: number;
        easySolved: number;
        mediumSolved: number;
        hardSolved: number;
        ranking: number;
    };
    lastSyncedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const developerProfileSchema = new Schema<IDeveloperProfile>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        githubUsername: { type: String, sparse: true },
        leetcodeUsername: { type: String, sparse: true },
        githubStats: {
            totalCommits: { type: Number, default: 0 },
            topLanguages: [{ name: String, percentage: Number }],
            contributionGraph: [{ date: String, count: Number }],
        },
        leetcodeStats: {
            totalSolved: { type: Number, default: 0 },
            easySolved: { type: Number, default: 0 },
            mediumSolved: { type: Number, default: 0 },
            hardSolved: { type: Number, default: 0 },
            ranking: { type: Number, default: 0 },
        },
        lastSyncedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const DeveloperProfile = mongoose.model<IDeveloperProfile>('DeveloperProfile', developerProfileSchema);

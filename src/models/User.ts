import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    reputation_score: number;
    badges: string[];
    level: number;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String },

        // --- GAMIFICATION FIELDS ADDED HERE ---
        reputation_score: { type: Number, default: 0, min: 0 },
        badges: { type: [String], default: [] },
        level: { type: Number, default: 1, min: 1 },
        // --------------------------------------

    },
    { timestamps: true }
);

// Pre-save hook to calculate level based on reputation score
userSchema.pre('save', function () {
    if (this.isModified('reputation_score')) {
        // Simple leveling formula: Level = floor(sqrt(reputation_score / 100)) + 1
        this.level = Math.floor(Math.sqrt(this.reputation_score / 100)) + 1;

        // Badge assignment logic
        const newBadges = [];
        if (this.reputation_score >= 100) newBadges.push('Novice');
        if (this.reputation_score >= 500) newBadges.push('Contributor');
        if (this.reputation_score >= 1000) newBadges.push('Expert');
        if (this.reputation_score >= 5000) newBadges.push('Legend');

        // Merge with existing badges without duplicates
        this.badges = Array.from(new Set([...this.badges, ...newBadges]));
    }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

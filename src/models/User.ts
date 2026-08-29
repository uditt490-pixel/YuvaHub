import mongoose, { Schema, Document } from 'mongoose';

export interface PortfolioSettings {
    template: 'minimalist' | 'terminal' | 'creative';
    primaryColor: string;
    visibleSections: {
        bio: boolean;
        projects: boolean;
        badges: boolean;
        experience: boolean;
    };
}

export interface IUser extends Document {
    username: string;
    name: string;
    email: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    bio?: string;
    avatarUrl?: string;
    githubUsername?: string;
    linkedinUrl?: string;
    publicEmail?: string;
    reputation_score: number;
    level: number;
    badges: string[];
    experience?: any[];
    education?: any[];
    skills?: any[];
    projects?: any[];
    portfolioSettings?: PortfolioSettings;
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        firstName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        headline: { type: String, default: 'Student & Developer' },
        bio: { type: String, default: '' },
        avatarUrl: { type: String, default: '' },
        githubUsername: { type: String, default: '' },
        linkedinUrl: { type: String, default: '' },
        publicEmail: { type: String, default: '' },
        reputation_score: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        badges: { type: [String], default: [] },
        experience: [Schema.Types.Mixed],
        education: [Schema.Types.Mixed],
        skills: [Schema.Types.Mixed],
        projects: [Schema.Types.Mixed],
        portfolioSettings: {
            template: {
                type: String,
                enum: ['minimalist', 'terminal', 'creative'],
                default: 'minimalist',
            },
            primaryColor: {
                type: String,
                default: '#3B82F6',
            },
            visibleSections: {
                bio: { type: Boolean, default: true },
                projects: { type: Boolean, default: true },
                badges: { type: Boolean, default: true },
                experience: { type: Boolean, default: true },
            },
        },
    },
    { timestamps: true }
);

// Pre-save hook to calculate level based on reputation score
userSchema.pre('save', function (this: any) {
    if (this.isModified && this.isModified('reputation_score')) {
        this.level = Math.floor(Math.sqrt((this.reputation_score || 0) / 100)) + 1;

        const newBadges: string[] = [];
        if (this.reputation_score >= 100) newBadges.push('Novice');
        if (this.reputation_score >= 500) newBadges.push('Contributor');
        if (this.reputation_score >= 1000) newBadges.push('Expert');
        if (this.reputation_score >= 5000) newBadges.push('Legend');

        this.badges = Array.from(new Set([...(this.badges || []), ...newBadges]));
    }
});

export const User = mongoose.model<IUser>('User', userSchema);

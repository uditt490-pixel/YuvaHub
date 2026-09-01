import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditReport extends Document {
    contentId: mongoose.Types.ObjectId;
    contentType: 'event' | 'forum_post' | 'opportunity';
    accessibilityScore: number;
    seoScore: number;
    issues: {
        type: 'accessibility' | 'seo';
        severity: 'low' | 'medium' | 'high';
        description: string;
        suggestion: string;
        resolved: boolean;
    }[];
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const auditIssueSchema = new Schema({
    type: { type: String, enum: ['accessibility', 'seo'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high'], required: true },
    description: { type: String, required: true },
    suggestion: { type: String, required: true },
    resolved: { type: Boolean, default: false },
});

const auditReportSchema = new Schema<IAuditReport>(
    {
        contentId: { type: Schema.Types.ObjectId, required: true, index: true },
        contentType: { type: String, enum: ['event', 'forum_post', 'opportunity'], required: true },
        accessibilityScore: { type: Number, default: 0 },
        seoScore: { type: Number, default: 0 },
        issues: { type: [auditIssueSchema], default: [] },
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    },
    { timestamps: true }
);

// Compound index for fetching reports by content
auditReportSchema.index({ contentId: 1, contentType: 1 });

export const AuditReport = mongoose.model<IAuditReport>('AuditReport', auditReportSchema);

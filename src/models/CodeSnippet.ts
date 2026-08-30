import mongoose, { Schema, Document } from 'mongoose';

export interface ICodeSnippet extends Document {
    title: string;
    content: string;
    language: string;
    authorId: mongoose.Types.ObjectId;
    isPublic: boolean;
    activeSessions: string[]; // Socket IDs of currently connected users
    createdAt: Date;
    updatedAt: Date;
}

const codeSnippetSchema = new Schema<ICodeSnippet>(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true, default: '// Start coding...' },
        language: { type: String, required: true, default: 'javascript' },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        isPublic: { type: Boolean, default: false, index: true },
        activeSessions: { type: [String], default: [] },
    },
    { timestamps: true }
);

// Index for fast public snippet retrieval
codeSnippetSchema.index({ isPublic: 1, createdAt: -1 });

export const CodeSnippet = mongoose.model<ICodeSnippet>('CodeSnippet', codeSnippetSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IRoadmapNode extends Document {
    id: string;
    title: string;
    description: string;
    status: 'locked' | 'in-progress' | 'completed';
    resources: string[];
}

export interface IRoadmap extends Document {
    userId: mongoose.Types.ObjectId;
    targetRole: string;
    nodes: IRoadmapNode[];
    createdAt: Date;
    updatedAt: Date;
}

const roadmapNodeSchema = new Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['locked', 'in-progress', 'completed'], default: 'locked' },
    resources: { type: [String], default: [] },
});

const roadmapSchema = new Schema<IRoadmap>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        targetRole: { type: String, required: true },
        nodes: { type: [roadmapNodeSchema], required: true },
    },
    { timestamps: true }
);

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', roadmapSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  updatedBy?: string;
}

export interface ISelectedIdea {
  title: string;
  description: string;
  techStack: string[];
}

export interface ITeamWorkspace extends Document {
  hackathonId: mongoose.Types.ObjectId | string;
  teamId: string;
  members: (mongoose.Types.ObjectId | string)[];
  selectedIdea?: ISelectedIdea;
  checklist: IChecklistItem[];
  notepad: string;
  createdAt: Date;
  updatedAt: Date;
}

const TeamWorkspaceSchema = new Schema<ITeamWorkspace>({
  hackathonId: { type: Schema.Types.Mixed, required: true },
  teamId: { type: String, required: true, unique: true },
  members: [{ type: Schema.Types.Mixed }],
  selectedIdea: {
    title: String,
    description: String,
    techStack: [String]
  },
  checklist: [{
    id: { type: String, required: true },
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.Mixed }
  }],
  notepad: { type: String, default: '' }
}, { timestamps: true });

export const TeamWorkspace = mongoose.models.TeamWorkspace || mongoose.model<ITeamWorkspace>('TeamWorkspace', TeamWorkspaceSchema);

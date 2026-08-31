import mongoose from 'mongoose';

const TeamWorkspaceSchema = new mongoose.Schema({
  hackathonId: { type: mongoose.Schema.Types.Mixed, required: true },
  teamId: { type: String, required: true, unique: true },
  members: [{ type: mongoose.Schema.Types.Mixed }],
  selectedIdea: {
    title: String,
    description: String,
    techStack: [String]
  },
  checklist: [{
    id: { type: String, required: true },
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.Mixed }
  }],
  notepad: { type: String, default: '' }
}, { timestamps: true });

const TeamWorkspace = mongoose.models.TeamWorkspace || mongoose.model('TeamWorkspace', TeamWorkspaceSchema);

export default TeamWorkspace;
export { TeamWorkspace };

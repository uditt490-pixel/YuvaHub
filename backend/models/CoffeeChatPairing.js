import mongoose from 'mongoose';

const CoffeeChatPairingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.Mixed, ref: 'User', required: true, index: true },
  mentorId: { type: mongoose.Schema.Types.Mixed, ref: 'User', required: true, index: true },
  industry: { type: String, required: true },
  matchedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['MATCHED', 'COMPLETED', 'CANCELLED'], default: 'MATCHED' },
  studentFeedbackScore: { type: Number, min: 1, max: 5 },
  mentorFeedbackScore: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

// Compound index to quickly parse past interaction constraints
CoffeeChatPairingSchema.index({ studentId: 1, mentorId: 1 });

const CoffeeChatPairing = mongoose.models.CoffeeChatPairing || mongoose.model('CoffeeChatPairing', CoffeeChatPairingSchema);

export default CoffeeChatPairing;
export { CoffeeChatPairing };

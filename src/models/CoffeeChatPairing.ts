import mongoose, { Schema, Document } from 'mongoose';

export interface ICoffeeChatPairing extends Document {
  studentId: mongoose.Types.ObjectId | string;
  mentorId: mongoose.Types.ObjectId | string;
  industry: string;
  matchedAt: Date;
  status: 'MATCHED' | 'COMPLETED' | 'CANCELLED';
  studentFeedbackScore?: number;
  mentorFeedbackScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CoffeeChatPairingSchema = new Schema<ICoffeeChatPairing>({
  studentId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
  mentorId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
  industry: { type: String, required: true },
  matchedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['MATCHED', 'COMPLETED', 'CANCELLED'], default: 'MATCHED' },
  studentFeedbackScore: { type: Number, min: 1, max: 5 },
  mentorFeedbackScore: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

CoffeeChatPairingSchema.index({ studentId: 1, mentorId: 1 });

export const CoffeeChatPairing = mongoose.models.CoffeeChatPairing || mongoose.model<ICoffeeChatPairing>('CoffeeChatPairing', CoffeeChatPairingSchema);

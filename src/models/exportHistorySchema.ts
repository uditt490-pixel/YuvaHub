import mongoose, { Schema, Document } from 'mongoose';

export interface IExportHistory extends Document {
  userId: string;
  format: 'pdf' | 'csv' | 'json';
  sections: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileUrl?: string;
  errorMessage?: string;
  requestedAt: Date;
  completedAt?: Date;
}

const exportHistorySchema = new Schema<IExportHistory>(
  {
    userId: { type: String, required: true, index: true },
    format: { type: String, enum: ['pdf', 'csv', 'json'], required: true },
    sections: { type: [String], required: true },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'completed', 'failed'], 
      default: 'pending' 
    },
    fileUrl: { type: String },
    errorMessage: { type: String },
    requestedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

export const ExportHistory = mongoose.models.ExportHistory || mongoose.model<IExportHistory>('ExportHistory', exportHistorySchema);

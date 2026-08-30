import { Schema, model, Document } from 'mongoose';

export interface IScholarship extends Document {
  title: string;
  provider: string;
  amount: number;
  maxFamilyIncome?: number;
  requiredCGPA?: number;
  genderRestriction?: 'Male' | 'Female' | 'Any';
  eligibleCategories?: string[];
  createdAt: Date;
}

const ScholarshipSchema = new Schema<IScholarship>(
  {
    title: { type: String, required: true },
    provider: { type: String, required: true },
    amount: { type: Number, required: true },
    maxFamilyIncome: { type: Number },
    requiredCGPA: { type: Number },
    genderRestriction: { type: String, enum: ['Male', 'Female', 'Any'], default: 'Any' },
    eligibleCategories: [{ type: String }],
  },
  { timestamps: true }
);

export const Scholarship = model<IScholarship>('Scholarship', ScholarshipSchema);

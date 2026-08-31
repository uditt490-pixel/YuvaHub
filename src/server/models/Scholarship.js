import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  provider: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: String, required: true },
  deadline: { type: Date, required: true },
  
  // Strict Pre-Screener Criteria Fields
  criteria: {
    maxFamilyIncome: { type: Number, required: true }, // e.g. in INR or USD
    minCGPA: { type: Number, required: true },        // e.g. 7.0 or 8.5
    genderRestriction: { type: String, enum: ['All', 'Female', 'Male', 'Other'], default: 'All' },
    eligibleYears: [{ type: Number }],                  // e.g. [1, 2, 3, 4] for college years
    eligibleCategories: [{ type: String }]             // e.g. ['General', 'OBC', 'SC', 'ST']
  },
  
  createdAt: { type: Date, default: Date.now }
});

export const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

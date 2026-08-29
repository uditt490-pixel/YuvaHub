const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  headline: { type: String, default: 'Student & Developer' },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  githubUsername: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  publicEmail: { type: String, default: '' },
  experience: { type: Array, default: [] },
  education: { type: Array, default: [] },
  skills: { type: Array, default: [] },
  projects: { type: Array, default: [] },
  portfolioSettings: {
    template: {
      type: String,
      enum: ['minimalist', 'terminal', 'creative'],
      default: 'minimalist'
    },
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    visibleSections: {
      bio: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      badges: { type: Boolean, default: true },
      experience: { type: Boolean, default: true }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const calendarTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  provider: { type: String, enum: ['google', 'outlook'], required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiryDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CalendarToken', calendarTokenSchema);

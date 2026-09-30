const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  topic: { type: String, required: true },
  description: { type: String, default: '' },
  objectives: { type: [String], default: [] },
  estimatedHours: { type: Number, default: 1 },
  practice: { type: String, default: '' },
  searchQuery: { type: String, default: '' },
  completed: { type: Boolean, default: false }
}, { _id: false });

const studyPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  totalDays: { type: Number, required: true },
  days: { type: [daySchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
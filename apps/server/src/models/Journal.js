const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entry: {
    type: String,
    required: [true, 'Journal entry is required'],
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound index for unique daily entries per user
journalSchema.index({ userId: 1, date: 1 }, { unique: true });

const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal; 
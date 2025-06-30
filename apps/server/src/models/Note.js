const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  tags: {
    type: [String],
    default: [],
    trim: true
  }
}, {
  timestamps: true
});

// Index for faster queries by userId
noteSchema.index({ userId: 1, createdAt: -1 });
// Index for tag-based queries
noteSchema.index({ userId: 1, tags: 1 });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note; 
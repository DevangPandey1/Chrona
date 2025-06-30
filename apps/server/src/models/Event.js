const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  allDay: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#4f46e5', // Default indigo color
    enum: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
  },
  type: {
    type: String,
    enum: ['event', 'meeting', 'reminder', 'task', 'personal', 'work'],
    default: 'event'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attendees: [{
    email: String,
    name: String,
    response: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'maybe'],
      default: 'pending'
    }
  }],
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      default: 'weekly'
    },
    interval: {
      type: Number,
      default: 1
    },
    endAfter: {
      type: Number // Number of occurrences
    },
    endDate: {
      type: Date
    }
  },
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'push', 'sms'],
      default: 'push'
    },
    time: {
      type: Number, // Minutes before event
      default: 15
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  relatedNote: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for userId to match frontend expectations
eventSchema.virtual('userId').get(function() {
  return this.user;
});

// Index for efficient queries
eventSchema.index({ user: 1, startDate: 1 });
eventSchema.index({ user: 1, endDate: 1 });
eventSchema.index({ user: 1, type: 1 });
eventSchema.index({ user: 1, 'attendees.email': 1 });

// Virtual for checking if event is ongoing
eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return now >= this.startDate && now <= this.endDate;
});

// Virtual for checking if event is upcoming
eventSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return now < this.startDate;
});

// Virtual for checking if event is overdue
eventSchema.virtual('isOverdue').get(function() {
  const now = new Date();
  return now > this.endDate;
});

// Method to check if event conflicts with another event
eventSchema.methods.hasConflict = function(otherEvent) {
  return (
    (this.startDate < otherEvent.endDate && this.endDate > otherEvent.startDate) ||
    (otherEvent.startDate < this.endDate && otherEvent.endDate > this.startDate)
  );
};

// Static method to get events for a date range
eventSchema.statics.getEventsInRange = function(userId, startDate, endDate) {
  return this.find({
    user: userId,
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  }).sort({ startDate: 1 });
};

// Static method to get upcoming events
eventSchema.statics.getUpcoming = function(userId, limit = 10) {
  return this.find({
    user: userId,
    startDate: { $gte: new Date() }
  })
  .sort({ startDate: 1 })
  .limit(limit);
};

// Static method to get today's events
eventSchema.statics.getTodayEvents = function(userId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return this.find({
    user: userId,
    $or: [
      { startDate: { $gte: startOfDay, $lt: endOfDay } },
      { endDate: { $gte: startOfDay, $lt: endOfDay } },
      { startDate: { $lte: startOfDay }, endDate: { $gte: endOfDay } }
    ]
  }).sort({ startDate: 1 });
};

module.exports = mongoose.model('Event', eventSchema); 
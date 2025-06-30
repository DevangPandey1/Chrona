const Event = require('../models/Event');
const Task = require('../models/Task');
const Note = require('../models/Note');

// Get all events for a user
const getEvents = async (req, res) => {
  try {
    const { start, end, type, priority, tags } = req.query;
    const userId = req.user._id;

    let query = { user: userId };

    // Date range filter
    if (start && end) {
      query.$or = [
        { startDate: { $gte: new Date(start), $lte: new Date(end) } },
        { endDate: { $gte: new Date(start), $lte: new Date(end) } },
        { startDate: { $lte: new Date(start) }, endDate: { $gte: new Date(end) } }
      ];
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Priority filter
    if (priority) {
      query.priority = priority;
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .populate('relatedTask', 'title status')
      .populate('relatedNote', 'title');

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user._id;

    const events = await Event.getUpcoming(userId, parseInt(limit))
      .populate('relatedTask', 'title status')
      .populate('relatedNote', 'title');

    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: 'Error fetching upcoming events' });
  }
};

// Get today's events
const getTodayEvents = async (req, res) => {
  try {
    const userId = req.user._id;

    const events = await Event.getTodayEvents(userId)
      .populate('relatedTask', 'title status')
      .populate('relatedNote', 'title');

    res.json(events);
  } catch (error) {
    console.error('Error fetching today\'s events:', error);
    res.status(500).json({ message: 'Error fetching today\'s events' });
  }
};

// Get single event
const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const event = await Event.findOne({ _id: id, user: userId })
      .populate('relatedTask', 'title status description')
      .populate('relatedNote', 'title content');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event' });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      location,
      color,
      type,
      priority,
      tags,
      attendees,
      recurring,
      reminders,
      notes,
      relatedTask,
      relatedNote
    } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check for conflicts if not all-day event
    if (!allDay) {
      const conflictingEvents = await Event.find({
        user: userId,
        allDay: false,
        $or: [
          { startDate: { $lt: new Date(endDate), $gte: new Date(startDate) } },
          { endDate: { $gt: new Date(startDate), $lte: new Date(endDate) } },
          { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(endDate) } }
        ]
      });

      if (conflictingEvents.length > 0) {
        return res.status(409).json({ 
          message: 'Event conflicts with existing events',
          conflicts: conflictingEvents.map(e => ({ id: e._id, title: e.title }))
        });
      }
    }

    const event = new Event({
      title,
      description,
      startDate,
      endDate,
      allDay,
      location,
      color,
      type,
      priority,
      tags: tags || [],
      attendees: attendees || [],
      recurring: recurring || { enabled: false },
      reminders: reminders || [{ type: 'push', time: 15, sent: false }],
      notes,
      user: userId,
      relatedTask,
      relatedNote
    });

    await event.save();

    // Populate related data
    await event.populate('relatedTask', 'title status');
    await event.populate('relatedNote', 'title');

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    // Validate dates if provided
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
    }

    const event = await Event.findOne({ _id: id, user: userId });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check for conflicts if updating dates and not all-day
    if ((updateData.startDate || updateData.endDate) && !updateData.allDay) {
      const startDate = updateData.startDate || event.startDate;
      const endDate = updateData.endDate || event.endDate;

      const conflictingEvents = await Event.find({
        user: userId,
        _id: { $ne: id },
        allDay: false,
        $or: [
          { startDate: { $lt: new Date(endDate), $gte: new Date(startDate) } },
          { endDate: { $gt: new Date(startDate), $lte: new Date(endDate) } },
          { startDate: { $lte: new Date(startDate) }, endDate: { $gte: new Date(endDate) } }
        ]
      });

      if (conflictingEvents.length > 0) {
        return res.status(409).json({ 
          message: 'Event conflicts with existing events',
          conflicts: conflictingEvents.map(e => ({ id: e._id, title: e.title }))
        });
      }
    }

    Object.assign(event, updateData);
    await event.save();

    await event.populate('relatedTask', 'title status');
    await event.populate('relatedNote', 'title');

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const event = await Event.findOneAndDelete({ _id: id, user: userId });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event' });
  }
};

// Bulk delete events
const bulkDeleteEvents = async (req, res) => {
  try {
    const { eventIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(eventIds) || eventIds.length === 0) {
      return res.status(400).json({ message: 'Event IDs array is required' });
    }

    const result = await Event.deleteMany({
      _id: { $in: eventIds },
      user: userId
    });

    res.json({ 
      message: `${result.deletedCount} events deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error bulk deleting events:', error);
    res.status(500).json({ message: 'Error deleting events' });
  }
};

// Get event statistics
const getEventStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = 'month' } = req.query;

    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const [totalEvents, upcomingEvents, todayEvents, typeStats, priorityStats] = await Promise.all([
      Event.countDocuments({ user: userId, startDate: { $gte: startDate, $lte: endDate } }),
      Event.countDocuments({ user: userId, startDate: { $gte: now } }),
      Event.getTodayEvents(userId).then(events => events.length),
      Event.aggregate([
        { $match: { user: userId, startDate: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $match: { user: userId, startDate: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      totalEvents,
      upcomingEvents,
      todayEvents,
      typeStats: typeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      priorityStats: priorityStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({ message: 'Error fetching event statistics' });
  }
};

// Search events
const searchEvents = async (req, res) => {
  try {
    const { q, type, priority, tags } = req.query;
    const userId = req.user._id;

    let query = { user: userId };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } }
      ];
    }

    if (type) {
      query.type = type;
    }

    if (priority) {
      query.priority = priority;
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    const events = await Event.find(query)
      .sort({ startDate: 1 })
      .populate('relatedTask', 'title status')
      .populate('relatedNote', 'title');

    res.json(events);
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ message: 'Error searching events' });
  }
};

module.exports = {
  getEvents,
  getUpcomingEvents,
  getTodayEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  bulkDeleteEvents,
  getEventStats,
  searchEvents
}; 
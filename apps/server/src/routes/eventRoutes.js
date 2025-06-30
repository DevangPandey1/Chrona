const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
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
} = require('../controllers/eventController');

// All routes require authentication
router.use(protect);

// Get all events (with optional filters)
router.get('/', getEvents);

// Get upcoming events
router.get('/upcoming', getUpcomingEvents);

// Get today's events
router.get('/today', getTodayEvents);

// Get event statistics
router.get('/stats', getEventStats);

// Search events
router.get('/search', searchEvents);

// Get single event
router.get('/:id', getEvent);

// Create new event
router.post('/', createEvent);

// Update event
router.put('/:id', updateEvent);

// Delete event
router.delete('/:id', deleteEvent);

// Bulk delete events
router.delete('/bulk/delete', bulkDeleteEvents);

module.exports = router; 
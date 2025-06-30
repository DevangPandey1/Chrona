const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Get all tasks with optional filters
router.get('/', taskController.getAllTasks);

// Get task statistics
router.get('/stats', taskController.getTaskStats);

// Get tasks by category
router.get('/by-category', taskController.getTasksByCategory);

// Get specific task
router.get('/:id', taskController.getTaskById);

// Create new task
router.post('/', taskController.createTask);

// Update task
router.put('/:id', taskController.updateTask);

// Delete task
router.delete('/:id', taskController.deleteTask);

// Bulk update tasks
router.patch('/bulk', taskController.bulkUpdateTasks);

module.exports = router; 
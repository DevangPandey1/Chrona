const mongoose = require('mongoose');
const Task = require('../models/Task');

// Get all tasks for a user
exports.getAllTasks = async (req, res) => {
  try {
    const { status, priority, category, dueDate, search } = req.query;
    const userId = req.user._id;

    let query = { user: userId };

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (category) {
      query.category = category;
    }
    if (dueDate) {
      const date = new Date(dueDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.dueDate = { $gte: date, $lt: nextDay };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('parentTask', 'title')
      .populate('subtasks', 'title status')
      .sort({ priority: -1, dueDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id })
      .populate('parentTask', 'title')
      .populate('subtasks', 'title status priority dueDate');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      category,
      estimatedTime,
      parentTask,
      notes
    } = req.body;

    const task = new Task({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags || [],
      category,
      estimatedTime,
      parentTask,
      notes,
      user: req.user._id
    });

    const savedTask = await task.save();

    // If this is a subtask, add it to parent task's subtasks array
    if (parentTask) {
      await Task.findByIdAndUpdate(parentTask, {
        $push: { subtasks: savedTask._id }
      });
    }

    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      category,
      estimatedTime,
      actualTime,
      notes
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (tags !== undefined) updateData.tags = tags;
    if (category !== undefined) updateData.category = category;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime;
    if (actualTime !== undefined) updateData.actualTime = actualTime;
    if (notes !== undefined) updateData.notes = notes;

    // If marking as completed, set completedAt
    if (status === 'completed') {
      updateData.completedAt = new Date();
    } else if (status !== 'completed' && status !== undefined) {
      updateData.completedAt = null;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    ).populate('parentTask', 'title')
     .populate('subtasks', 'title status priority dueDate');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove from parent task's subtasks array
    if (task.parentTask) {
      await Task.findByIdAndUpdate(task.parentTask, {
        $pull: { subtasks: task._id }
      });
    }

    // Delete all subtasks
    if (task.subtasks.length > 0) {
      await Task.deleteMany({ _id: { $in: task.subtasks } });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      dueTodayTasks,
      tasksByStatus,
      tasksByPriority
    ] = await Promise.all([
      Task.countDocuments({ user: userId }),
      Task.countDocuments({ user: userId, status: 'completed' }),
      Task.getOverdue(userId),
      Task.getDueToday(userId),
      Task.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      total: totalTasks,
      completed: completedTasks,
      overdue: overdueTasks.length,
      dueToday: dueTodayTasks.length,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      byStatus: tasksByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byPriority: tasksByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ message: 'Failed to fetch task statistics' });
  }
};

// Bulk update tasks
exports.bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body;
    const userId = req.user._id;

    const result = await Task.updateMany(
      { _id: { $in: taskIds }, user: userId },
      updates
    );

    res.json({ message: `${result.modifiedCount} tasks updated successfully` });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    res.status(500).json({ message: 'Failed to update tasks' });
  }
};

// Get tasks by category
exports.getTasksByCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const tasks = await Task.find({ user: userId })
      .distinct('category')
      .then(categories => {
        return Promise.all(
          categories.map(category =>
            Task.find({ user: userId, category })
              .sort({ priority: -1, dueDate: 1 })
              .then(tasks => ({ category, tasks }))
          )
        );
      });

    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by category:', error);
    res.status(500).json({ message: 'Failed to fetch tasks by category' });
  }
}; 
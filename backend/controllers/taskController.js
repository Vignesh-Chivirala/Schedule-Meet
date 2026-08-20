import Task from '../models/Task.js';
import mongoose from 'mongoose';

// @desc    Get user tasks with filter, search, sort, pagination
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, sortBy, order, page = 1, limit = 9 } = req.query;

    const query = { user: req.user._id };

    // Filter by status
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by priority
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Search by title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sort setup
    let sortOptions = { createdAt: -1 }; // Default: Newest first
    if (sortBy === 'dueDate') {
      sortOptions = { dueDate: order === 'desc' ? -1 : 1 };
    } else if (sortBy === 'priority') {
      // Map priority sorting order if needed or sort by field string
      sortOptions = { priority: order === 'desc' ? -1 : 1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: order === 'desc' ? -1 : 1 };
    } else if (sortBy === 'createdAt') {
      sortOptions = { createdAt: order === 'asc' ? 1 : -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const pages = Math.ceil(total / limitNum) || 1;

    res.json({
      tasks,
      page: pageNum,
      pages,
      total,
      limit: limitNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = new Task({
      user: req.user._id,
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description, status, priority, dueDate } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task removed successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Task Analytics Insights
// @route   GET /api/tasks/analytics
// @access  Private
export const getTaskAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // MongoDB Aggregation Pipeline for Analytics
    const stats = await Task.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] },
          },
          todo: {
            $sum: { $cond: [{ $eq: ['$status', 'Todo'] }, 1, 0] },
          },
          lowPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'Low'] }, 1, 0] },
          },
          mediumPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'Medium'] }, 1, 0] },
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] },
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return res.json({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionPercentage: 0,
        byStatus: { Todo: 0, 'In Progress': 0, Done: 0 },
        byPriority: { Low: 0, Medium: 0, High: 0 },
      });
    }

    const data = stats[0];
    const pendingTasks = data.todo + data.inProgress;
    const completionPercentage = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

    res.json({
      totalTasks: data.total,
      completedTasks: data.completed,
      pendingTasks,
      completionPercentage,
      byStatus: {
        Todo: data.todo,
        'In Progress': data.inProgress,
        Done: data.completed,
      },
      byPriority: {
        Low: data.lowPriority,
        Medium: data.mediumPriority,
        High: data.highPriority,
      },
    });
  } catch (error) {
    next(error);
  }
};

const express = require('express');
const router = express.Router();
const SystemActivity = require('../models/SystemActivity');
const auth = require('../middleware/auth');

// Get all system activities (admin only)
router.get('/', auth, async (req, res) => {
  try {
    console.log('📊 System Activities - User:', req.user.role, req.user.id);
    // Check if user is admin or Super Admin
    if (req.user.role !== 'admin' && req.user.role !== 'Super Admin') {
      console.log('❌ Access denied - not admin');
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const limit = parseInt(req.query.limit) || 0;
    const skip = parseInt(req.query.skip) || 0;

    const activities = await SystemActivity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('user', 'name email role');

    const total = await SystemActivity.countDocuments();
    console.log('📊 Found', activities.length, 'activities out of', total, 'total');

    res.json({
      activities,
      total,
      hasMore: total > (skip + activities.length)
    });
  } catch (error) {
    console.error('Error fetching system activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent activities (last 5)
router.get('/recent', auth, async (req, res) => {
  try {
    console.log('📊 Recent Activities - User:', req.user.role, req.user.id);
    // Check if user is admin or Super Admin
    if (req.user.role !== 'admin' && req.user.role !== 'Super Admin') {
      console.log('❌ Access denied - not admin');
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const activities = await SystemActivity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email role');

    console.log('📊 Found', activities.length, 'recent activities');
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new system activity (used by other routes)
router.post('/', auth, async (req, res) => {
  try {
    const {
      type,
      description,
      entityType,
      entityId,
      entityName,
      metadata
    } = req.body;

    const activity = await SystemActivity.create({
      type,
      description,
      user: req.user._id,
      userName: req.user.name || req.user.email,
      userRole: req.user.role,
      entityType,
      entityId,
      entityName,
      metadata
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating system activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete old activities (cleanup - admin only)
router.delete('/cleanup', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const daysToKeep = parseInt(req.query.days) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await SystemActivity.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    res.json({
      message: `Deleted ${result.deletedCount} activities older than ${daysToKeep} days`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up activities:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

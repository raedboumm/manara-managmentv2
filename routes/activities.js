// Activities Routes
const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// Get all activities
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 ACTIVITIES - User Role:', req.user.role, 'User ID:', req.user.id);
    
    // Build filter based on role
    const filter = {};
    if (req.user.role === 'Group Leader') {
      console.log('🔒 Filtering activities for Group Leader:', req.user.id);
      filter.createdBy = req.user.id;
    }
    
    const activities = await Activity.find(filter)
      .populate('group', 'name')
      .populate('participants', 'firstName lastName')
      .populate('createdBy', 'name email');
    
    console.log('📊 Found activities:', activities.length);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activities by group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const activities = await Activity.find({ group: req.params.groupId });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activity by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('group', 'name')
      .populate('participants', 'firstName lastName');
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create activity
router.post('/', auth, async (req, res) => {
  try {
    const activity = new Activity({
      ...req.body,
      createdBy: req.user.id
    });
    await activity.save();
    await activity.populate('group', 'name');
    await activity.populate('createdBy', 'name email');
    
    // Log the activity creation
    await logActivity(
      'activity_added',
      `Added activity "${activity.name}"`,
      req.user,
      'activity',
      activity._id,
      activity.name,
      { city: activity.city }
    );
    
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update activity
router.put('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('group', 'name').populate('participants');
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    // Log the activity update
    await logActivity(
      'activity_updated',
      `Updated activity "${activity.name}"`,
      req.user,
      'activity',
      activity._id,
      activity.name
    );
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete activity
router.delete('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    // Log the activity deletion
    await logActivity(
      'activity_deleted',
      `Deleted activity "${activity.name}"`,
      req.user,
      'activity',
      activity._id,
      activity.name
    );
    
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

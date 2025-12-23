// Agencies Routes
const express = require('express');
const router = express.Router();
const Agency = require('../models/Agency');
const User = require('../models/User');
const SystemActivity = require('../models/SystemActivity');
const auth = require('../middleware/auth');

// Get all agencies with statistics
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 AGENCIES - User Role:', req.user.role, 'User ID:', req.user.id);
    
    // Only Super Admin can view agencies
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    
    const agencies = await Agency.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    // Get user count for each agency
    const agenciesWithStats = await Promise.all(agencies.map(async (agency) => {
      const userCount = await User.countDocuments({ agency: agency._id });
      return {
        ...agency.toObject(),
        userCount
      };
    }));
    
    res.json(agenciesWithStats);
  } catch (error) {
    console.error('❌ Error fetching agencies:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get agency by ID with detailed statistics
router.get('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    
    const agency = await Agency.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    
    // Get users belonging to this agency
    const users = await User.find({ agency: agency._id })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      ...agency.toObject(),
      users
    });
  } catch (error) {
    console.error('❌ Error fetching agency:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new agency
router.post('/', auth, async (req, res) => {
  try {
    console.log('📝 Creating new agency:', req.body);
    
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    
    const agency = new Agency({
      ...req.body,
      createdBy: req.user.id
    });
    
    await agency.save();
    await agency.populate('createdBy', 'name email');
    
    console.log('✅ Agency created successfully:', agency._id);
    res.status(201).json(agency);
  } catch (error) {
    console.error('❌ Error creating agency:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update agency
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    
    const agency = await Agency.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    
    console.log('✅ Agency updated successfully:', agency._id);
    res.json(agency);
  } catch (error) {
    console.error('❌ Error updating agency:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete agency
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    
    // Check if agency has users
    const userCount = await User.countDocuments({ agency: req.params.id });
    if (userCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete agency. It has ${userCount} user(s). Please reassign or delete users first.` 
      });
    }
    
    const agency = await Agency.findByIdAndDelete(req.params.id);
    
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    
    console.log('✅ Agency deleted successfully:', req.params.id);
    res.json({ message: 'Agency deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting agency:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get agency statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    
    const Group = require('../models/Group');
    const Operation = require('../models/Operation');
    
    // Get users from this agency
    const users = await User.find({ agency: req.params.id }).select('_id');
    const userIds = users.map(u => u._id);
    
    // Get groups created by these users
    const groupCount = await Group.countDocuments({ createdBy: { $in: userIds } });
    
    // Get operations created by these users
    const operations = await Operation.find({ createdBy: { $in: userIds } });
    
    // Calculate total revenue (placeholder - adjust based on your revenue calculation)
    const totalRevenue = operations.length * 1000; // Example calculation
    
    res.json({
      userCount: users.length,
      groupCount,
      operationCount: operations.length,
      totalRevenue
    });
  } catch (error) {
    console.error('❌ Error fetching agency stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get recent activities for a specific agency
router.get('/:id/activities', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    
    const activities = await SystemActivity.find({ agency: req.params.id })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 activities
    
    console.log(`📊 Found ${activities.length} activities for agency ${req.params.id}`);
    res.json(activities);
  } catch (error) {
    console.error('❌ Error fetching agency activities:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark agency activities as read
router.post('/:id/activities/mark-read', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    
    const result = await SystemActivity.updateMany(
      { agency: req.params.id, isRead: false },
      { $set: { isRead: true } }
    );
    
    console.log(`✅ Marked ${result.modifiedCount} activities as read for agency ${req.params.id}`);
    res.json({ message: 'Activities marked as read', count: result.modifiedCount });
  } catch (error) {
    console.error('❌ Error marking activities as read:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get unread activity count for all agencies
router.get('/notifications/count', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ message: 'Access denied. Super Admin only.' });
    }
    
    // Get all agencies
    const agencies = await Agency.find().select('_id');
    
    // Get unread count for each agency
    const agencyCounts = await Promise.all(agencies.map(async (agency) => {
      const count = await SystemActivity.countDocuments({ 
        agency: agency._id, 
        isRead: false 
      });
      return {
        agencyId: agency._id,
        unreadCount: count
      };
    }));
    
    // Calculate total unread count
    const totalUnread = agencyCounts.reduce((sum, item) => sum + item.unreadCount, 0);
    
    res.json({
      totalUnread,
      agencies: agencyCounts.filter(item => item.unreadCount > 0) // Only return agencies with unread
    });
  } catch (error) {
    console.error('❌ Error fetching unread counts:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

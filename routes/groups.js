// Groups Routes
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const auth = require('../middleware/auth');

// Get all groups
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find().populate('leader', 'name email');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get group by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('leader', 'name email');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create group
router.post('/', auth, async (req, res) => {
  try {
    // DEBUG: Log what backend receives
    console.log('🔴 Backend received req.body:', req.body);
    console.log('🔴 costPerPerson:', req.body.costPerPerson, 'type:', typeof req.body.costPerPerson);
    console.log('🔴 cost:', req.body.cost, 'type:', typeof req.body.cost);
    console.log('🔴 sellingPrice:', req.body.sellingPrice, 'type:', typeof req.body.sellingPrice);
    
    // Extract all fields from request body
    const {
      name,
      groupName,
      description,
      leader,
      totalPassengers,
      budget,
      startDate,
      endDate,
      status,
      nationality,
      visaType,
      statusLabel,
      costPerPerson,
      cost,
      sellingPrice
    } = req.body;
    
    console.log('🔴 After destructuring - costPerPerson:', costPerPerson, 'sellingPrice:', sellingPrice);
    
    // Build group data object with explicit value checks
    const groupData = {
      name: name || groupName,
      groupName: groupName || name,
      description,
      leader,
      totalPassengers,
      budget,
      startDate,
      endDate,
      status,
      nationality,
      visaType,
      statusLabel
    };
    
    // Only add numeric fields if they have actual values
    if (costPerPerson !== undefined && costPerPerson !== null && costPerPerson !== '') {
      groupData.costPerPerson = Number(costPerPerson);
      console.log('🔴 Setting costPerPerson to:', groupData.costPerPerson);
    }
    
    if (cost !== undefined && cost !== null && cost !== '') {
      groupData.cost = Number(cost);
    } else if (costPerPerson !== undefined && costPerPerson !== null && costPerPerson !== '') {
      groupData.cost = Number(costPerPerson);
    }
    
    if (sellingPrice !== undefined && sellingPrice !== null && sellingPrice !== '') {
      groupData.sellingPrice = Number(sellingPrice);
      console.log('🔴 Setting sellingPrice to:', groupData.sellingPrice);
    }
    
    console.log('🔴 Final groupData before creating Group:', groupData);
    
    const group = new Group(groupData);

    console.log('🔴 Before save - group data:', group.toObject());
    await group.save();
    console.log('🔴 After save - group data:', group.toObject());
    
    await group.populate('leader', 'name email');
    res.status(201).json(group);
  } catch (error) {
    console.error('🔴 Error creating group:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update group
router.put('/:id', auth, async (req, res) => {
  try {
    // Extract all fields and build update object
    const updateData = {
      ...req.body,
      updatedAt: Date.now()
    };
    
    // Handle name/groupName compatibility
    if (req.body.groupName && !req.body.name) {
      updateData.name = req.body.groupName;
    }
    if (req.body.name && !req.body.groupName) {
      updateData.groupName = req.body.name;
    }
    
    // Handle cost/costPerPerson compatibility
    if (req.body.costPerPerson && !req.body.cost) {
      updateData.cost = req.body.costPerPerson;
    }
    if (req.body.cost && !req.body.costPerPerson) {
      updateData.costPerPerson = req.body.cost;
    }
    
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('leader', 'name email');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete group
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('🔴 Attempting to delete group:', req.params.id);
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      console.log('🔴 Group not found:', req.params.id);
      return res.status(404).json({ message: 'Group not found' });
    }
    console.log('🔴 Group deleted successfully:', group.name);
    res.json({ message: 'Group deleted successfully', deletedGroup: group });
  } catch (error) {
    console.error('🔴 Error deleting group:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

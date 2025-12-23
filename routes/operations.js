// Operations Routes
const express = require('express');
const router = express.Router();
const Operation = require('../models/Operation');
const auth = require('../middleware/auth');

// Get all operations
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 OPERATIONS - User Role:', req.user.role, 'User ID:', req.user.id);
    
    // Build filter based on role
    const filter = {};
    if (req.user.role === 'Group Leader') {
      console.log('🔒 Filtering operations for Group Leader:', req.user.id);
      filter.createdBy = req.user.id;
    }
    
    const operations = await Operation.find(filter)
      .populate('group', 'name')
      .populate('hotel', 'name city')
      .populate('createdBy', 'name email');
    
    console.log('📊 Found operations:', operations.length);
    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get operations by group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const operations = await Operation.find({ group: req.params.groupId });
    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get operation by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const operation = await Operation.findById(req.params.id)
      .populate('group', 'name')
      .populate('hotel', 'name city');
    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }
    res.json(operation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create operation
router.post('/', auth, async (req, res) => {
  try {
    const operationData = {
      ...req.body,
      createdBy: req.user.id
    };
    const operation = new Operation(operationData);
    await operation.save();
    await operation.populate('group', 'name');
    await operation.populate('createdBy', 'name email');
    res.status(201).json(operation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update operation
router.put('/:id', auth, async (req, res) => {
  try {
    const operation = await Operation.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('group', 'name').populate('hotel', 'name');
    
    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }
    res.json(operation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete operation
router.delete('/:id', auth, async (req, res) => {
  try {
    const operation = await Operation.findByIdAndDelete(req.params.id);
    if (!operation) {
      return res.status(404).json({ message: 'Operation not found' });
    }
    res.json({ message: 'Operation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// Passengers Routes
const express = require('express');
const router = express.Router();
const Passenger = require('../models/Passenger');
const auth = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// Get all passengers
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 PASSENGERS - User Role:', req.user.role, 'User ID:', req.user.id);
    
    // Build filter based on role
    const filter = {};
    if (req.user.role === 'Group Leader') {
      console.log('🔒 Filtering passengers for Group Leader:', req.user.id);
      filter.createdBy = req.user.id;
    }
    
    const passengers = await Passenger.find(filter)
      .populate('group', 'name')
      .populate('createdBy', 'name email');
    
    console.log('📊 Found passengers:', passengers.length);
    res.json(passengers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get passengers by group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const passengers = await Passenger.find({ group: req.params.groupId });
    res.json(passengers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get passenger by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const passenger = await Passenger.findById(req.params.id).populate('group', 'name');
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }
    res.json(passenger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create passenger
router.post('/', auth, async (req, res) => {
  try {
    const passengerData = {
      ...req.body,
      createdBy: req.user.id
    };
    const passenger = new Passenger(passengerData);
    await passenger.save();
    await passenger.populate('group', 'name');
    await passenger.populate('createdBy', 'name email');
    
    // Log the passenger creation activity
    await logActivity(
      'passenger_added',
      `Added passenger "${passenger.name}"`,
      req.user,
      'passenger',
      passenger._id,
      passenger.name,
      { group: passenger.group?.name }
    );
    
    res.status(201).json(passenger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update passenger
router.put('/:id', auth, async (req, res) => {
  try {
    const passenger = await Passenger.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('group', 'name');
    
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }
    
    // Log the passenger update activity
    await logActivity(
      'passenger_updated',
      `Updated passenger "${passenger.name}"`,
      req.user,
      'passenger',
      passenger._id,
      passenger.name,
      { group: passenger.group?.name }
    );
    
    res.json(passenger);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete passenger
router.delete('/:id', auth, async (req, res) => {
  try {
    const passenger = await Passenger.findByIdAndDelete(req.params.id);
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }
    
    // Log the passenger deletion activity
    await logActivity(
      'passenger_deleted',
      `Deleted passenger "${passenger.name}"`,
      req.user,
      'passenger',
      passenger._id,
      passenger.name
    );
    
    res.json({ message: 'Passenger deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk update room assignments
router.post('/room-assignments', auth, async (req, res) => {
  try {
    const { assignments } = req.body;
    
    console.log('💾 Saving room assignments:', JSON.stringify(assignments, null, 2));
    
    if (!assignments || !Array.isArray(assignments)) {
      return res.status(400).json({ message: 'Invalid assignments data' });
    }
    
    // Update each passenger's room assignment
    const updatePromises = assignments.map(async ({ passengerId, roomAssignment }) => {
      try {
        const passenger = await Passenger.findByIdAndUpdate(
          passengerId,
          { roomAssignment, updatedAt: Date.now() },
          { new: true, runValidators: false }
        );
        
        if (!passenger) {
          console.warn('⚠️ Passenger not found:', passengerId);
        } else {
          console.log('✅ Updated passenger:', passengerId, 'Room:', roomAssignment?.roomId || 'unassigned');
        }
        
        return passenger;
      } catch (err) {
        console.error('❌ Error updating passenger:', passengerId, err.message);
        throw err;
      }
    });
    
    await Promise.all(updatePromises);
    
    console.log('✅ All room assignments saved successfully');
    res.json({ message: 'Room assignments saved successfully' });
  } catch (error) {
    console.error('❌ Error saving room assignments:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

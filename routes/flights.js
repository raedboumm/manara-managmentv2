// Flights Routes
const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const auth = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// Get all flights
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 FLIGHTS - User Role:', req.user.role, 'User ID:', req.user.id);
    
    // Build filter based on role
    const filter = {};
    if (req.user.role === 'Group Leader') {
      console.log('🔒 Filtering flights for Group Leader:', req.user.id);
      filter.createdBy = req.user.id;
    }
    
    const flights = await Flight.find(filter)
      .populate('group', 'name')
      .populate('passengers', 'firstName lastName email')
      .populate('createdBy', 'name email');
    
    console.log('📊 Found flights:', flights.length);
    if (req.user.role === 'Group Leader' && flights.length > 0) {
      console.log('✅ Flight createdBy IDs:', flights.map(f => f.createdBy?._id?.toString()));
    }
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get flights by group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const flights = await Flight.find({ group: req.params.groupId });
    res.json(flights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get flight by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('group', 'name')
      .populate('passengers', 'firstName lastName email');
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create flight
router.post('/', auth, async (req, res) => {
  try {
    const flightData = {
      ...req.body,
      createdBy: req.user.id
    };
    const flight = new Flight(flightData);
    await flight.save();
    await flight.populate('group', 'name');
    await flight.populate('createdBy', 'name email');
    
    // Log the flight creation activity
    await logActivity(
      'flight_added',
      `Added flight "${flight.flightNumber || 'Flight'}"`,
      req.user,
      'flight',
      flight._id,
      flight.flightNumber,
      { group: flight.group?.name }
    );
    
    res.status(201).json(flight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update flight
router.put('/:id', auth, async (req, res) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('group', 'name').populate('passengers');
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    // Log the flight update activity
    await logActivity(
      'flight_updated',
      `Updated flight "${flight.flightNumber || 'Flight'}"`,
      req.user,
      'flight',
      flight._id,
      flight.flightNumber
    );
    
    res.json(flight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete flight
router.delete('/:id', auth, async (req, res) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    // Log the flight deletion activity
    await logActivity(
      'flight_deleted',
      `Deleted flight "${flight.flightNumber || 'Flight'}"`,
      req.user,
      'flight',
      flight._id,
      flight.flightNumber
    );
    
    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

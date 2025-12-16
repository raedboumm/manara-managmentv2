// Flights Routes
const express = require('express');
const router = express.Router();
const Flight = require('../models/Flight');
const auth = require('../middleware/auth');

// Get all flights
router.get('/', auth, async (req, res) => {
  try {
    const flights = await Flight.find()
      .populate('group', 'name')
      .populate('passengers', 'firstName lastName email');
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
    const flight = new Flight(req.body);
    await flight.save();
    await flight.populate('group', 'name');
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
    res.json({ message: 'Flight deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

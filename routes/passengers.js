// Passengers Routes
const express = require('express');
const router = express.Router();
const Passenger = require('../models/Passenger');
const auth = require('../middleware/auth');

// Get all passengers
router.get('/', auth, async (req, res) => {
  try {
    const passengers = await Passenger.find().populate('group', 'name');
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
    const passenger = new Passenger(req.body);
    await passenger.save();
    await passenger.populate('group', 'name');
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
    res.json({ message: 'Passenger deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

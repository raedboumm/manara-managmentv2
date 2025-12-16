// Airlines Routes
const express = require('express');
const router = express.Router();
const Airline = require('../models/Airline');
const auth = require('../middleware/auth');

// Get all airlines
router.get('/', auth, async (req, res) => {
  try {
    const airlines = await Airline.find().sort({ name: 1 });
    res.json(airlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get airline by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const airline = await Airline.findById(req.params.id);
    if (!airline) {
      return res.status(404).json({ message: 'Airline not found' });
    }
    res.json(airline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create airline
router.post('/', auth, async (req, res) => {
  try {
    const airline = new Airline(req.body);
    await airline.save();
    res.status(201).json(airline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update airline
router.put('/:id', auth, async (req, res) => {
  try {
    const airline = await Airline.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!airline) {
      return res.status(404).json({ message: 'Airline not found' });
    }
    res.json(airline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete airline
router.delete('/:id', auth, async (req, res) => {
  try {
    const airline = await Airline.findByIdAndDelete(req.params.id);
    if (!airline) {
      return res.status(404).json({ message: 'Airline not found' });
    }
    res.json({ message: 'Airline deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

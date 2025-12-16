// Hotels Routes
const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const auth = require('../middleware/auth');

// Get all hotels
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    // Filter by isMasterHotel if query parameter is provided
    if (req.query.isMasterHotel !== undefined) {
      filter.isMasterHotel = req.query.isMasterHotel === 'true';
    }
    const hotels = await Hotel.find(filter).populate('group', 'name');
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get hotels by group
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const hotels = await Hotel.find({ group: req.params.groupId });
    res.json(hotels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get hotel by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('group', 'name');
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create hotel
router.post('/', auth, async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    await hotel.populate('group', 'name');
    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update hotel
router.put('/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('group', 'name');
    
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete hotel
router.delete('/:id', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// Hotels Routes
const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

// Get all hotels
router.get('/', auth, async (req, res) => {
  try {
    console.log('🔍 HOTELS - User Role:', req.user.role, 'User ID:', req.user.id);
    console.log('🔍 Query params:', req.query);
    
    // If requesting master hotels (for dropdowns), fetch hotels created by Super Admin
    if (req.query.isMasterHotel === 'true') {
      console.log('📋 Fetching master hotels (created by Super Admin)');
      
      // Find all Super Admin users
      const superAdmins = await User.find({ role: 'Super Admin' }).select('_id');
      const superAdminIds = superAdmins.map(admin => admin._id);
      
      console.log('👑 Found Super Admins:', superAdminIds.length);
      
      // Fetch hotels created by Super Admins
      const hotels = await Hotel.find({ createdBy: { $in: superAdminIds } })
        .populate('group', 'name')
        .populate('createdBy', 'name email')
        .sort({ city: 1, name: 1 });
      
      console.log('📊 Found master hotels:', hotels.length);
      if (hotels.length > 0) {
        console.log('🏨 Sample hotels:', hotels.slice(0, 3).map(h => ({ name: h.name, city: h.city })));
      }
      return res.json(hotels);
    }
    
    // For regular requests (viewing reservations), filter by role
    const filter = {};
    if (req.user.role === 'Group Leader') {
      console.log('🔒 Filtering hotels for Group Leader:', req.user.id);
      filter.createdBy = req.user.id;
    }
    
    console.log('🔍 Final filter:', JSON.stringify(filter));
    const hotels = await Hotel.find(filter)
      .populate('group', 'name')
      .populate('createdBy', 'name email');
    
    console.log('📊 Found hotels:', hotels.length);
    res.json(hotels);
  } catch (error) {
    console.error('❌ Error in hotels route:', error);
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
    const hotel = new Hotel({
      ...req.body,
      createdBy: req.user.id
    });
    await hotel.save();
    await hotel.populate('group', 'name');
    await hotel.populate('createdBy', 'name email');
    
    // Log the hotel creation activity
    await logActivity(
      'hotel_added',
      `Added hotel "${hotel.name}"`,
      req.user,
      'hotel',
      hotel._id,
      hotel.name,
      { city: hotel.city }
    );
    
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
    
    // Log the hotel update activity
    await logActivity(
      'hotel_updated',
      `Updated hotel "${hotel.name}"`,
      req.user,
      'hotel',
      hotel._id,
      hotel.name
    );
    
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
    
    // Log the hotel deletion activity
    await logActivity(
      'hotel_deleted',
      `Deleted hotel "${hotel.name}"`,
      req.user,
      'hotel',
      hotel._id,
      hotel.name
    );
    
    res.json({ message: 'Hotel deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

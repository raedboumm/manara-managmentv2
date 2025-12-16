// Contacts Routes
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// Get contact by user ID
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const contact = await Contact.findOne({ userId: userId });
    if (!contact) {
      // Return empty contact object if not found
      return res.json({
        madinahAirportNumber: '',
        madinahAirport: '',
        makkahAirportNumber: '',
        makkahAirport: '',
        madinahRepresentativeNumber: '',
        madinahRepresentative: '',
        makkahRepresentativeNumber: '',
        makkahRepresentative: '',
        operationHeadNumber: '',
        operationHead: ''
      });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update contact
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const existingContact = await Contact.findOne({ userId: userId });
    
    if (existingContact) {
      // Update existing contact
      const updatedContact = await Contact.findByIdAndUpdate(
        existingContact._id,
        { ...req.body, updatedAt: Date.now() },
        { new: true }
      );
      return res.json(updatedContact);
    } else {
      // Create new contact
      const userId = req.user.userId || req.user.id || req.user._id;
      const contact = new Contact({
        ...req.body,
        userId: userId
      });
      await contact.save();
      return res.status(201).json(contact);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

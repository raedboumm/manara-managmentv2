// Hotel Model
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a hotel name'],
    trim: true
  },
  city: {
    type: String,
    required: true
  },
  starRating: {
    type: Number,
    min: 1,
    max: 5
  },
  distanceFromHaram: {
    type: String,
    trim: true
  },
  placement: {
    type: String,
    trim: true
  },
  address: String,
  phone: String,
  email: String,
  totalRooms: {
    type: Number,
    default: 0
  },
  availableRooms: {
    type: Number,
    default: 0
  },
  pricePerNight: {
    type: Number,
    default: 0
  },
  checkInDate: Date,
  checkOutDate: Date,
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  isMasterHotel: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Available', 'Reserved', 'Occupied', 'Maintenance'],
    default: 'Available'
  },
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Hotel', hotelSchema);

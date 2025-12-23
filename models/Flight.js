// Flight Model
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,
    required: [true, 'Please add a flight number'],
    unique: true
  },
  airline: {
    type: String,
    required: [true, 'Please add an airline']
  },
  departureCity: {
    type: String,
    required: true
  },
  arrivalCity: {
    type: String,
    required: true
  },
  departureTime: {
    type: Date,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  passengers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Passenger'
  }],
  totalPassengers: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Boarded', 'Departed', 'Arrived', 'Cancelled'],
    default: 'Scheduled'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Flight', flightSchema);

// Passenger Model
const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  phone: String,
  passport: String,
  nationality: String,
  dateOfBirth: Date,
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  gender: String,
  maritalStatus: String,
  passportNumber: String,
  phoneNumber: String,
  fullName: String,
  photo: {
    type: String,
    default: null
  },
  passengerPhoto: {
    type: String,
    default: null
  },
  idPassportCopy: {
    type: String,
    default: null
  },
  passportIdPhoto: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Registered', 'Active', 'Completed'],
    default: 'Registered'
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

module.exports = mongoose.model('Passenger', passengerSchema);

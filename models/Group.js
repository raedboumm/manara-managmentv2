// Group Model
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a group name'],
    trim: true
  },
  groupName: String,
  description: String,
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalPassengers: {
    type: Number,
    default: 0
  },
  budget: {
    type: Number,
    default: 0
  },
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    enum: ['Planning', 'Active', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  statusLabel: {
    type: String,
    enum: ['Economic', 'Standard', 'VIP'],
    default: 'Standard'
  },
  nationality: String,
  visaType: {
    type: String,
    enum: ['Umrah', 'Tourist', 'No Visa', 'Internal'],
    default: 'Umrah'
  },
  costPerPerson: {
    type: Number,
    default: 0
  },
  cost: {
    type: Number,
    default: 0
  },
  sellingPrice: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('Group', groupSchema);

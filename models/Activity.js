// Activity Model
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an activity name'],
    trim: true
  },
  description: String,
  city: {
    type: String,
    enum: ['Makkah', 'Madinah'],
    default: 'Makkah'
  },
  location: String,
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date
  },
  startTime: String,
  endTime: String,
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Passenger'
  }],
  totalParticipants: {
    type: Number,
    default: 0
  },
  budget: Number,
  status: {
    type: String,
    enum: ['Planned', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Planned'
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

module.exports = mongoose.model('Activity', activitySchema);

// Contact Model
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  madinahAirportNumber: String,
  madinahAirport: String,
  makkahAirportNumber: String,
  makkahAirport: String,
  madinahRepresentativeNumber: String,
  madinahRepresentative: String,
  makkahRepresentativeNumber: String,
  makkahRepresentative: String,
  operationHeadNumber: String,
  operationHead: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', contactSchema);

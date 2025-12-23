// System Activity Model (Audit Log)
const mongoose = require('mongoose');

const systemActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'user_login',
      'user_logout',
      'group_created',
      'group_updated',
      'group_deleted',
      'passenger_added',
      'passenger_updated',
      'passenger_deleted',
      'flight_added',
      'flight_updated',
      'flight_deleted',
      'hotel_added',
      'hotel_updated',
      'hotel_deleted',
      'activity_added',
      'activity_updated',
      'activity_deleted'
    ]
  },
  description: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String
  },
  userRole: {
    type: String
  },
  entityType: {
    type: String,
    enum: ['group', 'passenger', 'flight', 'hotel', 'activity', 'user', 'system']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId
  },
  entityName: {
    type: String
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
systemActivitySchema.index({ createdAt: -1 });
systemActivitySchema.index({ user: 1, createdAt: -1 });
systemActivitySchema.index({ type: 1, createdAt: -1 });
systemActivitySchema.index({ agency: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('SystemActivity', systemActivitySchema);

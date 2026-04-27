const mongoose = require('mongoose');

const triggerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: String, // Matches the clientId/deviceId
    required: true
  },
  feed: {
    type: String, // e.g., 'temperature', 'humidity', 'motion'
    required: true
  },
  condition: {
    type: String,
    enum: ['greater_than', 'less_than', 'equal_to'],
    default: 'greater_than'
  },
  threshold: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  alertType: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'warning'
  }
}, { timestamps: true });

module.exports = mongoose.model('Trigger', triggerSchema);

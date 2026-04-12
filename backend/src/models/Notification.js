const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
},
  title: { 
    type: String, 
    required: true 
},
  message: { 
    type: String, 
    required: true 
},
  type: { 
    type: String, 
    enum: ['info', 'warning', 'critical'], 
    default: 'info' 
}, // e.g., 'critical' for high temperature
  isRead: { 
    type: Boolean, 
    default: false 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
}
});

module.exports = mongoose.model('Notification', notificationSchema);
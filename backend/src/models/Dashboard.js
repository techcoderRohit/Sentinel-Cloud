const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: false // Changed from true to allow multiple boards
  },
  name: {
    type: String,
    required: true,
    default: "Default Board"
  },
  description: {
    type: String,
    default: ""
  },
  widgets: {
    type: Array,
    default: []
  }, 
  shareId: {
    type: String,
    unique: false,
    default: null
  } 
},
  {
    timestamps: true
  });

module.exports = mongoose.model('Dashboard', DashboardSchema);
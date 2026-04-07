const mongoose = require('mongoose');

const DashboardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  }, // Admin ki ID
  widgets: {
    type: Array,
    default: []
  }, // Saare widgets ka data (Position, Size, etc.)
  shareId: {
    type: String,
    unique: false,
    default: null
  } // Guest view ke liye unique ID
},
  {
    timestamps: true
  });

module.exports = mongoose.model('Dashboard', DashboardSchema);
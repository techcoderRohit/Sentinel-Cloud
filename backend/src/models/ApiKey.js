const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true 
  },
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Tumhare User model se link karne ke liye
    required: true 
  },
  name:{
    type: String,
    required: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastUsed: Date
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
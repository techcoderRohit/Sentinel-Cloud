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
    required: true ,
    index : true   //fast searching for dashboard-stats
  },
  name:{
    type: String,
    required: true
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  usageCount : {
    type : Number,
    default : 0
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastUsed : {
    type : Date,
    default : Date.now
  }
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
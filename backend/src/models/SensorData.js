const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  apiKey: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey', // Kis API Key se data aaya
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Kis user ka device hai
    required: true
  },
  payload: {
    temperature: Number,
    humidity: Number,
    status: String, // e.g., "Online", "Alert"
    motion: Boolean
    // Aap yahan apne project ke hisaab se fields badal sakte hain
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
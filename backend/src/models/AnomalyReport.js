const mongoose = require('mongoose');

const anomalySchema = new mongoose.Schema({
  type: { type: String, required: true },       // e.g. "temperature_spike", "humidity_drop"
  severity: { type: String, enum: ['normal', 'warning', 'critical'], default: 'normal' },
  message: { type: String, required: true },     // Human-readable description
  timestamp: { type: String }                    // When it occurred in the data
});

const anomalyReportSchema = new mongoose.Schema({
  apiKey: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  summary: { type: String, required: true },        // Plain-English data summary
  insights: [{ type: String }],                     // Actionable recommendations
  anomalies: [anomalySchema],                       // Detected anomalies list
  healthScore: { type: Number, min: 0, max: 100 },  // Overall device health 0-100
  dataRange: {
    from: { type: Date },
    to: { type: Date }
  },
  dataPointsAnalyzed: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AnomalyReport', anomalyReportSchema);

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { analyzeSensorData } = require('../services/aiService');
const SensorData = require('../models/SensorData');
const AnomalyReport = require('../models/AnomalyReport');
const ApiKey = require('../models/ApiKey');

// POST /api/ai/analyze/:apiKeyId — Run AI analysis on a device's recent data
router.post('/analyze/:apiKeyId', protect, async (req, res) => {
    try {
        const { apiKeyId } = req.params;

        // Verify the API key belongs to this user
        const apiKeyDoc = await ApiKey.findOne({ _id: apiKeyId, owner: req.user._id });
        if (!apiKeyDoc) {
            return res.status(404).json({ success: false, message: 'Device not found or access denied' });
        }

        // Fetch the last 50 sensor readings for analysis
        const sensorData = await SensorData.find({ apiKey: apiKeyId })
            .sort({ timestamp: -1 })
            .limit(50);

        if (!sensorData || sensorData.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No sensor data available for this device. Send some data first!'
            });
        }

        // Reverse to chronological order for analysis
        const chronologicalData = sensorData.reverse();

        // Run Gemini AI analysis
        const analysis = await analyzeSensorData(chronologicalData, apiKeyDoc.name);

        // Determine data range
        const dataRange = {
            from: chronologicalData[0].timestamp,
            to: chronologicalData[chronologicalData.length - 1].timestamp
        };

        // Save the report to DB
        const report = await AnomalyReport.create({
            apiKey: apiKeyId,
            owner: req.user._id,
            summary: analysis.summary,
            insights: analysis.insights,
            anomalies: analysis.anomalies,
            healthScore: analysis.healthScore,
            dataRange,
            dataPointsAnalyzed: chronologicalData.length
        });

        res.status(200).json({
            success: true,
            message: 'AI Analysis completed successfully',
            report
        });

    } catch (err) {
        console.error('AI Analysis error:', err);

        // Handle specific Gemini API key errors gracefully
        if (err.message && err.message.includes('GEMINI_API_KEY')) {
            return res.status(503).json({
                success: false,
                message: err.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'AI Analysis failed. Please try again.',
            error: err.message
        });
    }
});

// GET /api/ai/reports/:apiKeyId — Get all past AI reports for a device
router.get('/reports/:apiKeyId', protect, async (req, res) => {
    try {
        const reports = await AnomalyReport.find({
            apiKey: req.params.apiKeyId,
            owner: req.user._id
        }).sort({ createdAt: -1 }).limit(20);

        res.json({ success: true, reports });
    } catch (err) {
        console.error('Fetch reports error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch AI reports' });
    }
});

// DELETE /api/ai/reports/:reportId — Delete a specific AI report
router.delete('/reports/:reportId', protect, async (req, res) => {
    try {
        const report = await AnomalyReport.findOneAndDelete({
            _id: req.params.reportId,
            owner: req.user._id
        });

        if (!report) {
            return res.status(404).json({ success: false, message: 'Report not found' });
        }

        res.json({ success: true, message: 'Report deleted successfully' });
    } catch (err) {
        console.error('Delete report error:', err);
        res.status(500).json({ success: false, message: 'Failed to delete report' });
    }
});

module.exports = router;

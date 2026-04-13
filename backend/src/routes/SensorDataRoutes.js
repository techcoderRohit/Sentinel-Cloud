const express = require('express');
const router = express.Router();
const { updateSensorData,getLatestData,getDashboardStats,monitorAll,getHistory } = require('../controllers/SensorController');
const { validateApiKey, protect } = require('../middleware/authMiddleware');

// Public/Device Route (Requires API Key)
router.post('/update', validateApiKey,updateSensorData);

// Protected Routes (Dashboard usage)
router.get('/dashboard-stats', protect, getDashboardStats);
router.get('/monitor-all', protect, monitorAll);
router.get('/latest/:apiKeyId', protect, getLatestData);
router.get('/history/:apiKeyId', protect, getHistory);

module.exports = router;
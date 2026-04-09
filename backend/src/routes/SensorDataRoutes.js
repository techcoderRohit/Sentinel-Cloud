const express = require('express');
const SensorData = require('../models/SensorData');
const ApiKey = require('../models/ApiKey');
const { validateApiKey, protect } = require('../middleware/authMiddleware');
const router = express.Router();
// POST /api/iot/update
router.post('/update', validateApiKey, async (req, res) => {
  try {
    // req.user aur req.apiKeyDoc hume 'validateApiKey' middleware se milenge
    const { temperature, humidity, status } = req.body;
    //console.log("Data received from device:",req.body);
    

    const newData = await SensorData.create({
      apiKey: req.apiKey._id, // validateApiKey mein isse attach karna hoga
      owner: req.user, // validateApiKey ne owner ID attach ki hai
      payload: { temperature, humidity, status }
    });

    res.status(201).json({ 
      success: true, 
      message: "Data synced to Sentinel Cloud" 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Data storage failed" });
  }
});

// GET /api/iot/latest/:apiKeyId
router.get('/latest/:apiKeyId', async (req, res) => {
    try {
        const latestData = await SensorData.findOne({ apiKey: req.params.apiKeyId })
            .sort({ timestamp: -1 }); // Sabse naya data upar
        
        if (!latestData) {
            return res.status(404).json({ message: "No data found for this device" });
        }

        res.json(latestData);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/monitor-all', protect, async (req, res) => {
    try {
        const keys = await ApiKey.find({ owner: req.user._id });
        
        // Har key ke liye latest data map karein
        const deviceStatus = await Promise.all(keys.map(async (key) => {
            const latest = await SensorData.findOne({ apiKey: key._id }).sort({ timestamp: -1 });
            return {
                _id: key._id,
                name: key.name,
                lastUsed: key.lastUsed,
                data: latest ? latest.payload : null
            };
        }));

        res.json(deviceStatus);
    } catch (err) {
        res.status(500).json({ message: "Monitoring failed" });
    }
});

//Monitor API KEY USAGE ROUTE
// Get stats for a specific key
router.get('/stats/:keyId', protect, async (req, res) => {
    const key = await ApiKey.findById(req.params.keyId);
    const dataCount = await SensorData.countDocuments({ apiKey: req.params.keyId });
    res.json({ 
        usageCount: key.usageCount, 
        totalDataPoints: dataCount,
        lastActive: key.lastUsed 
    });
});

module.exports = router;
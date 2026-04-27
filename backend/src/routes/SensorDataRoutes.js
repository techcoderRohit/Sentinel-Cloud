const express = require('express');
const SensorData = require('../models/SensorData');
const Device = require('../models/Device');
const { validateApiKey, protect } = require('../middleware/authMiddleware');
const { getClient } = require('../mqtt/mqttHandler');
const router = express.Router();
const Notification = require('../models/Notification');
const SendAlert = require('../utils/alertService');
const User = require('../models/User');
const { checkForAnomalies } = require('../services/anomalyDetector');

// POST /api/iot/update
router.post('/update', validateApiKey, async (req, res) => {
    try {
        const { temperature, humidity, status } = req.body;
        const device = req.device;

        // 1. Save data to DB
        const newData = await SensorData.create({
            deviceId: device.deviceId,
            owner: device.owner,
            payload: { temperature, humidity, status }
        });

        // 2. Anomaly Detection Logic (Customizable)
        let anomalyDetected = false;
        let alertMsg = '';

        if (temperature > 45) {
            anomalyDetected = true;
            alertMsg = `Critical Temperature Detected: ${temperature}°C on device ${device.deviceName || device.deviceId}`;
        } else if (humidity > 90) {
            anomalyDetected = true;
            alertMsg = `High Humidity Alert: ${humidity}% on device ${device.deviceName || device.deviceId}`;
        }

        // 3. If Anomaly, Trigger Notifications
        if (anomalyDetected) {
            const owner = await User.findById(device.owner);
            if (owner) {
                // Save to Dashboard Notifications
                await Notification.create({
                    userId: owner._id,
                    title: '🚨 ANOMALY DETECTED',
                    message: alertMsg,
                    type: 'critical'
                });

                // Dispatch Email, Telegram, SMS — async
                SendAlert(owner, { 
                    title: `${device.deviceName || device.deviceId} - Sensor Alert`, 
                    message: alertMsg 
                }).catch(err => console.error('[SensorDataUpdate] Alert dispatch error:', err.message));
            }
        }

        res.status(201).json({
            success: true,
            message: "Data synced to Sentinel Cloud",
            anomaly: anomalyDetected
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Data storage failed" });
    }
});

// GET /api/iot/latest/:apiKeyId
router.get('/latest/:apiKeyId', async (req, res) => {
    try {
        const device = await Device.findOne({ apiKey: req.params.apiKeyId });
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        const latestData = await SensorData.findOne({ deviceId: device.deviceId })
            .sort({ timestamp: -1 }); // Sabse naya data upar

        if (!latestData) {
            return res.status(404).json({ message: "No data found for this device" });
        }

        res.json(latestData);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

router.get('/dashboard-stats', protect, async (req, res) => {
    try {
        const targetId = req.user.role === 'guest' ? req.user.managedBy : req.user._id;
        const deviceQuery = { owner: targetId };

        if (req.user.role === 'guest' && req.user.allowedDevices && req.user.allowedDevices.length > 0) {
            deviceQuery._id = { $in: req.user.allowedDevices };
        } else if (req.user.role === 'guest') {
            // Guest with no allowed devices sees zero devices
            return res.json({ totalDevices: 0, totalDataPoints: 0, activeDevices: 0 });
        }

        // 1. Total Devices kitne hain
        const totalDevices = await Device.countDocuments(deviceQuery);

        // 2. Total kitna data points jama hue hain
        const deviceIds = await Device.find(deviceQuery).distinct('deviceId');
        const totalDataPoints = await SensorData.countDocuments({
            deviceId: { $in: deviceIds }
        });

        // 3. Active Devices (Jo pichle 10 min mein active the)
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        const activeDevices = await Device.countDocuments({
            ...deviceQuery,
            lastActive: { $gt: tenMinsAgo }
        });

        res.json({ totalDevices, totalDataPoints, activeDevices });
    } catch (err) {
        res.status(500).json({ message: "Stats fetch failed" });
    }
});

router.get('/monitor-all', protect, async (req, res) => {
    try {
        const targetId = req.user.role === 'guest' ? req.user.managedBy : req.user._id;
        const deviceQuery = { owner: targetId };

        if (req.user.role === 'guest' && req.user.allowedDevices && req.user.allowedDevices.length > 0) {
            deviceQuery._id = { $in: req.user.allowedDevices };
        } else if (req.user.role === 'guest') {
            return res.json([]);
        }

        const devices = await Device.find(deviceQuery);

        // Har device ke liye latest data map karein
        const deviceStatus = await Promise.all(devices.map(async (device) => {
            const latest = await SensorData.findOne({ deviceId: device.deviceId }).sort({ timestamp: -1 });
            return {
                _id: device._id,
                deviceId: device.deviceId,
                apiKey: device.apiKey,
                name: device.deviceName || device.name || device.apiKey,
                lastUsed: device.lastActive,
                data: latest ? latest.payload : null
            };
        }));

        res.json(deviceStatus);
    } catch (err) {
        res.status(500).json({ message: "Monitoring failed" });
    }
});

// POST /api/iot/command (Bidirectional Input)
router.post('/command', protect, async (req, res) => {
    try {
        const { deviceId, field, value } = req.body;
        console.log(`📩 Command Received: DeviceID=${deviceId}, Field=${field}, Value=${value}`);

        // Security check
        const targetId = req.user.role === 'guest' ? req.user.managedBy : req.user._id;
        const device = await Device.findOne({ _id: deviceId, owner: targetId });
        
        if (!device) {
             return res.status(404).json({ success: false, message: 'Device not found' });
        }

        // 1. Publish to MQTT
        const mqtt = getClient();
        if (mqtt && mqtt.connected) {
            const topic = `sentinel/device/${device.deviceId}/command`;
            const payload = JSON.stringify({ field, value });
            mqtt.publish(topic, payload);
            console.log(`📤 MQTT PUBLISH: [${topic}] -> ${payload}`);
        } else {
            console.log(`⚠️ MQTT NOT CONNECTED: Command to [${device.deviceId}] failed`);
        }

        // 2. Optimistic state tracking in DB
        const latest = await SensorData.findOne({ deviceId: device.deviceId }).sort({ timestamp: -1 });
        let newPayload = latest ? { ...latest.payload } : { status: false };
        newPayload[field] = value;

        await SensorData.create({
            deviceId: device.deviceId,
            owner: targetId,
            payload: newPayload
        });

        res.json({ success: true, message: "Command dispatched" });
    } catch (err) {
        console.error("Command error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

//Monitor API KEY USAGE ROUTE
// Get stats for a specific key
router.get('/stats/:keyId', protect, async (req, res) => {
    const device = await Device.findOne({ apiKey: req.params.keyId, owner: req.user._id });
    if (!device) {
        return res.status(404).json({ message: 'Device not found' });
    }
    const dataCount = await SensorData.countDocuments({ deviceId: device.deviceId });
    res.json({
        usageCount: device.usageCount || 0,
        totalDataPoints: dataCount,
        lastActive: device.lastActive
    });
});

// GET /api/iot/history/:apiKeyId (apiKeyId yahan _id hai frontend se)
router.get('/history/:apiKeyId', protect, async (req, res) => {
    try {
        // Frontend dev._id bhejta hai, isliye hum _id se dhoondenge
        const device = await Device.findOne({ _id: req.params.apiKeyId, owner: req.user._id });
        if (!device) {
            return res.status(404).json({ message: "Device not found" });
        }

        const history = await SensorData.find({ deviceId: device.deviceId })
            .sort({ timestamp: -1 }) // Naya data pehle
            .limit(50);

        // Chart ke liye data ko "Old to New" order mein reverse karna hoga
        res.json(history.reverse());
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "History fetch failed" });
    }
});

const mongoose = require('mongoose');

// GET /api/iot/analytics/:apiKeyId?range=1H|24H|7D|1M|1Y
router.get('/analytics/:apiKeyId', protect, async (req, res) => {
    try {
        const { range, feed } = req.query; // '1H', '24H', '7D', '1M', '1Y'
        const apiKeyId = req.params.apiKeyId;

        const device = await Device.findOne({ apiKey: apiKeyId, owner: req.user._id });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        let matchStage = {
            deviceId: device.deviceId
        };

        const now = new Date();
        let startDate = new Date();
        let groupByFormat = "%Y-%m-%d"; // default to daily

        switch (range) {
            case '1H':
                startDate.setHours(now.getHours() - 1);
                groupByFormat = "%Y-%m-%d %H:%M"; // Group by minute
                break;
            case '24H':
                startDate.setHours(now.getHours() - 24);
                groupByFormat = "%Y-%m-%d %H:00"; // Group by hour
                break;
            case '7D':
                startDate.setDate(now.getDate() - 7);
                groupByFormat = "%Y-%m-%d"; // Group by day
                break;
            case '1M':
                startDate.setMonth(now.getMonth() - 1);
                groupByFormat = "%Y-%m-%d"; // Group by day
                break;
            case '1Y':
                startDate.setFullYear(now.getFullYear() - 1);
                groupByFormat = "%Y-%m"; // Group by month
                break;
            default:
                // Default to 24H
                startDate.setHours(now.getHours() - 24);
                groupByFormat = "%Y-%m-%d %H:00";
        }

        matchStage.timestamp = { $gte: startDate };

        // Dynamic Group Stage
        let groupStage = {
            _id: { $dateToString: { format: groupByFormat, date: "$timestamp" } },
            count: { $sum: 1 }
        };

        if (!feed || feed === 'All') {
            groupStage.avgTemp = { $avg: "$payload.temperature" };
            groupStage.avgHum = { $avg: "$payload.humidity" };
        } else {
            // For boolean fields like motion, we might want to sum or see if it happened
            // For now, let's just avg it (works for numbers, for booleans it gives a ratio 0-1)
            groupStage.avgValue = { $avg: `$payload.${feed}` };
        }

        const pipeline = [
            { $match: matchStage },
            { $group: groupStage },
            { $sort: { "_id": 1 } } // Sort chronological
        ];


        const results = await SensorData.aggregate(pipeline);
        res.json(results);
    } catch (err) {
        console.error("Analytics error:", err);
        res.status(500).json({ message: "Analytics fetch failed" });
    }
});

// POST /api/iot/simulate (Testing Alerts)
router.post('/simulate', protect, async (req, res) => {
    try {
        const { deviceId, payload } = req.body;
        const targetId = req.user.role === 'guest' ? req.user.managedBy : req.user._id;
        const device = await Device.findOne({ deviceId, owner: targetId });
        if (!device) return res.status(404).json({ message: "Device not found" });
        const anomalyCount = await checkForAnomalies(payload, device.deviceName || deviceId, device, null);
        res.json({ success: true, message: "Simulation successful", anomaliesTriggered: anomalyCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
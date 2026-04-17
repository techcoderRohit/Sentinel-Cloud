// // const express = require('express');
// // const router = express.Router();
// // const { updateSensorData,getLatestData,getDashboardStats,monitorAll,getHistory } = require('../controllers/SensorController');
// // const { validateApiKey, protect } = require('../middleware/authMiddleware');

// // // Public/Device Route (Requires API Key)
// // router.post('/update', validateApiKey,updateSensorData);

// // // Protected Routes (Dashboard usage)
// // router.get('/dashboard-stats', protect, getDashboardStats);
// // router.get('/monitor-all', protect, monitorAll);
// // router.get('/latest/:apiKeyId', protect, getLatestData);
// // router.get('/history/:apiKeyId', protect, getHistory);

// // module.exports = router;

// const express = require('express');
// const SensorData = require('../models/SensorData');
// const ApiKey = require('../models/ApiKey');
// const { validateApiKey, protect } = require('../middleware/authMiddleware');
// const router = express.Router();
// // POST /api/iot/update
// router.post('/update', validateApiKey, async (req, res) => {
//   try {
//     // req.user aur req.apiKeyDoc hume 'validateApiKey' middleware se milenge
//     const { temperature, humidity, status } = req.body;
//     //console.log("Data received from device:",req.body);
    

//     const newData = await SensorData.create({
//       apiKey: req.apiKey._id, // validateApiKey mein isse attach karna hoga
//       owner: req.user, // validateApiKey ne owner ID attach ki hai
//       payload: { temperature, humidity, status }
//     });

//     res.status(201).json({ 
//       success: true, 
//       message: "Data synced to Sentinel Cloud" 
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Data storage failed" });
//   }
// });

// // GET /api/iot/latest/:apiKeyId
// router.get('/latest/:apiKeyId', async (req, res) => {
//     try {
//         const latestData = await SensorData.findOne({ apiKey: req.params.apiKeyId })
//             .sort({ timestamp: -1 }); // Sabse naya data upar
        
//         if (!latestData) {
//             return res.status(404).json({ message: "No data found for this device" });
//         }

//         res.json(latestData);
//     } catch (err) {
//         res.status(500).json({ message: "Server Error" });
//     }
// });

// router.get('/dashboard-stats', protect, async (req, res) => {
//     try {
//         const targetId = req.user.role === 'guest' ? req.user.managedBy : req.user._id;
//         const deviceQuery = { owner: targetId };
        
//         if (req.user.role === 'guest' && req.user.allowedDevices && req.user.allowedDevices.length > 0) {
//             deviceQuery._id = { $in: req.user.allowedDevices };
//         } else if (req.user.role === 'guest') {
//             // Guest with no allowed devices sees zero devices
//             return res.json({ totalDevices: 0, totalDataPoints: 0, activeDevices: 0 });
//         }
        
//         // 1. Total Keys (Devices) kitne hain
//         const totalDevices = await ApiKey.countDocuments(deviceQuery);

//         // 2. Total kitna data points jama hue hain
//         const totalDataPoints = await SensorData.countDocuments({ 
//             apiKey: { $in: await ApiKey.find(deviceQuery).distinct('_id') } 
//         });

//         // 3. Active Devices (Jo pichle 10 min mein active the)
//         const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
//         const activeDevices = await ApiKey.countDocuments({ 
//             ...deviceQuery,
//             lastUsed: { $gt: tenMinsAgo } 
//         });

//         res.json({ totalDevices, totalDataPoints, activeDevices });
//     } catch (err) {
//         res.status(500).json({ message: "Stats fetch failed" });
//     }
// });

// router.get('/monitor-all', protect, async (req, res) => {
//     try {
//         const targetId = req.user.role === 'guest' ? req.user.managedBy : req.user._id;
//         const deviceQuery = { owner: targetId };
        
//         if (req.user.role === 'guest' && req.user.allowedDevices && req.user.allowedDevices.length > 0) {
//             deviceQuery._id = { $in: req.user.allowedDevices };
//         } else if (req.user.role === 'guest') {
//             return res.json([]);
//         }

//         const keys = await ApiKey.find(deviceQuery);
        
//         // Har key ke liye latest data map karein
//         const deviceStatus = await Promise.all(keys.map(async (key) => {
//             const latest = await SensorData.findOne({ apiKey: key._id }).sort({ timestamp: -1 });
//             return {
//                 _id: key._id,
//                 name: key.name,
//                 lastUsed: key.lastUsed,
//                 data: latest ? latest.payload : null
//             };
//         }));

//         res.json(deviceStatus);
//     } catch (err) {
//         res.status(500).json({ message: "Monitoring failed" });
//     }
// });

// // POST /api/iot/control/:deviceId
// router.post('/control/:deviceId', protect, async (req, res) => {
//     try {
//         const { deviceId } = req.params;
//         const { status } = req.body; // e.g. true or false (actuator switch)

//         // Verify permission if guest
//         if (req.user.role === 'guest') {
//             if (!req.user.permissions || !req.user.permissions.includes('control_devices')) {
//                 return res.status(403).json({ success: false, message: 'Access Denied: You do not have permission to control devices' });
//             }
//             if (req.user.allowedDevices && !req.user.allowedDevices.includes(deviceId)) {
//                 return res.status(403).json({ success: false, message: 'Access Denied: You cannot control this device' });
//             }
//         }

//         // Validate Key Existence
//         const targetId = req.user.role === 'guest' ? req.user.managedBy : req.user._id;
//         const key = await ApiKey.findOne({ _id: deviceId, owner: targetId });
        
//         if (!key) {
//              return res.status(404).json({ success: false, message: 'Device not found' });
//         }

//         // We fetch the latest payload and create a new record mimicking an action update 
//         // to propagate the command status forward
//         const latest = await SensorData.findOne({ apiKey: key._id }).sort({ timestamp: -1 });
//         const newPayload = latest ? { ...latest.payload, status: status } : { temperature: 0, humidity: 0, status: status };

//         await SensorData.create({
//             apiKey: key._id,
//             owner: targetId,
//             payload: newPayload
//         });
        
//         // Note: In a fully distributed MQTT environment, you would also use mqttClient.publish(`sentinel/device/${key.key}/command`, JSON.stringify({status}))
        
//         res.status(200).json({ success: true, message: `Device ${key.name} turned ${status ? 'ON' : 'OFF'}`, data: newPayload });

//     } catch (err) {
//         console.error("Control mapping error:", err);
//         res.status(500).json({ message: "Control action failed" });
//     }
// });

// //Monitor API KEY USAGE ROUTE
// // Get stats for a specific key
// router.get('/stats/:keyId', protect, async (req, res) => {
//     const key = await ApiKey.findById(req.params.keyId);
//     const dataCount = await SensorData.countDocuments({ apiKey: req.params.keyId });
//     res.json({ 
//         usageCount: key.usageCount, 
//         totalDataPoints: dataCount,
//         lastActive: key.lastUsed 
//     });
// });

// // GET /api/iot/history/:apiKeyId
// router.get('/history/:apiKeyId', protect, async (req, res) => {
//     try {
//         // Hum pichle 50 records mangwa rahe hain (Charts ke liye kaafi hain)
//         const history = await SensorData.find({ apiKey: req.params.apiKeyId })
//             .sort({ timestamp: -1 }) // Naya data pehle
//             .limit(50);

//         // Chart ke liye data ko "Old to New" order mein reverse karna hoga
//         res.json(history.reverse());
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "History fetch failed" });
//     }
// });

// module.exports = router;


const express = require('express');
const SensorData = require('../models/SensorData');
const Device = require('../models/Device');
const { validateApiKey, protect } = require('../middleware/authMiddleware');
const router = express.Router();
// POST /api/iot/update
router.post('/update', validateApiKey, async (req, res) => {
    try {
        // req.user aur req.device hume 'validateApiKey' middleware se milenge
        const { temperature, humidity, status } = req.body;

        const newData = await SensorData.create({
            deviceId: req.device.deviceId,
            owner: req.device.owner,
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

// POST /api/iot/control/:deviceId
router.post('/control/:deviceId', protect, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { status } = req.body; // e.g. true or false (actuator switch)

        // Verify permission if guest
        if (req.user.role === 'guest') {
            if (!req.user.permissions || !req.user.permissions.includes('control_devices')) {
                return res.status(403).json({ success: false, message: 'Access Denied: You do not have permission to control devices' });
            }
            if (req.user.allowedDevices && !req.user.allowedDevices.includes(deviceId)) {
                return res.status(403).json({ success: false, message: 'Access Denied: You cannot control this device' });
            }
        }

        // Validate Key Existence
        const targetId = req.user.role === 'guest' ? req.user.managedBy : req.user._id;
const device = await Device.findOne({ _id: deviceId, owner: targetId });
        
        if (!device) {
             return res.status(404).json({ success: false, message: 'Device not found' });
        }

        // We fetch the latest payload and create a new record mimicking an action update 
        // to propagate the command status forward
        const latest = await SensorData.findOne({ deviceId: device.deviceId }).sort({ timestamp: -1 });
        const newPayload = latest ? { ...latest.payload, status: status } : { temperature: 0, humidity: 0, status: status };

        await SensorData.create({
            deviceId: device.deviceId,
            owner: targetId,
            payload: newPayload
        });

        // Note: In a fully distributed MQTT environment, you would also use mqttClient.publish(`sentinel/device/${device.apiKey}/command`, JSON.stringify({status}))

        res.status(200).json({ success: true, message: `Device ${device.deviceName || device.name || device.apiKey} turned ${status ? 'ON' : 'OFF'}`, data: newPayload });

    } catch (err) {
        console.error("Control mapping error:", err);
        res.status(500).json({ message: "Control action failed" });
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

// GET /api/iot/history/:apiKeyId
router.get('/history/:apiKeyId', protect, async (req, res) => {
    try {
        const device = await Device.findOne({ apiKey: req.params.apiKeyId, owner: req.user._id });
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
        const { range } = req.query; // '1H', '24H', '7D', '1M', '1Y'
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

        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: "$timestamp" } },
                    avgTemp: { $avg: "$payload.temperature" },
                    avgHum: { $avg: "$payload.humidity" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } } // Sort chronological
        ];

        const results = await SensorData.aggregate(pipeline);
        res.json(results);
    } catch (err) {
        console.error("Analytics error:", err);
        res.status(500).json({ message: "Analytics fetch failed" });
    }
});

module.exports = router;
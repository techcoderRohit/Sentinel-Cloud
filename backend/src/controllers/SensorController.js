const SensorData = require('../models/SensorData');
const ApiKey = require('../models/ApiKey');

// 1. Update Sensor Data
const updateSensorData = async (req, res) => {
    try {
        const { temperature, humidity, status } = req.body;
        const newData = await SensorData.create({
            apiKey: req.apiKey._id, 
            owner: req.user, 
            payload: { temperature, humidity, status }
        });
        res.status(201).json({ success: true, message: "Data synced to Sentinel Cloud" });
    } catch (err) {
        res.status(500).json({ message: "Data storage failed" });
    }
};

// 2. Get Latest Data
const getLatestData = async (req, res) => {
    try {
        const latestData = await SensorData.findOne({ apiKey: req.params.apiKeyId }).sort({ timestamp: -1 });
        if (!latestData) return res.status(404).json({ message: "No data found" });
        res.json(latestData);
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
};

// 3. Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const totalDevices = await ApiKey.countDocuments({ owner: userId });
        const userApiKeys = await ApiKey.find({ owner: userId }).distinct('_id');
        const totalDataPoints = await SensorData.countDocuments({ apiKey: { $in: userApiKeys } });
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        const activeDevices = await ApiKey.countDocuments({ owner: userId, lastUsed: { $gt: tenMinsAgo } });

        res.json({ totalDevices, totalDataPoints, activeDevices });
    } catch (err) {
        res.status(500).json({ message: "Stats fetch failed" });
    }
};

// 4. Monitor All Devices
const monitorAll = async (req, res) => {
    try {
        const keys = await ApiKey.find({ owner: req.user._id });
        const deviceStatus = await Promise.all(keys.map(async (key) => {
            const latest = await SensorData.findOne({ apiKey: key._id }).sort({ timestamp: -1 });
            return { _id: key._id, name: key.name, lastUsed: key.lastUsed, data: latest ? latest.payload : null };
        }));
        res.json(deviceStatus);
    } catch (err) {
        res.status(500).json({ message: "Monitoring failed" });
    }
};

// 5. Get History (For Charts)
const getHistory = async (req, res) => {
    try {
        const history = await SensorData.find({ apiKey: req.params.apiKeyId }).sort({ timestamp: -1 }).limit(50);
        res.json(history.reverse());
    } catch (err) {
        res.status(500).json({ message: "History fetch failed" });
    }
};

module.exports = {updateSensorData,getLatestData,getDashboardStats,monitorAll,getHistory};
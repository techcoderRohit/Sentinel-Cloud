const SensorData = require('../models/SensorData');
const Device = require('../models/Device');

// 1. Update Sensor Data
const updateSensorData = async (req, res) => {
    try {
        const { temperature, humidity, status } = req.body;
        const newData = await SensorData.create({
            owner: req.device.owner,
            deviceId: req.device.deviceId,
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
        const device = await Device.findOne({ apiKey: req.params.apiKeyId, owner: req.user._id });
        if (!device) return res.status(404).json({ message: "Device not found" });

        const latestData = await SensorData.findOne({ deviceId: device.deviceId }).sort({ timestamp: -1 });
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
        const totalDevices = await Device.countDocuments({ owner: userId });
        const userDeviceIds = await Device.find({ owner: userId }).distinct('deviceId');
        const totalDataPoints = await SensorData.countDocuments({ deviceId: { $in: userDeviceIds } });
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
        const activeDevices = await Device.countDocuments({ owner: userId, lastActive: { $gt: tenMinsAgo } });

        res.json({ totalDevices, totalDataPoints, activeDevices });
    } catch (err) {
        res.status(500).json({ message: "Stats fetch failed" });
    }
};

// 4. Monitor All Devices
const monitorAll = async (req, res) => {
    try {
        const devices = await Device.find({ owner: req.user._id });
        const deviceStatus = await Promise.all(devices.map(async (device) => {
            const latest = await SensorData.findOne({ deviceId: device.deviceId }).sort({ timestamp: -1 });
            return { _id: device._id, deviceId: device.deviceId, name: device.deviceName || device.name, lastActive: device.lastActive, data: latest ? latest.payload : null };
        }));
        res.json(deviceStatus);
    } catch (err) {
        res.status(500).json({ message: "Monitoring failed" });
    }
};

// 5. Get History (For Charts)
const getHistory = async (req, res) => {
    try {
        const device = await Device.findOne({ apiKey: req.params.apiKeyId, owner: req.user._id });
        if (!device) return res.status(404).json({ message: "Device not found" });

        const history = await SensorData.find({ deviceId: device.deviceId }).sort({ timestamp: -1 }).limit(50);
        res.json(history.reverse());
    } catch (err) {
        res.status(500).json({ message: "History fetch failed" });
    }
};

module.exports = {updateSensorData,getLatestData,getDashboardStats,monitorAll,getHistory};
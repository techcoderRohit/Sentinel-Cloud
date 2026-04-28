const express = require('express');
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { getClient } = require('../mqtt/mqttHandler');
const Device = require('../models/Device');
const router = express.Router();

const FIRMWARE_DIR = path.join(__dirname, '../../firmware');

// Ensure directory exists
if (!fs.existsSync(FIRMWARE_DIR)) {
    fs.mkdirSync(FIRMWARE_DIR, { recursive: true });
}

// 1. DEPLOY CODE (POST /api/ota/deploy)
router.post('/deploy', protect, async (req, res) => {
    const { deviceId, code } = req.body;
    console.log(deviceId, code);
    if (!deviceId || !code) {
        return res.status(400).json({ success: false, message: "Missing Device ID or Code" });
    }

    try {
        const device = await Device.findOne({ deviceId, owner: req.user._id });
        if (!device) {
            return res.status(404).json({ success: false, message: "Device not found or not owned by you" });
        }

        const deviceFolder = path.join(FIRMWARE_DIR, deviceId);
        if (!fs.existsSync(deviceFolder)) {
            fs.mkdirSync(deviceFolder, { recursive: true });
        }

        const filePath = path.join(deviceFolder, 'main.py');
        fs.writeFileSync(filePath, code);

        // Notify device via MQTT
        const mqttClient = getClient();
        if (mqttClient && mqttClient.connected) {
            const serverUrl = process.env.OTA_SERVER_URL || 'http://10.190.69.133:5000'; // Updated default to current laptop IP
            const updateMsg = JSON.stringify({
                cmd: "update",
                url: `${serverUrl}/api/ota/download/${deviceId}`
            });

            mqttClient.publish(`sentinel/device/${deviceId}/ota_update`, updateMsg);
            console.log(`🚀 OTA Triggered for ${deviceId}: ${updateMsg}`);

            res.json({ success: true, message: "Firmware staged and OTA trigger sent!" });
        } else {
            res.status(503).json({ success: false, message: "Bridge offline. Code saved, but OTA trigger failed." });
        }

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. DOWNLOAD FIRMWARE (GET /api/ota/download/:deviceId)
router.get('/download/:deviceId', async (req, res) => {
    const { deviceId } = req.params;
    const filePath = path.join(FIRMWARE_DIR, deviceId, 'main.py');

    if (fs.existsSync(filePath)) {
        res.download(filePath, 'main.py');
    } else {
        res.status(404).json({ message: "No firmware found for this device" });
    }
});

// 3. GET CURRENT FIRMWARE (GET /api/ota/current/:deviceId)
router.get('/current/:deviceId', protect, async (req, res) => {
    const { deviceId } = req.params;
    const filePath = path.join(FIRMWARE_DIR, deviceId, 'main.py');

    if (fs.existsSync(filePath)) {
        const code = fs.readFileSync(filePath, 'utf-8');
        res.json({ success: true, code });
    } else {
        res.json({ success: true, code: "# Welcome to Sentinel OTA\n# Start writing your MicroPython code here\n\nimport time\nprint('Hello from OTA!')" });
    }
});

module.exports = router;

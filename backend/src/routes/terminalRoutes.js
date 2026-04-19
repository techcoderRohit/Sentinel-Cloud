const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getClient } = require('../mqtt/mqttHandler');
const Device = require('../models/Device');

// POST: /api/terminal
router.post('/', protect, async (req, res) => {
    try {
        const { command, deviceId } = req.body;

        if (!command) {
            return res.status(400).json({ output: "No command provided", color: "#f87171" });
        }

        const cmd = command.toLowerCase().trim();

        // 1. Handle Local/Virtual Commands
        if (cmd === 'clear') {
            return res.json({ output: "CLEAR_TERMINAL" });
        }
        
        if (cmd === 'help' && !deviceId) {
            return res.json({ 
                output: "Sentinel Pro Terminal\n-------------------\n- clear: Clear screen\n- status: Local system check\n\nConnect a device to use hardware REPL commands.",
                color: "#60a5fa"
            });
        }

        // 2. Hardware Bridge (Requires deviceId)
        if (!deviceId) {
            return res.status(400).json({ output: "No device selected for this REPL session", color: "#fbbf24" });
        }

        const targetId = req.user.role === 'guest' ? req.user.managedBy : req.user._id;
        const device = await Device.findOne({ _id: deviceId, owner: targetId });

        if (!device) {
            return res.status(404).json({ output: "Device not found or access denied", color: "#f87171" });
        }

        const mqtt = getClient();
        if (mqtt && mqtt.connected) {
            const topic = `sentinel/device/${device.deviceId}/repl/rx`;
            mqtt.publish(topic, JSON.stringify({ command: command }));
            return res.json({ output: `Sending to ${device.deviceId}...`, color: "#94a3b8" });
        } else {
            return res.status(503).json({ output: "MQTT Bridge Offline", color: "#f87171" });
        }

    } catch (error) {
        console.error("Terminal Bridge Error:", error);
        res.status(500).json({ output: "Internal Server Error", color: "#f87171" });
    }
});

module.exports = router;
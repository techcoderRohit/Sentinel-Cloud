const mqtt = require('mqtt');

// Local Broker IP use kar rahe hain
const brokerUrl = 'mqtt://localhost:1883';
const mqttClient = mqtt.connect(brokerUrl);

mqttClient.on('connect', () => {
    console.log('✅ Sentinel SocketHandler: MQTT Client Connected to local broker');
});

const initializeSockets = (io) => {
    io.on('connection', (socket) => {
        console.log(`[Socket.io] 🛰️ Client connected: ${socket.id}`);
        let currentRxTopic = null;

        // 1. Dashboard se Device attach karna
        socket.on('attach_device', ({ deviceId }) => {
            if (!deviceId) return;
            console.log(`[Socket.io] 🔗 Attaching REPL to: ${deviceId}`);

            if (currentRxTopic) {
                mqttClient.unsubscribe(currentRxTopic);
            }

            // Pattern: sentinel/device/ESP32_Sensor_Node/repl/tx
            currentRxTopic = `sentinel/device/${deviceId}/repl/tx`;

            mqttClient.subscribe(currentRxTopic, (err) => {
                if (err) console.error("❌ MQTT Sub error:", err);
                else console.log(`📡 Subscribed to Device TX: ${currentRxTopic}`);
            });

            socket.emit('terminal_output', {
                type: 'system',
                text: `> Attached to device ${deviceId}`,
                color: '#22d3ee'
            });
        });

        // 2. Dashboard se Command bhejna (RX)
        socket.on('terminal_command', ({ deviceId, command }) => {
            if (!deviceId || !command) return;

            console.log(`[Socket.io] ⌨️ Sending command to ${deviceId}: ${command}`);
            const payload = JSON.stringify({ command: command.trim() });

            // Topic pattern: sentinel/device/ESP32_Sensor_Node/repl/rx
            mqttClient.publish(`sentinel/device/${deviceId}/repl/rx`, payload);
        });

        // 3. Direct Code Execution (Multiline Script)
        socket.on('execute_script', ({ deviceId, code }) => {
            if (!deviceId || !code) return;

            console.log(`[Socket.io] 📝 Sending execution block to ${deviceId}`);
            // Wrap in an 'execute' key to tell hardware to run exec()
            const payload = JSON.stringify({ execute: code });

            mqttClient.publish(`sentinel/device/${deviceId}/repl/rx`, payload);
        });

        // 3. OTA Code Update
        socket.on('update_code', ({ deviceId, filename, content }) => {
            if (!deviceId) return;
            const payload = JSON.stringify({ filename, content });
            mqttClient.publish(`sentinel/device/${deviceId}/repl/file`, payload);

            socket.emit('terminal_output', {
                type: 'system',
                text: `> Deploying ${filename} to ${deviceId}...`,
                color: '#4ade80'
            });
        });

        socket.on('disconnect', () => {
            if (currentRxTopic) {
                mqttClient.unsubscribe(currentRxTopic);
            }
            console.log(`[Socket.io] ❌ Client disconnected: ${socket.id}`);
        });
    });

    // 4. Global MQTT Message Handler (Device -> Broker -> Dashboard)
    mqttClient.on('message', (topic, message) => {
        const parts = topic.split('/');

        // Topic Match: sentinel/device/:deviceId/repl/tx
        if (parts.length === 5 && parts[4] === 'tx') {
            const deviceId = parts[2];
            let messageData;

            try {
                // Agar device JSON bhej raha hai
                messageData = JSON.parse(message.toString());
            } catch (err) {
                // Agar device sirf raw text bhej raha hai (Fallback)
                messageData = { output: message.toString(), color: '#94a3b8' };
            }

            // Frontend WebRepl.jsx isi event ko sun raha hai
            io.emit('terminal_output_raw', { deviceId, data: messageData });

            // Debugging ke liye log
            console.log(`[MQTT -> UI] From ${deviceId}:`, messageData.output || messageData);

            // 5. OTA Acknowledgment tracking
            if (messageData.output && (messageData.output.includes('Success: Wrote') || messageData.output.includes('Flash Error'))) {
                const OtaDeployment = require('../models/OtaDeployment');
                const isSuccess = messageData.output.includes('Success: Wrote');

                OtaDeployment.findOneAndUpdate(
                    { deviceApiKey: deviceId, status: { $in: ['pending', 'deployed'] } },
                    {
                        status: isSuccess ? 'acknowledged' : 'failed',
                        acknowledgedAt: new Date()
                    },
                    { sort: { createdAt: -1 }, new: true }
                ).then(deployment => {
                    if (deployment) {
                        io.emit('ota_status_update', {
                            deploymentId: deployment._id,
                            status: deployment.status,
                            deviceApiKey: deviceId,
                            message: messageData.output
                        });
                    }
                }).catch(err => console.error('[OTA] DB Update Error:', err.message));
            }
        }
    });
};

module.exports = initializeSockets;
// const mqtt = require('mqtt');

// // Use the same broker as the rest of the app
// const brokerUrl = 'mqtt://172.18.85.133:1883';
// const mqttClient = mqtt.connect(brokerUrl);

// mqttClient.on('connect', () => {
//     console.log('SocketHandler MQTT Client Connected');
// });

// const initializeSockets = (io) => {
//     io.on('connection', (socket) => {
//         console.log(`[Socket.io] Client connected: ${socket.id}`);

//         // Track the current MQTT topic the socket is listening to
//         let currentRxTopic = null;

//         // When frontend user logs into a device shell
//         socket.on('attach_device', ({ deviceId }) => {
//             console.log(`[Socket.io] attaching REPL to device: ${deviceId}`);

//             // Clean up previous subscription if any
//             if (currentRxTopic) {
//                 mqttClient.unsubscribe(currentRxTopic);
//             }

//             currentRxTopic = `sentinel/device/${deviceId}/repl/tx`;

//             // Subscribe to device output
//             mqttClient.subscribe(currentRxTopic, (err) => {
//                 if (err) console.error("MQTT Subscription error:", err);
//             });

//             // Let the frontend know we're attached
//             socket.emit('terminal_output', { 
//                 type: 'system', 
//                 text: `> Attached to device ${deviceId}`, 
//                 color: '#22d3ee' 
//             });
//         });

//         // When frontend sends a terminal command
//         socket.on('terminal_command', ({ deviceId, command }) => {
//             if (!deviceId) {
//                 return socket.emit('terminal_output', {
//                     type: 'error',
//                     text: 'Error: No device attached.',
//                     color: '#f87171'
//                 });
//             }

//             const payload = JSON.stringify({ command });
//             mqttClient.publish(`sentinel/device/${deviceId}/repl/rx`, payload);
//         });

//         // When frontend uploads a py script to update the device
//         socket.on('update_code', ({ deviceId, filename, content }) => {
//             if (!deviceId) return;

//             const payload = JSON.stringify({ filename, content });
//             // Let the device handle file writing
//             mqttClient.publish(`sentinel/device/${deviceId}/repl/file`, payload);

//             socket.emit('terminal_output', {
//                 type: 'system',
//                 text: `> Sent ${filename} (${Buffer.byteLength(content, 'utf8')} bytes) to device ${deviceId} via MQTT`,
//                 color: '#4ade80'
//             });
//         });

//         socket.on('disconnect', () => {
//             console.log(`[Socket.io] Client disconnected: ${socket.id}`);
//             if (currentRxTopic) {
//                 mqttClient.unsubscribe(currentRxTopic);
//             }
//         });
//     });

//     // Handle incoming MQTT messages and route them to all sockets tuned into the right device
//     mqttClient.on('message', (topic, message) => {
//         // topic pattern: sentinel/device/:deviceId/repl/tx


//         const parts = topic.split('/');
//         if (parts.length === 5 && parts[0] === 'sentinel' && parts[1] === 'device' && parts[3] === 'repl' && parts[4] === 'tx') {
//             const deviceId = parts[2];
//             try {
//                 // expecting JSON { output: "...", color: "#..." } or plain text
//                 const data = JSON.parse(message.toString());

//                 // Emitting to all connected sockets.
//                 io.emit('terminal_output_raw', { deviceId, data });

//                 // OTA Deployment Acknowledgment Tracking
//                 if (data.output && (data.output.includes('Success: Wrote') || data.output.includes('Flash Error'))) {
//                     const OtaDeployment = require('../models/OtaDeployment');
//                     const isSuccess = data.output.includes('Success: Wrote');

//                     // Find the most recent pending/deployed OTA for this device
//                     OtaDeployment.findOneAndUpdate(
//                         { deviceApiKey: deviceId, status: { $in: ['pending', 'deployed'] } },
//                         { 
//                             status: isSuccess ? 'acknowledged' : 'failed',
//                             acknowledgedAt: new Date()
//                         },
//                         { sort: { createdAt: -1 }, new: true }
//                     ).then(deployment => {
//                         if (deployment) {
//                             io.emit('ota_status_update', {
//                                 deploymentId: deployment._id,
//                                 status: deployment.status,
//                                 deviceApiKey: deviceId,
//                                 filename: deployment.filename,
//                                 message: data.output
//                             });
//                             console.log(`[OTA] Deployment ${deployment._id} status: ${deployment.status}`);
//                         }
//                     }).catch(err => {
//                         console.error('[OTA] Ack tracking error:', err.message);
//                     });
//                 }

//             } catch (err) {
//                 // If it's plain text (like raw stdout from hardware)
//                 io.emit('terminal_output_raw', { 
//                     deviceId, 
//                     data: { output: message.toString(), color: '#94a3b8' } 
//                 });
//             }
//         }
//     });
// };

// module.exports = initializeSockets;

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
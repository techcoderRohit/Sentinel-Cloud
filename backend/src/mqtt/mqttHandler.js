const mqtt = require('mqtt');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const ApiKey = require('../models/ApiKey');
const { checkForAnomalies } = require('../services/anomalyDetector');

// In-memory cache for speed (optional, survives only until restart)
// Auth fallback always goes to DB, so restart is safe
const authenticatedDevices = new Map();

let mqttClient = null;

const connectMQTT = (io) => {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://192.168.18.247:1883';
    mqttClient = mqtt.connect(brokerUrl);
    const client = mqttClient;

    client.on('connect', () => {
        console.log('🛡️  Sentinel Bridge: Connected to MQTT Broker');

        // Topic subscriptions with confirmation
        client.subscribe('sensors/data', (err) => {
            if (!err) console.log('📡 Subscribed to: sensors/data');
            else console.error('❌ Subscription Error (sensors/data):', err);
        });

        client.subscribe('sentinel/auth', (err) => {
            if (!err) console.log('📡 Subscribed to: sentinel/auth');
            else console.error('❌ Subscription Error (sentinel/auth):', err);
        });

        client.subscribe('sentinel/device/+/repl/tx', (err) => {
            if (!err) console.log('📡 Subscribed to: REPL TX');
            else console.error('❌ Subscription Error (REPL TX):', err);
        });
    });

    client.on('message', async (topic, message) => {
        console.log(`📥 Bridge Received: [${topic}] -> ${message.toString().substring(0, 50)}...`);
        try {
            // ==== 1. HANDSHAKE PROCESSING ====
            if (topic === 'sentinel/auth') {
                try {
                    const rawData = JSON.parse(message.toString());
                    const { clientId, apiKey } = rawData;

                    console.log(`🔑 Handshake Attempt: Device [${clientId}] with Key [${apiKey.substring(0, 8)}...]`);

                    // 1. Verify API Key exists and is active
                    const keyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });
                    if (!keyDoc) {
                        console.log(`❌ Auth Denied: Invalid or inactive API Key.`);
                        client.publish(`sentinel/device/${clientId}/auth_tx`, JSON.stringify({ status: "denied", reason: "invalid_key" }));
                        return;
                    }

                    // 2. Verify Device exists and belongs to the same user as the API Key
                    const device = await Device.findOne({ deviceId: clientId, owner: keyDoc.owner });

                    if (device) {
                        // Cache the device object for telemetry speed
                        authenticatedDevices.set(clientId, device);

                        // Update API Key usage stats (Optional but good practice)
                        keyDoc.usageCount = (keyDoc.usageCount || 0) + 1;
                        keyDoc.lastUsed = new Date();
                        await keyDoc.save();

                        console.log(`✅ Auth Success: Device [${clientId}] linked to User [${keyDoc.owner}]`);
                        client.publish(`sentinel/device/${clientId}/auth_tx`, JSON.stringify({ status: "authorized" }));
                    } else {
                        console.log(`⚠️ Auth Denied: Device [${clientId}] not registered to this user.`);
                        client.publish(`sentinel/device/${clientId}/auth_tx`, JSON.stringify({ status: "denied", reason: "device_not_registered" }));
                    }
                } catch (parseErr) {
                    console.error('❌ Handshake Parse Error:', parseErr.message);
                }
                return;
            }

            // ==== 2. TELEMETRY PROCESSING ====
            if (topic === 'sensors/data') {
                const rawData = JSON.parse(message.toString());
                const { clientId, temperature, humidity } = rawData;

                // PRIMARY: Check in-memory cache first (populated by handshake)
                let device = authenticatedDevices.get(clientId);

                // SECONDARY: If not in cache, fallback to DB lookup
                if (!device) {
                    device = await Device.findOne({ deviceId: clientId });
                    if (device) {
                        authenticatedDevices.set(clientId, device);
                    }
                }

                if (!device) {
                    console.log(`⚠️ Unauthorized/Unknown device [${clientId}]! Register it on the dashboard first.`);
                    return;
                }

                // Update device lastActive timestamp & status
                device.lastActive = new Date();
                device.status = 'Online';
                await device.save();

                // Save sensor reading to DB
                await SensorData.create({
                    owner: device.owner,
                    deviceId: clientId,
                    payload: {
                        temperature: parseFloat(temperature),
                        humidity: parseFloat(humidity),
                        status: true
                    }
                });

                // Emit live update to dashboard via Socket.io
                io.emit('telemetry_update', {
                    _id: device._id,
                    apiKey: device.apiKey,
                    deviceId: clientId,
                    deviceName: device.deviceName || clientId,
                    payload: {
                        temperature: temperature,
                        humidity: humidity
                    },
                    lastUsed: new Date()
                });

                // CHECK FOR ANOMALIES & TRIGGERS
                checkForAnomalies({ temperature, humidity }, device.deviceName || clientId, device, io);

                console.log(`✅ Sentinel Cloud Updated: ${device.deviceName || clientId}`);
            }

            // ==== 3. REPL OUTPUT PROCESSING ====
            if (topic.startsWith('sentinel/device/') && topic.endsWith('/repl/tx')) {
                const parts = topic.split('/');
                const clientId = parts[2]; // sentinel/device/{clientId}/repl/tx
                const data = JSON.parse(message.toString());

                console.log(`💻 REPL Output from [${clientId}]: ${data.output}`);

                // Broadcast to dashboard
                io.emit('repl_output', {
                    deviceId: clientId,
                    output: data.output,
                    color: data.color || '#94a3b8'
                });
                return;
            }

        } catch (err) {
            console.error('❌ Bridge Logic Error:', err.message);
        }
    });

    client.on('error', (err) => {
        console.error('❌ MQTT Connection Error:', err);
    });
};

module.exports = { connectMQTT, getClient: () => mqttClient };
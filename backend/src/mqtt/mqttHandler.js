const mqtt = require('mqtt');
const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const ApiKey = require('../models/ApiKey');

// In-memory cache for speed (optional, survives only until restart)
// Auth fallback always goes to DB, so restart is safe
const authenticatedDevices = new Map();

const connectMQTT = (io) => {
    // 1. MQTT Broker se connect karein (Local IP ya localhost)
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    const client = mqtt.connect(brokerUrl);

    client.on('connect', () => {
        console.log('🛡️  Sentinel Bridge: Connected to MQTT Broker');
        // Topic wahi rakhein jo ESP32 publish kar raha hai
        client.subscribe('sensors/data');
        // Application layer auth handshake topic
        client.subscribe('sentinel/auth');
    });

    client.on('message', async (topic, message) => {
        try {
            // ==== 1. HANDSHAKE PROCESSING ====
            if (topic === 'sentinel/auth') {
                const rawData = JSON.parse(message.toString());
                const { clientId, apiKey } = rawData;
                
                const keyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });
                if (keyDoc) {
                    authenticatedDevices.set(clientId, keyDoc);
                    console.log(`🔑 Device [${clientId}] authenticated successfully!`);
                    client.publish(`sentinel/device/${clientId}/auth_tx`, JSON.stringify({ status: "authorized" }));
                } else {
                    console.log(`⚠️ Unauthorized login attempt by [${clientId}]`);
                    client.publish(`sentinel/device/${clientId}/auth_tx`, JSON.stringify({ status: "denied" }));
                }
                return;
            }

            // ==== 2. TELEMETRY PROCESSING ====
            if (topic === 'sensors/data') {
                const rawData = JSON.parse(message.toString());
                const { clientId, temperature, humidity } = rawData;

                console.log(`📩 Data received from Node: ${clientId}`);

                // PRIMARY: Always look up by clientId (deviceId) in the Device collection.
                // This survives backend restarts — no dependency on the in-memory Map.
                let device = await Device.findOne({ deviceId: clientId });

                // FALLBACK: If Map has a cached keyDoc (from this session's handshake),
                // use it as backup to find the device by apiKey
                if (!device && authenticatedDevices.has(clientId)) {
                    const keyDoc = authenticatedDevices.get(clientId);
                    device = await Device.findOne({ apiKey: keyDoc.key });
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
                    apiKey: device.apiKey,
                    deviceId: clientId,
                    deviceName: device.deviceName || clientId,
                    payload: {
                        temperature: temperature,
                        humidity: humidity
                    },
                    lastUsed: new Date()
                });

                console.log(`✅ Sentinel Cloud Updated: ${device.deviceName || clientId}`);
            }

        } catch (err) {
            console.error('❌ Bridge Logic Error:', err.message);
        }
    });

    client.on('error', (err) => {
        console.error('❌ MQTT Connection Error:', err);
    });
};

module.exports = connectMQTT;
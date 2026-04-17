const mqtt = require('mqtt');
const Device = require('../models/Device')
const SensorData = require('../models/SensorData'); // Path check kar lein
const ApiKey = require('../models/ApiKey');       // Path check kar lein

const authenticatedDevices = new Map();

const connectMQTT = (io) => {
    // 1. MQTT Broker se connect karein (Local IP ya localhost)
    const client = mqtt.connect('mqtt://localhost:1883');

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
                // Parse karein
                const rawData = JSON.parse(message.toString());
                const { clientId, temperature, humidity, apiKey } = rawData;

                console.log(`📩 Data received from Node: ${clientId}`);

                // Security Check: Fast cache memory lookup
                let keyDoc;
                if (authenticatedDevices.has(clientId)) {
                    keyDoc = authenticatedDevices.get(clientId);
                } else if (apiKey) {
                    // Fallback backward compatibility for legacy packets with keys
                    keyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });
                }

                if (!keyDoc) {
                    console.log(`⚠️ Unauthorized Sensor Data from [${clientId}]! Rejecting. (Not logged in)`);
                    return;
                }

                const updateDevice = await Device.findOneAndUpdate({deviceId: clientId}, {data : {temperature,humidity},lastUsed: new Date()}, {new : true});

                // 4. Database mein entry save karein
                const newData = await SensorData.create({
                    owner: keyDoc.owner,
                    deviceId: clientId, // ESP32 ka physical ID
                    payload: {
                        temperature: parseFloat(temperature),
                        humidity: parseFloat(humidity),
                        status: true // Online status
                    }
                });

            // 5. ApiKey collection mein lastUsed update karein (Online status ke liye)
            keyDoc.lastUsed = new Date();
            await keyDoc.save();

            // 6. SOCKET.IO EMIT: Dashboard ko live update bhejein
            // Note: 'telemetry_update' wahi event name hai jo aapke frontend mein hai
            io.emit('telemetry_update', {
                apiKey: device?.apiKey || keyDoc?.key || keyDoc?._id,
                deviceId: clientId,
                deviceName: device?.deviceName || device?.name || keyDoc?.name || clientId,
                payload: {
                    temperature: temperature,
                    humidity: humidity
                },
                lastUsed: new Date()
            });

            console.log(`✅ Sentinel Cloud Updated: ${keyDoc.name}`);
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
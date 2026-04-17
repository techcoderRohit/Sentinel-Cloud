const mqtt = require('mqtt');
const Device = require('../models/Device')
const SensorData = require('../models/SensorData'); // Path check kar lein
const ApiKey = require('../models/ApiKey');       // Path check kar lein

const connectMQTT = (io) => {
    // 1. MQTT Broker se connect karein (Local IP ya localhost)
    const client = mqtt.connect('mqtt://localhost:1883');

    client.on('connect', () => {
        console.log('🛡️  Sentinel Bridge: Connected to MQTT Broker');
        // Topic wahi rakhein jo ESP32 publish kar raha hai
        client.subscribe('sensors/data');
    });

    client.on('message', async (topic, message) => {
        try {
            // 2. Data Parse karein
            const rawData = JSON.parse(message.toString());
            const { clientId, temperature, humidity, apiKey } = rawData;

            console.log(`📩 Data received from Node: ${clientId}`);

            const updateDevice = await Device.findOneAndUpdate({deviceId: clientId}, {data : {temperature,humidity},lastUsed: new Date()}, {new : true});

            // 3. Security Check: Kya API Key valid hai?
            // Hum 'key' (unique string) se search kar rahe hain
            const keyDoc = await ApiKey.findOne({ key: apiKey, isActive: true });

            if (!keyDoc) {
                console.log('⚠️ Unauthorized Key! Rejecting data.');
                return;
            }

            // 4. Database mein entry save karein
            const newData = await SensorData.create({
                apiKey: keyDoc._id,
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
                apiKey: keyDoc._id, // Dashboard isi ID se device ko pehchanta hai
                deviceName: keyDoc.name,
                payload: {
                    temperature: temperature,
                    humidity: humidity
                },
                lastUsed: new Date()
            });

            console.log(`✅ Sentinel Cloud Updated: ${keyDoc.name}`);

        } catch (err) {
            console.error('❌ Bridge Logic Error:', err.message);
        }
    });

    client.on('error', (err) => {
        console.error('❌ MQTT Connection Error:', err);
    });
};

module.exports = connectMQTT;
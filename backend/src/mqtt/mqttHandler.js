const mqtt = require('mqtt');
const SensorData = require('../models/SensorData');
const ApiKey = require('../models/ApiKey');

const connectMQTT = () => {
    const client = mqtt.connect('mqtt://broker.hivemq.com');

    client.on('connect', () => {
        console.log('Connected to HiveMQ Broker');
        // Saare devices ke update topic ko subscribe karein
        // Wildcard '+' use kiya hai taaki kisi bhi API Key ka data catch ho sake
        client.subscribe('sentinel/device/+/update');
    });

    client.on('message', async (topic, message) => {
        try {
            // Topic se API Key nikaalein (sentinel/device/KEY/update)
            const topicParts = topic.split('/');
            const receivedKey = topicParts[2];

            // 1. API Key validate karein
            const apiKeyDoc = await ApiKey.findOne({ key: receivedKey });
            if (!apiKeyDoc) return console.log("Invalid API Key via MQTT");

            // 2. Data parse karein
            const payload = JSON.parse(message.toString());
            const { temperature, humidity, status } = payload;

            // 3. Database mein save karein (Jaise Controller mein karte the)
            await SensorData.create({
                apiKey: apiKeyDoc._id,
                owner: apiKeyDoc.owner,
                payload: { temperature, humidity, status }
            });

            // 4. API Key ka usage update karein
            apiKeyDoc.lastUsed = Date.now();
            apiKeyDoc.usageCount += 1;
            await apiKeyDoc.save();

            console.log(`Data saved for device: ${apiKeyDoc.name}`);
        } catch (err) {
            console.error("MQTT Processing Error:", err);
        }
    });
};

module.exports = connectMQTT;
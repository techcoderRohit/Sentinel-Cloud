const mqtt = require('mqtt');

// Configuration from main.py
const BROKER_URL = 'mqtt://192.168.46.102';
const TOPIC = 'sensors/data';

console.log(`🔍 Sentinel MQTT Monitor: Connecting to ${BROKER_URL}...`);

const client = mqtt.connect(BROKER_URL);

client.on('connect', () => {
    console.log('✅ Connected! Waiting for sensor data...');
    client.subscribe(TOPIC);
});

client.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        const timeStr = new Date().toLocaleTimeString();

        // Formatting the output for better readability
        console.log(`\n[${timeStr}] 📩 New Telemetry Received:`);
        console.log(`-----------------------------------`);
        console.log(`Device ID : ${data.clientId}`);
        console.log(`Temperature: ${data.temperature}°C`);
        console.log(`Humidity   : ${data.humidity}%`);
        console.log(`Timestamp  : ${data.timestamp}`);
        console.log(`-----------------------------------`);

    } catch (err) {
        console.log(`⚠️ Received non-JSON message on ${topic}:`, message.toString());
    }
});

client.on('error', (err) => {
    console.error('❌ MQTT Error:', err.message);
});

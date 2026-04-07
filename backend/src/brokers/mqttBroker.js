const { Aedes } = require('aedes');
const server = require('net').createServer();

const startMQTT = async () => {
    const aedes = await Aedes.createBroker();
    server.listen(1883, () => {
        console.log('MQTT Broker running on port 1883');
    });

    // Jab device data bhejta hai
    aedes.on('publish', (packet, client) => {
        if (client) {
            const payload = packet.payload.toString();
            const topic = packet.topic;
            console.log(`Data from ${client.id}: ${payload} on ${topic}`);
            
            // Yahan aap Database mein save karne ka function call karenge
        }
    });
};

module.exports = startMQTT;
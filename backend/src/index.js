require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const { connectMQTT } = require('./mqtt/mqttHandler');
// 1. Start the MQTT Broker (Ye aapke broker.js ko run kar dega)
require("./brokers/broker");

// 2. Import Express App & Database
const app = require('./app');
const connectDB = require('./config/db');

// 3. Import Socket Handler
const initializeSockets = require('./sockets/socketHandler');

// 4. Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// 5. Create Main HTTP Server for Express & Socket.io
const server = http.createServer(app);

// 6. Initialize Socket.io (For React Dashboard)
const io = new Server(server, {
    cors: {
        origin: "*", // React UI ko connect karne allow karega
        methods: ["GET", "POST"]
    }
});

// 7. Attach Socket Logic (Telemetry, Terminal, OTA)
initializeSockets(io);

// 8. Expose 'io' to Express routes (Agar kisi API route me socket emit karna ho)
app.set('io', io);

// 9. Start the Main Server
server.listen(PORT, () => {
    console.log(`\n🌟 Main Backend Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`📡 Dashboard WebSocket Bridge is ready on http://localhost:${PORT}`);
    connectMQTT(io);
});
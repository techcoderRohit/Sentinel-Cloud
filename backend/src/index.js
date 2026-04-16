// require('dotenv').config();
// const http = require('http');
// const app = require('./app');
// require("./brokers/broker");
// //const connectMQTT = require('./mqtt/mqttHandler')

// const connectDB = require('./config/db');
// //database connection
// connectDB();

// const PORT = process.env.PORT || 5000;
// const server = http.createServer(app);

// // server.listen(PORT,'172.18.85.133', ()=>{
// //     console.log(`Server running in ${process.env.Node_ENV || 'development'} node on port ${PORT}`);
// // })

// server.listen(PORT,  () => {
//     console.log(`Server running in ${process.env.Node_ENV || 'development'} node on port ${PORT}`);
//     //connectMQTT();
// })


require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const connectMQTT = require('./mqtt/mqttHandler');
const initializeSockets = require('./sockets/socketHandler');

const connectDB = require('./config/db');
//database connection
connectDB();

const PORT = process.env.PORT || 5100;
const server = http.createServer(app);

// initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

initializeSockets(io);

// Expose io to Express routes (used by OTA deploy)
app.set('io', io);

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.Node_ENV || 'development'} on port ${PORT}`);
    // Boot up the unified MQTT bridging
    connectMQTT(io);
});
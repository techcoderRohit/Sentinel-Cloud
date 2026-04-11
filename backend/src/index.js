require('dotenv').config();
const http = require('http');
const app = require('./app');
//require("./brokers/mqttClient");
//const connectMQTT = require('./mqtt/mqttHandler')

const connectDB = require('./config/db');
//database connection
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// server.listen(PORT,'172.18.85.133', ()=>{
//     console.log(`Server running in ${process.env.Node_ENV || 'development'} node on port ${PORT}`);
// })

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.Node_ENV || 'development'} node on port ${PORT}`);
    //connectMQTT();
})
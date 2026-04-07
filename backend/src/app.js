//import packages
const express = require('express');
const startMQTT = require('./brokers/mqttBroker')
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboard = require("./routes/dashboard");

startMQTT();
//Create app
const app = express();

//Middleware setup
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/user",userRoutes);
app.use('/api/dashboard', dashboard);
app.use("/api/devices",deviceRoutes);
app.use("/api/admin",adminRoutes);

//Test route
app.get('/', (req,res)=>{
    res.send("API is running...");
})


// Export app
module.exports = app;


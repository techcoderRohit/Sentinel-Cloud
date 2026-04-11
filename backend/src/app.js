//import packages
const express = require('express');
//const startMQTT = require('./brokers/mqttBroker')
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const dashboard = require("./routes/dashboardRoutes");
const ApiKeysRoutes = require('./routes/ApiKeysRoutes');
const SensorDataRoutes = require('./routes/SensorDataRoutes');
const terminalRoutes = require('./routes/terminal');
//startMQTT();
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
app.use('/api/apikeys', ApiKeysRoutes);
app.use('/api/iot',SensorDataRoutes);
app.use('/api/terminal',terminalRoutes);

//Test route
app.get('/', (req,res)=>{
    res.send("API is running...");
})

app.post('/sensor-data', (req, res) => {
    const data = req.body;
    console.log("Data received from ESP32:", data);
    
    // Yahan aap Database mein save kar sakte hain
    // res.send se ESP32 ko confirmation milti hai
    res.status(200).send({ status: "Success", message: "Data received" });
});

app.listen(5000, '0.0.0.0', () => {
    console.log('HTTP Cloud Server running on port 5000');
});




// Export app
module.exports = app;


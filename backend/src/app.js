//import packages
const express = require('express');

const cors = require('cors');
const path = require('path');
const authRoutes = require("./routes/authRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const guestRoutes = require("./routes/guestRoutes");
const dashboard = require("./routes/dashboardRoutes");
const ApiKeysRoutes = require('./routes/ApiKeysRoutes');
const SensorDataRoutes = require('./routes/SensorDataRoutes');
const NotificationRoutes = require('./routes/NotificationRoutes')
const terminalRoutes = require('./routes/terminalRoutes');
const aiRoutes = require('./routes/aiRoutes');
const otaRoutes = require('./routes/otaRoutes');
const triggerRoutes = require('./routes/triggerRoutes');
const contactRoutes = require('./routes/contactRoutes');
//startMQTT();
//Create app


const app = express();

//Middleware setup
app.use(cors({
    origin: "*",
    credentials: true
}));
app.use(express.json());

//Serve uploaded files (profile pictures)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/guests", guestRoutes);
app.use('/api/dashboard', dashboard);
app.use("/api/devices", deviceRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/apikeys', ApiKeysRoutes);
app.use('/api/iot', SensorDataRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications',NotificationRoutes)
app.use('/api/ota', otaRoutes);
app.use('/api/triggers', triggerRoutes);
app.use('/api/contact', contactRoutes);

//Test route
app.get('/', (req, res) => {
    res.send("API is running...");
})

app.post('/sensor-data', (req, res) => {
    const data = req.body;
    console.log("Data received from ESP32:", data);

    // Yahan aap Database mein save kar sakte hain
    // res.send se ESP32 ko confirmation milti hai
    res.status(200).send({ status: "Success", message: "Data received" });
});




// Export app
module.exports = app;
//import packages
const express = require('express');
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");
const deviceRoutes = require("./routes/deviceRoutes");


//Create app
const app = express();

//Middleware setup
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/devices",deviceRoutes);

//Test route
app.get('/', (req,res)=>{
    res.send("API is running...");
})


// Export app
module.exports = app;


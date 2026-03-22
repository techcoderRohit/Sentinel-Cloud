//import packages
const express = require('express');
const cors = require('cors');
const authRoutes = require("./routes/authRoutes");

//Create app
const app = express();

//Middleware setup
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);

//Test route
app.get('/', (req,res)=>{
    res.send("API is running...");
})


// Export app
module.exports = app;


//import packages
const express = require('express');
const cors = require('cors');

//Create app
const app = express();

//Middleware setup
app.use(cors());
app.use(express.json());

//Test route
app.get('/', (req,res)=>{
    res.send("API is running...");
})


// Export app
module.exports = app;


//import packages
import express from "express";
import cors from "cors";

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
export default app;

import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

connectDB();

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=>{
    console.log(`Server running on ${PORT}`);
})
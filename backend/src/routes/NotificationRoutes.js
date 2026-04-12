const express = require('express'); 
const router = express.Router();
const Notification = require('../models/Notification'); 

// 1. Naya Alert Save Karne Ka API (POST)
router.post('/create', async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;

        if(!userId || !title) {
            return res.status(400).json({ success: false, message: "Missing fields" });
        }

        const newNotification = new Notification({ userId, title, message, type });
        await newNotification.save();
        
        res.status(201).json({ success: true, data: newNotification });
    } catch (error) {
        console.error("POST Error:", error); // Terminal mein error dekhne ke liye
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. User Ke Saare Alerts Fetch Karne Ka API (GET)
router.get('/:userId', async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 });
         //console.log(req.params.userId);
         //console.log(notifications.length);
         
        res.status(200).json({ 
            success: true, 
            data: notifications || [] // Agar null ho toh empty array bhejein
        });
    } catch (error) {
        console.error("GET Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
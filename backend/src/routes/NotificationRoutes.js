const express = require('express'); 
const router = express.Router();
const Notification = require('../models/Notification'); 
const {protect} = require('../middleware/authMiddleware');

// 1. Naya Alert Save Karne Ka API (POST)
router.post('/create', protect, async (req, res) => {
    try {
        const { title, message, type } = req.body;
const userId = req.user.id;  //middleware se user id nikelegi

        const newNotification = new Notification({ userId, title, message, type });
        await newNotification.save();
        
        res.status(201).json({ success: true, data: newNotification });
    } catch (error) {
        console.error(" Error:", error); // Terminal mein error dekhne ke liye
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Logged-in users ke alerts fetch karna
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
         //console.log(req.params.userId);
         //console.log(notifications.length);
         
        res.status(200).json({ 
            success: true, 
            count: notifications.length,
            data: notifications || [] // Agar null ho toh empty array bhejein
        });
    } catch (error) {
        console.error("GET Error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
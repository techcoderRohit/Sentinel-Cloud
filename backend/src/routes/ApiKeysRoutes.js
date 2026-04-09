const express = require('express');
const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
// 1. Generate New Key (JWT Protected)
router.post('/generate', protect, async (req, res) => {
    try {
        //check karein user mil raha h ya nhi
        if(!req.user || !req.user._id){
            return res.status(401).json({message:"User not authenticated"});
        }
        const rawkey = `sk-sentinel-${crypto.randomBytes(16).toString('hex')}`;
        const newKey = await ApiKey.create({
            key:rawkey,
            owner: req.user._id,
            name: req.body.name || `Device-${Date.now()}`
        });
        
        res.status(201).json(newKey);
    } catch (err) {
        console.log("Server error:",err);
        
        res.status(500).json({ message: "Server Error" });
    }
});

// 2. Get User's Keys
router.get('/', protect, async (req, res) => {
    const keys = await ApiKey.find({ owner: req.user._id }).sort('-createdAt');
    res.json(keys);
});

// 3. Delete/Revoke Key (Ye missing tha)
router.delete('/:id', protect, async (req, res) => {
    try {
        const key = await ApiKey.findOne({ _id: req.params.id, owner: req.user._id });
        if (!key) return res.status(404).json({ message: "Key not found" });
        
        await ApiKey.findByIdAndDelete(req.params.id);
        res.json({ message: "Key deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
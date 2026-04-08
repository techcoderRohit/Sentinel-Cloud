// // const express = require('express');
// // const router = express.Router();
// // const { generateKey } = require('../controllers/apiKeyController');
// // const { protect,validateApiKey } = require('../middleware/authMiddleware'); // JWT protect

// // router.post('/generate', protect, generateKey);

// // module.exports = router;

// const express = require('express');
// const router = express.Router();

// // Middleware ko import karein
// const { protect, validateApiKey } = require('../middleware/authMiddleware'); 

// // Controller functions ko import karein (agar alag file mein hain)
// // const { createApiKey, getMyKeys } = require('../controllers/apiKeyController');

// /**
//  * SCENARIO A: JWT Protect use karna 
//  * (User login hai aur apni API keys dekhna/banana chahta hai)
//  */
// router.post('/generate', protect, async (req, res) => {
//     // Yahan sirf login user hi aa sakta hai
//     // req.user mein user ki details hogi (protect middleware ki wajah se)
//     res.json({ message: "API Key generated for user: " + req.user.id });
// });

// /**
//  * SCENARIO B: validateApiKey use karna
//  * (User apni API Key ke zariye data access kar raha hai)
//  */
// router.get('/data', validateApiKey, (req, res) => {
//     // Yahan request tabhi aayegi jab header mein 'x-api-key' sahi hoga
//     res.json({ message: "Access granted via API Key!" });
// });

// module.exports = router;

// routes/apiKeyRoutes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const ApiKey = require('../models/ApiKey');
const { protect } = require('../middleware/authMiddleware');

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
const express = require('express');
const Dashboard = require('../models/Dashboard');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.put('/save-layout', protect, async (req, res) => {
  const { widgets } = req.body;
  try {
    // Agar pehle se layout hai toh update karo, nahi toh naya banao
    const updatedDashboard = await Dashboard.findOneAndUpdate(
      { userId: req.user._id.toString() },
      { widgets },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: "Layout saved permanently!", data: updatedDashboard });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "DB Error",
      message: err.message
    });
  }
});

// User ka saved dashboard nikalne ke liye
router.get('/get-layout', protect, async (req, res) => {
  try {
    console.log(req.user._id.toString());
    
    const dashboard = await Dashboard.findOne({ userId: req.user._id.toString() });
    if (!dashboard) {
      return res.status(404).json({ message: "No layout found" });
    }
    res.json({ success: true, widgets: dashboard.widgets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/getall', async (req, res) => {
  try {
    const dashboard = await Dashboard.find();

    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;


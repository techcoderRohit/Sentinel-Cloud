const express = require('express');
const Dashboard = require('../models/Dashboard');
const router = express.Router();

router.post('/save-layout', async (req, res) => {
  const { userId, widgets } = req.body;
  try {
    if (!userId) {
      return res.status(400).json({
        messsage: "user id is required"
      });
    }

    // Agar pehle se layout hai toh update karo, nahi toh naya banao
    const updatedDashboard = await Dashboard.findOneAndUpdate(
      { userId: userId },
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
router.get('/get-layout/:userId', async (req, res) => {
  try {
    const dashboard = await Dashboard.findOne({ userId: req.params.userId });
    if (!dashboard) {
      return res.status(404).json({ message: "No layout found" });
    }
    res.json({ success: true, widgets: dashboard.widgets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;


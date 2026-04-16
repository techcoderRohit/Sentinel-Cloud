// // const express = require('express');
// // const Dashboard = require('../models/Dashboard');
// // const { protect } = require('../middleware/authMiddleware');
// // const router = express.Router();

// // // 1. SAVE LAYOUT: Isko POST rakhein kyunki frontend se POST request aa rahi hai
// // router.post('/save-layout', protect, async (req, res) => {
// //   const { widgets } = req.body;

// //   try {
// //     // req.user._id humein protect middleware se milta hai token verify hone ke baad
// //     const userId = req.user._id;

// //     if (!widgets) {
// //       return res.status(400).json({ success: false, message: "Widgets data is missing" });
// //     }

// //     const updatedDashboard = await Dashboard.findOneAndUpdate(
// //       { userId: userId }, // Is user ka layout dhoondo
// //       { widgets: widgets }, // Naya data update karo
// //       { upsert: true, new: true } // Agar nahi hai toh naya banao (upsert)
// //     );

// //     res.json({
// //       success: true,
// //       message: "Layout saved successfully!",
// //       data: updatedDashboard
// //     });

// //   } catch (err) {
// //     console.error("Save Layout Error:", err);
// //     res.status(500).json({ success: false, error: "DB Error", message: err.message });
// //   }
// // });

// // // 2. GET LAYOUT: Sirf logged-in user ka layout nikalne ke liye
// // router.get('/get-layout', protect, async (req, res) => {
// //   try {
// //     // Yahan hum token se mili ID use kar rahe hain, isliye ye secure hai
// //     const dashboard = await Dashboard.findOne({ userId: req.user._id });

// //     if (!dashboard) {
// //       // Agar pehle kabhi save nahi kiya, toh khali array bhej dein bajaye error ke
// //       return res.json({ success: true, widgets: [] });
// //     }

// //     res.json({ success: true, widgets: dashboard.widgets });
// //   } catch (err) {
// //     res.status(500).json({ success: false, error: err.message });
// //   }
// // });

// // module.exports = router;



// const express = require('express');
// const Dashboard = require('../models/Dashboard');
// const { protect } = require('../middleware/authMiddleware');
// const router = express.Router();

// // 1. SAVE LAYOUT: Isko POST rakhein kyunki frontend se POST request aa rahi hai
// router.post('/save-layout', protect, async (req, res) => {
//   const { widgets } = req.body;

//   try {
//     // Each user (including guest) has their own unique ID for their own dashboard layout
//     const userId = req.user._id;

//     // Verify permission if guest
//     if (req.user.role === 'guest' && (!req.user.permissions || !req.user.permissions.includes('edit_dashboard'))) {
//       return res.status(403).json({ success: false, message: 'Access Denied: You do not have permission to modify the dashboard' });
//     }

//     if (!widgets) {
//       return res.status(400).json({ success: false, message: "Widgets data is missing" });
//     }

//     const updatedDashboard = await Dashboard.findOneAndUpdate(
//       { userId: userId }, // Is user ka layout dhoondo
//       { widgets: widgets }, // Naya data update karo
//       { upsert: true, new: true } // Agar nahi hai toh naya banao (upsert)
//     );

//     res.json({
//       success: true,
//       message: "Layout saved successfully!",
//       data: updatedDashboard
//     });

//   } catch (err) {
//     console.error("Save Layout Error:", err);
//     res.status(500).json({ success: false, error: "DB Error", message: err.message });
//   }
// });

// // 2. GET LAYOUT: Sirf logged-in user ka layout nikalne ke liye
// router.get('/get-layout', protect, async (req, res) => {
//   try {
//     // Get layout for the logged-in user, regardless of role
//     const targetId = req.user._id;
//     const dashboard = await Dashboard.findOne({ userId: targetId });

//     if (!dashboard) {
//       // Agar pehle kabhi save nahi kiya, toh khali array bhej dein bajaye error ke
//       return res.json({ success: true, widgets: [] });
//     }

//     res.json({ success: true, widgets: dashboard.widgets });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

// module.exports = router;



const express = require('express');
const Dashboard = require('../models/Dashboard');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// 1. SAVE LAYOUT: Isko POST rakhein kyunki frontend se POST request aa rahi hai
router.post('/save-layout', protect, async (req, res) => {
  const { widgets } = req.body;

  try {
    // Each user (including guest) has their own unique ID for their own dashboard layout
    const userId = req.user._id;

    // Verify permission if guest
    if (req.user.role === 'guest' && (!req.user.permissions || !req.user.permissions.includes('edit_dashboard'))) {
      return res.status(403).json({ success: false, message: 'Access Denied: You do not have permission to modify the dashboard' });
    }

    if (!widgets) {
      return res.status(400).json({ success: false, message: "Widgets data is missing" });
    }

    const updatedDashboard = await Dashboard.findOneAndUpdate(
      { userId: userId }, // Is user ka layout dhoondo
      { widgets: widgets }, // Naya data update karo
      { upsert: true, new: true } // Agar nahi hai toh naya banao (upsert)
    );

    res.json({
      success: true,
      message: "Layout saved successfully!",
      data: updatedDashboard
    });

  } catch (err) {
    console.error("Save Layout Error:", err);
    res.status(500).json({ success: false, error: "DB Error", message: err.message });
  }
});

// 2. GET LAYOUT: Sirf logged-in user ka layout nikalne ke liye
router.get('/get-layout', protect, async (req, res) => {
  try {
    // Get layout for the logged-in user, regardless of role
    const targetId = req.user._id;
    const dashboard = await Dashboard.findOne({ userId: targetId });

    if (!dashboard) {
      // Agar pehle kabhi save nahi kiya, toh khali array bhej dein bajaye error ke
      return res.json({ success: true, widgets: [] });
    }

    res.json({ success: true, widgets: dashboard.widgets });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
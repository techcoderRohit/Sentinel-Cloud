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

// 1. GET ALL BOARDS: List names and IDs of boards for the user
router.get('/all', protect, async (req, res) => {
  try {
    const boards = await Dashboard.find({ userId: req.user._id }).select('name description createdAt');
    res.json({ success: true, boards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. CREATE NEW BOARD
router.post('/create', protect, async (req, res) => {
  const { name, description } = req.body;
  try {
    const newBoard = await Dashboard.create({
      userId: req.user._id,
      name: name || "New Dashboard",
      description: description || "",
      widgets: []
    });
    res.status(201).json({ success: true, board: newBoard });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. GET SPECIFIC BOARD LAYOUT
router.get('/:id', protect, async (req, res) => {
  try {
    const board = await Dashboard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!board) {
      return res.status(404).json({ success: false, message: "Dashboard not found" });
    }
    res.json({ success: true, board });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. SAVE/UPDATE LAYOUT for a specific board
router.put('/:id/layout', protect, async (req, res) => {
  const { widgets, name, description } = req.body;
  try {
    const board = await Dashboard.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!board) {
      return res.status(404).json({ success: false, message: "Dashboard not found" });
    }

    if (widgets) board.widgets = widgets;
    if (name) board.name = name;
    if (description) board.description = description;

    await board.save();

    res.json({
      success: true,
      message: "Dashboard updated successfully!",
      board
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. DELETE BOARD
router.delete('/:id', protect, async (req, res) => {
  try {
    const result = await Dashboard.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!result) {
      return res.status(404).json({ success: false, message: "Dashboard not found" });
    }
    res.json({ success: true, message: "Dashboard deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. OBSOLETE Compatibility Route (Optional: For migration)
router.get('/get-layout', protect, async (req, res) => {
  try {
    const board = await Dashboard.findOne({ userId: req.user._id }).sort({ createdAt: 1 });
    if (!board) return res.json({ success: true, widgets: [] });
    res.json({ success: true, widgets: board.widgets, boardId: board._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/save-layout', protect, async (req, res) => {
  const { widgets } = req.body;
  try {
    const board = await Dashboard.findOneAndUpdate(
      { userId: req.user._id },
      { widgets: widgets },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: "Legacy layout saved", boardId: board._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
const express = require('express');
const Dashboard = require('../models/Dashboard');
const User = require('../models/User');
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

// 2. GET BOARDS SHARED WITH ME
router.get('/shared/with-me', protect, async (req, res) => {
  try {
    const boards = await Dashboard.find({ sharedWith: req.user._id })
      .select('name description createdAt userId')
      .populate('userId', 'name email');
    res.json({ success: true, boards });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. OBSOLETE Compatibility Routes (Static first)
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

// 4. CREATE NEW BOARD
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

// 5. PUBLIC FETCH: Get board by shareId (Static-like prefix)
router.get('/shared/:shareId', async (req, res) => {
  try {
      const board = await Dashboard.findOne({ shareId: req.params.shareId }).select('name description widgets createdAt');
      if (!board) return res.status(404).json({ success: false, message: "Shared dashboard not found" });

      res.json({ success: true, board });
  } catch (err) {
      res.status(500).json({ success: false, error: err.message });
  }
});

// 6. GET SPECIFIC BOARD LAYOUT (Parameterized - Should be after static)
router.get('/:id', protect, async (req, res) => {
  try {
    const board = await Dashboard.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { sharedWith: req.user._id }
      ]
    });
    if (!board) {
      return res.status(404).json({ success: false, message: "Dashboard not found" });
    }
    const isOwner = board.userId.toString() === req.user._id.toString();
    res.json({ success: true, board, isOwner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. SAVE/UPDATE LAYOUT for a specific board
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

// 8. DELETE BOARD
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

// 9. TOGGLE SHARING / GENERATE SHARE ID
router.put('/:id/share', protect, async (req, res) => {
    try {
        const board = await Dashboard.findOne({ _id: req.params.id, userId: req.user._id });
        if (!board) return res.status(404).json({ success: false, message: "Dashboard not found" });

        // Generate a shareId if it doesn't exist
        if (!board.shareId) {
            const crypto = require('crypto');
            board.shareId = crypto.randomBytes(8).toString('hex');
            await board.save();
        }

        res.json({ success: true, shareId: board.shareId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 10. SHARE BOARD WITH A REGISTERED USER BY EMAIL
router.post('/:id/share-with-user', protect, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const board = await Dashboard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!board) return res.status(404).json({ success: false, message: 'Dashboard not found or you are not the owner' });

    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) return res.status(404).json({ success: false, message: `No registered user found with email: ${email}` });

    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot share a board with yourself' });
    }

    if (board.sharedWith.map(id => id.toString()).includes(targetUser._id.toString())) {
      return res.status(400).json({ success: false, message: `Board is already shared with ${email}` });
    }

    board.sharedWith.push(targetUser._id);
    await board.save();

    res.json({ success: true, message: `Board shared with ${targetUser.name} (${email})` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. REVOKE SHARE ACCESS FOR A USER
router.delete('/:id/revoke-user', protect, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const board = await Dashboard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!board) return res.status(404).json({ success: false, message: 'Dashboard not found or you are not the owner' });

    const targetUser = await User.findOne({ email: email.toLowerCase() });
    if (!targetUser) return res.status(404).json({ success: false, message: `No user found with email: ${email}` });

    board.sharedWith = board.sharedWith.filter(id => id.toString() !== targetUser._id.toString());
    await board.save();

    res.json({ success: true, message: `Access revoked for ${email}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. GET USERS A BOARD IS SHARED WITH (for the owner to manage)
router.get('/:id/shared-users', protect, async (req, res) => {
  try {
    const board = await Dashboard.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('sharedWith', 'name email');
    if (!board) return res.status(404).json({ success: false, message: 'Dashboard not found' });
    res.json({ success: true, sharedUsers: board.sharedWith });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
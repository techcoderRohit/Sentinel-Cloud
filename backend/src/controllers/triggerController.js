const Trigger = require('../models/Trigger');

// @desc    Get all triggers for current user
// @route   GET /api/triggers
exports.getTriggers = async (req, res) => {
  try {
    const triggers = await Trigger.find({ userId: req.user._id });
    res.status(200).json({ success: true, data: triggers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new trigger
// @route   POST /api/triggers
exports.createTrigger = async (req, res) => {
  try {
    req.body.userId = req.user._id;
    const trigger = await Trigger.create(req.body);
    res.status(201).json({ success: true, data: trigger });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a trigger
// @route   DELETE /api/triggers/:id
exports.deleteTrigger = async (req, res) => {
  try {
    const trigger = await Trigger.findById(req.params.id);
    if (!trigger) {
      return res.status(404).json({ success: false, message: 'Trigger not found' });
    }
    if (trigger.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    await trigger.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle trigger status
// @route   PATCH /api/triggers/:id/toggle
exports.toggleTrigger = async (req, res) => {
  try {
    const trigger = await Trigger.findById(req.params.id);
    if (!trigger) {
      return res.status(404).json({ success: false, message: 'Trigger not found' });
    }
    trigger.isActive = !trigger.isActive;
    await trigger.save();
    res.status(200).json({ success: true, data: trigger });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

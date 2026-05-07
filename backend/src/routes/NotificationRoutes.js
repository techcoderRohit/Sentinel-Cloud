const express = require('express');
const router = express.Router();
const SendAlert = require('../utils/alertService');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// 1. Create a new alert (POST /api/notifications/create)
router.post('/create', protect, async (req, res) => {
    try {
        const { title, message, type } = req.body;
        const userId = req.user._id;

        const newNotification = new Notification({ userId, title, message, type });
        await newNotification.save();

        // Dispatch external alerts (Telegram + Email) — fire and forget
        SendAlert(req.user, { title, message }).catch(err => {
            console.error('[NotificationRoutes] External alert dispatch failed:', err.message);
        });

        res.status(201).json({ success: true, data: newNotification });
    } catch (error) {
        console.error("Create notification error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Get unread count (GET /api/notifications/unread-count)
router.get('/unread-count', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Mark all notifications as read (PUT /api/notifications/read-all)
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Get all notifications (GET /api/notifications/)
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications || []
        });
    } catch (error) {
        console.error("GET notifications error:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5. Mark single notification as read (PUT /api/notifications/read/:id)
router.put('/read/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. Delete a notification (DELETE /api/notifications/:id)
router.delete('/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Create a new guest user
// @route   POST /api/guests
// @access  Private (user or admin)
const createGuest = async (req, res) => {
    try {
        const { name, email, password, permissions, allowedDevices } = req.body;

        // check if user already exists
        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password, // Password hashed in pre-save middleware
            role: 'guest',
            managedBy: req.user.id,
            permissions: permissions || [],
            allowedDevices: allowedDevices || []
        });

        res.status(201).json({
            success: true,
            message: 'Guest created successfully',
            data: {
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                allowedDevices: user.allowedDevices
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all guests created by current user
// @route   GET /api/guests
// @access  Private (user or admin)
const getGuests = async (req, res) => {
    try {
        const guests = await User.find({ managedBy: req.user.id }).select('-password');
        res.status(200).json({
            success: true,
            count: guests.length,
            data: guests
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a guest's permissions
// @route   PUT /api/guests/:id
// @access  Private
const updateGuest = async (req, res) => {
    try {
        const guest = await User.findById(req.params.id);
        
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }

        // Verify ownership
        if (guest.managedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to manage this guest' });
        }

        const { permissions, allowedDevices } = req.body;
        
        if (permissions) {
            guest.permissions = permissions;
        }
        if (allowedDevices) {
            guest.allowedDevices = allowedDevices;
        }

        await guest.save();

        res.status(200).json({
            success: true,
            message: 'Guest updated',
            data: guest
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a guest
// @route   DELETE /api/guests/:id
// @access  Private
const deleteGuest = async (req, res) => {
    try {
        const guest = await User.findById(req.params.id);
        
        if (!guest) {
            return res.status(404).json({ message: 'Guest not found' });
        }

        // Verify ownership
        if (guest.managedBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized to manage this guest' });
        }

        await guest.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Guest removed'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createGuest,
    getGuests,
    updateGuest,
    deleteGuest
};

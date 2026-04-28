const User = require('../models/User');
const Device = require('../models/Device');
const ApiKey = require('../models/ApiKey');
const SensorData = require('../models/SensorData');
const mongoose = require('mongoose');
const { isConnected: isMqttConnected } = require('../mqtt/mqttHandler');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin only
const getAdminDashboardStats = async (req, res) => {
    try {
        // User stats
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const activeUsers = await User.countDocuments({ role: { $ne: 'admin' }, isActive: true, isBlocked: false });
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        const guestUsers = await User.countDocuments({ role: 'guest' });

        // Device stats
        const totalDevices = await Device.countDocuments();
        const onlineDevices = await Device.countDocuments({ status: 'Online' });
        const offlineDevices = await Device.countDocuments({ status: 'Offline' });

        // Sensor data stats
        const totalDataPoints = await SensorData.countDocuments();

        // New users this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newUsersThisWeek = await User.countDocuments({
            createdAt: { $gte: oneWeekAgo },
            role: { $ne: 'admin' }
        });

        // Previous week users (for trend calculation)
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const usersLastWeek = await User.countDocuments({
            createdAt: { $gte: twoWeeksAgo, $lt: oneWeekAgo },
            role: { $ne: 'admin' }
        });

        // Calculate user trend
        let userTrend = 0;
        if (usersLastWeek > 0) {
            userTrend = ((newUsersThisWeek - usersLastWeek) / usersLastWeek) * 100;
        } else if (newUsersThisWeek > 0) {
            userTrend = 100;
        }

        // New devices this week
        const newDevicesThisWeek = await Device.countDocuments({
            createdAt: { $gte: oneWeekAgo }
        });

        // User registration trend (last 7 days)
        const registrationTrend = [];
        for (let i = 6; i >= 0; i--) {
            const dayStart = new Date();
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setHours(23, 59, 59, 999);

            const count = await User.countDocuments({
                createdAt: { $gte: dayStart, $lte: dayEnd },
                role: { $ne: 'admin' }
            });
            registrationTrend.push({
                date: dayStart.toISOString().split('T')[0],
                count
            });
        }

        // Device type distribution
        const deviceTypeDistribution = await Device.aggregate([
            { $group: { _id: '$deviceType', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    blocked: blockedUsers,
                    guests: guestUsers,
                    newThisWeek: newUsersThisWeek,
                    trend: parseFloat(userTrend.toFixed(1))
                },
                devices: {
                    total: totalDevices,
                    online: onlineDevices,
                    offline: offlineDevices,
                    newThisWeek: newDevicesThisWeek
                },
                dataPoints: totalDataPoints,
                registrationTrend,
                deviceTypeDistribution: deviceTypeDistribution.map(d => ({
                    type: d._id || 'Sensor',
                    count: d.count
                }))
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users with pagination, search, filter
// @route   GET /api/admin/users?page=1&limit=20&search=&role=&status=
// @access  Admin only
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || '';
        const status = req.query.status || '';

        // Build query
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (role) {
            query.role = role;
        }

        if (status === 'active') {
            query.isBlocked = false;
            query.isActive = true;
        } else if (status === 'blocked') {
            query.isBlocked = true;
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password -resetOTP -resetOTPExpire')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get device count for each user
        const usersWithDeviceCount = await Promise.all(
            users.map(async (user) => {
                const deviceCount = await Device.countDocuments({ owner: user._id });
                return {
                    ...user.toObject(),
                    deviceCount
                };
            })
        );

        res.status(200).json({
            success: true,
            data: usersWithDeviceCount,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single user details with their devices
// @route   GET /api/admin/users/:id
// @access  Admin only
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -resetOTP -resetOTPExpire');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const devices = await Device.find({ owner: user._id });
        const apiKeys = await ApiKey.find({ owner: user._id }).select('-key');

        res.status(200).json({
            success: true,
            data: {
                user,
                devices,
                apiKeys
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Block/Unblock a user
// @route   PUT /api/admin/users/:id/block
// @access  Admin only
const blockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent blocking other admins
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot block an admin account' });
        }

        // Toggle blocked status
        user.isBlocked = !user.isBlocked;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
            isBlocked: user.isBlocked
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user and cascade delete their data
// @route   DELETE /api/admin/users/:id
// @access  Admin only
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting admin accounts
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete an admin account' });
        }

        // Cascade delete: devices, API keys, sensor data
        const userDevices = await Device.find({ owner: user._id });
        const deviceIds = userDevices.map(d => d.deviceId);

        // Delete sensor data for all user's devices
        if (deviceIds.length > 0) {
            await SensorData.deleteMany({ deviceId: { $in: deviceIds } });
        }

        // Delete devices
        await Device.deleteMany({ owner: user._id });

        // Delete API keys
        await ApiKey.deleteMany({ owner: user._id });

        // Delete user
        await User.findByIdAndDelete(user._id);

        res.status(200).json({
            success: true,
            message: 'User and all associated data deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all devices across all users
// @route   GET /api/admin/devices?page=1&limit=20&search=&status=&type=
// @access  Admin only
const getAllDevices = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || '';
        const deviceType = req.query.type || '';

        let query = {};

        if (search) {
            query.$or = [
                { deviceName: { $regex: search, $options: 'i' } },
                { deviceId: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        if (deviceType) {
            query.deviceType = deviceType;
        }

        const total = await Device.countDocuments(query);
        const devices = await Device.find(query)
            .populate('owner', 'name email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            data: devices,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin delete any device
// @route   DELETE /api/admin/devices/:id
// @access  Admin only
const deleteDeviceAdmin = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);

        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Delete associated sensor data
        await SensorData.deleteMany({ deviceId: device.deviceId });

        await device.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Device and associated data deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent user activity (last 50 logins)
// @route   GET /api/admin/activity
// @access  Admin only
const getActivityLog = async (req, res) => {
    try {
        const recentLogins = await User.find({ lastLogin: { $ne: null } })
            .select('name email role lastLogin isBlocked')
            .sort({ lastLogin: -1 })
            .limit(50);

        // Recently registered users
        const recentRegistrations = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({
            success: true,
            data: {
                recentLogins,
                recentRegistrations
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system health info
// @route   GET /api/admin/system-health
// @access  Admin only
const getSystemHealth = async (req, res) => {
    try {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();
        const dbState = mongoose.connection.readyState;
        const mqttStatus = isMqttConnected();

        const dbStateMap = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting'
        };

        res.status(200).json({
            success: true,
            data: {
                server: {
                    uptime: Math.floor(uptime),
                    uptimeFormatted: formatUptime(uptime),
                    nodeVersion: process.version,
                    platform: process.platform,
                    pid: process.pid,
                    env: process.env.NODE_ENV || 'development',
                    status: 'Operational'
                },
                memory: {
                    rss: formatBytes(memoryUsage.rss),
                    heapTotal: formatBytes(memoryUsage.heapTotal),
                    heapUsed: formatBytes(memoryUsage.heapUsed),
                    external: formatBytes(memoryUsage.external),
                    heapUsedPercentage: ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(1)
                },
                database: {
                    status: dbStateMap[dbState] || 'Unknown',
                    isConnected: dbState === 1,
                    host: mongoose.connection.host || 'N/A',
                    name: mongoose.connection.name || 'N/A'
                },
                mqtt: {
                    status: mqttStatus ? 'Connected' : 'Disconnected',
                    isConnected: mqttStatus
                },
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper functions
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

module.exports = {
    getAdminDashboardStats,
    getAllUsers,
    getUserById,
    blockUser,
    deleteUser,
    getAllDevices,
    deleteDeviceAdmin,
    getActivityLog,
    getSystemHealth
};

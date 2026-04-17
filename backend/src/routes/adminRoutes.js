// // const express = require('express');
// // const {protect} = require('../middleware/authMiddleware');
// // const authorizeRoles = require('../middleware/roleMiddleware');

// // const router = express.Router();

// // //admin dashboard

// // router.get('/dashboard',protect,authorizeRoles('admin'),(req,res)=>{
// //     res.json({
// //         message : "Welcome Admin"
// //     });
// // });

// // module.exports = router;


// const express = require('express');
// const { protect } = require('../middleware/authMiddleware');
// const authorizeRoles = require('../middleware/roleMiddleware');

// const router = express.Router();

// //admin dashboard

// router.get('/dashboard', protect, authorizeRoles('admin'), (req, res) => {
//     res.json({
//         message: "Welcome Admin"
//     });
// });

// module.exports = router;

const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
    getAdminDashboardStats,
    getAllUsers,
    getUserById,
    blockUser,
    deleteUser,
    getAllDevices,
    deleteDeviceAdmin,
    getActivityLog,
    getSystemHealth
} = require('../controllers/adminController');
const router = express.Router();

// All routes are protected + admin only
router.use(protect, authorizeRoles('admin'));

// Dashboard stats
router.get('/stats', getAdminDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);

// Device management
router.get('/devices', getAllDevices);
router.delete('/devices/:id', deleteDeviceAdmin);

// Activity & system
router.get('/activity', getActivityLog);
router.get('/system-health', getSystemHealth);

module.exports = router;
// const express = require('express');
// const {registerDevice, getMyDevices, deleteDevice} = require('../controllers/deviceController');
// const {protect} = require('../middleware/authMiddleware');
// const authorizeRoles = require('../middleware/roleMiddleware');
// const router = express.Router();

// router.post("/register",protect,authorizeRoles("user","admin"), registerDevice);

// router.get("/my-devices",protect ,authorizeRoles("user","admin"), getMyDevices);

// router.delete('/:id',protect, authorizeRoles('admin') , deleteDevice);

// module.exports = router;

const express = require('express');
const { registerDevice, getMyDevices, deleteDevice } = require('../controllers/deviceController');
const { protect } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const router = express.Router();

router.post("/register", protect, authorizeRoles("user", "admin"), registerDevice);
router.get("/", protect, authorizeRoles("user", "admin"), getMyDevices);
router.get("/my-devices", protect, authorizeRoles("user", "admin"), getMyDevices);

router.delete('/:id', protect, authorizeRoles('admin'), deleteDevice);

module.exports = router;
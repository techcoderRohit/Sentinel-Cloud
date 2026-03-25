const express = require('express');
const {registerDevice, getMyDevices, deleteDevice} = require('../controllers/deviceController');
const {protect,adminOnly} = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const router = express.Router();

router.post("/",protect, registerDevice);

router.get("/",protect , getMyDevices);

router.delete('/:id',protect, authorize('admin','user') , deleteDevice);

module.exports = router;
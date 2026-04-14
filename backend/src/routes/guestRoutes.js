const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const { createGuest, getGuests, updateGuest, deleteGuest } = require('../controllers/guestController');

const router = express.Router();

// Only users and admins can manage guests
router.use(protect);
router.use(authorizeRoles('user', 'admin'));

router.route('/')
    .post(createGuest)
    .get(getGuests);

router.route('/:id')
    .put(updateGuest)
    .delete(deleteGuest);

module.exports = router;

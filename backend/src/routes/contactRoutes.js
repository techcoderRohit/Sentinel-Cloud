const express = require('express');
const { 
    submitContact, 
    getAllContacts, 
    replyToContact 
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Public route
router.post('/', submitContact);

// Admin only routes
router.use(protect, authorizeRoles('admin'));
router.get('/admin', getAllContacts);
router.post('/admin/:id/reply', replyToContact);

module.exports = router;

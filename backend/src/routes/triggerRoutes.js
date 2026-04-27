const express = require('express');
const router = express.Router();
const { 
  getTriggers, 
  createTrigger, 
  deleteTrigger, 
  toggleTrigger 
} = require('../controllers/triggerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All trigger routes are protected

router.route('/')
  .get(getTriggers)
  .post(createTrigger);

router.route('/:id')
  .delete(deleteTrigger);

router.patch('/:id/toggle', toggleTrigger);

module.exports = router;

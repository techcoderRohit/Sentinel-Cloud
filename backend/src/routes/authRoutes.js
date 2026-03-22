const express = require('express');
const { SignupUser , loginUser} = require('../controllers/authController');

const router = express.Router();

router.post("/SignupUser", SignupUser);

router.post("/loginUser", loginUser);

module.exports = router;
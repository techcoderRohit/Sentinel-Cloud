const express = require('express');
const { SignupUser , loginUser, refreshToken, logoutUser} = require('../controllers/authController');

const router = express.Router();

router.post("/SignupUser", SignupUser);

router.post("/loginUser", loginUser);

router.post("/logout", logoutUser);

router.post("/refreshToken", refreshToken);

module.exports = router;
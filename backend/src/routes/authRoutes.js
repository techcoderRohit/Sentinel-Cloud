const express = require('express');
const { SignupUser, loginUser, refreshToken, logoutUser, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post("/Signup", SignupUser);

router.post("/login", loginUser);

router.post("/logout", logoutUser);

router.post("/refreshToken", refreshToken);

router.post("/forgotPassword", forgotPassword);

router.post("/resetPassword", resetPassword);

module.exports = router;
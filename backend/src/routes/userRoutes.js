// // const express = require('express');
// // const {protect} = require('../middleware/authMiddleware');
// // const getUserProfile = require('../controllers/userController');
// // const authorizeRoles = require('../middleware/roleMiddleware');
// // const router = express.Router();

// // //profile route 
// // router.get("/profile",protect,authorizeRoles("user","admin"),getUserProfile);

// // module.exports = router;

// const express = require('express');
// const {protect} = require('../middleware/authMiddleware');
// const { getUserProfile, updateUserProfile, changePassword, deleteAccount, uploadProfilePicture, removeProfilePicture } = require('../controllers/userController');
// const authorizeRoles = require('../middleware/roleMiddleware');
// const upload = require('../middleware/uploadMiddleware');
// const router = express.Router();

// //profile route 
// router.get("/profile",protect,authorizeRoles("user","admin"),getUserProfile);

// //update profile route
// router.put("/profile",protect,authorizeRoles("user","admin"),updateUserProfile);

// //upload profile picture route
// router.post("/profile-picture",protect,authorizeRoles("user","admin"), upload.single('profilePicture'), uploadProfilePicture);

// //remove profile picture route
// router.delete("/profile-picture",protect,authorizeRoles("user","admin"),removeProfilePicture);

// //change password route
// router.put("/change-password",protect,authorizeRoles("user","admin"),changePassword);

// //delete account route
// router.delete("/delete-account",protect,authorizeRoles("user","admin"),deleteAccount);

// module.exports = router;


const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, changePassword, deleteAccount, uploadProfilePicture, removeProfilePicture } = require('../controllers/userController');
const authorizeRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

//profile route 
router.get("/profile", protect, authorizeRoles("user", "admin"), getUserProfile);

//update profile route
router.put("/profile", protect, authorizeRoles("user", "admin"), updateUserProfile);

//upload profile picture route
router.post("/profile-picture", protect, authorizeRoles("user", "admin"), upload.single('profilePicture'), uploadProfilePicture);

//remove profile picture route
router.delete("/profile-picture", protect, authorizeRoles("user", "admin"), removeProfilePicture);

//change password route
router.put("/change-password", protect, authorizeRoles("user", "admin"), changePassword);

//delete account route
router.delete("/delete-account", protect, authorizeRoles("user", "admin"), deleteAccount);

module.exports = router;
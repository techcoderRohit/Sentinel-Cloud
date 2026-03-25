const express = require('express');
const { SignupUser , loginUser} = require('../controllers/authController');
const {protect,adminOnly} = require('../middleware/authMiddleware');


const router = express.Router();

router.post("/SignupUser", SignupUser);

router.post("/loginUser", loginUser);

router.get('/all-users',protect,adminOnly ,(req,res) =>{
    res.json({message : "success!", user:req.user});
});

module.exports = router;
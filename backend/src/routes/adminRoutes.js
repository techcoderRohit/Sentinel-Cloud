const express = require('express');
const {protect} = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

//admin dashboard

router.get('/dashboard',protect,authorizeRoles('admin'),(req,res)=>{
    res.json({
        message : "Welcome Admin"
    });
});

module.exports = router;
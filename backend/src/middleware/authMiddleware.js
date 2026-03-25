const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    try {
        //check karein ki header mein Authorization aur wo 'Bearer' se shuru ho raha h
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            //Token nikalein (Bearer<token>)
            token = req.headers.authorization.split(" ")[1];
           // console.log(token);

            //Token verify karein
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
           // console.log(decoded)
            //Database se user nikalein (password ko chod kar) aur req.user mein save karein
            req.user = await User.findById(decoded.id).select("-password");
            next(); // Agle route par jane ke liye

        }
        else {
            res.status(401).json({
                message: "Not authorized, token missing"
            });
        }
    }
    catch (err) {
        res.status(401).json({
            message: "Not authorized, failed"
        });
    }
};

const adminOnly = (req , res , next) => {
    if(req.user && req.user.role === "admin"){
        next();
    }
    else{
         res.status(403).json({
            message: "Admin access only"
        });
    }
};

module.exports = {protect,adminOnly};
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;
    try {
        //check token in header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            //get token
            token = req.headers.authorization.split(" ")[1];
            // console.log(token);

            //verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log(decoded)
            //get user from DB(without password)
            req.user = await User.findById(decoded.id).select("-password");
            next(); // Agle route par jane ke liye

        }
        else {
            res.status(401).json({
                message: "Not authorized, No token Found!"
            });
        }
    }
    catch (error) {
        console.log("Token verification:", error.message);
        res.status(401).json({
            message: "Not authorized,  Token failed!"
        });
    }
};
//Admin only middleware
/*const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    }
    else {
        res.status(403).json({
            message: "Admin access only"
        });
    }
};*/

module.exports = { protect };
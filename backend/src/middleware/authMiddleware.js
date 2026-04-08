const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiKey = require('../models/ApiKey');

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

const validateApiKey = async (req, res, next) => {
  const providedKey = req.headers['x-api-key'];

  if (!providedKey) {
    return res.status(401).json({ message: "API Key missing" });
  }

  const apiKeyDoc = await ApiKey.findOne({ key: providedKey, isActive: true });

  if (!apiKeyDoc) {
    return res.status(403).json({ message: "Invalid or inactive API Key" });
  }

  // Last used update karein
  apiKeyDoc.lastUsed = new Date();
  await apiKeyDoc.save();

  req.user = apiKeyDoc.owner; // Request mein user ID attach kar di
  next();
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


module.exports = { protect, validateApiKey };
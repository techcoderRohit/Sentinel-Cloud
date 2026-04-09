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
            
            if(!req.user){
                return res.status(401).json({message:"User not found,Authorization denied"});
            }
            
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
//API key Validation
const validateApiKey = async (req, res, next) => {
  try{
    const providedKey = req.headers['x-api-key'];
 //console.log("Device connected with key:",providedKey);
 console.log("Data received:",req.body);
 
  if (!providedKey) {
    return res.status(401).json({ message: "API Key missing" });
  }

  const apiKeyDoc = await ApiKey.findOne({ key: providedKey, isActive: true });

  if (!apiKeyDoc) {
    return res.status(403).json({ message: "Invalid or inactive API Key" });
  }

  // Last used update karein
  apiKeyDoc.lastUsed = new Date();
  apiKeyDoc.usageCount = (apiKeyDoc.usagecount || 0) + 1;
  await apiKeyDoc.save();

  req.user = apiKeyDoc.owner; // Request mein user ID attach kar di
  req.apiKey = apiKeyDoc; //ye line route mein id dhoondne ke liye h
  next();
}catch(error){
    console.log("API key middleware error:",error);
    res.status(500).json({message:"Internal server error"});
}
}

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
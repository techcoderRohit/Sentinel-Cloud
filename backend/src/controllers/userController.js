const User = require("../models/User");

//get user profile

const getUserProfile = async (req, res) => {
    try {
        //req.user middleware se milta h
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            _id : user._id,
            name : user.name,
            email : user.email,
            role : user.role,
            isActive : user.isActive,
            createdAt : user.createdAt
        })
    }
    catch(error){
          return res.status(500).json({
                message: error.message
            });
    }
};

module.exports = getUserProfile;
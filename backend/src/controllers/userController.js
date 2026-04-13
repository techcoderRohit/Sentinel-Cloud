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
            success:true,
            data:user
        });
    }
    catch(error){
          return res.status(500).json({
                message: error.message
            });
    }
};

module.exports = getUserProfile;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//generate jwt token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET || "your_secret_key",
        {
            expiresIn : "7d"
        }
    );
};
const SignupUser = async (req,res) => {
    try {
        const {fullname, email, password } = req.body;
        const userExists = await User.findOne({email});

        if(userExists){
            return res.status(400).json({message : "User Already exists"});
        }
        //create new user
        const user = await User.create({
        fullname,
        email,
        password
});
//response
res.status(201).json({
    message : "User registered Successfully",
    _id : user._id,
    fullname : user.name,
    email : user.email,
    role : user.role,
    token : generateToken(user._id)

});
    }catch(error){
        res.status(500).json({message : error.message});
    }
    
};
module.exports = SignupUser;
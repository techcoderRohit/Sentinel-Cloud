const User = require("../models/User");
const jwt = require("jsonwebtoken");

//generate jwt token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

//signupUser
const SignupUser = async (req, res) => {
    try {
        const { fullname, email, password, confirmPassword } = req.body;
        //validation checks 
        if (!fullname || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "Please fill all Fields" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User Already exists" });
        }
        //create new user
        const user = await User.create({
            fullname,
            email,
            password
        });
        //response
        res.status(201).json({
            message: "User registered Successfully",
            _id: user._id,
            fullname: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)

        });
    } 
    catch (error) {
        res.status(500).json({ message: error.message });
    }

};

//login user

const loginUser = async (req,res) => {
    try{
        const {email , password} = req.body;
        if(!email || !password){
             return res.status(400).json({message : "Please provide email and password"});
        }
        const user = await User.findOne({email});
        if(!user){
             return res.status(401).json({message : "Invalid email or password"});
        }
        //Password match check karna 
        const isMatch = await user.matchPassword(password);
        if(!isMatch){
             return res.status(401).json({message : "Invalid email or password"});
        }
        //response
         res.status(200).json({
            message:"Login successful",
            _id: user._id,
            fullname: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)

        });
    } 
    
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = {SignupUser,loginUser};
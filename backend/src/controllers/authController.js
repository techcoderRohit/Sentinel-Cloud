const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail")


//generate jwt token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,
        {
            expiresIn: "2d"
        }
    );
};
//generate refresh jwt token
const generateRefreshToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d"
        }
    );
};

//signupUser
const SignupUser = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;
        //validation checks 
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "Please fill all Fields!" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match!" });
        }
        //check user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User Already exists!" });
        }
        //create new user
        const user = await User.create({
            name,
            email,
            password
        });
        //response
        res.status(201).json({
            message: "User registered Successfully",
            _id: user._id,
            name: user.name,
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

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password!" });
        }
        //check email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password!" });
        }
        //Password match check karna 
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password!" });
        }
        //response
        res.status(200).json({
            message: "Login successful",
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
            refreshToken: generateRefreshToken(user._id)

        });
    }

    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//logut + refresh token

const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh Token required" });
        }
        //verify refresh token 
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        //generate new access token
        const newToken = generateToken(decoded.id)
        return res.status(200).json({
            token: newToken
        })
    }
    catch (error) {
        res.status(401).json({
            message: "Invalid refresh Token"
        });
    }
};

//forgot password

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        //generate otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        //save otp
        user.resetOTP = otp;
        user.resetOTPExpire = Date.now() + 5 * 60 * 1000; //5 minutes validity
        await user.save({ validateBeforeSave: false });
        //send email
        await sendEmail({
            email: user.email,
            subject: "Sentinel Cloud -OTP for Password Reset",
            message: `Aapka Password Reset OTP hai : ${otp}. Ye 5 min tak valid hai.`,
            otp: otp
        })

        res.status(200).json({
            message: "OTP sent to your email"
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

//reset password - update in db

const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    try {
        const user = await User.findOne({
            email,
            resetOTP: otp,
            resetOTPExpire: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                message: "Invalid or Expired OTP"
            })
        }

        //agar otp shi h , password update karein
        user.password = password;
        user.resetOTP = undefined;
        user.resetOTPExpire = undefined;
        await user.save();
        res.status(200).json({
            message: "Password reset sucessful!"
        })

    }
    catch (error) {
        console.log(error);

        res.status(500).json({ message: error.message });
    }
}

//LogOut User

const logoutUser = async (req, res) => {
    try {
        res.status(200).json({
            message: "User logged out successfully",
            clearToken: true
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { SignupUser, loginUser, refreshToken, logoutUser, forgotPassword, resetPassword };
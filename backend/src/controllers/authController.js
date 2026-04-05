const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

//generate jwt token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,
        {
            expiresIn: "15m"
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
        console.log(error);
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
        //generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        //Hash and set to user field (Expiry 30 minutes)
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        //create reset url
        const resetUrl = `http://localhost:3000/auth/reset-password/${resetToken}`;
        //send email

        const message = `Aapne password reset ki request ki h . Naya password set karne ke liye link par click karein: \n\n ${resetUrl}`;
        await sendEmail({
            email: user.email,
            subject: "Sentinel Cloud - Password Reset Request",
            message
        })

      return res.status(200).json({
            message: "Reset link to sent email"
        })


    } catch (error) {
       return res.status(500).json({ message: error.message });
    }
}

//reset password - update in db

const resetPassword = async (req, res) => {
    const { password } = req.body;
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    try {
        const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });//Token expired nhi hona chahiye
        if (!user) {
            return res.status(400).json({
                message: "Invalid or expire token"
            });
        }
        //new password set karein (pre-save hook ise hash kar dega)
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            message: "Password reset sucessful"
        })

    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//LogOut User

const logoutUser = async (req, res) => {
    try {
        res.status(200).json({
            message: "User logged out successfully"
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { SignupUser, loginUser, refreshToken, logoutUser, forgotPassword, resetPassword };
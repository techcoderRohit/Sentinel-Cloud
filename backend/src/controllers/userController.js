const User = require("../models/User");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

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
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            telegramChatId: user.telegramChatId,
            phoneNumber: user.phoneNumber,
            permissions: user.permissions || [],
            profilePicture: user.profilePicture,
            isActive: user.isActive,
            createdAt: user.createdAt
        })
    }
    catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

//update user profile (name, email, telegram, phone)

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update allowed fields
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.telegramChatId !== undefined) user.telegramChatId = req.body.telegramChatId;
        if (req.body.phoneNumber !== undefined) user.phoneNumber = req.body.phoneNumber;

        const updatedUser = await user.save({ validateBeforeSave: true });

        res.status(200).json({
            message: "Profile updated successfully",
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            telegramChatId: updatedUser.telegramChatId,
            phoneNumber: updatedUser.phoneNumber,
            profilePicture: updatedUser.profilePicture,
            createdAt: updatedUser.createdAt
        });
    } catch (error) {
        // Handle duplicate email error
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already in use" });
        }
        return res.status(500).json({ message: error.message });
    }
};

//change password

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "New passwords do not match" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        // Get user with password field
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//delete user account

const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "Password is required to delete account" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password before deleting
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        await User.findByIdAndDelete(req.user._id);

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

//upload profile picture

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete old profile picture if exists
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, '../../uploads/avatars', user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // Save new filename to DB
        user.profilePicture = req.file.filename;
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            message: "Profile picture updated successfully",
            profilePicture: user.profilePicture
        });
    } catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ message: error.message });
    }
};

//remove profile picture

const removeProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete file from disk
        if (user.profilePicture) {
            const filePath = path.join(__dirname, '../../uploads/avatars', user.profilePicture);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Clear from DB
        user.profilePicture = '';
        await user.save({ validateBeforeSave: false });

        res.status(200).json({ message: "Profile picture removed" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserProfile, updateUserProfile, changePassword, deleteAccount, uploadProfilePicture, removeProfilePicture };
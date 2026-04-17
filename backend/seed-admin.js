require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected.');

        const email = 'admin@sentinel.cloud';
        const password = 'adminpassword123'; // Change this manually if needed

        const adminExists = await User.findOne({ email });

        if (adminExists) {
            console.log('Admin user already exists:', email);
            process.exit(0);
        }

        await User.create({
            name: 'Super Admin',
            email: email,
            password: password, // Will be hashed by pre-save hook
            role: 'admin',
            isActive: true,
            isBlocked: false
        });

        console.log('Admin user seeded successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();

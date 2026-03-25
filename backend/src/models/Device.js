const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceName: {
        type: String,
        required: [true, 'Please add a device name'],
        trim: true
    },
    deviceId: {
        type: String,
        required: [true, 'Unique Device Id is required'],
        unique: true,
        trim: true
    },
    deviceType: {
        type: String,
        enum: ['Sensor', 'Actuator', 'Gateway'],
        default: 'Sensor'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['online', 'offline'],
        default: 'offline'
    },
    lastPulse: {
        type: Date,
        default: Date.now
    },
    apiKey: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Device', deviceSchema);
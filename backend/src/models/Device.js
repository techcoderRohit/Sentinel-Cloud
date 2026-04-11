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
        unique: true
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
    location: {
        type: String
    },
    status: {
        type: String,
        enum: ['Online', 'Offline'],
        default: 'Offline'
    },
    apiKey: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Device', deviceSchema);
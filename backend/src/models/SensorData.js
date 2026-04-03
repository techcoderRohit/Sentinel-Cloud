const mongoose = require('mongoose');

const sensorData = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true, 
        index: true
    },
    sensorData: {
        temperature: { type: Number },
        humidity: { type: Number },
        pressure: { type: Number }

    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    /*metaData: {
        location: { type: String, default: "Internal Lab" },
        ipAddress: { type: String },
        required: true
    }*/
}, {
    timeseries: {
        timeField: 'timeStamp',
        metaField: 'deviceId',
        granularity: 'minutes'
    }
}
);

module.exports = mongoose.model('Data', sensorData);
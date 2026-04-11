const Device = require('../models/Device');
const crypto = require('crypto'); // API key generate karne ke liye 

// New Device Register karna
// private - Any logged in user
const registerDevice = async (req,res) => {
    try{
        const {deviceName , deviceId, deviceType,location} = req.body;

        const deviceExists = await Device.findOne({deviceId});
        if(deviceExists){
            return res.status(400).json({
                message : 'Device Id already registered'
            });
        }
        // Auto generate a secure api key for the hardware

       // const apiKey = crypto.randomBytes(16).toString('hex');

     const device = await Device.create({
            deviceName,
            deviceId,
            deviceType,
            location,
            owner : req.user.id, //Auth middleware se user Id mil rahi h
            apiKey
        });
        res.status(201).json({
            success : true,
            message : 'Device Registered Successfully'
        });
}catch (error){
res.status(500).json({
    message : error.message
});
    }
};

//User ke saare devices dekhna 

const getMyDevices = async (req,res) => {
    try{
        //Agar admin h toh sabhi devices dikhao, warna sirf owner ke
        let query = {owner : req.user.id};
        if(req.user.role === 'admin'){
            query = {};
        }
        
        const devices = await Device.find(query);
        res.status(200).json({
            success : true,
            count : devices.length, data : devices
            
        });
}catch (error){
res.status(500).json({
    message : error.message
});
    }
    
};

//desc - Device delete karna (Admin or Owner only)
//route - DELETE /api/devices/:id
//access - private

const deleteDevice = async(req,res) => {
    try{
        const device = await Device.findById(req.params.id);
        if(!device){
            return res.status(404).json({
                message : 'Device not found'
            });
               
        }
        //check ownership : kya user owner h ya admin ?

        if(device.owner.toString() !== req.user.id && req.user.role !== 'admin'){
              return res.status(401).json({
                message : 'Not authorized to delete this device'
            });
        }
        await device.deleteOne();
        res.status(200).json({
            success : true,
                message : 'Device Removed'
            });
    }catch(error){
        res.status(500).json({
            message : error.message
        });
    }
};

module.exports = {registerDevice,getMyDevices,deleteDevice};
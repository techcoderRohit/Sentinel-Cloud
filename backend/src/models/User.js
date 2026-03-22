const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const userSchema = new Schema(
    {
     fullname : {
        type : String,
        required : true
     },
     email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true
     },
     password : {
        type : String,
        required : true,
        minlength : 6
     },
     role : {
        type : String,
        enum : ["user", "admin"],
        default : "user"
     },
     isActive : {
        type : Boolean,
        default : true
     }
    },
    
    {
        timestamps : true
    }
    
);
const User = model('User',userSchema);
module.exports = User;
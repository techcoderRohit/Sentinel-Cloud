const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
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

//password hash before save

userSchema.pre("save" , async function () {
   //agar password change nhi hua toh skip kare
   if(!this.isModified("password"))
      return ;
   const salt = await bcrypt.genSalt(10);
   this.password = await bcrypt.hash(this.password, salt);
   
});

//password compare function

userSchema.methods.matchPassword = async function (enteredPassword) {
   return await bcrypt.compare(enteredPassword, this.password);
};

//export model

const User = model('User',userSchema);
module.exports = User;
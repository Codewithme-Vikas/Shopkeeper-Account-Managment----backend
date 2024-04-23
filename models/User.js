const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({

    name :  { type : String , required : true , trim : true , unique : true },

    email : { type : String , trim : true, required : true, unique : true },
    phone : { type : String },
    address : { type : String },

    password : { type : String , required : true },

    accountType : { type : String , enum : [ "Admin" , "Customer" ] , required : true },

    OTP : { type : Number },
    resetPasswordExpires  : { type : Date },

},{
    timestamps : true ,
});


module.exports = mongoose.model("User" , userSchema );
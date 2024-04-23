const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({

    productName : { type : String , required : true , unique : true ,  trim : true },

    unit : { type : String , required : true },

    // type : { type : String ,  enum : ["Purchase" , "Manufuture"] , required : true },
    
    price : { type : Number },

    openingStock : { type : Number },

    currentStock : { type : Number }

},{
    timestamps : true ,
});


module.exports = mongoose.model( "Product" , productSchema );
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({

    customerId : { type : mongoose.Schema.Types.ObjectId , ref : "Customer"  ,  required : true },

    customer: {
        name: { type: String, required: true, trim: true },

        phone: { type: String, required: true },
        address: { type: String, trim: true },
    },


    amount : { type  : Number },

    note : { type : String },

    type: { type: String, enum: ["Payment", "Received"], required: true },

},{
    timestamps : true,
});


module.exports = mongoose.model("Payment" , paymentSchema  );
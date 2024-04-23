const mongoose = require("mongoose");


const customerSchema = new mongoose.Schema({

    name: { type: String, required: true, unique: true, trim: true },

    email: { type: String, trim: true },
    phone: { type: String, required : true },
    // address: { state : String, district: String , city: String },
    address: { type : String, trim : true },
    GSTNumber: { type: String },
    PAN: { type: String },

    // accounting : { type : Number , required : true }, // accounting = total (orderPrice - payments)

    accountType: { type: String, enum: ["Buyer", "Seller"], required: true },


    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

    payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],

}, {
    timestamps: true,
});


module.exports = mongoose.model("Customer", customerSchema);
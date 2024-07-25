const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },    

    invoiceNo: { type: String, required: true },

    
    type: { type: String, enum: ["Buy", "Sell"], required: true },

    customer: {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
        name: { type: String, required: true, trim: true },

        phone: { type: String, required: true },
        email: { type: String, trim: true },
        address: { type: String, trim: true },
        GSTNumber: { type: String },
        PAN: { type: String },
    },

    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            productName: { type: String, required: true },
            unit : { type : String, required : true },
            price: { type: Number },
            quantity: { type: Number, required: true },
            height: { type: Number },
            width: { type: Number },
            note : { type : String , trim : true},
        }
    ],

    GST: {
       SGST : { type : Number },
       CGST : { type : Number },
       IGST : { type : Number },
    },

    discount: { type: Number, default: 0 },
    
    orderPrice: { type: Number, required : true },

    advance : { type : Number, default : 0 },

    note: { type: String , trim : true},

}, {
    timestamps: true,
});


module.exports = mongoose.model("Order", orderSchema);
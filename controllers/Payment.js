const { default: mongoose } = require("mongoose");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const Order = require("../models/Order");



// *************************** Payment ************************************
exports.payment = async (req, res) => {
    try {
        const { customerId, customer, amount, note, type } = req.body;

        if (!customerId || !customer || (amount <= 0 || !type)) {
            return res.status(400).json({ success: false, message: "customer, customerId,type or  amount is missing " });
        }

        // is customer exsist
        const isCustomerExsist = await Customer.findById(customerId);

        if (!isCustomerExsist) {
            return res.status(400).json({ success: false, message: "Customer is not exsits" });
        }

        // create payment
        const paymentDoc = await Payment.create({
            customerId,
            amount,
            note,
            customer,
            type
        });

        // store payment id into customer
        await Customer.findByIdAndUpdate(customerId, {
            $push: { payments: paymentDoc._id }
        }, { new: true });


        return res.status(200).json({
            success: true,
            message: "successfully submit the payment",
            paymentDoc
        });


    } catch (error) {
        console.log(error, "Error in payment controller");
        return res.status(400).json({
            success: false,
            message: "Failed to create payment",
            error: error.message
        })
    }
}



// ***************************Get all Payments************************************
exports.getAllPayments = async (req, res) => {
    try {

        const allPaymentDoc = await Payment.find({}).populate({ path: "customerId", select: "name phone" }).sort("-createdAt").exec();

        return res.status(200).json({
            success: true,
            message: "successfully get the payments",
            allPaymentDoc
        });


    } catch (error) {
        console.log(error, "Error in get payments controller");
        return res.status(400).json({
            success: false,
            message: "Failed to get payment",
            error: error.message
        })
    }
}


// *******************************Credit of a user*******************************************
//To Do - need to be update this controller due to remove accountType of customer
exports.customerCredit = async (req, res) => {
    try {
        const { customerId } = req.params;

        if (!customerId) {
            return res.status(400).json({ success: false, message: "Provide customer id " });
        }

        // is customer exsits    
        const isCustomerExsist = await Customer.findById(customerId);

        if (!isCustomerExsist) {
            return res.status(400).json({ success: false, message: "There is no such user!" });
        }

        // Aggregate credit
    
            const totalOrderAmount = await Customer.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(customerId)
                    }
                },
                {
                    $lookup: {
                        from: "orders", // The name of the "Order" collection
                        localField: "orders",
                        foreignField: "_id",
                        as: "orderDetails"
                    }
                },
                {
                    $unwind: { //  $unwind :- used to deconstruct an array field into multiple documents.
                        path: "$orderDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        totalOrderAmount: { $sum: "$orderDetails.orderPrice" },
                        totalAdvance: { $sum: { $ifNull: ["$orderDetails.advance", 0] } },
                    }
                }
            ]);

            const totalPaymentAmount = await Customer.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(customerId)
                    }
                },
                {
                    $lookup: {
                        from: "payments", // The name of the "Order" collection
                        localField: "payments",
                        foreignField: "_id",
                        as: "paymentsDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$paymentsDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        totalPaymentAmount: { $sum: "$paymentsDetails.amount" },
                    }
                }
            ]);
    


        const totalOrderHistory = await Order.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(customerId)
                }
            },
            {
                $group: {
                    _id: "$customerId",
                    totalSell: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$type", "Sell"] },
                                then: "$orderPrice",
                                else: 0
                            }
                        }
                    },
                    totalBuy: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$type", "Buy"] },
                                then: "$orderPrice",
                                else: 0
                            }
                        }
                    },
                    totalBuyAdvance : {
                        $sum : {
                            $cond : {
                                if : { $eq : [ "$type" , "Buy"] },
                                then : "$advance",  // can also use { $ifNull : [ "$advance", 0] }
                                else : 0
                            }
                        }
                    },
                    totalSellAdvance : {
                        $sum : {
                            $cond : {
                                if : { $eq : [ "$type" , "Sell"] },
                                then : "$advance",
                                else : 0
                            }
                        }
                    }
                }
            }
        ]);
        
        const totalPayHistory = await Payment.aggregate([
            {
                $match: {
                    customerId: new mongoose.Types.ObjectId(customerId)
                }
            },
            {
                $group: {
                    _id: "$customerId",
                    totalPayamentAmount: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$type", "Payment"] },
                                then: "$amount",
                                else: 0
                            }
                        }
                    },
                    totalReceivedAmount: {
                        $sum: {
                            $cond: {
                                if: { $eq: ["$type", "Received"] },
                                then: "$amount",
                                else: 0
                            }
                        }
                    }
                }
            }
        ]);


        const data = {
            totalSell : totalOrderHistory[0]?.totalSell  || 0,
            totalBuyAdvance : totalOrderHistory[0]?.totalBuyAdvance  || 0,
            totalSellAdvance : totalOrderHistory[0]?.totalSellAdvance || 0,
            totalBuy : totalOrderHistory[0]?.totalBuy || 0,
            totalPayament : totalPayHistory[0]?.totalPayamentAmount || 0,
            totalReceived : totalPayHistory[0]?.totalReceivedAmount || 0,
        }

        // const balance2  =  totalSell - totalBuy + totalBuyAdvance - totalSellAdvance - totalReceived + totalPayment``
        const balance = data.totalSell - data.totalSellAdvance - data.totalBuy + data.totalBuyAdvance  - data.totalReceived + data.totalPayament

        return res.status(200).json({
            success: true,
            message: "successfully fetched customer credit",
            totalOrderAmount,
            totalPaymentAmount,
            balance,
        });


    } catch (error) {
        console.log(error, "Error in customer Credit controller");
        return res.status(400).json({
            success: false,
            message: "Failed to get customer credit",
            error: error.message
        })
    }
}
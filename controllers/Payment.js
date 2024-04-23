const { default: mongoose } = require("mongoose");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");



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
        } else if (isCustomerExsist.accountType === 'Buyer' && type === 'Payment') {
            return res.status(400).json({ success: false, message: "Can't payment to Buyer!" });
        } else if (isCustomerExsist.accountType === 'Seller' && type === 'Received') {
            return res.status(400).json({ success: false, message: "Can't received from Seller!" });
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
                $unwind: {
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
        ])

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
        ])


        return res.status(200).json({
            success: true,
            message: "successfully fetched customer credit",
            totalOrderAmount,
            totalPaymentAmount,
            balance : totalOrderAmount[0].totalOrderAmount - totalOrderAmount[0].totalAdvance - totalPaymentAmount[0].totalPaymentAmount
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
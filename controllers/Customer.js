const { default: mongoose } = require("mongoose");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

// ***************************Create Customer************************************

// address = { state : "" , district : "", city : "" }
exports.createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, GSTNumber, PAN } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ success: false, message: "Please provide all required information!" });
        }

        //Is already exits
        const isCustomerExists = await Customer.findOne({ name: name });

        if (isCustomerExists) {
            return res.status(400).json({ success: false, message: "Customer is already exits!" });
        }

        // Create new entry into the db
        const customerDoc = await Customer.create({
            name,
            email,
            phone,
            address,
            GSTNumber,
            PAN,
        });

        return res.status(200).json({
            success: true,
            message: "Successfully created Customer.",
            customerDoc
        });


    } catch (error) {
        console.log(error, "Error in create customer controller ");
        return res.json({
            success: false,
            message: "Failed to create Customer",
            error: error.message
        })
    }
}


// ***************************Update Customers************************************
exports.updateCustomer = async (req, res) => {
    try {

        const { customerId, name, email, phone, address, GSTNumber, PAN } = req.body;

        if (!customerId) {
            return res.status(400).json({ success: false, message: "provide customer id" });
        }

        // is customer exits
        const isCustomerExists = await Customer.findById(customerId);

        if (!isCustomerExists) {
            return res.status(400).json({ success: false, message: "customer is not exists!" });
        }

        // update the customer document
        const customerDoc = await Customer.findByIdAndUpdate(customerId, {
            $set: {
                name,
                email,
                phone,
                address,
                GSTNumber,
                PAN
            }
        }, { new: true });

        return res.status(200).json({
            success: true,
            message: "successfully get customers data",
            customerDoc
        });


    } catch (error) {
        console.log(error, "Error in update customer");
        return res.status(400).json({
            success: false,
            message: "Failed to update customer",
            error: error.message
        })
    }
}


// ***************************Delete Customers************************************
exports.deleteCustomer = async (req, res) => {
    try {

        const { customerId } = req.params;

        if (!customerId) {
            return res.status(400).json({ success: false, message: "provide customer id" });
        }

        const customerDoc = await Customer.findByIdAndDelete(customerId);

        if (!customerDoc) {
            return res.status(400).json({ success: false, message: 'Customer not found' })
        }

        return res.status(200).json({
            success: true,
            message: "successfully delete",
            customerDoc
        });


    } catch (error) {
        console.log(error, "Error in delete customer");
        return res.status(400).json({
            success: false,
            message: "Failed to delete customer",
            error: error.message
        })
    }
}



// ***************************Get Customers************************************
exports.getCustomer = async (req, res) => {
    try {

        const { customerId } = req.params;

        if (!customerId) {
            return res.status(400).json({ success: false, message: "provide customer id" });
        }

        const customerDoc = await Customer.findById(customerId)
            .populate(
                {
                    path: "orders",
                    select: "type orderPrice advance products.productName invoiceNo  createdAt",
                    options: { sort: { createdAt: -1 } },
                }
            )
            .populate(
                {
                    path: "payments",
                    select: "type amount  createdAt note",
                    options: { sort: { createdAt: -1 } },
                }
            )
            .exec();

        if (!customerDoc) {
            return res.status(400).json({ success: false, message: "customer is not exists!" });
        }

        return res.status(200).json({
            success: true,
            message: "successfully get customer data",
            customerDoc
        });


    } catch (error) {
        console.log(error, "Error in get customer");
        return res.status(400).json({
            success: false,
            message: "Failed to get customer data",
            error: error.message
        })
    }
}


// ***************************Get all Customers************************************
/*
    exports.getAllCustomers = async (req, res) => {
        try {

            const allCustomersDoc = await Customer.find();


            return res.status(200).json({
                success: true,
                message: "successfully get customers data",
                allCustomersDoc
            });


        } catch (error) {
            console.log(error, "Error in get all customer");
            return res.status(400).json({
                success: false,
                message: "Failed to get all customer",
                error: error.message
            })
        }
    }
*/ 


// ***************************Get all Customers with credit/balance************************************
exports.getAllCustomers = async (req, res) => {
    try {
        // Fetch all customers
        const allCustomersDoc = await Customer.find().select({payments : 0, orders : 0}).exec();

        // For each customer, calculate the credit balance
        
        // To Do : should use Promise.allSettled or Promise.all ?
        const customersWithCredit = await Promise.all(allCustomersDoc.map(async (customer) => {
            const customerId = customer._id;

            // Aggregate credit and payment data for each customer
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
                        totalBuyAdvance: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$type", "Buy"] },
                                    then: "$advance",
                                    else: 0
                                }
                            }
                        },
                        totalSellAdvance: {
                            $sum: {
                                $cond: {
                                    if: { $eq: ["$type", "Sell"] },
                                    then: "$advance",
                                    else: 0
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
                totalSell: totalOrderHistory[0]?.totalSell || 0,
                totalBuyAdvance: totalOrderHistory[0]?.totalBuyAdvance || 0,
                totalSellAdvance: totalOrderHistory[0]?.totalSellAdvance || 0,
                totalBuy: totalOrderHistory[0]?.totalBuy || 0,
                totalPayament: totalPayHistory[0]?.totalPayamentAmount || 0,
                totalReceived: totalPayHistory[0]?.totalReceivedAmount || 0,
            };

            // Calculate the balance for the customer
            const balance = data.totalSell - data.totalSellAdvance - data.totalBuy + data.totalBuyAdvance - data.totalReceived + data.totalPayament;

            // Return the customer data with the calculated balance
            return {
                ...customer.toObject(), // toObject() method is provided by mongoose
                balance,
            };
        }));

        // Send the response with customers and their balance
        return res.status(200).json({
            success: true,
            message: "Successfully fetched customers' data",
            allCustomersDoc: customersWithCredit
        });

    } catch (error) {
        console.log(error, "Error in get all customer");
        return res.status(400).json({
            success: false,
            message: "Failed to get all customers",
            error: error.message
        });
    }
};
const Customer = require("../models/Customer");


// ***************************Create Customer************************************

// address = { state : "" , district : "", city : "" }
exports.createCustomer = async (req, res) => {
    try {
        const { name , email , phone , address , GSTNumber , PAN , accountType } = req.body;

        if( !name || !accountType || !phone ){
            return res.status(400).json({ success : false , message : "Please provide all required information!" });
        }

        //Is already exits
        const isCustomerExists = await Customer.findOne({ name : name  } );

        if( isCustomerExists ){
            return res.status(400).json({ success : false , message : "Customer is already exits!" });
        }
        
        // Create new entry into the db
        const customerDoc = await Customer.create({
            name,
            email,
            phone,
            address,
            GSTNumber,
            PAN,
            accountType
        });

        return res.status(200).json({
            success : true,
            message : "Successfully created Customer.",
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
        
        const { customerId , name , email , phone , address  , GSTNumber , PAN  } = req.body;

        if( !customerId ){
            return res.status(400).json({ success : false , message : "provide customer id"});
        }

        // is customer exits
        const isCustomerExists  = await Customer.findById( customerId );

        if( !isCustomerExists ){
            return res.status(400).json({success : false, message : "customer is not exists!"});
        }

        // update the customer document
        const customerDoc = await Customer.findByIdAndUpdate( customerId , {
            $set : {
                name , 
                email,
                phone,
                address,
                GSTNumber,
                PAN
            }
        },{ new : true });

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
        
        const { customerId  } = req.params;

        if( !customerId ){
            return res.status(400).json({ success : false , message : "provide customer id"});
        }

        const customerDoc  = await Customer.findByIdAndDelete( customerId );

        if( !customerDoc ){
            return res.status(400).json({success : false , message : 'Customer not found'})
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

        if( !customerId ){
            return res.status(400).json({ success : false , message : "provide customer id"});
        }

        const customerDoc  = await Customer.findById( customerId )
                                .populate({path : "orders" , select : "orderPrice advance products.productName invoiceNo  createdAt"})
                                .populate({path : "payments" , select : "amount  createdAt note"})
                                .exec();

        if( !customerDoc ){
            return res.status(400).json({success : false, message : "customer is not exists!"});
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



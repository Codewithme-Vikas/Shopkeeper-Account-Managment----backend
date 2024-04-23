const Product = require("../models/Product")


// **********************create Product***************************
exports.createProduct = async( req , res )=>{
    try {
        const { productName , price , unit , openingStock , currentStock } = req.body;

        if( !productName || !unit ){
            return res.status(400).json({ success : false , message : "Provide product name and unit"});
        }

        // is already exists
        const isExists = await Product.findOne( { productName } );

        if( isExists ){
            return res.status(400).json({ success : false , message : "Product is already exits."});
        }

        // store into DB
        const productDoc = await Product.create({
            productName,
            unit,
            price,
            openingStock,
            currentStock
        });

        return res.status(200).json({
            success : true,
            message : "Product details store in db",
            productDoc,
        })

        
    } catch (error) {
        console.log( error , "Error in create product controller");
        return res.status(400).json({
            success : false,
            message : "Failed to create product",
            error : error.message
        })
    }
}


// **********************update Product***************************
exports.updateProduct = async( req , res )=>{
    try {
        const { id , productName , price , unit , addStock  } = req.body;

        if( !id ){
            return res.status(400).json({ success : false , message : "Provide product id"});
        }

        // is exists
        const isExists = await Product.findById(id);

        if( !isExists ){
            return res.status(400).json({ success : false , message : "Product is not exists."});
        }

        // update product 
        const productDoc = await Product.findByIdAndUpdate( id , {
            $set : {
                productName,
                unit,
                price,
            },
            $inc : {
                currentStock : addStock ?? 0, //nullish coalescing operator (??)
            }
        },{ new : true });

        return res.status(200).json({
            success : true,
            message : "Product updated successfully",
            productDoc,
        });

        
    } catch (error) {
        console.log( error , "Error in update product controller");
        return res.status(400).json({
            success : false,
            message : "Failed to update product",
            error : error.message
        })
    }
}


// *************************Get all Products***********************
exports.getProduct = async( req , res )=>{
    try {
        const { productId } = req.params;

        if( !productId ){
            return res.status(400).json({ success : false , message : "Provide product id."});
        }

        const productDoc = await Product.findById( productId );

        if( !productDoc ){
            return res.status(400).json( { success : false , message : "Product not exists."})
        }

        return res.status(200).json({
            success : true,
            message : "Get  product successfully",
            productDoc
        })

        
    } catch (error) {
        console.log( error , "Error in get product controller");
        return res.status(400).json({
            success : false,
            message : "Failed to get product",
            error : error.message
        })
    }
}


// *************************Get all Products***********************
exports.getAllProducts = async( req , res )=>{
    try {
        
        const allProductsDoc = await Product.find({});

        return res.status(200).json({
            success : true,
            message : "Get list of all products",
            allProductsDoc,
        })

        
    } catch (error) {
        console.log( error , "Error in get all products controller");
        return res.status(400).json({
            success : false,
            message : "Failed to get all products",
            error : error.message
        })
    }
}



// *************************delete Product ***********************
exports.deleteProduct = async( req , res )=>{
    try {
        const { id } = req.params;

        if( !id ){
            return res.status(400).json({ success : false , message : "Provide product id"});
        }

        // is  exits
        const isExists = await Product.findById( id );

        if( !isExists ){
            return res.status(400).json({ success : false , message : "Product is not exists."});
        }

        // delete into DB
        const productDoc = await Product.findByIdAndDelete( id );

        return res.status(200).json({
            success : true,
            message : "Product deleted. ",
            productDoc,
        })

        
    } catch (error) {
        console.log( error , "Error in delete product controller");
        return res.status(400).json({
            success : false,
            message : "Failed to delete product",
            error : error.message
        })
    }
};
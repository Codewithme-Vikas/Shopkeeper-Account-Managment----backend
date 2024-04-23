const jwt = require("jsonwebtoken");
require("dotenv").config();



// ********************************* auth ***********************************************
exports.auth = ( req , res , next )=>{
    try {
        // const token = req.cookies.token ||  req.headers['Authorization'].split(' ')[1]; // can be req.headers['Authorization'].replace('Bearer ' , '')
token = req.cookies.token || (req.headers['Authorization'] && req.headers['Authorization'].split(' ')[1]); // can be req.headers['Authorization'].replace('Bearer ' , '')        const 

        if( !token ){
            return res.status(401).json({success : false , message : "Token is not provided!"});
        }

        const userInfo = jwt.verify( token, process.env.JWT_SECRECT_KEY );

        if( !userInfo ){
            return res.status(401).json({success : false , message : "You are not authenticate!"});
        }

        // set user details into request
        req.userInfo = userInfo;

        // call next middleware
        next();


    } catch (error) {
        console.log( error , "Error in auth middleware");
        return res.status(401).json({
            success : false,
            message : "You are not authenticate.",
            error : error.message
        })
    }
}


// ******************************** isAdmin **********************************************
exports.isAdmin = ( req , res , next )=>{
    try {
        if( req.userInfo.accountType !== "Admin" ){
            return res.status(401).json({success : false , message : "You are not authorize as admin."});
        }
     
        // call next middleware
        next();


    } catch (error) {
        console.log( error , "Error in is Admin middleware");
        return res.status(401).json({
            success : false,
            message : "You are not authrize as admin.",
            error : error.message
        })
    }
}
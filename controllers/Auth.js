const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/User");

// ****************************** Singup ****************************************
exports.signup = async (req, res) => {
    try {
        const { name, email, address, phone, accountType, password, password2 } = req.body;

        if (!name || !accountType || !password || !password2) {
            return res.status(400).json({ success: false, message: "Please provide all required information!" });
        }

        if (password !== password2) {
            return res.status(400).json({ success: false, message: "Passwords are not matched!" });
        }

        //Is already exits
        const isUserExits = await User.findOne({ name });

        if (isUserExits) {
            return res.status(400).json({ success: false, message: "User is already exits!" });
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create new entry into the db
        const userDoc = await User.create({
            name,
            email,
            address,
            phone,
            password: hashPassword,
            accountType
        });

        userDoc.password = undefined; // to hide password

        return res.status(200).json({
            success: true,
            message: "Successfully singup",
            userDoc: userDoc
        });


    } catch (error) {
        console.log(error, "Error in singup controller ");
        return res.json({
            success: false,
            message: "Failed to sinup ",
            error: error.message
        })
    }
}


// ****************************** Login ****************************************
exports.login = async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({ success: false, message: "Please provide all required information!" });
        }


        //Is already exits
        const userDoc = await User.findOne({ name });

        if (!userDoc) {
            return res.status(403).json({ success: false, message: "User is not exits!, Invalid creadentials" });
        }

        // Match the password
        const isAuthenticate = await bcrypt.compare(password, userDoc.password);

        if (!isAuthenticate) {
            return res.status(401).json({ success: false, message: "Password is not matched!" });
        }

        // Create  token
        const payload = {
            id: userDoc._id,
            email: userDoc.email,
            accountType: userDoc.accountType,
        }

        const token = await jwt.sign(payload, process.env.JWT_SECRECT_KEY, {});

        // Send token as cokkie
        const options = {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite : 'none',
            secure : true
        }

        userDoc.password = undefined; // hide password


        return res.status(200).cookie('token', token, options).json({
            success: true,
            message: "User is successfully loggedIn.",
            userDoc: userDoc,
            token: token
        });


    } catch (error) {
        console.log(error, "Error in login controller ");
        return res.status(401).json({
            success: false,
            message: "Failed to login ",
            error: error.message
        })
    }
}

// ****************************** LogOut ****************************************
exports.logout = async (req, res) => {
    try {

        return res.status(200).cookie('token', "").json({
            success: true,
            message: "User is successfully logout.",
        })


    } catch (error) {
        console.log(error, "Error in logout controller ");
        return res.status(401).json({
            success: false,
            message: "Failed to logout",
            error: error.message
        })
    }
}
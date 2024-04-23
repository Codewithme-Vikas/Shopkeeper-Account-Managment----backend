const bcrypt = require('bcrypt')

require("dotenv").config();

const User = require("../models/User");

const sendMail = require("../utils/nodemailer");
const otpGenerator = require("../utils/otpGenerator");

const { resetPasswordTemplate } = require("../mail/templates/resetPasswordTemplate");


// ************************* ResetPasswordOTP -- send email *********************************************
exports.resetPasswordOTP = async (req, res) => {

    try {
        const { user } = req.body;

        // validation 

        if (!user) {
            return res.status(400).json({ success: false, message: "Provide the user name!" });
        }

        // verify the -   Is user exits
        const userDoc = await User.findOne({ name : user });

        if (!userDoc) {
            return res.status(401).json({ success: false, message: "User is not exist!" })
        }

        // generate a otp
        const OTP = otpGenerator(6);

        // update user by adding OTP and expiration time
        await User.findOneAndUpdate({ name : user }, {
            $set:
            {
                OTP : OTP,
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
            }
        });

        // send mail contain OTP
        try {
            const receiverMail = userDoc.email;
            const title = "Reset password OTP from the Vikas Tech :- ";
            const body = resetPasswordTemplate( OTP );
            

            await sendMail(receiverMail, title, body);

        } catch (err) {
            console.log(err, 'Error in resetPassword OTP handler during send mail!')
            return res.status(500).json({
                success: false, message: "Fail to send mail for OTP!",
                error: err.message,
            })
        }


        return res.status(200).json({ success: true, message: "Mail sent successfully, please check email."});

    } catch (error) {
        console.log(error, 'error in resetPassword OTP controller')
        return res.status(500).json({
            success: false,
            message: "couldn't provide OTP",
            error: message.error
        })
    }

};



// ***************************************** Verify OTP *********************************************
exports.verifyOTP = async (req, res) => {

    try {
        const { user, OTP } = req.body;

        // validation 

        if (!user || !OTP) {
            return res.status(400).json({ success: false, message: "Provide the user name and OTP!" });
        }

        // find user and verify OTP
        const userDoc = await User.findOne({ name : user , OTP : OTP });

        if( !userDoc ){
            return res.status(401).json({ success: false, message: "Invalid user or OTP!" });
        }

        // validation on OTP expire time
        if( userDoc.resetPasswordExpires < Date.now() ){
            return res.status(401).json({ success: false, message: "OTP Expired!" });
        }

        return res.status(200).json({ success: true, message: "OTP is correct" })

    } catch (error) {
        console.log(error, 'error in verify  OTP controller')
        return res.status(500).json({
            success: false,
            message: "couldn't verify OTP",
            error: message.error
        })
    }
};


// ResetPassword  --> entry in DB
exports.resetPassword = async (req, res) => {

    try {
        const { user, OTP, password , confirmPassword } = req.body;

        // validation
        if( !password || !confirmPassword || !user || !OTP ){
            return res.status(400).json({ success: false, message: "Provide the all fields information!" });
        }

        // is passwords matched
        if( password !== confirmPassword ){
            return res.status(400).json({ success: false, message: "Passwords are not matched!" });
        }

        // find user and verify OTP
        const userDoc = await User.findOne({ name : user , OTP : OTP });

        if( !userDoc ){
            return res.status(401).json({ success: false, message: "Invalid user or OTP!" });
        }

        // validation on OTP expire time
        if( userDoc.resetPasswordExpires < Date.now() ){
            return res.status(401).json({ success: false, message: "OTP Expired!" });
        }

        // hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash( password , saltRounds );

        // reset/update the password
        await User.findByIdAndUpdate( userDoc._id ,{ $set : { password : hashedPassword } } , { new : true } );

        // return resposne
        return res.status(200).json({ success: true, message: "Password is successfully reset." });


    } catch (error) {
        console.log(error, 'error in resetPassword controller')
        return res.status(500).json({
            success: false,
            message: "couldn't reset the password",
            error: error.message
        })
    }
};
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MAIL_PASS_KEY
    }
});


const sendMail = async ( receiverMail , title , body ) => {

    const info = await transporter.sendMail({
        from: "Vikas Tech <vikashnagar2025@gmail.com>",
        to: receiverMail,
        subject: title,
        html: body
    });

    return info;
}


module.exports = sendMail;
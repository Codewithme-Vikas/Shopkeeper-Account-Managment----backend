exports.resetPasswordTemplate = ( OTP )=>{
    return(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body>
            <div style="background-color: #f2f2f2; padding: 20px; text-align: center;">
                <h2>Password Reset</h2>
                <p>Dear User,</p>
                <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
                <p>To reset your password, OTP is : </p>
                <h2>${OTP}</h2>

                <p>This OTP will be  valid for next 5 minutes.</p>
                <p>If you have any questions or need further assistance, please don't hesitate to contact us.</p>
                <p>Thank you for using our service!</p>
                <p>Sincerely,<br>Vikas Tech</p>
            </div>
        </body>
        </html>
        `
    )
}
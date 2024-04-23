const otpGenerator = (length)=>{
    let otp='';

    for( let i=0; i<length; i++){
        let digit = Math.floor(Math.random() * 10);
        otp += String(digit);
    }

    return otp;
};

module.exports = otpGenerator;
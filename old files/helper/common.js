const otpGenerator = require('otp-generator')


module.exports ={

    generateOtp:()=>{
      return  Math.floor(10000000 + Math.random() * 90000000).toString();
    }
}
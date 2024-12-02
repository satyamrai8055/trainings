import config from "config";
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import cloudinary from 'cloudinary';
cloudinary.config({
  cloud_name: "dooc8bct9",
  api_key: "837128343149177",
  api_secret: "o68OZpIGC_tvElXrhA-GRVYXAuk",
});



module.exports ={
    getOTP() {
        var otp = Math.floor(1000 + Math.random() * 9000);
        return otp;
      },
      sendMail: async(email , subject ,html)=>{
        try {
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: config.get('nodemailer.email'),
              pass: config.get('nodemailer.password')
            },
          });;
          const mailOptions ={
            from: "satyam.rai@indicchain.com",
            to: email,
            subject: subject,
            text: html,
          };
      
           let send = await transporter.sendMail(mailOptions);
           return send ;

  
        } catch (error) {
          return error;
        }
       },
       getToken: async (payload) => {
        var token =  jwt.sign(payload, config.get('secretKey'), { expiresIn: "24h" })
        return token;
      },
      getSecureUrl: async (base64) => {
        var result = await cloudinary.v2.uploader.upload(base64);
        console.log(result);
        return result.secure_url;
      },
    
    

      
    


}
const mongoose = require("mongoose");
const model = require("../model/schema");
const bcrypt = require("bcrypt");
const helper = require("../helper/common");

const nodemailer = require("nodemailer");
const { response } = require("express");
const { paginate } = require("mongoose-paginate-v2");
 const jwt = require("jsonwebtoken");
 const secretkey = ("secretkey")
// Signup******************************************************************

module.exports = {
  signup: async (req, res) => {    
    try {

      const newUser = await model.findOne({email:req.body.email});
      if (newUser) {
        return res.status(400).send({ msg: "user already exist" });

      } else if (!newUser) {

        let otp = helper.generateOtp();
        req.body.otp = otp;
        console.log(req.body);

        let password = bcrypt.hashSync(req.body.password, 10);
        req.body.password = password;

        const result = await model(req.body).save();

        return res.status(200).send(result);
      }
    } catch (e) {
      return res.status(500).send("invaild");
    }
  },

  // Login***********************************************************************

  login: async (req, res) => {
    try {
      const email = req.body.email;
      const password = req.body.password;

      const useremail = await model.findOne({ email: email });
      const userpassword = bcrypt.compare(password, useremail.password);
   


      if (userpassword) {
        if(useremail.isverify===true){
          return res.status(200).send({ msg: "success" });
        }else{
          return res.status(200).send({ msg: "please verify your login account" });
        }
       
      } else {
        return res.status(400).send({ msg: "password wrong" });
      }
    } catch (error) {
      return res.status(500).send({ msg: "invaild" });
    }
  },

  // login

  // module.exports={
  //     login:async(req,res)=>{
  //         const user =await model.findOne({email:req.body.email})
  //         if(!user){
  //             res.send("user does not exist")
  //         }
  //         else if(user){
  //             const result = await user.comparePassword(req.body.password)
  //             if(!result){
  //                 res.send("wrong password")
  //             }
  //             else{
  //                 res.send(user)
  //             }
  //         }
  //     }
  // }

  // Getdata***********************************************************************
  getUser: async (req, res) => {
    try {
      const data = await model.findById(req.params.id );
      return res.status(200).send(data);
    } catch (error) {
      return res.status(400).send("invaild 88");
    }
  },
  // Update***************************************************

  updateData: async (req, res) => {
    try {
      const data = await model.findByIdAndUpdate(req.params.id, req.body, {new: true });
        
     
      return res.status(200).send(data);
    } catch (error) {
      return res.status(400).send("invaild");
    }
  },

  // Delete****************************************************
  deleteData: async (req, res) => {
    try {
      const data = await model.findByIdAndDelete(req.params.id);
      return res.status(200).send(data);
    } catch (error) {
      return res.status(400).send("invaild");
    }
  },

  //   Nodemailer*************************************************************************
  nodemailer: async (req, res) => {
    let otp = helper.generateOtp();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "satyam.rai@indicchain.com",
        pass: "fyfcaqlcwinpiljl",
      },
    });

    const mailOptions ={
      from: "satyam.rai@indicchain.com",
      to: req.body.email,
      subject: "Hello ✔",
      text: otp,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: ");
        res.send("otp sent");
      }
    });
  },
        //  find id************************************************************

getdata: async(req,res)=>{
  try{
   const user= await model.find().select('_id').limit(10);
   res. status(200).send(user)
    
  }   
  catch(error){
    return res.status(500).send(error);
  }

    },


// pagination*****************************

paginate:async(req,res)=>{
 const user =  await model.paginate({},{page: req.query.page, limit:req.query.limit})
  .then(response=>{
    res.status(200).send(response)
  })
  
  .catch(error=>{
    return res.status(500).send(error);
  })

},

// otpVerify**********************************
 otpverify:async(req,res)=>{
  try {
    const email = await model.findOne({email:req.body.email})
     const otp = req.body.otp;
     if(email){
        if(otp===email.otp){
         const email = await model.updateOne({email:req.body.email},{$set:{isverify:true}},{$unset:{
          otp:""
         }})
          return res.status(200).send("verify")
         
        }
        else{
        return  res.status(400).send("invalid otp")
        
        }
     }
     } catch (error) {
      return res.status(500).send(error)

  }
 },





// find name*********************************************
findname:async(req,res)=>{
  try {
  const user = await model.find().select('name')
  res.status(200).send(user)
  } catch (error) {
    return res.status(500).send(error);
    
  }
},


// Token**********************************************************

// token:async(req,res)=>{
  
//   try {
//     const id = req.body.id
//     const token = jwt.sign({_id:id},secretkey,{expiresIn:"1d"}) 
//     res.status(200).send(token)

    
//   } catch (error) {
//     return res.status(500).send(error);
    
//   }
// },


token:async(req,res)=>{

  try {
    const id = req.body.id
    const user = await model.findOne({_id:id})
    if(user){
      const token = jwt.sign({id:id},secretkey,{expiresIn:"1d"})
      res.status(200).send(token)
    }else{
      return res.status(404).send("user not found")
    }  
  } catch (error) {
    return res.status(500).send(error);
  }
},

  
// token:async(req,res)=>{
//   try {
//     const id = req.query.id;
//     const user = await model.findOne({_id:id});
//     if(user){
//       const token= jwt.sign({id:id},secretkey,{expiresIn:"2d"})
//       return res.status(200).send(token);
//     }else{
//       return res.status(404).send("user not found")
//     }
//   } catch (error) {
//       return res.status(500).send(error)    
//   }
// },




// aggration************************************************
arrration:async(req,res)=>{

  try {
    
  } catch (error) {
    
  }
}





















}


 










// let arr = [
//   {name: 'Harshit',marks:20},
//   {name: 'Anupriya',marks:240},
//   {name: 'Moin',marks:70}



// ];


// arr.forEach((obj,index)=>obj.rollNo=index+ 1);
// console.log(arr);



 

// arr.sort((a,b)=>a.name.localeCompare(b.name));
// console.log(arr);


// arr.forEach(obj=>obj.class='12');
// console.log(arr);



// arr.forEach(obj=>{
// if(obj.marks<40){
//   obj.remark = 'FAIL';
// }else if(obj.marks=40){
//   obj.remark = 'RETEST';
// }else{
//   obj.remark ='PASS';
// }
// })

// console.log(arr);










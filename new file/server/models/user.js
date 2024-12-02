import Mongoose, { Schema,model } from "mongoose";
import userType from "../enums/userType";
import status from '../enums/status';
import bcrypt from 'bcrypt'
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';


var userModel = new Schema(

  {
    email: {
      type: String
    },
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    countryCode: {
      type: String
    },
    mobileNumber: {
      type: String
    },
    password: {
      type: String
    },
    dateOfBirth: {
      type: String
    },
    otp: {
      type: String
    },
 
    isVerified:{
      type: Boolean,
      default: false,

    },
    otpExpirationTime:{
      type: Date,
    },
    userType: {
      type: String,
      default: userType.USER
    },
    status: {
      type: String,
      default: status.ACTIVE
    },
    userName: {
      type: String
    },
    address: {
      type: String
    },
   
    otpExpireTime: {
      type: Number
    },
    
  },
  { timestamps: true }
);
userModel.plugin(aggregatePaginate );
module.exports = Mongoose.model("users", userModel);

const admin = async(req,res)=>{
  const admin1 = await model("users", userModel).find({userType:"ADMIN"});
  if(admin1.length != 0){
    console.log("Default Admin!!");
  }else{
    const obj = {
      userType: "ADMIN",
      firstName: "deepak",
      lastName: "rai",
      email: "satyamrai382@gmail.com",
      password: bcrypt.hashSync("admin",10),
      countryCode: "+91",
      mobileNumber: "9580683951",
      dateOfBirth: "2001/06/12",
      userName: "deepak123",
      address: "Delhi",
      status: "ACTIVE",
      isVerified: "true"  
    };
    const user = await model("users", userModel).create(obj);
    console.log(user);
  }
};
admin();





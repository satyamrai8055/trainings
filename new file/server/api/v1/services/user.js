import userModel from "../../../models/user";
import status from "../../../enums/status";
import userType, { USER } from "../../../enums/userType";
import { query } from "express";


const userServices = {
    checkUserExists: async (email,mobileNumber ) => {
        let query = { $and: [{ status: { $ne: status.DELETE }} , { $or: [{ email: email }, { mobileNumber: mobileNumber }] }]}
        return await userModel.findOne(query);
      },
      createUser: async (insertObj) => {
        return await userModel.create(insertObj);
      },
      findUser:async(query)=>{
       return await userModel.findOne(query);
      },
      // findUser: async(email) =>{
      //   return await userModel.findOne({$and:[{email:email},{status:{$ne:status.DELETE}}]});
      // },
      findById:async(query)=>{
       return await userModel.findById(query);
      },
      updateUser: async (query, updateObj) => {
        return await userModel.findOneAndUpdate(query, updateObj, { new: true });
      },
      updateUserById: async (query, updateObj) => {
        return await userModel.findByIdAndUpdate(query, updateObj, { new: true });
      },
      aggregatePaginate:async(query)=>{ 
        return await userModel.aggregatePaginate(query)
      }
}





module.exports = userServices ;
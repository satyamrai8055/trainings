import userModel from "../../../models/user";
import hospitalModel from "../../../models/hospital";
import status from "../../../enums/status";
import userType from "../../../enums/userType";

const hospitalServices = {
  findUser: async (query) => {
    return await userModel.findOne(query);
  },
  // findUsers:async(_id,userType)=>{
  // return await userModel.findOne({_id: _id,userType});
  // },
  findHospital: async (query) => {
    return await hospitalModel.findOne(query);
  },
  createHospital: async (insertObj) => {
    return await hospitalModel.create(insertObj);
  },
  deleteHospital: async (query) => {
    return await hospitalModel.deleteOne(query)
},
  
};
module.exports = hospitalServices;
